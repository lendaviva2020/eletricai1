// Types for EletricAI (VOLTAI) - Sistema Operacional Industrial SaaS

export type TenantRole = 'admin' | 'engineer' | 'member';

export interface Tenant {
  id: string;
  name: string;
  cnpj: string;
  location: string;
  plan: 'Industrial Pro' | 'Enterprise Multi-Plant' | 'Integrator OEM';
  currency: 'BRL';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: TenantRole;
  creaNumber?: string; // Registro CREA/CONFEA
  tenantId: string;
}

// SHARED TAG ENGINE
export type TagType = 'BOOL' | 'INT' | 'REAL' | 'TIME' | 'STRING';
export type TagDirection = 'INPUT' | 'OUTPUT' | 'INTERNAL' | 'ANALOG_IN' | 'ANALOG_OUT';

export interface SharedTag {
  id: string; // e.g. 'tag_q02'
  name: string; // e.g. 'Q02_COMPRESSOR'
  description: string;
  address: string; // e.g. '%Q0.2' or '%I0.1' or '%IW64'
  dataType: TagType;
  direction: TagDirection;
  currentValue: boolean | number | string;
  unit?: string; // e.g. 'A', 'V', 'kW', 'bar', '°C', 'Hz'
  alarmHigh?: number;
  alarmLow?: number;
  isAlarmActive?: boolean;
  circuitId?: string;
  linkedComponentId?: string;
}

// UNIFILAR & ELECTRICAL CIRCUIT TYPES
export type ComponentCategory = 
  | 'SOURCE_MT'         // Entrada de Média Tensão 13.8kV
  | 'TRANSFORMER_MT_BT' // Transformador MT/BT 13.8kV -> 380/220V
  | 'MAIN_BREAKER'      // Disjuntor Geral Caixa Moldada
  | 'BUSBAR'            // Barramento de Cobre
  | 'MOTOR_BREAKER'     // Disjuntor-motor
  | 'CONTACTOR'         // Contator Tripolar
  | 'THERMAL_RELAY'     // Relé de Sobrecarga Térmico
  | 'VFD'               // Inversor de Frequência
  | 'SOFT_STARTER'      // Soft Starter
  | 'MOTOR_3P'          // Motor de Indução Trifásico
  | 'DR_PROTECTION'     // Dispositivo Diferencial Residual (DR 30mA ou 300mA)
  | 'DPS_PROTECTION'    // Dispositivo de Proteção contra Surtos (DPS Classe II)
  | 'CAPACITOR_BANK'    // Banco de Capacitores para correção de fator de potência
  | 'DISTRIBUTION_BOARD';// Quadro Terminal

export interface ElectricalPort {
  id: string;
  type: 'in' | 'out' | 'bus';
  x: number;
  y: number;
  connectedTo?: string; // Port ID
}

export interface ElectricalComponent {
  id: string;
  tag: string; // Bound to Shared Tag
  name: string;
  category: ComponentCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  ports: ElectricalPort[];
  // Engineering specs per NBR 5410 / NBR 14039
  voltage: number; // Volts (e.g. 13800, 380, 220)
  nominalCurrent: number; // In (Amperes)
  operationalCurrent?: number; // Ib (Amperes)
  power?: number; // kW or kVA
  powerHp?: number; // CV or HP
  powerFactor?: number; // cos phi
  efficiency?: number; // rendimento %
  poles?: number; // 2, 3, 4
  breakingCapacity?: number; // Icu (kA)
  cableCrossSection?: number; // mm²
  cableType?: 'Cobre PVC 70°C' | 'Cobre EPR/XLPE 90°C' | 'Afumex 90°C';
  cableLength?: number; // meters
  voltageDropPercent?: number; // % ΔV
  isEnergized?: boolean;
  isTripped?: boolean;
  statusText?: string;
  manufacturer?: string; // WEG, Schneider, Prysmian
  partNumber?: string;
  unitCostBrl?: number;
}

export interface ElectricalConnection {
  id: string;
  fromComponentId: string;
  fromPortId: string;
  toComponentId: string;
  toPortId: string;
  isEnergized: boolean;
  voltage: number;
  wireGauge?: number; // mm²
}

// MULTIFILAR WIRE VIEW
export interface MultiWireConductor {
  phase: 'L1' | 'L2' | 'L3' | 'N' | 'PE' | 'DC+' | 'DC-';
  color: string; // Standard ABNT: L1 (Preto), L2 (Marrom/Preto), L3 (Cinza/Preto), N (Azul Claro), PE (Verde-Amarelo)
  voltage: number;
  isLive: boolean;
  currentAmps: number;
}

export interface MultiWireCircuit {
  id: string;
  circuitNumber: string;
  name: string;
  sourceTag: string;
  loadTag: string;
  systemType: '3F+N+PE' | '3F+PE' | '2F+PE' | '1F+N+PE' | '24VDC_CONTROL';
  conductors: MultiWireConductor[];
  conduitType: 'Eletrocalha Perfurada' | 'Eletroduto Embutido' | 'Leito para Cabos';
  lengthMeters: number;
  cableSpec: string;
}

// LADDER (IEC 61131-3)
export type LadderElementType = 
  | 'CONTACT_NO'   // —[ ]—
  | 'CONTACT_NC'   // —[/]—
  | 'COIL'         // —( )—
  | 'COIL_SET'     // —(S)—
  | 'COIL_RESET'   // —(R)—
  | 'TIMER_TON'    // [TON]
  | 'TIMER_TOF'    // [TOF]
  | 'TIMER_TP'     // [TP]
  | 'COUNTER_CTU'; // [CTU]

export interface LadderElement {
  id: string;
  type: LadderElementType;
  tagId: string;
  tagName: string;
  address: string; // %I0.0, %Q0.0, %M10.0
  presetTime?: string; // 'T#5s'
  elapsedTime?: string; // 'T#2.4s'
  counterPreset?: number;
  counterCurrent?: number;
  isEnergized: boolean;
  colIndex: number;
}

export interface LadderRung {
  id: string;
  number: number;
  title: string;
  comment?: string;
  isPowerFlowActive: boolean;
  elements: LadderElement[];
}

// FBD (Function Block Diagram)
export type FbdBlockType = 
  | 'AND' 
  | 'OR' 
  | 'NOT' 
  | 'XOR' 
  | 'SR_LATCH' 
  | 'TON' 
  | 'SCALE_AI' 
  | 'MOTOR_STARTER_BLOCK';

export interface FbdPin {
  id: string;
  name: string;
  type: 'BOOL' | 'REAL' | 'INT' | 'TIME';
  direction: 'in' | 'out';
  value: boolean | number;
  connectedWireId?: string;
}

export interface FbdBlock {
  id: string;
  type: FbdBlockType;
  title: string;
  x: number;
  y: number;
  inputs: FbdPin[];
  outputs: FbdPin[];
  parameters?: Record<string, string | number>;
}

export interface FbdWire {
  id: string;
  fromBlockId: string;
  fromPinId: string;
  toBlockId: string;
  toPinId: string;
  isActive: boolean;
}

// PLC RACK
export interface PlcSlot {
  slotNumber: number;
  moduleType: 'POWER_SUPPLY' | 'CPU' | 'DI_16' | 'DO_16' | 'AI_8' | 'AO_4' | 'COMM_MODBUS';
  name: string;
  partNumber: string;
  startAddress: string;
  endAddress: string;
  channelCount: number;
  status: 'OK' | 'FAULT' | 'SIMULATION';
  mappedTags: string[]; // Tag names
}

export interface PlcRackConfig {
  chassisName: string;
  model: 'EletricAI S7-Edge' | 'Siemens S7-1500 Compliant' | 'WEG PLC500 Series';
  ipAddress: string;
  subnetMask: string;
  cycleTimeMs: number;
  slots: PlcSlot[];
}

// SCADA & SCRIPT SANDBOX
export interface ScadaWidget {
  id: string;
  type: 'MOTOR_INDICATOR' | 'VALVE' | 'TANK_LEVEL' | 'ANALOG_GAUGE' | 'PUSH_BUTTON' | 'PILOT_LAMP' | 'BAR_GRAPH' | 'TREND_CHART';
  tagId: string;
  tagName: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  min?: number;
  max?: number;
  unit?: string;
}

export interface ScadaScriptLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  message: string;
}

// DIGITAL TWIN 3D & TELEMETRY
export interface TelemetryPoint {
  tagId: string;
  voltageL1L2: number;
  voltageL2L3: number;
  voltageL3L1: number;
  currentL1: number;
  currentL2: number;
  currentL3: number;
  frequencyHz: number;
  powerFactor: number;
  activePowerKw: number;
  temperatureCelsius: number;
  vibrationMmS?: number;
  breakerClosed: boolean;
  alarmTrip: boolean;
}

export interface DigitalTwinHotspot {
  id: string;
  tag: string;
  name: string;
  componentType: 'CUBICLE_INCOMING' | 'CUBICLE_FEEDER' | 'MOTOR_DRIVE' | 'TRANSFORMER';
  position3D: [number, number, number];
  telemetry: TelemetryPoint;
  warningStatus?: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

// BILL OF MATERIALS (BOM) & NBR 5410 NORMATIVE RECORD
export interface BomItem {
  id: string;
  itemNumber: number;
  tag: string;
  description: string;
  category: string;
  normReference: string; // e.g. 'NBR 5410 - 6.3.4.2'
  manufacturer: string;
  model: string;
  quantity: number;
  unit: string;
  unitPriceBrl: number;
  totalPriceBrl: number;
  deliveryTimeDays: number;
}

// AI GENERATIVE & PATCH DIFF PREVIEW
export interface PatchChange {
  action: 'ADD' | 'MODIFY' | 'REMOVE';
  targetType: 'COMPONENT' | 'CONNECTION' | 'TAG' | 'LADDER_RUNG' | 'CABLE_GAUGE';
  targetId: string;
  targetName: string;
  before?: Record<string, unknown>;
  after: Record<string, unknown>;
  technicalRationale: string;
  nbrNormReference: string;
}

export interface AiPatchProposal {
  id: string;
  title: string;
  summary: string;
  requestedPrompt: string;
  createdAt: string;
  changes: PatchChange[];
  safetyWarnings: string[];
  voltageDropImpact: string;
  costImpactBrl: number;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
}
