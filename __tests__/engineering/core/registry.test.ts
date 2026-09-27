import { EngineeringModelRegistry } from '@/lib/engineering/core/registry';
import { ElectricalComponent, ElectricalConnection, SharedTag, LadderRung, ComponentCategory } from '@/types/electrical';

const createMockComponent = (overrides: Partial<ElectricalComponent> = {}): ElectricalComponent => ({
  id: `comp-${Math.random().toString(36).substr(2, 9)}`,
  tag: `QF${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
  name: 'Disjuntor Motor',
  category: 'MOTOR_BREAKER' as ComponentCategory,
  x: 100,
  y: 100,
  width: 80,
  height: 60,
  ports: [],
  voltage: 380,
  nominalCurrent: 32,
  operationalCurrent: 25,
  power: 15,
  powerFactor: 0.85,
  efficiency: 0.92,
  manufacturer: 'WEG',
  model: 'MPW40',
  partNumber: 'MPW40-3-32',
  ...overrides,
});

const createMockConnection = (overrides: Partial<ElectricalConnection> = {}): ElectricalConnection => ({
  id: `conn-${Math.random().toString(36).substr(2, 9)}`,
  fromComponentId: 'comp-1',
  fromPortId: 'port-out',
  toComponentId: 'comp-2',
  toPortId: 'port-in',
  isEnergized: false,
  voltage: 380,
  wireGauge: 6,
  ...overrides,
});

const createMockTag = (overrides: Partial<SharedTag> = {}): SharedTag => ({
  id: `tag-${Math.random().toString(36).substr(2, 9)}`,
  name: 'KM01_MOTOR',
  description: 'Contator Motor Bomba',
  address: '%Q0.1',
  dataType: 'BOOL',
  direction: 'OUTPUT',
  currentValue: false,
  ...overrides,
});

const createMockRung = (overrides: Partial<LadderRung> = {}): LadderRung => ({
  id: `rung-${Math.random().toString(36).substr(2, 9)}`,
  number: 1,
  title: 'Partida Motor',
  isPowerFlowActive: false,
  elements: [
    {
      id: 'elem-1',
      type: 'CONTACT_NO',
      tagId: 'tag-1',
      tagName: 'START_BTN',
      address: '%I0.0',
      isEnergized: false,
      colIndex: 0,
    },
    {
      id: 'elem-2',
      type: 'COIL',
      tagId: 'tag-2',
      tagName: 'KM01_MOTOR',
      address: '%Q0.1',
      isEnergized: false,
      colIndex: 1,
    },
  ],
  ...overrides,
});

describe('EngineeringModelRegistry', () => {
  let registry: EngineeringModelRegistry;

  beforeEach(() => {
    registry = new EngineeringModelRegistry();
  });

  describe('generateUniqueTag', () => {
    it('should generate unique tag with prefix and sequential number', () => {
      const tag1 = registry.generateUniqueTag('QF');
      const tag2 = registry.generateUniqueTag('QF');
      const tag3 = registry.generateUniqueTag('KM');

      expect(tag1).toBe('QF01');
      expect(tag2).toBe('QF02');
      expect(tag3).toBe('KM01');
    });

    it('should handle prefix with special characters', () => {
      const tag = registry.generateUniqueTag('QF-Motor!');
      expect(tag).toBe('QFMOTOR01');
    });

    it('should avoid collision with existing component tags', () => {
      const comp1 = createMockComponent({ id: 'c1', tag: 'QF01' });
      const comp2 = createMockComponent({ id: 'c2', tag: 'QF02' });
      registry.hydrate([comp1, comp2], [], [], [], []);

      const tag = registry.generateUniqueTag('QF');
      expect(tag).toBe('QF03');
    });

    it('should be case-insensitive for collision detection', () => {
      const comp = createMockComponent({ id: 'c1', tag: 'qf01' });
      registry.hydrate([comp], [], [], [], []);

      const tag = registry.generateUniqueTag('QF');
      expect(tag).toBe('QF02');
    });
  });

  describe('hydrate', () => {
    it('should load components, connections, tags, rungs, and circuits', () => {
      const comps = [createMockComponent({ id: 'c1', tag: 'QF01' }), createMockComponent({ id: 'c2', tag: 'KM01' })];
      const conns = [createMockConnection({ id: 'conn1', fromComponentId: 'c1', toComponentId: 'c2' })];
      const tags = [createMockTag({ id: 't1', name: 'QF01' }), createMockTag({ id: 't2', name: 'KM01' })];
      const rungs = [createMockRung({ id: 'r1' })];

      registry.hydrate(comps, conns, tags, rungs, []);

      expect(registry.buildCrossReferenceMap()).toBeDefined();
    });

    it('should clear previous state on re-hydrate', () => {
      const comps1 = [createMockComponent({ id: 'c1', tag: 'QF01' })];
      registry.hydrate(comps1, [], [], [], []);

      const comps2 = [createMockComponent({ id: 'c2', tag: 'KM01' })];
      registry.hydrate(comps2, [], [], [], []);

      const map = registry.buildCrossReferenceMap();
      expect(Object.keys(map)).toHaveLength(1);
      expect(map['KM01']).toBeDefined();
      expect(map['QF01']).toBeUndefined();
    });
  });

  describe('buildCrossReferenceMap', () => {
    it('should map component to ladder rungs via tagName', () => {
      const comp = createMockComponent({ id: 'c1', tag: 'KM01' });
      const rung = createMockRung({
        id: 'r1',
        elements: [{ ...createMockRung().elements[1], tagName: 'KM01', tagId: 'c1' }],
      });
      registry.hydrate([comp], [], [], [rung], []);

      const map = registry.buildCrossReferenceMap();
      expect(map['KM01'].ladderRungIds).toContain('r1');
    });

    it('should map component to PLC addresses from ladder elements', () => {
      const comp = createMockComponent({ id: 'c1', tag: 'KM01' });
      const rung = createMockRung({
        id: 'r1',
        elements: [{ ...createMockRung().elements[1], tagName: 'KM01', tagId: 'c1', address: '%Q0.1' }],
      });
      registry.hydrate([comp], [], [], [rung], []);

      const map = registry.buildCrossReferenceMap();
      expect(map['KM01'].plcChannelAddresses).toContain('%Q0.1');
    });

    it('should map component to SCADA tags via name matching', () => {
      const comp = createMockComponent({ id: 'c1', tag: 'KM01' });
      const tag = createMockTag({ id: 't1', name: 'KM01_MOTOR_BOMBA', address: '%Q0.1' });
      registry.hydrate([comp], [], [tag], [], []);

      const map = registry.buildCrossReferenceMap();
      expect(map['KM01'].scadaTagNames).toContain('KM01_MOTOR_BOMBA');
      expect(map['KM01'].plcChannelAddresses).toContain('%Q0.1');
    });

    it('should include panel tag from component zone', () => {
      const comp = createMockComponent({ id: 'c1', tag: 'QF01', zone: 'CCM-01' });
      registry.hydrate([comp], [], [], [], []);

      const map = registry.buildCrossReferenceMap();
      expect(map['QF01'].panelTag).toBe('CCM-01');
    });

    it('should default panel tag to QGBT-01 when zone not set', () => {
      const comp = createMockComponent({ id: 'c1', tag: 'QF01' });
      registry.hydrate([comp], [], [], [], []);

      const map = registry.buildCrossReferenceMap();
      expect(map['QF01'].panelTag).toBe('QGBT-01');
    });
  });

  describe('calculateTotalInstalledPower', () => {
    it('should calculate total kW, kVA, current, and highest motor HP', () => {
      const comps = [
        createMockComponent({ id: 'c1', tag: 'QF01', power: 15, powerHp: 20, nominalCurrent: 32, operationalCurrent: 32, powerFactor: 0.85 }),
        createMockComponent({ id: 'c2', tag: 'KM01', power: 7.5, powerHp: 10, nominalCurrent: 16, operationalCurrent: 16, powerFactor: 0.88 }),
        createMockComponent({ id: 'c3', tag: 'M01', power: 5.5, powerHp: 7.5, nominalCurrent: 12, operationalCurrent: 12, powerFactor: 0.82 }),
      ];
      registry.hydrate(comps, [], [], [], []);

      const result = registry.calculateTotalInstalledPower();

      expect(result.totalKw).toBe(28);
      // 15/0.85 + 7.5/0.88 + 5.5/0.82 = 17.65 + 8.52 + 6.71 = 32.88
      expect(result.totalKva).toBeCloseTo(32.9, 1);
      expect(result.totalCurrentA).toBe(60);
      expect(result.highestMotorHp).toBe(20);
    });

    it('should return zeros for empty registry', () => {
      const result = registry.calculateTotalInstalledPower();

      expect(result.totalKw).toBe(0);
      expect(result.totalKva).toBe(0);
      expect(result.totalCurrentA).toBe(0);
      expect(result.highestMotorHp).toBe(0);
    });
  });

  describe('tag uniqueness across domains', () => {
    it('should detect tag collision between Unifilar component and Ladder element', () => {
      const comp = createMockComponent({ id: 'c1', tag: 'KM01' });
      const rung = createMockRung({
        id: 'r1',
        elements: [{ ...createMockRung().elements[1], tagName: 'KM01', tagId: 'c1' }],
      });
      registry.hydrate([comp], [], [], [rung], []);

      const map = registry.buildCrossReferenceMap();
      expect(map['KM01'].ladderRungIds).toHaveLength(1);
      expect(map['KM01'].componentId).toBe('c1');
    });

    it('should link multiple rungs to same component tag', () => {
      const comp = createMockComponent({ id: 'c1', tag: 'KM01' });
      const rung1 = createMockRung({ id: 'r1', elements: [{ ...createMockRung().elements[1], tagName: 'KM01', tagId: 'c1' }] });
      const rung2 = createMockRung({ id: 'r2', elements: [{ ...createMockRung().elements[1], tagName: 'KM01', tagId: 'c1' }] });
      registry.hydrate([comp], [], [], [rung1, rung2], []);

      const map = registry.buildCrossReferenceMap();
      expect(map['KM01'].ladderRungIds).toHaveLength(2);
    });
  });
});