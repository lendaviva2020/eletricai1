// Electrical calculations engine per ABNT NBR 5410, IEC 60364-5-52, and IEC 60909
import { NBR5410_AMPACITY_TABLE, GROUPING_FACTORS, getTemperatureFactor } from '@/lib/nbr5410';

export interface CalculationResult<T> {
  value: T;
  formula: string;
  inputs: Record<string, string | number>;
  unit: string;
  standardReference: string;
  notes?: string;
  warnings?: string[];
}

// 1. Corrente de Projeto Trifásica (Ib)
export function calcThreePhaseIb(
  powerKw: number,
  voltageV: number,
  powerFactor = 0.85,
  efficiency = 0.92
): CalculationResult<number> {
  const pWatts = powerKw * 1000;
  const denominator = Math.sqrt(3) * voltageV * powerFactor * efficiency;
  const ib = denominator > 0 ? pWatts / denominator : 0;
  const rounded = Math.round(ib * 100) / 100;

  const warnings: string[] = [];
  if (powerFactor < 0.8) warnings.push('Fator de potência baixo (< 0.80). Recomenda-se compensação reativa.');
  if (voltageV <= 0) warnings.push('Tensão nominal inválida.');

  return {
    value: rounded,
    formula: 'Ib = P / (√3 · V · cos φ · η)',
    inputs: {
      'P (kW)': powerKw,
      'V (Volts)': voltageV,
      'cos φ': powerFactor,
      'Rendimento η': efficiency,
    },
    unit: 'A',
    standardReference: 'NBR 5410 item 6.2.2 / IEC 60364-5-52',
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// 2. Potência Aparente e Reativa
export function calcPowers(powerKw: number, powerFactor = 0.85): {
  activeKw: number;
  apparentKva: CalculationResult<number>;
  reactiveKvar: CalculationResult<number>;
} {
  const apparent = powerFactor > 0 ? powerKw / powerFactor : powerKw;
  const apparentRounded = Math.round(apparent * 100) / 100;

  // Q = √(S² - P²)
  const reactive = Math.sqrt(Math.max(0, apparent * apparent - powerKw * powerKw));
  const reactiveRounded = Math.round(reactive * 100) / 100;

  return {
    activeKw: powerKw,
    apparentKva: {
      value: apparentRounded,
      formula: 'S = P / cos φ',
      inputs: { 'P (kW)': powerKw, 'cos φ': powerFactor },
      unit: 'kVA',
      standardReference: 'NBR 5410 item 6.2.1',
    },
    reactiveKvar: {
      value: reactiveRounded,
      formula: 'Q = √(S² - P²)',
      inputs: { 'S (kVA)': apparentRounded, 'P (kW)': powerKw },
      unit: 'kVAr',
      standardReference: 'NBR 5410 item 6.2.1',
    },
  };
}

// 3. Queda de Tensão Detalhada ΔV (%)
export function calcDetailedVoltageDrop(
  ibAmps: number,
  lengthMeters: number,
  sectionMm2: number,
  voltageV: number,
  powerFactor = 0.85
): CalculationResult<{ dropVolts: number; dropPercent: number; isCompliant: boolean }> {
  const row = NBR5410_AMPACITY_TABLE.find(r => r.sectionMm2 === sectionMm2) || NBR5410_AMPACITY_TABLE[0];
  const rOhm = (row.resistanceOhmPerKm / 1000) * lengthMeters;
  const xOhm = (row.reactanceOhmPerKm / 1000) * lengthMeters;
  const sinPhi = Math.sqrt(1 - Math.min(1, powerFactor * powerFactor));

  // ΔU = √3 * I * (R * cosφ + X * sinφ)
  const dropVolts = Math.sqrt(3) * ibAmps * (rOhm * powerFactor + xOhm * sinPhi);
  const dropPercent = voltageV > 0 ? (dropVolts / voltageV) * 100 : 0;
  const isCompliant = dropPercent <= 4.0;

  const warnings: string[] = [];
  if (dropPercent > 4.0) {
    warnings.push(`Queda de tensão de ${dropPercent.toFixed(2)}% excede o limite normativo de 4.0% da NBR 5410. Aumente a bitola do cabo.`);
  }

  return {
    value: {
      dropVolts: Math.round(dropVolts * 100) / 100,
      dropPercent: Math.round(dropPercent * 100) / 100,
      isCompliant,
    },
    formula: 'ΔU = √3 · Ib · (R · cos φ + X · sen φ) | ΔV% = (ΔU / V) · 100',
    inputs: {
      'Ib (A)': ibAmps,
      'Comprimento (m)': lengthMeters,
      'Seção (mm²)': sectionMm2,
      'Tensão (V)': voltageV,
      'R (Ω/km)': row.resistanceOhmPerKm,
      'X (Ω/km)': row.reactanceOhmPerKm,
      'cos φ': powerFactor,
    },
    unit: '%',
    standardReference: 'ABNT NBR 5410 item 6.2.7 (Tabela 46 e limites de 4% para circuitos terminais)',
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// 4. Curto-Circuito Simétrico Presumido no Secundário do Transformador (Icc)
export function calcTransformerShortCircuit(
  trafoKva: number,
  secondaryVoltageV: number,
  impedanceZPercent = 5.0
): CalculationResult<number> {
  // In_sec = S / (√3 * V)
  const inSec = (trafoKva * 1000) / (Math.sqrt(3) * secondaryVoltageV);
  // Icc = In_sec / (Z% / 100)
  const icc = inSec / (impedanceZPercent / 100);
  const iccKa = icc / 1000;
  const rounded = Math.round(iccKa * 10) / 10;

  return {
    value: rounded,
    formula: 'Icc = In_sec / (z% / 100) onde In_sec = S_trafo / (√3 · V_sec)',
    inputs: {
      'S Trafo (kVA)': trafoKva,
      'Tensão Secundária (V)': secondaryVoltageV,
      'Impedância z%': `${impedanceZPercent}%`,
    },
    unit: 'kA',
    standardReference: 'IEC 60909 / NBR 14039 Cálculo de Correntes de Curto-Circuito',
    notes: `Capacidade mínima de interrupção (Icu) do disjuntor geral deve ser superior a ${rounded} kA.`,
  };
}

// 5. Dimensionamento do Banco de Capacitores para correção de cos φ
export function calcCapacitorBankRequired(
  activePowerKw: number,
  currentPf: number,
  targetPf = 0.95
): CalculationResult<number> {
  const phi1 = Math.acos(Math.min(0.999, Math.max(0.1, currentPf)));
  const phi2 = Math.acos(Math.min(0.999, Math.max(0.1, targetPf)));
  const tan1 = Math.tan(phi1);
  const tan2 = Math.tan(phi2);

  // Qc = P * (tan φ1 - tan φ2)
  const qc = activePowerKw * Math.max(0, tan1 - tan2);
  const rounded = Math.round(qc * 10) / 10;

  return {
    value: rounded,
    formula: 'Qc = P · (tg φ1 - tg φ2) com φ = arccos(FP)',
    inputs: {
      'Potência Ativa P (kW)': activePowerKw,
      'FP Atual (cos φ1)': currentPf,
      'FP Alvo (cos φ2)': targetPf,
    },
    unit: 'kVAr',
    standardReference: 'Resolução Normativa ANEEL / NBR 5410 item 6.2.11',
    notes: `Banco automático com degraus mínimos recomendado para atingir cos φ >= ${targetPf}.`,
  };
}

// 6. Capacidade de Condução e Sobrecarga (Critério Ib <= In <= Iz)
export function verifyOverloadCoordination(
  ibAmps: number,
  inBreakerAmps: number,
  izCableAmps: number
): {
  isCompliant: boolean;
  statusText: string;
  marginPercent: number;
} {
  const cond1 = ibAmps <= inBreakerAmps;
  const cond2 = inBreakerAmps <= izCableAmps;
  const isCompliant = cond1 && cond2;

  let statusText = 'Coordenação plena NBR 5410 item 5.3.4 (Ib ≤ In ≤ Iz)';
  if (!cond1) {
    statusText = `Disjuntor subdimensionado: In (${inBreakerAmps}A) < Ib (${ibAmps}A) - Risco de desarme espúrio.`;
  } else if (!cond2) {
    statusText = `Cabo desprotegido contra sobrecarga: In (${inBreakerAmps}A) > Iz (${izCableAmps}A) - Risco de superaquecimento.`;
  }

  const marginPercent = Math.round(((izCableAmps - inBreakerAmps) / izCableAmps) * 100);

  return {
    isCompliant,
    statusText,
    marginPercent,
  };
}
