# ELÉTRICAI — CRONOGRAMA DE EXECUÇÃO DIA A DIA (1 A 1)
## ROTEIRO EXECUTIVO SEQUENCIAL DAS 19 FASES DO ENGINEERING CORE 4.0

---

### VISÃO GERAL DAS FASES E DIAS DE EXECUÇÃO

```text
DIA 01 ───► FASE 0: Auditoria Completa e Congelamento de Baseline
DIA 02 ───► FASE 1: Arquitetura do Engineering Core & Registry Unificado
DIA 03 ───► FASE 2: Modelo de Dados Relacional e Migrations Supabase
DIA 04 ───► FASE 3: Biblioteca Universal de Símbolos DIN/IEC/ABNT
DIA 05 ───► FASE 4: Integração Profunda do Editor Unifilar
DIA 06 ───► FASE 5: Integração Profunda do Editor Multifilar (3P+N+PE)
DIA 07 ───► FASE 6: Biblioteca Completa Ladder IEC 61131-3 & FBD
DIA 08 ───► FASE 7: Mapeamento de CLP, Racks e I/O Físico/Digital
DIA 09 ───► FASE 8: Document Intelligence (Pipeline de Ingestão e OCR)
DIA 10 ───► FASE 9: Knowledge Center e Rastreabilidade de Datasheets
DIA 11 ───► FASE 10: Calculation Engine (Dimensionamento Puro NBR 5410)
DIA 12 ───► FASE 11: Validation Engine e Matriz de Inconformidades
DIA 13 ───► FASE 12: Simulation Engine (Tempo Real, Scan de CLP e Falhas)
DIA 14 ───► FASE 13: Camada de IA Assistiva Confiável (Gemini/DeepSeek)
DIA 15 ───► FASE 14: Supervisório SCADA, Tags e Comunicação Industrial
DIA 16 ───► FASE 15: Geração de Relatórios, Lista de Cabos, BOM e DXF
DIA 17 ───► FASE 16: Otimização de Performance, Virtualização e Web Workers
DIA 18 ───► FASE 17: Segurança Industrial, Sanitização e RLS Rigoroso
DIA 19 ───► FASE 18: Bateria de Testes E2E e Validação Multi-Tenant
DIA 20 ───► FASE 19: Auditoria Final de Engenharia e Documentação Oficial
```

---

### DETALHAMENTO DE CADA DIA DE TRABALHO

#### DIA 01 — FASE 0: Auditoria Completa e Baseline Estável
* **Meta:** Concluir mapeamento de todo o código atual, validar que `npm run lint` e `npx tsc --noEmit` passam com zero erros e criar os documentos estruturais de governança em `docs/`.
* **Entregáveis:**
  - `docs/engineering-audit.md`
  - `docs/engineering-architecture.md`
  - `docs/engineering-roadmap.md`
* **Critério de Aceite:** 0 erros no TypeScript, 0 warnings no ESLint, dev server ativo sem erros no console.

#### DIA 02 — FASE 1: Arquitetura do Engineering Core & Registry Unificado
* **Meta:** Implementar o `EngineeringModelRegistry` centralizando o ciclo de vida de componentes, tags e nós elétricos.
* **Entregáveis:**
  - `lib/engineering/core/registry.ts`
  - `lib/engineering/core/types.ts`
* **Critério de Aceite:** Unicidade de TAGs com resolução automática de colisões e vinculação cruzada entre diagramas.

#### DIA 03 — FASE 2: Modelo de Dados Relacional e Migrations Supabase
* **Meta:** Consolidar schema relacional do PostgreSQL no Supabase cobrindo organizações, projetos, revisões, nós de potência e elementos de automação.
* **Entregáveis:**
  - `supabase/migrations/20260926000000_engineering_core.sql`
  - `docs/database-engineering-model.md`
* **Critério de Aceite:** Migration executa limpa no Supabase sem quebras de integridade referencial.

#### DIA 04 — FASE 3: Biblioteca Universal de Símbolos DIN/IEC/ABNT
* **Meta:** Criar catálogo modular de símbolos vetoriais padronizados com bornes magnéticos e regras de conexão física.
* **Entregáveis:**
  - `lib/engineering/symbols/library-catalog.ts`
  - `components/cad/SymbolLibrarySidebar.tsx` (atualizado)
  - `docs/symbol-library-architecture.md`
* **Critério de Aceite:** Símbolos inseridos no canvas possuem portas identificadas eletricamente (entrada, saída, comando, PE).

#### DIA 05 — FASE 4: Integração Profunda do Editor Unifilar
* **Meta:** Ligar o canvas unifilar diretamente ao banco de dados relacional e ao cálculo dinâmico de queda de tensão em tempo real.
* **Entregáveis:**
  - `components/unifilar/UnifilarCanvas.tsx`
  - `lib/engineering/unifilar/unifilar-engine.ts`
* **Critério de Aceite:** Arrastar componente, salvar, recarregar (F5) e o componente permanece com coordenadas e parâmetros intactos.

#### DIA 06 — FASE 5: Integração Profunda do Editor Multifilar (3P+N+PE)
* **Meta:** Implementar renderizador de barramentos trifásicos L1, L2, L3, Neutro e Terra com derivações normatizadas para partidas de motores.
* **Entregáveis:**
  - `components/multifilar/MultifilarViewer.tsx`
  - `lib/engineering/multifilar/schematic-router.ts`
* **Critério de Aceite:** Fios de comando e potência identificados com bitolas em mm² e código de cores NBR 5410 (Azul=N, Verde=PE).

#### DIA 07 — FASE 6: Biblioteca Completa Ladder IEC 61131-3 & FBD
* **Meta:** Suportar todas as instruções normalizadas da IEC 61131-3 (timers, contadores, comparadores, bobinas set/reset, blocos matemáticos).
* **Entregáveis:**
  - `components/ladder/LadderEditor.tsx`
  - `lib/plc-simulator-engine.ts`
* **Critério de Aceite:** Simulação de rungs com scan cíclico e acionamento de saídas físicas sincronizadas.

#### DIA 08 — FASE 7: Mapeamento de CLP, Racks e I/O Físico/Digital
* **Meta:** Módulo de configuração de hardware com bastidores, módulos de entradas analógicas (4-20mA), termopares e saídas a relé.
* **Entregáveis:**
  - `components/plc/PlcRackConfig.tsx`
  - `types/plc.ts`
* **Critério de Aceite:** Mapeamento explícito de endereços `%I` e `%Q` vinculados a sensores e atuadores da planta.

#### DIA 09 — FASE 8: Document Intelligence (Pipeline de Ingestão e OCR)
* **Meta:** Ingestão de arquivos técnicos PDF com hash SHA-256, sanitização e extração de tabelas de especificações.
* **Entregáveis:**
  - `lib/document-intelligence/extractor.ts`
  - `docs/document-intelligence-architecture.md`
* **Critério de Aceite:** Upload de datasheet com extração e isolamento estrito de prompt injection.

#### DIA 10 — FASE 9: Knowledge Center e Rastreabilidade de Datasheets
* **Meta:** Painel de pesquisa técnica com links diretos entre especificações extraídas e as páginas originais do documento do fabricante.
* **Entregáveis:**
  - `components/knowledge/TechnicalKnowledgeCenter.tsx`
* **Critério de Aceite:** Clique em "Ver Evidência" abre o trecho e página do manual onde a corrente ou potência foi descrita.

#### DIA 11 — FASE 10: Calculation Engine (Dimensionamento Puro NBR 5410)
* **Meta:** Implementação e testes unitários de correntes nominais, condutores (critérios de ampacidade, queda de tensão e curto térmico) e coordenação de proteção.
* **Entregáveis:**
  - `lib/engineering/calculation-engine/cable-sizing.ts`
  - `lib/engineering/calculation-engine/short-circuit.ts`
  - `docs/calculation-engine-architecture.md`
* **Critério de Aceite:** Testes com casos práticos conhecidos (ex: motor 15kW, 380V, 50 metros) retornando cabo e disjuntor com memória de cálculo.

#### DIA 12 — FASE 11: Validation Engine e Matriz de Inconformidades
* **Meta:** Motor de inspeção estática contínua verificando violações de segurança (sobrecarga, ausência de condutor PE, queda de tensão > 4%).
* **Entregáveis:**
  - `lib/engineering/validation/electrical-rules.ts`
  - `docs/engineering-validation-rules.md`
* **Critério de Aceite:** Alertas divididos em INFO, WARNING, ERROR e CRITICAL com sugestão de ação corretiva.

#### DIA 13 — FASE 12: Simulation Engine (Tempo Real, Scan de CLP e Falhas)
* **Meta:** Simulação física e lógica em tempo real com injeção de falhas (curto-circuito, sobrecarga de motor, perda de fase).
* **Entregáveis:**
  - `lib/engineering/simulation/plant-simulator.ts`
* **Critério de Aceite:** Ao simular sobrecarga, o relé térmico abre em conformidade com sua curva de disparo e interrompe a bobina no Ladder.

#### DIA 14 — FASE 13: Camada de IA Assistiva Confiável (Gemini/DeepSeek)
* **Meta:** Assistente de engenharia que propõe mudanças estruturadas (Changeset), explica inconsistências e monta rungs sob demanda.
* **Entregáveis:**
  - `app/api/ai/engineer/route.ts`
  - `docs/ai-engineering-architecture.md`
* **Critério de Aceite:** Nenhuma resposta de IA altera o banco sem preview visual e aprovação expressa do engenheiro.

#### DIA 15 — FASE 14: Supervisório SCADA, Tags e Comunicação Industrial
* **Meta:** Painel sinóptico SCADA com animação de motores, instrumentos analógicos de corrente/tensão e registro de alarmes industriais.
* **Entregáveis:**
  - `components/scada/ScadaMimic.tsx`
  - `components/scada/AlarmBanner.tsx`
* **Critério de Aceite:** Acionamento de tag no SCADA comanda a variável correspondente no CLP e diagrama unifilar.

#### DIA 16 — FASE 15: Geração de Relatórios, Lista de Cabos, BOM e DXF
* **Meta:** Exportação técnica profissional de memoriais descritivos, pranchas CAD DXF R12 e lista quantitativa de materiais com valores orçados.
* **Entregáveis:**
  - `lib/dxf-generator.ts`
  - `components/bom/BomMemorial.tsx`
* **Critério de Aceite:** Arquivo DXF abre perfeitamente em visualizadores CAD (AutoCAD/LibreCAD) com camadas separadas e carimbo normatizado.

#### DIA 17 — FASE 16: Otimização de Performance, Virtualização e Web Workers
* **Meta:** Otimização para plantas com mais de 500 componentes sem travamentos de UI em telas de 60fps.
* **Entregáveis:**
  - Virtualização de listas no canvas e debounce de persistência.
* **Critério de Aceite:** Arraste suave no canvas e consumo controlado de memória no navegador.

#### DIA 18 — FASE 17: Segurança Industrial, Sanitização e RLS Rigoroso
* **Meta:** Validação das barreiras multi-tenant com suites de teste de invasão simulada entre Tenants.
* **Entregáveis:**
  - Scripts de teste automatizado de RLS e sanitização de payloads JSON.
* **Critério de Aceite:** 100% dos testes de isolamento de banco de dados aprovados.

#### DIA 19 — FASE 18: Bateria de Testes E2E e Validação Multi-Tenant
* **Meta:** Validação end-to-end de todo o fluxo: Cadastro de usuário -> Criação de Projeto -> Desenho Unifilar -> Ladder -> Simulação -> Salvar -> Logout -> Login -> Verificação.
* **Entregáveis:**
  - Suite de validação completa do sistema em produção.
* **Critério de Aceite:** Todas as etapas executadas contra o banco real do Supabase sem dados mockados.

#### DIA 20 — FASE 19: Auditoria Final de Engenharia e Documentação Oficial
* **Meta:** Verificação final de conformidade de código, atualização do README e encerramento com software industrial pronto para engenheiros e eletrotécnicos.
* **Entregáveis:**
  - Documentação consolidada e relatório final de conformidade técnica do **ElétricAi**.
* **Critério de Aceite:** Compilação de produção (`npm run build`) concluída com louvor.
