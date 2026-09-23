-- ============================================================================
-- ELETRICAI / VOLTAI INDUSTRIAL OS - SUPABASE POSTGRESQL INITIAL SCHEMA
-- Compliance: ABNT NBR 5410, NBR 14039, NR-10, IEC 61131-3
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Types & Enums
DO $$ BEGIN
  CREATE TYPE tenant_role AS ENUM ('admin', 'engineer', 'member');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('EM_EXECUCAO', 'EM_COMISSIONAMENTO', 'CONCLUIDO', 'REVISAO_TECNICA');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE alert_severity AS ENUM ('CRITICO', 'ATENCAO', 'RECOMENDACAO', 'RESOLVIDO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Tenants (Multi-tenant Industrial Plants)
CREATE TABLE IF NOT EXISTS public.tenants (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(32) NOT NULL,
  location VARCHAR(255) NOT NULL,
  plan VARCHAR(64) NOT NULL DEFAULT 'Industrial Pro',
  currency VARCHAR(8) NOT NULL DEFAULT 'BRL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User Profiles (Integrated with auth.users or standalone multi-tenant profile)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role tenant_role NOT NULL DEFAULT 'engineer',
  role_title VARCHAR(128) NOT NULL DEFAULT 'Engenheiro Eletricista',
  crea_number VARCHAR(64),
  status VARCHAR(32) NOT NULL DEFAULT 'ONLINE',
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Projects (Subestações, CCMs, Quadros de Automação)
CREATE TABLE IF NOT EXISTS public.projects (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(64) NOT NULL,
  type_label VARCHAR(128) NOT NULL,
  status project_status NOT NULL DEFAULT 'EM_EXECUCAO',
  progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  nominal_voltage VARCHAR(64) NOT NULL DEFAULT '380V / 220V - 60 Hz',
  normative_standard VARCHAR(64) NOT NULL DEFAULT 'ABNT NBR 5410',
  target_tab VARCHAR(32) NOT NULL DEFAULT 'unifilar',
  description TEXT,
  created_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Shared Tags Engine (Single Source of Truth across CAD, Ladder, SCADA, Digital Twin and BOM)
CREATE TABLE IF NOT EXISTS public.shared_tags (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  address VARCHAR(64) NOT NULL, -- e.g. %I0.0, %Q0.2, %MW100
  data_type VARCHAR(32) NOT NULL DEFAULT 'BOOL', -- BOOL, INT, REAL, TIME
  direction VARCHAR(32) NOT NULL DEFAULT 'INPUT', -- INPUT, OUTPUT, MEMORY
  current_value JSONB NOT NULL DEFAULT 'false'::jsonb,
  unit VARCHAR(32) NOT NULL DEFAULT 'State',
  is_alarm_active BOOLEAN NOT NULL DEFAULT FALSE,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Electrical Components (Unifilar & Multifilar)
CREATE TABLE IF NOT EXISTS public.components (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES public.projects(id) ON DELETE CASCADE,
  tag VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(64) NOT NULL, -- disjuntor_motor, contator, rele_sobrecarga, transformador, barra
  voltage VARCHAR(64) NOT NULL DEFAULT '380V',
  rated_current NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  current NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  power_kw NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  cable_section_mm2 NUMERIC(10,2) NOT NULL DEFAULT 2.5,
  status VARCHAR(32) NOT NULL DEFAULT 'OPERATIONAL',
  is_energized BOOLEAN NOT NULL DEFAULT TRUE,
  position_x NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  position_y NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Electrical Connections (Barramentos e Cabos)
CREATE TABLE IF NOT EXISTS public.connections (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES public.projects(id) ON DELETE CASCADE,
  from_id VARCHAR(64) NOT NULL REFERENCES public.components(id) ON DELETE CASCADE,
  to_id VARCHAR(64) NOT NULL REFERENCES public.components(id) ON DELETE CASCADE,
  from_port VARCHAR(32) NOT NULL DEFAULT 'out',
  to_port VARCHAR(32) NOT NULL DEFAULT 'in',
  is_energized BOOLEAN NOT NULL DEFAULT TRUE,
  voltage_drop_percent NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PLC Racks & Hardware Configuration
CREATE TABLE IF NOT EXISTS public.plc_racks (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES public.projects(id) ON DELETE CASCADE,
  model VARCHAR(128) NOT NULL,
  ip_address VARCHAR(64) NOT NULL DEFAULT '192.168.10.20',
  subnet VARCHAR(64) NOT NULL DEFAULT '255.255.255.0',
  cycle_time_ms INT NOT NULL DEFAULT 10,
  firmware VARCHAR(64) NOT NULL DEFAULT 'v2.8.4',
  is_connected BOOLEAN NOT NULL DEFAULT TRUE,
  slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Ladder Rungs (IEC 61131-3)
CREATE TABLE IF NOT EXISTS public.ladder_rungs (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES public.projects(id) ON DELETE CASCADE,
  rung_index INT NOT NULL DEFAULT 0,
  comment TEXT,
  is_power_flow_active BOOLEAN NOT NULL DEFAULT FALSE,
  elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. SCADA Widgets (Supervisório Web & Mímicos)
CREATE TABLE IF NOT EXISTS public.scada_widgets (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(128) NOT NULL,
  type VARCHAR(64) NOT NULL, -- dial, digital, bar, switch, trend, pilot_light
  tag_name VARCHAR(128) NOT NULL,
  position_x INT NOT NULL DEFAULT 0,
  position_y INT NOT NULL DEFAULT 0,
  width INT NOT NULL DEFAULT 150,
  height INT NOT NULL DEFAULT 120,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Digital Twin Hotspots (3D Cubicles & Thermal Telemetry)
CREATE TABLE IF NOT EXISTS public.twin_hotspots (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES public.projects(id) ON DELETE CASCADE,
  component_id VARCHAR(64) REFERENCES public.components(id) ON DELETE SET NULL,
  label VARCHAR(128) NOT NULL,
  description TEXT,
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "z": 0}'::jsonb,
  temperature_c NUMERIC(5,2) NOT NULL DEFAULT 42.5,
  vibration_rms NUMERIC(5,2) NOT NULL DEFAULT 1.2,
  status VARCHAR(32) NOT NULL DEFAULT 'NORMAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Bill of Materials (BOM & Memorial Descritivo)
CREATE TABLE IF NOT EXISTS public.bom_items (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES public.projects(id) ON DELETE CASCADE,
  tag VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(64) NOT NULL,
  manufacturer VARCHAR(64) NOT NULL,
  part_number VARCHAR(128) NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0.0,
  total_price NUMERIC(12,2) NOT NULL DEFAULT 0.0,
  normative_standard VARCHAR(64) NOT NULL DEFAULT 'NBR 5410',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Industrial Alerts & Anomalies
CREATE TABLE IF NOT EXISTS public.alerts (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'ATENCAO',
  category VARCHAR(64) NOT NULL,
  source_tag VARCHAR(128),
  component_id VARCHAR(64) REFERENCES public.components(id) ON DELETE SET NULL,
  target_tab VARCHAR(32) NOT NULL DEFAULT 'unifilar',
  suggested_action TEXT NOT NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Activity Timeline & Audit Logs
CREATE TABLE IF NOT EXISTS public.activity_events (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES public.projects(id) ON DELETE CASCADE,
  type VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_role VARCHAR(32) NOT NULL DEFAULT 'engineer',
  badge_color VARCHAR(128) NOT NULL DEFAULT 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  target_tab VARCHAR(32),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_tenant ON public.projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shared_tags_tenant ON public.shared_tags(tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_components_project ON public.components(project_id, tag);
CREATE INDEX IF NOT EXISTS idx_connections_project ON public.connections(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_tenant_resolved ON public.alerts(tenant_id, is_resolved);
CREATE INDEX IF NOT EXISTS idx_activity_tenant ON public.activity_events(tenant_id, created_at DESC);

-- Trigger for auto updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER set_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_components_updated_at BEFORE UPDATE ON public.components FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;
