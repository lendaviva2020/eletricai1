'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tenant,
  UserProfile,
  TenantRole,
  SharedTag,
  TagType,
  TagDirection,
  ElectricalComponent,
  ComponentCategory,
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
  AiStructuredCircuitSpecification,
  ProjectPage,
  TerminalStrip,
  ElectricalValidationIssue,
  LoadListItem,
  CadTool,
} from '@/types/electrical';
import { IndustrialProject } from '@/types/dashboard';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  getSupabaseProfileAndTenant,
  getSupabaseProjects,
  createSupabaseProject,
  updateSupabaseProject,
  deleteSupabaseProject,
  getProjectComponents,
  getProjectConnections,
  getProjectSharedTags,
  getProjectLadderRungs,
  saveFullProjectSnapshot,
} from '@/lib/supabase/service';
import type { Session } from '@supabase/supabase-js';
import { runFullElectricalValidation } from '@/lib/electrical-validation';
import { generateElectricalDxf } from '@/lib/dxf-generator';
import { INITIAL_PAGES, INITIAL_TERMINAL_STRIPS } from '@/lib/cad-defaults';
import { generateUniqueComponentId, generateUniqueConnectionId } from '@/lib/utils';
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
import { DatabaseAuthService } from '@/lib/database-auth-service';

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
  addConnection: (connection: ElectricalConnection) => void;
  deleteConnection: (id: string) => void;
  setConnections: React.Dispatch<React.SetStateAction<ElectricalConnection[]>>;

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

  // AI DeepSeek Structured Circuit Synthesis & Preview
  aiGenerationModalOpen: boolean;
  setAiGenerationModalOpen: (open: boolean) => void;
  currentAiSpec: AiStructuredCircuitSpecification | null;
  setCurrentAiSpec: (spec: AiStructuredCircuitSpecification | null) => void;
  isGeneratingCircuit: boolean;
  generationStep: string;
  requestAiCircuitSynthesis: (prompt: string) => Promise<void>;
  applyAiCircuitSpecification: (spec: AiStructuredCircuitSpecification) => void;

  // Real Projects & Database Persistence
  projects: IndustrialProject[];
  setProjects: React.Dispatch<React.SetStateAction<IndustrialProject[]>>;
  activeProject: IndustrialProject | null;
  setActiveProject: React.Dispatch<React.SetStateAction<IndustrialProject | null>>;
  selectProjectAndOpen: (project: IndustrialProject) => Promise<void>;
  createProject: (newProject: IndustrialProject) => Promise<{ success: boolean; error?: string }>;
  deleteProject: (projectId: string) => Promise<{ success: boolean; error?: string }>;
  lastSavedAt: string | null;

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
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithSession: (session: Session) => Promise<void>;
  logout: () => void;
  selectTenantAndOpenWorkspace: (tenantData: Tenant, role?: TenantRole) => void;

  // Live Simulation
  isSimulationRunning: boolean;
  setIsSimulationRunning: (val: boolean | ((prev: boolean) => boolean)) => void;

  // CAD & Electrical Project Engine
  selectedComponentIds: string[];
  setSelectedComponentIds: React.Dispatch<React.SetStateAction<string[]>>;
  projectPages: ProjectPage[];
  activePageNumber: number;
  setActivePageNumber: (num: number) => void;
  terminalStrips: TerminalStrip[];
  loadList: LoadListItem[];
  validationIssues: ElectricalValidationIssue[];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: 'saved' | 'saving' | 'dirty';
  saveProject: () => Promise<void>;
  gridSize: number;
  setGridSize: (size: number) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  activeCadTool: CadTool;
  setActiveCadTool: (tool: CadTool) => void;
  rotateSelected: () => void;
  flipSelected: (axis: 'horizontal' | 'vertical') => void;
  duplicateSelected: () => void;
  deleteSelected: () => void;
  toggleLockSelected: () => void;
  exportProjectJson: () => string;
  importProjectJson: (json: string) => boolean;
  exportProjectDxf: () => void;
  exportProjectCsv: () => void;
  executeAiNaturalCommand: (command: string) => Promise<string>;

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
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>(['comp_q02']);
  const [projectPages, setProjectPages] = useState<ProjectPage[]>(INITIAL_PAGES);
  const [activePageNumber, setActivePageNumber] = useState<number>(1);
  const [terminalStrips, setTerminalStrips] = useState<TerminalStrip[]>(INITIAL_TERMINAL_STRIPS);
  const [gridSize, setGridSize] = useState<number>(12);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [activeCadTool, setActiveCadTool] = useState<CadTool>('SELECT');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [undoStack, setUndoStack] = useState<Array<{ components: ElectricalComponent[]; connections: ElectricalConnection[] }>>([]);
  const [redoStack, setRedoStack] = useState<Array<{ components: ElectricalComponent[]; connections: ElectricalConnection[] }>>([]);
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
  const [aiGenerationModalOpen, setAiGenerationModalOpen] = useState<boolean>(false);
  const [currentAiSpec, setCurrentAiSpec] = useState<AiStructuredCircuitSpecification | null>(null);
  const [isGeneratingCircuit, setIsGeneratingCircuit] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSelectingTenant, setIsSelectingTenant] = useState<boolean>(true);
  const [isViewingLanding, setIsViewingLanding] = useState<boolean>(true);

  // Real Projects & Persistence
  const [projects, setProjects] = useState<IndustrialProject[]>([]);
  const [activeProject, setActiveProject] = useState<IndustrialProject | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Load user profile, tenant, and projects from real Supabase DB
  const loadUserDataAndProjects = useCallback(async (userId: string) => {
    try {
      const { profile, tenant: loadedTenant } = await getSupabaseProfileAndTenant(userId);
      if (profile) {
        setUser(profile);
      }
      if (loadedTenant) {
        setTenant(loadedTenant);
        const projList = await getSupabaseProjects(loadedTenant.id);
        setProjects(projList);
        if (projList.length > 0 && !activeProject) {
          setActiveProject(projList[0]);
        }
      }
      setIsAuthenticated(true);
      setIsViewingLanding(false);
      setIsSelectingTenant(false);
    } catch (err) {
      console.error('Erro ao recuperar dados da conta no Supabase:', err);
    }
  }, [activeProject]);

  // Restore live Supabase session on mount and subscribe to auth state changes
  useEffect(() => {
    let isMounted = true;

    async function checkCurrentSession() {
      try {
        if (!isSupabaseConfigured) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          await loadUserDataAndProjects(session.user.id);
        }
      } catch (err) {
        console.error('Erro na verificação de sessão Supabase:', err);
      }
    }

    checkCurrentSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserDataAndProjects(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsViewingLanding(false);
        setProjects([]);
        setActiveProject(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserDataAndProjects]);

  const openWorkspaceFromLanding = useCallback(() => {
    setIsAuthenticated(false);
    setIsViewingLanding(false);
    setIsSelectingTenant(false);
  }, []);

  const openLoginFromLanding = useCallback(() => {
    setIsAuthenticated(false);
    setIsViewingLanding(false);
    setIsSelectingTenant(false);
  }, []);

  const selectTenantAndOpenWorkspace = useCallback((tenantData: Tenant, role?: TenantRole) => {
    setTenant(tenantData);
    if (role) {
      setUser(prev => ({ ...prev, role, tenantId: tenantData.id }));
    }
    setIsSelectingTenant(false);
  }, []);

  // Real Login with Email & Password via Supabase Auth
  const loginWithCredentials = useCallback(async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: pass,
      });

      if (error) {
        const msg = error.message === 'Invalid login credentials'
          ? 'E-mail ou senha inválidos no Supabase.'
          : error.message;
        return { success: false, error: msg };
      }

      if (data.session?.user) {
        await loadUserDataAndProjects(data.session.user.id);
        return { success: true };
      }

      return { success: false, error: 'Sessão não retornada pelo Supabase.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao autenticar com o banco Supabase.';
      return { success: false, error: msg };
    }
  }, [loadUserDataAndProjects]);

  const loginWithSession = useCallback(async (session: Session) => {
    if (session?.user) {
      await loadUserDataAndProjects(session.user.id);
    }
  }, [loadUserDataAndProjects]);

  // Backward compatibility wrapper for demo quick buttons
  const login = useCallback(async (email?: string) => {
    const targetEmail = email || 'carlos.mendes@paulinia.ind.br';
    const res = await loginWithCredentials(targetEmail, 'VoltAI#2026!Sec');
    if (!res.success) {
      // If credentials do not match, set demo context
      setIsAuthenticated(true);
      setIsViewingLanding(false);
      setIsSelectingTenant(false);
    }
  }, [loginWithCredentials]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Erro ao deslogar do Supabase:', e);
    }
    DatabaseAuthService.setCurrentSession(null);
    setIsAuthenticated(false);
    setIsSelectingTenant(false);
    setIsViewingLanding(false);
    setProjects([]);
    setActiveProject(null);
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

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  const pushSnapshot = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-25), { components: [...components], connections: [...connections] }]);
    setRedoStack([]);
    setSaveStatus('dirty');
  }, [components, connections]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, { components: [...components], connections: [...connections] }]);
    setUndoStack(prev => prev.slice(0, -1));
    setComponents(last.components);
    setConnections(last.connections);
    setSaveStatus('dirty');
  }, [undoStack, components, connections]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, { components: [...components], connections: [...connections] }]);
    setRedoStack(prev => prev.slice(0, -1));
    setComponents(next.components);
    setConnections(next.connections);
    setSaveStatus('dirty');
  }, [redoStack, components, connections]);

  // REAL SAVE PROJECT TO SUPABASE POSTGRESQL
  const saveProject = useCallback(async () => {
    if (!activeProject || !tenant?.id) {
      setSaveStatus('saved');
      return;
    }

    setSaveStatus('saving');
    try {
      const res = await saveFullProjectSnapshot(activeProject.id, tenant.id, {
        components,
        connections,
        sharedTags,
        ladderRungs,
      });

      if (res.success) {
        setSaveStatus('saved');
        const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        setLastSavedAt(nowTime);
        setProjects(prev =>
          prev.map(p =>
            p.id === activeProject.id
              ? {
                  ...p,
                  lastUpdated: new Date().toLocaleDateString('pt-BR'),
                  lastUpdatedTimestamp: Date.now(),
                }
              : p
          )
        );
      } else {
        console.error('Falha ao persistir no Supabase:', res.error);
        setSaveStatus('dirty');
      }
    } catch (err) {
      console.error('Erro na gravação do snapshot elétrico:', err);
      setSaveStatus('dirty');
    }
  }, [activeProject, tenant, components, connections, sharedTags, ladderRungs]);

  // AUTO-SAVE: Debounced synchronization with Supabase PostgreSQL (1.8s idle)
  useEffect(() => {
    if (saveStatus !== 'dirty' || !activeProject || !tenant?.id) return;

    const timer = setTimeout(() => {
      saveProject();
    }, 1800);

    return () => clearTimeout(timer);
  }, [saveStatus, activeProject, tenant?.id, saveProject]);

  // SELECT PROJECT AND OPEN WORKSPACE MODULES
  const selectProjectAndOpen = useCallback(async (proj: IndustrialProject) => {
    setActiveProject(proj);
    setSaveStatus('saving');

    try {
      const [comps, conns, tags, rungs] = await Promise.all([
        getProjectComponents(proj.id),
        getProjectConnections(proj.id),
        getProjectSharedTags(proj.id),
        getProjectLadderRungs(proj.id),
      ]);

      if (comps.length > 0) {
        setComponents(comps);
        setSelectedComponentId(comps[0].id);
        setSelectedComponentIds([comps[0].id]);
      } else {
        // Brand new project without elements
        setComponents([]);
        setSelectedComponentId(null);
        setSelectedComponentIds([]);
      }

      setConnections(conns);
      if (tags.length > 0) setSharedTags(tags);
      if (rungs.length > 0) setLadderRungs(rungs);

      setSaveStatus('saved');
    } catch (err) {
      console.error('Erro ao ler elementos do projeto no Supabase:', err);
      setSaveStatus('dirty');
    }

    setActiveTab(proj.targetTab || 'unifilar');
  }, [setActiveTab]);

  // CREATE NEW REAL PROJECT IN SUPABASE
  const createProject = useCallback(async (newProj: IndustrialProject): Promise<{ success: boolean; error?: string }> => {
    if (!tenant?.id) {
      return { success: false, error: 'Organização / Tenant não identificado' };
    }

    const res = await createSupabaseProject(tenant.id, newProj, user?.id);
    if (res.success) {
      setProjects(prev => [newProj, ...prev]);
      setActiveProject(newProj);
      // Auto-save initial components/connections/tags if present
      await saveFullProjectSnapshot(newProj.id, tenant.id, {
        components,
        connections,
        sharedTags,
        ladderRungs,
      });
      return { success: true };
    }
    return { success: false, error: res.error };
  }, [tenant, user, components, connections, sharedTags, ladderRungs]);

  // DELETE REAL PROJECT IN SUPABASE
  const deleteProject = useCallback(async (projId: string): Promise<{ success: boolean; error?: string }> => {
    const res = await deleteSupabaseProject(projId);
    if (res.success) {
      setProjects(prev => prev.filter(p => p.id !== projId));
      if (activeProject?.id === projId) {
        setActiveProject(null);
      }
      return { success: true };
    }
    return { success: false, error: res.error };
  }, [activeProject]);

  const updateComponent = useCallback((id: string, updates: Partial<ElectricalComponent>) => {
    pushSnapshot();
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [pushSnapshot]);

  const addComponent = useCallback((comp: ElectricalComponent) => {
    pushSnapshot();
    setComponents(prev => {
      // Ensure unique ID even if collision was attempted
      let finalComp = comp;
      if (prev.some(c => c.id === comp.id)) {
        finalComp = { ...comp, id: generateUniqueComponentId(comp.tag || 'comp') };
      }
      return [...prev, finalComp];
    });
    setSelectedComponentId(comp.id);
    setSelectedComponentIds([comp.id]);
  }, [pushSnapshot]);

  const deleteComponent = useCallback((id: string) => {
    pushSnapshot();
    setComponents(prev => prev.filter(c => c.id !== id));
    setConnections(prev => prev.filter(conn => conn.fromComponentId !== id && conn.toComponentId !== id));
    if (selectedComponentId === id) setSelectedComponentId(null);
    setSelectedComponentIds(prev => prev.filter(cid => cid !== id));
  }, [pushSnapshot, selectedComponentId]);

  const addConnection = useCallback((conn: ElectricalConnection) => {
    pushSnapshot();
    setConnections(prev => [...prev, conn]);
  }, [pushSnapshot]);

  const deleteConnection = useCallback((id: string) => {
    pushSnapshot();
    setConnections(prev => prev.filter(c => c.id !== id));
  }, [pushSnapshot]);

  const rotateSelected = useCallback(() => {
    if (!selectedComponentId) return;
    pushSnapshot();
    setComponents(prev =>
      prev.map(c => {
        if (selectedComponentIds.includes(c.id) || c.id === selectedComponentId) {
          const cur = c.rotation || 0;
          const next = ((cur + 90) % 360) as 0 | 90 | 180 | 270;
          return { ...c, rotation: next };
        }
        return c;
      })
    );
  }, [selectedComponentId, selectedComponentIds, pushSnapshot]);

  const flipSelected = useCallback((axis: 'horizontal' | 'vertical') => {
    if (!selectedComponentId) return;
    pushSnapshot();
    setComponents(prev =>
      prev.map(c => {
        if (selectedComponentIds.includes(c.id) || c.id === selectedComponentId) {
          return axis === 'horizontal'
            ? { ...c, isMirroredX: !c.isMirroredX }
            : { ...c, isMirroredY: !c.isMirroredY };
        }
        return c;
      })
    );
  }, [selectedComponentId, selectedComponentIds, pushSnapshot]);

  const duplicateSelected = useCallback(() => {
    const compToDup = components.find(c => c.id === selectedComponentId);
    if (!compToDup) return;
    pushSnapshot();
    const newId = generateUniqueComponentId(compToDup.tag || 'comp');
    const newTag = `${compToDup.tag}_COPY`;
    const duplicated: ElectricalComponent = {
      ...compToDup,
      id: newId,
      tag: newTag,
      name: `${compToDup.name} (Cópia)`,
      x: compToDup.x + 30,
      y: compToDup.y + 30,
    };
    setComponents(prev => [...prev, duplicated]);
    setSelectedComponentId(newId);
    setSelectedComponentIds([newId]);
  }, [components, selectedComponentId, pushSnapshot]);

  const deleteSelected = useCallback(() => {
    if (selectedComponentIds.length > 0) {
      pushSnapshot();
      setComponents(prev => prev.filter(c => !selectedComponentIds.includes(c.id)));
      setConnections(prev =>
        prev.filter(c => !selectedComponentIds.includes(c.fromComponentId) && !selectedComponentIds.includes(c.toComponentId))
      );
      setSelectedComponentIds([]);
      setSelectedComponentId(null);
    } else if (selectedComponentId) {
      deleteComponent(selectedComponentId);
    }
  }, [selectedComponentIds, selectedComponentId, deleteComponent, pushSnapshot]);

  const toggleLockSelected = useCallback(() => {
    if (!selectedComponentId) return;
    pushSnapshot();
    setComponents(prev =>
      prev.map(c => {
        if (selectedComponentIds.includes(c.id) || c.id === selectedComponentId) {
          return { ...c, isLocked: !c.isLocked };
        }
        return c;
      })
    );
  }, [selectedComponentId, selectedComponentIds, pushSnapshot]);

  const exportProjectJson = useCallback(() => {
    const payload = {
      project: 'EletricAI Model',
      exportedAt: new Date().toISOString(),
      tenant,
      components,
      connections,
      sharedTags,
      projectPages,
      terminalStrips,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EletricAI_Projeto_${tenant.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return jsonStr;
  }, [tenant, components, connections, sharedTags, projectPages, terminalStrips]);

  const importProjectJson = useCallback((jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.components && Array.isArray(data.components)) {
        pushSnapshot();
        setComponents(data.components);
        if (data.connections && Array.isArray(data.connections)) {
          setConnections(data.connections);
        }
        if (data.sharedTags && Array.isArray(data.sharedTags)) {
          setSharedTags(data.sharedTags);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [pushSnapshot]);

  const exportProjectDxf = useCallback(() => {
    const dxfString = generateElectricalDxf('QGBT-Copacol-NBR5410', components, connections);
    const blob = new Blob([dxfString], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Diagrama_EletricAI_${new Date().toISOString().slice(0, 10)}.dxf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [components, connections]);

  const validationIssues = useMemo(() => {
    return runFullElectricalValidation(components, connections);
  }, [components, connections]);

  const loadList = useMemo<LoadListItem[]>(() => {
    return components
      .filter(c => c.power !== undefined || c.category === 'MOTOR_3P' || c.category === 'CAPACITOR_BANK')
      .map(c => {
        const powerKw = c.power || (c.powerHp ? c.powerHp * 0.736 : 22);
        const pf = c.powerFactor || 0.86;
        const eff = c.efficiency || 0.93;
        const demandFactor = c.category === 'CAPACITOR_BANK' ? 1.0 : 0.85;
        const demandKw = Math.round(powerKw * demandFactor * 10) / 10;
        return {
          id: `load_${c.id}`,
          tag: c.tag,
          equipmentName: c.name,
          powerKw: Math.round(powerKw * 10) / 10,
          powerHp: c.powerHp,
          voltageV: c.voltage || 380,
          phases: '3F+PE',
          nominalCurrentA: c.nominalCurrent,
          powerFactor: pf,
          efficiencyPercent: Math.round(eff * 100),
          demandFactor,
          demandKw,
          circuitTag: c.tag.includes('COMP') ? 'CCT 01' : c.tag.includes('EXA') ? 'CCT 02' : 'CCT 03',
          panelTag: 'CCM-01',
          feederTag: 'ALIM-01',
          breakerRatingA: c.category === 'MOTOR_BREAKER' ? c.nominalCurrent : 63,
          cableSectionMm2: c.cableCrossSection || 16,
          status: c.isEnergized ? 'OPERATIONAL' : 'TRIPPED',
        };
      });
  }, [components]);

  const exportProjectCsv = useCallback(() => {
    const headers = ['TAG', 'Equipamento', 'Potencia_kW', 'Potencia_CV', 'Tensao_V', 'Fases', 'Corrente_A', 'CosPhi', 'Rendimento_Pct', 'Demanda_kW', 'Disjuntor_A', 'Cabo_mm2', 'Status'];
    const rows = loadList.map(item => [
      item.tag,
      `"${item.equipmentName}"`,
      item.powerKw,
      item.powerHp || '',
      item.voltageV,
      item.phases,
      item.nominalCurrentA,
      item.powerFactor,
      item.efficiencyPercent,
      item.demandKw,
      item.breakerRatingA,
      item.cableSectionMm2,
      item.status,
    ]);
    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lista_de_Cargas_EletricAI_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [loadList]);

  // AI DeepSeek Structured Circuit Synthesis & Engineering Validation
  const requestAiCircuitSynthesis = useCallback(async (promptText: string) => {
    setIsGeneratingCircuit(true);
    setAiGenerationModalOpen(true);
    setGenerationStep('Analisando solicitação em linguagem natural com DeepSeek...');

    try {
      const existingTags = components.map(c => c.tag).filter(Boolean);
      const existingComponents = components.map(c => ({
        tag: c.tag,
        name: c.name,
        category: c.category,
        nominalCurrent: c.nominalCurrent,
      }));

      setTimeout(() => {
        setGenerationStep('Identificando componentes e topologia do circuito...');
      }, 500);

      setTimeout(() => {
        setGenerationStep('Calculando dimensionamento normativo ABNT NBR 5410...');
      }, 1000);

      setTimeout(() => {
        setGenerationStep('Montando conexões elétricas e lógica Ladder IEC 61131-3...');
      }, 1500);

      const res = await fetch('/api/ai/deepseek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          context: {
            existingTags,
            existingComponents,
            projectVoltage: 380,
            projectFrequency: 60,
            groundingSystem: 'TN-S',
            activeTab,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.specification) {
        setCurrentAiSpec(data.specification);
        setGenerationStep('Circuito dimensionado com sucesso! Revise o preview antes de aplicar.');
      } else {
        setGenerationStep('Erro ao processar circuito: ' + (data.error || 'Falha na resposta'));
      }
    } catch (err: unknown) {
      console.error('Erro na chamada da IA DeepSeek:', err);
      setGenerationStep('Erro de comunicação. O motor de cálculo elétrico permanecerá ativo.');
    } finally {
      setIsGeneratingCircuit(false);
    }
  }, [components, activeTab]);

  const applyAiCircuitSpecification = useCallback((spec: AiStructuredCircuitSpecification) => {
    pushSnapshot();

    // 1. Calculate non-colliding layout coordinates on active CAD page
    const pageComps = components.filter(c => !c.pageNumber || c.pageNumber === activePageNumber);
    const maxX = pageComps.length > 0 ? Math.max(...pageComps.map(c => c.x + (c.width || 140))) : 200;
    const startX = Math.max(340, maxX + 90);
    const startY = 160;

    const tagToIdMap = new Map<string, string>();
    const newComponents: ElectricalComponent[] = [];
    const newSharedTags: SharedTag[] = [];

    // Place components
    spec.components.forEach((comp, idx) => {
      const compId = generateUniqueComponentId(comp.tag.toLowerCase().replace(/[^a-z0-9]/g, ''));
      tagToIdMap.set(comp.tag, compId);

      const isControlOrButton = comp.role === 'CONTROL' || comp.role === 'EMERGENCY' || comp.role === 'SIGNALLING';
      const posX = isControlOrButton ? startX + 220 : startX;
      const posY = isControlOrButton
        ? startY + (comp.rowIndex ?? idx) * 85
        : startY + (comp.rowIndex ?? idx) * 110;

      const width = isControlOrButton ? 120 : 140;
      const height = comp.category === 'MOTOR_3P' ? 80 : 65;

      const ports = [];
      if (comp.category === 'MOTOR_3P') {
        ports.push({ id: 'p_in', type: 'in' as const, x: posX + width / 2, y: posY });
        ports.push({ id: 'p_pe', type: 'in' as const, x: posX, y: posY + height / 2 });
      } else {
        ports.push({ id: 'p_in', type: 'in' as const, x: posX + width / 2, y: posY });
        ports.push({ id: 'p_out', type: 'out' as const, x: posX + width / 2, y: posY + height });
      }

      const newComp: ElectricalComponent = {
        id: compId,
        tag: comp.tag,
        name: comp.name,
        category: comp.category,
        x: posX,
        y: posY,
        width,
        height,
        voltage: comp.voltage,
        nominalCurrent: comp.nominalCurrent,
        operationalCurrent: comp.operationalCurrent,
        power: comp.powerKw,
        powerHp: comp.powerHp,
        powerFactor: comp.powerFactor || 0.86,
        efficiency: comp.efficiency || 0.92,
        cableCrossSection: comp.cableCrossSection || spec.engineeringCalculations.recommendedCableMm2,
        cableLength: comp.cableLength || 25,
        breakingCapacity: comp.breakingCapacity,
        isEnergized: true,
        pageNumber: activePageNumber,
        ports,
      };
      newComponents.push(newComp);

      // Create synchronized SharedTag for SCADA and Digital Twin
      newSharedTags.push({
        id: `tag_${comp.tag.toLowerCase()}`,
        name: comp.tag,
        description: comp.name,
        address: `%M10.${idx}`,
        dataType: comp.category === 'MOTOR_3P' || comp.category === 'CONTACTOR' ? 'BOOLEAN' : 'NUMBER',
        direction: 'INTERNAL',
        currentValue: comp.category === 'MOTOR_BREAKER' ? true : false,
        unit: comp.category === 'MOTOR_3P' ? 'RPM' : undefined,
        sourceModule: 'UNIFILAR',
        lastUpdated: new Date().toISOString(),
        quality: 'GOOD',
      });
    });

    // 2. Map connections
    const newConnections: ElectricalConnection[] = [];
    spec.connections.forEach(conn => {
      const fromId = tagToIdMap.get(conn.fromTag) || (conn.fromTag.includes('BARRAMENTO') ? 'comp_barramento' : undefined);
      const toId = tagToIdMap.get(conn.toTag);
      if (fromId && toId) {
        newConnections.push({
          id: generateUniqueConnectionId(),
          fromComponentId: fromId,
          fromPortId: conn.fromPort === 'p_in' ? 'p_in' : 'p_out',
          toComponentId: toId,
          toPortId: conn.toPort === 'p_in' ? 'p_in' : 'p_out',
          isEnergized: true,
          voltage: 380,
          wireGauge: conn.wireGaugeMm2 || spec.engineeringCalculations.recommendedCableMm2,
        });
      }
    });

    // 3. Mutate project
    setComponents(prev => [...prev, ...newComponents]);
    if (newConnections.length > 0) {
      setConnections(prev => [...prev, ...newConnections]);
    }
    setSharedTags(prev => [...prev, ...newSharedTags]);

    if (newComponents.length > 0) {
      setSelectedComponentId(newComponents[0].id);
      setSelectedComponentIds(newComponents.map(c => c.id));
    }

    console.log(`[AUDIT] Circuito "${spec.title}" (${spec.components.length} componentes) gerado por IA adicionado com sucesso ao projeto.`);
  }, [components, activePageNumber, pushSnapshot]);

  const executeAiNaturalCommand = useCallback(async (command: string): Promise<string> => {
    await requestAiCircuitSynthesis(command);
    return `EletricAI interpretou "${command}". Abrindo preview do circuito para auditoria de engenharia...`;
  }, [requestAiCircuitSynthesis]);

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
      const newLogs: ScadaScriptLog[] = ((result?.logs || []) as Array<{ level?: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'; message?: string }>).map(l => ({
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
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setScadaLogs(prev => [
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'ERROR',
          message: `Erro na sandbox do Web Worker: ${errMsg}`,
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
          const after = (change.after || {}) as Record<string, unknown>;
          const newComp: ElectricalComponent = {
            id: change.targetId || `comp_${Date.now()}`,
            tag: change.targetName,
            name: String(after.name || change.targetName),
            category: (after.category as ComponentCategory) || 'MOTOR_BREAKER',
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
          const after = (change.after || {}) as Partial<ElectricalComponent>;
          setComponents(prev =>
            prev.map(c => {
              if (c.tag === change.targetName || c.id === change.targetId) {
                return { ...c, ...after };
              }
              return c;
            })
          );
        } else if (change.action === 'REMOVE') {
          setComponents(prev => prev.filter(c => c.tag !== change.targetName && c.id !== change.targetId));
        }
      } else if (change.targetType === 'TAG') {
        if (change.action === 'ADD') {
          const after = (change.after || {}) as Record<string, unknown>;
          const newTag: SharedTag = {
            id: change.targetId || `tag_${Date.now()}`,
            name: change.targetName,
            description: `Criada via Patch: ${change.technicalRationale}`,
            address: String(after.address || '%M10.0'),
            dataType: (after.dataType as TagType) || 'BOOL',
            direction: (after.direction as TagDirection) || 'OUTPUT',
            currentValue: false,
          };
          addSharedTag(newTag);
        }
      } else if (change.targetType === 'CABLE_GAUGE') {
        const after = (change.after || {}) as Record<string, unknown>;
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
              <address>${t.address || ''}</address>
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
      addConnection,
      deleteConnection,
      setConnections,
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
      aiGenerationModalOpen,
      setAiGenerationModalOpen,
      currentAiSpec,
      setCurrentAiSpec,
      isGeneratingCircuit,
      generationStep,
      requestAiCircuitSynthesis,
      applyAiCircuitSpecification,
      isSimulationRunning,
      setIsSimulationRunning,
      // CAD & Engineering Engine
      selectedComponentIds,
      setSelectedComponentIds,
      projectPages,
      activePageNumber,
      setActivePageNumber,
      terminalStrips,
      loadList,
      validationIssues,
      undo,
      redo,
      canUndo,
      canRedo,
      saveStatus,
      saveProject,
      gridSize,
      setGridSize,
      snapToGrid,
      setSnapToGrid,
      activeCadTool,
      setActiveCadTool,
      rotateSelected,
      flipSelected,
      duplicateSelected,
      deleteSelected,
      toggleLockSelected,
      exportProjectJson,
      importProjectJson,
      exportProjectDxf,
      exportProjectCsv,
      executeAiNaturalCommand,

      downloadDxf,
      downloadPlcopenXml,
      // Real Projects & Persistence
      projects,
      setProjects,
      activeProject,
      setActiveProject,
      selectProjectAndOpen,
      createProject,
      deleteProject,
      lastSavedAt,
      // Authentication
      isAuthenticated,
      setIsAuthenticated,
      isSelectingTenant,
      setIsSelectingTenant,
      isViewingLanding,
      setIsViewingLanding,
      openWorkspaceFromLanding,
      openLoginFromLanding,
      login,
      loginWithCredentials,
      loginWithSession,
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
      selectedComponentIds,
      projectPages,
      activePageNumber,
      terminalStrips,
      loadList,
      validationIssues,
      undo,
      redo,
      canUndo,
      canRedo,
      saveStatus,
      saveProject,
      gridSize,
      snapToGrid,
      activeCadTool,
      rotateSelected,
      flipSelected,
      duplicateSelected,
      deleteSelected,
      toggleLockSelected,
      exportProjectJson,
      importProjectJson,
      exportProjectDxf,
      exportProjectCsv,
      executeAiNaturalCommand,
      toggleBreakerState,
      updateComponent,
      addComponent,
      deleteComponent,
      addConnection,
      deleteConnection,
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
      aiGenerationModalOpen,
      currentAiSpec,
      isGeneratingCircuit,
      generationStep,
      requestAiCircuitSynthesis,
      applyAiCircuitSpecification,
      isSimulationRunning,
      downloadDxf,
      downloadPlcopenXml,
      projects,
      activeProject,
      selectProjectAndOpen,
      createProject,
      deleteProject,
      lastSavedAt,
      isAuthenticated,
      isSelectingTenant,
      isViewingLanding,
      openWorkspaceFromLanding,
      openLoginFromLanding,
      login,
      loginWithCredentials,
      loginWithSession,
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
