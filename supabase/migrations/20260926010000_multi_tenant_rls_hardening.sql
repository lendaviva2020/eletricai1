-- ============================================================================
-- ELETRICAI / VOLTAI INDUSTRIAL OS - MULTI-TENANT RLS HARDENING
-- Garantia rigorosa de isolamento multi-tenant para Projetos, Componentes,
-- Documentos Técnicos, Entidades Extraídas, Conexões, Circuitos e Revisões.
-- ============================================================================

-- 1. TABELA DE DOCUMENTOS TÉCNICOS (MANUAIS, DATASHEETS, ESQUEMAS)
CREATE TABLE IF NOT EXISTS public.technical_documents (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('doc_' || substr(md5(random()::text), 1, 12)),
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES public.projects(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(32) NOT NULL DEFAULT 'PDF',
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  file_sha256 VARCHAR(64) NOT NULL,
  storage_path TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'UPLOADED', -- 'UPLOADED', 'PROCESSING', 'EXTRACTED', 'ERROR'
  page_count INT NOT NULL DEFAULT 1,
  manufacturer VARCHAR(128),
  equipment_model VARCHAR(128),
  equipment_category VARCHAR(64),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_technical_docs_tenant_id ON public.technical_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_technical_docs_project_id ON public.technical_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_technical_docs_sha256 ON public.technical_documents(file_sha256);

-- 2. TABELA DE ENTIDADES TÉCNICAS EXTRAÍDAS (PARAMETRIZAÇÃO E EVIDÊNCIAS)
CREATE TABLE IF NOT EXISTS public.extracted_entities (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('ent_' || substr(md5(random()::text), 1, 12)),
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  document_id VARCHAR(64) NOT NULL REFERENCES public.technical_documents(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES public.projects(id) ON DELETE SET NULL,
  entity_type VARCHAR(64) NOT NULL, -- 'CURRENT_RATED', 'VOLTAGE_RATED', 'POWER_KW', 'MODBUS_TAG', etc.
  property_name VARCHAR(128) NOT NULL,
  property_value TEXT NOT NULL,
  unit VARCHAR(32),
  confidence VARCHAR(16) NOT NULL DEFAULT 'HIGH', -- 'HIGH', 'MEDIUM', 'LOW'
  page_number INT NOT NULL DEFAULT 1,
  section_title VARCHAR(255),
  table_index INT,
  original_snippet TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by VARCHAR(64),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_extracted_entities_tenant_id ON public.extracted_entities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_extracted_entities_doc_id ON public.extracted_entities(document_id);
CREATE INDEX IF NOT EXISTS idx_extracted_entities_project_id ON public.extracted_entities(project_id);

-- 3. FUNÇÃO ROBUSTA DE DETERMINAÇÃO DO TENANT ATUAL DO USUÁRIO
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS VARCHAR(64) AS $$
DECLARE
  v_tenant_id VARCHAR(64);
BEGIN
  -- 1. Verifica no token JWT (user_metadata)
  v_tenant_id := NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'tenant_id', '');
  
  -- 2. Se não estiver no JWT, verifica na tabela public.profiles
  IF v_tenant_id IS NULL AND auth.uid() IS NOT NULL THEN
    SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
  END IF;

  -- 3. Se ainda nulo, verifica na tabela public.user_profiles
  IF v_tenant_id IS NULL AND auth.uid() IS NOT NULL THEN
    SELECT tenant_id INTO v_tenant_id FROM public.user_profiles WHERE id = auth.uid()::text;
  END IF;
  
  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4. HABILITAR ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ladder_rungs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symbol_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineering_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE RLS PARA PROJETOS (PROJECTS)
DO $$ BEGIN
  DROP POLICY IF EXISTS "tenant_isolation_projects_all" ON public.projects;
  DROP POLICY IF EXISTS "tenant_isolation_projects_select" ON public.projects;
  DROP POLICY IF EXISTS "tenant_isolation_projects_insert" ON public.projects;
  DROP POLICY IF EXISTS "tenant_isolation_projects_update" ON public.projects;
  DROP POLICY IF EXISTS "tenant_isolation_projects_delete" ON public.projects;
  
  CREATE POLICY "tenant_isolation_projects_select" ON public.projects
    FOR SELECT USING (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');

  CREATE POLICY "tenant_isolation_projects_insert" ON public.projects
    FOR INSERT WITH CHECK (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');

  CREATE POLICY "tenant_isolation_projects_update" ON public.projects
    FOR UPDATE USING (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');

  CREATE POLICY "tenant_isolation_projects_delete" ON public.projects
    FOR DELETE USING (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- 6. POLÍTICAS DE RLS PARA COMPONENTES (COMPONENTS)
DO $$ BEGIN
  DROP POLICY IF EXISTS "tenant_isolation_components_all" ON public.components;
  DROP POLICY IF EXISTS "tenant_isolation_components_select" ON public.components;
  DROP POLICY IF EXISTS "tenant_isolation_components_insert" ON public.components;
  DROP POLICY IF EXISTS "tenant_isolation_components_update" ON public.components;
  DROP POLICY IF EXISTS "tenant_isolation_components_delete" ON public.components;

  CREATE POLICY "tenant_isolation_components_select" ON public.components
    FOR SELECT USING (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');

  CREATE POLICY "tenant_isolation_components_insert" ON public.components
    FOR INSERT WITH CHECK (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');

  CREATE POLICY "tenant_isolation_components_update" ON public.components
    FOR UPDATE USING (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');

  CREATE POLICY "tenant_isolation_components_delete" ON public.components
    FOR DELETE USING (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- 7. POLÍTICAS DE RLS PARA DOCUMENTOS TÉCNICOS (TECHNICAL_DOCUMENTS)
DO $$ BEGIN
  DROP POLICY IF EXISTS "tenant_isolation_documents_select" ON public.technical_documents;
  DROP POLICY IF EXISTS "tenant_isolation_documents_insert" ON public.technical_documents;
  DROP POLICY IF EXISTS "tenant_isolation_documents_update" ON public.technical_documents;
  DROP POLICY IF EXISTS "tenant_isolation_documents_delete" ON public.technical_documents;

  CREATE POLICY "tenant_isolation_documents_select" ON public.technical_documents
    FOR SELECT USING (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');

  CREATE POLICY "tenant_isolation_documents_insert" ON public.technical_documents
    FOR INSERT WITH CHECK (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');

  CREATE POLICY "tenant_isolation_documents_update" ON public.technical_documents
    FOR UPDATE USING (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');

  CREATE POLICY "tenant_isolation_documents_delete" ON public.technical_documents
    FOR DELETE USING (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- 8. POLÍTICAS DE RLS PARA ENTIDADES EXTRAÍDAS (EXTRACTED_ENTITIES)
DO $$ BEGIN
  DROP POLICY IF EXISTS "tenant_isolation_entities_select" ON public.extracted_entities;
  DROP POLICY IF EXISTS "tenant_isolation_entities_insert" ON public.extracted_entities;
  DROP POLICY IF EXISTS "tenant_isolation_entities_update" ON public.extracted_entities;
  DROP POLICY IF EXISTS "tenant_isolation_entities_delete" ON public.extracted_entities;

  CREATE POLICY "tenant_isolation_entities_select" ON public.extracted_entities
    FOR SELECT USING (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');

  CREATE POLICY "tenant_isolation_entities_insert" ON public.extracted_entities
    FOR INSERT WITH CHECK (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');

  CREATE POLICY "tenant_isolation_entities_update" ON public.extracted_entities
    FOR UPDATE USING (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');

  CREATE POLICY "tenant_isolation_entities_delete" ON public.extracted_entities
    FOR DELETE USING (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- 9. POLÍTICAS DE RLS PARA CONEXÕES (CONNECTIONS)
DO $$ BEGIN
  DROP POLICY IF EXISTS "tenant_isolation_connections_select" ON public.connections;
  DROP POLICY IF EXISTS "tenant_isolation_connections_insert" ON public.connections;
  DROP POLICY IF EXISTS "tenant_isolation_connections_update" ON public.connections;
  DROP POLICY IF EXISTS "tenant_isolation_connections_delete" ON public.connections;

  CREATE POLICY "tenant_isolation_connections_select" ON public.connections
    FOR SELECT USING (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');

  CREATE POLICY "tenant_isolation_connections_insert" ON public.connections
    FOR INSERT WITH CHECK (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');

  CREATE POLICY "tenant_isolation_connections_update" ON public.connections
    FOR UPDATE USING (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');

  CREATE POLICY "tenant_isolation_connections_delete" ON public.connections
    FOR DELETE USING (tenant_id = public.get_current_tenant_id() OR auth.role() = 'service_role');
EXCEPTION WHEN OTHERS THEN null;
END $$;
