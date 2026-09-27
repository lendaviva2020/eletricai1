# ELÉTRICAI — MOTOR MULTIFILAR 3P+N+PE & ROTEAMENTO SCHEMATIC (FASE 5)

---

### 1. Visão Geral da Fase 5
A **Fase 5** introduz o gerador e visualizador de esquemas elétricos multifilares trifásicos com neutro e condutor de proteção (**3P+N+PE**), implementando derivações normatizadas de motores industriais e conformidade estrita com a **ABNT NBR 5410** e **IEC 60947-4-1**.

---

### 2. Padrão Normativo de Identificação de Condutores (ABNT NBR 5410)

| Condutor | Função Elétrica | Cor Normalizada | Código Hex | Referência Normativa |
| :--- | :--- | :--- | :--- | :--- |
| **L1 (Fase R)** | Fase 1 do sistema trifásico | **Marrom / Âmbar** | `#D97706` | NBR 5410 item 6.1.5.3.1 |
| **L2 (Fase S)** | Fase 2 do sistema trifásico | **Preto** | `#475569` | NBR 5410 item 6.1.5.3.1 |
| **L3 (Fase T)** | Fase 3 do sistema trifásico | **Cinza** | `#94A3B8` | NBR 5410 item 6.1.5.3.1 |
| **N (Neutro)** | Retorno de corrente / Referência | **Azul-claro exclusivo** | `#0284C7` | NBR 5410 item 6.1.5.3.2 |
| **PE (Proteção)**| Aterramento de equipotencialização | **Verde / Verde-Amarelo** | `#10B981` | NBR 5410 item 6.1.5.3.3 |
| **+24VDC** | Alimentação positiva de comando | **Vermelho** | `#EF4444` | IEC 60204-1 / NBR 5410 |
| **0VDC** | Referência de comando CC | **Azul-escuro** | `#2563EB` | IEC 60204-1 |
| **Comando CA** | Circuito de comando 110V/220V CA | **Laranja** | `#F97316` | IEC 60204-1 |

---

### 3. Regra de Dimensionamento do Condutor PE (Tabela 58 da NBR 5410)

O motor calcula dinamicamente a seção do condutor de proteção ($S_{PE}$) em função da seção dos condutores de fase ($S$):

$$S_{PE} = \begin{cases} 
S & \text{se } S \le 16 \text{ mm}^2 \\
16 \text{ mm}^2 & \text{se } 16 < S \le 35 \text{ mm}^2 \\
\frac{S}{2} & \text{se } S > 35 \text{ mm}^2 
\end{cases}$$

---

### 4. Derivações para Partida de Motores Implementadas (`lib/engineering/multifilar/schematic-router.ts`)

1. **CCT 01 — Partida Direta (DOL) com Disjuntor-Motor:**
   - Carga: Compressor Parafuso 30cv / 22kW (42.5A, 380V).
   - Condutores de Fase: $10 \text{ mm}^2$ (Marrom, Preto, Cinza).
   - Condutor de Proteção PE: $10 \text{ mm}^2$ conectado diretamente à carcaça do motor.
   - Proteção Coordenada Tipo 2 (NBR IEC 60947-4-1).

2. **CCT 02 — Partida com Chave Reversora (KM1 Avanço / KM2 Recuo):**
   - Carga: Ponte Rolante / Talha 20cv / 15kW (29.5A, 380V).
   - Inversão de Fases: L1 &harr; L3 no contator KM2 para inversão de sentido de rotação.
   - Intertravamento Elétrico Cruzado com contatos auxiliares NF KM1 (21-22) e KM2 (21-22) para impedir curto-circuito bifásico acidental.

3. **CCT 03 — Acionamento com Inversor de Frequência VFD:**
   - Carga: Exaustor Industrial 10cv / 7.5kW (15.2A, 380V).
   - Cabo Especial: Quadripolar simétrico blindado (3F+PE) com aterramento $360^\circ$ em prensa-cabo EMC.
   - Controle vetorial PWM de 0 a 60Hz com rampa de desaceleração.

4. **CCT 04 — Partida Estrela-Triângulo (Y-&Delta;):**
   - Carga: Bomba Centrífuga 50cv / 37kW (70A, 380V).
   - 3 Contatores: KM1 (Linha), KM2 (Triângulo 380V), KM3 (Estrela 660V) + Relé Temporizador KT1.
   - Redução da corrente de pico de partida para $1/3$ de $I_{partida\_direta}$.

---

### 5. Recursos Interativos do Visualizador (`components/multifilar/MultifilarViewer.tsx`)
- **Simulação em Tempo Real:** Chaveamento de disjuntor principal, acionamento de contatores de avanço/recuo, simulação de disparo por sobrecarga térmica no relé bimetálico.
- **Animação de Elétrons Pulsante:** Visualização do fluxo de corrente quando o circuito está energizado e o motor em rotação.
- **Inspeção de Condutor:** Clique interativo em qualquer condutor para inspecionar corrente instantânea, bitola em mm², tensão e trecho de ligação.
- **Circuito de Comando 24VDC:** Diagrama esquemático lateral sincronizado exibindo laço de emergência, contato 95-96 do térmico, botoeiras liga/desliga e alimentação da bobina A1-A2.
