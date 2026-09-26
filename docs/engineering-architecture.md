# ELÉTRICAI — ARQUITETURA DE ENGENHARIA (DOCS)

### 1. Visão Arquitetural
A plataforma **ElétricAi** é construída sobre o princípio de um **Modelo de Engenharia Unificado**, onde:
* O Unifilar, o Multifilar, o Ladder e o SCADA compartilham os mesmos nós elétricos e estados de energização.
* O banco de dados PostgreSQL garante persistência atômica via snapshots versionados.
* A simulação física e lógica em tempo real reflete as ações do operador e as curvas térmicas dos dispositivos.

### 2. Fluxo de Execução
```text
Engenheiro -> Editor (Unifilar/Ladder) -> Engineering Core -> Validação Normativa -> Snapshot DB -> SCADA / Twin
```
