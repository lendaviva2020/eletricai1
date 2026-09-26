# ELÉTRICAI — MODELO DE BANCO DE DADOS & SCHEMAS RELACIONAIS (FASE 2)

---

### 1. Visão Geral Relacional (PostgreSQL no Supabase)

O modelo relacional do **ElétricAi** é rigorosamente multi-tenant e orientado a projetos industriais, normas ABNT/IEC e rastreabilidade total:

```text
auth.users (Supabase Auth)
     │
     ▼
public.profiles ─────► public.tenants (Organização Industrial / Planta)
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
    public.projects                 public.symbol_library
            │
    ┌───────┼───────────────────────────────┬───────────────────────────────┐
    ▼       ▼                               ▼                               ▼
components connections                  circuits                       ladder_rungs
    │       │                               │                               │
    └───────┴───────────────┬───────────────┴───────────────────────────────┘
                            ▼
                public.project_revisions (Snapshots Versionados)
                            │
                            ▼
            public.engineering_audit_logs (Trilha Imutável)
```

---

### 2. Dicionário de Tabelas da Fase 2

#### 2.1 `public.project_revisions`
Armazena revisões formais de engenharia de pranchas e diagramas (R00, R01, R02):
* `id` (VARCHAR(64), PK): Identificador único da revisão (`rev_...`).
* `tenant_id` (VARCHAR(64), FK): Organização proprietária isolada por RLS.
* `project_id` (VARCHAR(64), FK): Projeto associado.
* `revision_number` (INT): Sequencial numérico (0, 1, 2, ...).
* `revision_code` (VARCHAR(16)): Código ABNT do carimbo (ex: `REV-00`).
* `title` (VARCHAR(128)): Finalidade (ex: "Emissão para Aprovação").
* `description` (TEXT): Notas de revisão técnica.
* `snapshot_data` (JSONB): Cópia integral e imutável dos componentes, conexões, tags e rungs daquela versão.
* `components_count` (INT): Total de elementos físicos no snapshot.
* `connections_count` (INT): Total de cabos/barramentos conectados.
* `created_by_id` (VARCHAR(64)): UUID do engenheiro emissor.
* `author_name` (VARCHAR(128)): Nome do responsável técnico.
* `crea_art` (VARCHAR(64)): Anotação de Responsabilidade Técnica (ART/CREA).
* `created_at` (TIMESTAMPTZ): Carimbo de data/hora oficial da emissão.

#### 2.2 `public.circuits`
Armazena a planilha de circuitos elétricos, alimentadores e ramais terminais (NBR 5410):
* `id` (VARCHAR(64), PK): Identificador do circuito (`cir_...`).
* `tenant_id` (VARCHAR(64), FK): Isolamento por organização.
* `project_id` (VARCHAR(64), FK): Projeto elétrico associado.
* `circuit_number` (VARCHAR(32)): Identificador normativo (ex: `C01`, `ALIM-01`).
* `name` (VARCHAR(128)): Descrição da carga (ex: `Bomba de Recirculação BM-01`).
* `panel_tag` (VARCHAR(64)): Quadro de distribuição de origem (ex: `QGBT-01`, `CCM-01`).
* `voltage_v` (NUMERIC(10,2)): Tensão nominal de fase ou linha (ex: `380.00`).
* `phases` (VARCHAR(16)): Configuração de fases (`1F`, `2F`, `3F`, `3F+N`, `3F+N+PE`).
* `power_kw` (NUMERIC(10,2)): Potência ativa calculada.
* `power_factor` (NUMERIC(4,3)): Fator de potência $\cos\phi$ nominal.
* `ib_amperes` (NUMERIC(10,2)): Corrente de projeto calculada $I_b$.
* `in_amperes` (NUMERIC(10,2)): Corrente nominal do disjuntor de proteção $I_n$.
* `cable_section_mm2` (NUMERIC(10,2)): Seção do condutor em mm².
* `cable_length_m` (NUMERIC(10,2)): Comprimento físico do circuito em metros.
* `cable_insulation` (VARCHAR(32)): Tipo de isolação (`PVC 70°C`, `EPR 90°C`, `XLPE 90°C`).
* `installation_method` (VARCHAR(32)): Método de instalação NBR 5410 (`B1`, `B2`, `C`, `D`).
* `grouping_factor` (NUMERIC(4,3)): Fator de correção de agrupamento $f_a$.
* `temp_factor` (NUMERIC(4,3)): Fator de correção de temperatura $f_t$.
* `voltage_drop_percent` (NUMERIC(5,2)): Queda de tensão calculada $\Delta V\%$.
* `breaker_model` (VARCHAR(64)): Modelo comercial do disjuntor.
* `protection_device` (VARCHAR(64)): Tipo de dispositivo (`DISJUNTOR_MOTOR`, `DISJUNTOR_CAIXA_MOLDADA`, `FUSIVEL_NH`).

#### 2.3 `public.symbol_library`
Catálogo universal de símbolos vetoriais industriais (Global e por Tenant):
* `id` (VARCHAR(64), PK): Código do símbolo (ex: `weg_mpw40`, `din_contactor_3p`).
* `tenant_id` (VARCHAR(64), FK): Nulo para símbolos padrão globais ou ID da organização para símbolos proprietários.
* `category` (VARCHAR(64)): Categoria funcional (`TRANSFORMER`, `BREAKER`, `CONTACTOR`, `MOTOR`, `DRIVE`, `PLC`).
* `standard` (VARCHAR(32)): Norma de desenho (`ABNT_NBR`, `IEC_60617`, `ANSI_IEEE`).
* `svg_paths` (TEXT): Vetorização padronizada com coordenadas de bornes magnéticos.
* `connection_points` (JSONB): Pinos de força, comando, neutro e PE.
* `validation_rules` (JSONB): Regras de intertravamento e limites de corrente.
* `is_global` (BOOLEAN): Bandeira indicando se é público para todos os tenants.

#### 2.4 `public.engineering_audit_logs`
Trilha imutável para conformidade industrial e segurança operacional:
* `id` (VARCHAR(64), PK): Código do evento de auditoria (`aud_...`).
* `tenant_id` (VARCHAR(64), FK): Identificação do tenant.
* `project_id` (VARCHAR(64), FK): Projeto onde ocorreu a ação.
* `user_name` (VARCHAR(128)): Nome do operador técnico.
* `action` (VARCHAR(64)): Ação executada (`MUTATE_TOPOLOGY`, `CALCULATE_CABLES`, `EMIT_REVISION`, `AI_SYNTHESIS`).
* `target_entity` (VARCHAR(64)): Objeto impactado (`COMPONENT`, `CONNECTION`, `RUNG`, `CIRCUIT`).
* `changes` (JSONB): Diff antes/depois da alteração.
* `created_at` (TIMESTAMPTZ): Timestamp imutável da ocorrência.

---

### 3. Migração Executada
* **Arquivo SQL:** `supabase/migrations/20260926000000_engineering_core.sql`
* **Políticas de RLS:** Isolamento restrito por `tenant_id` para todas as tabelas, com leitura global condicional em `symbol_library` quando `is_global = TRUE`.

