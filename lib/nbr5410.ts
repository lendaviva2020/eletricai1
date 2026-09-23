// NBR 5410 / NBR 14039 Engineering Engine for EletricAI

export interface CableAmpacityRow {
  sectionMm2: number;
  resistanceOhmPerKm: number; // Resistência elétrica em CA a 75°C
  reactanceOhmPerKm: number;  // Reatância indutiva
  // Capacidade de corrente (A) - 3 condutores carregados (Trifásico)
  methodB1_PVC: number; // Embutido em alvenaria
  methodC_PVC: number;  // Ao ar livre / bandeja
  methodB1_EPR: number; // EPR/XLPE 90°C
  methodC_EPR: number;  // EPR/XLPE 90°C
}

export const NBR5410_AMPACITY_TABLE: CableAmpacityRow[] = [
  { sectionMm2: 1.5, resistanceOhmPerKm: 14.8, reactanceOhmPerKm: 0.115, methodB1_PVC: 15.5, methodC_PVC: 17.5, methodB1_EPR: 19.5, methodC_EPR: 22.0 },
  { sectionMm2: 2.5, resistanceOhmPerKm: 8.91, reactanceOhmPerKm: 0.108, methodB1_PVC: 21.0, methodC_PVC: 24.0, methodB1_EPR: 27.0, methodC_EPR: 30.0 },
  { sectionMm2: 4.0, resistanceOhmPerKm: 5.57, reactanceOhmPerKm: 0.101, methodB1_PVC: 28.0, methodC_PVC: 32.0, methodB1_EPR: 36.0, methodC_EPR: 40.0 },
  { sectionMm2: 6.0, resistanceOhmPerKm: 3.71, reactanceOhmPerKm: 0.096, methodB1_PVC: 36.0, methodC_PVC: 41.0, methodB1_EPR: 46.0, methodC_EPR: 52.0 },
  { sectionMm2: 10.0, resistanceOhmPerKm: 2.24, reactanceOhmPerKm: 0.090, methodB1_PVC: 50.0, methodC_PVC: 57.0, methodB1_EPR: 63.0, methodC_EPR: 71.0 },
  { sectionMm2: 16.0, resistanceOhmPerKm: 1.41, reactanceOhmPerKm: 0.086, methodB1_PVC: 68.0, methodC_PVC: 76.0, methodB1_EPR: 85.0, methodC_EPR: 96.0 },
  { sectionMm2: 25.0, resistanceOhmPerKm: 0.889, reactanceOhmPerKm: 0.083, methodB1_PVC: 89.0, methodC_PVC: 101.0, methodB1_EPR: 112.0, methodC_EPR: 127.0 },
  { sectionMm2: 35.0, resistanceOhmPerKm: 0.641, reactanceOhmPerKm: 0.081, methodB1_PVC: 110.0, methodC_PVC: 125.0, methodB1_EPR: 138.0, methodC_EPR: 157.0 },
  { sectionMm2: 50.0, resistanceOhmPerKm: 0.473, reactanceOhmPerKm: 0.079, methodB1_PVC: 134.0, methodC_PVC: 151.0, methodB1_EPR: 168.0, methodC_EPR: 190.0 },
  { sectionMm2: 70.0, resistanceOhmPerKm: 0.328, reactanceOhmPerKm: 0.077, methodB1_PVC: 171.0, methodC_PVC: 192.0, methodB1_EPR: 213.0, methodC_EPR: 242.0 },
  { sectionMm2: 95.0, resistanceOhmPerKm: 0.236, reactanceOhmPerKm: 0.076, methodB1_PVC: 207.0, methodC_PVC: 232.0, methodB1_EPR: 258.0, methodC_EPR: 293.0 },
  { sectionMm2: 120.0, resistanceOhmPerKm: 0.188, reactanceOhmPerKm: 0.074, methodB1_PVC: 239.0, methodC_PVC: 269.0, methodB1_EPR: 299.0, methodC_EPR: 339.0 },
  { sectionMm2: 150.0, resistanceOhmPerKm: 0.153, reactanceOhmPerKm: 0.074, methodB1_PVC: 272.0, methodC_PVC: 300.0, methodB1_EPR: 344.0, methodC_EPR: 389.0 },
  { sectionMm2: 185.0, resistanceOhmPerKm: 0.123, reactanceOhmPerKm: 0.073, methodB1_PVC: 310.0, methodC_PVC: 341.0, methodB1_EPR: 392.0, methodC_EPR: 444.0 },
  { sectionMm2: 240.0, resistanceOhmPerKm: 0.094, reactanceOhmPerKm: 0.072, methodB1_PVC: 364.0, methodC_PVC: 400.0, methodB1_EPR: 461.0, methodC_EPR: 522.0 },
];

// Fatores de agrupamento (FCA) da Tabela 42 da NBR 5410
export const GROUPING_FACTORS: Record<number, number> = {
  1: 1.00,
  2: 0.80,
  3: 0.70,
  4: 0.65,
  5: 0.60,
  6: 0.57,
  7: 0.54,
  8: 0.52,
  9: 0.50,
};

// Fatores de temperatura ambiente (FCT) para ar (Tabela 40 da NBR 5410)
export function getTemperatureFactor(tempCelsius: number, insulation: 'PVC' | 'EPR'): number {
  if (insulation === 'PVC') {
    if (tempCelsius <= 25) return 1.06;
    if (tempCelsius <= 30) return 1.00;
    if (tempCelsius <= 35) return 0.94;
    if (tempCelsius <= 40) return 0.87;
    if (tempCelsius <= 45) return 0.79;
    if (tempCelsius <= 50) return 0.71;
    return 0.61;
  } else {
    // EPR / XLPE 90°C
    if (tempCelsius <= 25) return 1.04;
    if (tempCelsius <= 30) return 1.00;
    if (tempCelsius <= 35) return 0.96;
    if (tempCelsius <= 40) return 0.91;
    if (tempCelsius <= 45) return 0.87;
    if (tempCelsius <= 50) return 0.82;
    return 0.76;
  }
}

// Cálculo de Corrente de Projeto Trifásica Ib (A)
export function calculateThreePhaseIb(powerKw: number, voltageV: number, powerFactor: number = 0.85, efficiency: number = 0.92): number {
  if (voltageV <= 0) return 0;
  const pWatts = powerKw * 1000;
  const ib = pWatts / (Math.sqrt(3) * voltageV * powerFactor * efficiency);
  return Math.round(ib * 100) / 100;
}

// Cálculo de Queda de Tensão Trifásica ΔV (%) per NBR 5410
export function calculateVoltageDropPercent(
  ibAmps: number,
  lengthMeters: number,
  sectionMm2: number,
  voltageV: number,
  powerFactor: number = 0.85
): { dropVolts: number; dropPercent: number; isCompliant: number } {
  const row = NBR5410_AMPACITY_TABLE.find(r => r.sectionMm2 === sectionMm2) || NBR5410_AMPACITY_TABLE[0];
  const rOhm = (row.resistanceOhmPerKm / 1000) * lengthMeters;
  const xOhm = (row.reactanceOhmPerKm / 1000) * lengthMeters;
  const sinPhi = Math.sqrt(1 - Math.min(1, powerFactor * powerFactor));

  // ΔU = √3 * I * (R * cosφ + X * sinφ)
  const dropVolts = Math.sqrt(3) * ibAmps * (rOhm * powerFactor + xOhm * sinPhi);
  const dropPercent = (dropVolts / voltageV) * 100;
  const maxAllowed = 4.0; // NBR 5410 limite padrão 4% alimentadores

  return {
    dropVolts: Math.round(dropVolts * 100) / 100,
    dropPercent: Math.round(dropPercent * 100) / 100,
    isCompliant: dropPercent <= maxAllowed ? 1 : 0,
  };
}

// Dimensionamento automático de condutor e disjuntor per NBR 5410
export function autoSizeCircuit(params: {
  powerKw: number;
  voltageV: number;
  lengthMeters: number;
  insulation: 'PVC' | 'EPR';
  ambientTempC: number;
  groupingCircuits: number;
  installationMethod: 'B1' | 'C';
  powerFactor?: number;
  efficiency?: number;
}) {
  const pf = params.powerFactor ?? 0.85;
  const eff = params.efficiency ?? 0.92;
  const ib = calculateThreePhaseIb(params.powerKw, params.voltageV, pf, eff);
  
  const fct = getTemperatureFactor(params.ambientTempC, params.insulation);
  const fca = GROUPING_FACTORS[Math.min(9, Math.max(1, params.groupingCircuits))] || 0.7;
  const correctionFactor = fct * fca;
  const requiredIz = ib / correctionFactor;

  // Encontrar a menor bitola que suporte Iz e ΔV <= 4%
  let selectedRow = NBR5410_AMPACITY_TABLE[0];
  let found = false;

  for (const row of NBR5410_AMPACITY_TABLE) {
    let ampacity = row.methodB1_PVC;
    if (params.installationMethod === 'B1') {
      ampacity = params.insulation === 'PVC' ? row.methodB1_PVC : row.methodB1_EPR;
    } else {
      ampacity = params.insulation === 'PVC' ? row.methodC_PVC : row.methodC_EPR;
    }

    if (ampacity >= requiredIz) {
      const vDrop = calculateVoltageDropPercent(ib, params.lengthMeters, row.sectionMm2, params.voltageV, pf);
      if (vDrop.dropPercent <= 4.0) {
        selectedRow = row;
        found = true;
        break;
      }
    }
  }

  if (!found) {
    selectedRow = NBR5410_AMPACITY_TABLE[NBR5410_AMPACITY_TABLE.length - 1];
  }

  // Disjuntor comercial mais próximo (In >= Ib e In <= Iz corrigido)
  const standardBreakers = [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000];
  let selectedBreakerIn = standardBreakers[standardBreakers.length - 1];
  for (const b of standardBreakers) {
    if (b >= ib) {
      selectedBreakerIn = b;
      break;
    }
  }

  const vDrop = calculateVoltageDropPercent(ib, params.lengthMeters, selectedRow.sectionMm2, params.voltageV, pf);

  return {
    ib,
    requiredIz: Math.round(requiredIz * 10) / 10,
    correctionFactor: Math.round(correctionFactor * 100) / 100,
    selectedCableMm2: selectedRow.sectionMm2,
    selectedBreakerIn,
    voltageDropPercent: vDrop.dropPercent,
    voltageDropVolts: vDrop.dropVolts,
    isCompliant: vDrop.dropPercent <= 4.0,
    normativeText: `NBR 5410 - 6.2.5 (Capacidade de condução) & 6.2.7 (Queda de tensão máx 4%). FCA=${fca}, FCT=${fct}.`,
  };
}
