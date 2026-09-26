# ELÉTRICAI — REGRAS DE VALIDAÇÃO DE ENGENHARIA (DOCS)

### 1. Níveis de Alerta
* **INFO:** Informações operacionais e sugestões de otimização de trajeto de cabos.
* **WARNING:** Fator de agrupamento elevado, queda de tensão entre 3% e 4%, ou falta de selo em partida direta.
* **ERROR:** Queda de tensão superior a 4% (NBR 5410), ausência de condutor de proteção (PE) ou bitola inferior à corrente de projeto ($I_z < I_b$).
* **CRITICAL:** Capacidade de ruptura do disjuntor inferior à corrente de curto presumida ($I_{cu} < I_{cc}$), risco iminente de explosão ou arco elétrico.
