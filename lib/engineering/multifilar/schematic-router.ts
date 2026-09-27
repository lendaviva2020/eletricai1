// ============================================================================
// ELÉTRICAI — MULTIFILAR SCHEMATIC ROUTER (FASE 5)
// Gerador determinístico de esquemas trifásicos 3F+N+PE a partir do modelo unificado.
// Separa barramentos de força (L1, L2, L3), neutro (N) e proteção (PE),
// roteando derivações normalizadas para partidas de motores e circuitos de comando.
// ============================================================================

import { ElectricalComponent, ElectricalConnection } from '@/types/electrical';
import { UnifilarNodeState, UnifilarSimulationResult } from '@/lib/engineering/unifilar/unifilar-engine';

export type PhaseConductor = 'L1' | 'L2' | 'L3' | 'N' | 'PE';
export type CircuitType = 'POWER_3P' | 'POWER_1P' | 'CONTROL_24V' | 'CONTROL_220V' | 'PE_GROUND' | 'NEUTRAL';

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
  circuitType: CircuitType;
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
}

export function createEmptySchematicData(): MultifilarSchematicData {
  return {
    busbarLayout: MultifilarSchematicRouter.generateBusbarLayout(),
    derivations: [],
    commandCircuits: [],
    motorTerminalBoxes: [],
  };
}