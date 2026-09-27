# ELÉTRICAI — MOTOR DE ENGENHARIA UNIFILAR & PERSISTÊNCIA RELACIONAL (FASE 4)

---

### 1. Visão Geral da Fase 4
A **Fase 4** integra profundamente o editor gráfico unifilar CAD ao banco de dados PostgreSQL do Supabase e ao motor matemático de engenharia elétrica em tempo real conforme as normas **ABNT NBR 5410** e **ABNT NBR 14039**.

---

### 2. Motor de Fluxo de Potência (`lib/engineering/unifilar/unifilar-engine.ts`)

O `UnifilarEngineeringEngine` executa de forma determinística:
1. **Identificação Topológica de Fontes de Potência:**
   - Detecta entradas de rede da concessionária (`SOURCE_MT`), transformadores (`TRANSFORMER_MT_BT`), geradores a diesel (`GENERATOR`) e nobreaks (`UPS`).
2. **Propagação de Potência por Árvore BFS:**
   - Rastreia a energização componente a componente de montante para jusante.
   - Disjuntores abertos ou acionados (`isTripped`) interrompem o fluxo de potência.
3. **Cálculo em Tempo Real da Corrente de Projeto ($I_b$):**
   - Para cargas trifásicas:
     $$I_b = \frac{P \times 1000}{\sqrt{3} \times V \times \cos\phi \times \eta}$$
4. **Cálculo da Queda de Tensão Acumulada ($\Delta V\%$):**
   - Para cada ramal ou alimentador:
     $$\Delta U = \sqrt{3} \times I_b \times (R \cos\phi + X \sin\phi)$$
     $$\Delta V\% = \frac{\Delta U}{V_{nominal}} \times 100$$
   - Limite normativo: $\Delta V \le 4.0\%$ para alimentadores e circuitos terminais (NBR 5410).
5. **Verificação Térmica de Ampacidade ($I_z \ge I_b$):**
   - Consulta a tabela normalizada NBR 5410 (Método B1/PVC/EPR) para garantir que a seção do condutor não sofra sobreaquecimento.

---

### 3. Canvas Unifilar Reativo (`components/unifilar/UnifilarCanvas.tsx`)

1. **Barra Superior de Telemetria de Engenharia (HUD):**
   - **Potência Instalada Total ($kW$):** Somatório dinâmico das cargas ativas no barramento.
   - **Corrente Operacional Total ($I_b$ em $A$):** Corrente total consumida pelo alimentador geral.
   - **Queda de Tensão Máxima ($\Delta V\%$):** Destaque da pior queda de tensão na rede com selo visual `NBR 5410 OK` (verde) ou `NBR 5410 > 4%` (vermelho).
   - **Alertas Normativos Ativos:** Contador de violações térmicas e de tensão com link direto para o painel de inspeção.
   - **Status de Persistência com Supabase:** Indicador de salvamento (`Sincronizado`, `Gravando no Banco...`, `Pendente`) com suporte a atalho manual `Ctrl+S` / `Cmd+S`.

2. **Renderização de Elementos no Diagrama:**
   - Exibição de $I_n$, $I_b$ dinâmico e $\Delta V\%$ na legenda de cada equipamento.
   - Halo de alerta pontilhado pulsante caso o circuito apresente $\Delta V > 4.0\%$.
   - Conexões energizadas com animação de fluxo de elétrons no modo simulação.

3. **Arrasto & Posicionamento Suave:**
   - Movimentação com snap magnético ao grid modular sem inflar o histórico de undo durante o arrasto.
   - Recálculo automático das posições absolutas dos bornes magnéticos (`ports`) ao mover o componente.

---

### 4. Ciclo de Persistência Relacional (Critério de Aceite)

1. **Auto-Save com Debounce:** Alterações na topologia ou propriedades ativam o estado `dirty` e são consolidadas no PostgreSQL em 1.8 segundos de ociosidade através de `saveFullProjectSnapshot`.
2. **Salvamento Imediato:** Botão manual na barra superior e atalho de teclado `Ctrl+S`.
3. **Recarregamento Íntegro (F5):** Ao atualizar a página ou alternar de projeto, `loadUserDataAndProjects` e `selectProjectAndOpen` consultam o banco relacional e restauram as coordenadas $(X, Y)$, bornes e parâmetros exatamente onde o engenheiro os deixou.
