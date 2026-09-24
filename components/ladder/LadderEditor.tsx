'use client';

import React from 'react';
import {
  PlcProgramConfiguration,
  PlcLadderRung,
  PlcLadderElement,
  PlcVariable,
  PlcDiagnosticIssue,
  PlcCrossReferenceItem,
  PlcTraceSample,
  PlcLadderElementType,
  LadderContactType,
  LadderCoilType,
} from '@/types/plc';
import { INITIAL_PLC_PROGRAM_CONFIG } from '@/lib/plc-default-project';
import { PlcLadderEngine } from '@/lib/plc-simulator-engine';
import { PlcCompilerAndValidator } from '@/lib/plc-compiler-validator';
import { PlcAIEngine, AiLadderCommandResult } from '@/lib/plc-ai-engine';
import { ElementPalette } from './ElementPalette';
import { ProjectTree } from './ProjectTree';
import { ElementProperties } from './ElementProperties';
import { LadderRungView } from './LadderRungView';
import { BottomDiagnostics } from './BottomDiagnostics';
import { VariableManager } from './VariableManager';
import { HardwareIoView } from './HardwareIoView';
import { SimulationTraceView } from './SimulationTraceView';
import { DocumentationReportView } from './DocumentationReportView';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Plus,
  FileCode,
  Download,
  Upload,
  Cpu,
  Table,
  Sliders,
  Sparkles,
  Check,
  X,
  AlertTriangle,
  FileText,
  Activity,
  Layers,
  Search,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Save,
} from 'lucide-react';

export function LadderEditor() {
  const { updateTagValue, isSimulationRunning: globalSimRunning } = useWorkspace();

  // Core PLC Program state
  const [program, setProgram] = React.useState<PlcProgramConfiguration>(INITIAL_PLC_PROGRAM_CONFIG);
  const [activeSubTab, setActiveSubTab] = React.useState<'editor' | 'variables' | 'io_rack' | 'trace' | 'docs'>('editor');

  // Selected element for Property Inspector
  const [selectedElement, setSelectedElement] = React.useState<PlcLadderElement | null>(null);

  // Undo / Redo history stack
  const [undoStack, setUndoStack] = React.useState<PlcProgramConfiguration[]>([]);
  const [redoStack, setRedoStack] = React.useState<PlcProgramConfiguration[]>([]);

  // Simulation execution engine
  const [simRunning, setSimRunning] = React.useState<boolean>(true);
  const [scanIntervalMs, setScanIntervalMs] = React.useState<number>(12);
  const [traceSamples, setTraceSamples] = React.useState<PlcTraceSample[]>([]);

  // Canvas View Controls
  const [zoomLevel, setZoomLevel] = React.useState<number>(1.0);
  const [searchFilter, setSearchFilter] = React.useState<string>('');

  // AI Copilot state
  const [aiPrompt, setAiPrompt] = React.useState('');
  const [aiProposal, setAiProposal] = React.useState<AiLadderCommandResult | null>(null);
  const [isAiLoading, setIsAiLoading] = React.useState(false);

  const engineRef = React.useRef<PlcLadderEngine>(new PlcLadderEngine());

  // Snapshot for Undo
  const pushUndoSnapshot = React.useCallback(() => {
    setUndoStack(prev => [...prev.slice(-20), JSON.parse(JSON.stringify(program))]);
    setRedoStack([]);
  }, [program]);

  const handleUndo = React.useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(program))]);
    setUndoStack(prev => prev.slice(0, -1));
    setProgram(previous);
  }, [undoStack, program]);

  const handleRedo = React.useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(program))]);
    setRedoStack(prev => prev.slice(0, -1));
    setProgram(next);
  }, [redoStack, program]);

  const programRef = React.useRef<PlcProgramConfiguration>(program);
  React.useEffect(() => {
    programRef.current = program;
  }, [program]);

  const updateTagValueRef = React.useRef(updateTagValue);
  React.useEffect(() => {
    updateTagValueRef.current = updateTagValue;
  }, [updateTagValue]);

  // Periodic IEC 61131-3 PLC Scan Cycle loop
  React.useEffect(() => {
    if (!simRunning) return;

    const interval = setInterval(() => {
      const currentProg = programRef.current;
      const result = engineRef.current.executeScanCycle(currentProg, scanIntervalMs);

      // 1. Update program state
      setProgram(result.nextProgram);

      // 2. Keep trace samples window
      setTraceSamples(prevSamples => [...prevSamples.slice(-50), result.tracePoint]);

      // 3. Sync key outputs with Workspace shared tags for Unifilar / Digital Twin / SCADA
      // Run outside current execution cycle to avoid setState during another component's render
      for (const gv of result.nextProgram.globalVariables) {
        if (gv.address?.startsWith('%Q')) {
          const prevGv = currentProg.globalVariables.find(v => v.name === gv.name);
          // Only update if value actually changed
          if (!prevGv || prevGv.currentValue !== gv.currentValue) {
            updateTagValueRef.current(gv.name, Boolean(gv.currentValue));
          }
        }
      }
    }, scanIntervalMs);

    return () => clearInterval(interval);
  }, [simRunning, scanIntervalMs]);

  // Static Diagnostics & Semantic Validation
  const diagnostics: PlcDiagnosticIssue[] = React.useMemo(() => {
    return PlcCompilerAndValidator.validateProgram(program);
  }, [program]);

  // Cross Reference Table
  const crossReferences: PlcCrossReferenceItem[] = React.useMemo(() => {
    return PlcCompilerAndValidator.buildCrossReferences(program);
  }, [program]);

  // Current Active POU
  const activePou = program.pous.find(p => p.id === program.activePouId) || program.pous[0];

  // Element selection
  const handleSelectElement = (el: PlcLadderElement) => {
    setSelectedElement(el);
  };

  // Toggle Contact Signal (Double-click in simulation)
  const handleToggleContactSignal = (varName: string) => {
    pushUndoSnapshot();
    setProgram(prev => {
      const updatedVars = prev.globalVariables.map(v => {
        if (v.name === varName) {
          return {
            ...v,
            currentValue: !v.currentValue,
            forcedValue: v.isForced ? !v.forcedValue : undefined,
          };
        }
        return v;
      });
      return {
        ...prev,
        globalVariables: updatedVars,
      };
    });
  };

  // Insert Element from Palette
  const handleInsertElement = (
    elementType: PlcLadderElementType,
    subType?: string,
    varName?: string
  ) => {
    if (!activePou) return;
    pushUndoSnapshot();

    const targetVar = varName || program.globalVariables[0]?.name || 'VAR_NOVA';
    const firstRung = activePou.rungs[0];
    if (!firstRung) return;

    const newEl: PlcLadderElement = {
      id: `el_user_${Date.now()}`,
      elementType,
      contactType: elementType === 'CONTACT' ? (subType as LadderContactType) || 'CONTACT_NO' : undefined,
      coilType: elementType === 'COIL' ? (subType as LadderCoilType) || 'COIL_NORMAL' : undefined,
      timerType: elementType === 'TIMER' ? (subType as any) || 'TON' : undefined,
      counterType: elementType === 'COUNTER' ? (subType as any) || 'CTU' : undefined,
      compareOp: elementType === 'COMPARE' ? (subType as any) || 'EQ' : undefined,
      mathOp: elementType === 'MATH' ? (subType as any) || 'ADD' : undefined,
      variableName: targetVar,
      row: 0,
      col: elementType === 'COIL' ? 5 : firstRung.elements.length,
      isEnergized: false,
    };

    setProgram(prev => ({
      ...prev,
      pous: prev.pous.map(p =>
        p.id === activePou.id
          ? {
              ...p,
              rungs: p.rungs.map((r, i) => (i === 0 ? { ...r, elements: [...r.elements, newEl] } : r)),
            }
          : p
      ),
    }));
    setSelectedElement(newEl);
  };

  // Duplicate Rung
  const handleDuplicateRung = (rungNum: number) => {
    if (!activePou) return;
    pushUndoSnapshot();
    const target = activePou.rungs.find(r => r.rungNumber === rungNum);
    if (!target) return;

    const newRung: PlcLadderRung = {
      ...JSON.parse(JSON.stringify(target)),
      id: `rung_${Date.now()}`,
      rungNumber: activePou.rungs.length,
      title: `${target.title} (Cópia)`,
    };

    setProgram(prev => ({
      ...prev,
      pous: prev.pous.map(p =>
        p.id === activePou.id ? { ...p, rungs: [...p.rungs, newRung] } : p
      ),
    }));
  };

  // Delete Rung
  const handleDeleteRung = (rungNum: number) => {
    if (!activePou || activePou.rungs.length <= 1) return;
    pushUndoSnapshot();

    setProgram(prev => ({
      ...prev,
      pous: prev.pous.map(p =>
        p.id === activePou.id
          ? {
              ...p,
              rungs: p.rungs
                .filter(r => r.rungNumber !== rungNum)
                .map((r, idx) => ({ ...r, rungNumber: idx })),
            }
          : p
      ),
    }));
  };

  // Add new empty Rung
  const handleAddNewRung = () => {
    if (!activePou) return;
    pushUndoSnapshot();
    const newRungNum = activePou.rungs.length;
    const newRung: PlcLadderRung = {
      id: `rung_${Date.now()}`,
      rungNumber: newRungNum,
      title: `Rung ${newRungNum}: Nova Linha de Controle`,
      description: 'Condição lógica de comando industrial',
      isEnabled: true,
      isPowerFlowActive: false,
      diagnosticStatus: 'NORMAL',
      elements: [
        {
          id: `el_${Date.now()}_in`,
          elementType: 'CONTACT',
          contactType: 'CONTACT_NO',
          variableName: program.globalVariables[0]?.name || 'BTN_START',
          address: '%I0.0',
          row: 0,
          col: 0,
          isEnergized: false,
        },
        {
          id: `el_${Date.now()}_out`,
          elementType: 'COIL',
          coilType: 'COIL_NORMAL',
          variableName: program.globalVariables[1]?.name || 'KM_SAIDA',
          address: '%Q0.0',
          row: 0,
          col: 5,
          isEnergized: false,
        },
      ],
    };

    setProgram(prev => ({
      ...prev,
      pous: prev.pous.map(p =>
        p.id === activePou.id ? { ...p, rungs: [...p.rungs, newRung] } : p
      ),
    }));
  };

  // Toggle Rung Enabled
  const handleToggleRungEnabled = (rungNum: number) => {
    if (!activePou) return;
    pushUndoSnapshot();

    setProgram(prev => ({
      ...prev,
      pous: prev.pous.map(p =>
        p.id === activePou.id
          ? {
              ...p,
              rungs: p.rungs.map(r =>
                r.rungNumber === rungNum ? { ...r, isEnabled: !r.isEnabled } : r
              ),
            }
          : p
      ),
    }));
  };

  // Update Element properties
  const handleUpdateElement = (updated: Partial<PlcLadderElement>) => {
    if (!selectedElement || !activePou) return;
    pushUndoSnapshot();

    const merged = { ...selectedElement, ...updated };
    setSelectedElement(merged);

    setProgram(prev => ({
      ...prev,
      pous: prev.pous.map(p =>
        p.id === activePou.id
          ? {
              ...p,
              rungs: p.rungs.map(r => ({
                ...r,
                elements: r.elements.map(el => (el.id === selectedElement.id ? merged : el)),
              })),
            }
          : p
      ),
    }));
  };

  // Delete Element
  const handleDeleteElement = () => {
    if (!selectedElement || !activePou) return;
    pushUndoSnapshot();

    setProgram(prev => ({
      ...prev,
      pous: prev.pous.map(p =>
        p.id === activePou.id
          ? {
              ...p,
              rungs: p.rungs.map(r => ({
                ...r,
                elements: r.elements.filter(el => el.id !== selectedElement.id),
              })),
            }
          : p
      ),
    }));
    setSelectedElement(null);
  };

  // Toggle / Apply Force to Variable
  const handleToggleForce = (varName: string, val: boolean | number) => {
    setProgram(prev => ({
      ...prev,
      globalVariables: prev.globalVariables.map(v => {
        if (v.name === varName) {
          const isCurrentlyForced = v.isForced && v.forcedValue === val;
          return {
            ...v,
            isForced: !isCurrentlyForced,
            forcedValue: !isCurrentlyForced ? val : undefined,
          };
        }
        return v;
      }),
    }));
  };

  // Unforce Variable
  const handleUnforceVariable = (varName: string) => {
    setProgram(prev => ({
      ...prev,
      globalVariables: prev.globalVariables.map(v =>
        v.name === varName ? { ...v, isForced: false, forcedValue: undefined } : v
      ),
    }));
  };

  // Navigate directly to Rung
  const handleNavigateToRung = (rungNum: number) => {
    setActiveSubTab('editor');
    const el = document.getElementById(`rung_item_${rungNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Export PLCopen XML
  const handleExportPlcopenXml = () => {
    const xml = PlcCompilerAndValidator.exportToPlcopenXml(program);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${program.projectName.replace(/\s+/g, '_')}_IEC61131-3.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJson = () => {
    const json = JSON.stringify(program, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${program.projectName.replace(/\s+/g, '_')}_Backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // AI Command submission
  const handleRunAiCommand = () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    const result = PlcAIEngine.processAiCommand(aiPrompt, program);
    setIsAiLoading(false);
    if (result) {
      setAiProposal(result);
    } else {
      alert('Comando não reconhecido. Experimente: "Crie uma partida direta para o motor M01" ou "Adicione intertravamento".');
    }
  };

  const handleApplyAiProposal = () => {
    if (!aiProposal) return;
    pushUndoSnapshot();
    setProgram(aiProposal.proposedProgram);
    setAiProposal(null);
    setAiPrompt('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] text-slate-200 select-none overflow-hidden font-mono">
      {/* 1. Industrial Top Control Bar */}
      <div className="h-11 px-3 bg-[#11141A] border-b border-[#232833] flex items-center justify-between">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-100 tracking-wider">
              ELETRIC<span className="text-amber-400">AI</span> LADDER STUDIO
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
              IEC 61131-3:2025
            </span>
          </div>

          <div className="h-4 w-px bg-[#232833]" />

          {/* Simulation Controls */}
          <div className="flex items-center gap-1.5 bg-[#161A22] border border-[#232833] p-0.5 rounded">
            <button
              onClick={() => setSimRunning(p => !p)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                simRunning
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
              title={simRunning ? 'Pausar varredura CLP' : 'Iniciar ciclo de scan'}
            >
              {simRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              <span>{simRunning ? 'RUN (12ms)' : 'STOP'}</span>
            </button>

            <button
              onClick={() => {
                const res = engineRef.current.executeScanCycle(program, 12);
                setProgram(res.nextProgram);
              }}
              disabled={simRunning}
              className="p-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-40"
              title="Passo único de varredura (Single Step)"
            >
              <StepForward className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => {
                pushUndoSnapshot();
                setProgram(INITIAL_PLC_PROGRAM_CONFIG);
              }}
              className="p-1 rounded text-slate-400 hover:text-amber-400"
              title="Reiniciar memória do CLP (Cold Restart)"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Scan Cycle Metrics HUD */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
            <span>Scan Real: <strong className="text-emerald-400">{program.actualScanTimeMs}ms</strong></span>
            <span>Ciclos: <strong className="text-cyan-400">{program.cycleCount}</strong></span>
          </div>
        </div>

        {/* Center: Module Subtab Navigation */}
        <div className="flex items-center gap-1 bg-[#161A22] border border-[#232833] p-1 rounded">
          <button
            onClick={() => setActiveSubTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              activeSubTab === 'editor'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Editor LD</span>
          </button>

          <button
            onClick={() => setActiveSubTab('variables')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              activeSubTab === 'variables'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            <span>Variáveis ({program.globalVariables.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('io_rack')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              activeSubTab === 'io_rack'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Rack I/O</span>
          </button>

          <button
            onClick={() => setActiveSubTab('trace')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              activeSubTab === 'trace'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Osciloscópio</span>
          </button>

          <button
            onClick={() => setActiveSubTab('docs')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              activeSubTab === 'docs'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Relatório</span>
          </button>
        </div>

        {/* Right: Undo/Redo & PLCopen XML Export */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-1.5 rounded bg-[#161A22] border border-[#232833] text-slate-300 hover:text-amber-400 disabled:opacity-30"
            title="Desfazer (Undo)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded bg-[#161A22] border border-[#232833] text-slate-300 hover:text-amber-400 disabled:opacity-30"
            title="Refazer (Redo)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-[#232833]" />

          <button
            onClick={handleExportPlcopenXml}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#161A22] border border-[#232833] hover:border-amber-500/50 text-amber-300 text-xs transition-colors"
            title="Exportar PLCopen XML conforme IEC 61131-10"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">PLCopen XML</span>
          </button>

          <button
            onClick={handleExportJson}
            className="p-1.5 rounded bg-[#161A22] border border-[#232833] hover:border-amber-500/50 text-slate-300 hover:text-white text-xs"
            title="Salvar Projeto JSON"
          >
            <Save className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. AI Generative Copilot Bar */}
      <div className="h-10 px-3 bg-[#0E1117] border-b border-[#232833] flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-3xl">
          <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>IA Copilot PLC:</span>
          </div>
          <input
            type="text"
            placeholder="Ex: Crie uma partida direta para o motor M01 | Adicione intertravamento de reversão | Adicione timer de 5s..."
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRunAiCommand()}
            className="flex-1 bg-[#161A22] border border-[#232833] rounded px-3 py-1 text-xs text-slate-200 outline-none focus:border-amber-500 placeholder-slate-600"
          />
          <button
            onClick={handleRunAiCommand}
            disabled={isAiLoading || !aiPrompt.trim()}
            className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors disabled:opacity-50"
          >
            {isAiLoading ? 'Analisando...' : 'Gerar Rung'}
          </button>
        </div>

        {/* Global Error Badge in Top Bar */}
        <div className="flex items-center gap-2 text-xs">
          {diagnostics.length > 0 ? (
            <span className="flex items-center gap-1 text-red-400 font-bold">
              <AlertTriangle className="h-3.5 w-3.5" />
              {diagnostics.length} inconformidade(s)
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Check className="h-3.5 w-3.5" />
              Compilação IEC OK
            </span>
          )}
        </div>
      </div>

      {/* AI Proposal Diff Modal Overlay */}
      {aiProposal && (
        <div className="bg-[#161C26] border-b border-amber-500/50 p-4 flex items-center justify-between text-xs animate-fade-in z-30 shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-400 text-sm">
                Proposta de Modificação: {aiProposal.title}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                AUDITORIA DE SEGURANÇA
              </span>
            </div>
            <p className="text-slate-300">{aiProposal.description}</p>
            <p className="text-[11px] text-slate-400 italic">
              Fundamentação Técnica: {aiProposal.explanation}
            </p>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setAiProposal(null)}
              className="px-3 py-1.5 rounded bg-[#232833] hover:bg-[#2C3342] text-slate-300 font-bold flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Descartar</span>
            </button>
            <button
              onClick={handleApplyAiProposal}
              className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-1 shadow-lg"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Confirmar & Aplicar no PLC</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Project Tree Navigation */}
        <ProjectTree
          program={program}
          activePouId={program.activePouId}
          onSelectPou={pouId => setProgram(p => ({ ...p, activePouId: pouId }))}
          onAddPou={() => {
            const count = program.pous.length + 1;
            const newPou = {
              id: `pou_${Date.now()}`,
              name: `Sub_Program_${count}`,
              type: 'PROGRAM' as const,
              language: 'LD' as const,
              description: 'Sub-rotina de controle',
              version: '1.0.0',
              author: 'Eng. EletricAI',
              dateCreated: '2026-09-23',
              lastModified: '2026-09-23',
              revision: 1,
              rungs: [],
              localVariables: [],
            };
            setProgram(p => ({ ...p, pous: [...p.pous, newPou], activePouId: newPou.id }));
          }}
          onSelectRung={handleNavigateToRung}
          onOpenVariablesTab={() => setActiveSubTab('variables')}
          onOpenIoTab={() => setActiveSubTab('io_rack')}
          onOpenInterlocksTab={() => setActiveSubTab('editor')}
        />

        {/* Center Main Stage depending on Active Subtab */}
        {activeSubTab === 'editor' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Element Palette */}
            <ElementPalette
              onInsertElement={handleInsertElement}
              availableVariables={program.globalVariables.map(v => v.name)}
            />

            {/* Visual Ladder Rung Stream Canvas */}
            <div className="flex-1 flex flex-col h-full bg-[#0B0D10] overflow-hidden">
              {/* Canvas Controls Header */}
              <div className="h-9 px-4 bg-[#141820] border-b border-[#232833] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-200">
                    POU: {activePou?.name} ({activePou?.rungs.length} Rungs)
                  </span>
                  <button
                    onClick={handleAddNewRung}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Adicionar Rung</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#1A1F29] px-2 py-0.5 rounded border border-[#232833] text-[10px]">
                    <span className="text-slate-400">Zoom:</span>
                    <button
                      onClick={() => setZoomLevel(z => Math.max(0.7, z - 0.1))}
                      className="hover:text-amber-400 px-1 font-bold"
                    >
                      -
                    </button>
                    <span className="text-amber-400 font-bold">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      onClick={() => setZoomLevel(z => Math.min(1.4, z + 0.1))}
                      className="hover:text-amber-400 px-1 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Rungs Scrollable Viewport */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activePou?.rungs.map(rung => (
                  <LadderRungView
                    key={rung.id}
                    rung={rung}
                    selectedElementId={selectedElement?.id || null}
                    onSelectElement={handleSelectElement}
                    onToggleContactSignal={handleToggleContactSignal}
                    onDuplicateRung={handleDuplicateRung}
                    onDeleteRung={handleDeleteRung}
                    onToggleRungEnabled={handleToggleRungEnabled}
                    variables={program.globalVariables}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Properties Inspector */}
            <ElementProperties
              element={selectedElement}
              variables={program.globalVariables}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={() => selectedElement && handleInsertElement(selectedElement.elementType, selectedElement.contactType || selectedElement.coilType, selectedElement.variableName)}
              isSimulationActive={simRunning}
              onToggleForce={handleToggleForce}
            />
          </div>
        )}

        {activeSubTab === 'variables' && (
          <VariableManager
            program={program}
            onUpdateVariable={v => {
              pushUndoSnapshot();
              setProgram(p => ({
                ...p,
                globalVariables: p.globalVariables.map(gv => (gv.id === v.id ? v : gv)),
              }));
            }}
            onAddVariable={v => {
              pushUndoSnapshot();
              setProgram(p => ({
                ...p,
                globalVariables: [...p.globalVariables, v],
              }));
            }}
            onDeleteVariable={vId => {
              pushUndoSnapshot();
              setProgram(p => ({
                ...p,
                globalVariables: p.globalVariables.filter(gv => gv.id !== vId),
              }));
            }}
            onToggleForce={handleToggleForce}
            onUnforceVariable={handleUnforceVariable}
          />
        )}

        {activeSubTab === 'io_rack' && (
          <HardwareIoView
            program={program}
            onUpdateChannelState={(chId, state) => {
              setProgram(p => ({
                ...p,
                rack: {
                  ...p.rack,
                  modules: p.rack.modules.map(m => ({
                    ...m,
                    channels: m.channels.map(c => (c.id === chId ? { ...c, state } : c)),
                  })),
                },
              }));
            }}
            onUpdateChannelTag={(chId, tag) => {
              setProgram(p => ({
                ...p,
                rack: {
                  ...p.rack,
                  modules: p.rack.modules.map(m => ({
                    ...m,
                    channels: m.channels.map(c => (c.id === chId ? { ...c, tag } : c)),
                  })),
                },
              }));
            }}
          />
        )}

        {activeSubTab === 'trace' && (
          <SimulationTraceView
            traceSamples={traceSamples}
            monitoredTags={['KM01_COMPRESSOR', 'KM02_ESTRELA', 'KM03_TRIANGULO', 'FT01_TERMIC_COMP']}
          />
        )}

        {activeSubTab === 'docs' && (
          <DocumentationReportView
            program={program}
            crossRefs={crossReferences}
            diagnostics={diagnostics}
          />
        )}
      </div>

      {/* 4. Bottom Diagnostics, Watch, Force & Cross-Ref Tables */}
      <BottomDiagnostics
        issues={diagnostics}
        crossRefs={crossReferences}
        program={program}
        onNavigateToRung={handleNavigateToRung}
        onUnforceVariable={handleUnforceVariable}
        onForceVariable={handleToggleForce}
      />
    </div>
  );
}
