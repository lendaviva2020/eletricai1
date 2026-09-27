// ============================================================================
// ELÉTRICAI — VALIDATION ENGINE / REGRAS DE ENGENHARIA ESTÁTICA (FASE 11)
//
// Módulo puro de inspeção estática. Complementa — NÃO substitui —
// `lib/electrical-validation.ts` (regra: preservar arquitetura existente).
//
// Regras cobertas AQUI (diferentes das já existentes em electrical-validation):
//   ENG_IB_GT_IN         sobrecarga: corrente de projeto Ib > corrente nominal In
//   ENG_PE_MISSING       ausência de condutor de proteção PE/PEN em carga trifásica
//   ENG_VDROP_HIGH       queda de tensão de CONDUTOR > 4%
//   ENG_CABLE_AMPACITY   bitola do condutor insuficiente para a corrente do alimentador
//   ENG_VOLTAGE_MISMATCH tensão nominal do componente diverge da tensão do condutor
//   ENG_CURRENT_UNKNOWN  corrente de projeto não informada (DADO_NAO_INFORMADO)
//
// Já cobertas em lib/electrical-validation.ts (NÃO duplicadas aqui):
//   TAG duplicada, componente órfão, fio flutuante, proteção de motor ausente,
//   queda de tensão em COMPONENTE, Icu baixo, DPS ausente.
//
// Nenhuma regra deste módulo altera equipamento físico nem substitui função
// de segurança: os resultados são INSPEÇÃO ESTÁTICA para revisão humana.
// ============================================================================

import type {
  ElectricalComponent,
  ElectricalConnection,
  ElectricalValidationIssue,
} from '@/types/electrical';
import { NBR5410_AMPACITY_TABLE } from '@/lib/nbr5410';

export const ENGINEERING_RULE_IDS = [
  'ENG_IB_GT_IN',
  'ENG_PE_MISSING',
  'ENG_VDROP_HIGH',
  'ENG_CABLE_AMPACITY',
  'ENG_VOLTAGE_MISMATCH',
  'ENG_CURRENT_UNKNOWN',
] as const;

export type EngineeringRuleId = (typeof ENGINEERING_RULE_IDS)[number];

export interface EngineeringRuleOptions {
  /** Limite de queda de tensão (%). Padrão 4,0 (NBR 5410). */
  maxVoltageDropPercent?: number;
}

const DEFAULT_MAX_VOLTAGE_DROP = 4.0;

/** Categorias que exigem condutor de proteção PE/PEN no modelo de dados. */
const CATEGORIES_REQUIRING_PE: ReadonlySet<ElectricalComponent['category']> = new Set([
  'MOTOR_3P',
  'DISTRIBUTION_BOARD',
  'VFD',
  'SOFT_STARTER',
  'TRANSFORMER_MT_BT',
]);

function ampacityForSection(sectionMm2: number): number | null {
  const row = NBR5410_AMPACITY_TABLE.find(r => r.sectionMm2 === sectionMm2);
  if (!row) return null;
  // Método B1 embutido em alvenaria com isolação PVC: coluna mais conservadora
  // da tabela. VALOR_ASSUMIDO — método de instalação real não é informado no
  // modelo de dados da conexão.
  return row.methodB1_PVC;
}

function requiresProtectiveConductor(comp: ElectricalComponent): boolean {
  if (CATEGORIES_REQUIRING_PE.has(comp.category)) return true;
  return comp.phases === '3F+N+PE';
}

function hasProtectiveConductor(compId: string, connections: ElectricalConnection[]): boolean {
  return connections.some(
    conn =>
      (conn.fromComponentId === compId || conn.toComponentId === compId) &&
      (conn.phase === 'PE' || conn.phase === 'PEN')
  );
}

function designCurrentOf(comp: ElectricalComponent | undefined): number | null {
  if (!comp) return null;
  const current = comp.operationalCurrent ?? comp.nominalCurrent;
  if (typeof current === 'number' && Number.isFinite(current) && current > 0) return current;
  return null;
}

/**
 * Executa as regras estáticas de engenharia sobre o modelo unificado
 * (componentes + conexões). Função determinística e sem efeitos colaterais.
 */
export function runEngineeringRuleValidation(
  components: ElectricalComponent[],
  connections: ElectricalConnection[],
  options: EngineeringRuleOptions = {}
): ElectricalValidationIssue[] {
  const issues: ElectricalValidationIssue[] = [];
  const maxVoltageDropPercent = options.maxVoltageDropPercent ?? DEFAULT_MAX_VOLTAGE_DROP;
  const compMap = new Map(components.map(c => [c.id, c]));

  // ------------------------------------------------------------------
  // ENG_IB_GT_IN — Sobrecarga (Ib > In)
  // ------------------------------------------------------------------
  components.forEach(comp => {
    const ib = comp.operationalCurrent;
    const inA = comp.nominalCurrent;

    if (typeof ib === 'number' && ib > 0 && typeof inA === 'number' && inA > 0 && ib > inA) {
      issues.push({
        id: `eng_ib_gt_in_${comp.id}`,
        severity: 'ERROR',
        category: 'SIZING',
        code: 'ENG_IB_GT_IN',
        title: `Sobrecarga: Ib (${ib} A) > In (${inA} A) em ${comp.tag}`,
        description: `A corrente de projeto informada para ${comp.tag} supera a corrente nominal do equipamento/dispositivo, o que provoca atuação permanente da proteção.`,
        componentId: comp.id,
        componentTag: comp.tag,
        reason: 'Critério NBR 5410 item 5.3.4: Ib deve ser menor ou igual à corrente nominal do dispositivo de proteção.',
        suggestion: `Revise o dimensionamento: aumente a corrente nominal do dispositivo para In ≥ ${ib} A ou reduza a carga de projeto.`,
      });
    }
  });

  // ------------------------------------------------------------------
  // ENG_PE_MISSING — Ausência de condutor de proteção PE/PEN
  // ------------------------------------------------------------------
  components.forEach(comp => {
    if (!requiresProtectiveConductor(comp)) return;
    if (hasProtectiveConductor(comp.id, connections)) return;

    issues.push({
      id: `eng_pe_missing_${comp.id}`,
      severity: 'CRITICAL',
      category: 'CONNECTIVITY',
      code: 'ENG_PE_MISSING',
      title: `Condutor de Proteção PE ausente em ${comp.tag}`,
      description: `O equipamento ${comp.tag} (${comp.category}) não possui nenhum condutor PE ou PEN conectado no diagrama.`,
      componentId: comp.id,
      componentTag: comp.tag,
      reason: 'NBR 5410 item 5.1: toda instalação deve dispor de condição de proteção contra contato indireto; a carga trifásica exige condutor de proteção.',
      suggestion: 'Trace o condutor PE (verde/amarelo) até o barramento de terra do quadro e classifique a conexão como fase PE.',
    });
  });

  // ------------------------------------------------------------------
  // ENG_VDROP_HIGH — Queda de tensão de condutor > limite
  // ------------------------------------------------------------------
  connections.forEach(conn => {
    const drop = conn.voltageDropPercent;
    if (typeof drop !== 'number' || !Number.isFinite(drop)) return;
    if (drop <= maxVoltageDropPercent) return;

    const fromComp = compMap.get(conn.fromComponentId);
    const toComp = compMap.get(conn.toComponentId);

    issues.push({
      id: `eng_vdrop_${conn.id}`,
      severity: 'ERROR',
      category: 'SIZING',
      code: 'ENG_VDROP_HIGH',
      title: `Queda de tensão ${drop}% no condutor ${conn.wireNumber || conn.netName || conn.id}`,
      description: `A queda de tensão calculada para o condutor entre ${fromComp?.tag ?? 'origem desconhecida'} e ${toComp?.tag ?? 'destino desconhecido'} é de ${drop}%, acima do limite de ${maxVoltageDropPercent}%.`,
      connectionId: conn.id,
      reason: 'NBR 5410 item 6.2.7: queda de tensão admissível de 4% a partir do quadro de distribuição.',
      suggestion: `Aumente a bitola do condutor${conn.wireGauge ? ` (atual ${conn.wireGauge} mm²)` : ''} ou reduza o comprimento do trecho.`,
    });
  });

  // ------------------------------------------------------------------
  // ENG_CABLE_AMPACITY / ENG_CURRENT_UNKNOWN — Bitola e corrente
  // ------------------------------------------------------------------
  connections.forEach(conn => {
    const fromComp = compMap.get(conn.fromComponentId);
    const current = designCurrentOf(fromComp);

    if (current === null) {
      if (typeof conn.wireGauge === 'number' && conn.wireGauge > 0) {
        issues.push({
          id: `eng_current_unknown_${conn.id}`,
          severity: 'INFO',
          category: 'CONSISTENCY',
          code: 'ENG_CURRENT_UNKNOWN',
          title: `Corrente de projeto não informada para o alimentador ${conn.wireNumber || conn.netName || conn.id}`,
          description: `O condutor possui bitola de ${conn.wireGauge} mm², mas o equipamento de origem ${fromComp?.tag ?? '(desconhecido)'} não informa operationalCurrent nem nominalCurrent válidos.`,
          connectionId: conn.id,
          componentId: fromComp?.id,
          componentTag: fromComp?.tag,
          reason: 'Sem a corrente de projeto não é possível verificar ampacidade nem sobrecarga.',
          suggestion: 'Preencha a corrente de projeto (Ib) ou a corrente nominal (In) do equipamento de origem.',
        });
      }
      return;
    }

    if (typeof conn.wireGauge !== 'number' || !(conn.wireGauge > 0)) return;

    const iz = ampacityForSection(conn.wireGauge);
    if (iz === null) {
      issues.push({
        id: `eng_cable_section_unknown_${conn.id}`,
        severity: 'INFO',
        category: 'CONDUCTOR',
        code: 'ENG_CABLE_AMPACITY',
        title: `Seção ${conn.wireGauge} mm² fora da tabela de ampacidade`,
        description: `A seção informada no condutor ${conn.wireNumber || conn.netName || conn.id} não consta na tabela de 1,5 a 240 mm² utilizada pelo motor de cálculo.`,
        connectionId: conn.id,
        reason: 'NBR 5410 item 6.2.5: a capacidade de condução deve ser determinada a partir das tabelas normativas.',
        suggestion: 'Informe uma seção comercial padrão (1,5 / 2,5 / 4 / 6 / 10 / 16 / 25 / 35 / 50 / 70 / 95 / 120 / 150 / 185 / 240 mm²).',
      });
      return;
    }

    if (current > iz) {
      issues.push({
        id: `eng_cable_ampacity_${conn.id}`,
        severity: 'ERROR',
        category: 'CONDUCTOR',
        code: 'ENG_CABLE_AMPACITY',
        title: `Bitola insuficiente no condutor ${conn.wireNumber || conn.netName || conn.id}`,
        description: `A corrente de projeto de ${current} A excede a capacidade de condução de ${iz} A do condutor de ${conn.wireGauge} mm² (método B1/PVC).`,
        connectionId: conn.id,
        componentId: fromComp?.id,
        componentTag: fromComp?.tag,
        reason: 'NBR 5410 item 6.2.5: Iz deve ser maior ou igual à corrente de projeto aplicada com os fatores de correção.',
        suggestion: `Selecione uma seção maior que ${conn.wireGauge} mm² com Iz ≥ ${current} A e recalcule a queda de tensão.`,
      });
    }
  });

  // ------------------------------------------------------------------
  // ENG_VOLTAGE_MISMATCH — Consistência de tensão componente × condutor
  // ------------------------------------------------------------------
  connections.forEach(conn => {
    const fromComp = compMap.get(conn.fromComponentId);
    const toComp = compMap.get(conn.toComponentId);

    [fromComp, toComp].forEach(comp => {
      if (!comp) return;
      if (!(comp.voltage > 0) || !(conn.voltage > 0)) return;
      if (comp.voltage === conn.voltage) return;

      issues.push({
        id: `eng_voltage_mismatch_${comp.id}_${conn.id}`,
        severity: 'WARNING',
        category: 'CONSISTENCY',
        code: 'ENG_VOLTAGE_MISMATCH',
        title: `Tensão divergente em ${comp.tag}`,
        description: `O equipamento ${comp.tag} está cadastrado em ${comp.voltage} V, mas o condutor ${conn.wireNumber || conn.netName || conn.id} está em ${conn.voltage} V.`,
        componentId: comp.id,
        componentTag: comp.tag,
        connectionId: conn.id,
        reason: 'Um condutor não pode alimentar equipamento de tensão nominal divergente sem transformador ou circuito dedicado.',
        suggestion: `Alinhe a tensão do condutor (${conn.voltage} V) com a tensão nominal do equipamento (${comp.voltage} V) ou verifique se falta um transformador.`,
      });
    });
  });

  return issues;
}

/** Ordena por severidade (CRITICAL primeiro) e retorna um resumo informativo. */
export function summarizeEngineeringIssues(issues: ElectricalValidationIssue[]): {
  critical: number;
  error: number;
  warning: number;
  info: number;
  total: number;
} {
  return {
    critical: issues.filter(i => i.severity === 'CRITICAL').length,
    error: issues.filter(i => i.severity === 'ERROR').length,
    warning: issues.filter(i => i.severity === 'WARNING').length,
    info: issues.filter(i => i.severity === 'INFO').length,
    total: issues.length,
  };
}
