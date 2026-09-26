-- Supabase Migration: Engineering Core 4.0 Relational Model
-- Phase 2: Relational schema, Unified Entity Model, Project Revisions, Circuits, Symbol Library & Audit Logs
-- Target: EletricAI Industrial Engineering Platform

-- 1. ENUMS (IF NOT EXISTS)
DO $$ BEGIN
  CREATE TYPE circuit_phase_type AS ENUM ('1F', '2F', '3F', '3F+N', '3F+N+PE', 'DC');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. PROJECT REVISIONS (Versionamento de Pranchas e Snapshots Técnicos)
CREATE TABLE IF NOT EXISTS public.project_revisions (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('rev_' || substr(md5(random()::text), 1, 12)),
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  revision_number INT NOT NULL DEFAULT 0,
  revision_code VARCHAR(16) NOT NULL DEFAULT 'REV-00', -- REV-00, REV-01, REV-02
  title VARCHAR(128) NOT NULL DEFAULT 'Emissão Inicial para Aprovação',
  description TEXT,
  snapshot_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- Contém components, connections, rungs, tags
  components_count INT NOT NULL DEFAULT 0,
  connections_count INT NOT NULL DEFAULT 0,
  created_by_id VARCHAR(64),
  author_name VARCHAR(128) DEFAULT 'Engenheiro Responsável',
  crea_art VARCHAR(64), -- Número da ART/CREA se emitido
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_revisions_project_id ON public.project_revisions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_revisions_tenant_id ON public.project_revisions(tenant_id);

-- 3. ELECTRICAL CIRCUITS (Quadros, Alimentadores e Ramais NBR 5410)
CREATE TABLE IF NOT EXISTS public.circuits (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('cir_' || substr(md5(random()::text), 1, 12)),
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  circuit_number VARCHAR(32) NOT NULL, -- Ex: 'C01', 'ALIM-01', 'QG-01'
  name VARCHAR(128) NOT NULL,
  panel_tag VARCHAR(64) NOT NULL DEFAULT 'QGBT-01',
  voltage_v NUMERIC(10,2) NOT NULL DEFAULT 380.0,
  phases VARCHAR(16) NOT NULL DEFAULT '3F+N+PE',
  power_kw NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  power_factor NUMERIC(4,3) NOT NULL DEFAULT 0.85,
  ib_amperes NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  in_amperes NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  cable_section_mm2 NUMERIC(10,2) NOT NULL DEFAULT 2.5,
  cable_length_m NUMERIC(10,2) NOT NULL DEFAULT 15.0,
  cable_insulation VARCHAR(32) NOT NULL DEFAULT 'PVC 70°C',
  installation_method VARCHAR(32) NOT NULL DEFAULT 'B1', -- Eletroduto embutido, aparente, etc.
  grouping_factor NUMERIC(4,3) NOT NULL DEFAULT 1.0,
  temp_factor NUMERIC(4,3) NOT NULL DEFAULT 1.0,
  voltage_drop_percent NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  breaker_model VARCHAR(64),
  protection_device VARCHAR(64) DEFAULT 'DISJUNTOR_TERMOMAGNETICO',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_circuits_project_id ON public.circuits(project_id);
CREATE INDEX IF NOT EXISTS idx_circuits_tenant_id ON public.circuits(tenant_id);

-- 4. UNIVERSAL SYMBOL LIBRARY (Biblioteca Multinível de Componentes)
CREATE TABLE IF NOT EXISTS public.symbol_library (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES public.tenants(id) ON DELETE CASCADE, -- NULL se for símbolo global público
  category VARCHAR(64) NOT NULL, -- 'TRANSFORMER', 'BREAKER', 'CONTACTOR', 'MOTOR', 'DRIVE', 'PLC'
  subcategory VARCHAR(64),
  standard VARCHAR(32) NOT NULL DEFAULT 'ABNT_NBR', -- ABNT_NBR, IEC_60617, ANSI_IEEE
  name VARCHAR(128) NOT NULL,
  description TEXT,
  view_box VARCHAR(32) NOT NULL DEFAULT '0 0 80 80',
  svg_paths TEXT NOT NULL,
  default_properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  connection_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  validation_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  manufacturer VARCHAR(64),
  model VARCHAR(64),
  datasheet_url TEXT,
  is_global BOOLEAN NOT NULL DEFAULT FALSE,
  version VARCHAR(16) NOT NULL DEFAULT '1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_symbol_library_tenant_id ON public.symbol_library(tenant_id);
CREATE INDEX IF NOT EXISTS idx_symbol_library_category ON public.symbol_library(category);

-- 5. ENGINEERING AUDIT LOGS (Trilha de Auditoria e Conformidade)
CREATE TABLE IF NOT EXISTS public.engineering_audit_logs (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('aud_' || substr(md5(random()::text), 1, 12)),
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES public.projects(id) ON DELETE SET NULL,
  user_id VARCHAR(64),
  user_name VARCHAR(128) NOT NULL DEFAULT 'Engenheiro',
  action VARCHAR(64) NOT NULL, -- 'CREATE_PROJECT', 'MUTATE_TOPOLOGY', 'CALCULATE_CABLES', 'AI_SYNTHESIS'
  target_entity VARCHAR(64) NOT NULL, -- 'COMPONENT', 'CONNECTION', 'RUNG', 'CIRCUIT'
  entity_id VARCHAR(64),
  changes JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_project_id ON public.engineering_audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON public.engineering_audit_logs(tenant_id);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.project_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symbol_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineering_audit_logs ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES FOR PROJECT REVISIONS
DO $$ BEGIN
  DROP POLICY IF EXISTS "tenant_isolation_revisions_select" ON public.project_revisions;
  CREATE POLICY "tenant_isolation_revisions_select" ON public.project_revisions
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
  );

  DROP POLICY IF EXISTS "tenant_isolation_revisions_insert" ON public.project_revisions;
  CREATE POLICY "tenant_isolation_revisions_insert" ON public.project_revisions
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
  );

  DROP POLICY IF EXISTS "tenant_isolation_revisions_delete" ON public.project_revisions;
  CREATE POLICY "tenant_isolation_revisions_delete" ON public.project_revisions
  FOR DELETE USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
  );
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- 8. RLS POLICIES FOR CIRCUITS
DO $$ BEGIN
  DROP POLICY IF EXISTS "tenant_isolation_circuits_select" ON public.circuits;
  CREATE POLICY "tenant_isolation_circuits_select" ON public.circuits
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
  );

  DROP POLICY IF EXISTS "tenant_isolation_circuits_insert" ON public.circuits;
  CREATE POLICY "tenant_isolation_circuits_insert" ON public.circuits
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
  );

  DROP POLICY IF EXISTS "tenant_isolation_circuits_update" ON public.circuits;
  CREATE POLICY "tenant_isolation_circuits_update" ON public.circuits
  FOR UPDATE USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
  );

  DROP POLICY IF EXISTS "tenant_isolation_circuits_delete" ON public.circuits;
  CREATE POLICY "tenant_isolation_circuits_delete" ON public.circuits
  FOR DELETE USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
  );
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- 9. RLS POLICIES FOR SYMBOL LIBRARY (Global Symbols are public read, Tenant symbols are isolated)
DO $$ BEGIN
  DROP POLICY IF EXISTS "tenant_isolation_symbol_select" ON public.symbol_library;
  CREATE POLICY "tenant_isolation_symbol_select" ON public.symbol_library
  FOR SELECT USING (
    is_global = TRUE
    OR tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
  );

  DROP POLICY IF EXISTS "tenant_isolation_symbol_insert" ON public.symbol_library;
  CREATE POLICY "tenant_isolation_symbol_insert" ON public.symbol_library
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
  );

  DROP POLICY IF EXISTS "tenant_isolation_symbol_update" ON public.symbol_library;
  CREATE POLICY "tenant_isolation_symbol_update" ON public.symbol_library
  FOR UPDATE USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
  );

  DROP POLICY IF EXISTS "tenant_isolation_symbol_delete" ON public.symbol_library;
  CREATE POLICY "tenant_isolation_symbol_delete" ON public.symbol_library
  FOR DELETE USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
  );
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- 10. RLS POLICIES FOR AUDIT LOGS
DO $$ BEGIN
  DROP POLICY IF EXISTS "tenant_isolation_audit_select" ON public.engineering_audit_logs;
  CREATE POLICY "tenant_isolation_audit_select" ON public.engineering_audit_logs
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
  );

  DROP POLICY IF EXISTS "tenant_isolation_audit_insert" ON public.engineering_audit_logs;
  CREATE POLICY "tenant_isolation_audit_insert" ON public.engineering_audit_logs
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
  );
EXCEPTION WHEN OTHERS THEN null;
END $$;
