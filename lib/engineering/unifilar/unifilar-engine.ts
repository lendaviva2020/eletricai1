// ============================================================================
// ELÉTRICAI — UNIFILAR ENGINEERING ENGINE (FASE 4)
// Motor determinístico de propagação de fluxo de potência, topologia elétrica,
// cálculo em tempo real de corrente de projeto (Ib), queda de tensão acumulada (ΔV%)
// e integridade referencial com o banco de dados.
// ============================================================================

import { ElectricalComponent, ElectricalConnection } from '@/types/electrical';
import {
  calculateThreePhaseIb,
  calculateVoltageDropPercent,
  NBR5410_AMPACITY_TABLE,
} from '@/lib/nbr5410';

export interface UnifilarNodeState {
  componentId: string;
  isEnergized: boolean;
  effectiveVoltageV: number;
  operationalCurrentA: number;
  cumulativeVoltageDropPercent: number;
  upstreamComponentId?: string;
  downstreamComponentIds: string[];
}

export interface UnifilarSimulationResult {
  energizedComponentIds: Set<string>;
  energizedConnectionIds: Set<string>;
  nodeStates: Map<string, UnifilarNodeState>;
  totalInstalledKw: number;
  totalOperatingCurrentA: number;
  maxVoltageDropPercent: number;
  criticalAlerts: Array<{
    componentId: string;
    tag: string;
    severity: 'WARNING' | 'ERROR' | 'CRITICAL';
    message: string;
  }>;
}

export class UnifilarEngineeringEngine {
  /**
   * Simula a propagação elétrica da rede unifilar de montante para jusante.
   * Rastreia a energização, correntes somadas nos alimentadores e queda de tensão acumulada.
   */
  public static simulatePowerFlow(
    components: ElectricalComponent[],
    connections: ElectricalConnection[]
  ): UnifilarSimulationResult {
    const compMap = new Map<string, ElectricalComponent>();
    components.forEach(c => compMap.set(c.id, c));

    // Mapeamento topológico de adjacência (from -> to)
    const outgoingConns = new Map<string, ElectricalConnection[]>();
    const incomingConns = new Map<string, ElectricalConnection[]>();

    for (const conn of connections) {
      if (!outgoingConns.has(conn.fromComponentId)) outgoingConns.set(conn.fromComponentId, []);
      outgoingConns.get(conn.fromComponentId)!.push(conn);

      if (!incomingConns.has(conn.toComponentId)) incomingConns.set(conn.toComponentId, []);
      incomingConns.get(conn.toComponentId)!.push(conn);
    }

    const energizedComponentIds = new Set<string>();
    const energizedConnectionIds = new Set<string>();
    const nodeStates = new Map<string, UnifilarNodeState>();
    const criticalAlerts: UnifilarSimulationResult['criticalAlerts'] = [];

    // 1. Identificar Fontes Primárias de Tensão (Raízes da Árvore de Potência)
    const sources = components.filter(c =>
      c.category === 'SOURCE_MT' ||
      c.category === 'TRANSFORMER_MT_BT' ||
      c.category === 'GENERATOR' ||
      c.category === 'UPS'
    );

    // Se não houver fontes explícitas, considera o primeiro disjuntor principal ou barramento geral
    if (sources.length === 0 && components.length > 0) {
      const fallbackSource = components.find(c => c.category === 'MAIN_BREAKER' || c.category === 'BUSBAR') || components[0];
      sources.push(fallbackSource);
    }

    // Fila de propagação BFS
    const queue: Array<{
      componentId: string;
      cumulativeVDrop: number;
      upstreamId?: string;
    }> = [];

    for (const src of sources) {
      // Se a fonte não estiver desligada ou desenergizada
      const isSrcActive = src.isEnergized ?? true;
      if (isSrcActive) {
        energizedComponentIds.add(src.id);
        nodeStates.set(src.id, {
          componentId: src.id,
          isEnergized: true,
          effectiveVoltageV: src.voltage || 380,
          operationalCurrentA: src.operationalCurrent || src.nominalCurrent || 0,
          cumulativeVoltageDropPercent: 0,
          downstreamComponentIds: [],
        });

        queue.push({
          componentId: src.id,
          cumulativeVDrop: 0,
        });
      }
    }

    // 2. Propagação de Fluxo de Potência (BFS)
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current.componentId)) continue;
      visited.add(current.componentId);

      const currentComp = compMap.get(current.componentId);
      if (!currentComp) continue;

      // Disjuntores tripados / abertos cortam o fluxo de potência
      if (currentComp.isTripped) {
        continue;
      }

      const outConns = outgoingConns.get(current.componentId) || [];

      for (const conn of outConns) {
        const targetComp = compMap.get(conn.toComponentId);
        if (!targetComp) continue;

        // Conexão energizada
        energizedConnectionIds.add(conn.id);
        energizedComponentIds.add(targetComp.id);

        // Calcular corrente de projeto (Ib) do alvo se for carga
        let targetIb = targetComp.operationalCurrent || 0;
        if (targetComp.power && targetComp.power > 0) {
          const pf = targetComp.powerFactor || 0.85;
          const eff = (targetComp.efficiency || 90) / 100;
          targetIb = calculateThreePhaseIb(targetComp.power, targetComp.voltage || 380, pf, eff);
        } else if (targetComp.nominalCurrent) {
          targetIb = targetComp.nominalCurrent * 0.8;
        }

        // Calcular queda de tensão deste trecho de cabo
        const cableSection = targetComp.cableCrossSection || 4.0;
        const cableLength = targetComp.cableLength || 15.0;
        const pf = targetComp.powerFactor || 0.85;
        const nominalV = targetComp.voltage || currentComp.voltage || 380;

        const branchVDrop = calculateVoltageDropPercent(targetIb, cableLength, cableSection, nominalV, pf);
        const totalVDrop = current.cumulativeVDrop + branchVDrop;

        // Atualizar estado do nó jusante
        const downstreamList = nodeStates.get(current.componentId)?.downstreamComponentIds || [];
        if (!downstreamList.includes(targetComp.id)) {
          downstreamList.push(targetComp.id);
        }

        nodeStates.set(targetComp.id, {
          componentId: targetComp.id,
          isEnergized: true,
          effectiveVoltageV: nominalV * (1 - totalVDrop / 100),
          operationalCurrentA: targetIb,
          cumulativeVoltageDropPercent: Math.round(totalVDrop * 100) / 100,
          upstreamComponentId: current.componentId,
          downstreamComponentIds: [],
        });

        // Verificações Normativas NBR 5410
        if (totalVDrop > 4.0) {
          criticalAlerts.push({
            componentId: targetComp.id,
            tag: targetComp.tag,
            severity: totalVDrop > 6.0 ? 'CRITICAL' : 'ERROR',
            message: `Queda de tensão de ${totalVDrop.toFixed(2)}% no circuito ${targetComp.tag} excede o limite normativo da NBR 5410 (máx 4.0%).`,
          });
        }

        // Verificar capacidade de condução de corrente (Tabela 36-39 NBR 5410)
        const ampacityRow = NBR5410_AMPACITY_TABLE.find(r => r.sectionMm2 >= cableSection) || NBR5410_AMPACITY_TABLE[0];
        const cableCapacity = ampacityRow.methodB1_PVC;
        if (targetIb > cableCapacity) {
          criticalAlerts.push({
            componentId: targetComp.id,
            tag: targetComp.tag,
            severity: 'CRITICAL',
            message: `Corrente de projeto Ib (${targetIb.toFixed(1)}A) excede a capacidade Iz do condutor de ${cableSection}mm² (${cableCapacity}A). Risco térmico!`,
          });
        }

        // Enfileirar nó para continuar a propagação
        queue.push({
          componentId: targetComp.id,
          cumulativeVDrop: totalVDrop,
          upstreamId: current.componentId,
        });
      }
    }

    // 3. Totais calculados
    let totalKw = 0;
    let totalOperatingCurrentA = 0;
    let maxVoltageDropPercent = 0;

    for (const comp of components) {
      if (energizedComponentIds.has(comp.id)) {
        if (comp.power) totalKw += comp.power;
        const node = nodeStates.get(comp.id);
        if (node) {
          totalOperatingCurrentA += node.operationalCurrentA;
          if (node.cumulativeVoltageDropPercent > maxVoltageDropPercent) {
            maxVoltageDropPercent = node.cumulativeVoltageDropPercent;
          }
        }
      }
    }

    return {
      energizedComponentIds,
      energizedConnectionIds,
      nodeStates,
      totalInstalledKw: Math.round(totalKw * 100) / 100,
      totalOperatingCurrentA: Math.round(totalOperatingCurrentA * 10) / 10,
      maxVoltageDropPercent: Math.round(maxVoltageDropPercent * 100) / 100,
      criticalAlerts,
    };
  }

  /**
   * Recalcula os componentes com as grandezas elétricas atualizadas dinamicamente
   * prontas para renderização visual e persistência no banco.
   */
  public static enrichComponentsWithElectricalMath(
    components: ElectricalComponent[],
    connections: ElectricalConnection[]
  ): ElectricalComponent[] {
    const simulation = this.simulatePowerFlow(components, connections);

    return components.map(c => {
      const node = simulation.nodeStates.get(c.id);
      const isEnergized = simulation.energizedComponentIds.has(c.id);

      if (!node) {
        return {
          ...c,
          isEnergized: false,
          voltageDropPercent: 0,
        };
      }

      return {
        ...c,
        isEnergized,
        operationalCurrent: Math.round(node.operationalCurrentA * 10) / 10,
        voltageDropPercent: node.cumulativeVoltageDropPercent,
      };
    });
  }

  /**
   * Gera pontos ortogonais (Manhattan 90°) com folga estética para interconexão unifilar.
   */
  public static calculateOrthogonalWirePath(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): string {
    const midY = fromY + (toY - fromY) / 2;
    // Caminho em Z / S ortogonal
    return `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
  }
}
