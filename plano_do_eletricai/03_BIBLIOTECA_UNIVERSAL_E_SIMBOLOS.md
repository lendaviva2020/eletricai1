# ELÉTRICAI — BIBLIOTECA UNIVERSAL DE SÍMBOLOS & COMPONENTES

---

### 1. ARQUITETURA HIERÁRQUICA DA BIBLIOTECA

A biblioteca do **ElétricAi** é estruturada em 4 níveis de visibilidade e herança com prioridade determinística:

```text
┌────────────────────────────────────────────────────────┐
│ 1. GLOBAL (Normalizada ABNT NBR 5410 / IEC 60617/ANSI) │
├────────────────────────────────────────────────────────┤
│ 2. ORGANIZAÇÃO / TENANT (Catálogo da Empresa)          │
├────────────────────────────────────────────────────────┤
│ 3. PROJETO (Especificação daquela Planta Industrial)   │
├────────────────────────────────────────────────────────┤
│ 4. USUÁRIO (Símbolos Customizados e Favoritos)         │
└────────────────────────────────────────────────────────┘
```

Se um símbolo existir no nível do **Projeto**, ele sobrescreve a variante da **Organização**, que por sua vez sobrescreve o padrão **Global**.

---

### 2. DEFINIÇÃO COMPLETA DE UM SÍMBOLO TÉCNICO

Um símbolo no **ElétricAi** NÃO é apenas um SVG estático. Ele encapsula:
1. **Definição Gráfica Vetorial:** Caminhos SVG com dimensões normalizadas em grid modular (módulo de 10mm ou 20px).
2. **Bornes e Pontos de Conexão (Terminals):** Coordenadas relativas `(x, y)` com tipos elétricos definidos (Entrada, Saída, Força, Comando, Terra).
3. **Comportamento Elétrico & Lógico:** Resposta a energização, abertura/fechamento mecânico, saturação térmica.
4. **Metadados de Fabricante:** Códigos de catálogo, curva de disparo, capacidade de ruptura em kA.

```typescript
export interface UniversalSymbolDefinition {
  id: string;
  category: SymbolCategory;
  subcategory: string;
  standard: 'ABNT_NBR' | 'IEC_60617' | 'ANSI_IEEE';
  name: string;
  description: string;
  version: string;

  // Visualização e Renderização
  viewBox: string; // Ex: "0 0 80 80"
  svgPaths: string; // Definição vetorial sem estilos fixos (utiliza currentColor e variáveis elétricas)

  // Pontos de Conexão com Snap Magnético
  connectionPoints: Array<{
    id: string;
    terminalNumber: string; // "1", "2", "L1", "A1", etc.
    relativeX: number;
    relativeY: number;
    direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
    allowedPinTypes: ('PHASE' | 'NEUTRAL' | 'PE' | 'DC_POS' | 'DC_NEG' | 'CONTROL')[];
  }>;

  // Regras de Validação Embutidas
  validationRules: {
    requiresUpstreamProtection: boolean;
    requiresGrounding: boolean;
    maxContinuousCurrentA?: number;
    voltageLevelMaxV: number;
  };
}
```

---

### 3. CATEGORIAS DE SÍMBOLOS COBERTAS

#### 3.1 Fontes e Geração
* Rede da Concessionária (MT / BT)
* Transformadores a Óleo e a Seco (Delta-Estrela, Estrela-Estrela, Aterramento)
* Geradores Diesel de Emergência (com chave de transferência ATS)
* Bancos de Baterias Industriais e Nobreaks (UPS On-line trifásicos)
* Sistemas Solares Fotovoltaicos (Inversores Grid-Tie e String Boxes)

#### 3.2 Proteção e Seccionamento
* Disjuntores Caixa Moldada (MCCB) com unidade de disparo eletrônica
* Disjuntores em Caixa Aberta (ACB) para entrada de QGBT (até 6300A)
* Disjuntores-Motores (MPW) com proteção magnética contra curto e térmica ajustável
* Disjuntores Termomagnéticos DIN (curvas B, C e D)
* Fusíveis tipo NH (gG / aM) e Diazed
* Dispositivos de Proteção contra Surtos (DPS Classe I, II e III)
* Interruptores e Relés Diferenciais Residuais (DR / IDR / RDT)

#### 3.3 Manobra e Comando
* Contatores de Força Tripolares (Categorias AC-3 e AC-4)
* Contatores Auxiliares com blocos temporizados pneumáticos
* Chaves Seccionadoras sob Carga com e sem porta-fusível
* Botoeiras de Comando (NA, NF, Comutadoras 2 e 3 posições)
* Botoeiras de Emergência com trava tipo cogumelo e monitoramento de ruptura
* Relés de Segurança com duplo canal para atendimento à NR-12

#### 3.4 Cargas e Motores
* Motores de Indução Trifásicos (MIT - 4 polos, 6 polos, carcaça W22 WEG)
* Inversores de Frequência Vetoriais com bypass integrado
* Chaves de Partida Suave (Soft Starters) com contatores de bypass
* Cargas Resistivas, Fornos de Indução e Bancos de Resistências
* Painéis de Iluminação Industrial e Tomadas de Serviço 3P+N+T

#### 3.5 Automação IEC 61131-3 & CLP
* Racks e CPUs modulares (Siemens S7-1200/1500, WEG PLC300, Schneider M241, Rockwell ControlLogix)
* Módulos de Entradas Digitais (24VDC tipo Sink/Source)
* Módulos de Saídas Digitais (Relé e Transistor 24VDC)
* Módulos de Entradas Analógicas (4-20mA, 0-10V, PT100/RTD, Termopares J/K)
* Módulos de Saídas Analógicas (4-20mA proporcional para válvulas de controle)
* Elementos Ladder: Contatos NA/NF, Bobinas Set/Reset, Blocos TON, TOF, TP, CTU, CTD, Comparadores e Funções Matemáticas.

---

### 4. FABRICANTES CATALOGADOS
* **WEG:** Motores W22/W21, Disjuntores MPW/DWA, Contatores CWB/CWM, Inversores CFW08/CFW11/CFW500, Soft Starters SSW06/SSW07.
* **Schneider Electric:** Linha TeSys (D, K, F), Disjuntores Compact NSX, Acti9, CLPs Modicon M221/M241, Inversores Altivar ATV320/ATV630.
* **Siemens:** Linha Sirius (3RT, 3RV), Disjuntores Sentron 3VA/3WL, CLPs SIMATIC S7-1200 e S7-1500, Inversores Sinamics G120.
* **Rockwell Automation / Allen-Bradley:** Contatores Bulletin 100-C, CLPs Micro800 e CompactLogix, Inversores PowerFlex 525/755.
* **ABB:** Disjuntores Tmax XT, Contatores AF, Inversores ACS580/ACS880.
