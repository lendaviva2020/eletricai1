// ============================================================================
// ELÉTRICAI — MULTIFILAR SCHEMATIC ROUTER (FASE 5)
// Gerador determinístico de esquemas trifásicos 3F+N+PE a partir do modelo unificado.
// Separa barramentos de força (L1, L2, L3), neutro (N) e proteção (PE),
// roteando derivações normalizadas para partidas de motores e circuitos de comando.
// ============================================================================

import { ElectricalComponent, ElectricalConnection } from '@/types/electrical';
import { CircuitType } from '@/types/electrical';
import { UnifilarNodeState, UnifilarSimulationResult } from '@/lib/engineering/unifilar/unifilar-engine';

export type PhaseConductor = 'L1' | 'L2' | 'L3' | 'N' | 'PE';
export type ConductorCircuitType = 'POWER_3P' | 'POWER_1P' | 'CONTROL_24V' | 'CONTROL_220V' | 'PE_GROUND' | 'NEUTRAL';

export interface MultifilarBusbarLayout {
  xStart: number;
  xEnd: number;
  yPositions: Map<PhaseConductor, number>;
  busbarWidth: number;
  labelOffset: number;
}

export interface MultifilarDerivation {
  id: string;
  circuitId: string;
  componentId: string;
  componentTag: string;
  circuitType: ConductorCircuitType;
  phases: PhaseConductor[];
  tapPoints: Map<PhaseConductor, { x: number; y: number }>;
  cableSpec: {
    sectionMm2: number;
    color: string;
    insulation: string;
  };
  downstreamComponents: string[];
}

export interface MultifilarSchematicData {
  busbarLayout: MultifilarBusbarLayout;
  derivations: MultifilarDerivation[];
  commandCircuits: MultifilarCommandCircuit[];
  motorTerminalBoxes: MultifilarMotorTerminal[];
}

export interface MultifilarCommandCircuit {
  id: string;
  name: string;
  voltageV: number;
  rails: { positive: number; negative: number }; // y positions for +24V and 0V rails
  rungs: CommandRung[];
}

export interface CommandRung {
  id: string;
  order: number;
  description: string;
  contacts: CommandContact[];
  coil: CommandCoil;
  isEnergized: boolean;
}

export interface CommandContact {
  id: string;
  type: 'NO' | 'NC';
  tagName: string;
  address: string;
  x: number;
}

export interface CommandCoil {
  id: string;
  tagName: string;
  address: string;
  x: number;
  isEnergized: boolean;
}

export interface MultifilarMotorTerminal {
  componentId: string;
  tag: string;
  terminalBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  terminals: Map<string, { phase: PhaseConductor; x: number; y: number }>;
}

const PHASE_COLORS: Record<PhaseConductor, string> = {
  L1: '#F59E0B',   // Amber - Fase R (Preto)
  L2: '#94A3B8',   // Slate - Fase S (Cinza)
  L3: '#CBD5E1',   // Stone - Fase T (Marrom)
  N: '#3B82F6',    // Blue - Neutro (Azul claro)
  PE: '#10B981',   // Emerald - Proteção (Verde-amarelo)
};

const PHASE_LABELS: Record<PhaseConductor, string> = {
  L1: 'L1 (Fase R / Preto)',
  L2: 'L2 (Fase S / Cinza)',
  L3: 'L3 (Fase T / Marrom)',
  N: 'N (Neutro / Azul-claro)',
  PE: 'PE (Terra / Verde-amarelo)',
};


// ----------------------------------------------------------------------------
// API REMOTA - roteamento de derivacoes de motor (partida direta, reversor, VFD,
// estrela-triangulo) mantida em conjunto com a API local de esquema completo.
// ----------------------------------------------------------------------------
export interface WireColorStandard {
  role: 'L1' | 'L2' | 'L3' | 'N' | 'PE' | 'CMD_24V' | 'CMD_0V' | 'CMD_AC' | 'SIGNAL';
  hex: string;
  namePt: string;
  standardReference: string;
  description: string;
}

export const NBR5410_WIRE_COLORS: Record<string, WireColorStandard> = {
  L1: {
    role: 'L1',
    hex: '#D97706', // Âmbar industrial / Marrom condutor
    namePt: 'Marrom / Âmbar',
    standardReference: 'NBR 5410 item 6.1.5.3.1',
    description: 'Condutor Fase 1 (Fase R / Linha 1)',
  },
  L2: {
    role: 'L2',
    hex: '#475569', // Preto / Carvão escuro
    namePt: 'Preto',
    standardReference: 'NBR 5410 item 6.1.5.3.1',
    description: 'Condutor Fase 2 (Fase S / Linha 2)',
  },
  L3: {
    role: 'L3',
    hex: '#94A3B8', // Cinza claro industrial
    namePt: 'Cinza',
    standardReference: 'NBR 5410 item 6.1.5.3.1',
    description: 'Condutor Fase 3 (Fase T / Linha 3)',
  },
  N: {
    role: 'N',
    hex: '#0284C7', // Azul-claro exclusivo
    namePt: 'Azul-Claro Exclusivo',
    standardReference: 'NBR 5410 item 6.1.5.3.2',
    description: 'Condutor Neutro (uso exclusivo da cor azul-claro)',
  },
  PE: {
    role: 'PE',
    hex: '#10B981', // Verde / Verde-Amarelo
    namePt: 'Verde / Verde-Amarelo',
    standardReference: 'NBR 5410 item 6.1.5.3.3',
    description: 'Condutor de Proteção / Terra de Equipotencialização',
  },
  CMD_24V: {
    role: 'CMD_24V',
    hex: '#EF4444', // Vermelho 24VDC
    namePt: 'Vermelho (+24VDC)',
    standardReference: 'IEC 60204-1 / NBR 5410',
    description: 'Potencial positivo de comando CC',
  },
  CMD_0V: {
    role: 'CMD_0V',
    hex: '#2563EB', // Azul escuro 0VDC
    namePt: 'Azul-Escuro (0VDC)',
    standardReference: 'IEC 60204-1',
    description: 'Potencial de referência negativo 0VDC',
  },
  CMD_AC: {
    role: 'CMD_AC',
    hex: '#F97316', // Laranja Comando AC
    namePt: 'Laranja / Vermelho (Comando CA)',
    standardReference: 'IEC 60204-1',
    description: 'Comando em corrente alternada (110V/220V)',
  },
  SIGNAL: {
    role: 'SIGNAL',
    hex: '#A855F7', // Roxo sinal analógico / 4-20mA
    namePt: 'Roxo / Violeta',
    standardReference: 'ISA 5.1 / IEC 60381',
    description: 'Sinal analógico / instrumentação / comunicação',
  },
};

export interface MultifilarConductorSegment {
  id: string;
  wireTag: string;
  role: 'L1' | 'L2' | 'L3' | 'N' | 'PE' | 'CMD_24V' | 'CMD_0V' | 'CMD_AC' | 'SIGNAL';
  gaugeMm2: number;
  colorHex: string;
  isEnergized: boolean;
  actualCurrentA: number;
  voltageV: number;
  pathD: string;
  startLabel: string;
  endLabel: string;
  labelCoord: { x: number; y: number };
  normativeRef: string;
}

export interface MultifilarSchematicComponent {
  id: string;
  tag: string;
  name: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isEnergized: boolean;
  isTripped?: boolean;
  stateText: string;
  terminals: Array<{
    id: string;
    number: string;
    role: 'L1' | 'L2' | 'L3' | 'N' | 'PE' | 'CMD_24V' | 'CMD_0V';
    x: number;
    y: number;
  }>;
}

export interface MultifilarDerivationCircuit {
  id: string;
  circuitType: CircuitType;
  tag: string;
  title: string;
  subtitle: string;
  nominalPowerKw: number;
  nominalVoltageV: number;
  nominalCurrentA: number;
  powerFactor: number;
  powerCableGaugeMm2: number;
  peCableGaugeMm2: number;
  commandCableGaugeMm2: number;
  groundingSystem: 'TN-S' | 'TN-C' | 'TT' | 'IT';
  coordinationType: 'TIPO 1' | 'TIPO 2';
  description: string;
  components: MultifilarSchematicComponent[];
  conductors: MultifilarConductorSegment[];
  commandSignals: Array<{
    tag: string;
    name: string;
    type: 'NO' | 'NC' | 'COIL' | 'RELAY' | 'PILOT';
    address: string;
    isActive: boolean;
    description: string;
  }>;
}

export class MultifilarSchematicRouter {
  public static readonly BUSBAR_SPACING = 25;
  public static readonly BUSBAR_TOP_Y = 40;
  public static readonly DERIVATION_DROP_Y_START = 160;
  public static readonly COMPONENT_SPACING_Y = 95;
  public static readonly COMMAND_AREA_X = 420;
  public static readonly COMMAND_AREA_Y = 160;

  /**
   * Gera layout completo dos barramentos L1, L2, L3, N, PE
   */
  public static generateBusbarLayout(
    canvasWidth: number = 750,
    canvasHeight: number = 480
  ): MultifilarBusbarLayout {
    const yPositions = new Map<PhaseConductor, number>();
    yPositions.set('L1', this.BUSBAR_TOP_Y);
    yPositions.set('L2', this.BUSBAR_TOP_Y + this.BUSBAR_SPACING);
    yPositions.set('L3', this.BUSBAR_TOP_Y + this.BUSBAR_SPACING * 2);
    yPositions.set('N', this.BUSBAR_TOP_Y + this.BUSBAR_SPACING * 3);
    yPositions.set('PE', this.BUSBAR_TOP_Y + this.BUSBAR_SPACING * 4);

    return {
      xStart: 50,
      xEnd: canvasWidth - 50,
      yPositions,
      busbarWidth: 4,
      labelOffset: 25,
    };
  }

  /**
   * Roteia derivações trifásicas de potência a partir dos componentes unifilares
   */
  public static routePowerDerivations(
    components: ElectricalComponent[],
    connections: ElectricalConnection[],
    simulationResult: UnifilarSimulationResult
  ): MultifilarDerivation[] {
    const derivations: MultifilarDerivation[] = [];
    const compMap = new Map(components.map(c => [c.id, c]));

    // Identificar circuitos de força trifásicos (cargas com categoria de motor/carga)
    const powerComponents = components.filter(c =>
      c.category === 'MOTOR_3P' ||
      c.category === 'VFD' ||
      c.category === 'SOFT_STARTER' ||
      c.category === 'FEEDER' ||
      c.category === 'CAPACITOR_BANK'
    );

    for (const comp of powerComponents) {
      const upstreamBreaker = this.findUpstreamProtection(comp.id, components, connections);
      if (!upstreamBreaker) continue;

      const nodeState = simulationResult.nodeStates.get(comp.id);
      const isEnergized = simulationResult.energizedComponentIds.has(comp.id);

      // Determinar tipo de circuito e fases envolvidas
      const phases = comp.phases === '3F+N+PE' || comp.phases === '3F+N' 
        ? ['L1', 'L2', 'L3', 'N', 'PE'] as PhaseConductor[]
        : ['L1', 'L2', 'L3', 'PE'] as PhaseConductor[];

      // Ponto de derivação no barramento (X position based on breaker position)
      const breakerX = upstreamBreaker.x + upstreamBreaker.width / 2;
      const tapPoints = new Map<PhaseConductor, { x: number; y: number }>();
      
      for (const phase of phases) {
        const busY = this.BUSBAR_TOP_Y + ['L1', 'L2', 'L3', 'N', 'PE'].indexOf(phase) * this.BUSBAR_SPACING;
        tapPoints.set(phase, { x: breakerX, y: busY });
      }

      const derivation: MultifilarDerivation = {
        id: `der_${comp.id}`,
        circuitId: `cct_${comp.tag}`,
        componentId: comp.id,
        componentTag: comp.tag,
        circuitType: comp.category === 'VFD' || comp.category === 'SOFT_STARTER' ? 'POWER_3P' : 'POWER_3P',
        phases,
        tapPoints,
        cableSpec: {
          sectionMm2: comp.cableCrossSection || 6,
          color: PHASE_COLORS.L1, // Main phase color for labeling
          insulation: comp.cableType || 'PVC 70°C',
        },
        downstreamComponents: this.getDownstreamComponents(comp.id, components, connections),
      };

      derivations.push(derivation);
    }

    return derivations;
  }

  /**
   * Roteia circuitos de comando 24VDC/220VAC a partir da lógica Ladder
   */
  public static routeCommandCircuits(
    ladderRungs: any[],
    sharedTags: any[],
    components: ElectricalComponent[]
  ): MultifilarCommandCircuit[] {
    const commandCircuits: MultifilarCommandCircuit[] = [];
    const commandRungs = ladderRungs.filter((r: any) => r.elements.some((e: any) => e.dataType === 'BOOL'));

    if (commandRungs.length === 0) return [];

    const rails = { positive: 50, negative: 255 }; // y positions for +24V and 0V

    const rungs: CommandRung[] = commandRungs.map((rung: any, idx: number) => {
      const contacts = rung.elements
        .filter((e: any) => e.type === 'CONTACT_NO' || e.type === 'CONTACT_NC')
        .map((e: any, i: number) => ({
          id: `cmd_contact_${rung.id}_${i}`,
          type: e.type === 'CONTACT_NO' ? 'NO' : 'NC',
          tagName: e.tagName,
          address: e.address,
          x: 50 + i * 60,
        }));

      const coil = rung.elements.find((e: any) => e.type === 'COIL' || e.type === 'COIL_SET' || e.type === 'COIL_RESET');
      const coilData = coil ? {
        id: `cmd_coil_${rung.id}`,
        tagName: coil.tagName,
        address: coil.address,
        x: 240,
        isEnergized: coil.isEnergized,
      } : undefined;

      return {
        id: `rung_${rung.id}`,
        order: idx,
        description: rung.title || `Rung ${rung.number}`,
        contacts,
        coil: coilData!,
        isEnergized: rung.isPowerFlowActive,
      };
    });

    commandCircuits.push({
      id: 'cmd_main',
      name: 'Circuito de Comando 24VDC',
      voltageV: 24,
      rails,
      rungs,
    });

    return commandCircuits;
  }

  /**
   * Gera caixas de terminais de motores para conexão PE
   */
  public static generateMotorTerminalBoxes(
    components: ElectricalComponent[]
  ): MultifilarMotorTerminal[] {
    const motorTerminals: MultifilarMotorTerminal[] = [];

    const motors = components.filter(c => c.category === 'MOTOR_3P');

    for (const motor of motors) {
      const terminals = new Map<string, { phase: PhaseConductor; x: number; y: number }>();
      const boxX = motor.x + motor.width / 2 - 50;
      const boxY = motor.y + motor.height + 10;

      terminals.set('U1', { phase: 'L1', x: boxX + 20, y: boxY + 10 });
      terminals.set('V1', { phase: 'L2', x: boxX + 50, y: boxY + 10 });
      terminals.set('W1', { phase: 'L3', x: boxX + 80, y: boxY + 10 });
      terminals.set('PE', { phase: 'PE', x: boxX + 100, y: boxY + 10 });

      motorTerminals.push({
        componentId: motor.id,
        tag: motor.tag,
        terminalBox: { x: boxX, y: boxY, width: 140, height: 35 },
        terminals,
      });
    }

    return motorTerminals;
  }

  /**
   * Gera dados completos do esquema multifilar
   */
  public static generateFullSchematic(
    components: ElectricalComponent[],
    connections: ElectricalConnection[],
    ladderRungs: any[],
    sharedTags: any[],
    simulationResult: UnifilarSimulationResult,
    canvasWidth: number = 750,
    canvasHeight: number = 480
  ): MultifilarSchematicData {
    const busbarLayout = this.generateBusbarLayout(canvasWidth, canvasHeight);
    const derivations = this.routePowerDerivations(components, connections, simulationResult);
    const commandCircuits = this.routeCommandCircuits(ladderRungs, sharedTags, components);
    const motorTerminalBoxes = this.generateMotorTerminalBoxes(components);

    return {
      busbarLayout,
      derivations,
      commandCircuits,
      motorTerminalBoxes,
    };
  }

  /**
   * Encontra o disjuntor de proteção a montante de um componente
   */
  private static findUpstreamProtection(
    componentId: string,
    components: ElectricalComponent[],
    connections: ElectricalConnection[]
  ): ElectricalComponent | null {
    const compMap = new Map(components.map(c => [c.id, c]));
    const incomingConns = new Map<string, ElectricalConnection[]>();

    for (const conn of connections) {
      if (!incomingConns.has(conn.toComponentId)) incomingConns.set(conn.toComponentId, []);
      incomingConns.get(conn.toComponentId)!.push(conn);
    }

    let currentId = componentId;
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const incoming = incomingConns.get(currentId);
      if (!incoming || incoming.length === 0) break;

      const upstreamConn = incoming[0];
      const upstreamComp = compMap.get(upstreamConn.fromComponentId);
      if (!upstreamComp) break;

      if (['MAIN_BREAKER', 'MOTOR_BREAKER', 'BREAKER', 'DISJUNTOR_MCCB', 'DISJUNTOR_MOTOR'].includes(upstreamComp.category)) {
        return upstreamComp;
      }

      currentId = upstreamComp.id;
    }

    return null;
  }

  /**
   * Obtém componentes a jusante (downstream) de um componente
   */
  private static getDownstreamComponents(
    componentId: string,
    components: ElectricalComponent[],
    connections: ElectricalConnection[]
  ): string[] {
    const compMap = new Map(components.map(c => [c.id, c]));
    const outgoingConns = new Map<string, ElectricalConnection[]>();

    for (const conn of connections) {
      if (!outgoingConns.has(conn.fromComponentId)) outgoingConns.set(conn.fromComponentId, []);
      outgoingConns.get(conn.fromComponentId)!.push(conn);
    }

    const downstream: string[] = [];
    const queue = [componentId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const outConns = outgoingConns.get(current) || [];
      for (const conn of outConns) {
        const targetComp = compMap.get(conn.toComponentId);
        if (targetComp && !downstream.includes(targetComp.id)) {
          downstream.push(targetComp.id);
          queue.push(targetComp.id);
        }
      }
    }

    return downstream;
  }

  /**
   * Obtém cor padrão para condutor de fase
   */
  public static getPhaseColor(phase: PhaseConductor): string {
    return PHASE_COLORS[phase] || '#64748B';
  }

  /**
   * Obtém label normativo para condutor
   */
  public static getPhaseLabel(phase: PhaseConductor): string {
    return PHASE_LABELS[phase] || phase;
  }

  /**
   * Calcula caminho ortogonal (Manhattan) para condutor de derivação
   */
  public static calculateDerivationPath(
    tapX: number,
    tapY: number,
    targetX: number,
    targetY: number,
    phase: PhaseConductor
  ): string {
    const midY = tapY + (targetY - tapY) / 2;
    const color = PHASE_COLORS[phase];
    
    return `M ${tapX} ${tapY} L ${tapX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
  }
  /**
   * Dimensiona o condutor de proteção PE conforme a Tabela 58 da ABNT NBR 5410
   */
  public static calculatePeConductorGauge(phaseGaugeMm2: number): number {
    if (phaseGaugeMm2 <= 16) {
      return phaseGaugeMm2;
    }
    if (phaseGaugeMm2 <= 35) {
      return 16;
    }
    return Math.max(16, Math.round(phaseGaugeMm2 / 2));
  }

  /**
   * Constrói o circuito multifilar completo com barramento 3P+N+PE e derivação para partida de motor
   */
  public static generateMotorDerivation(
    circuitType: CircuitType,
    overrides?: {
      isBreakerClosed?: boolean;
      isContactorEnergized?: boolean;
      isReversingContactorEnergized?: boolean;
      isThermalTripped?: boolean;
      isEmergencyPressed?: boolean;
      isStartButtonPressed?: boolean;
    }
  ): MultifilarDerivationCircuit {
    const isBreakerClosed = overrides?.isBreakerClosed ?? true;
    const isEmergencyPressed = overrides?.isEmergencyPressed ?? false;
    const isThermalTripped = overrides?.isThermalTripped ?? false;
    const isStartButtonPressed = overrides?.isStartButtonPressed ?? false;

    // Regras de energização do contator de comando
    const canContactorEnergize = isBreakerClosed && !isEmergencyPressed && !isThermalTripped;
    const isContactorEnergized = canContactorEnergize && (overrides?.isContactorEnergized ?? true);
    const isReversingContactorEnergized =
      canContactorEnergize && !isContactorEnergized && (overrides?.isReversingContactorEnergized ?? false);

    switch (circuitType) {
      case 'reversing':
        return this.createReversingDerivation(
          isBreakerClosed,
          isContactorEnergized,
          isReversingContactorEnergized,
          isThermalTripped,
          isEmergencyPressed
        );
      case 'vfd_inverter':
        return this.createVfdDerivation(
          isBreakerClosed,
          isContactorEnergized,
          isThermalTripped,
          isEmergencyPressed
        );
      case 'star_delta':
        return this.createStarDeltaDerivation(
          isBreakerClosed,
          isContactorEnergized,
          isThermalTripped,
          isEmergencyPressed
        );
      case 'direct_starter':
      default:
        return this.createDirectStarterDerivation(
          isBreakerClosed,
          isContactorEnergized,
          isThermalTripped,
          isEmergencyPressed
        );
    }
  }

  /**
   * 1. CIRCUITO MULTIFILAR DE PARTIDA DIRETA (DOL) COM DISJUNTOR-MOTOR
   */
  private static createDirectStarterDerivation(
    isBreakerClosed: boolean,
    isContactorEnergized: boolean,
    isThermalTripped: boolean,
    isEmergencyPressed: boolean
  ): MultifilarDerivationCircuit {
    const powerKw = 22; // 30 cv
    const voltageV = 380;
    const currentA = 42.5;
    const powerGauge = 10; // 10 mm²
    const peGauge = this.calculatePeConductorGauge(powerGauge); // 10 mm²
    const cmdGauge = 1.5; // 1.5 mm²

    const isLiveBeforeBreaker = true;
    const isLiveAfterBreaker = isLiveBeforeBreaker && isBreakerClosed && !isThermalTripped;
    const isLiveAfterContactor = isLiveAfterBreaker && isContactorEnergized;
    const isMotorRunning = isLiveAfterContactor;

    const components: MultifilarSchematicComponent[] = [
      {
        id: 'q02',
        tag: 'Q02',
        name: 'Disjuntor-Motor Termomagnético',
        category: 'MOTOR_BREAKER',
        x: 160,
        y: 155,
        width: 170,
        height: 60,
        isEnergized: isLiveBeforeBreaker,
        isTripped: !isBreakerClosed || isThermalTripped,
        stateText: isBreakerClosed ? (isThermalTripped ? 'DISPARO TÉRMICO' : 'LIGADO (FECHADO)') : 'DESLIGADO (ABERTO)',
        terminals: [
          { id: 'q02_1', number: '1/L1', role: 'L1', x: 190, y: 155 },
          { id: 'q02_3', number: '3/L2', role: 'L2', x: 230, y: 155 },
          { id: 'q02_5', number: '5/L3', role: 'L3', x: 270, y: 155 },
          { id: 'q02_2', number: '2/T1', role: 'L1', x: 190, y: 215 },
          { id: 'q02_4', number: '4/T2', role: 'L2', x: 230, y: 215 },
          { id: 'q02_6', number: '6/T3', role: 'L3', x: 270, y: 215 },
        ],
      },
      {
        id: 'km01',
        tag: 'KM01',
        name: 'Contator de Potência Tripolar',
        category: 'CONTACTOR',
        x: 160,
        y: 255,
        width: 170,
        height: 60,
        isEnergized: isLiveAfterBreaker,
        stateText: isContactorEnergized ? 'BOBINA ACIONADA (FECHADO)' : 'DESENERGIZADO (ABERTO)',
        terminals: [
          { id: 'km01_1', number: '1/L1', role: 'L1', x: 190, y: 255 },
          { id: 'km01_3', number: '3/L2', role: 'L2', x: 230, y: 255 },
          { id: 'km01_5', number: '5/L3', role: 'L3', x: 270, y: 255 },
          { id: 'km01_2', number: '2/T1', role: 'L1', x: 190, y: 315 },
          { id: 'km01_4', number: '4/T2', role: 'L2', x: 230, y: 315 },
          { id: 'km01_6', number: '6/T3', role: 'L3', x: 270, y: 315 },
        ],
      },
      {
        id: 'ft01',
        tag: 'FT01',
        name: 'Relé de Sobrecarga Bimetálico',
        category: 'THERMAL_RELAY',
        x: 160,
        y: 350,
        width: 170,
        height: 50,
        isEnergized: isLiveAfterContactor,
        isTripped: isThermalTripped,
        stateText: isThermalTripped ? 'DISPARADO (FALHA TÉRMICA)' : 'NORMAL (REARMADO)',
        terminals: [
          { id: 'ft01_1', number: '1/L1', role: 'L1', x: 190, y: 350 },
          { id: 'ft01_3', number: '3/L2', role: 'L2', x: 230, y: 350 },
          { id: 'ft01_5', number: '5/L3', role: 'L3', x: 270, y: 350 },
          { id: 'ft01_2', number: '2/T1', role: 'L1', x: 190, y: 400 },
          { id: 'ft01_4', number: '4/T2', role: 'L2', x: 230, y: 400 },
          { id: 'ft01_6', number: '6/T3', role: 'L3', x: 270, y: 400 },
        ],
      },
      {
        id: 'mtr01',
        tag: 'MTR01',
        name: 'Motor de Indução Trifásico (Compressor)',
        category: 'MOTOR_3P',
        x: 170,
        y: 435,
        width: 150,
        height: 75,
        isEnergized: isMotorRunning,
        stateText: isMotorRunning ? 'EM OPERAÇÃO (1760 RPM)' : 'PARADO',
        terminals: [
          { id: 'mtr01_u', number: 'U1', role: 'L1', x: 190, y: 440 },
          { id: 'mtr01_v', number: 'V1', role: 'L2', x: 230, y: 440 },
          { id: 'mtr01_w', number: 'W1', role: 'L3', x: 270, y: 440 },
          { id: 'mtr01_pe', number: 'PE', role: 'PE', x: 305, y: 440 },
        ],
      },
    ];

    const conductors: MultifilarConductorSegment[] = [
      // Busbars to Disjuntor Q02
      {
        id: 'w_bus_l1_q02',
        wireTag: 'W101-L1',
        role: 'L1',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L1.hex,
        isEnergized: isLiveBeforeBreaker,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 190 35 L 190 155',
        startLabel: 'L1 (Barra)',
        endLabel: 'Q02:1/L1',
        labelCoord: { x: 195, y: 100 },
        normativeRef: 'NBR 5410 item 6.1.5.3.1 (Marrom/Âmbar 10mm²)',
      },
      {
        id: 'w_bus_l2_q02',
        wireTag: 'W102-L2',
        role: 'L2',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L2.hex,
        isEnergized: isLiveBeforeBreaker,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 230 60 L 230 155',
        startLabel: 'L2 (Barra)',
        endLabel: 'Q02:3/L2',
        labelCoord: { x: 235, y: 110 },
        normativeRef: 'NBR 5410 item 6.1.5.3.1 (Preto 10mm²)',
      },
      {
        id: 'w_bus_l3_q02',
        wireTag: 'W103-L3',
        role: 'L3',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L3.hex,
        isEnergized: isLiveBeforeBreaker,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 270 85 L 270 155',
        startLabel: 'L3 (Barra)',
        endLabel: 'Q02:5/L3',
        labelCoord: { x: 275, y: 120 },
        normativeRef: 'NBR 5410 item 6.1.5.3.1 (Cinza 10mm²)',
      },

      // Q02 to KM01
      {
        id: 'w_q02_km01_l1',
        wireTag: 'W104-L1',
        role: 'L1',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L1.hex,
        isEnergized: isLiveAfterBreaker,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 190 215 L 190 255',
        startLabel: 'Q02:2/T1',
        endLabel: 'KM01:1/L1',
        labelCoord: { x: 195, y: 235 },
        normativeRef: 'Condutor 10mm² NBR 5410',
      },
      {
        id: 'w_q02_km01_l2',
        wireTag: 'W105-L2',
        role: 'L2',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L2.hex,
        isEnergized: isLiveAfterBreaker,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 230 215 L 230 255',
        startLabel: 'Q02:4/T2',
        endLabel: 'KM01:3/L2',
        labelCoord: { x: 235, y: 235 },
        normativeRef: 'Condutor 10mm² NBR 5410',
      },
      {
        id: 'w_q02_km01_l3',
        wireTag: 'W106-L3',
        role: 'L3',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L3.hex,
        isEnergized: isLiveAfterBreaker,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 270 215 L 270 255',
        startLabel: 'Q02:6/T3',
        endLabel: 'KM01:5/L3',
        labelCoord: { x: 275, y: 235 },
        normativeRef: 'Condutor 10mm² NBR 5410',
      },

      // KM01 to FT01
      {
        id: 'w_km01_ft01_l1',
        wireTag: 'W107-L1',
        role: 'L1',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L1.hex,
        isEnergized: isLiveAfterContactor,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 190 315 L 190 350',
        startLabel: 'KM01:2/T1',
        endLabel: 'FT01:1/L1',
        labelCoord: { x: 195, y: 332 },
        normativeRef: 'Condutor 10mm² NBR 5410',
      },
      {
        id: 'w_km01_ft01_l2',
        wireTag: 'W108-L2',
        role: 'L2',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L2.hex,
        isEnergized: isLiveAfterContactor,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 230 315 L 230 350',
        startLabel: 'KM01:4/T2',
        endLabel: 'FT01:3/L2',
        labelCoord: { x: 235, y: 332 },
        normativeRef: 'Condutor 10mm² NBR 5410',
      },
      {
        id: 'w_km01_ft01_l3',
        wireTag: 'W109-L3',
        role: 'L3',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L3.hex,
        isEnergized: isLiveAfterContactor,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 270 315 L 270 350',
        startLabel: 'KM01:6/T3',
        endLabel: 'FT01:5/L3',
        labelCoord: { x: 275, y: 332 },
        normativeRef: 'Condutor 10mm² NBR 5410',
      },

      // FT01 to Motor MTR01
      {
        id: 'w_ft01_mtr_u',
        wireTag: 'W110-U',
        role: 'L1',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L1.hex,
        isEnergized: isMotorRunning,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 190 400 L 190 440',
        startLabel: 'FT01:2/T1',
        endLabel: 'MTR01:U1',
        labelCoord: { x: 195, y: 420 },
        normativeRef: 'Cabo Potência 10mm² Fase U',
      },
      {
        id: 'w_ft01_mtr_v',
        wireTag: 'W111-V',
        role: 'L2',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L2.hex,
        isEnergized: isMotorRunning,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 230 400 L 230 440',
        startLabel: 'FT01:4/T2',
        endLabel: 'MTR01:V1',
        labelCoord: { x: 235, y: 420 },
        normativeRef: 'Cabo Potência 10mm² Fase V',
      },
      {
        id: 'w_ft01_mtr_w',
        wireTag: 'W112-W',
        role: 'L3',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L3.hex,
        isEnergized: isMotorRunning,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 270 400 L 270 440',
        startLabel: 'FT01:6/T3',
        endLabel: 'MTR01:W1',
        labelCoord: { x: 275, y: 420 },
        normativeRef: 'Cabo Potência 10mm² Fase W',
      },

      // PE Ground Conductor (Barra PE -> Carcaça Motor)
      {
        id: 'w_bus_pe_motor',
        wireTag: 'W113-PE',
        role: 'PE',
        gaugeMm2: peGauge,
        colorHex: NBR5410_WIRE_COLORS.PE.hex,
        isEnergized: true,
        actualCurrentA: 0,
        voltageV: 0,
        pathD: 'M 310 110 L 310 440',
        startLabel: 'Barra PE',
        endLabel: 'MTR01:Carcaça PE',
        labelCoord: { x: 315, y: 280 },
        normativeRef: 'NBR 5410 Tabela 58 (Verde/Verde-Amarelo 10mm²)',
      },
    ];

    const commandSignals = [
      {
        tag: 'S0_EMERGENCIA',
        name: 'Botoeira de Emergência Tipo Cogumelo (Gira-Puxa)',
        type: 'NC' as const,
        address: '%I0.0',
        isActive: !isEmergencyPressed,
        description: isEmergencyPressed ? 'EMERGÊNCIA ACIONADA (CIRCUITO ABERTO)' : 'EMERGÊNCIA DESARMADA (CONTATO FECHADO)',
      },
      {
        tag: 'FT01_NC',
        name: 'Contato Auxiliar do Relé Térmico (95-96)',
        type: 'NC' as const,
        address: '%I0.1',
        isActive: !isThermalTripped,
        description: isThermalTripped ? 'FALHA DE SOBRECARGA DETECTADA' : 'CONTATO NORMAL FECHADO ÍNTEGRO',
      },
      {
        tag: 'S1_DESLIGA',
        name: 'Botoeira Pulsadora Desliga (Vermelha)',
        type: 'NC' as const,
        address: '%I0.2',
        isActive: true,
        description: 'Botoeira NF de Parada do Circuito',
      },
      {
        tag: 'S2_LIGA',
        name: 'Botoeira Pulsadora Liga (Verde)',
        type: 'NO' as const,
        address: '%I0.3',
        isActive: isContactorEnergized,
        description: 'Botoeira NA com Selo KM01 (13-14)',
      },
      {
        tag: 'KM01_COIL',
        name: 'Bobina Contator KM01 (A1-A2) 24VDC',
        type: 'COIL' as const,
        address: '%Q0.0',
        isActive: isContactorEnergized,
        description: isContactorEnergized ? 'BOBINA ALIMENTADA 24VDC' : 'BOBINA EM REPOUSO 0VDC',
      },
    ];

    return {
      id: 'cct_comp_dol',
      circuitType: 'direct_starter',
      tag: 'CCT-01',
      title: 'Partida Direta com Disjuntor-Motor (DOL 3P+PE)',
      subtitle: 'Compressor Parafuso 30cv / 22kW — 380V Trifásico',
      nominalPowerKw: powerKw,
      nominalVoltageV: voltageV,
      nominalCurrentA: currentA,
      powerFactor: 0.86,
      powerCableGaugeMm2: powerGauge,
      peCableGaugeMm2: peGauge,
      commandCableGaugeMm2: cmdGauge,
      groundingSystem: 'TN-S',
      coordinationType: 'TIPO 2',
      description:
        'Derivação normatizada com proteção coordenada Tipo 2 (NBR IEC 60947-4-1). Elimina necessidade de fusíveis a montante.',
      components,
      conductors,
      commandSignals,
    };
  }

  /**
   * 2. CIRCUITO MULTIFILAR COM CHAVE REVERSORA (DOIS CONTATORES KM1 / KM2)
   */
  private static createReversingDerivation(
    isBreakerClosed: boolean,
    isForwardActive: boolean,
    isReverseActive: boolean,
    isThermalTripped: boolean,
    isEmergencyPressed: boolean
  ): MultifilarDerivationCircuit {
    const powerKw = 15; // 20 cv
    const voltageV = 380;
    const currentA = 29.5;
    const powerGauge = 6; // 6 mm²
    const peGauge = this.calculatePeConductorGauge(powerGauge); // 6 mm²
    const cmdGauge = 1.5;

    const isLiveBeforeBreaker = true;
    const isLiveAfterBreaker = isLiveBeforeBreaker && isBreakerClosed && !isThermalTripped;
    const isMotorRunning = (isForwardActive || isReverseActive) && isLiveAfterBreaker;

    const components: MultifilarSchematicComponent[] = [
      {
        id: 'q03',
        tag: 'Q03',
        name: 'Disjuntor-Geral Reversão',
        category: 'BREAKER',
        x: 180,
        y: 155,
        width: 160,
        height: 55,
        isEnergized: isLiveBeforeBreaker,
        isTripped: !isBreakerClosed || isThermalTripped,
        stateText: isBreakerClosed ? 'LIGADO' : 'DESLIGADO',
        terminals: [
          { id: 'q03_1', number: '1/L1', role: 'L1', x: 210, y: 155 },
          { id: 'q03_3', number: '3/L2', role: 'L2', x: 250, y: 155 },
          { id: 'q03_5', number: '5/L3', role: 'L3', x: 290, y: 155 },
          { id: 'q03_2', number: '2/T1', role: 'L1', x: 210, y: 210 },
          { id: 'q03_4', number: '4/T2', role: 'L2', x: 250, y: 210 },
          { id: 'q03_6', number: '6/T3', role: 'L3', x: 290, y: 210 },
        ],
      },
      {
        id: 'km1_fwd',
        tag: 'KM1',
        name: 'Contator Sentido Horário (Avanço)',
        category: 'CONTACTOR',
        x: 100,
        y: 255,
        width: 140,
        height: 60,
        isEnergized: isLiveAfterBreaker,
        stateText: isForwardActive ? 'AVANÇO ATIVO' : 'REPOUSO',
        terminals: [
          { id: 'km1_1', number: '1/L1', role: 'L1', x: 130, y: 255 },
          { id: 'km1_3', number: '3/L2', role: 'L2', x: 170, y: 255 },
          { id: 'km1_5', number: '5/L3', role: 'L3', x: 210, y: 255 },
          { id: 'km1_2', number: '2/T1', role: 'L1', x: 130, y: 315 },
          { id: 'km1_4', number: '4/T2', role: 'L2', x: 170, y: 315 },
          { id: 'km1_6', number: '6/T3', role: 'L3', x: 210, y: 315 },
        ],
      },
      {
        id: 'km2_rev',
        tag: 'KM2',
        name: 'Contator Sentido Anti-Horário (Recuo)',
        category: 'CONTACTOR',
        x: 270,
        y: 255,
        width: 140,
        height: 60,
        isEnergized: isLiveAfterBreaker,
        stateText: isReverseActive ? 'RECUO ATIVO (FASES INVERTIDAS)' : 'REPOUSO',
        terminals: [
          { id: 'km2_1', number: '1/L1', role: 'L1', x: 300, y: 255 },
          { id: 'km2_3', number: '3/L2', role: 'L2', x: 340, y: 255 },
          { id: 'km2_5', number: '5/L3', role: 'L3', x: 380, y: 255 },
          { id: 'km2_2', number: '2/T1', role: 'L1', x: 300, y: 315 },
          { id: 'km2_4', number: '4/T2', role: 'L2', x: 340, y: 315 },
          { id: 'km2_6', number: '6/T3', role: 'L3', x: 380, y: 315 },
        ],
      },
      {
        id: 'ft02',
        tag: 'FT02',
        name: 'Relé Térmico de Proteção',
        category: 'THERMAL_RELAY',
        x: 180,
        y: 355,
        width: 160,
        height: 50,
        isEnergized: isMotorRunning,
        isTripped: isThermalTripped,
        stateText: isThermalTripped ? 'DISPARADO' : 'NORMAL',
        terminals: [
          { id: 'ft02_1', number: '1/L1', role: 'L1', x: 210, y: 355 },
          { id: 'ft02_3', number: '3/L2', role: 'L2', x: 250, y: 355 },
          { id: 'ft02_5', number: '5/L3', role: 'L3', x: 290, y: 355 },
          { id: 'ft02_2', number: '2/T1', role: 'L1', x: 210, y: 405 },
          { id: 'ft02_4', number: '4/T2', role: 'L2', x: 250, y: 405 },
          { id: 'ft02_6', number: '6/T3', role: 'L3', x: 290, y: 405 },
        ],
      },
      {
        id: 'mtr02',
        tag: 'MTR02',
        name: 'Motor Reversível (Ponte Rolante)',
        category: 'MOTOR_3P',
        x: 185,
        y: 440,
        width: 150,
        height: 75,
        isEnergized: isMotorRunning,
        stateText: isMotorRunning
          ? isForwardActive
            ? 'AVANÇO HORÁRIO'
            : 'RECUO ANTI-HORÁRIO'
          : 'PARADO',
        terminals: [
          { id: 'mtr02_u', number: 'U1', role: 'L1', x: 210, y: 445 },
          { id: 'mtr02_v', number: 'V1', role: 'L2', x: 250, y: 445 },
          { id: 'mtr02_w', number: 'W1', role: 'L3', x: 290, y: 445 },
          { id: 'mtr02_pe', number: 'PE', role: 'PE', x: 325, y: 445 },
        ],
      },
    ];

    const conductors: MultifilarConductorSegment[] = [
      // Busbars to Q03
      {
        id: 'w_bus_q03_l1',
        wireTag: 'W201-L1',
        role: 'L1',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L1.hex,
        isEnergized: isLiveBeforeBreaker,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 210 35 L 210 155',
        startLabel: 'L1',
        endLabel: 'Q03:1',
        labelCoord: { x: 215, y: 100 },
        normativeRef: 'Condutor Marrom 6mm²',
      },
      {
        id: 'w_bus_q03_l2',
        wireTag: 'W202-L2',
        role: 'L2',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L2.hex,
        isEnergized: isLiveBeforeBreaker,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 250 60 L 250 155',
        startLabel: 'L2',
        endLabel: 'Q03:3',
        labelCoord: { x: 255, y: 110 },
        normativeRef: 'Condutor Preto 6mm²',
      },
      {
        id: 'w_bus_q03_l3',
        wireTag: 'W203-L3',
        role: 'L3',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L3.hex,
        isEnergized: isLiveBeforeBreaker,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 290 85 L 290 155',
        startLabel: 'L3',
        endLabel: 'Q03:5',
        labelCoord: { x: 295, y: 120 },
        normativeRef: 'Condutor Cinza 6mm²',
      },

      // Q03 splits into KM1 and KM2
      {
        id: 'w_q03_km1_l1',
        wireTag: 'W204-L1',
        role: 'L1',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L1.hex,
        isEnergized: isLiveAfterBreaker,
        actualCurrentA: isForwardActive ? currentA : 0,
        voltageV: 380,
        pathD: 'M 210 210 L 210 230 L 130 230 L 130 255',
        startLabel: 'Q03:2',
        endLabel: 'KM1:1',
        labelCoord: { x: 150, y: 235 },
        normativeRef: 'Derivação KM1 Direta',
      },
      {
        id: 'w_q03_km1_l2',
        wireTag: 'W205-L2',
        role: 'L2',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L2.hex,
        isEnergized: isLiveAfterBreaker,
        actualCurrentA: isForwardActive ? currentA : 0,
        voltageV: 380,
        pathD: 'M 250 210 L 250 235 L 170 235 L 170 255',
        startLabel: 'Q03:4',
        endLabel: 'KM1:3',
        labelCoord: { x: 180, y: 240 },
        normativeRef: 'Derivação KM1 Direta',
      },
      {
        id: 'w_q03_km1_l3',
        wireTag: 'W206-L3',
        role: 'L3',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L3.hex,
        isEnergized: isLiveAfterBreaker,
        actualCurrentA: isForwardActive ? currentA : 0,
        voltageV: 380,
        pathD: 'M 290 210 L 290 240 L 210 240 L 210 255',
        startLabel: 'Q03:6',
        endLabel: 'KM1:5',
        labelCoord: { x: 230, y: 245 },
        normativeRef: 'Derivação KM1 Direta',
      },

      // Reversing phase swap to KM2 (L1 -> L3 / L3 -> L1)
      {
        id: 'w_q03_km2_swap_l3',
        wireTag: 'W207-SWAP-L3',
        role: 'L3',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L3.hex,
        isEnergized: isLiveAfterBreaker,
        actualCurrentA: isReverseActive ? currentA : 0,
        voltageV: 380,
        pathD: 'M 290 210 L 290 230 L 300 230 L 300 255',
        startLabel: 'Q03:6',
        endLabel: 'KM2:1 (Inversão L3->L1)',
        labelCoord: { x: 305, y: 235 },
        normativeRef: 'Inversão de Fase NBR 5410',
      },
      {
        id: 'w_q03_km2_l2',
        wireTag: 'W208-L2',
        role: 'L2',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L2.hex,
        isEnergized: isLiveAfterBreaker,
        actualCurrentA: isReverseActive ? currentA : 0,
        voltageV: 380,
        pathD: 'M 250 210 L 250 235 L 340 235 L 340 255',
        startLabel: 'Q03:4',
        endLabel: 'KM2:3 (Fase Central Mantida)',
        labelCoord: { x: 330, y: 240 },
        normativeRef: 'Fase S sem inversão',
      },
      {
        id: 'w_q03_km2_swap_l1',
        wireTag: 'W209-SWAP-L1',
        role: 'L1',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L1.hex,
        isEnergized: isLiveAfterBreaker,
        actualCurrentA: isReverseActive ? currentA : 0,
        voltageV: 380,
        pathD: 'M 210 210 L 210 240 L 380 240 L 380 255',
        startLabel: 'Q03:2',
        endLabel: 'KM2:5 (Inversão L1->L3)',
        labelCoord: { x: 365, y: 245 },
        normativeRef: 'Inversão de Fase NBR 5410',
      },

      // Outputs of KM1 & KM2 converge to FT02
      {
        id: 'w_km_ft02_l1',
        wireTag: 'W210-L1',
        role: 'L1',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L1.hex,
        isEnergized: isMotorRunning,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 130 315 L 130 335 L 210 335 L 210 355',
        startLabel: 'KM1/KM2',
        endLabel: 'FT02:1',
        labelCoord: { x: 170, y: 340 },
        normativeRef: 'Alimentação FT02 Fase 1',
      },
      {
        id: 'w_km_ft02_l2',
        wireTag: 'W211-L2',
        role: 'L2',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L2.hex,
        isEnergized: isMotorRunning,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 170 315 L 170 340 L 250 340 L 250 355',
        startLabel: 'KM1/KM2',
        endLabel: 'FT02:3',
        labelCoord: { x: 210, y: 345 },
        normativeRef: 'Alimentação FT02 Fase 2',
      },
      {
        id: 'w_km_ft02_l3',
        wireTag: 'W212-L3',
        role: 'L3',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L3.hex,
        isEnergized: isMotorRunning,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 210 315 L 210 345 L 290 345 L 290 355',
        startLabel: 'KM1/KM2',
        endLabel: 'FT02:5',
        labelCoord: { x: 260, y: 350 },
        normativeRef: 'Alimentação FT02 Fase 3',
      },

      // FT02 to Motor MTR02
      {
        id: 'w_ft02_mtr_u',
        wireTag: 'W213-U',
        role: 'L1',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L1.hex,
        isEnergized: isMotorRunning,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 210 405 L 210 445',
        startLabel: 'FT02:2',
        endLabel: 'MTR02:U1',
        labelCoord: { x: 215, y: 425 },
        normativeRef: 'Cabo 6mm² U1',
      },
      {
        id: 'w_ft02_mtr_v',
        wireTag: 'W214-V',
        role: 'L2',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L2.hex,
        isEnergized: isMotorRunning,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 250 405 L 250 445',
        startLabel: 'FT02:4',
        endLabel: 'MTR02:V1',
        labelCoord: { x: 255, y: 425 },
        normativeRef: 'Cabo 6mm² V1',
      },
      {
        id: 'w_ft02_mtr_w',
        wireTag: 'W215-W',
        role: 'L3',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L3.hex,
        isEnergized: isMotorRunning,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 290 405 L 290 445',
        startLabel: 'FT02:6',
        endLabel: 'MTR02:W1',
        labelCoord: { x: 295, y: 425 },
        normativeRef: 'Cabo 6mm² W1',
      },

      // PE Ground
      {
        id: 'w_bus_pe_mtr02',
        wireTag: 'W216-PE',
        role: 'PE',
        gaugeMm2: peGauge,
        colorHex: NBR5410_WIRE_COLORS.PE.hex,
        isEnergized: true,
        actualCurrentA: 0,
        voltageV: 0,
        pathD: 'M 330 110 L 330 445',
        startLabel: 'Barra PE',
        endLabel: 'MTR02:PE',
        labelCoord: { x: 335, y: 280 },
        normativeRef: 'NBR 5410 (Verde 6mm²)',
      },
    ];

    const commandSignals = [
      {
        tag: 'KM1_NC_LOCK',
        name: 'Intertravamento Elétrico Cruzado KM1 (21-22)',
        type: 'NC' as const,
        address: '%I1.0',
        isActive: !isForwardActive,
        description: 'Impede acionamento simultâneo de KM2 contra curto trifásico L1-L3',
      },
      {
        tag: 'KM2_NC_LOCK',
        name: 'Intertravamento Elétrico Cruzado KM2 (21-22)',
        type: 'NC' as const,
        address: '%I1.1',
        isActive: !isReverseActive,
        description: 'Impede acionamento de KM1 quando reverso estiver ligado',
      },
      {
        tag: 'S_AVANCO',
        name: 'Botoeira Avanço Horário',
        type: 'NO' as const,
        address: '%I1.2',
        isActive: isForwardActive,
        description: 'Aciona KM1 (Avanço)',
      },
      {
        tag: 'S_RECUO',
        name: 'Botoeira Recuo Anti-Horário',
        type: 'NO' as const,
        address: '%I1.3',
        isActive: isReverseActive,
        description: 'Aciona KM2 (Recuo)',
      },
    ];

    return {
      id: 'cct_reversing',
      circuitType: 'reversing',
      tag: 'CCT-02',
      title: 'Partida com Chave Reversora (KM1 Avanço / KM2 Recuo)',
      subtitle: 'Ponte Rolante / Talha Industrial 20cv — 380V Trifásico',
      nominalPowerKw: powerKw,
      nominalVoltageV: voltageV,
      nominalCurrentA: currentA,
      powerFactor: 0.84,
      powerCableGaugeMm2: powerGauge,
      peCableGaugeMm2: peGauge,
      commandCableGaugeMm2: cmdGauge,
      groundingSystem: 'TN-S',
      coordinationType: 'TIPO 2',
      description:
        'Derivação multifilar com intertravamento mecânico e elétrico cruzado obrigatório conforme NBR IEC 60947-4-1.',
      components,
      conductors,
      commandSignals,
    };
  }

  /**
   * 3. CIRCUITO MULTIFILAR COM INVERSOR DE FREQUÊNCIA (VFD)
   */
  private static createVfdDerivation(
    isBreakerClosed: boolean,
    isContactorEnergized: boolean,
    isThermalTripped: boolean,
    isEmergencyPressed: boolean
  ): MultifilarDerivationCircuit {
    const powerKw = 7.5; // 10 cv
    const voltageV = 380;
    const currentA = 15.2;
    const powerGauge = 4; // 4 mm²
    const peGauge = 4; // 4 mm²
    const cmdGauge = 1.0;

    const isLiveBeforeBreaker = true;
    const isLiveAfterBreaker = isLiveBeforeBreaker && isBreakerClosed && !isThermalTripped;
    const isVfdEnergized = isLiveAfterBreaker && isContactorEnergized;
    const isMotorRunning = isVfdEnergized;

    const components: MultifilarSchematicComponent[] = [
      {
        id: 'q04',
        tag: 'Q04',
        name: 'Disjuntor Termomagnético de Linha',
        category: 'BREAKER',
        x: 170,
        y: 155,
        width: 160,
        height: 55,
        isEnergized: isLiveBeforeBreaker,
        isTripped: !isBreakerClosed,
        stateText: isBreakerClosed ? 'LIGADO' : 'ABERTO',
        terminals: [
          { id: 'q04_1', number: '1/L1', role: 'L1', x: 200, y: 155 },
          { id: 'q04_3', number: '3/L2', role: 'L2', x: 240, y: 155 },
          { id: 'q04_5', number: '5/L3', role: 'L3', x: 280, y: 155 },
          { id: 'q04_2', number: '2/T1', role: 'L1', x: 200, y: 210 },
          { id: 'q04_4', number: '4/T2', role: 'L2', x: 240, y: 210 },
          { id: 'q04_6', number: '6/T3', role: 'L3', x: 280, y: 210 },
        ],
      },
      {
        id: 'km04',
        tag: 'KM04',
        name: 'Contator de Isolamento da Entrada',
        category: 'CONTACTOR',
        x: 170,
        y: 245,
        width: 160,
        height: 55,
        isEnergized: isLiveAfterBreaker,
        stateText: isContactorEnergized ? 'ISOLAMENTO FECHADO' : 'DESLIGADO',
        terminals: [
          { id: 'km04_1', number: '1/L1', role: 'L1', x: 200, y: 245 },
          { id: 'km04_3', number: '3/L2', role: 'L2', x: 240, y: 245 },
          { id: 'km04_5', number: '5/L3', role: 'L3', x: 280, y: 245 },
          { id: 'km04_2', number: '2/T1', role: 'L1', x: 200, y: 300 },
          { id: 'km04_4', number: '4/T2', role: 'L2', x: 240, y: 300 },
          { id: 'km04_6', number: '6/T3', role: 'L3', x: 280, y: 300 },
        ],
      },
      {
        id: 'vfd01',
        tag: 'VFD01',
        name: 'Inversor de Frequência WEG CFW11',
        category: 'VFD',
        x: 160,
        y: 335,
        width: 180,
        height: 80,
        isEnergized: isVfdEnergized,
        stateText: isVfdEnergized ? 'PWM ATIVO: 60.0 Hz | 1750 RPM' : 'STANDBY',
        terminals: [
          { id: 'vfd_r', number: 'R/L1', role: 'L1', x: 200, y: 335 },
          { id: 'vfd_s', number: 'S/L2', role: 'L2', x: 240, y: 335 },
          { id: 'vfd_t', number: 'T/L3', role: 'L3', x: 280, y: 335 },
          { id: 'vfd_u', number: 'U/T1', role: 'L1', x: 200, y: 415 },
          { id: 'vfd_v', number: 'V/T2', role: 'L2', x: 240, y: 415 },
          { id: 'vfd_w', number: 'W/T3', role: 'L3', x: 280, y: 415 },
        ],
      },
      {
        id: 'mtr03',
        tag: 'MTR03',
        name: 'Motor Exaustor Industrial',
        category: 'MOTOR_3P',
        x: 175,
        y: 450,
        width: 150,
        height: 75,
        isEnergized: isMotorRunning,
        stateText: isMotorRunning ? 'GIRANDO A 1750 RPM' : 'PARADO',
        terminals: [
          { id: 'mtr03_u', number: 'U', role: 'L1', x: 200, y: 455 },
          { id: 'mtr03_v', number: 'V', role: 'L2', x: 240, y: 455 },
          { id: 'mtr03_w', number: 'W', role: 'L3', x: 280, y: 455 },
          { id: 'mtr03_pe', number: 'PE', role: 'PE', x: 315, y: 455 },
        ],
      },
    ];

    const conductors: MultifilarConductorSegment[] = [
      // Bus to Q04
      {
        id: 'w_vfd_bus_l1',
        wireTag: 'W301-L1',
        role: 'L1',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L1.hex,
        isEnergized: isLiveBeforeBreaker,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 200 35 L 200 155',
        startLabel: 'L1',
        endLabel: 'Q04:1',
        labelCoord: { x: 205, y: 100 },
        normativeRef: 'Condutor Marrom 4mm²',
      },
      {
        id: 'w_vfd_bus_l2',
        wireTag: 'W302-L2',
        role: 'L2',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L2.hex,
        isEnergized: isLiveBeforeBreaker,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 240 60 L 240 155',
        startLabel: 'L2',
        endLabel: 'Q04:3',
        labelCoord: { x: 245, y: 110 },
        normativeRef: 'Condutor Preto 4mm²',
      },
      {
        id: 'w_vfd_bus_l3',
        wireTag: 'W303-L3',
        role: 'L3',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L3.hex,
        isEnergized: isLiveBeforeBreaker,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 280 85 L 280 155',
        startLabel: 'L3',
        endLabel: 'Q04:5',
        labelCoord: { x: 285, y: 120 },
        normativeRef: 'Condutor Cinza 4mm²',
      },

      // Q04 to KM04
      {
        id: 'w_q04_km04_l1',
        wireTag: 'W304-L1',
        role: 'L1',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L1.hex,
        isEnergized: isLiveAfterBreaker,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 200 210 L 200 245',
        startLabel: 'Q04:2',
        endLabel: 'KM04:1',
        labelCoord: { x: 205, y: 228 },
        normativeRef: 'Cabo 4mm² NBR 5410',
      },
      {
        id: 'w_q04_km04_l2',
        wireTag: 'W305-L2',
        role: 'L2',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L2.hex,
        isEnergized: isLiveAfterBreaker,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 240 210 L 240 245',
        startLabel: 'Q04:4',
        endLabel: 'KM04:3',
        labelCoord: { x: 245, y: 228 },
        normativeRef: 'Cabo 4mm² NBR 5410',
      },
      {
        id: 'w_q04_km04_l3',
        wireTag: 'W306-L3',
        role: 'L3',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L3.hex,
        isEnergized: isLiveAfterBreaker,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 280 210 L 280 245',
        startLabel: 'Q04:6',
        endLabel: 'KM04:5',
        labelCoord: { x: 285, y: 228 },
        normativeRef: 'Cabo 4mm² NBR 5410',
      },

      // KM04 to VFD01
      {
        id: 'w_km04_vfd_l1',
        wireTag: 'W307-L1',
        role: 'L1',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L1.hex,
        isEnergized: isVfdEnergized,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 200 300 L 200 335',
        startLabel: 'KM04:2',
        endLabel: 'VFD:R',
        labelCoord: { x: 205, y: 318 },
        normativeRef: 'Entrada Inversor R/L1',
      },
      {
        id: 'w_km04_vfd_l2',
        wireTag: 'W308-L2',
        role: 'L2',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L2.hex,
        isEnergized: isVfdEnergized,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 240 300 L 240 335',
        startLabel: 'KM04:4',
        endLabel: 'VFD:S',
        labelCoord: { x: 245, y: 318 },
        normativeRef: 'Entrada Inversor S/L2',
      },
      {
        id: 'w_km04_vfd_l3',
        wireTag: 'W309-L3',
        role: 'L3',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L3.hex,
        isEnergized: isVfdEnergized,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 280 300 L 280 335',
        startLabel: 'KM04:6',
        endLabel: 'VFD:T',
        labelCoord: { x: 285, y: 318 },
        normativeRef: 'Entrada Inversor T/L3',
      },

      // VFD to Motor MTR03 (Shielded Cable 4x4mm²)
      {
        id: 'w_vfd_mtr_u',
        wireTag: 'W310-U-SHIELD',
        role: 'L1',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L1.hex,
        isEnergized: isMotorRunning,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 200 415 L 200 455',
        startLabel: 'VFD:U',
        endLabel: 'MTR03:U',
        labelCoord: { x: 205, y: 435 },
        normativeRef: 'Cabo Blindado 4x4mm² PWM U',
      },
      {
        id: 'w_vfd_mtr_v',
        wireTag: 'W311-V-SHIELD',
        role: 'L2',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L2.hex,
        isEnergized: isMotorRunning,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 240 415 L 240 455',
        startLabel: 'VFD:V',
        endLabel: 'MTR03:V',
        labelCoord: { x: 245, y: 435 },
        normativeRef: 'Cabo Blindado 4x4mm² PWM V',
      },
      {
        id: 'w_vfd_mtr_w',
        wireTag: 'W312-W-SHIELD',
        role: 'L3',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L3.hex,
        isEnergized: isMotorRunning,
        actualCurrentA: isMotorRunning ? currentA : 0,
        voltageV: 380,
        pathD: 'M 280 415 L 280 455',
        startLabel: 'VFD:W',
        endLabel: 'MTR03:W',
        labelCoord: { x: 285, y: 435 },
        normativeRef: 'Cabo Blindado 4x4mm² PWM W',
      },

      // PE Ground + Shield grounding 360°
      {
        id: 'w_bus_pe_vfd',
        wireTag: 'W313-PE-SHIELD',
        role: 'PE',
        gaugeMm2: peGauge,
        colorHex: NBR5410_WIRE_COLORS.PE.hex,
        isEnergized: true,
        actualCurrentA: 0,
        voltageV: 0,
        pathD: 'M 320 110 L 320 455',
        startLabel: 'Barra PE',
        endLabel: 'Malha Blindada 360°',
        labelCoord: { x: 325, y: 280 },
        normativeRef: 'Aterramento EMC / NBR 5410 item 6.4',
      },
    ];

    const commandSignals = [
      {
        tag: 'DI1_RUN_STOP',
        name: 'Entrada Digital DI1 (Gira/Para)',
        type: 'NO' as const,
        address: '%Q0.1',
        isActive: isMotorRunning,
        description: isMotorRunning ? 'Sinal 24VDC Habilitado (RUN)' : 'Sinal 0VDC Desabilitado (STOP)',
      },
      {
        tag: 'AI1_SPEED_REF',
        name: 'Entrada Analógica AI1 (Referência 4-20mA)',
        type: 'RELAY' as const,
        address: '%IW64',
        isActive: isMotorRunning,
        description: isMotorRunning ? '20.0 mA (100% de Velocidade / 60Hz)' : '4.0 mA (Velocidade Mínima)',
      },
      {
        tag: 'DO1_NO_FAULT',
        name: 'Relé de Falha do Inversor (Sem Erro)',
        type: 'NC' as const,
        address: '%I2.0',
        isActive: !isEmergencyPressed,
        description: 'Contato seco NF de monitoramento de alarme térmico/curto',
      },
    ];

    return {
      id: 'cct_vfd',
      circuitType: 'vfd_inverter',
      tag: 'CCT-03',
      title: 'Acionamento com Inversor de Frequência VFD (3P+PE Blindado)',
      subtitle: 'Exaustor Industrial 10cv / 7.5kW — Controle Vetorial 0-60Hz',
      nominalPowerKw: powerKw,
      nominalVoltageV: voltageV,
      nominalCurrentA: currentA,
      powerFactor: 0.95,
      powerCableGaugeMm2: powerGauge,
      peCableGaugeMm2: peGauge,
      commandCableGaugeMm2: cmdGauge,
      groundingSystem: 'TN-S',
      coordinationType: 'TIPO 2',
      description:
        'Derivação para VFD com cabo quadripolar simétrico blindado (3F+PE) e aterramento 360° em prensa-cabo EMC conforme NBR 5410.',
      components,
      conductors,
      commandSignals,
    };
  }

  /**
   * 4. CIRCUITO MULTIFILAR ESTRELA-TRIÂNGULO (STAR-DELTA)
   */
  private static createStarDeltaDerivation(
    isBreakerClosed: boolean,
    isContactorEnergized: boolean,
    isThermalTripped: boolean,
    isEmergencyPressed: boolean
  ): MultifilarDerivationCircuit {
    const powerKw = 37; // 50 cv
    const voltageV = 380;
    const currentA = 70.0;
    const powerGauge = 16; // 16 mm²
    const peGauge = 16; // 16 mm²
    const cmdGauge = 1.5;

    const isLiveBeforeBreaker = true;
    const isLiveAfterBreaker = isLiveBeforeBreaker && isBreakerClosed && !isThermalTripped;
    const isLiveAfterContactor = isLiveAfterBreaker && isContactorEnergized;
    const isMotorRunning = isLiveAfterContactor;

    const components: MultifilarSchematicComponent[] = [
      {
        id: 'q05',
        tag: 'Q05',
        name: 'Disjuntor Termomagnético 100A',
        category: 'BREAKER',
        x: 180,
        y: 155,
        width: 160,
        height: 55,
        isEnergized: isLiveBeforeBreaker,
        isTripped: !isBreakerClosed,
        stateText: isBreakerClosed ? 'LIGADO' : 'ABERTO',
        terminals: [
          { id: 'q05_1', number: '1/L1', role: 'L1', x: 210, y: 155 },
          { id: 'q05_3', number: '3/L2', role: 'L2', x: 250, y: 155 },
          { id: 'q05_5', number: '5/L3', role: 'L3', x: 290, y: 155 },
          { id: 'q05_2', number: '2/T1', role: 'L1', x: 210, y: 210 },
          { id: 'q05_4', number: '4/T2', role: 'L2', x: 250, y: 210 },
          { id: 'q05_6', number: '6/T3', role: 'L3', x: 290, y: 210 },
        ],
      },
      {
        id: 'km1_main',
        tag: 'KM1',
        name: 'Contator Principal de Linha',
        category: 'CONTACTOR',
        x: 100,
        y: 255,
        width: 140,
        height: 60,
        isEnergized: isLiveAfterBreaker,
        stateText: isContactorEnergized ? 'FECHADO' : 'ABERTO',
        terminals: [
          { id: 'km1_1', number: '1/L1', role: 'L1', x: 130, y: 255 },
          { id: 'km1_3', number: '3/L2', role: 'L2', x: 170, y: 255 },
          { id: 'km1_5', number: '5/L3', role: 'L3', x: 210, y: 255 },
          { id: 'km1_2', number: '2/T1', role: 'L1', x: 130, y: 315 },
          { id: 'km1_4', number: '4/T2', role: 'L2', x: 170, y: 315 },
          { id: 'km1_6', number: '6/T3', role: 'L3', x: 210, y: 315 },
        ],
      },
      {
        id: 'km2_delta',
        tag: 'KM2',
        name: 'Contator de Triângulo (Δ)',
        category: 'CONTACTOR',
        x: 270,
        y: 255,
        width: 140,
        height: 60,
        isEnergized: isLiveAfterBreaker,
        stateText: isContactorEnergized ? 'EM REGIME TRIÂNGULO (Δ)' : 'DESLIGADO',
        terminals: [
          { id: 'km2_1', number: '1/L1', role: 'L1', x: 300, y: 255 },
          { id: 'km2_3', number: '3/L2', role: 'L2', x: 340, y: 255 },
          { id: 'km2_5', number: '5/L3', role: 'L3', x: 380, y: 255 },
          { id: 'km2_2', number: '2/T1', role: 'L1', x: 300, y: 315 },
          { id: 'km2_4', number: '4/T2', role: 'L2', x: 340, y: 315 },
          { id: 'km2_6', number: '6/T3', role: 'L3', x: 380, y: 315 },
        ],
      },
      {
        id: 'mtr05',
        tag: 'MTR05',
        name: 'Motor 6 Terminais (Bomba Centrífuga)',
        category: 'MOTOR_3P',
        x: 175,
        y: 430,
        width: 170,
        height: 85,
        isEnergized: isContactorEnergized && isLiveAfterBreaker,
        stateText: isContactorEnergized && isLiveAfterBreaker ? 'REGIME PERMANENTE 380V (Δ)' : 'PARADO',
        terminals: [
          { id: 'mtr05_u1', number: 'U1', role: 'L1', x: 190, y: 435 },
          { id: 'mtr05_v1', number: 'V1', role: 'L2', x: 220, y: 435 },
          { id: 'mtr05_w1', number: 'W1', role: 'L3', x: 250, y: 435 },
          { id: 'mtr05_w2', number: 'W2', role: 'L1', x: 280, y: 435 },
          { id: 'mtr05_u2', number: 'U2', role: 'L2', x: 310, y: 435 },
          { id: 'mtr05_v2', number: 'V2', role: 'L3', x: 330, y: 435 },
        ],
      },
    ];

    const conductors: MultifilarConductorSegment[] = [
      {
        id: 'w_sd_l1',
        wireTag: 'W401-L1',
        role: 'L1',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L1.hex,
        isEnergized: isLiveBeforeBreaker,
        actualCurrentA: isContactorEnergized ? currentA : 0,
        voltageV: 380,
        pathD: 'M 210 35 L 210 155',
        startLabel: 'L1',
        endLabel: 'Q05:1',
        labelCoord: { x: 215, y: 100 },
        normativeRef: 'Condutor Marrom 16mm²',
      },
      {
        id: 'w_sd_l2',
        wireTag: 'W402-L2',
        role: 'L2',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L2.hex,
        isEnergized: isLiveBeforeBreaker,
        actualCurrentA: isContactorEnergized ? currentA : 0,
        voltageV: 380,
        pathD: 'M 250 60 L 250 155',
        startLabel: 'L2',
        endLabel: 'Q05:3',
        labelCoord: { x: 255, y: 110 },
        normativeRef: 'Condutor Preto 16mm²',
      },
      {
        id: 'w_sd_l3',
        wireTag: 'W403-L3',
        role: 'L3',
        gaugeMm2: powerGauge,
        colorHex: NBR5410_WIRE_COLORS.L3.hex,
        isEnergized: isLiveBeforeBreaker,
        actualCurrentA: isContactorEnergized ? currentA : 0,
        voltageV: 380,
        pathD: 'M 290 85 L 290 155',
        startLabel: 'L3',
        endLabel: 'Q05:5',
        labelCoord: { x: 295, y: 120 },
        normativeRef: 'Condutor Cinza 16mm²',
      },
      {
        id: 'w_sd_pe',
        wireTag: 'W404-PE',
        role: 'PE',
        gaugeMm2: peGauge,
        colorHex: NBR5410_WIRE_COLORS.PE.hex,
        isEnergized: true,
        actualCurrentA: 0,
        voltageV: 0,
        pathD: 'M 350 110 L 350 435',
        startLabel: 'Barra PE',
        endLabel: 'MTR05:PE',
        labelCoord: { x: 355, y: 280 },
        normativeRef: 'NBR 5410 Tabela 58 (Verde 16mm²)',
      },
    ];

    const commandSignals = [
      {
        tag: 'KT1_TIMER',
        name: 'Relé Temporizador Estrela-Triângulo (0 a 10s)',
        type: 'RELAY' as const,
        address: '%TM0',
        isActive: isContactorEnergized,
        description: 'Comuta KM3 (Estrela) para KM2 (Triângulo) após 6.0 segundos de partida',
      },
      {
        tag: 'KM3_NC_LOCK',
        name: 'Intertravamento Elétrico KM3/KM2 (21-22)',
        type: 'NC' as const,
        address: '%I3.0',
        isActive: true,
        description: 'Garante que KM3 e KM2 nunca fechem simultaneamente (curto de barramento)',
      },
    ];

    return {
      id: 'cct_star_delta',
      circuitType: 'star_delta',
      tag: 'CCT-04',
      title: 'Partida Estrela-Triângulo com 3 Contatores (Y-Δ 3P+PE)',
      subtitle: 'Bomba Centrífuga de Captação 50cv / 37kW — 380V Trifásico',
      nominalPowerKw: powerKw,
      nominalVoltageV: voltageV,
      nominalCurrentA: currentA,
      powerFactor: 0.88,
      powerCableGaugeMm2: powerGauge,
      peCableGaugeMm2: peGauge,
      commandCableGaugeMm2: cmdGauge,
      groundingSystem: 'TN-S',
      coordinationType: 'TIPO 2',
      description:
        'Redução da corrente de partida para 1/3 de Idireta. Requer motor com 6 pontas acessíveis para ligação 380V Triângulo / 660V Estrela.',
      components,
      conductors,
      commandSignals,
    };
  }
}

export function createEmptySchematicData(): MultifilarSchematicData {
  return {
    busbarLayout: MultifilarSchematicRouter.generateBusbarLayout(),
    derivations: [],
    commandCircuits: [],
    motorTerminalBoxes: [],
  };
}
