-- ============================================================================
-- ELÉTRICAI — SCRIPT DE VERIFICAÇÃO DE RLS (SOMENTE LEITURA)
-- FASE 16 — verificação, NÃO modificação.
--
-- Este arquivo contém EXCLUSIVAMENTE consultas SELECT.
-- Ele NÃO altera políticas, NÃO altera migrations, NÃO altera auth.
--
-- COMO EXECUTAR (requer credenciais — sem .env no repositório, esta execução
-- permanece DADO_NAO_INFORMADO nesta sessão):
--   psql "$DATABASE_URL" -f scripts/verify-rls.sql
--   (ou pelo SQL Editor do Supabase, colando o conteúdo abaixo)
--
-- INTERPRETAÇÃO: para cada linha, `rls_enabled = true` e ao menos uma política
-- por operação relevante (SELECT/INSERT/UPDATE/DELETE) deve existir.
-- ============================================================================

-- 1) Segurança a nível de linha habilitada por tabela
SELECT c.relname                                   AS tabela,
       c.relrowsecurity                            AS rls_enabled,
       c.relforcerowsecurity                       AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'technical_documents',
    'extracted_entities',
    'projects',
    'project_members',
    'components',
    'connections'
  )
ORDER BY c.relname;

-- 2) Políticas existentes por tabela (nome, comando, papéis e condição)
SELECT schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd,
       qual,
       with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3) Tabelas com RLS DESATIVADO (resultado esperado: vazio para as tabelas acima)
SELECT c.relname AS tabela_sem_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = false
  AND c.relname IN (
    'technical_documents',
    'extracted_entities',
    'projects',
    'project_members',
    'components',
    'connections'
  )
ORDER BY c.relname;

-- 4) Verificação de isolamento por tenant (deve retornar 0 linhas para
--    usuários sem acesso ao tenant informado — executar logado em um tenant)
-- SELECT count(*) AS documentos_fora_do_tenant
-- FROM technical_documents
-- WHERE tenant_id <> 'TENANT_ID_DO_USUARIO_LOGADO';
