-- Supabase Migration: Industrial Multi-Tenant Schema
-- Schema para EletricAI / VOLTAI CAD Industrial Platform

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM ('admin', 'engineer', 'member');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE tenant_category_enum AS ENUM ('enterprise', 'client', 'sandbox');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. TENANTS TABLE
CREATE TABLE IF NOT EXISTS public.tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subname TEXT,
  cnpj TEXT,
  location TEXT,
  plan TEXT DEFAULT 'Industrial Starter',
  voltage TEXT DEFAULT '13.8 kV / 380V - 60Hz',
  tags_count INTEGER DEFAULT 0,
  members_count INTEGER DEFAULT 1,
  category TEXT DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'engineer',
  crea_number TEXT,
  company_name TEXT,
  tenant_id TEXT REFERENCES public.tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PASSWORD RESETS TABLE
CREATE TABLE IF NOT EXISTS public.password_resets (
  id TEXT PRIMARY KEY DEFAULT ('rst_' || substr(md5(random()::text), 1, 8)),
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ENTERPRISE LEADS TABLE (COMMERCIAL DEMO / CONTACT)
CREATE TABLE IF NOT EXISTS public.enterprise_leads (
  id TEXT PRIMARY KEY DEFAULT ('lead_' || substr(md5(random()::text), 1, 8)),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  phone TEXT,
  plant_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INITIAL SEED DATA
INSERT INTO public.tenants (id, name, subname, cnpj, location, plan, voltage, tags_count, members_count, category)
VALUES 
  ('tenant_braskem_01', 'Braskem Q1 — Polo Petroquímico Paulínia', 'Subestação Principal SE-01 & CCMs 13.8kV/380V', '42.150.391/0001-90', 'Paulínia - SP, Brasil', 'Enterprise Multi-Plant', '13.8 kV / 380V - 60Hz', 1420, 8, 'enterprise'),
  ('tenant_arcelor_02', 'ArcelorMittal — Subestação SE-02', 'Laminação a Quente & Forno Elétrico a Arco', '17.469.701/0002-45', 'Tubarão - ES, Brasil', 'Industrial Pro', '13.8 kV / 440V - 60Hz', 680, 5, 'client'),
  ('tenant_personal_lab', 'Workspace Pessoal & Laboratório VOLTAI', 'Sandbox de Simulação, Gêmeo Digital 3D & Ensaios IEC', '00.000.000/0001-91', 'Curitiba - PR, Brasil', 'Personal Lab', '380V / 220V - 60Hz', 240, 1, 'sandbox')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (id, email, name, role, crea_number, company_name, tenant_id)
VALUES
  ('usr_carlos_01', 'carlos.mendes@paulinia.ind.br', 'Eng. Carlos Eduardo Mendes', 'admin', 'CREA-SP 50849201/D', 'Braskem Q1 Paulínia', 'tenant_braskem_01'),
  ('usr_beatriz_02', 'beatriz.lima@usina.com.br', 'Engª. Beatriz Lima', 'engineer', 'CREA-PR 88.412/D', 'ArcelorMittal Tubarão', 'tenant_arcelor_02'),
  ('usr_luis_03', 'luis.felipe@eletricai.com.br', 'Eng. Luis Felipe', 'admin', 'CREA-MG 142.908/D', 'VOLTAI Industrial AI Lab', 'tenant_personal_lab')
ON CONFLICT (id) DO NOTHING;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to tenants" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Allow public insert to tenants" ON public.tenants FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read user profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update user profiles" ON public.user_profiles FOR ALL USING (true);

CREATE POLICY "Allow insert/read password resets" ON public.password_resets FOR ALL USING (true);
CREATE POLICY "Allow public leads insertion" ON public.enterprise_leads FOR ALL USING (true);
