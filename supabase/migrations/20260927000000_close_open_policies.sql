-- ============================================================================
-- FECHAMENTO DAS POLICIES PÚBLICAS ABERTAS (USING true) — CRÍTICO
-- ============================================================================

-- Remove as policies antigas que liberavam acesso público total
DROP POLICY IF EXISTS "Allow public read access to tenants" ON public.tenants;
DROP POLICY IF EXISTS "Allow public insert to tenants" ON public.tenants;
DROP POLICY IF EXISTS "Allow public read user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow public insert/update user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow insert/read password resets" ON public.password_resets;
DROP POLICY IF EXISTS "Allow public leads insertion" ON public.enterprise_leads;

-- TENANTS: leitura restrita ao próprio tenant (via profiles); sem INSERT/UPDATE
-- público — criação de tenant só acontece no servidor (service_role) durante
-- o cadastro em /api/auth/signup.
DROP POLICY IF EXISTS "tenants_select_own" ON public.tenants;
CREATE POLICY "tenants_select_own" ON public.tenants FOR SELECT
  USING (
    id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR auth.role() = 'service_role'
  );

-- USER_PROFILES: tabela legada (id é TEXT, não referencia auth.users — não dá
-- pra proteger por auth.uid() de forma confiável). Trava total: só o backend
-- (service_role) acessa daqui pra frente. `profiles` é a fonte da verdade.
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_profiles_service_role_only" ON public.user_profiles;
CREATE POLICY "user_profiles_service_role_only" ON public.user_profiles FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- PASSWORD_RESETS: legado, guardava token em texto puro. Trava total — o
-- fluxo de recuperação de senha deve usar supabase.auth.resetPasswordForEmail
-- nativo, que não depende desta tabela.
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "password_resets_service_role_only" ON public.password_resets;
CREATE POLICY "password_resets_service_role_only" ON public.password_resets FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ENTERPRISE_LEADS: mantém o formulário de contato público (INSERT), mas
-- fecha a leitura — a policy antiga vazava nome/e-mail/telefone de todo lead
-- pra qualquer visitante anônimo (risco de LGPD).
DROP POLICY IF EXISTS "enterprise_leads_insert_public" ON public.enterprise_leads;
CREATE POLICY "enterprise_leads_insert_public" ON public.enterprise_leads FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "enterprise_leads_select_admin_only" ON public.enterprise_leads;
CREATE POLICY "enterprise_leads_select_admin_only" ON public.enterprise_leads FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
