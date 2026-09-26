# ELÉTRICAI — PERSISTÊNCIA REAL NO SUPABASE & SEGURANÇA RLS

---

### 1. ARQUITETURA MULTI-TENANT E MODELAGEM DE DADOS

O banco PostgreSQL do Supabase é a fonte de verdade soberana.
Todo o relacionamento obedece ao isolamento por organização/tenant:

```text
auth.users (Supabase Auth)
     │
     ▼
public.profiles ─────► public.tenants (Organização Industrial)
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
    public.projects                 public.symbol_library
            │
    ┌───────┴───────┬───────────────┬───────────────┐
    ▼               ▼               ▼               ▼
components     connections     shared_tags     ladder_rungs
```

---

### 2. POLÍTICAS DE ROW LEVEL SECURITY (RLS)

Todas as tabelas de negócio possuem RLS ativo (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
Exemplo da política restritiva em `public.projects`:

```sql
-- Leitura restrita aos membros da mesma organização (Tenant)
CREATE POLICY "tenant_isolation_projects_select"
ON public.projects
FOR SELECT
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Inserção restrita à organização do usuário autenticado
CREATE POLICY "tenant_isolation_projects_insert"
ON public.projects
FOR INSERT
WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Atualização e exclusão somente na organização do usuário
CREATE POLICY "tenant_isolation_projects_update"
ON public.projects
FOR UPDATE
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "tenant_isolation_projects_delete"
ON public.projects
FOR DELETE
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
  )
);
```

---

### 3. VALIDAÇÃO AUTOMATIZADA DE ISOLAMENTO
Em ambiente de testes, dois usuários pertencentes a Tenants distintos executam verificações cruzadas:
* `User A` (Tenant Paulínia Petroquímica) cria `Projeto 001`.
* `User B` (Tenant Braskem Alimentos) tenta executar:
  `SELECT * FROM projects WHERE id = 'proj_001'`
* O PostgreSQL retorna obrigatoriamente **0 linhas** (bloqueio por RLS).
* Qualquer tentativa de `DELETE` ou `UPDATE` por `User B` não afeta nenhuma linha.

---

### 4. HISTÓRICO DE REVISÕES E AUDITORIA (`project_revisions`)
Toda mutação crítica de topologia no Unifilar, Multifilar ou Ladder salva uma revisão com hash do snapshot:
* `revision_number`: Contador sequencial por projeto (R00, R01, R02).
* `snapshot_data`: JSONB contendo estado completo dos componentes, fios, bornes e rungs.
* `created_by_id`: UUID do engenheiro autenticado.
* `change_summary`: Resumo técnico gerado para o carimbo (Title Block) conforme norma ABNT.
