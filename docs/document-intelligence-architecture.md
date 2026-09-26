# ELÉTRICAI — DOCUMENT INTELLIGENCE (DOCS)

### 1. Ingestão Segura de Documentos Técnicos
* Pipeline com hash SHA-256 para prevenção de processamento duplicado.
* Sanitização estrita contra prompt injection em manuais PDF e tabelas XLSX.
* Delimitação estrita: `DOCUMENT CONTENT != SYSTEM INSTRUCTION`.

### 2. Rastreabilidade
Cada propriedade de equipamento extraída (ex: Corrente nominal, curva de disparo) aponta para o documento, página, seção e nível de confiança.
Consulte `/plano_do_eletricai/05_DOCUMENT_INTELLIGENCE_E_KNOWLEDGE.md` para o pipeline detalhado.
