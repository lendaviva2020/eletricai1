# ELÉTRICAI — ARQUITETURA DA BIBLIOTECA UNIVERSAL DE SÍMBOLOS & COMPONENTES (FASE 3)

---

### 1. Hierarquia de 4 Níveis com Resolução Determinística
1. **GLOBAL:** Símbolos normatizados ABNT NBR 5410, IEC 60617 e ANSI/IEEE públicos para todos os tenants (`is_global = true`).
2. **ORGANIZAÇÃO / TENANT:** Componentes e padronizações homologadas por empresa/planta (`tenant_id = get_current_tenant_id()`).
3. **PROJETO:** Materiais customizados para a especificação daquele cubículo/painel.
4. **USUÁRIO:** Variantes favoritas do engenheiro com parâmetros preferenciais.

---

### 2. Bornes Magnéticos e Comportamento Elétrico
Cada símbolo no catálogo `lib/engineering/symbols/library-catalog.ts` define explicitamente:
* **Bornes de Conexão Físicos (`terminals`):**
  - Numeração real de bornes (ex: `1/L1`, `2/T1`, `13`, `14`, `A1`, `A2`, `PE`).
  - Tipo elétrico permitido: `PHASE`, `NEUTRAL`, `PE`, `CONTROL`, `ANALOG`, `COMMUNICATION`.
  - Coordenadas relativas `(relativeX, relativeY)` e vetor de orientação (`NORTH`, `SOUTH`, `EAST`, `WEST`).
* **Especificações Técnicas de Placa:**
  - Tensão nominal $V$, Corrente nominal $I_n$, Potência ativa em $kW$ e $HP$, Fator de potência $\cos\phi$, Capacidade de ruptura $I_{cu}$ em $kA$.
* **Regras de Validação Integradas:**
  - `requiresUpstreamProtection`: Obrigatoriedade de disjuntor a montante.
  - `requiresGrounding`: Exigência de condutor de proteção equipotencial PE.
  - `interlockRequired`: Necessidade de intertravamento elétrico/mecânico.

---

### 3. Categorias Implementadas no Catálogo Universal
* **Fontes & MT/BT:** Redes concessionárias 13.8kV, Transformadores Dyn1 500kVA, Geradores Diesel GMG 250kVA, Nobreaks Industriais UPS 40kVA.
* **Proteção & Seccionamento:** Disjuntores Caixa Aberta ACB (até 1600A), Disjuntores Caixa Moldada MCCB 250A, Disjuntores-Motores MPW40 32A, Disjuntores Termomagnéticos DIN Curva C, DPS Classe II 45kA, Relés Térmicos RW27.
* **Manobra & Comando:** Contatores de Força CWB38 (AC-3 18.5kW), Botoeiras de Emergência NR-12 com trava e duplo canal.
* **Cargas & Motores:** Motores de Indução W22 IR3 (15kW / 20CV), Inversores de Frequência Vetoriais CFW11 (30kW), Chaves Soft Starter SSW07 (45A).
* **CLP & Automação:** CPUs Modulares SIMATIC S7-1200 com portas Ethernet/Profinet e canais I/O 24VDC.
* **Medição & TCs:** Multimedidores digitais Kron Mult-K com RS-485 Modbus RTU.
* **Aterramento & Barramentos:** Barramento Equipotencial Principal BEP / PE conforme NBR 5410.

---

### 4. Interface da Barra Lateral CAD (`components/cad/SymbolLibrarySidebar.tsx`)
* Seletor de visualização dupla: **Catálogo Normatizado ABNT/IEC** vs **Catálogo Rápido**.
* Filtros rápidos por categoria e busca instantânea por tag, potência, norma e fabricante (WEG, Schneider, Siemens, Kron, Clamper).
* Inserção com 1 clique diretamente no canvas com snap magnético automático nos bornes.
