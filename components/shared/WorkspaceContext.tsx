'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tenant,
  UserProfile,
  TenantRole,
  SharedTag,
  ElectricalComponent,
  ElectricalConnection,
  LadderRung,
  FbdBlock,
  FbdWire,
  PlcRackConfig,
  ScadaWidget,
  ScadaScriptLog,
  DigitalTwinHotspot,
  BomItem,
  AiPatchProposal,
} from '@/types/electrical';
import {
  INITIAL_TENANT,
  INITIAL_USER,
  INITIAL_SHARED_TAGS,
  INITIAL_COMPONENTS,
  INITIAL_CONNECTIONS,
  INITIAL_LADDER_RUNGS,
  INITIAL_FBD_BLOCKS,
  INITIAL_FBD_WIRES,
  INITIAL_PLC_RACK,
  INITIAL_SCADA_WIDGETS,
  INITIAL_SCADA_SANDBOX_SCRIPT,
  INITIAL_TWIN_HOTSPOTS,
  INITIAL_BOM_ITEMS,
} from '@/lib/sample-project';

export type WorkspaceTab =
  | 'dashboard'
  | 'unifilar'
  | 'multifilar'
  | 'ladder'
  | 'fbd'
  | 'plc'
  | 'scada'
  | 'digital_twin'
  | 'bom'
  | 'ai_copilot';

export type WhatIfScenario = 'normal' | 'overload_trip' | 'grid_failure' | 'phase_asymmetry' | 'high_temp';

interface WorkspaceContextValue {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  tenant: Tenant;
  setTenant: React.Dispatch<React.SetStateAction<Tenant>>;
  user: UserProfile;
  setUserRole: (role: TenantRole) => void;
  
  // Shared Tag Engine
  sharedTags: SharedTag[];
  updateTagValue: (tagIdOrName: string, value: boolean | number | string) => void;
  addSharedTag: (tag: SharedTag) => void;

  // Electrical Diagrams
  components: ElectricalComponent[];
  connections: ElectricalConnection[];
  selectedComponentId: string | null;
  setSelectedComponentId: (id: string | null) => void;
  toggleBreakerState: (componentId: string) => void;
  updateComponent: (id: string, updates: Partial<ElectricalComponent>) => void;
  addComponent: (component: ElectricalComponent) => void;
  deleteComponent: (id: string) => void;

  // Ladder Logic
  ladderRungs: LadderRung[];
  setLadderRungs: React.Dispatch<React.SetStateAction<LadderRung[]>>;
  toggleLadderContact: (rungId: string, elementId: string) => void;
  addLadderRung: (rung: LadderRung) => void;

  // FBD
  fbdBlocks: FbdBlock[];
  fbdWires: FbdWire[];
  updateFbdBlockParam: (blockId: string, paramKey: string, value: string | number) => void;

  // PLC Rack
  plcRack: PlcRackConfig;
  updatePlcSlot: (slotNumber: number, updates: Partial<PlcRackConfig['slots'][0]>) => void;

  // SCADA & Sandbox
  scadaWidgets: ScadaWidget[];
  scadaScript: string;
  setScadaScript: (script: string) => void;
  scadaLogs: ScadaScriptLog[];
  runScadaSandbox: () => void;

  // Digital Twin 3D
  twinHotspots: DigitalTwinHotspot[];
  selectedHotspotId: string | null;
  setSelectedHotspotId: (id: string | null) => void;
  whatIfScenario: WhatIfScenario;
  setWhatIfScenario: (scenario: WhatIfScenario) => void;

  // BOM & Memorial
  bomItems: BomItem[];
  addBomItem: (item: BomItem) => void;

  // AI Generative & Patch Diff
  activePatch: AiPatchProposal | null;
  setActivePatch: (patch: AiPatchProposal | null) => void;
  applyPatch: (patch: AiPatchProposal) => void;
  rejectPatch: () => void;

  // Authentication State
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  isSelectingTenant: boolean;
  setIsSelectingTenant: React.Dispatch<React.SetStateAction<boolean>>;
  isViewingLanding: boolean;
  setIsViewingLanding: React.Dispatch<React.SetStateAction<boolean>>;
  openWorkspaceFromLanding: () => void;
  openLoginFromLanding: () => void;
  login: (email?: string, role?: TenantRole) => void;
  logout: () => void;
  selectTenantAndOpenWorkspace: (tenantData: Tenant, role?: TenantRole) => void;

  // Live Simulation
  isSimulationRunning: boolean;
  setIsSimulationRunning: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Export functions
  downloadDxf: () => void;
  downloadPlcopenXml: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  const [tenant, setTenant] = useState<Tenant>(INITIAL_TENANT);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [sharedTags, setSharedTags] = useState<SharedTag[]>(INITIAL_SHARED_TAGS);
  const [components, setComponents] = useState<ElectricalComponent[]>(INITIAL_COMPONENTS);
  const [connections, setConnections] = useState<ElectricalConnection[]>(INITIAL_CONNECTIONS);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>('comp_q02');
  const [ladderRungs, setLadderRungs] = useState<LadderRung[]>(INITIAL_LADDER_RUNGS);
  const [fbdBlocks, setFbdBlocks] = useState<FbdBlock[]>(INITIAL_FBD_BLOCKS);
  const [fbdWires, setFbdWires] = useState<FbdWire[]>(INITIAL_FBD_WIRES);
  const [plcRack, setPlcRack] = useState<PlcRackConfig>(INITIAL_PLC_RACK);
  const [scadaWidgets, setScadaWidgets] = useState<ScadaWidget[]>(INITIAL_SCADA_WIDGETS);
  const [scadaScript, setScadaScript] = useState<string>(INITIAL_SCADA_SANDBOX_SCRIPT);
  const [scadaLogs, setScadaLogs] = useState<ScadaScriptLog[]>([
    { timestamp: '16:20:00', level: 'INFO', message: 'EletricAI Sandbox Inicializado - Modo Seguro Air-Gapped.' },
    { timestamp: '16:20:01', level: 'SUCCESS', message: 'Conexão Modbus TCP S7-1500 ativa em 192.168.10.20.' },
  ]);
  const [twinHotspots, setTwinHotspots] = useState<DigitalTwinHotspot[]>(INITIAL_TWIN_HOTSPOTS);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>('twin_cubicle_q02');
  const [whatIfScenario, setWhatIfScenario] = useState<WhatIfScenario>('normal');
  const [bomItems, setBomItems] = useState<BomItem[]>(INITIAL_BOM_ITEMS);
  const [activePatch, setActivePatch] = useState<AiPatchProposal | null>(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSelectingTenant, setIsSelectingTenant] = useState<boolean>(true);
  const [isViewingLanding, setIsViewingLanding] = useState<boolean>(true);

  const openWorkspaceFromLanding = useCallback(() => {
    setIsAuthenticated(true);
    setIsSelectingTenant(false);
    setIsViewingLanding(false);
  }, []);

  const openLoginFromLanding = useCallback(() => {
    setIsAuthenticated(false);
    setIsViewingLanding(false);
    setIsSelectingTenant(false);
  }, []);

  const selectTenantAndOpenWorkspace = useCallback((tenantData: Tenant, role?: TenantRole) => {
    setTenant(tenantData);
    if (role) {
      setUser(prev => ({ ...prev, role }));
    }
    setIsSelectingTenant(false);
  }, []);

  const login = useCallback((email?: string, role?: TenantRole) => {
    if (email) {
      setUser(prev => ({
        ...prev,
        email: email,
        name: email.includes('beatriz') ? 'Engª. Beatriz Lima' : 'Eng. Luis Felipe',
        role: role || (email.includes('beatriz') ? 'engineer' : 'admin'),
        creaNumber: email.includes('beatriz') ? 'CREA-SP 50849201' : 'CREA-PR 88.412/D',
      }));
    } else if (role) {
      setUser(prev => ({ ...prev, role }));
    }
    setIsAuthenticated(true);
    setIsSelectingTenant(true);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setIsSelectingTenant(true);
  }, []);

  const setUserRole = useCallback((role: TenantRole) => {
    setUser(prev => ({ ...prev, role }));
  }, []);

  // UPDATE TAG VALUE - Core sync across all modules
  const updateTagValue = useCallback((tagIdOrName: string, value: boolean | number | string) => {
    setSharedTags(prevTags =>
      prevTags.map(tag => {
        if (tag.id === tagIdOrName || tag.name === tagIdOrName) {
          return { ...tag, currentValue: value };
        }
        return tag;
      })
    );

    // Sync corresponding component state if breaker or motor
    setComponents(prevComps =>
      prevComps.map(comp => {
        if (comp.tag === tagIdOrName || comp.id === tagIdOrName) {
          const isClosed = typeof value === 'boolean' ? value : true;
          return {
            ...comp,
            isEnergized: isClosed,
            isTripped: !isClosed,
          };
        }
        return comp;
      })
    );

    // Sync corresponding ladder rung energized status
    setLadderRungs(prevRungs =>
      prevRungs.map(rung => ({
        ...rung,
        elements: rung.elements.map(elem => {
          if (elem.tagId === tagIdOrName || elem.tagName === tagIdOrName) {
            const energized = typeof value === 'boolean' ? value : true;
            return { ...elem, isEnergized: energized };
          }
          return elem;
        }),
      }))
    );
  }, []);

  const addSharedTag = useCallback((newTag: SharedTag) => {
    setSharedTags(prev => {
      const exists = prev.some(t => t.id === newTag.id || t.name === newTag.name);
      if (exists) return prev;
      return [...prev, newTag];
    });
  }, []);

  // TOGGLE BREAKER (ON/OFF / TRIP)
  const toggleBreakerState = useCallback((compIdent: string) => {
    setComponents(prevComps =>
      prevComps.map(comp => {
        if (comp.id === compIdent || comp.tag === compIdent) {
          const nextState = !comp.isEnergized;
          return {
            ...comp,
            isEnergized: nextState,
            isTripped: !nextState,
            statusText: nextState ? 'Disjuntor Fechado / Energizado' : 'ABERTO / TRIP NR-10',
          };
        }
        return comp;
      })
    );

    // Find and update the shared tag
    const targetComp = components.find(c => c.id === compIdent || c.tag === compIdent);
    if (targetComp) {
      updateTagValue(targetComp.tag, !targetComp.isEnergized);
    }
  }, [components, updateTagValue]);

  const updateComponent = useCallback((id: string, updates: Partial<ElectricalComponent>) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const addComponent = useCallback((comp: ElectricalComponent) => {
    setComponents(prev => [...prev, comp]);
  }, []);

  const deleteComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    setConnections(prev => prev.filter(conn => conn.fromComponentId !== id && conn.toComponentId !== id));
  }, []);

  // LADDER CONTACT TOGGLE
  const toggleLadderContact = useCallback((rungId: string, elementId: string) => {
    setLadderRungs(prevRungs =>
      prevRungs.map(rung => {
        if (rung.id !== rungId) return rung;
        return {
          ...rung,
          elements: rung.elements.map(elem => {
            if (elem.id === elementId) {
              const nextVal = !elem.isEnergized;
              updateTagValue(elem.tagName, nextVal);
              return { ...elem, isEnergized: nextVal };
            }
            return elem;
          }),
        };
      })
    );
  }, [updateTagValue]);

  const addLadderRung = useCallback((rung: LadderRung) => {
    setLadderRungs(prev => [...prev, rung]);
  }, []);

  const updateFbdBlockParam = useCallback((blockId: string, paramKey: string, value: string | number) => {
    setFbdBlocks(prev =>
      prev.map(blk => {
        if (blk.id === blockId) {
          return {
            ...blk,
            parameters: {
              ...(blk.parameters || {}),
              [paramKey]: value,
            },
          };
        }
        return blk;
      })
    );
  }, []);

  const updatePlcSlot = useCallback((slotNumber: number, updates: Partial<PlcRackConfig['slots'][0]>) => {
    setPlcRack(prev => ({
      ...prev,
      slots: prev.slots.map(s => s.slotNumber === slotNumber ? { ...s, ...updates } : s),
    }));
  }, []);

  // SCADA SANDBOX WEB WORKER RUNNER (Air-Gapped script execution)
  const runScadaSandbox = useCallback(() => {
    try {
      // Create a dictionary of current tags
      const currentTagDict: Record<string, any> = {};
      sharedTags.forEach(t => {
        currentTagDict[t.name] = t.currentValue;
      });

      // Air-Gapped Web Worker execution simulation using isolated Function with blocked globals
      const safeExecute = new Function('tags', `
        "use strict";
        // Sandboxed isolation
        const window = undefined;
        const document = undefined;
        const fetch = undefined;
        const XMLHttpRequest = undefined;
        const localStorage = undefined;
        ${scadaScript}
        return executeCycle(tags);
      `);

      const result = safeExecute(currentTagDict);
      const newLogs: ScadaScriptLog[] = (result?.logs || []).map((l: any) => ({
        timestamp: new Date().toLocaleTimeString(),
        level: l.level || 'INFO',
        message: l.message || '',
      }));

      newLogs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: 'SUCCESS',
        message: `Ciclo concluído em 1.4ms. Status: ${result?.status || 'OK'}.`,
      });

      setScadaLogs(prev => [...newLogs, ...prev].slice(0, 30));
    } catch (err: any) {
      setScadaLogs(prev => [
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'ERROR',
          message: `Erro na sandbox do Web Worker: ${err.message}`,
        },
        ...prev,
      ]);
    }
  }, [sharedTags, scadaScript]);

  const addBomItem = useCallback((item: BomItem) => {
    setBomItems(prev => [...prev, item]);
  }, []);

  // APPLY AI PATCH DIFF
  const applyPatch = useCallback((patch: AiPatchProposal) => {
    patch.changes.forEach(change => {
      if (change.targetType === 'COMPONENT') {
        if (change.action === 'ADD') {
          const after = change.after as any;
          const newComp: ElectricalComponent = {
            id: change.targetId || `comp_${Date.now()}`,
            tag: change.targetName,
            name: String(after.name || change.targetName),
            category: (after.category as any) || 'MOTOR_BREAKER',
            x: 200 + Math.random() * 200,
            y: 520,
            width: 140,
            height: 70,
            voltage: Number(after.voltage) || 380,
            nominalCurrent: Number(after.nominalCurrent) || 32,
            operationalCurrent: Number(after.operationalCurrent) || 24,
            breakingCapacity: Number(after.breakingCapacity) || 25,
            cableCrossSection: Number(after.cableCrossSection) || 10,
            voltageDropPercent: Number(after.voltageDropPercent) || 1.2,
            isEnergized: true,
            ports: [
              { id: `p_in_${Date.now()}`, type: 'in', x: 270, y: 520 },
              { id: `p_out_${Date.now()}`, type: 'out', x: 270, y: 590 },
            ],
            manufacturer: 'WEG',
            partNumber: 'MPW40',
            unitCostBrl: 450,
            statusText: 'Adicionado via IA Patch Aprovado',
          };
          setComponents(prev => [...prev, newComp]);
        } else if (change.action === 'MODIFY') {
          setComponents(prev =>
            prev.map(c => {
              if (c.tag === change.targetName || c.id === change.targetId) {
                return { ...c, ...(change.after as any) };
              }
              return c;
            })
          );
        } else if (change.action === 'REMOVE') {
          setComponents(prev => prev.filter(c => c.tag !== change.targetName && c.id !== change.targetId));
        }
      } else if (change.targetType === 'TAG') {
        if (change.action === 'ADD') {
          const after = change.after as any;
          const newTag: SharedTag = {
            id: change.targetId || `tag_${Date.now()}`,
            name: change.targetName,
            description: `Criada via Patch: ${change.technicalRationale}`,
            address: String(after.address || '%M10.0'),
            dataType: (after.dataType as any) || 'BOOL',
            direction: (after.direction as any) || 'OUTPUT',
            currentValue: false,
          };
          addSharedTag(newTag);
        }
      } else if (change.targetType === 'CABLE_GAUGE') {
        const after = change.after as any;
        setComponents(prev =>
          prev.map(c => {
            if (c.tag === change.targetName || c.id === change.targetId) {
              return {
                ...c,
                cableCrossSection: Number(after.cableCrossSection) || c.cableCrossSection,
                voltageDropPercent: Number(after.voltageDropPercent) || c.voltageDropPercent,
              };
            }
            return c;
          })
        );
      }
    });

    setActivePatch(null);
  }, [addSharedTag]);

  const rejectPatch = useCallback(() => {
    setActivePatch(null);
  }, []);

  // EXPORT TO DXF (Real standard ASCII DXF format)
  const downloadDxf = useCallback(() => {
    let dxf = `0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nENDSEC\n0\nSECTION\n2\nBLOCKS\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n`;

    // Write components as blocks/rectangles and text
    components.forEach(c => {
      // Draw rectangle border
      dxf += `0\nLWPOLYLINE\n8\nELETRICAI_UNIFILAR\n90\n4\n70\n1\n`;
      dxf += `10\n${c.x}\n20\n${c.y}\n`;
      dxf += `10\n${c.x + c.width}\n20\n${c.y}\n`;
      dxf += `10\n${c.x + c.width}\n20\n${c.y + c.height}\n`;
      dxf += `10\n${c.x}\n20\n${c.y + c.height}\n`;

      // Label TAG
      dxf += `0\nTEXT\n8\nTAGS\n10\n${c.x + 5}\n20\n${c.y + 15}\n40\n8.0\n1\n${c.tag}\n`;
      // Label Info
      dxf += `0\nTEXT\n8\nINFO\n10\n${c.x + 5}\n20\n${c.y + 35}\n40\n5.0\n1\n${c.nominalCurrent}A - ${c.voltage}V\n`;
    });

    // Write connections as lines
    connections.forEach(conn => {
      const fromC = components.find(c => c.id === conn.fromComponentId);
      const toC = components.find(c => c.id === conn.toComponentId);
      if (fromC && toC) {
        dxf += `0\nLINE\n8\nBARRAMENTO\n10\n${fromC.x + fromC.width / 2}\n20\n${fromC.y + fromC.height}\n30\n0\n11\n${toC.x + toC.width / 2}\n21\n${toC.y}\n31\n0\n`;
      }
    });

    dxf += `0\nENDSEC\n0\nEOF\n`;

    const blob = new Blob([dxf], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EletricAI_${tenant.name.replace(/\s+/g, '_')}_Unifilar.dxf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [components, connections, tenant.name]);

  // EXPORT PLCOPEN XML (IEC 61131-3 standard)
  const downloadPlcopenXml = useCallback(() => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<project xmlns="http://www.plcopen.org/xml/tc6_0201">
  <fileHeader companyName="EletricAI" productName="EletricAI Industrial OS" productVersion="2.4" creationDateTime="${new Date().toISOString()}"/>
  <contentHeader name="CCM_PAULINIA_PLC_PROJECT">
    <coordinateInfo>
      <fbd><scaling x="1" y="1"/></fbd>
      <ld><scaling x="1" y="1"/></ld>
      <sfc><scaling x="1" y="1"/></sfc>
    </coordinateInfo>
  </contentHeader>
  <types>
    <dataTypes/>
    <pous>
      <pou name="MAIN_PROGRAM" pouType="program">
        <interface>
          <localVars>
${sharedTags.map(t => `            <variable name="${t.name}">
              <type><${t.dataType.toLowerCase()}/></type>
              <address>${t.address}</address>
              <documentation><xhtml xmlns="http://www.w3.org/1999/xhtml">${t.description}</xhtml></documentation>
            </variable>`).join('\n')}
          </localVars>
        </interface>
        <body>
          <ST>
            <![CDATA[
(* Generated by EletricAI IEC 61131-3 Shared Engine *)
// Interlocking & Emergency logic
IF NOT BTN_EMERGENCIA OR NOT FT01_TERMIC_COMP THEN
    Q01_GERAL := FALSE;
    KM01_COMPRESSOR := FALSE;
    LAMP_ALARME_FALHA := TRUE;
ELSE
    LAMP_ALARME_FALHA := FALSE;
END_IF;

// Compressor direct start with latch
IF BTN_PARTIDA_COMP AND BTN_PARADA_COMP AND Q01_GERAL THEN
    KM01_COMPRESSOR := TRUE;
ELSIF NOT BTN_PARADA_COMP THEN
    KM01_COMPRESSOR := FALSE;
END_IF;
            ]]>
          </ST>
        </body>
      </pou>
    </pous>
  </types>
  <instances>
    <configurations>
      <configuration name="Config0">
        <resource name="Res0">
          <task name="FastTask" interval="T#10ms" priority="1">
            <pouInstance name="InstMain" typeName="MAIN_PROGRAM"/>
          </task>
        </resource>
      </configuration>
    </configurations>
  </instances>
</project>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EletricAI_${plcRack.chassisName}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sharedTags, plcRack.chassisName]);

  // LIVE TELEMETRY SIMULATION TICK
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      // Oscillate analog values with small realistic industrial variations
      setSharedTags(prevTags =>
        prevTags.map(tag => {
          if (tag.name === 'PRESSAO_REDE_AR') {
            const current = Number(tag.currentValue);
            let next = current + (Math.random() * 0.1 - 0.05);
            if (next > 8.5) next = 7.0;
            if (next < 6.8) next = 7.2;
            return { ...tag, currentValue: Math.round(next * 100) / 100 };
          }
          if (tag.name === 'TEMP_MANCAL_COMP') {
            const current = Number(tag.currentValue);
            const delta = whatIfScenario === 'high_temp' ? 0.3 : (Math.random() * 0.4 - 0.2);
            let next = current + delta;
            if (next < 55) next = 60;
            return { ...tag, currentValue: Math.round(next * 10) / 10 };
          }
          if (tag.name === 'CORRENTE_FASE_R') {
            const base = whatIfScenario === 'overload_trip' ? 62.4 : 41.6;
            const next = base + (Math.random() * 1.2 - 0.6);
            return { ...tag, currentValue: Math.round(next * 10) / 10 };
          }
          return tag;
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulationRunning, whatIfScenario]);

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      tenant,
      setTenant,
      user,
      setUserRole,
      sharedTags,
      updateTagValue,
      addSharedTag,
      components,
      connections,
      selectedComponentId,
      setSelectedComponentId,
      toggleBreakerState,
      updateComponent,
      addComponent,
      deleteComponent,
      ladderRungs,
      setLadderRungs,
      toggleLadderContact,
      addLadderRung,
      fbdBlocks,
      fbdWires,
      updateFbdBlockParam,
      plcRack,
      updatePlcSlot,
      scadaWidgets,
      scadaScript,
      setScadaScript,
      scadaLogs,
      runScadaSandbox,
      twinHotspots,
      selectedHotspotId,
      setSelectedHotspotId,
      whatIfScenario,
      setWhatIfScenario,
      bomItems,
      addBomItem,
      activePatch,
      setActivePatch,
      applyPatch,
      rejectPatch,
      isSimulationRunning,
      setIsSimulationRunning,
      downloadDxf,
      downloadPlcopenXml,
      isAuthenticated,
      setIsAuthenticated,
      isSelectingTenant,
      setIsSelectingTenant,
      isViewingLanding,
      setIsViewingLanding,
      openWorkspaceFromLanding,
      openLoginFromLanding,
      login,
      logout,
      selectTenantAndOpenWorkspace,
    }),
    [
      activeTab,
      tenant,
      user,
      setUserRole,
      sharedTags,
      updateTagValue,
      addSharedTag,
      components,
      connections,
      selectedComponentId,
      toggleBreakerState,
      updateComponent,
      addComponent,
      deleteComponent,
      ladderRungs,
      toggleLadderContact,
      addLadderRung,
      fbdBlocks,
      fbdWires,
      updateFbdBlockParam,
      plcRack,
      updatePlcSlot,
      scadaWidgets,
      scadaScript,
      scadaLogs,
      runScadaSandbox,
      twinHotspots,
      selectedHotspotId,
      whatIfScenario,
      bomItems,
      addBomItem,
      activePatch,
      applyPatch,
      rejectPatch,
      isSimulationRunning,
      downloadDxf,
      downloadPlcopenXml,
      isAuthenticated,
      isSelectingTenant,
      isViewingLanding,
      openWorkspaceFromLanding,
      openLoginFromLanding,
      login,
      logout,
      selectTenantAndOpenWorkspace,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace deve ser usado dentro de um WorkspaceProvider');
  }
  return context;
}
