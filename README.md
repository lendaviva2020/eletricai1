# ElétricAi

Aplicação de engenharia elétrica industrial (one-line diagram / unifilar, Ladder PLC, SCADA mímico, base de cálculo NBR 5410 e centro de conhecimento técnico).

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind v4 · Supabase JS v2 · Jest / ts-jest.

## Comandos

| Comando | Função |
| :--- | :--- |
| `npm install` | Instala dependências |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint (`eslint .`) |
| `npm test` | Suítes Jest |
| `npm run test:coverage` | Jest com cobertura |

Variáveis de ambiente: copie `.env.example` para `.env` e preencha. **Nenhuma credencial fica no código do frontend.**

## Estrutura

```
app/                  Rotas App Router (/, /signup, /api/*)
components/           UI (scada, knowledge, layout, shared, ...)
lib/engineering/      calculation-engine/, validation/, simulation/ (FASES 10-12)
lib/                  nbr5410, electrical-calc, electrical-validation, supabase/*, plc-simulator-engine
supabase/migrations/  Schema + RLS (6 migrations)
scripts/verify-rls.sql Consulta SOMENTE LEITURA para auditoria de RLS
docs/                 Arquitetura de cálculo e regras de validação
plano_do_eletricai/   Planos, cronograma e relatórios de execução
__tests__/            Testes (componentes, cálculo, validação, simulação)
```

## Módulos de engenharia

| Módulo | Arquivo | Estado |
| :--- | :--- | :--- |
| Dimensionamento de cabos e proteções | `lib/engineering/calculation-engine/cable-sizing.ts` | **CÓDIGO GERADO + TESTADO** |
| Curto-circuito (IEC 60909) | `lib/engineering/calculation-engine/short-circuit.ts` | **CÓDIGO GERADO + TESTADO** |
| Regras estáticas de validação | `lib/engineering/validation/electrical-rules.ts` | **CÓDIGO GERADO + TESTADO** |
| Simulador de planta (relé térmico + Ladder) | `lib/engineering/simulation/plant-simulator.ts` | **SIMULAÇÃO — CÓDIGO GERADO + TESTADO** |
| Inspeção estrutural do desenho | `lib/electrical-validation.ts` | pré-existente |
| Banner de alarmes SCADA | `components/scada/AlarmBanner.tsx` | **CÓDIGO GERADO + TESTADO** |
| Centro de conhecimento técnico | `components/knowledge/TechnicalKnowledgeCenter.tsx` | **CÓDIGO GERADO + TESTADO** |

## Rótulos obrigatórios de engenharia

* **SIMULAÇÃO** — saída de simulador; nunca é leitura real de campo e nunca aciona equipamento.
* **VALOR_ASSUMIDO** — valor adotado por falta de dado (ex.: ampacidade coluna método B1/PVC; limite de queda de tensão 4%).
* **DADO_NAO_INFORMADO** — dado ausente; nenhum resultado é produzido.
* **CONTEUDO_NAO_CONFIADO** — texto extraído de documento não validado.

## Segurança

* RLS habilitado em todas as tabelas de negócio; isolamento por tenant via `get_current_tenant_id()`.
* Auditoria de RLS: `scripts/verify-rls.sql` (**somente SELECT**).
* Lógica de segurança/saúde nunca é substituída por simulação; E-Stop e intertravamentos permanecem independentes.
* Nenhuma alteração em migrations, RLS ou auth foi feita sem confirmação explícita.

## Limitações declaradas

1. Sem `.env` no repositório → execução contra Supabase real e RLS em PostgreSQL: **DADO_NAO_INFORMADO**.
2. Extração de texto de PDF: **SIMULAÇÃO** (`extractTextFromFile` retorna texto fixo para PDF).
3. Tabelas de ampacidade em `lib/nbr5410.ts` são **VALOR_ASSUMIDO** (não conferidas contra a norma impressa).
4. Relatório completo de conformidade: `plano_do_eletricai/09_RELATORIO_FINAL_DE_CONFORMIDADE.md`.
