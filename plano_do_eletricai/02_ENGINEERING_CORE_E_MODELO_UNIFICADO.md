# ELÉTRICAI — ENGINEERING CORE & MODELO DE DADOS UNIFICADO

---

### 1. PRINCÍPIO DA UNICIDADE DE ENTIDADE
No **ElétricAi**, um motor, um contator ou um disjuntor NÃO pode ser apenas um desenho no Unifilar, outro desenho solto no Multifilar e uma tag desacoplada no Ladder.
Eles são **a mesma entidade de engenharia** visualizada através de diferentes projeções técnicas.

```text
                        ┌──────────────────────────────────┐
                        │   ENTIDADE DE ENGENHARIA (TAG)   │
                        │        Ex: "KM01_MOTOR_BOMBA"    │
                        │           UUID: 550e8400-...     │
                        └─────────────────┬────────────────┘
                                          │
       ┌──────────────────┬───────────────┴───────────────┬──────────────────┐
       ▼                  ▼                               ▼                  ▼
PROJEÇÃO UNIFILAR   PROJEÇÃO MULTIFILAR             PROJEÇÃO LADDER     PROJEÇÃO SCADA
• Simbologia DIN    • Pinos de Potência (1, 3, 5)   • Bobina (%Q0.1)    • Widget Sinóptico
• Corrente In = 32A • Pinos de Força (2, 4, 6)      • Contato Selo (%I) • Alarme de Trip
• Drop ΔV = 1.2%    • Contatos Auxiliares (13-14)   • Temporizador TON  • Comando Liga/Desl.
```

---

### 2. ESTRUTURA DO MODELO DE DADOS DO PROJETO

```typescript
export interface EngineeringProject {
  id: string; // UUID v4
  tenantId: string;
  code: string; // Ex: "PRJ-IND-2026-001"
  name: string;
  description: string;
  nominalVoltage: string; // Ex: "13.8kV / 380V - 60Hz"
  normativeStandard: 'ABNT NBR 5410' | 'ABNT NBR 14039' | 'IEC 60364' | 'IEC 61439';
  createdAt: string;
  updatedAt: string;

  // Sub-sistemas e Módulos Estruturados
  distributionPanels: DistributionPanel[];
  circuits: ElectricalCircuit[];
  components: UnifiedComponent[];
  connections: UnifiedConnection[];
  cables: PowerCable[];
  plcRacks: PlcRackConfiguration[];
  ladderPrograms: PlcProgramConfiguration[];
  scadaTags: SharedEngineeringTag[];
  documents: ProjectDocumentReference[];
  engineeringValidations: ValidationReport;
}
```

---

### 3. COMPONENTE UNIFICADO (`UnifiedComponent`)

Cada componente físico contém propriedades de cálculo, comportamento elétrico, portas de conexão e metadados de fabricante:

```typescript
export interface UnifiedComponent {
  id: string;
  tag: string; // Identificador único na planta (Ex: "QF01", "KM01", "TR01")
  name: string;
  category: ComponentCategory; // 'TRANSFORMER' | 'BREAKER' | 'CONTACTOR' | 'MOTOR' | 'DRIVE' | etc.
  manufacturer: string; // Ex: "WEG", "Schneider", "Siemens"
  model: string; // Ex: "MPW40", "Tesys D", "CFW11"
  partNumber: string;

  // Propriedades Elétricas de Placa e Cálculo
  electricalSpecs: {
    ratedVoltageV: number;
    ratedCurrentA: number;
    operationalCurrentA: number;
    powerKw?: number;
    powerHp?: number;
    powerFactor?: number;
    efficiency?: number;
    frequencyHz: number;
    breakingCapacityKa?: number;
    tripCurve?: 'B' | 'C' | 'D';
    thermalSettingMinA?: number;
    thermalSettingMaxA?: number;
  };

  // Coordenadas e visualização no Canvas
  canvasPlacement: {
    sheetPage: number;
    x: number;
    y: number;
    rotation: number;
    zone: string; // Ex: "Coluna C, Linha 3"
  };

  // Portas Físicas e Bornes de Conexão
  terminals: Array<{
    id: string;
    terminalNumber: string; // Ex: "1/L1", "2/T1", "13", "14", "A1", "A2"
    terminalType: 'POWER_IN' | 'POWER_OUT' | 'AUX_NO' | 'AUX_NC' | 'COIL' | 'GROUND' | 'ANALOG';
    connectedWireId?: string;
  }>;

  // Vínculos Cruzados (Cross References)
  crossReferences: {
    ladderRungIds?: string[];
    scadaWidgetId?: string;
    plcChannelAddress?: string; // Ex: "%I0.3" ou "%Q0.1"
    upstreamBreakerTag?: string;
    downstreamMotorTag?: string;
  };
}
```

---

### 4. GERADOR INTELIGENTE DE TAGS E CROSS-REFERENCE
1. **Regras de Nomenclatura Normatizada:**
   - Disjuntores Gerais / Caixa Moldada: `QG01`, `QGBT_DJ01`
   - Disjuntores Termomagnéticos / Motores: `QF01`, `QM01`, `DJ01`
   - Contatores de Força e Manobra: `KM01`, `KM02`, `K1`
   - Relés Térmicos de Sobrecarga: `FT01`, `RT01`
   - Motores Elétricos de Indução: `M01`, `M02`, `MOT_BOMBA_01`
   - Transformadores MT/BT: `TR01`, `TRAFO_01`
   - Inversores de Frequência: `INV01`, `VFD01`
   - Entradas de CLP: `%I0.0` a `%I15.7`
   - Saídas de CLP: `%Q0.0` a `%Q15.7`
   - Memórias / Tags Internos: `%M10.0`, `TAG_AUT_START`
2. **Garantia de Unicidade no Projeto:**
   - O `EngineeringModelRegistry` impede tags duplicados em tempo de inserção.
   - Qualquer colisão gera renomeação automática com preservação de sufixo sequencial.
