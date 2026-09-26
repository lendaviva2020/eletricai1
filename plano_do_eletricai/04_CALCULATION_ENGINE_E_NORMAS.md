# ELÉTRICAI — CALCULATION ENGINE & NORMAS TÉCNICAS DETERMINÍSTICAS

---

### 1. PRINCÍPIO DA MATEMÁTICA PURA
1. **Nenhum cálculo de dimensionamento elétrico é delegado à inteligência artificial ou a previsões probabilísticas.**
2. **Todas as rotinas residem em módulos TypeScript puros (`lib/engineering/calculation-engine/`), com cobertura total de testes unitários e fórmulas rastreadas aos itens normativos da ABNT e IEC.**

---

### 2. CÁLCULO DE CORRENTE DE PROJETO ($I_B$) E NOMINAL ($I_N$)

#### 2.1 Cargas Trifásicas Equilibradas
$$I_b = \frac{P_{kW} \times 1000}{\sqrt{3} \times V_{LL} \times \cos\phi \times \eta}$$
Onde:
* $P_{kW}$: Potência ativa nominal em kW.
* $V_{LL}$: Tensão de linha trifásica (Ex: 380V ou 440V).
* $\cos\phi$: Fator de potência da carga (típico 0.85 a 0.92 para motores).
* $\eta$: Rendimento elétrico do equipamento (típico 0.88 a 0.95).

#### 2.2 Cargas Monofásicas
$$I_b = \frac{P_{kW} \times 1000}{V_{LN} \times \cos\phi \times \eta}$$

---

### 3. DIMENSIONAMENTO DE CONDUTORES (NBR 5410 ITEM 6.2.6)

O dimensionamento de cabos deve satisfazer **cumulativamente** quatro critérios normativos:

#### 3.1 Critério da Capacidade de Condução de Corrente (Ampacidade)
$$I_z \ge \frac{I_b}{f_t \times f_a \times f_h}$$
* $I_z$: Capacidade de condução de corrente tabelada do condutor (Tabelas 36 a 39 da NBR 5410).
* $f_t$: Fator de correção de temperatura ambiente (Tabela 40).
* $f_a$: Fator de agrupamento de circuitos em eletrodutos/eletrocalhas (Tabela 42).
* $f_h$: Fator de correção para harmônicas em condutores neutros.

#### 3.2 Critério da Queda de Tensão Admissível ($\Delta V$)
Para circuitos trifásicos com método aproximado resistivo/reativo:
$$\Delta V = \sqrt{3} \times I_b \times L \times (R \cdot \cos\phi + X \cdot \sin\phi)$$
$$\Delta V_{\%} = \frac{\Delta V}{V_{LL}} \times 100$$
* Limite normativo NBR 5410:
  - $\le 4\%$ a partir do quadro de distribuição principal (QGBT).
  - $\le 7\%$ considerando subestações próprias de média tensão.

#### 3.3 Critério de Sobrecarga e Proteção ($I_2$)
$$I_b \le I_n \le I_z$$
$$I_2 \le 1.45 \times I_z$$
Onde:
* $I_n$: Corrente nominal do dispositivo de proteção (disjuntor).
* $I_2$: Corrente que assegura a atuação efetiva do dispositivo no tempo convencional.

#### 3.4 Critério de Curto-Circuito Térmico (Tempo de Atuação)
Para correntes de curto-circuito de curta duração ($t \le 5s$):
$$S_{min} = \frac{I_{cc} \times \sqrt{t}}{k}$$
* $I_{cc}$: Corrente de curto-circuito simétrica presumida no ponto (A).
* $t$: Tempo de abertura da proteção em segundos.
* $k$: Constante do material condutor/isolação (ex: $k=115$ para cobre/PVC, $k=143$ para cobre/EPR-XLPE).

---

### 4. CÁLCULO DE CURTO-CIRCUITO PRESUMIDO (MÉTODO DAS IMPEDÂNCIAS IEC 60909)

1. **Impedância da Rede Concessionária:**
   $$Z_{rede} = \frac{1.1 \times V_{sec}^2}{S_{cc\_rede}}$$
2. **Impedância do Transformador MT/BT:**
   $$Z_{trafo} = \frac{z_{cc\%}}{100} \times \frac{V_{sec}^2}{S_{trafo}}$$
   $$R_{trafo} = \frac{P_{perdas\_W} \times V_{sec}^2}{S_{trafo}^2}$$
   $$X_{trafo} = \sqrt{Z_{trafo}^2 - R_{trafo}^2}$$
3. **Impedância dos Cabos Alimentadores:**
   $$R_{cabo} = \rho \times \frac{L}{S}$$
   $$X_{cabo} = x_0 \times L$$
4. **Corrente de Curto Trifásico Simétrico ($I_{k3}$):**
   $$I_{k3} = \frac{c \cdot V_{LL}}{\sqrt{3} \cdot \sqrt{(\sum R)^2 + (\sum X)^2}}$$

---

### 5. DIMENSIONAMENTO DE PARTIDAS DE MOTORES

#### 5.1 Partida Direta (DOL)
* Corrente de partida: $I_p = 6 \text{ a } 8 \times I_n$.
* Ajuste do Disjuntor-Motor: $I_{ajuste} = 1.0 \times I_n$ (ou $1.15 \times I_n$ com fator de serviço).
* Contator de Força: Categoria AC-3 selecionado para $I_e \ge I_n$.

#### 5.2 Partida Estrela-Triângulo
* Redução de corrente e conjugado em $1/3$ ($33\%$ do valor de partida direta).
* Contatores $K1$ e $K2$ (Triângulo): $I_{e} \ge 0.58 \times I_n$.
* Contator $K3$ (Estrela): $I_{e} \ge 0.33 \times I_n$.
* Temporização de transição $\lambda \to \Delta$: 5s a 10s baseada no tempo de aceleração mecânica.
