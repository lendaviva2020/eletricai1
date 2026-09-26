// ============================================================================
// ELÉTRICAI — UNIVERSAL SYMBOL LIBRARY CATALOG (FASE 3)
// Biblioteca padronizada ABNT NBR 5410 / IEC 60617 / ANSI com bornes magnéticos,
// regras de validação elétrica e comportamento de engenharia.
// ============================================================================

import { ComponentCategory } from '@/types/electrical';

export type SymbolStandard = 'ABNT_NBR' | 'IEC_60617' | 'ANSI_IEEE';

export type TerminalPinType = 'PHASE' | 'NEUTRAL' | 'PE' | 'DC_POS' | 'DC_NEG' | 'CONTROL' | 'ANALOG' | 'COMMUNICATION';

export interface SymbolTerminalPoint {
  id: string;
  terminalNumber: string; // Ex: '1/L1', '2/T1', '13', '14', 'A1', 'A2', 'PE'
  relativeX: number; // Coordenada X relativa ao centro ou canto do símbolo (px)
  relativeY: number; // Coordenada Y relativa (px)
  direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
  allowedPinTypes: TerminalPinType[];
  label: string;
}

export interface UniversalSymbolItem {
  id: string;
  category: 
    | 'FONTES'
    | 'PROTECAO'
    | 'COMANDO'
    | 'CARGAS'
    | 'MEDICAO'
    | 'CLP_AUTOMACAO'
    | 'CONEXAO'
    | 'ATERRAMENTO'
    | 'COMUNICACAO';
  subcategory: string;
  name: string;
  shortDescription: string;
  standard: SymbolStandard;
  standardReference: string; // Ex: 'ABNT NBR 5410 / IEC 60617-06-09'
  tagPrefix: string; // Ex: 'TR', 'QF', 'KM', 'M', 'PLC'
  defaultCategory: ComponentCategory;
  width: number;
  height: number;
  viewBox: string;
  svgPaths: string; // Definição vetorial sem estilos rígidos
  terminals: SymbolTerminalPoint[];
  defaultSpecs: {
    voltageV: number;
    nominalCurrentA: number;
    powerKw?: number;
    powerHp?: number;
    powerFactor?: number;
    breakingCapacityKa?: number;
    tripCurve?: 'B' | 'C' | 'D' | 'MA';
    thermalMinA?: number;
    thermalMaxA?: number;
    poles?: number;
    phases?: string;
    cableSectionMm2?: number;
    manufacturer?: string;
    model?: string;
    partNumber?: string;
  };
  validationRules: {
    requiresUpstreamProtection: boolean;
    requiresGrounding: boolean;
    maxContinuousCurrentA?: number;
    voltageLevelMaxV: number;
    interlockRequired?: boolean;
  };
}

export const UNIVERSAL_SYMBOL_CATALOG: UniversalSymbolItem[] = [
  // ==========================================
  // 1. FONTES E GERAÇÃO
  // ==========================================
  {
    id: 'sym_rede_concessionaria_mt',
    category: 'FONTES',
    subcategory: 'Entrada de Energia',
    name: 'Rede Concessionária MT (13.8 kV)',
    shortDescription: 'Ponto de Conexão à Concessionária de Alta/Média Tensão',
    standard: 'ABNT_NBR',
    standardReference: 'ABNT NBR 14039 / IEC 60617-02-01',
    tagPrefix: 'ENTRADA',
    defaultCategory: 'SOURCE_MT',
    width: 140,
    height: 70,
    viewBox: '0 0 140 70',
    svgPaths: `
      <rect x="10" y="10" width="120" height="45" rx="4" fill="#1A202C" stroke="#3B82F6" stroke-width="2"/>
      <path d="M30 32 L50 20 L50 45 L70 20 L70 45 L90 32" stroke="#60A5FA" stroke-width="2.5" fill="none"/>
      <circle cx="70" cy="55" r="3" fill="#3B82F6"/>
    `,
    terminals: [
      { id: 't_out', terminalNumber: 'MT-OUT', relativeX: 70, relativeY: 55, direction: 'SOUTH', allowedPinTypes: ['PHASE'], label: 'Saída 13.8kV' }
    ],
    defaultSpecs: {
      voltageV: 13800,
      nominalCurrentA: 200,
      phases: '3F',
      manufacturer: 'Concessionária Local',
      model: 'Ramal Aéreo MT 13.8kV'
    },
    validationRules: {
      requiresUpstreamProtection: false,
      requiresGrounding: true,
      voltageLevelMaxV: 34500
    }
  },
  {
    id: 'sym_transformador_dyn1',
    category: 'FONTES',
    subcategory: 'Transformadores',
    name: 'Transformador MT/BT (Dyn1 500kVA)',
    shortDescription: 'Trafo Trifásico Delta-Estrela 13.8kV / 380-220V',
    standard: 'ABNT_NBR',
    standardReference: 'ABNT NBR 5410 / IEC 60617-06-09',
    tagPrefix: 'TR',
    defaultCategory: 'TRANSFORMER_MT_BT',
    width: 140,
    height: 90,
    viewBox: '0 0 140 90',
    svgPaths: `
      <circle cx="70" cy="35" r="24" fill="none" stroke="#60A5FA" stroke-width="2.5"/>
      <circle cx="70" cy="55" r="24" fill="none" stroke="#10B981" stroke-width="2.5"/>
      <path d="M55 35 L70 20 L85 35 Z" stroke="#60A5FA" stroke-width="1.5" fill="none"/>
      <path d="M70 45 L70 65 M60 55 L80 55" stroke="#10B981" stroke-width="1.5" fill="none"/>
    `,
    terminals: [
      { id: 't_in', terminalNumber: '1U-1V-1W', relativeX: 70, relativeY: 10, direction: 'NORTH', allowedPinTypes: ['PHASE'], label: 'Primário 13.8kV' },
      { id: 't_out', terminalNumber: '2U-2V-2W-2N', relativeX: 70, relativeY: 80, direction: 'SOUTH', allowedPinTypes: ['PHASE', 'NEUTRAL'], label: 'Secundário 380V' }
    ],
    defaultSpecs: {
      voltageV: 380,
      nominalCurrentA: 760,
      powerKw: 500,
      powerFactor: 0.92,
      breakingCapacityKa: 35,
      phases: '3F+N+PE',
      manufacturer: 'WEG',
      model: 'Trafo a Óleo 500kVA Dyn1'
    },
    validationRules: {
      requiresUpstreamProtection: true,
      requiresGrounding: true,
      voltageLevelMaxV: 15000
    }
  },
  {
    id: 'sym_gerador_diesel',
    category: 'FONTES',
    subcategory: 'Geração de Emergência',
    name: 'Grupo Gerador Diesel (GMG 250kVA)',
    shortDescription: 'Gerador de Emergência com Chave de Transferência Automática',
    standard: 'ABNT_NBR',
    standardReference: 'ABNT NBR 5410 / IEC 60617-06-02',
    tagPrefix: 'GG',
    defaultCategory: 'GENERATOR',
    width: 140,
    height: 80,
    viewBox: '0 0 140 80',
    svgPaths: `
      <circle cx="70" cy="40" r="28" fill="#1E293B" stroke="#F59E0B" stroke-width="2.5"/>
      <text x="70" y="47" font-size="20" font-weight="bold" fill="#F59E0B" text-anchor="middle">G</text>
      <path d="M50 40 L60 30 M80 50 L90 40" stroke="#F59E0B" stroke-width="2"/>
    `,
    terminals: [
      { id: 't_out', terminalNumber: 'U-V-W-N', relativeX: 70, relativeY: 68, direction: 'SOUTH', allowedPinTypes: ['PHASE', 'NEUTRAL', 'PE'], label: 'Saída Gerador' }
    ],
    defaultSpecs: {
      voltageV: 380,
      nominalCurrentA: 380,
      powerKw: 200,
      powerFactor: 0.8,
      phases: '3F+N+PE',
      manufacturer: 'Stemac',
      model: 'GMG CUMMINS 250kVA'
    },
    validationRules: {
      requiresUpstreamProtection: true,
      requiresGrounding: true,
      voltageLevelMaxV: 600,
      interlockRequired: true
    }
  },
  {
    id: 'sym_ups_nobreak',
    category: 'FONTES',
    subcategory: 'Energia Ininterrupta',
    name: 'Nobreak Industrial UPS On-Line',
    shortDescription: 'Sistema UPS Trifásico Dupla Conversão 40kVA',
    standard: 'IEC_60617',
    standardReference: 'IEC 60617-06-15',
    tagPrefix: 'UPS',
    defaultCategory: 'UPS',
    width: 130,
    height: 70,
    viewBox: '0 0 130 70',
    svgPaths: `
      <rect x="15" y="10" width="100" height="50" rx="3" fill="#1E293B" stroke="#06B6D4" stroke-width="2"/>
      <path d="M30 35 L50 22 L70 48 L90 35" stroke="#06B6D4" stroke-width="2.5" fill="none"/>
      <text x="65" y="55" font-size="10" fill="#94A3B8" text-anchor="middle">UPS</text>
    `,
    terminals: [
      { id: 't_in', terminalNumber: 'IN', relativeX: 65, relativeY: 10, direction: 'NORTH', allowedPinTypes: ['PHASE', 'NEUTRAL'], label: 'Entrada Rede' },
      { id: 't_out', terminalNumber: 'OUT', relativeX: 65, relativeY: 60, direction: 'SOUTH', allowedPinTypes: ['PHASE', 'NEUTRAL'], label: 'Saída Crítica' }
    ],
    defaultSpecs: {
      voltageV: 220,
      nominalCurrentA: 105,
      powerKw: 32,
      powerFactor: 0.9,
      phases: '3F+N+PE',
      manufacturer: 'Schneider Electric',
      model: 'Galaxy 300 40kVA'
    },
    validationRules: {
      requiresUpstreamProtection: true,
      requiresGrounding: true,
      voltageLevelMaxV: 440
    }
  },

  // ==========================================
  // 2. PROTEÇÃO E SECCIONAMENTO
  // ==========================================
  {
    id: 'sym_disjuntor_aberto_acb',
    category: 'PROTECAO',
    subcategory: 'Disjuntores Caixa Aberta',
    name: 'Disjuntor Caixa Aberta (ACB 1600A)',
    shortDescription: 'Disjuntor Geral QGBT com Unidade de Disparo Eletrônica',
    standard: 'ABNT_NBR',
    standardReference: 'ABNT NBR IEC 60947-2',
    tagPrefix: 'QG',
    defaultCategory: 'MAIN_BREAKER',
    width: 130,
    height: 80,
    viewBox: '0 0 130 80',
    svgPaths: `
      <rect x="25" y="12" width="80" height="56" rx="4" fill="#1E293B" stroke="#EF4444" stroke-width="2.5"/>
      <line x1="65" y1="12" x2="65" y2="30" stroke="#EF4444" stroke-width="3"/>
      <line x1="65" y1="30" x2="52" y2="50" stroke="#EF4444" stroke-width="3"/>
      <line x1="65" y1="50" x2="65" y2="68" stroke="#EF4444" stroke-width="3"/>
      <path d="M48 42 L58 42" stroke="#EF4444" stroke-width="2"/>
    `,
    terminals: [
      { id: 't_in', terminalNumber: '1-3-5', relativeX: 65, relativeY: 12, direction: 'NORTH', allowedPinTypes: ['PHASE'], label: 'Entrada Barramento' },
      { id: 't_out', terminalNumber: '2-4-6', relativeX: 65, relativeY: 68, direction: 'SOUTH', allowedPinTypes: ['PHASE'], label: 'Saída QGBT' }
    ],
    defaultSpecs: {
      voltageV: 380,
      nominalCurrentA: 1600,
      breakingCapacityKa: 65,
      phases: '3F',
      manufacturer: 'Schneider Electric',
      model: 'Masterpact MTZ2 16 H1'
    },
    validationRules: {
      requiresUpstreamProtection: false,
      requiresGrounding: true,
      voltageLevelMaxV: 690
    }
  },
  {
    id: 'sym_disjuntor_caixa_moldada_mccb',
    category: 'PROTECAO',
    subcategory: 'Disjuntores Caixa Moldada',
    name: 'Disjuntor Caixa Moldada (MCCB 250A)',
    shortDescription: 'Proteção de Alimentador Geral com Térmico e Magnético Ajustáveis',
    standard: 'ABNT_NBR',
    standardReference: 'ABNT NBR IEC 60947-2',
    tagPrefix: 'QF',
    defaultCategory: 'MAIN_BREAKER',
    width: 120,
    height: 70,
    viewBox: '0 0 120 70',
    svgPaths: `
      <rect x="25" y="10" width="70" height="50" rx="3" fill="#1E293B" stroke="#F87171" stroke-width="2"/>
      <line x1="60" y1="10" x2="60" y2="25" stroke="#F87171" stroke-width="2.5"/>
      <line x1="60" y1="25" x2="48" y2="45" stroke="#F87171" stroke-width="2.5"/>
      <line x1="60" y1="45" x2="60" y2="60" stroke="#F87171" stroke-width="2.5"/>
      <path d="M44 38 L54 38" stroke="#F87171" stroke-width="2"/>
    `,
    terminals: [
      { id: 't_in', terminalNumber: '1-3-5', relativeX: 60, relativeY: 10, direction: 'NORTH', allowedPinTypes: ['PHASE'], label: 'Linha L1-L2-L3' },
      { id: 't_out', terminalNumber: '2-4-6', relativeX: 60, relativeY: 60, direction: 'SOUTH', allowedPinTypes: ['PHASE'], label: 'Carga T1-T2-T3' }
    ],
    defaultSpecs: {
      voltageV: 380,
      nominalCurrentA: 250,
      breakingCapacityKa: 36,
      phases: '3F',
      manufacturer: 'WEG',
      model: 'DWA250E-250-3'
    },
    validationRules: {
      requiresUpstreamProtection: true,
      requiresGrounding: true,
      voltageLevelMaxV: 600
    }
  },
  {
    id: 'sym_disjuntor_motor_mpw',
    category: 'PROTECAO',
    subcategory: 'Disjuntores-Motores',
    name: 'Disjuntor-Motor (MPW40 32A)',
    shortDescription: 'Proteção contra Sobrecarga e Curto para Partida de Motores',
    standard: 'ABNT_NBR',
    standardReference: 'ABNT NBR IEC 60947-4-1',
    tagPrefix: 'QM',
    defaultCategory: 'MOTOR_BREAKER',
    width: 120,
    height: 70,
    viewBox: '0 0 120 70',
    svgPaths: `
      <rect x="25" y="10" width="70" height="50" rx="3" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
      <line x1="60" y1="10" x2="60" y2="25" stroke="#F59E0B" stroke-width="2.5"/>
      <line x1="60" y1="25" x2="48" y2="45" stroke="#F59E0B" stroke-width="2.5"/>
      <line x1="60" y1="45" x2="60" y2="60" stroke="#F59E0B" stroke-width="2.5"/>
      <rect x="42" y="32" width="10" height="8" fill="none" stroke="#F59E0B" stroke-width="1.5"/>
    `,
    terminals: [
      { id: 't_in', terminalNumber: '1/L1-3/L2-5/L3', relativeX: 60, relativeY: 10, direction: 'NORTH', allowedPinTypes: ['PHASE'], label: 'Entrada 1/3/5' },
      { id: 't_out', terminalNumber: '2/T1-4/T2-6/T3', relativeX: 60, relativeY: 60, direction: 'SOUTH', allowedPinTypes: ['PHASE'], label: 'Saída 2/4/6' }
    ],
    defaultSpecs: {
      voltageV: 380,
      nominalCurrentA: 32,
      thermalMinA: 25,
      thermalMaxA: 32,
      breakingCapacityKa: 50,
      phases: '3F',
      manufacturer: 'WEG',
      model: 'MPW40-3-U032'
    },
    validationRules: {
      requiresUpstreamProtection: true,
      requiresGrounding: true,
      voltageLevelMaxV: 600
    }
  },
  {
    id: 'sym_disjuntor_din_tripolar',
    category: 'PROTECAO',
    subcategory: 'Disjuntores Modulares DIN',
    name: 'Disjuntor Termomagnético DIN Curva C (3P 40A)',
    shortDescription: 'Disjuntor Modular para Trilho DIN 3P Curva C',
    standard: 'ABNT_NBR',
    standardReference: 'ABNT NBR NM 60898',
    tagPrefix: 'DJ',
    defaultCategory: 'MAIN_BREAKER',
    width: 100,
    height: 60,
    viewBox: '0 0 100 60',
    svgPaths: `
      <rect x="20" y="8" width="60" height="44" rx="2" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
      <line x1="50" y1="8" x2="50" y2="20" stroke="#94A3B8" stroke-width="2"/>
      <line x1="50" y1="20" x2="40" y2="38" stroke="#94A3B8" stroke-width="2"/>
      <line x1="50" y1="38" x2="50" y2="52" stroke="#94A3B8" stroke-width="2"/>
    `,
    terminals: [
      { id: 't_in', terminalNumber: '1-3-5', relativeX: 50, relativeY: 8, direction: 'NORTH', allowedPinTypes: ['PHASE'], label: 'Linha' },
      { id: 't_out', terminalNumber: '2-4-6', relativeX: 50, relativeY: 52, direction: 'SOUTH', allowedPinTypes: ['PHASE'], label: 'Carga' }
    ],
    defaultSpecs: {
      voltageV: 380,
      nominalCurrentA: 40,
      tripCurve: 'C',
      breakingCapacityKa: 10,
      phases: '3F',
      manufacturer: 'Schneider Electric',
      model: 'Acti9 iC60N 3P 40A Curva C'
    },
    validationRules: {
      requiresUpstreamProtection: true,
      requiresGrounding: false,
      voltageLevelMaxV: 440
    }
  },
  {
    id: 'sym_dps_classe2',
    category: 'PROTECAO',
    subcategory: 'Dispositivos contra Surto',
    name: 'DPS Trifásico + N (Classe II 45kA)',
    shortDescription: 'Dispositivo de Proteção contra Surtos Atmosféricos NBR 5410',
    standard: 'ABNT_NBR',
    standardReference: 'ABNT NBR 5410 Item 6.3.5',
    tagPrefix: 'DPS',
    defaultCategory: 'DPS_PROTECTION',
    width: 100,
    height: 60,
    viewBox: '0 0 100 60',
    svgPaths: `
      <rect x="25" y="10" width="50" height="40" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
      <path d="M45 15 L55 30 L45 30 L55 45" stroke="#38BDF8" stroke-width="2" fill="none"/>
    `,
    terminals: [
      { id: 't_phase', terminalNumber: 'L1/L2/L3', relativeX: 50, relativeY: 10, direction: 'NORTH', allowedPinTypes: ['PHASE'], label: 'Fase' },
      { id: 't_pe', terminalNumber: 'PE', relativeX: 50, relativeY: 50, direction: 'SOUTH', allowedPinTypes: ['PE'], label: 'Aterramento' }
    ],
    defaultSpecs: {
      voltageV: 275,
      nominalCurrentA: 45,
      manufacturer: 'Clamper',
      model: 'VCL 275V 45kA'
    },
    validationRules: {
      requiresUpstreamProtection: true,
      requiresGrounding: true,
      voltageLevelMaxV: 380
    }
  },
  {
    id: 'sym_rele_termico',
    category: 'PROTECAO',
    subcategory: 'Relés de Sobrecarga',
    name: 'Relé Térmico Bimetálico (RW27 25-40A)',
    shortDescription: 'Relé de Proteção Térmica Acoplável ao Contator',
    standard: 'ABNT_NBR',
    standardReference: 'ABNT NBR IEC 60947-4-1',
    tagPrefix: 'FT',
    defaultCategory: 'THERMAL_RELAY',
    width: 110,
    height: 60,
    viewBox: '0 0 110 60',
    svgPaths: `
      <rect x="20" y="10" width="70" height="40" rx="3" fill="#1E293B" stroke="#F97316" stroke-width="2"/>
      <path d="M40 22 C45 28 50 18 55 24 M55 24 C60 30 65 20 70 26" stroke="#F97316" stroke-width="2" fill="none"/>
    `,
    terminals: [
      { id: 't_in', terminalNumber: '1-3-5', relativeX: 55, relativeY: 10, direction: 'NORTH', allowedPinTypes: ['PHASE'], label: 'Entrada' },
      { id: 't_out', terminalNumber: '2-4-6', relativeX: 55, relativeY: 50, direction: 'SOUTH', allowedPinTypes: ['PHASE'], label: 'Saída' }
    ],
    defaultSpecs: {
      voltageV: 380,
      nominalCurrentA: 32,
      thermalMinA: 25,
      thermalMaxA: 40,
      phases: '3F',
      manufacturer: 'WEG',
      model: 'RW27-2D3-U040'
    },
    validationRules: {
      requiresUpstreamProtection: true,
      requiresGrounding: false,
      voltageLevelMaxV: 690
    }
  },

  // ==========================================
  // 3. MANOBRA E COMANDO
  // ==========================================
  {
    id: 'sym_contator_forca_cwb',
    category: 'COMANDO',
    subcategory: 'Contatores de Força',
    name: 'Contator de Potência 3P (CWB38 38A AC-3)',
    shortDescription: 'Contator Tripolar para Partida de Motores 18.5kW 380V',
    standard: 'ABNT_NBR',
    standardReference: 'ABNT NBR IEC 60947-4-1',
    tagPrefix: 'KM',
    defaultCategory: 'CONTACTOR',
    width: 120,
    height: 70,
    viewBox: '0 0 120 70',
    svgPaths: `
      <rect x="20" y="10" width="80" height="50" rx="3" fill="#1E293B" stroke="#10B981" stroke-width="2"/>
      <line x1="60" y1="10" x2="60" y2="24" stroke="#10B981" stroke-width="2"/>
      <line x1="60" y1="24" x2="48" y2="44" stroke="#10B981" stroke-width="2"/>
      <line x1="60" y1="44" x2="60" y2="60" stroke="#10B981" stroke-width="2"/>
      <circle cx="60" cy="35" r="5" stroke="#10B981" stroke-width="1.5" fill="none"/>
    `,
    terminals: [
      { id: 't_in', terminalNumber: '1/L1-3/L2-5/L3', relativeX: 60, relativeY: 10, direction: 'NORTH', allowedPinTypes: ['PHASE'], label: 'Linha Força' },
      { id: 't_out', terminalNumber: '2/T1-4/T2-6/T3', relativeX: 60, relativeY: 60, direction: 'SOUTH', allowedPinTypes: ['PHASE'], label: 'Carga Motor' },
      { id: 't_a1', terminalNumber: 'A1', relativeX: 20, relativeY: 35, direction: 'WEST', allowedPinTypes: ['CONTROL'], label: 'Bobina A1' },
      { id: 't_a2', terminalNumber: 'A2', relativeX: 100, relativeY: 35, direction: 'EAST', allowedPinTypes: ['CONTROL'], label: 'Bobina A2' }
    ],
    defaultSpecs: {
      voltageV: 380,
      nominalCurrentA: 38,
      powerKw: 18.5,
      phases: '3F',
      manufacturer: 'WEG',
      model: 'CWB38-11-30D23'
    },
    validationRules: {
      requiresUpstreamProtection: true,
      requiresGrounding: true,
      voltageLevelMaxV: 690
    }
  },
  {
    id: 'sym_botoeira_emergencia',
    category: 'COMANDO',
    subcategory: 'Botoeiras e Sensores',
    name: 'Botoeira de Emergência com Trava (NR-12)',
    shortDescription: 'Cogumelo Vermelho com Retenção Mecânica e Contatos Duplo Canal',
    standard: 'ABNT_NBR',
    standardReference: 'ABNT NBR 14153 / NR-12 Cat 4',
    tagPrefix: 'SE',
    defaultCategory: 'SWITCH',
    width: 90,
    height: 70,
    viewBox: '0 0 90 70',
    svgPaths: `
      <circle cx="45" cy="22" r="16" fill="#DC2626" stroke="#991B1B" stroke-width="2"/>
      <path d="M45 38 L45 55" stroke="#94A3B8" stroke-width="2.5"/>
      <line x1="30" y1="55" x2="60" y2="55" stroke="#94A3B8" stroke-width="2"/>
    `,
    terminals: [
      { id: 't_11', terminalNumber: '11-12', relativeX: 30, relativeY: 55, direction: 'SOUTH', allowedPinTypes: ['CONTROL'], label: 'Canal 1 NF' },
      { id: 't_21', terminalNumber: '21-22', relativeX: 60, relativeY: 55, direction: 'SOUTH', allowedPinTypes: ['CONTROL'], label: 'Canal 2 NF' }
    ],
    defaultSpecs: {
      voltageV: 24,
      nominalCurrentA: 4,
      manufacturer: 'Siemens',
      model: '3SU1150-1HB20-1CG0'
    },
    validationRules: {
      requiresUpstreamProtection: true,
      requiresGrounding: false,
      voltageLevelMaxV: 250
    }
  },

  // ==========================================
  // 4. CARGAS E MOTORES
  // ==========================================
  {
    id: 'sym_motor_trifasico_w22',
    category: 'CARGAS',
    subcategory: 'Motores de Indução',
    name: 'Motor Trifásico W22 (15 kW / 20 CV)',
    shortDescription: 'Motor de Indução Trifásico Gaiola de Esquilo 4 Polos 380V IR3',
    standard: 'ABNT_NBR',
    standardReference: 'ABNT NBR 17094-1 / IEC 60034-1',
    tagPrefix: 'M',
    defaultCategory: 'MOTOR_3P',
    width: 130,
    height: 80,
    viewBox: '0 0 130 80',
    svgPaths: `
      <circle cx="65" cy="40" r="28" fill="#1E293B" stroke="#3B82F6" stroke-width="2.5"/>
      <text x="65" y="47" font-size="20" font-weight="bold" fill="#3B82F6" text-anchor="middle">M</text>
      <text x="65" y="24" font-size="9" fill="#94A3B8" text-anchor="middle">3 ~</text>
    `,
    terminals: [
      { id: 't_u', terminalNumber: 'U1-V1-W1', relativeX: 65, relativeY: 12, direction: 'NORTH', allowedPinTypes: ['PHASE'], label: 'Alimentação Trifásica' },
      { id: 't_pe', terminalNumber: 'PE', relativeX: 65, relativeY: 68, direction: 'SOUTH', allowedPinTypes: ['PE'], label: 'Carcaça / Terra' }
    ],
    defaultSpecs: {
      voltageV: 380,
      nominalCurrentA: 29.5,
      powerKw: 15,
      powerHp: 20,
      powerFactor: 0.86,
      phases: '3F',
      cableSectionMm2: 6.0,
      manufacturer: 'WEG',
      model: 'W22 Premium IR3 15kW 4P'
    },
    validationRules: {
      requiresUpstreamProtection: true,
      requiresGrounding: true,
      voltageLevelMaxV: 690
    }
  },
  {
    id: 'sym_inversor_cfw11',
    category: 'CARGAS',
    subcategory: 'Acionamentos e Inversores',
    name: 'Inversor de Frequência Vetorial (CFW11 30kW)',
    shortDescription: 'Inversor com Controle Vetorial Sensorless e Filtro RFI',
    standard: 'IEC_60617',
    standardReference: 'IEC 61800-3 / IEC 60617-06-14',
    tagPrefix: 'INV',
    defaultCategory: 'VFD',
    width: 140,
    height: 85,
    viewBox: '0 0 140 85',
    svgPaths: `
      <rect x="15" y="10" width="110" height="65" rx="4" fill="#1E293B" stroke="#8B5CF6" stroke-width="2"/>
      <line x1="15" y1="10" x2="125" y2="75" stroke="#4C1D95" stroke-width="1.5"/>
      <text x="40" y="32" font-size="12" fill="#C4B5FD">AC</text>
      <text x="95" y="60" font-size="12" fill="#C4B5FD">AC</text>
      <path d="M60 42 L80 42" stroke="#8B5CF6" stroke-width="2"/>
    `,
    terminals: [
      { id: 't_in', terminalNumber: 'R/L1-S/L2-T/L3', relativeX: 70, relativeY: 10, direction: 'NORTH', allowedPinTypes: ['PHASE'], label: 'Rede Entrada' },
      { id: 't_out', terminalNumber: 'U/T1-V/T2-W/T3', relativeX: 70, relativeY: 75, direction: 'SOUTH', allowedPinTypes: ['PHASE'], label: 'Saída Motor' },
      { id: 't_ctrl', terminalNumber: 'DI1-DI6', relativeX: 15, relativeY: 42, direction: 'WEST', allowedPinTypes: ['CONTROL'], label: 'Comando Digital' }
    ],
    defaultSpecs: {
      voltageV: 380,
      nominalCurrentA: 60,
      powerKw: 30,
      powerHp: 40,
      phases: '3F',
      manufacturer: 'WEG',
      model: 'CFW11 0060 T4'
    },
    validationRules: {
      requiresUpstreamProtection: true,
      requiresGrounding: true,
      voltageLevelMaxV: 480
    }
  },
  {
    id: 'sym_soft_starter_ssw07',
    category: 'CARGAS',
    subcategory: 'Acionamentos e Inversores',
    name: 'Chave de Partida Suave Soft Starter (SSW07 45A)',
    shortDescription: 'Partida Suave com Controle de Tensão por Tiristores e Bypass Embutido',
    standard: 'IEC_60617',
    standardReference: 'IEC 60947-4-2',
    tagPrefix: 'SS',
    defaultCategory: 'SOFT_STARTER',
    width: 130,
    height: 80,
    viewBox: '0 0 130 80',
    svgPaths: `
      <rect x="15" y="10" width="100" height="60" rx="3" fill="#1E293B" stroke="#EC4899" stroke-width="2"/>
      <path d="M35 55 L55 25 L75 55 L95 25" stroke="#EC4899" stroke-width="2" fill="none"/>
    `,
    terminals: [
      { id: 't_in', terminalNumber: '1/L1-3/L2-5/L3', relativeX: 65, relativeY: 10, direction: 'NORTH', allowedPinTypes: ['PHASE'], label: 'Entrada' },
      { id: 't_out', terminalNumber: '2/T1-4/T2-6/T3', relativeX: 65, relativeY: 70, direction: 'SOUTH', allowedPinTypes: ['PHASE'], label: 'Saída' }
    ],
    defaultSpecs: {
      voltageV: 380,
      nominalCurrentA: 45,
      powerKw: 22,
      powerHp: 30,
      phases: '3F',
      manufacturer: 'WEG',
      model: 'SSW07 0045 T5'
    },
    validationRules: {
      requiresUpstreamProtection: true,
      requiresGrounding: true,
      voltageLevelMaxV: 575
    }
  },

  // ==========================================
  // 5. AUTOMAÇÃO, CLP E I/O
  // ==========================================
  {
    id: 'sym_clp_cpu_s7_1200',
    category: 'CLP_AUTOMACAO',
    subcategory: 'Controladores Lógicos Programáveis',
    name: 'CPU CLP Modular (SIMATIC S7-1200 1214C)',
    shortDescription: 'Controlador Industrial com 14 DI 24VDC, 10 DO Relé e 2 AI 0-10V',
    standard: 'IEC_60617',
    standardReference: 'IEC 61131-2 / IEC 60617-12',
    tagPrefix: 'PLC',
    defaultCategory: 'PLC',
    width: 150,
    height: 90,
    viewBox: '0 0 150 90',
    svgPaths: `
      <rect x="10" y="10" width="130" height="70" rx="4" fill="#0F172A" stroke="#0284C7" stroke-width="2.5"/>
      <rect x="25" y="20" width="100" height="20" rx="2" fill="#0369A1"/>
      <text x="75" y="34" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">CPU 1214C DC/DC/RLY</text>
      <circle cx="28" cy="65" r="4" fill="#22C55E"/>
      <circle cx="42" cy="65" r="4" fill="#EF4444"/>
      <text x="80" y="68" font-size="9" fill="#94A3B8">PROFINET / ETH</text>
    `,
    terminals: [
      { id: 't_di', terminalNumber: '%I0.0-%I1.5', relativeX: 75, relativeY: 10, direction: 'NORTH', allowedPinTypes: ['CONTROL'], label: '14 Entradas Digitais' },
      { id: 't_do', terminalNumber: '%Q0.0-%Q1.1', relativeX: 75, relativeY: 80, direction: 'SOUTH', allowedPinTypes: ['CONTROL'], label: '10 Saídas Digitais' },
      { id: 't_eth', terminalNumber: 'PROFINET', relativeX: 140, relativeY: 45, direction: 'EAST', allowedPinTypes: ['COMMUNICATION'], label: 'Ethernet RJ45' }
    ],
    defaultSpecs: {
      voltageV: 24,
      nominalCurrentA: 2,
      manufacturer: 'Siemens',
      model: 'CPU 1214C 6ES7214-1HG40-0XB0'
    },
    validationRules: {
      requiresUpstreamProtection: true,
      requiresGrounding: true,
      voltageLevelMaxV: 30
    }
  },

  // ==========================================
  // 6. MEDIÇÃO E INSTRUMENTAÇÃO
  // ==========================================
  {
    id: 'sym_multimedidor_kron',
    category: 'MEDICAO',
    subcategory: 'Multimedidores Digitais',
    name: 'Multimedidor Grandezas Elétricas (Kron Mult-K)',
    shortDescription: 'Medição de Tensão, Corrente, Potência, FP e Harmônicas RS-485 Modbus',
    standard: 'ABNT_NBR',
    standardReference: 'ABNT NBR 14519 / IEC 61557-12',
    tagPrefix: 'MM',
    defaultCategory: 'METER',
    width: 120,
    height: 70,
    viewBox: '0 0 120 70',
    svgPaths: `
      <rect x="20" y="10" width="80" height="50" rx="3" fill="#1E293B" stroke="#EAB308" stroke-width="2"/>
      <rect x="30" y="18" width="60" height="20" rx="1" fill="#000000"/>
      <text x="60" y="32" font-size="11" font-family="monospace" fill="#22C55E" text-anchor="middle">380.4 V</text>
      <text x="60" y="52" font-size="9" fill="#EAB308" text-anchor="middle">MODBUS RTU</text>
    `,
    terminals: [
      { id: 't_vt', terminalNumber: 'Va-Vb-Vc-Vn', relativeX: 60, relativeY: 10, direction: 'NORTH', allowedPinTypes: ['PHASE', 'NEUTRAL'], label: 'Sinais de Tensão' },
      { id: 't_ct', terminalNumber: 'Ia-Ib-Ic', relativeX: 60, relativeY: 60, direction: 'SOUTH', allowedPinTypes: ['ANALOG'], label: 'Entradas TC 5A' }
    ],
    defaultSpecs: {
      voltageV: 380,
      nominalCurrentA: 5,
      manufacturer: 'Kron',
      model: 'Mult-K 120'
    },
    validationRules: {
      requiresUpstreamProtection: true,
      requiresGrounding: true,
      voltageLevelMaxV: 600
    }
  },

  // ==========================================
  // 7. ATERRAMENTO E BARRAMENTOS
  // ==========================================
  {
    id: 'sym_barramento_pe_terra',
    category: 'ATERRAMENTO',
    subcategory: 'Barramentos e Equipotencialização',
    name: 'Barramento Equipotencial Principal (BEP / PE)',
    shortDescription: 'Barramento de Cobre para Aterramento de Proteção NBR 5410',
    standard: 'ABNT_NBR',
    standardReference: 'ABNT NBR 5410 Item 6.4.1',
    tagPrefix: 'BEP',
    defaultCategory: 'GROUND',
    width: 140,
    height: 50,
    viewBox: '0 0 140 50',
    svgPaths: `
      <line x1="15" y1="25" x2="125" y2="25" stroke="#22C55E" stroke-width="6" stroke-linecap="round"/>
      <circle cx="30" cy="25" r="4" fill="#000000" stroke="#22C55E" stroke-width="1.5"/>
      <circle cx="55" cy="25" r="4" fill="#000000" stroke="#22C55E" stroke-width="1.5"/>
      <circle cx="80" cy="25" r="4" fill="#000000" stroke="#22C55E" stroke-width="1.5"/>
      <circle cx="105" cy="25" r="4" fill="#000000" stroke="#22C55E" stroke-width="1.5"/>
    `,
    terminals: [
      { id: 't_pe1', terminalNumber: 'PE-1', relativeX: 30, relativeY: 25, direction: 'SOUTH', allowedPinTypes: ['PE'], label: 'Malha de Terra' },
      { id: 't_pe2', terminalNumber: 'PE-2', relativeX: 55, relativeY: 25, direction: 'SOUTH', allowedPinTypes: ['PE'], label: 'Carcaças Painéis' },
      { id: 't_pe3', terminalNumber: 'PE-3', relativeX: 80, relativeY: 25, direction: 'SOUTH', allowedPinTypes: ['PE'], label: 'Neutro Trafo' },
      { id: 't_pe4', terminalNumber: 'PE-4', relativeX: 105, relativeY: 25, direction: 'SOUTH', allowedPinTypes: ['PE'], label: 'SPDA Para-Raios' }
    ],
    defaultSpecs: {
      voltageV: 0,
      nominalCurrentA: 1000,
      phases: 'PE',
      manufacturer: 'Barramento de Cobre Eletrolítico 99.9%'
    },
    validationRules: {
      requiresUpstreamProtection: false,
      requiresGrounding: true,
      voltageLevelMaxV: 0
    }
  }
];
