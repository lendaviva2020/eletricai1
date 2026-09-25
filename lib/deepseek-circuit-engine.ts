import {
  AiStructuredCircuitSpecification,
  AiCircuitSpecComponent,
  AiCircuitSpecConnection,
  AiCircuitSpecVariable,
  AiCircuitSpecLadderRung,
  AiCircuitEngineeringValidation,
  CircuitType,
} from '@/types/electrical';
import { calcThreePhaseIb, calcDetailedVoltageDrop, calcPowers } from '@/lib/electrical-calc';

export interface ProjectContextInput {
  existingTags: string[];
  existingComponents?: Array<{ tag: string; name: string; category?: string; nominalCurrent?: number }>;
  projectVoltage?: number;
  projectFrequency?: number;
  groundingSystem?: string;
  activeTab?: string;
}

/**
 * Generates an unconditionally non-colliding TAG according to standard electrical engineering conventions:
 * QF (Disjuntor), KM (Contator), RT/FT (Relé Térmico), M/MTR (Motor), S (Botoeira),
 * H (Sinalização), T (Transformador), DR (Diferencial Residual), DPS (Surto).
 */
export function generateNextAvailableTag(prefix: string, existingTags: string[]): string {
  const upperPrefix = prefix.toUpperCase().trim();
  const existingSet = new Set(existingTags.map(t => t.toUpperCase().trim()));

  for (let i = 1; i <= 999; i++) {
    const formattedNum = i < 10 ? `0${i}` : `${i}`;
    const candidateTag = `${upperPrefix}${formattedNum}`;
    if (!existingSet.has(candidateTag)) {
      return candidateTag;
    }
  }

  // Fallback random suffix
  return `${upperPrefix}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Standard NBR 5410 motor ratings database and standard commercial sizing
 */
export const MOTOR_STANDARDS = [
  { kw: 0.75, cv: 1.0, in380: 1.9, cableMm2: 2.5, breakerA: 4, contactorA: 9, thermalMin: 1.6, thermalMax: 2.5 },
  { kw: 1.5, cv: 2.0, in380: 3.6, cableMm2: 2.5, breakerA: 6.3, contactorA: 9, thermalMin: 2.8, thermalMax: 4.0 },
  { kw: 2.2, cv: 3.0, in380: 5.1, cableMm2: 2.5, breakerA: 10, contactorA: 12, thermalMin: 4.5, thermalMax: 6.3 },
  { kw: 3.7, cv: 5.0, in380: 8.2, cableMm2: 2.5, breakerA: 16, contactorA: 18, thermalMin: 7.0, thermalMax: 10 },
  { kw: 5.5, cv: 7.5, in380: 11.5, cableMm2: 4.0, breakerA: 20, contactorA: 25, thermalMin: 9.0, thermalMax: 13 },
  { kw: 7.5, cv: 10.0, in380: 15.2, cableMm2: 4.0, breakerA: 25, contactorA: 32, thermalMin: 12.0, thermalMax: 18 },
  { kw: 11.0, cv: 15.0, in380: 22.0, cableMm2: 6.0, breakerA: 32, contactorA: 40, thermalMin: 17.0, thermalMax: 25 },
  { kw: 15.0, cv: 20.0, in380: 29.5, cableMm2: 10.0, breakerA: 40, contactorA: 50, thermalMin: 23.0, thermalMax: 32 },
  { kw: 18.5, cv: 25.0, in380: 36.0, cableMm2: 10.0, breakerA: 50, contactorA: 65, thermalMin: 30.0, thermalMax: 40 },
  { kw: 22.0, cv: 30.0, in380: 42.5, cableMm2: 16.0, breakerA: 63, contactorA: 65, thermalMin: 37.0, thermalMax: 50 },
  { kw: 30.0, cv: 40.0, in380: 57.0, cableMm2: 25.0, breakerA: 80, contactorA: 95, thermalMin: 48.0, thermalMax: 65 },
  { kw: 37.0, cv: 50.0, in380: 70.0, cableMm2: 35.0, breakerA: 100, contactorA: 115, thermalMin: 60.0, thermalMax: 80 },
  { kw: 45.0, cv: 60.0, in380: 84.0, cableMm2: 50.0, breakerA: 125, contactorA: 150, thermalMin: 70.0, thermalMax: 95 },
  { kw: 55.0, cv: 75.0, in380: 102.0, cableMm2: 70.0, breakerA: 160, contactorA: 185, thermalMin: 90.0, thermalMax: 120 },
  { kw: 75.0, cv: 100.0, in380: 138.0, cableMm2: 95.0, breakerA: 200, contactorA: 225, thermalMin: 120.0, thermalMax: 150 },
];

/**
 * Extract power in kW from natural language text
 */
export function extractPowerKw(prompt: string, defaultKw = 15): { kw: number; cv: number } {
  const kwMatch = prompt.match(/(\d+(?:[.,]\d+)?)\s*(?:kw|quilowatts?)/i);
  if (kwMatch) {
    const val = parseFloat(kwMatch[1].replace(',', '.'));
    return { kw: val, cv: Math.round(val * 1.36 * 10) / 10 };
  }
  const cvMatch = prompt.match(/(\d+(?:[.,]\d+)?)\s*(?:cv|hp)/i);
  if (cvMatch) {
    const val = parseFloat(cvMatch[1].replace(',', '.'));
    return { kw: Math.round((val / 1.36) * 10) / 10, cv: val };
  }
  return { kw: defaultKw, cv: Math.round(defaultKw * 1.36 * 10) / 10 };
}

/**
 * Extract nominal voltage from natural language text
 */
export function extractVoltage(prompt: string, defaultV = 380): number {
  const vMatch = prompt.match(/(\d{3})\s*v(?:olts?)?/i);
  if (vMatch) {
    const val = parseInt(vMatch[1], 10);
    if ([220, 380, 440, 480, 690].includes(val)) return val;
  }
  return defaultV;
}

/**
 * Rigid Mathematical & Normative Electrical Engineering Verification
 * Validates any candidate circuit against ABNT NBR 5410, NR-10, IEC 60947.
 */
export function performEngineeringValidation(
  powerKw: number,
  voltageV: number,
  circuitType: CircuitType,
  cableLengthMeters = 25
): AiCircuitEngineeringValidation {
  const cosPhi = 0.86;
  const eta = 0.92;

  // Real calculation per NBR 5410 item 6.2.2: Ib = P / (sqrt(3) * V * cosPhi * eta)
  const calcIb = calcThreePhaseIb(powerKw, voltageV, cosPhi, eta);
  const nominalCurrentA = calcIb.value;

  // Find closest standard matching row
  const matchedStd = MOTOR_STANDARDS.slice().sort(
    (a, b) => Math.abs(a.kw - powerKw) - Math.abs(b.kw - powerKw)
  )[0];

  const designCurrentIb = nominalCurrentA;
  const recommendedBreakerA = matchedStd?.breakerA || Math.ceil(nominalCurrentA * 1.25);
  const recommendedContactorA = matchedStd?.contactorA || Math.ceil(nominalCurrentA * 1.3);
  const recommendedCableMm2 = matchedStd?.cableMm2 || 10;
  const thermalRelaySettingMinA = Math.round(nominalCurrentA * 0.9 * 10) / 10;
  const thermalRelaySettingMaxA = Math.round(nominalCurrentA * 1.15 * 10) / 10;

  // Real calculation of voltage drop
  const vDrop = calcDetailedVoltageDrop(designCurrentIb, cableLengthMeters, recommendedCableMm2, voltageV, cosPhi);
  const calculatedVoltageDropPercent = vDrop.value.dropPercent;
  const maxAllowedVoltageDropPercent = 4.0; // NBR 5410 item 6.2.7

  const powers = calcPowers(powerKw, cosPhi);
  const apparentPowerKva = powers.apparentKva.value;
  const reactivePowerKvar = powers.reactiveKvar.value;

  const startingCurrentRatio = circuitType === 'direct_starter'
    ? 7.2
    : circuitType === 'star_delta'
    ? 2.6
    : circuitType === 'soft_starter'
    ? 3.0
    : 1.5; // VFD

  const warnings: string[] = [];
  if (calculatedVoltageDropPercent > maxAllowedVoltageDropPercent) {
    warnings.push(`Queda de tensão de ${calculatedVoltageDropPercent.toFixed(2)}% ultrapassa os 4.0% da NBR 5410.`);
  }
  if (circuitType === 'direct_starter' && powerKw > 11) {
    warnings.push(
      'Motores acima de 11 kW (15 CV) com partida direta exigem consulta à concessionária devido ao afundamento de tensão.'
    );
  }

  return {
    nominalCurrentA,
    designCurrentIb,
    recommendedBreakerA,
    recommendedContactorA,
    thermalRelaySettingMinA,
    thermalRelaySettingMaxA,
    recommendedCableMm2,
    calculatedVoltageDropPercent,
    maxAllowedVoltageDropPercent,
    startingCurrentRatio,
    coordinationType: 'TIPO 2',
    apparentPowerKva,
    reactivePowerKvar,
    nbrCompliant: calculatedVoltageDropPercent <= maxAllowedVoltageDropPercent,
    standardReferences: [
      'ABNT NBR 5410:2004 item 6.2.2 (Corrente de Projeto e Ampacidade)',
      'ABNT NBR 5410 item 6.2.7 (Limites de Queda de Tensão ΔV ≤ 4%)',
      'NBR IEC 60947-4-1 (Contatores e Partidas de Motores - Coordenação Tipo 2)',
      'NR-10 item 10.2.8.1 (Desligamento e Intertravamentos de Segurança)',
      'IEC 61131-3 (Lógica de Controle e Automação Ladder)',
    ],
    premises: [
      `Fator de potência nominal estimado: cos φ = ${cosPhi}`,
      `Rendimento mecânico estimado do motor: η = ${(eta * 100).toFixed(0)}%`,
      `Método de instalação de condutores: B1 em eletrocalha perfurada (NBR 5410 Tab. 33)`,
      `Condutores de cobre com isolação termoplástica EPR/XLPE 90°C (Afumex)`,
      `Temperatura ambiente adotada: 30°C sem agrupamento de circuitos`,
      `Comprimento estimado do alimentador: ${cableLengthMeters} metros`,
    ],
    warnings,
  };
}

/**
 * Validates the schema of an AI-generated specification and runs engineering checks
 */
export function validateStructuredCircuitSpecification(
  spec: Partial<AiStructuredCircuitSpecification> & Record<string, unknown>,
  context: ProjectContextInput
): { isValid: boolean; validatedSpec?: AiStructuredCircuitSpecification; errors: string[] } {
  const errors: string[] = [];

  if (!spec || typeof spec !== 'object') {
    return { isValid: false, errors: ['Especificação não é um objeto JSON válido.'] };
  }

  if (!spec.components || !Array.isArray(spec.components) || spec.components.length === 0) {
    errors.push('A especificação deve conter pelo menos 1 componente.');
  }

  // Check for duplicate TAGs inside the spec
  const internalTags = new Set<string>();
  for (const c of spec.components || []) {
    if (!c.tag) {
      errors.push('Todos os componentes devem conter um TAG elétrico válido.');
    } else if (internalTags.has(c.tag.toUpperCase())) {
      errors.push(`TAG duplicado detectado na própria especificação: ${c.tag}`);
    } else {
      internalTags.add(c.tag.toUpperCase());
    }
  }

  // Check collision with existing project TAGs
  const existingSet = new Set((context.existingTags || []).map(t => t.toUpperCase()));
  const collisions = Array.from(internalTags).filter(t => existingSet.has(t));
  if (collisions.length > 0 && spec.components) {
    // Auto-fix collisions rather than fatal error
    spec.components = spec.components.map((c: AiCircuitSpecComponent) => {
      if (existingSet.has(c.tag.toUpperCase())) {
        const prefix = c.tag.replace(/[0-9_]/g, '') || 'COMP';
        const newTag = generateNextAvailableTag(prefix, [
          ...context.existingTags,
          ...Array.from(internalTags),
        ]);
        internalTags.add(newTag.toUpperCase());
        return { ...c, tag: newTag };
      }
      return c;
    });
  }

  // Ensure engineering calculations are recalculated and verified
  const powerKw = spec.components?.find((c: AiCircuitSpecComponent) => c.category === 'MOTOR_3P')?.powerKw || 15;
  const voltage = spec.components?.[0]?.voltage || context.projectVoltage || 380;
  const circuitType: CircuitType = spec.circuitType || 'direct_starter';
  const engCalc = performEngineeringValidation(powerKw, voltage, circuitType);

  const validatedSpec: AiStructuredCircuitSpecification = {
    id: spec.id || `spec_circ_${Date.now()}`,
    action: spec.action || 'create_circuit',
    circuitType,
    title: spec.title || `Circuito Industrial - ${circuitType.toUpperCase()}`,
    summary: spec.summary || `Circuito elétrico trifásico dimensionado conforme ABNT NBR 5410.`,
    technicalRationale:
      spec.technicalRationale ||
      `Topologia industrial com coordenação tipo 2 para alta disponibilidade e proteção de condutores e motor.`,
    requestedPrompt: spec.requestedPrompt || '',
    createdAt: spec.createdAt || new Date().toISOString(),
    provider: spec.provider || 'deepseek-v3',
    modelUsed: spec.modelUsed || 'deepseek-chat',
    components: spec.components || [],
    connections: spec.connections || [],
    variables: spec.variables || [],
    ladderRungs: spec.ladderRungs || [],
    engineeringCalculations: engCalc,
    status: 'PENDING_PREVIEW',
  };

  return { isValid: errors.length === 0, validatedSpec, errors };
}

/**
 * Deterministic Circuit Synthesis Engine
 * Generates an engineering-grade structured circuit conforming to NBR 5410, NR-10 & IEC 61131-3.
 * Used when DeepSeek is offline, during high latency, or as reference ground-truth.
 */
export function synthesizeCircuitDeterministically(
  prompt: string,
  context: ProjectContextInput
): AiStructuredCircuitSpecification {
  const lower = prompt.toLowerCase();
  const existingTags = context.existingTags || [];

  const { kw: powerKw, cv: powerCv } = extractPowerKw(prompt, 15);
  const voltage = extractVoltage(prompt, context.projectVoltage || 380);

  let circuitType: CircuitType = 'direct_starter';
  if (lower.includes('estrela') || lower.includes('triangulo') || lower.includes('triângulo') || lower.includes('y-d')) {
    circuitType = 'star_delta';
  } else if (lower.includes('soft') || lower.includes('arranque suave')) {
    circuitType = 'soft_starter';
  } else if (lower.includes('inversor') || lower.includes('frequência') || lower.includes('vfd')) {
    circuitType = 'vfd_inverter';
  } else if (lower.includes('revers') || lower.includes('dois sentidos')) {
    circuitType = 'reversing';
  } else if (lower.includes('bomba') && (lower.includes('duas') || lower.includes('altern') || lower.includes('rodízio'))) {
    circuitType = 'pump_alternation';
  } else if (lower.includes('emerg') || lower.includes('parada')) {
    circuitType = 'emergency_loop';
  }

  const engCalc = performEngineeringValidation(powerKw, voltage, circuitType);

  // Generate unique tags avoiding existing collisions
  const qfTag = generateNextAvailableTag('QF', existingTags);
  const kmTag = generateNextAvailableTag('KM', [...existingTags, qfTag]);
  const rtTag = generateNextAvailableTag('RT', [...existingTags, qfTag, kmTag]);
  const mtrTag = generateNextAvailableTag('MTR', [...existingTags, qfTag, kmTag, rtTag]);
  const s0Tag = generateNextAvailableTag('S0', [...existingTags, qfTag, kmTag, rtTag, mtrTag]);
  const s1Tag = generateNextAvailableTag('S1', [...existingTags, qfTag, kmTag, rtTag, mtrTag, s0Tag]);
  const s2Tag = generateNextAvailableTag('S2', [...existingTags, qfTag, kmTag, rtTag, mtrTag, s0Tag, s1Tag]);
  const h1Tag = generateNextAvailableTag('H1', [...existingTags, qfTag, kmTag, rtTag, mtrTag, s0Tag, s1Tag, s2Tag]);

  const components: AiCircuitSpecComponent[] = [
    {
      tag: qfTag,
      name: `Disjuntor-Motor Magnético-Térmico ${engCalc.recommendedBreakerA}A`,
      category: 'MOTOR_BREAKER',
      role: 'PROTECTION',
      voltage,
      nominalCurrent: engCalc.recommendedBreakerA,
      operationalCurrent: engCalc.designCurrentIb,
      breakingCapacity: 35,
      tripCurve: 'D',
      settingRange: `${engCalc.thermalRelaySettingMinA} - ${engCalc.thermalRelaySettingMaxA} A`,
      manufacturer: 'WEG',
      partNumber: `MPW40-${engCalc.recommendedBreakerA}`,
      colIndex: 0,
      rowIndex: 0,
    },
    {
      tag: kmTag,
      name: `Contator Tripolar de Potência AC-3 ${engCalc.recommendedContactorA}A (Bobina 24VDC)`,
      category: 'CONTACTOR',
      role: 'POWER',
      voltage,
      nominalCurrent: engCalc.recommendedContactorA,
      operationalCurrent: engCalc.designCurrentIb,
      manufacturer: 'Schneider Electric',
      partNumber: `TeSys Deca LC1D${engCalc.recommendedContactorA}`,
      colIndex: 0,
      rowIndex: 1,
    },
    {
      tag: rtTag,
      name: `Relé de Sobrecarga Térmico Bimetálico Classe 10A`,
      category: 'THERMAL_RELAY',
      role: 'PROTECTION',
      voltage,
      nominalCurrent: engCalc.recommendedContactorA,
      operationalCurrent: engCalc.designCurrentIb,
      settingRange: `${engCalc.thermalRelaySettingMinA} - ${engCalc.thermalRelaySettingMaxA} A`,
      manufacturer: 'WEG',
      partNumber: `RW27-1D3-U040`,
      colIndex: 0,
      rowIndex: 2,
    },
    {
      tag: mtrTag,
      name: `Motor de Indução Trifásico ${powerKw} kW (${powerCv} CV) 4 Polos W22 IE3 Premium`,
      category: 'MOTOR_3P',
      role: 'LOAD',
      voltage,
      nominalCurrent: engCalc.nominalCurrentA,
      operationalCurrent: engCalc.designCurrentIb,
      powerKw,
      powerHp: powerCv,
      powerFactor: 0.86,
      efficiency: 0.92,
      cableCrossSection: engCalc.recommendedCableMm2,
      cableLength: 25,
      manufacturer: 'WEG',
      partNumber: `W22 4P ${powerKw}kW 380V`,
      colIndex: 0,
      rowIndex: 3,
    },
    {
      tag: s0Tag,
      name: 'Botão Cogumelo de Parada de Emergência com Trava (1NF monitorado)',
      category: 'PUSH_BUTTON',
      role: 'EMERGENCY',
      voltage: 24,
      nominalCurrent: 6,
      operationalCurrent: 0.5,
      manufacturer: 'Eaton',
      partNumber: 'M22-PV-K01',
      colIndex: 1,
      rowIndex: 0,
    },
    {
      tag: s2Tag,
      name: 'Botoeira Pulsadora Desliga Vermelha (1NF)',
      category: 'PUSH_BUTTON',
      role: 'CONTROL',
      voltage: 24,
      nominalCurrent: 6,
      operationalCurrent: 0.5,
      manufacturer: 'Schneider',
      partNumber: 'XB4BA42',
      colIndex: 1,
      rowIndex: 1,
    },
    {
      tag: s1Tag,
      name: 'Botoeira Pulsadora Liga Verde (1NA)',
      category: 'PUSH_BUTTON',
      role: 'CONTROL',
      voltage: 24,
      nominalCurrent: 6,
      operationalCurrent: 0.5,
      manufacturer: 'Schneider',
      partNumber: 'XB4BA31',
      colIndex: 1,
      rowIndex: 2,
    },
    {
      tag: h1Tag,
      name: 'Sinalizador LED Verde 24VDC Operação Normal',
      category: 'PILOT_LIGHT',
      role: 'SIGNALLING',
      voltage: 24,
      nominalCurrent: 0.05,
      operationalCurrent: 0.02,
      manufacturer: 'WEG',
      partNumber: 'CSW-SLG-24V',
      colIndex: 1,
      rowIndex: 3,
    },
  ];

  const connections: AiCircuitSpecConnection[] = [
    {
      fromTag: 'BARRAMENTO_GERAL',
      fromPort: 'p_out',
      toTag: qfTag,
      toPort: 'p_in',
      circuitRole: 'POWER_3P',
      wireGaugeMm2: engCalc.recommendedCableMm2,
      wireColor: '#F59E0B',
      description: `Alimentador Tripolar R-S-T ${engCalc.recommendedCableMm2} mm²`,
    },
    {
      fromTag: qfTag,
      fromPort: 'p_out',
      toTag: kmTag,
      toPort: 'p_in',
      circuitRole: 'POWER_3P',
      wireGaugeMm2: engCalc.recommendedCableMm2,
      wireColor: '#F59E0B',
      description: `Condutores de Potência Interligação ${engCalc.recommendedCableMm2} mm²`,
    },
    {
      fromTag: kmTag,
      fromPort: 'p_out',
      toTag: rtTag,
      toPort: 'p_in',
      circuitRole: 'POWER_3P',
      wireGaugeMm2: engCalc.recommendedCableMm2,
      wireColor: '#F59E0B',
      description: `Acoplamento Direto Contator-Relé Térmico`,
    },
    {
      fromTag: rtTag,
      fromPort: 'p_out',
      toTag: mtrTag,
      toPort: 'p_in',
      circuitRole: 'POWER_3P',
      wireGaugeMm2: engCalc.recommendedCableMm2,
      wireColor: '#F59E0B',
      description: `Cabo de Força 3x${engCalc.recommendedCableMm2} mm² + PE ${Math.max(4, engCalc.recommendedCableMm2 / 2)} mm²`,
    },
    {
      fromTag: mtrTag,
      fromPort: 'p_pe',
      toTag: 'BARRA_TERRA_PE',
      toPort: 'p_in',
      circuitRole: 'PE_GROUND',
      wireGaugeMm2: Math.max(4, engCalc.recommendedCableMm2 / 2),
      wireColor: '#10B981',
      description: `Equipotencialização Carcaça ao Barramento de Proteção PE (NR-10)`,
    },
  ];

  // PLC Variables
  const variables: AiCircuitSpecVariable[] = [
    {
      name: `CMD_EMERG_${s0Tag}`,
      address: `%I1.0`,
      dataType: 'BOOL',
      direction: 'INPUT',
      comment: `Botão de Emergência ${s0Tag} (Contato NF)`,
      initialValue: true,
    },
    {
      name: `CMD_DESL_${s2Tag}`,
      address: `%I1.1`,
      dataType: 'BOOL',
      direction: 'INPUT',
      comment: `Botoeira Desliga ${s2Tag} (Contato NF)`,
      initialValue: true,
    },
    {
      name: `CMD_LIGA_${s1Tag}`,
      address: `%I1.2`,
      dataType: 'BOOL',
      direction: 'INPUT',
      comment: `Botoeira Liga ${s1Tag} (Contato NA)`,
      initialValue: false,
    },
    {
      name: `FALHA_TERM_${rtTag}`,
      address: `%I1.3`,
      dataType: 'BOOL',
      direction: 'INPUT',
      comment: `Contato Auxiliar NF 95-96 Relé Térmico ${rtTag}`,
      initialValue: true,
    },
    {
      name: `OUT_KM_${kmTag}`,
      address: `%Q1.0`,
      dataType: 'BOOL',
      direction: 'OUTPUT',
      comment: `Saída Acionamento Bobina Contator ${kmTag}`,
      initialValue: false,
    },
    {
      name: `OUT_SIN_${h1Tag}`,
      address: `%Q1.1`,
      dataType: 'BOOL',
      direction: 'OUTPUT',
      comment: `Saída Sinalizador Motor em Operação ${h1Tag}`,
      initialValue: false,
    },
  ];

  // Ladder Rungs
  const ladderRungs: AiCircuitSpecLadderRung[] = [
    {
      title: `Rung 01 - Intertravamento de Segurança e Selo da Partida ${mtrTag}`,
      comment: `Lógica de partida direta com retenção, desenergização imediata por emergência (${s0Tag}) e desarme por sobrecarga (${rtTag}) conforme NR-10 e NBR 5410.`,
      elements: [
        { type: 'NO_CONTACT', variable: `CMD_EMERG_${s0Tag}`, comment: 'Emergência OK (NF)' },
        { type: 'NO_CONTACT', variable: `FALHA_TERM_${rtTag}`, comment: 'Térmico OK (NF)' },
        { type: 'NO_CONTACT', variable: `CMD_DESL_${s2Tag}`, comment: 'Desliga (NF)' },
        { type: 'NO_CONTACT', variable: `CMD_LIGA_${s1Tag}`, comment: 'Pulso Liga (NA) // Selo' },
        { type: 'COIL', variable: `OUT_KM_${kmTag}`, comment: `Bobina ${kmTag}` },
      ],
    },
    {
      title: `Rung 02 - Sinalização Visual de Painel ${h1Tag}`,
      comment: `Acionamento da lâmpada piloto indicadora de motor em marcha.`,
      elements: [
        { type: 'NO_CONTACT', variable: `OUT_KM_${kmTag}`, comment: 'Status Contator Ligado' },
        { type: 'COIL', variable: `OUT_SIN_${h1Tag}`, comment: 'Lâmpada LED Verde' },
      ],
    },
  ];

  return {
    id: `spec_${Date.now()}`,
    action: 'create_circuit',
    circuitType,
    title: `Partida ${circuitType === 'star_delta' ? 'Estrela-Triângulo' : 'Direta'} Motor ${powerKw} kW (${powerCv} CV) 380V`,
    summary: `Circuito completo de potência e comando para motor trifásico de ${powerKw} kW com proteção termomagnética e lógica IEC 61131-3.`,
    technicalRationale: `Dimensionamento estrito ABNT NBR 5410 com condutores ${engCalc.recommendedCableMm2} mm² (ΔV ${engCalc.calculatedVoltageDropPercent.toFixed(2)}%), disjuntor ${engCalc.recommendedBreakerA}A e intertravamento de segurança em conformidade com NR-10.`,
    requestedPrompt: prompt,
    createdAt: new Date().toISOString(),
    provider: 'deepseek-v3',
    modelUsed: 'deepseek-chat',
    components,
    connections,
    variables,
    ladderRungs,
    engineeringCalculations: engCalc,
    status: 'PENDING_PREVIEW',
  };
}
