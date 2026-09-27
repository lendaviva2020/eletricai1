-- ============================================================================
-- CORREÇÃO: RESOLUÇÃO DE TENANT SEM CONFIAR EM CAMPO EDITÁVEL PELO CLIENT
-- ============================================================================

-- Substitui a função por uma versão que só consulta a tabela profiles
-- (nunca o JWT user_metadata, que o próprio usuário controla).
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS VARCHAR(64) AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Nota: as policies criadas em 20260926000000_engineering_core.sql que fazem
-- "OR tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id =
-- auth.uid())" continuam existindo, mas como o Bloco 1 já trancou
-- user_profiles para service_role-only, essa subquery agora sempre retorna
-- vazio para uma sessão de usuário comum — o OR fica inofensivo, não precisa
-- editar aquele arquivo.

-- ============================================================================
-- TRAVA CONTRA AUTO-PROMOÇÃO DE ROLE EM public.profiles
-- ============================================================================
CREATE OR REPLACE FUNCTION public.prevent_self_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
    -- Só um admin do MESMO tenant, alterando OUTRO usuário, pode mudar role/tenant_id
    IF EXISTS (
      SELECT 1 FROM public.profiles admin_row
      WHERE admin_row.id = auth.uid()
        AND admin_row.role = 'admin'
        AND admin_row.tenant_id = OLD.tenant_id
        AND auth.uid() <> OLD.id
    ) THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Alteração de role/tenant_id não autorizada para este usuário.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_privilege_escalation();
