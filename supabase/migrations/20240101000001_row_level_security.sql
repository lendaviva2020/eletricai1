-- ============================================================================
-- ELETRICAI / VOLTAI INDUSTRIAL OS - ROW LEVEL SECURITY (RLS) & MULTI-TENANT
-- 100% of tables secured with Tenant Isolation Policies & Realtime Publications
-- ============================================================================

-- Helper functions for RLS evaluation
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS VARCHAR(64) AS $$
DECLARE
  v_tenant_id VARCHAR(64);
BEGIN
  -- First check auth metadata
  v_tenant_id := NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'tenant_id', '');
  
  -- If not in JWT, check from profiles table using auth.uid()
  IF v_tenant_id IS NULL AND auth.uid() IS NOT NULL THEN
    SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
  END IF;
  
  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS VARCHAR(32) AS $$
DECLARE
  v_role VARCHAR(32);
BEGIN
  SELECT role::varchar INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'member');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Enable RLS on ALL tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plc_racks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ladder_rungs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scada_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twin_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- 1. Tenants Policies
CREATE POLICY "Users can view their own tenant"
  ON public.tenants FOR SELECT
  USING (id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Admins can update their tenant"
  ON public.tenants FOR UPDATE
  USING (id = public.get_auth_tenant_id() AND public.get_auth_role() = 'admin')
  WITH CHECK (id = public.get_auth_tenant_id());

-- 2. Profiles Policies
CREATE POLICY "Users can view profiles within their tenant"
  ON public.profiles FOR SELECT
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR auth.role() = 'service_role')
  WITH CHECK (tenant_id = public.get_auth_tenant_id());

CREATE POLICY "Admins can insert profiles in their tenant"
  ON public.profiles FOR INSERT
  WITH CHECK (tenant_id = public.get_auth_tenant_id() AND (public.get_auth_role() = 'admin' OR auth.role() = 'service_role'));

CREATE POLICY "Admins can delete profiles in their tenant"
  ON public.profiles FOR DELETE
  USING (tenant_id = public.get_auth_tenant_id() AND (public.get_auth_role() = 'admin' OR auth.role() = 'service_role'));

-- 3. Projects Policies
CREATE POLICY "Tenant isolation for projects select"
  ON public.projects FOR SELECT
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Tenant isolation for projects insert"
  ON public.projects FOR INSERT
  WITH CHECK (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Tenant isolation for projects update"
  ON public.projects FOR UPDATE
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Tenant isolation for projects delete"
  ON public.projects FOR DELETE
  USING ((tenant_id = public.get_auth_tenant_id() AND public.get_auth_role() = 'admin') OR auth.role() = 'service_role');

-- 4. Shared Tags Policies
CREATE POLICY "Tenant isolation for shared_tags select"
  ON public.shared_tags FOR SELECT
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Tenant isolation for shared_tags insert"
  ON public.shared_tags FOR INSERT
  WITH CHECK (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Tenant isolation for shared_tags update"
  ON public.shared_tags FOR UPDATE
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Tenant isolation for shared_tags delete"
  ON public.shared_tags FOR DELETE
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

-- 5. Components Policies
CREATE POLICY "Tenant isolation for components select"
  ON public.components FOR SELECT
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Tenant isolation for components insert"
  ON public.components FOR INSERT
  WITH CHECK (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Tenant isolation for components update"
  ON public.components FOR UPDATE
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Tenant isolation for components delete"
  ON public.components FOR DELETE
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

-- 6. Connections Policies
CREATE POLICY "Tenant isolation for connections"
  ON public.connections FOR ALL
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role')
  WITH CHECK (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

-- 7. PLC Racks Policies
CREATE POLICY "Tenant isolation for plc_racks"
  ON public.plc_racks FOR ALL
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role')
  WITH CHECK (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

-- 8. Ladder Rungs Policies
CREATE POLICY "Tenant isolation for ladder_rungs"
  ON public.ladder_rungs FOR ALL
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role')
  WITH CHECK (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

-- 9. SCADA Widgets Policies
CREATE POLICY "Tenant isolation for scada_widgets"
  ON public.scada_widgets FOR ALL
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role')
  WITH CHECK (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

-- 10. Digital Twin Hotspots Policies
CREATE POLICY "Tenant isolation for twin_hotspots"
  ON public.twin_hotspots FOR ALL
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role')
  WITH CHECK (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

-- 11. BOM Items Policies
CREATE POLICY "Tenant isolation for bom_items"
  ON public.bom_items FOR ALL
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role')
  WITH CHECK (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

-- 12. Alerts Policies
CREATE POLICY "Tenant isolation for alerts select"
  ON public.alerts FOR SELECT
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Tenant isolation for alerts modify"
  ON public.alerts FOR ALL
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role')
  WITH CHECK (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

-- 13. Activity Events Policies
CREATE POLICY "Tenant isolation for activity_events select"
  ON public.activity_events FOR SELECT
  USING (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Tenant isolation for activity_events insert"
  ON public.activity_events FOR INSERT
  WITH CHECK (tenant_id = public.get_auth_tenant_id() OR auth.role() = 'service_role');

-- Enable Supabase Realtime for instant telemetry across CAD, Ladder, SCADA and Dashboard
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_tags;
EXCEPTION WHEN undefined_object THEN null; WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.components;
EXCEPTION WHEN undefined_object THEN null; WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
EXCEPTION WHEN undefined_object THEN null; WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_events;
EXCEPTION WHEN undefined_object THEN null; WHEN duplicate_object THEN null; END $$;
