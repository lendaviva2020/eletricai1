import {
  runEngineeringRuleValidation,
  summarizeEngineeringIssues,
  ENGINEERING_RULE_IDS,
} from '@/lib/engineering/validation/electrical-rules';
import type { ElectricalComponent, ElectricalConnection } from '@/types/electrical';

const makeComponent = (overrides: Partial<ElectricalComponent> = {}): ElectricalComponent => ({
  id: 'cmp_1',
  tag: 'QF01',
  name: 'Disjuntor',
  category: 'MOTOR_BREAKER',
  x: 0,
  y: 0,
  width: 60,
  height: 40,
  ports: [],
  voltage: 380,
  nominalCurrent: 32,
  ...overrides,
});

const makeConnection = (overrides: Partial<ElectricalConnection> = {}): ElectricalConnection => ({
  id: 'con_1',
  fromComponentId: 'cmp_1',
  fromPortId: 'out',
  toComponentId: 'cmp_2',
  toPortId: 'in',
  isEnergized: false,
  voltage: 380,
  ...overrides,
});

describe('Validation Engine — Regras de Engenharia (electrical-rules)', () => {
  it('expõe o identificador de todas as regras implementadas', () => {
    expect(ENGINEERING_RULE_IDS).toEqual([
      'ENG_IB_GT_IN',
      'ENG_PE_MISSING',
      'ENG_VDROP_HIGH',
      'ENG_CABLE_AMPACITY',
      'ENG_VOLTAGE_MISMATCH',
      'ENG_CURRENT_UNKNOWN',
    ]);
  });

  describe('ENG_IB_GT_IN (sobrecarga)', () => {
    it('gera ERROR quando Ib > In', () => {
      const issues = runEngineeringRuleValidation(
        [makeComponent({ tag: 'QF02', operationalCurrent: 45, nominalCurrent: 32 })],
        []
      );

      const issue = issues.find(i => i.code === 'ENG_IB_GT_IN');
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('ERROR');
      expect(issue?.componentTag).toBe('QF02');
      expect(issue?.suggestion).toContain('In ≥ 45 A');
    });

    it('não gera issue quando Ib <= In', () => {
      const issues = runEngineeringRuleValidation(
        [makeComponent({ operationalCurrent: 29, nominalCurrent: 32 })],
        []
      );

      expect(issues.some(i => i.code === 'ENG_IB_GT_IN')).toBe(false);
    });

    it('não avalia sem correntes informadas (DADO_NAO_INFORMADO)', () => {
      const issues = runEngineeringRuleValidation([makeComponent({ nominalCurrent: 0 })], []);

      expect(issues.some(i => i.code === 'ENG_IB_GT_IN')).toBe(false);
    });
  });

  describe('ENG_PE_MISSING (condutor de proteção)', () => {
    it('gera CRITICAL para motor trifásico sem condutor PE', () => {
      const motor = makeComponent({ id: 'm1', tag: 'M01', category: 'MOTOR_3P', nominalCurrent: 29 });
      const feed = makeComponent({ id: 'km1', tag: 'KM01', category: 'CONTACTOR' });

      const issues = runEngineeringRuleValidation(
        [motor, feed],
        [makeConnection({ fromComponentId: 'km1', toComponentId: 'm1', phase: 'L1' })]
      );

      const issue = issues.find(i => i.code === 'ENG_PE_MISSING');
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('CRITICAL');
      expect(issue?.componentTag).toBe('M01');
      expect(issue?.suggestion).toContain('PE');
    });

    it('não gera issue quando existe conexão com fase PE', () => {
      const motor = makeComponent({ id: 'm1', tag: 'M01', category: 'MOTOR_3P' });
      const ground = makeComponent({ id: 'pe1', tag: 'PE_BUS', category: 'GROUND' });

      const issues = runEngineeringRuleValidation(
        [motor, ground],
        [makeConnection({ fromComponentId: 'm1', toComponentId: 'pe1', phase: 'PE' })]
      );

      expect(issues.some(i => i.code === 'ENG_PE_MISSING')).toBe(false);
    });

    it('aceita condutor PEN como condição de proteção', () => {
      const board = makeComponent({ id: 'qb1', tag: 'QBT01', category: 'DISTRIBUTION_BOARD' });
      const source = makeComponent({ id: 'src', tag: 'REDE', category: 'SOURCE_MT' });

      const issues = runEngineeringRuleValidation(
        [board, source],
        [makeConnection({ fromComponentId: 'src', toComponentId: 'qb1', phase: 'PEN' })]
      );

      expect(issues.some(i => i.code === 'ENG_PE_MISSING')).toBe(false);
    });

    it('não exige PE para categorias que não requerem condutor de proteção no modelo', () => {
      const button = makeComponent({ id: 'pb1', tag: 'PB01', category: 'PUSH_BUTTON', phases: '1F' });

      const issues = runEngineeringRuleValidation([button], []);

      expect(issues.some(i => i.code === 'ENG_PE_MISSING')).toBe(false);
    });
  });

  describe('ENG_VDROP_HIGH (queda de tensão de condutor)', () => {
    it('gera ERROR acima de 4%', () => {
      const issues = runEngineeringRuleValidation(
        [],
        [makeConnection({ voltageDropPercent: 5.2, wireGauge: 6 })]
      );

      const issue = issues.find(i => i.code === 'ENG_VDROP_HIGH');
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('ERROR');
      expect(issue?.connectionId).toBe('con_1');
    });

    it('aceita exatamente o limite de 4%', () => {
      const issues = runEngineeringRuleValidation(
        [],
        [makeConnection({ voltageDropPercent: 4.0 })]
      );

      expect(issues.some(i => i.code === 'ENG_VDROP_HIGH')).toBe(false);
    });

    it('respeita limite alternativo informado pelo engenheiro', () => {
      const issues = runEngineeringRuleValidation(
        [],
        [makeConnection({ voltageDropPercent: 3.0 })],
        { maxVoltageDropPercent: 2.5 }
      );

      expect(issues.some(i => i.code === 'ENG_VDROP_HIGH')).toBe(true);
    });

    it('ignora conexões sem queda de tensão calculada', () => {
      const issues = runEngineeringRuleValidation([], [makeConnection()]);

      expect(issues.some(i => i.code === 'ENG_VDROP_HIGH')).toBe(false);
    });
  });

  describe('ENG_CABLE_AMPACITY (bitola do condutor)', () => {
    it('gera ERROR quando a corrente supera a ampacidade da bitola', () => {
      const source = makeComponent({
        id: 'src',
        tag: 'QF01',
        operationalCurrent: 45,
        nominalCurrent: 63,
      });

      const issues = runEngineeringRuleValidation(
        [source],
        [makeConnection({ fromComponentId: 'src', wireGauge: 2.5 })]
      );

      const issue = issues.find(i => i.code === 'ENG_CABLE_AMPACITY');
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('ERROR');
      expect(issue?.description).toContain('2.5 mm²');
      expect(issue?.description).toContain('21 A');
    });

    it('não gera issue quando a bitola suporta a corrente', () => {
      const source = makeComponent({ id: 'src', operationalCurrent: 29, nominalCurrent: 32 });

      const issues = runEngineeringRuleValidation(
        [source],
        [makeConnection({ fromComponentId: 'src', wireGauge: 10 })]
      );

      expect(issues.some(i => i.code === 'ENG_CABLE_AMPACITY')).toBe(false);
    });

    it('sinaliza seção fora da tabela de ampacidade', () => {
      const source = makeComponent({ id: 'src', operationalCurrent: 29, nominalCurrent: 32 });

      const issues = runEngineeringRuleValidation(
        [source],
        [makeConnection({ fromComponentId: 'src', wireGauge: 7 })]
      );

      const issue = issues.find(i => i.code === 'ENG_CABLE_AMPACITY');
      expect(issue?.severity).toBe('INFO');
      expect(issue?.description).toContain('não consta na tabela');
    });
  });

  describe('ENG_CURRENT_UNKNOWN (dado ausente)', () => {
    it('emite INFO quando há bitola mas nenhuma corrente informada', () => {
      const source = makeComponent({ id: 'src', tag: 'QF09', nominalCurrent: 0 });

      const issues = runEngineeringRuleValidation(
        [source],
        [makeConnection({ fromComponentId: 'src', wireGauge: 6 })]
      );

      const issue = issues.find(i => i.code === 'ENG_CURRENT_UNKNOWN');
      expect(issue?.severity).toBe('INFO');
      expect(issue?.description).toContain('operationalCurrent');
    });
  });

  describe('ENG_VOLTAGE_MISMATCH (consistência de tensão)', () => {
    it('gera WARNING quando o condutor e o equipamento têm tensões divergentes', () => {
      const motor = makeComponent({ id: 'm1', tag: 'M01', category: 'MOTOR_3P', voltage: 220 });
      const source = makeComponent({ id: 'src', tag: 'QF01', voltage: 380 });

      const issues = runEngineeringRuleValidation(
        [motor, source],
        [makeConnection({ fromComponentId: 'src', toComponentId: 'm1', voltage: 380 })]
      );

      const issue = issues.find(i => i.code === 'ENG_VOLTAGE_MISMATCH');
      expect(issue?.severity).toBe('WARNING');
      expect(issue?.description).toContain('220 V');
      expect(issue?.description).toContain('380 V');
    });

    it('não gera issue quando as tensões coincidem', () => {
      const motor = makeComponent({ id: 'm1', category: 'MOTOR_3P', voltage: 380 });

      const issues = runEngineeringRuleValidation(
        [motor],
        [makeConnection({ toComponentId: 'm1', voltage: 380 })]
      );

      expect(issues.some(i => i.code === 'ENG_VOLTAGE_MISMATCH')).toBe(false);
    });
  });

  describe('summarizeEngineeringIssues', () => {
    it('agrupa a contagem por severidade', () => {
      const issues = runEngineeringRuleValidation(
        [
          makeComponent({ id: 'm1', tag: 'M01', category: 'MOTOR_3P', operationalCurrent: 45, nominalCurrent: 32 }),
          makeComponent({ id: 'src', tag: 'QF01', voltage: 380, nominalCurrent: 63 }),
        ],
        [
          makeConnection({ fromComponentId: 'src', toComponentId: 'm1', voltage: 220, phase: 'L1', wireGauge: 2.5, voltageDropPercent: 6 }),
        ]
      );

      const summary = summarizeEngineeringIssues(issues);

      expect(summary.total).toBe(issues.length);
      expect(summary.critical).toBeGreaterThanOrEqual(1);
      expect(summary.error).toBeGreaterThanOrEqual(1);
      expect(summary.warning).toBeGreaterThanOrEqual(1);
      expect(summary.critical + summary.error + summary.warning + summary.info).toBe(summary.total);
    });

    it('retorna zeros para lista vazia', () => {
      expect(summarizeEngineeringIssues([])).toEqual({
        critical: 0,
        error: 0,
        warning: 0,
        info: 0,
        total: 0,
      });
    });
  });
});
