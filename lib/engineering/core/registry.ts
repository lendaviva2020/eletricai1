// ==========================================
// ELÉTRICAI — ENGINEERING CORE 4.0 MODEL REGISTRY
// ==========================================
// Manages tag uniqueness, cross-referencing across Unifilar, Multifilar,
// Ladder and SCADA, and consistency validation.

import {
  ElectricalComponent,
  ElectricalConnection,
  SharedTag,
  LadderRung,
} from '@/types/electrical';
import { CrossReferenceMap, ElectricalCircuit } from './types';

export class EngineeringModelRegistry {
  private components: Map<string, ElectricalComponent> = new Map();
  private connections: Map<string, ElectricalConnection> = new Map();
  private tags: Map<string, SharedTag> = new Map();
  private rungs: LadderRung[] = [];
  private circuits: Map<string, ElectricalCircuit> = new Map();

  constructor(
    components: ElectricalComponent[] = [],
    connections: ElectricalConnection[] = [],
    tags: SharedTag[] = [],
    rungs: LadderRung[] = [],
    circuits: ElectricalCircuit[] = []
  ) {
    this.hydrate(components, connections, tags, rungs, circuits);
  }

  public hydrate(
    components: ElectricalComponent[],
    connections: ElectricalConnection[],
    tags: SharedTag[],
    rungs: LadderRung[],
    circuits: ElectricalCircuit[] = []
  ) {
    this.components.clear();
    this.connections.clear();
    this.tags.clear();
    this.circuits.clear();

    components.forEach(c => this.components.set(c.id, c));
    connections.forEach(cn => this.connections.set(cn.id, cn));
    tags.forEach(t => this.tags.set(t.id, t));
    circuits.forEach(cr => this.circuits.set(cr.id, cr));
    this.rungs = [...rungs];
  }

  // Ensure unique TAG by checking collision and generating next available
  public generateUniqueTag(prefix: string): string {
    const cleanPrefix = prefix.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    const existingTags = new Set(
      Array.from(this.components.values()).map(c => c.tag.toUpperCase())
    );

    let counter = 1;
    let candidate = `${cleanPrefix}${counter.toString().padStart(2, '0')}`;
    while (existingTags.has(candidate)) {
      counter++;
      candidate = `${cleanPrefix}${counter.toString().padStart(2, '0')}`;
    }

    return candidate;
  }

  // Cross-reference mapping across Unifilar, Ladder, and SCADA
  public buildCrossReferenceMap(): CrossReferenceMap {
    const map: CrossReferenceMap = {};

    for (const comp of this.components.values()) {
      const associatedRungs: string[] = [];
      const associatedPlcAddresses: string[] = [];
      const associatedScadaTags: string[] = [];

      // Check ladder elements referencing this component tag
      for (const rung of this.rungs) {
        for (const elem of rung.elements) {
          if (
            elem.tagId === comp.id ||
            elem.tagName?.toUpperCase() === comp.tag.toUpperCase()
          ) {
            associatedRungs.push(rung.id);
            if (elem.address) {
              associatedPlcAddresses.push(elem.address);
            }
          }
        }
      }

      // Check shared tags referencing component
      for (const tag of this.tags.values()) {
        if (
          tag.name.toUpperCase().includes(comp.tag.toUpperCase()) ||
          tag.description.toUpperCase().includes(comp.tag.toUpperCase())
        ) {
          associatedScadaTags.push(tag.name);
          if (tag.address) {
            associatedPlcAddresses.push(tag.address);
          }
        }
      }

      map[comp.tag] = {
        componentId: comp.id,
        panelTag: comp.zone || 'QGBT-01',
        ladderRungIds: Array.from(new Set(associatedRungs)),
        plcChannelAddresses: Array.from(new Set(associatedPlcAddresses)),
        scadaTagNames: Array.from(new Set(associatedScadaTags)),
        downstreamLoads: [],
      };
    }

    return map;
  }

  // Total installed power calculations
  public calculateTotalInstalledPower(): {
    totalKw: number;
    totalKva: number;
    totalCurrentA: number;
    highestMotorHp: number;
  } {
    let totalKw = 0;
    let totalKva = 0;
    let totalCurrentA = 0;
    let highestMotorHp = 0;

    for (const comp of this.components.values()) {
      const kw = comp.power || 0;
      const hp = comp.powerHp || 0;
      const current = comp.operationalCurrent || comp.nominalCurrent || 0;
      const pf = comp.powerFactor || 0.85;

      totalKw += kw;
      totalKva += pf > 0 ? kw / pf : kw;
      totalCurrentA += current;

      if (hp > highestMotorHp) {
        highestMotorHp = hp;
      }
    }

    return {
      totalKw: Math.round(totalKw * 100) / 100,
      totalKva: Math.round(totalKva * 100) / 100,
      totalCurrentA: Math.round(totalCurrentA * 10) / 10,
      highestMotorHp,
    };
  }
}
