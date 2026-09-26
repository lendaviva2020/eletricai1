# ELÉTRICAI — AUDITORIA TÉCNICA E MATRIZ DE PROBLEMAS (P0 - P4)

---

### 1. DIAGNÓSTICO DO ESTADO ATUAL DO REPOSITÓRIO

#### 1.1 Stack de Tecnologias Identificada
* **Framework:** Next.js 15.4.9 (App Router) + React 19.2.1
* **Linguagem:** TypeScript 5.9.3 (Strict mode habilitado)
* **Estilização:** Tailwind CSS v4 (`@tailwindcss/postcss` 4.1.11, `tw-animate-css`)
* **Ícones:** Lucide React (`lucide-react`)
* **3D / Canvas / Animações:** Three.js 0.186.0 (`@types/three`), Motion (`motion/react`)
* **Banco de Dados & Autenticação:** Supabase JS v2.117.1 (`@supabase/supabase-js`, `@supabase/ssr`)
* **Inteligência Artificial:** Google Gen AI SDK v2.4.0 (`@google/genai`), Rota interna para DeepSeek/Gemini
* **Exportação CAD/Engenharia:** Gerador DXF R12 determinístico (`lib/dxf-generator.ts`), Exportador PLCopen XML (`types/plc.ts`)

#### 1.2 Mapeamento de Rotas
* `/`: Entrada principal (Alterna entre Landing Page industrial, Tela de Login unificada, Seletor de Planta/Tenant e Workspace completo com Header, Tabs e Menus).
* `/signup`: Rota dedicada de cadastro real com criação de usuário no Supabase Auth, provisão de Tenant e inserção de Perfil.
* `/api/auth/signup`: Endpoint servidor com validação e criação atômica via `createAdminClient()` (protegendo a Service Role Key).
* `/api/ai/engineer`: Endpoint com proxy seguro para o motor de engenharia assistido por IA e síntese de circuitos com premissas NBR 5410.

#### 1.3 Mapeamento dos Módulos dos Editores
1. **Unifilar (`components/unifilar/UnifilarCanvas.tsx`):**
   - Canvas vetorial SVG interativo para diagramas unifilares industriais.
   - Suporte a Transformadores, Disjuntores, Motores, Barramentos, Chaves e Relés.
   - Posição (x, y), status de energização, cálculo de queda de tensão visual.
2. **Multifilar (`components/multifilar/MultifilarViewer.tsx`):**
   - Diagrama trifásico detalhado (L1, L2, L3, N, PE).
   - Circuito de força e comando (Partida direta, Estrela-Triângulo, Reversão).
3. **Ladder IEC 61131-3 (`components/ladder/LadderEditor.tsx`):**
   - Editor de rungs com contatos NA, NF, bobinas, timers TON/TOF, contadores e blocos aritméticos.
   - Motor de scan local com execução em tempo real (`lib/plc-simulator-engine.ts`).
   - Copilot de automação determinístico com propostas de rungs (`lib/plc-ai-engine.ts`).
4. **FBD (`components/fbd/FbdEditor.tsx`):**
   - Editor de blocos funcionais lógicos com conexões de fios vetoriais.
5. **Supervisório SCADA (`components/scada/ScadaMimic.tsx`):**
   - Tela de supervisão sinóptica com instrumentos analógicos, botões e status sincronizados com os Shared Tags.
6. **Digital Twin 3D (`components/digital-twin/DigitalTwin3D.tsx`):**
   - Cubículos de média tensão e painéis CCM renderizados com Three.js em tempo real.
7. **BOM e Memorial Descritivo (`components/bom/BomMemorial.tsx`):**
   - Lista quantitativa de materiais, orçamentação BRL e memorial técnico para exportação.

---

### 2. MATRIZ DE PROBLEMAS E CRITICIDADE (P0 - P4)

| ID | Classificação | Módulo | Descrição do Problema | Causa Raiz | Solução Técnica de Engenharia | Status |
| :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **P0-01** | **P0 (Bloqueador)** | Banco / Auth | Criação de conta dependia de mock ou falhava com rate-limit do provedor SMTP padrão | Ausência de endpoint seguro no servidor para registrar usuário e tenant de forma atômica | Endpoint `/api/auth/signup` e tela `/signup` implementados com admin client no servidor | **RESOLVIDO** |
| **P0-02** | **P0 (Bloqueador)** | Persistência | Diagramas e componentes eram mantidos prioritariamente em memória React sem sincronização contínua com PostgreSQL | Falta de rotinas de carga e salvamento atômico de snapshot no Supabase | Implementada camada de persistência bidirecional (`saveFullProjectSnapshot`, `getProjectComponents`) em `lib/supabase/service.ts` | **RESOLVIDO** |
| **P1-01** | **P1 (Crítico)** | Engineering Core | Falta de modelo de dados unificado entre Unifilar, Multifilar, Ladder e SCADA | Componentes eram instanciados de forma isolada sem vínculos biunívocos de TAGs | Criar o `EngineeringModelRegistry` que unifica Componente, Pinos, Variáveis de CLP e Tags de SCADA | **PLANEJADO** |
| **P1-02** | **P1 (Crítico)** | Cálculo Elétrico | Dimensionamento de cabos e disjuntores em algumas telas utilizava estimativas lineares simplificadas | Regras da NBR 5410 (método de instalação, agrupamento, temperatura e critério térmico de curto) não estavam totalmente desacopladas | Mover todo o motor de cálculo para `lib/engineering/calculation-engine/` com funções puras e tabelas exatas da norma | **PLANEJADO** |
| **P1-03** | **P1 (Crítico)** | Document Intelligence | Não havia ingestão e parser automatizado de manuais PDF de inversores e CLPs | Ausência de pipeline de upload, OCR e extração estruturada de entidades técnicas | Implementar módulo `DocumentIntelligenceEngine` com validação de hash, extração de tabelas e indexação | **PLANEJADO** |
| **P2-01** | **P2 (Importante)** | Biblioteca | Catálogo de componentes ainda concentrado em arquivo local estático | Faltava abstração de biblioteca multinível (Global vs Organização vs Projeto) | Criar schema `symbol_library` no Supabase com suporte a importação de novos símbolos SVG e metadados técnicos | **PLANEJADO** |
| **P2-02** | **P2 (Importante)** | IA / Validação | Propostas geradas por IA não possuíam changelog detalhado com diff antes de mutação | Aplicação direta no estado do projeto | Implementar a estrutura `AiEngineeringChangeSet` com aprovação item a item e auditoria no banco | **PLANEJADO** |
| **P2-03** | **P2 (Importante)** | Simulação | CLP em scan rápido gerava re-renderização de componentes irmãos | Chamadas diretas de estado dentro do loop intervalado | Desacoplar estado do scan em store volátil sincronizada e atualizar componentes por ref/buffer | **PLANEJADO** |
| **P3-01** | **P3 (Melhoria)** | Responsividade | Painéis laterais de propriedades e paletas ocupavam largura fixa em telas menores que 1024px | Classes Tailwind estáticas sem drawer móvel adaptativo | Adicionar gaveta retrátil touch-first para tablets e smartphones | **PLANEJADO** |
| **P3-02** | **P3 (Melhoria)** | Auditoria | Eventos de atividades recentes no Dashboard eram mesclados com dados de exemplo | Falta de fallback seguro para projetos recém-criados com zero atividades | Consulta exclusiva à tabela `activity_events` e estado vazio transparente | **RESOLVIDO** |
| **P4-01** | **P4 (Futuro)** | Digital Twin | Sincronização OPC UA / MQTT com PLCs reais em chão de fábrica | Requer gateway industrial em edge ou servidor WebSocket dedicado | Estruturar schema de tags com suporte a metadados de protocolo industrial | **PLANEJADO** |

---

### 3. AUDITORIA DE SEGURANÇA E AMBIENTE
* **Chaves Públicas vs Privadas:**
  - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` são injetados exclusivamente no cliente onde o RLS é ativo.
  - `SUPABASE_SERVICE_ROLE_KEY` e `DEEPSEEK_API_KEY` são estritamente mantidos no servidor (Next.js Server Actions / API Routes).
* **Row-Level Security (RLS):**
  - Todas as tabelas públicas (`tenants`, `profiles`, `projects`, `components`, `connections`, `shared_tags`, `ladder_rungs`, `alerts`, `activity_events`) possuem RLS habilitado e testado.
  - Usuários do Tenant A são comprovadamente bloqueados pelo PostgreSQL de ler, alterar ou excluir registros do Tenant B.
