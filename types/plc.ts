// IEC 61131-3:2025 Standard PLC Data Types & Architecture Definition
export type IecDataType =
  // Bit Strings
  | 'BOOL'
  | 'BYTE'
  | 'WORD'
  | 'DWORD'
  | 'LWORD'
  // Signed Integers
  | 'SINT'
  | 'INT'
  | 'DINT'
  | 'LINT'
  // Unsigned Integers
  | 'USINT'
  | 'UINT'
  | 'UDINT'
  | 'ULINT'
  // Real Reals
  | 'REAL'
  | 'LREAL'
  // Time and Dates
  | 'TIME'
  | 'DATE'
  | 'TOD'
  | 'DT'
  // Strings
  | 'STRING'
  | 'WSTRING';

export type VariableScope = 'VAR_GLOBAL' | 'VAR_INPUT' | 'VAR_OUTPUT' | 'VAR_IN_OUT' | 'VAR_LOCAL' | 'VAR_TEMP' | 'VAR_EXTERNAL';

export interface PlcVariable {
  id: string;
  name: string;
  dataType: IecDataType;
  address?: string; // e.g. %I0.0, %Q0.0, %M10.0, %IW64, %QW128
  initialValue: string | number | boolean;
  currentValue: string | number | boolean;
  forcedValue?: string | number | boolean;
  isForced: boolean;
  isRetentive: boolean; // RETAIN (IEC 61131-3)
  isConstant: boolean;  // CONSTANT
  scope: VariableScope;
  comment?: string;
  description?: string;
  unit?: string;
  engineeringMin?: number;
  engineeringMax?: number;
  unifilarComponentTag?: string; // Cross-link to Unifilar (e.g. MTR01_COMPRESSOR)
}

// I/O Configuration Model (PLC -> Rack -> Slot -> Module -> Channel)
export type IoChannelType = 'DI' | 'DO' | 'AI' | 'AO' | 'HSC_IN' | 'PWM_OUT' | 'COMM';

export interface IoChannelConfig {
  id: string;
  channelIndex: number; // 0..15
  address: string;      // %I0.0, %Q0.0
  name: string;
  tag: string;          // e.g. BTN_EMERGENCIA
  type: IoChannelType;
  unit?: string;
  rangeMin?: number;
  rangeMax?: number;
  state: boolean | number;
  description?: string;
}

export interface IoModuleConfig {
  id: string;
  slotNumber: number;
  name: string;
  catalogNumber: string;
  type: 'POWER_SUPPLY' | 'CPU' | 'DI_16' | 'DO_16' | 'AI_8' | 'AO_4' | 'COMM_MODBUS';
  channels: IoChannelConfig[];
  status: 'OK' | 'FAULT' | 'SIMULATION' | 'FORCED';
}

export interface PlcRackArchitecture {
  id: string;
  rackName: string;
  chassisModel: string;
  ipAddress: string;
  subnetMask: string;
  cycleTimeTargetMs: number;
  modules: IoModuleConfig[];
}

// IEC 61131-3 Elementary Ladder Contact & Coil Types
export type LadderContactType =
  | 'CONTACT_NO'          // —[ ]—
  | 'CONTACT_NC'          // —[/]—
  | 'CONTACT_POS_EDGE'    // —[P]—
  | 'CONTACT_NEG_EDGE';   // —[N]—

export type LadderCoilType =
  | 'COIL_NORMAL'         // —( )—
  | 'COIL_NEGATED'        // —(/)—
  | 'COIL_SET'            // —(S)—
  | 'COIL_RESET'          // —(R)—
  | 'COIL_POS_EDGE'       // —(P)—
  | 'COIL_NEG_EDGE';      // —(N)—

// Timer & Counter IEC Standard Blocks
export type LadderTimerType = 'TON' | 'TOF' | 'TP' | 'TONR';
export type LadderCounterType = 'CTU' | 'CTD' | 'CTUD';

// Comparator Operators
export type LadderCompareOperator = 'EQ' | 'NE' | 'GT' | 'LT' | 'GE' | 'LE'; // = , <> , > , < , >= , <=

// Math Function Operators
export type LadderMathOperator = 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'MOD' | 'ABS' | 'SQRT' | 'MIN' | 'MAX' | 'LIMIT';

// Master Element Union
export type PlcLadderElementType =
  | 'CONTACT'
  | 'COIL'
  | 'TIMER'
  | 'COUNTER'
  | 'COMPARE'
  | 'MATH'
  | 'FUNCTION_BLOCK'
  | 'BRANCH_START'
  | 'BRANCH_END';

export interface PlcLadderElement {
  id: string;
  elementType: PlcLadderElementType;
  contactType?: LadderContactType;
  coilType?: LadderCoilType;
  timerType?: LadderTimerType;
  counterType?: LadderCounterType;
  compareOp?: LadderCompareOperator;
  mathOp?: LadderMathOperator;
  
  // Binding & Variable linkage
  variableName: string; // Associated TAG or Variable name
  address?: string;     // IEC address (%I0.0, %Q0.2, etc.)
  
  // Element Layout Coordinates in Grid
  row: number; // 0..N (within the rung branches)
  col: number; // 0..M (grid column position, typically 0..5 for logic, 6 for coils)
  
  // Dynamic Simulation State
  isEnergized: boolean;  // Current power flow across this component
  hasBreakpoint?: boolean;
  isForced?: boolean;
  forcedValue?: boolean | number;

  // Block parameters for Timers
  timerInstance?: string;
  presetTimeMs?: number; // e.g. 5000 ms
  elapsedTimeMs?: number; // e.g. 2100 ms
  timerQ?: boolean;

  // Block parameters for Counters
  counterInstance?: string;
  counterPresetPv?: number;
  counterCurrentCv?: number;
  counterQu?: boolean;
  counterQd?: boolean;

  // Block parameters for Compare & Math
  in1Value?: number | string;
  in2Value?: number | string;
  in3Value?: number | string; // for LIMIT
  outValue?: number | string;
  destVariable?: string;      // Target variable to store Math/Result
  
  comment?: string;
}

// Ladder Rung Model (IEC 61131-3 Network / Rung)
export interface PlcLadderRung {
  id: string;
  rungNumber: number;
  title: string;
  description?: string;
  comment?: string;
  isEnabled: boolean;
  isCollapsed?: boolean;
  hasBreakpoint?: boolean;
  
  // Evaluation runtime result
  isPowerFlowActive: boolean;
  diagnosticStatus: 'NORMAL' | 'WARNING' | 'ERROR';
  diagnosticMessage?: string;
  
  elements: PlcLadderElement[];
}

// POU (Program Organization Unit) Architecture
export type PouType = 'PROGRAM' | 'FUNCTION' | 'FUNCTION_BLOCK';

export interface PlcPou {
  id: string;
  name: string;
  type: PouType;
  language: 'LD' | 'ST' | 'FBD' | 'SFC';
  description: string;
  version: string;
  author: string;
  dateCreated: string;
  lastModified: string;
  revision: number;
  rungs: PlcLadderRung[];
  localVariables: PlcVariable[];
}

// Master Program & Resource Definition
export interface PlcProgramConfiguration {
  id: string;
  projectName: string;
  standardReference: 'IEC 61131-3:2025';
  version: string;
  author: string;
  revision: string;
  date: string;
  comments: string;
  
  // Architecture Hierarchy
  rack: PlcRackArchitecture;
  globalVariables: PlcVariable[];
  pous: PlcPou[];
  activePouId: string;
  
  // Scan Execution Configuration
  scanTimeMs: number;
  actualScanTimeMs: number;
  cycleCount: number;
  executionMode: 'OFFLINE' | 'SIMULATION' | 'ONLINE';
  executionStatus: 'RUN' | 'STOP' | 'PAUSE' | 'STEP';
  
  // Interlocks & Safety Matrices
  interlocks: Array<{
    id: string;
    sourceTag: string;
    targetTag: string;
    condition: 'BLOCKS' | 'TRIPS' | 'STANDBY_SWITCH';
    description: string;
  }>;

  // Alarms
  alarms: Array<{
    id: string;
    tag: string;
    condition: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    isActive: boolean;
    timestamp: string;
    description: string;
  }>;

  // Recipes / Process Parameters
  recipes: Array<{
    id: string;
    name: string;
    parameters: Record<string, number | string>;
  }>;
}

// Cross Reference Link Model
export interface PlcCrossReferenceItem {
  variableName: string;
  address?: string;
  pouName: string;
  rungNumber: number;
  elementType: PlcLadderElementType;
  elementId: string;
  accessMode: 'READ' | 'WRITE' | 'READ_WRITE';
}

// Watch Table Item
export interface PlcWatchItem {
  id: string;
  variableName: string;
  dataType: IecDataType;
  address?: string;
  currentValue: string | number | boolean;
  isForced: boolean;
  forcedValue?: string | number | boolean;
  status: 'GOOD' | 'FORCED' | 'ERROR';
  description?: string;
}

// Force Table Item
export interface PlcForceItem {
  id: string;
  variableName: string;
  forcedValue: string | number | boolean;
  currentPhysicalValue: string | number | boolean;
  appliedBy: string;
  timestamp: string;
  notes: string;
}

// Diagnostics Issue Model
export type PlcDiagnosticSeverity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO';

export interface PlcDiagnosticIssue {
  id: string;
  severity: PlcDiagnosticSeverity;
  code: string;
  title: string;
  description: string;
  pouId?: string;
  pouName?: string;
  rungNumber?: number;
  elementId?: string;
  variableName?: string;
  suggestion: string;
}

// Audit Trail Log
export interface PlcAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'FORCE' | 'UNFORCE' | 'RUN' | 'STOP' | 'AI_PATCH' | 'IMPORT' | 'EXPORT';
  target: string;
  details: string;
}

// Trend / Trace Data Point
export interface PlcTraceSample {
  timestamp: number;
  cycle: number;
  values: Record<string, number | boolean>;
}
