# ELÉTRICAI — PLANO DE EXECUÇÃO POR ETAPAS (GERADO A PARTIR DA ANÁLISE REAL DO REPOSITÓRIO)

> Regras aplicadas: engenharia segura, sem invenção de dados, sem afirmação de validação não executada.
> Todo valor apurado abaixo foi **executado e observado nesta sessão**. O que não pôde ser executado está marcado.

---

## 1. ANÁLISE DO APP (O QUE FOI REALMENTE EXECUTADO)

### 1.1 Comandos executados e resultados observados

| Comando | Resultado observado | Status |
| :--- | :--- | :--- |
| `npx tsc --noEmit` | código de saída `0`, nenhuma saída de erro | **EXECUTADO — 0 erros** |
| `npm run lint` (`eslint .`) | código de saída `0`, nenhuma saída | **EXECUTADO — 0 erros / 0 warnings** |
| `npm test` (`jest`) | `Test Suites: 2 passed, 2 total` / `Tests: 43 passed, 43 total` | **EXECUTADO — 43 testes passando** |
| `npm run build` | **não executado nesta etapa** | DADO_NAO_INFORMADO |
| Execução contra Supabase real | **não executada** — não existe `.env` no repositório (apenas `.env.example`) | DADO_NAO_INFORMADO |
| Dev server / verificação visual em navegador | **não executada nesta etapa** | DADO_NAO_INFORMADO |

### 1.2 Arquitetura observada

* Next.js 15 (App Router) + React 19 + TypeScript strict + Tailwind v4 + Supabase JS v2 + Jest/ts-jest.
* Rotas reais existentes: `/`, `/signup`, `/api/auth/signup`, `/api/ai/engineer`, `/api/ai/deepseek`.
* `middleware.ts` delega a sessão para `lib/supabase/middleware.ts`.
* Persistência: `lib/supabase/{client,server,admin,service,realtime,middleware}.ts`.
* Engenharia: `lib/engineering/{core,symbols,unifilar,multifilar}` + `lib/{nbr5410,electrical-calc,electrical-validation,plc-simulator-engine,dxf-generator}`.
* Migrações SQL: 6 arquivos, incluindo `20260926000000_engineering_core.sql` e `20260926010000_multi_tenant_rls_hardening.sql`.
* RLS verificado **no arquivo SQL** para `technical_documents` e `extracted_entities` (habilitado + políticas por tenant).
  → A execução dessas políticas no PostgreSQL **não foi possível verificar** (sem credenciais): DADO_NAO_INFORMADO.

### 1.3 Lacunas verificadas (existência de arquivo conferida, não presumida)

| Fase (07_CRONOGRAMA) | Entregável previsto | Situação verificada |
| :--- | :--- | :--- |
| FASE 9 | `components/knowledge/TechnicalKnowledgeCenter.tsx` | **AUSENTE** (diretório `components/knowledge/` vazio; nenhum símbolo `knowledge`/`datasheet` no código) |
| FASE 10 | `lib/engineering/calculation-engine/cable-sizing.ts` | **AUSENTE** |
| FASE 10 | `lib/engineering/calculation-engine/short-circuit.ts` | **AUSENTE** |
| FASE 11 | `lib/engineering/validation/electrical-rules.ts` | **AUSENTE** (existe `lib/electrical-validation.ts`, escopo diferente) |
| FASE 12 | `lib/engineering/simulation/plant-simulator.ts` | **AUSENTE** |
| FASE 14 | `components/scada/AlarmBanner.tsx` | **AUSENTE** |
| FASE 19 | `README.md` | **AUSENTE** |
| FASE 8 | `lib/document-intelligence/extractor.ts` | **EXISTE**, porém `processDocumentUpload` **não é chamado por nenhum módulo** (verificado por grep) — pipeline não integrado |
| FASE 8 | extração de texto de PDF | **SIMULAÇÃO** — `extractTextFromFile` retorna texto fixo para `application/pdf` (próprio comentário no código) |

---

## 2. PREMISSAS E LIMITAÇÕES DECLARADAS

1. **Sem `.env`**: nenhuma validação contra PostgreSQL/Supabase real foi nem será executada nesta sessão, salvo que o usuário forneça credenciais. Persistência/RLS permanecem **DADO_NAO_INFORMADO**.
2. **Sem navegador validado**: nenhum teste E2E visual foi executado.
3. **Números normativos**: as tabelas de ampacidade em `lib/nbr5410.ts` já existem no repositório e são tratadas como **VALOR_ASSUMIDO** — sua correspondência exata com a NBR 5410 impressa **não foi conferida contra a norma** nesta sessão.
4. **Simulação ≠ realidade**: qualquer saída de motor de simulação será rotulada `SIMULAÇÃO`.
5. Nenhuma alteração será feita em `supabase/migrations`, RLS, auth ou infraestrutura sem confirmação explícita do usuário.

---

## 3. ETAPAS (execução sequencial, uma por vez, com verificação ao fim de cada)

### E1 — FASE 9: Knowledge Center e rastreabilidade de datasheets
* **Criar:** `components/knowledge/TechnicalKnowledgeCenter.tsx`.
* **Comportamento:** consulta `technical_documents` + `extracted_entities` via cliente Supabase (RLS ativo), lista propriedades extraídas com página, seção, confiança e botão **"Ver Evidência"** abrindo o trecho (`originalSnippet`) e a página de origem.
* **Escopo mínimo:** componente auto-contido via props/fetch; sem alterar schema.
* **Aceite:** `tsc`/`lint`/`jest` verdes; estado vazio transparente quando não há documentos.

### E2 — FASE 10: Calculation Engine (módulos exigidos)
* **Criar:** `lib/engineering/calculation-engine/cable-sizing.ts` e `short-circuit.ts` + `docs/calculation-engine-architecture.md` (atualização) + testes em `__tests__/engineering/calculation/`.
* **Reuso:** tabelas/fórmulas já existentes em `lib/nbr5410.ts` e `lib/electrical-calc.ts` (não duplicar lógica viva; não alterar consumidores existentes).
* **Cobertura:** `Ib`, ampacidade com `f_t·f_a`, queda de tensão ≤ 4%, `Ib ≤ In ≤ Iz`, `S_min = Icc·√t/k`, `I_k3` IEC 60909.
* **Aceite:** casos práticos (motor 15 kW / 380 V / 50 m) com tolerância numérica; `tsc`/`lint`/`jest` verdes.

### E3 — FASE 11: Validation Engine
* **Criar:** `lib/engineering/validation/electrical-rules.ts` + `docs/engineering-validation-rules.md` (atualização) + testes.
* **Regras:** sobrecarga (`In > Iz`), ausência de condutor PE, queda de tensão > 4%, TAG duplicada, curva/ajuste incoerente.
* **Severidades:** `INFO | WARNING | ERROR | CRITICAL` + sugestão corretiva.
* **Não substitui** `lib/electrical-validation.ts` existente (regra: preservar arquitetura).

### E4 — FASE 12: Simulation Engine
* **Criar:** `lib/engineering/simulation/plant-simulator.ts` + testes.
* **Escopo:** curva térmica de relé (I²t), injeção de falhas (sobrecarga, perda de fase), propagação de estado para a bobina do Ladder — tudo determinístico e rotulado `SIMULAÇÃO`.
* **Proibição:** nenhum acionamento de equipamento físico; lógica de segurança permanece separada.

### E5 — FASE 14: AlarmBanner
* **Criar:** `components/scada/AlarmBanner.tsx` (banner de alarmes com severidade, silenciamento visual e reconhecimento), consumindo o estado já existente do workspace/SCADA.

### E6 — FASE 16 a 19: fechamento
* Revisão de performance (sem alteração destrutiva), scripts de verificação de RLS, `README.md`, `npm run build` e relatório final de conformidade com a tabela **código gerado / compilado / testado / simulado / executado / validado**.

---

## 4. DEFINITION OF DONE POR ETAPA
1. `npx tsc --noEmit` → 0 erros.
2. `npm run lint` → 0 erros e 0 warnings.
3. `npm test` → todos os testes passando (novo teste adicionado para o módulo da etapa).
4. Nenhuma alteração em RLS, auth, migrations ou código funcional sem necessidade.
5. Registro do que foi efetivamente executado vs. não executado.
