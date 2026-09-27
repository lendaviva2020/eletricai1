// ============================================================================
// ELÉTRICAI — CALCULATION ENGINE / CURTO-CIRCUITO IEC 60909 (FASE 10)
// Módulo puro e determinístico. Nenhum cálculo é delegado à IA.
//
// Fonte das fórmulas: plano_do_eletricai/04_CALCULATION_ENGINE_E_NORMAS.md
// seções 3.4 e 4 (método das impedâncias IEC 60909).
//
// OBSERVAÇÕES DE ENGENHARIA:
// - As resistências e reatâncias por km vêm de NBR5410_AMPACITY_TABLE
//   (lib/nbr5410.ts) e são VALOR_ASSUMIDO: não foram conferidas contra a
//   edição impressa da norma nesta execução.
// - O fator de tensão `c` deve ser informado pelo engenheiro. O padrão 1,0
//   para redes ≤ 1 kV é VALOR_ASSUMIDO do plano 04.
// - Dados de rede/transformador não informados são marcados DADO_NAO_INFORMADO
//   e a função não devolve resultado numérico em seu lugar.
// ============================================================================

import { NBR5410_AMPACITY_TABLE } from '@/lib/nbr5410';
import { calcTransformerShortCircuit } from '@/lib/electrical-calc';

export interface Impedance {
  resistanceOhm: number;
  reactanceOhm: number;
  impedanceOhm: number;
}

export interface ImpedanceWithNotes extends Impedance {
  notes: string[];
  standardReference: string;
}

export interface NetworkImpedanceParams {
  voltageV: number;
  shortCircuitPowerMva?: number;
}

export interface TransformerImpedanceParams {
  transformerKva: number;
  secondaryVoltageV: number;
  impedancePercent: number;
  loadLossW?: number;
}

export interface CableImpedanceParams {
  lengthMeters: number;
  sectionMm2: number;
}

export interface ShortCircuitCurrentResult {
  ik3A: number;
  ik3Ka: number;
  voltageFactorC: number;
  sumResistanceOhm: number;
  sumReactanceOhm: number;
  formula: string;
  standardReference: string;
  notes: string[];
}

export interface TransformerShortCircuitResult {
  ikA: number;
  ikKa: number;
  formula: string;
  standardReference: string;
  notes: string[];
}

function round(value: number, decimals = 6): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function buildImpedance(resistanceOhm: number, reactanceOhm: number): Impedance {
  return {
    resistanceOhm: round(resistanceOhm),
    reactanceOhm: round(reactanceOhm),
    impedanceOhm: round(Math.sqrt(resistanceOhm ** 2 + reactanceOhm ** 2)),
  };
}

/**
 * Impedância equivalente da rede de concessionária:
 *   Z_rede = (1,1 · V_sec²) / S_cc_rede
 */
export function calculateNetworkImpedance(params: NetworkImpedanceParams): ImpedanceWithNotes {
  const notes: string[] = [];

  if (!(params.voltageV > 0)) {
    return {
      ...buildImpedance(0, 0),
      notes: ['DADO_NAO_INFORMADO: tensão do barramento deve ser maior que zero.'],
      standardReference: 'IEC 60909-0 (método das impedâncias)',
    };
  }

  if (params.shortCircuitPowerMva === undefined || !(params.shortCircuitPowerMva > 0)) {
    return {
      ...buildImpedance(0, 0),
      notes: [
        'DADO_NAO_INFORMADO: potência de curto-circuito da rede (S_cc) não foi informada. Não é possível calcular Z_rede.',
      ],
      standardReference: 'IEC 60909-0 (método das impedâncias)',
    };
  }

  const sCcVa = params.shortCircuitPowerMva * 1e6;
  const zRede = (1.1 * params.voltageV ** 2) / sCcVa;
  notes.push(`Z_rede = (1,1 · ${params.voltageV}²) / ${params.shortCircuitPowerMva} MVA`);

  return {
    ...buildImpedance(zRede, 0),
    notes,
    standardReference: 'IEC 60909-0 / plano 04 item 4.1 (rede de concessionária)',
  };
}

/**
 * Impedância do transformador MT/BT:
 *   Z_trafo = (z% / 100) · V_sec² / S_trafo
 *   R_trafo = (P_perdas · V_sec²) / S_trafo²
 *   X_trafo = √(Z² - R²)
 */
export function calculateTransformerImpedance(params: TransformerImpedanceParams): ImpedanceWithNotes {
  const notes: string[] = [];

  if (!(params.transformerKva > 0) || !(params.secondaryVoltageV > 0) || !(params.impedancePercent > 0)) {
    return {
      ...buildImpedance(0, 0),
      notes: ['DADO_NAO_INFORMADO: potência, tensão secundária e impedância (%) do transformador são obrigatórias.'],
      standardReference: 'IEC 60909-0 / plano 04 item 4.2',
    };
  }

  const sVa = params.transformerKva * 1000;
  const zTrafo = ((params.impedancePercent / 100) * params.secondaryVoltageV ** 2) / sVa;

  let rTrafo: number;
  if (params.loadLossW !== undefined && params.loadLossW > 0) {
    rTrafo = (params.loadLossW * params.secondaryVoltageV ** 2) / sVa ** 2;
    notes.push(`R_trafo calculado a partir das perdas em carga informadas (${params.loadLossW} W).`);
  } else {
    rTrafo = 0;
    notes.push(
      'DADO_NAO_INFORMADO: perdas em carga (P_perdas) não informadas -> R_trafo considerado 0 Ω (conservador apenas para X; precisa do dado real).'
    );
  }

  const xSquared = zTrafo ** 2 - rTrafo ** 2;
  const xTrafo = xSquared > 0 ? Math.sqrt(xSquared) : 0;

  if (xSquared <= 0 && params.loadLossW !== undefined) {
    notes.push('ATENÇÃO: R_trafo ≥ Z_trafo -> dado de perdas incoerente com a impedância percentual informada.');
  }

  return {
    ...buildImpedance(rTrafo, xTrafo),
    notes,
    standardReference: 'IEC 60909-0 / plano 04 item 4.2 (transformador MT/BT)',
  };
}

/**
 * Impedância de um trecho de cabo, usando R e X tabelados por km:
 *   R_cabo = (R_Ω/km / 1000) · L
 *   X_cabo = (X_Ω/km / 1000) · L
 */
export function calculateCableImpedance(params: CableImpedanceParams): ImpedanceWithNotes {
  const row = NBR5410_AMPACITY_TABLE.find(r => r.sectionMm2 === params.sectionMm2);

  if (!row) {
    const available = NBR5410_AMPACITY_TABLE.map(r => r.sectionMm2).join(', ');
    return {
      ...buildImpedance(0, 0),
      notes: [`DADO_NAO_INFORMADO: seção ${params.sectionMm2} mm² não consta na tabela (disponíveis: ${available}).`],
      standardReference: 'Tabela R/X por km em lib/nbr5410.ts (VALOR_ASSUMIDO)',
    };
  }

  if (!(params.lengthMeters > 0)) {
    return {
      ...buildImpedance(0, 0),
      notes: ['DADO_NAO_INFORMADO: comprimento do trecho deve ser maior que zero.'],
      standardReference: 'Tabela R/X por km em lib/nbr5410.ts (VALOR_ASSUMIDO)',
    };
  }

  const resistanceOhm = (row.resistanceOhmPerKm / 1000) * params.lengthMeters;
  const reactanceOhm = (row.reactanceOhmPerKm / 1000) * params.lengthMeters;

  return {
    ...buildImpedance(resistanceOhm, reactanceOhm),
    notes: [
      `R = ${row.resistanceOhmPerKm} Ω/km · ${params.lengthMeters} m`,
      `X = ${row.reactanceOhmPerKm} Ω/km · ${params.lengthMeters} m`,
    ],
    standardReference: 'Tabela R/X por km em lib/nbr5410.ts (VALOR_ASSUMIDO)',
  };
}

/** Soma linear das impedâncias em série. */
export function sumImpedances(items: Impedance[]): Impedance {
  const totalR = items.reduce((acc, item) => acc + item.resistanceOhm, 0);
  const totalX = items.reduce((acc, item) => acc + item.reactanceOhm, 0);
  return buildImpedance(totalR, totalX);
}

/**
 * Corrente de curto trifásico simétrico:
 *   I_k3 = (c · V_LL) / (√3 · √((ΣR)² + (ΣX)²))
 */
export function calculateSymmetricalShortCircuitCurrent(params: {
  voltageV: number;
  impedances: Impedance[];
  voltageFactorC?: number;
}): ShortCircuitCurrentResult {
  const voltageFactorC = params.voltageFactorC ?? 1.0;
  const total = sumImpedances(params.impedances);
  const formula = 'I_k3 = (c · V_LL) / (√3 · √((ΣR)² + (ΣX)²))';
  const standardReference = 'IEC 60909-0 / plano 04 item 4.4';

  const notes: string[] = [
    `fator de tensão c = ${voltageFactorC} (padrão 1,0 para redes ≤ 1 kV é VALOR_ASSUMIDO do plano 04; confirme com o engenheiro).`,
    `ΣR = ${total.resistanceOhm} Ω, ΣX = ${total.reactanceOhm} Ω`,
  ];

  if (!(params.voltageV > 0)) {
    return {
      ik3A: 0,
      ik3Ka: 0,
      voltageFactorC,
      sumResistanceOhm: total.resistanceOhm,
      sumReactanceOhm: total.reactanceOhm,
      formula,
      standardReference,
      notes: ['DADO_NAO_INFORMADO: tensão de linha deve ser maior que zero.'],
    };
  }

  const totalZ = Math.sqrt(total.resistanceOhm ** 2 + total.reactanceOhm ** 2);
  if (!(totalZ > 0)) {
    return {
      ik3A: 0,
      ik3Ka: 0,
      voltageFactorC,
      sumResistanceOhm: total.resistanceOhm,
      sumReactanceOhm: total.reactanceOhm,
      formula,
      standardReference,
      notes: ['DADO_NAO_INFORMADO: impedância total zerada — informe rede, transformador e/ou cabo.'],
    };
  }

  const ik3A = (voltageFactorC * params.voltageV) / (Math.sqrt(3) * totalZ);

  return {
    ik3A: Math.round(ik3A * 100) / 100,
    ik3Ka: Math.round((ik3A / 1000) * 100) / 100,
    voltageFactorC,
    sumResistanceOhm: total.resistanceOhm,
    sumReactanceOhm: total.reactanceOhm,
    formula,
    standardReference,
    notes,
  };
}

/**
 * Corrente de curto no secundário do transformador:
 *   I_cc = I_n(sec) / (z% / 100)
 * Reutiliza a implementação existente em lib/electrical-calc.ts.
 */
export function calculateTransformerShortCircuitCurrent(params: {
  transformerKva: number;
  secondaryVoltageV: number;
  impedancePercent?: number;
}): TransformerShortCircuitResult {
  const impedancePercent = params.impedancePercent ?? 5.0;

  if (!(params.transformerKva > 0) || !(params.secondaryVoltageV > 0) || !(impedancePercent > 0)) {
    return {
      ikA: 0,
      ikKa: 0,
      formula: 'I_cc = I_n(sec) / (z% / 100)',
      standardReference: 'IEC 60909 / NBR 14039',
      notes: ['DADO_NAO_INFORMADO: potência, tensão secundária e/ou impedância (%) ausentes ou inválidas.'],
    };
  }

  const base = calcTransformerShortCircuit(
    params.transformerKva,
    params.secondaryVoltageV,
    impedancePercent
  );

  return {
    ikA: Math.round(base.value * 1000),
    ikKa: base.value,
    formula: base.formula,
    standardReference: base.standardReference,
    notes: [
      base.notes ?? '',
      params.impedancePercent === undefined
        ? 'z% não informada -> 5,0% utilizado como VALOR_ASSUMIDO; substitua pelo valor da placa do transformador.'
        : `z% = ${impedancePercent}% informada pelo usuário.`,
    ].filter(Boolean),
  };
}
