// ============================================================================
// ELÉTRICAI — CALCULATION ENGINE / DIMENSIONAMENTO DE CONDUTORES (FASE 10)
// Módulo puro e determinístico. Nenhum cálculo é delegado à IA.
//
// Pré-requisitos (regra de ouro do plano): as tabelas de ampacidade e os
// fatores de correção residem em `lib/nbr5410.ts` e são reutilizados aqui.
// Este módulo NÃO duplica tabelas: ele monta a memória de cálculo e os
// critérios normativos cumulativos (ampacidade, queda de tensão, sobrecarga
// e curto térmico).
//
// OBSERVAÇÃO DE ENGENHARIA: os valores tabelados de `NBR5410_AMPACITY_TABLE`
// são VALOR_ASSUMIDO — não foram conferidos contra a edição impressa da
// ABNT NBR 5410 nesta execução.
// ============================================================================

import {
  NBR5410_AMPACITY_TABLE,
  GROUPING_FACTORS,
  getTemperatureFactor,
  calculateThreePhaseIb,
  calculateVoltageDropPercent,
  autoSizeCircuit,
} from '@/lib/nbr5410';
import { verifyOverloadCoordination } from '@/lib/electrical-calc';

export type InsulationType = 'PVC' | 'EPR';
export type InstallationMethod = 'B1' | 'C';
export type ConductorMaterial = 'COPPER_PVC' | 'COPPER_EPR_XLPE';

export interface CableSizingInputs {
  powerKw: number;
  voltageV: number;
  lengthMeters: number;
  insulation: InsulationType;
  ambientTempC: number;
  groupingCircuits: number;
  installationMethod: InstallationMethod;
  powerFactor?: number;
  efficiency?: number;
  maxVoltageDropPercent?: number;
}

export interface CableSizingResult {
  ib: number;
  fT: number;
  fA: number;
  correctionFactor: number;
  requiredIz: number;
  selectedCableMm2: number;
  selectedCableAmpacityA: number;
  selectedBreakerIn: number;
  voltageDropVolts: number;
  voltageDropPercent: number;
  criteria: {
    ampacityOk: boolean;
    voltageDropOk: boolean;
    overloadCoordinationOk: boolean;
    overloadStatusText: string;
  };
  isCompliant: boolean;
  memory: string[];
  standardReferences: string[];
}

export interface OverloadCoordinationResult {
  ib: number;
  breakerIn: number;
  cableIz: number;
  isCompliant: boolean;
  statusText: string;
  marginPercent: number;
}

export interface ThermalMinimumSectionResult {
  sectionMm2: number;
  requiredSectionMm2: number;
  selectedStandardSectionMm2: number;
  formula: string;
  inputs: { iccA: number; clearingTimeS: number; k: number };
  standardReference: string;
  notes: string[];
}

const STANDARD_SECTIONS_MM2 = NBR5410_AMPACITY_TABLE.map(row => row.sectionMm2);

const CONDUCTOR_K: Record<ConductorMaterial, number> = {
  COPPER_PVC: 115,
  COPPER_EPR_XLPE: 143,
};

function getAmpacity(
  sectionMm2: number,
  insulation: InsulationType,
  installationMethod: InstallationMethod
): number | null {
  const row = NBR5410_AMPACITY_TABLE.find(r => r.sectionMm2 === sectionMm2);
  if (!row) return null;
  if (installationMethod === 'B1') {
    return insulation === 'PVC' ? row.methodB1_PVC : row.methodB1_EPR;
  }
  return insulation === 'PVC' ? row.methodC_PVC : row.methodC_EPR;
}

function nextStandardSection(sectionMm2: number): number {
  const found = STANDARD_SECTIONS_MM2.find(s => s >= sectionMm2);
  return found ?? STANDARD_SECTIONS_MM2[STANDARD_SECTIONS_MM2.length - 1];
}

/**
 * Dimensiona condutor e dispositivo de proteção verificando de forma
 * CUMULATIVA os quatro critérios da NBR 5410 descritos no plano 04.
 */
export function sizeCableAndProtection(inputs: CableSizingInputs): CableSizingResult {
  const powerFactor = inputs.powerFactor ?? 0.85;
  const efficiency = inputs.efficiency ?? 0.92;
  const maxVoltageDropPercent = inputs.maxVoltageDropPercent ?? 4.0;

  const ib = calculateThreePhaseIb(inputs.powerKw, inputs.voltageV, powerFactor, efficiency);

  const fT = getTemperatureFactor(inputs.ambientTempC, inputs.insulation);
  const fA = GROUPING_FACTORS[Math.min(9, Math.max(1, inputs.groupingCircuits))] ?? 0.7;
  const correctionFactor = Math.round(fT * fA * 100) / 100;
  const requiredIz = Math.round((ib / (fT * fA)) * 10) / 10;

  const autoSized = autoSizeCircuit({
    powerKw: inputs.powerKw,
    voltageV: inputs.voltageV,
    lengthMeters: inputs.lengthMeters,
    insulation: inputs.insulation,
    ambientTempC: inputs.ambientTempC,
    groupingCircuits: inputs.groupingCircuits,
    installationMethod: inputs.installationMethod,
    powerFactor,
    efficiency,
  });

  const selectedCableMm2 = autoSized.selectedCableMm2;
  const selectedBreakerIn = autoSized.selectedBreakerIn;
  const selectedCableAmpacityA = getAmpacity(selectedCableMm2, inputs.insulation, inputs.installationMethod) ?? 0;

  const voltageDrop = calculateVoltageDropPercent(
    ib,
    inputs.lengthMeters,
    selectedCableMm2,
    inputs.voltageV,
    powerFactor
  );

  const ampacityOk = selectedCableAmpacityA >= requiredIz;
  const voltageDropOk = voltageDrop.dropPercent <= maxVoltageDropPercent;
  const coordination = verifyOverloadCoordination(ib, selectedBreakerIn, selectedCableAmpacityA);

  const memory: string[] = [
    `1) Corrente de projeto: Ib = ${ib} A  [P=${inputs.powerKw} kW, V=${inputs.voltageV} V, cosφ=${powerFactor}, η=${efficiency}]`,
    `2) Fatores de correção: f_t=${fT} (T=${inputs.ambientTempC}°C, isolamento ${inputs.insulation}), f_a=${fA} (${inputs.groupingCircuits} circuito(s) agrupado(s)) -> correção total ${correctionFactor}`,
    `3) Corrente mínima exigida do condutor: Iz >= Ib / (f_t · f_a) = ${requiredIz} A`,
    `4) Bitola selecionada: ${selectedCableMm2} mm² (Iz tabelada = ${selectedCableAmpacityA} A, método ${inputs.installationMethod})`,
    `5) Disjuntor comercial selecionado: In = ${selectedBreakerIn} A`,
    `6) Queda de tensão: ΔU = ${voltageDrop.dropVolts} V -> ${voltageDrop.dropPercent}% (limite ${maxVoltageDropPercent}%)`,
    `7) Coordenação de sobrecarga: ${coordination.statusText}`,
  ];

  const standardReferences = [
    'ABNT NBR 5410 item 6.2.5 (capacidade de condução e fatores de correção)',
    'ABNT NBR 5410 item 6.2.7 (queda de tensão admissível)',
    'ABNT NBR 5410 item 5.3.4 (Ib ≤ In ≤ Iz; I2 ≤ 1,45 · Iz)',
  ];

  return {
    ib,
    fT,
    fA,
    correctionFactor,
    requiredIz,
    selectedCableMm2,
    selectedCableAmpacityA,
    selectedBreakerIn,
    voltageDropVolts: voltageDrop.dropVolts,
    voltageDropPercent: voltageDrop.dropPercent,
    criteria: {
      ampacityOk,
      voltageDropOk,
      overloadCoordinationOk: coordination.isCompliant,
      overloadStatusText: coordination.statusText,
    },
    isCompliant: ampacityOk && voltageDropOk && coordination.isCompliant,
    memory,
    standardReferences,
  };
}

/** Verifica isoladamente Ib ≤ In ≤ Iz (critério de sobrecarga/proteção). */
export function checkProtectionCoordination(
  ib: number,
  breakerIn: number,
  cableIz: number
): OverloadCoordinationResult {
  const coordination = verifyOverloadCoordination(ib, breakerIn, cableIz);
  return {
    ib,
    breakerIn,
    cableIz,
    isCompliant: coordination.isCompliant,
    statusText: coordination.statusText,
    marginPercent: coordination.marginPercent,
  };
}

/**
 * Seção mínima pelo critério de curto-circuito térmico:
 *   S_min = (Icc · √t) / k
 *
 * `k` é a constante do material/isolação. Os valores 115 (cobre/PVC) e 143
 * (cobre/EPR-XLPE) vêm do plano 04_CALCULATION_ENGINE_E_NORMAS.md e são
 * VALOR_ASSUMIDO até conferência com a norma impressa.
 */
export function calculateThermalMinimumSection(params: {
  iccA: number;
  clearingTimeS: number;
  conductorMaterial: ConductorMaterial;
}): ThermalMinimumSectionResult {
  const k = CONDUCTOR_K[params.conductorMaterial];

  if (!(params.iccA > 0) || !(params.clearingTimeS > 0)) {
    return {
      sectionMm2: 0,
      requiredSectionMm2: 0,
      selectedStandardSectionMm2: 0,
      formula: 'S_min = (Icc · √t) / k',
      inputs: { iccA: params.iccA, clearingTimeS: params.clearingTimeS, k },
      standardReference: 'ABNT NBR 5410 item 6.2.5.3 / IEC 60364-5-54',
      notes: ['DADO_NAO_INFORMADO: Icc e/ou tempo de atuação devem ser maiores que zero.'],
    };
  }

  const requiredSectionMm2 = (params.iccA * Math.sqrt(params.clearingTimeS)) / k;
  const selectedStandardSectionMm2 = nextStandardSection(requiredSectionMm2);

  return {
    sectionMm2: Math.round(requiredSectionMm2 * 100) / 100,
    requiredSectionMm2: Math.round(requiredSectionMm2 * 100) / 100,
    selectedStandardSectionMm2,
    formula: 'S_min = (Icc · √t) / k',
    inputs: { iccA: params.iccA, clearingTimeS: params.clearingTimeS, k },
    standardReference: 'ABNT NBR 5410 item 6.2.5.3 / IEC 60364-5-54 (curto-circuito de curta duração, t ≤ 5 s)',
    notes: [
      `k=${k} para ${params.conductorMaterial === 'COPPER_PVC' ? 'cobre com isolação PVC' : 'cobre com isolação EPR/XLPE'} (VALOR_ASSUMIDO do plano 04).`,
      `Seção comercial mínima recomendada: ${selectedStandardSectionMm2} mm².`,
      params.clearingTimeS > 5
        ? 'ATENÇÃO: t > 5 s fica fora da faixa de validade desta fórmula simplificada.'
        : 'Tempo de atuação dentro da faixa t ≤ 5 s.',
    ],
  };
}
