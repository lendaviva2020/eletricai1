# ELÉTRICAI — REGRAS DE VALIDAÇÃO DE ENGENHARIA (DOCS)

## 1. Módulos e responsabilidades

| Módulo | Arquivo | Papel |
| :--- | :--- | :--- |
| Inspeção estrutural do desenho | `lib/electrical-validation.ts` (`runFullElectricalValidation`) | TAG duplicada, componente órfão, fio flutuante, proteção de motor ausente, queda de tensão do **componente**, Icu baixo, DPS ausente. |
| Regras de engenharia estática (FASE 11) | `lib/engineering/validation/electrical-rules.ts` (`runEngineeringRuleValidation`) | Sobrecarga `Ib > In`, ausência de PE/PEN, queda de tensão do **condutor**, ampacidade da bitola, consistência de tensão e dado de corrente ausente. |

Os dois módulos são **complementares** e devem ser executados em conjunto. Nenhum substitui o outro.

## 2. Níveis de alerta (severidade)

* **INFO:** dado ausente (`DADO_NAO_INFORMADO`) ou situação informativa que não impede o projeto.
* **WARNING:** inconsistência que exige revisão, mas não invalida o circuito por si só.
* **ERROR:** violação de critério normativo (sobrecarga, queda de tensão > 4%, `Iz < Ib`).
* **CRITICAL:** condição de risco elétrico (ausência de condutor de proteção; `Icu < Icc`).

Todo item emitido contém `reason` (por que é problema) e `suggestion` (ação corretiva).

## 3. Regras do módulo FASE 11

| Código | Severidade | Critério |
| :--- | :---: | :--- |
| `ENG_IB_GT_IN` | ERROR | Corrente de projeto `Ib` maior que a corrente nominal `In` do equipamento/dispositivo (NBR 5410 item 5.3.4). |
| `ENG_PE_MISSING` | CRITICAL | Equipamento que exige proteção (motor, quadro, inversor, transformador ou `phases = 3F+N+PE`) sem conexão com fase `PE` ou `PEN` (NBR 5410 item 5.1). |
| `ENG_VDROP_HIGH` | ERROR | Queda de tensão do condutor superior a 4% (padrão; limite configurável pelo engenheiro) (NBR 5410 item 6.2.7). |
| `ENG_CABLE_AMPACITY` | ERROR / INFO | `Ib > Iz` da bitola informada; ou seção fora da tabela comercial de 1,5–240 mm² (NBR 5410 item 6.2.5). |
| `ENG_VOLTAGE_MISMATCH` | WARNING | Tensão nominal do equipamento divergente da tensão do condutor conectado. |
| `ENG_CURRENT_UNKNOWN` | INFO | Condutor com bitola informada mas sem corrente de projeto/nominal no equipamento de origem. |

Testes executados: `__tests__/engineering/validation/electrical-rules.test.ts`.

## 4. Limitações declaradas

1. **VALOR_ASSUMIDO** — a ampacidade é consultada pela coluna **método B1 / PVC**, pois o modelo de dados da conexão não informa método de instalação. Se o projeto usar outro método, o resultado pode ser conservador ou não conservador.
2. **VALOR_ASSUMIDO** — limite de queda de tensão padrão de 4% (parâmetro `maxVoltageDropPercent` permite ajuste explícito pelo engenheiro).
3. **DADO_NAO_INFORMADO** — sem `operationalCurrent`/`nominalCurrent`, as regras de sobrecarga e ampacidade **não são avaliadas** e o módulo emite `ENG_CURRENT_UNKNOWN`.
4. A validação é **estática**: não substitui cálculo de curto-circuito, coordenação de proteções, ensaio de comissionamento nem análise de responsável técnico.
5. Nenhum alerta deste módulo aciona, desativa ou altera equipamento físico.
