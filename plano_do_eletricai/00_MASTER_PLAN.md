# ELÉTRICAI — PLANO MESTRE DE ENGENHARIA 4.0
## SISTEMA OPERACIONAL INDUSTRIAL COM PERSISTÊNCIA REAL, BIBLIOTECA UNIVERSAL, CLP, SCADA, DOCUMENT INTELLIGENCE E IA

---

### IDENTIDADE OFICIAL DO PRODUTO
* **Nome Oficial e Exclusivo:** `ElétricAi`
* **Definição Técnica:** Plataforma integrada de Engenharia Elétrica, Automação Industrial IEC 61131-3, Projetos Unifilar/Multifilar, Modelagem de Painéis CCM/QGBT, Simulação Física Determinística, Supervisório SCADA, Análise de Documentos Técnicos e IA Assistiva Confiável.
* **Princípio Supremo:** **"Não construa uma IA que desenha elétrica. Construa uma plataforma de engenharia com persistência real que possui IA."**

---

### ARQUITETURA FUNDAMENTAL UNIFICADA

```text
                               ELÉTRICAI
                                   │
                         ENGINEERING CORE 4.0
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
  PROJECT MODEL             KNOWLEDGE BASE            CALCULATION ENGINE
(Estado Unificado)       (Document Intelligence)    (Determinístico / Normas)
        │                          │                          │
  ┌─────┼─────┐                    │                    ┌─────┼─────┐
  │     │     │                    │                    │     │     │
UNIFILAR MULTIFILAR LADDER/FBD  DATASHEETS / MANUAIS  NBR 5410 IEC 60909 MOTOR/CABO
  │     │     │                    │                    │     │     │
  └─────┼─────┘                    │                    └─────┼─────┘
        │                          │                          │
        └──────────────────────────┼──────────────────────────┘
                                   │
                           VALIDATION ENGINE
                        (Regras de Engenharia)
                                   │
                           SIMULATION ENGINE
                      (Tempo Real / Scan de CLP)
                                   │
                          AI ENGINEERING LAYER
                       (Interpretação e Assistência)
                                   │
                         POSTGRESQL / SUPABASE
                      (Persistência Real + RLS)
```

---

### REGRA DE OURO: SEPARAÇÃO DE RESPONSABILIDADES
1. **A IA NUNCA é a autoridade matemática nem escreve diretamente no banco de dados.**
2. **A IA interpreta linguagem natural, propõe modificações e sugere topologias.**
3. **O Engineering Core calcula.**
4. **O Validation Engine valida contra normas técnicas e premissas físicas.**
5. **O Simulation Engine testa os estados de chaveamento e lógica de CLP.**
6. **O usuário revisa e aprova o changeset de engenharia.**
7. **O PostgreSQL (Supabase) persiste com integridade referencial e RLS estrito.**

---

### ÍNDICE DE DIRETÓRIOS DO PLANO

| Arquivo | Descrição |
| :--- | :--- |
| `01_AUDITORIA_E_MATRIZ_P0_P4.md` | Diagnóstico completo do repositório, mapeamento de falhas e matriz de criticidade P0 a P4. |
| `02_ENGINEERING_CORE_E_MODELO_UNIFICADO.md` | O modelo de dados transversal (Unifilar, Multifilar, Ladder, FBD, SCADA e CLP compartilhando as mesmas entidades). |
| `03_BIBLIOTECA_UNIVERSAL_E_SIMBOLOS.md` | Biblioteca hierárquica e extensível de símbolos, componentes e fabricantes. |
| `04_CALCULATION_ENGINE_E_NORMAS.md` | Motor de cálculo determinístico (NBR 5410, NBR 14039, IEC 60909, queda de tensão, curto-circuito, motores e cabos). |
| `05_DOCUMENT_INTELLIGENCE_E_KNOWLEDGE.md` | Ingestão e extração estruturada de manuais, datasheets de inversores, cartões de CLP e catálogos com rastreabilidade total. |
| `06_PERSISTENCIA_SUPABASE_E_RLS.md` | Modelagem relacional, migrations SQL, Row-Level Security por Tenant, auditoria e rollback. |
| `07_CRONOGRAMA_EXECUCAO_DIA_A_DIA.md` | Roadmap executivo detalhado dia a dia, tarefa por tarefa, com critérios de aceite "Zero Mock". |

---

### CRITÉRIO ESTRITO DE CONCLUSÃO (DEFINITION OF DONE)
Uma tarefa ou módulo só é considerado CONCLUÍDO quando:
1. `npm run lint` executa com **0 erros e 0 warnings**.
2. `npx tsc --noEmit` executa com **0 erros de tipagem estrita**.
3. A persistência é verificada no **PostgreSQL do Supabase** (sem dados voláteis em memória/localStorage).
4. As políticas de **RLS** garantem que um Tenant nunca visualize ou altere dados de outro Tenant.
5. Fórmulas de engenharia contêm **testes unitários determinísticos** com tolerâncias numéricas definidas.
6. A interface reage com feedback em tempo real e não apresenta quebras em **Desktop, Notebook, Ultrawide, Tablet ou Mobile**.
