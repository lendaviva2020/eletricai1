# ELÉTRICAI — CALCULATION ENGINE (DOCS)

## 1. Escopo e localização dos módulos

| Módulo | Arquivo | Responsabilidade |
| :--- | :--- | :--- |
| Tabelas e fatores NBR 5410 | `lib/nbr5410.ts` | Ampacidade (1,5–240 mm²), fatores de agrupamento (Tabela 42), fator de temperatura (Tabela 40), `Ib`, queda de tensão e dimensionamento automático. |
| Fórmulas auxiliares | `lib/electrical-calc.ts` | Potências, queda de tensão detalhada, Icc de transformador, banco de capacitores e coordenação `Ib ≤ In ≤ Iz`. |
| Dimensionamento (FASE 10) | `lib/engineering/calculation-engine/cable-sizing.ts` | Memória de cálculo cumulativa (ampacidade, queda de tensão, sobrecarga) e seção mínima por curto térmico. |
| Curto-circuito (FASE 10) | `lib/engineering/calculation-engine/short-circuit.ts` | Método das impedâncias IEC 60909: rede, transformador, cabo, `I_k3` e `I_cc` de transformador. |

Os módulos da FASE 10 são **puros e determinísticos**: reutilizam as tabelas/fórmulas já existentes em vez de duplicá-las, e nenhum cálculo é delegado a IA.

## 2. Fórmulas normatizadas implementadas

* **Corrente de projeto:** `Ib = P·1000 / (√3 · V · cos φ · η)` (trifásico).
* **Ampacidade:** `Iz ≥ Ib / (f_t · f_a)` — NBR 5410 item 6.2.5.
* **Queda de tensão:** `ΔU = √3 · Ib · (R·cos φ + X·sen φ)`; limite padrão 4% — NBR 5410 item 6.2.7.
* **Sobrecarga/proteção:** `Ib ≤ In ≤ Iz` e `I2 ≤ 1,45 · Iz` — NBR 5410 item 5.3.4.
* **Curto térmico:** `S_min = (Icc · √t) / k` com `k = 115` (cobre/PVC) e `k = 143` (cobre/EPR-XLPE), `t ≤ 5 s`.
* **Curto-circuito IEC 60909:**
  * `Z_rede = 1,1 · V_sec² / S_cc`
  * `Z_trafo = (z%/100) · V_sec² / S_trafo`; `R_trafo = P_perdas · V_sec² / S_trafo²`; `X_trafo = √(Z² − R²)`
  * `R_cabo = (R_Ω/km / 1000) · L`; `X_cabo = (X_Ω/km / 1000) · L`
  * `I_k3 = (c · V_LL) / (√3 · √((ΣR)² + (ΣX)²))`
  * `I_cc(sec) = I_n(sec) / (z%/100)`

Consulte `/plano_do_eletricai/04_CALCULATION_ENGINE_E_NORMAS.md` para a formulação matemática integral.

## 3. Testes executados

* `__tests__/engineering/calculation/nbr5410.test.ts` — tabelas e dimensionamento automático.
* `__tests__/engineering/calculation/cable-sizing.test.ts` — memória de cálculo, fatores de correção, coordenação e curto térmico.
* `__tests__/engineering/calculation/short-circuit.test.ts` — impedâncias de rede/transformador/cabo, `I_k3`, `I_cc`.

Comando: `npx jest __tests__/engineering/calculation` (resultado registrado no relatório de execução).

## 4. Limitações declaradas (obrigatórias)

1. **VALOR_ASSUMIDO** — os valores de `NBR5410_AMPACITY_TABLE`, os fatores `f_t`/`f_a`, `k = 115/143` e o fator de tensão `c = 1,0` (redes ≤ 1 kV) **não foram conferidos contra a edição impressa das normas** nesta execução.
2. **DADO_NAO_INFORMADO** — potência de curto-circuito da rede (`S_cc`), perdas em carga do transformador (`P_perdas`) e impedância `z%` são entradas do engenheiro; quando ausentes, a função não devolve resultado numérico e sinaliza explicitamente o dado faltante.
3. **Casos de teste** são dados de verificação matemática do motor de cálculo; **não** representam uma instalação real e **não** constituem projeto elétrico aprovado.
4. Nenhum resultado deste módulo altera equipamento físico: a aplicação de bitola/disjuntor em um projeto depende de revisão e aprovação do responsável técnico.
