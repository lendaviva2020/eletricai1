'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { ElectricalComponent, ElectricalConnection, ComponentCategory } from '@/types/electrical';
import { SymbolDefinition } from '@/lib/symbol-library';
import { ViewportControls } from '@/components/shared/ViewportControls';
import { EngineeringRibbon } from '@/components/cad/EngineeringRibbon';
import { SymbolLibrarySidebar } from '@/components/cad/SymbolLibrarySidebar';
import { PropertiesInspector } from '@/components/cad/PropertiesInspector';
import { BottomInspectionConsole } from '@/components/cad/BottomInspectionConsole';
import { TitleBlockSheet } from '@/components/cad/TitleBlockSheet';
import {
  RotateCcw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Download,
  AlertCircle,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  Layers,
  Crosshair,
  Zap,
  Play,
  Pause,
} from 'lucide-react';

let connCounter = 1000;
function generateConnectionId(): string {
  connCounter += 1;
  return `conn_${connCounter}`;
}

let symbolCounter = 1000;
function generateComponentId(prefix: string): string {
  symbolCounter += 1;
  return `comp_${prefix.toLowerCase()}_${symbolCounter}`;
}

export function UnifilarCanvas() {
  const {
    components,
    connections,
    selectedComponentId,
    selectedComponentIds,
    setSelectedComponentId,
    setSelectedComponentIds,
    toggleBreakerState,
    updateComponent,
    addComponent,
    deleteComponent,
    setConnections,
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
    isSimulationRunning,
    setIsSimulationRunning,
    addConnection,
  } = useWorkspace();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 60, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [isPanMode, setIsPanMode] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Sidebar drawers state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExecuteAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      await executeAiNaturalCommand(aiPrompt);
      setAiPrompt('');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) importProjectJson(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAlign = (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedComponentIds.length < 2) return;
    const comps = components.filter(c => selectedComponentIds.includes(c.id));
    if (comps.length < 2) return;
    const minX = Math.min(...comps.map(c => c.x));
    const minY = Math.min(...comps.map(c => c.y));
    const maxX = Math.max(...comps.map(c => c.x + c.width));
    const maxY = Math.max(...comps.map(c => c.y + c.height));
    const avgX = (minX + maxX) / 2;
    const avgY = (minY + maxY) / 2;

    comps.forEach(c => {
      let nextX = c.x;
      let nextY = c.y;
      if (direction === 'left') nextX = minX;
      else if (direction === 'right') nextX = maxX - c.width;
      else if (direction === 'center') nextX = avgX - c.width / 2;
      else if (direction === 'top') nextY = minY;
      else if (direction === 'bottom') nextY = maxY - c.height;
      else if (direction === 'middle') nextY = avgY - c.height / 2;

      updateComponent(c.id, { x: Math.round(nextX), y: Math.round(nextY) });
    });
  };

  // Wire drawing mode
  const [wireStart, setWireStart] = useState<{
    compId: string;
    portId: string;
    x: number;
    y: number;
  } | null>(null);
  const [mouseWorldPos, setMouseWorldPos] = useState({ x: 0, y: 0 });

  // Component Dragging
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const selectedComponent = components.find(c => c.id === selectedComponentId) || null;
  const activePage = projectPages.find(p => p.pageNumber === activePageNumber) || projectPages[0];

  // Reactive Connectivity Validation (Orphan components & floating/unterminated wires)
  const connectivityStatus = useMemo(() => {
    const compMap = new Map(components.map(c => [c.id, c]));

    const orphanComponents = components.filter(comp => {
      const hasConnection = connections.some(
        conn => conn.fromComponentId === comp.id || conn.toComponentId === comp.id
      );
      return !hasConnection;
    });

    const unterminatedWires = connections.filter(conn => {
      const fromComp = compMap.get(conn.fromComponentId);
      const toComp = compMap.get(conn.toComponentId);
      if (!fromComp || !toComp) return true;
      if (conn.fromPortId && fromComp.ports.length > 0 && !fromComp.ports.some(p => p.id === conn.fromPortId)) {
        return true;
      }
      if (conn.toPortId && toComp.ports.length > 0 && !toComp.ports.some(p => p.id === conn.toPortId)) {
        return true;
      }
      return false;
    });

    return {
      orphanComponents,
      unterminatedWires,
      hasIssues: orphanComponents.length > 0 || unterminatedWires.length > 0,
    };
  }, [components, connections]);

  const handleCleanupFloatingWires = useCallback(() => {
    const compMap = new Map(components.map(c => [c.id, c]));
    const validWires = connections.filter(conn => {
      const fromComp = compMap.get(conn.fromComponentId);
      const toComp = compMap.get(conn.toComponentId);
      if (!fromComp || !toComp) return false;
      if (conn.fromPortId && fromComp.ports.length > 0 && !fromComp.ports.some(p => p.id === conn.fromPortId)) {
        return false;
      }
      if (conn.toPortId && toComp.ports.length > 0 && !toComp.ports.some(p => p.id === conn.toPortId)) {
        return false;
      }
      return true;
    });

    setConnections(validWires);
  }, [components, connections, setConnections]);

  // Zoom handlers
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(2.5, Math.max(0.35, Number((prev + delta).toFixed(2)))));
  };

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 60, y: 40 });
  }, []);

  const handleZoomToFit = useCallback(() => {
    if (!containerRef.current || components.length === 0) {
      setZoom(1);
      setPan({ x: 60, y: 40 });
      return;
    }

    const containerW = containerRef.current.clientWidth;
    const containerH = containerRef.current.clientHeight;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    components.forEach(c => {
      minX = Math.min(minX, c.x);
      minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x + c.width);
      maxY = Math.max(maxY, c.y + c.height);
    });

    const contentW = Math.max(200, maxX - minX);
    const contentH = Math.max(200, maxY - minY);

    const padding = 80;
    const scaleX = (containerW - padding * 2) / contentW;
    const scaleY = (containerH - padding * 2) / contentH;
    const newZoom = Math.min(1.8, Math.max(0.4, Math.min(scaleX, scaleY)));

    const centerX = minX + contentW / 2;
    const centerY = minY + contentH / 2;
    const newPanX = containerW / 2 - centerX * newZoom;
    const newPanY = containerH / 2 - centerY * newZoom;

    setZoom(Number(newZoom.toFixed(2)));
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  }, [components]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom(prev => Math.min(2.5, Math.max(0.35, Number((prev + delta).toFixed(2)))));
  };

  // Convert client coordinates to World SVG CAD space
  const screenToWorld = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = (clientX - rect.left - pan.x) / zoom;
      const rawY = (clientY - rect.top - pan.y) / zoom;
      if (!snapToGrid) return { x: Math.round(rawX), y: Math.round(rawY) };
      return {
        x: Math.round(rawX / gridSize) * gridSize,
        y: Math.round(rawY / gridSize) * gridSize,
      };
    },
    [pan, zoom, snapToGrid, gridSize]
  );

  // Focus on specific component (called from validation console)
  const handleFocusComponent = useCallback(
    (compId: string) => {
      const comp = components.find(c => c.id === compId);
      if (!comp || !containerRef.current) return;

      setSelectedComponentId(comp.id);
      setSelectedComponentIds([comp.id]);
      setIsInspectorOpen(true);

      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;

      const compCenterX = comp.x + comp.width / 2;
      const compCenterY = comp.y + comp.height / 2;

      setPan({
        x: Math.round(containerW / 2 - compCenterX * zoom),
        y: Math.round(containerH / 2 - compCenterY * zoom),
      });
    },
    [components, zoom, setSelectedComponentId, setSelectedComponentIds]
  );

  // Mouse pan & canvas click handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPanMode || e.button === 1 || (e.button === 0 && e.target === containerRef.current)) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    setMouseWorldPos(worldPos);

    if (draggingCompId) {
      const rawX = (e.clientX - pan.x) / zoom - dragOffset.x;
      const rawY = (e.clientY - pan.y) / zoom - dragOffset.y;
      const snappedX = snapToGrid ? Math.round(rawX / gridSize) * gridSize : rawX;
      const snappedY = snapToGrid ? Math.round(rawY / gridSize) * gridSize : rawY;

      updateComponent(draggingCompId, {
        x: Math.max(10, Math.round(snappedX)),
        y: Math.max(10, Math.round(snappedY)),
      });
    } else if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingCompId(null);
    setIsPanning(false);
  };

  // Component Drag Start
  const handleCompMouseDown = (e: React.MouseEvent, comp: ElectricalComponent) => {
    if (isPanMode) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }
    if (activeCadTool === 'WIRE') {
      // If clicking component in wire mode, connect to primary port
      const targetPort = comp.ports[0];
      if (targetPort) {
        handlePortClick(e, comp.id, targetPort.id, targetPort.x, targetPort.y);
      }
      return;
    }

    e.stopPropagation();
    setSelectedComponentId(comp.id);
    if (e.shiftKey) {
      setSelectedComponentIds(prev =>
        prev.includes(comp.id) ? prev.filter(id => id !== comp.id) : [...prev, comp.id]
      );
    } else {
      setSelectedComponentIds([comp.id]);
    }

    if (!comp.isLocked) {
      setDraggingCompId(comp.id);
      setDragOffset({
        x: (e.clientX - pan.x) / zoom - comp.x,
        y: (e.clientY - pan.y) / zoom - comp.y,
      });
    }
  };

  // Wire Connection Click
  const handlePortClick = (
    e: React.MouseEvent,
    compId: string,
    portId: string,
    portX: number,
    portY: number
  ) => {
    e.stopPropagation();

    if (!wireStart) {
      // Start wire
      setWireStart({ compId, portId, x: portX, y: portY });
    } else {
      // Complete wire
      if (wireStart.compId !== compId) {
        const fromComp = components.find(c => c.id === wireStart.compId);
        const toComp = components.find(c => c.id === compId);

        const newConn: ElectricalConnection = {
          id: generateConnectionId(),
          fromComponentId: wireStart.compId,
          fromPortId: wireStart.portId,
          toComponentId: compId,
          toPortId: portId,
          isEnergized: Boolean(fromComp?.isEnergized && toComp?.isEnergized),
          voltage: fromComp?.voltage || 380,
          wireGauge: fromComp?.cableCrossSection || 16,
        };

        // Add to connections through context
        addConnection(newConn);
      }
      setWireStart(null);
    }
  };

  // Insert symbol from library
  const handleInsertSymbol = (sym: SymbolDefinition) => {
    const id = generateComponentId(sym.tagPrefix);
    const centerX = Math.round(((-pan.x + 500) / zoom) / gridSize) * gridSize;
    const centerY = Math.round(((-pan.y + 350) / zoom) / gridSize) * gridSize;

    const newComp: ElectricalComponent = {
      id,
      tag: `${sym.tagPrefix}0${components.length + 1}`,
      name: sym.name,
      category: sym.defaultCategory || 'MOTOR_BREAKER',
      x: Math.max(40, centerX),
      y: Math.max(40, centerY),
      width: sym.width,
      height: sym.height,
      voltage: sym.defaultVoltage || 380,
      nominalCurrent: sym.defaultNominalCurrent || 32,
      operationalCurrent: Math.round((sym.defaultNominalCurrent || 32) * 0.8),
      breakingCapacity: 25,
      power: sym.defaultPowerKw,
      powerFactor: 0.86,
      efficiency: 0.92,
      cableCrossSection: 10,
      voltageDropPercent: 1.2,
      isEnergized: true,
      ports: sym.ports.map((p, idx) => ({
        id: `p_${id}_${idx}`,
        type: p.type === 'bus' ? 'out' : p.type,
        x: Math.max(40, centerX) + p.x,
        y: Math.max(40, centerY) + p.y,
      })),
      manufacturer: sym.defaultManufacturer || 'WEG',
      partNumber: sym.defaultPartNumber || sym.iecCode,
    };

    addComponent(newComp);
    setSelectedComponentId(id);
    setSelectedComponentIds([id]);
    setIsLibraryOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] relative overflow-hidden select-none">
      {/* Hidden File Input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />

      {/* 1. TOP PROFESSIONAL ENGINEERING RIBBON */}
      <EngineeringRibbon
        activeTool={activeCadTool}
        setActiveTool={setActiveCadTool}
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        gridSize={gridSize}
        setGridSize={setGridSize}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onRotate={rotateSelected}
        onFlipH={() => flipSelected('horizontal')}
        onFlipV={() => flipSelected('vertical')}
        onDuplicate={duplicateSelected}
        onDelete={deleteSelected}
        onOpenLibrary={() => setIsLibraryOpen(prev => !prev)}
        onAlign={handleAlign}
        hasSelection={selectedComponentIds.length > 0}
        isLocked={selectedComponent?.isLocked}
        onToggleLock={toggleLockSelected}
        saveStatus={saveStatus}
        onSaveManual={saveProject}
        onExportDxf={exportProjectDxf}
        onExportJson={exportProjectJson}
        onImportJson={() => fileInputRef.current?.click()}
        onExportCsv={exportProjectCsv}
        onPrintPdf={() => window.print()}
        pages={projectPages}
        activePageNumber={activePageNumber}
        onSelectPage={setActivePageNumber}
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        onExecuteAiCommand={handleExecuteAi}
        isAiLoading={isAiLoading}
        onZoomIn={() => handleZoom(0.15)}
        onZoomOut={() => handleZoom(-0.15)}
        onZoomFit={handleZoomToFit}
        zoomLevel={zoom}
      />

      {/* 2. MAIN CENTER AREA (LIBRARY SIDEBAR + CAD SVG CANVAS + PROPERTIES INSPECTOR) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Symbol Library Sidebar Drawer */}
        <SymbolLibrarySidebar
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onInsertSymbol={handleInsertSymbol}
        />

        {/* SVG Drawing Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onWheel={handleWheel}
          className={`flex-1 h-full bg-[#0B0D10] bg-cad-grid relative overflow-hidden ${
            isPanMode
              ? isPanning
                ? 'cursor-grabbing'
                : 'cursor-grab'
              : activeCadTool === 'WIRE'
              ? 'cursor-crosshair'
              : 'cursor-default'
          }`}
        >
          {/* Wire Mode Indicator Banner */}
          {activeCadTool === 'WIRE' && (
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-30 bg-amber-500/90 text-black px-4 py-1.5 rounded-full text-xs font-mono font-bold shadow-lg flex items-center gap-2 animate-pulse">
              <Crosshair className="h-4 w-4" />
              <span>
                {wireStart
                  ? 'Clique no segundo borne/equipamento para conectar o fio'
                  : 'MODO DESENHO DE CONDUTOR: Clique no primeiro terminal elétrico'}
              </span>
              <button
                onClick={() => {
                  setWireStart(null);
                  setActiveCadTool('SELECT');
                }}
                className="ml-2 text-black hover:underline text-[11px]"
              >
                Cancelar (ESC)
              </button>
            </div>
          )}

          {/* Simulation & Flow Status HUD Indicator */}
          <div className="absolute top-3 right-4 z-20 flex items-center gap-2 bg-[#11141A]/90 backdrop-blur border border-[#232833] rounded-lg px-3 py-1.5 shadow-lg text-xs font-mono select-none">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isSimulationRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className={isSimulationRunning ? 'text-emerald-300 font-bold' : 'text-amber-300 font-medium'}>
                {isSimulationRunning ? 'FLUXO DE POTÊNCIA ATIVO' : 'SIMULAÇÃO PAUSADA'}
              </span>
            </div>
            <div className="h-3 w-px bg-slate-700 mx-1" />
            <button
              onClick={() => setIsSimulationRunning(p => !p)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-colors ${
                isSimulationRunning
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
              }`}
              title={isSimulationRunning ? 'Pausar animação de fluxo e simulação' : 'Retomar simulação e animação de fluxo'}
            >
              {isSimulationRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              <span>{isSimulationRunning ? 'Pausar' : 'Simular'}</span>
            </button>
          </div>

          {/* SVG Vector Drawing Layer */}
          <svg
            className="w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {/* SVG Defs for Flow Animations and Visual Filters */}
            <defs>
              <style>{`
                @keyframes electricPowerFlow {
                  from {
                    stroke-dashoffset: 32;
                  }
                  to {
                    stroke-dashoffset: 0;
                  }
                }
                @keyframes electricPulseGlow {
                  0%, 100% {
                    stroke-opacity: 0.25;
                    stroke-width: 6;
                  }
                  50% {
                    stroke-opacity: 0.75;
                    stroke-width: 9;
                  }
                }
                .energy-flow-active {
                  stroke-dasharray: 6 10;
                  animation: electricPowerFlow 0.75s linear infinite;
                }
                .energy-flow-sparks {
                  stroke-dasharray: 2 14;
                  animation: electricPowerFlow 0.75s linear infinite;
                }
                .energy-glow-pulse {
                  animation: electricPulseGlow 2s ease-in-out infinite;
                }
              `}</style>
              <filter id="wireNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Sheet Frame (A3 Landscape) & Official Title Block */}
            <TitleBlockSheet
              sheetWidth={1200}
              sheetHeight={850}
              sheetTitle={activePage.title}
              titleBlock={activePage.titleBlock}
            />

            {/* Existing Connections (Cables / Busbars / Wires) */}
            {connections.map(conn => {
              const fromComp = components.find(c => c.id === conn.fromComponentId);
              const toComp = components.find(c => c.id === conn.toComponentId);
              
              const isFromMissing = !fromComp;
              const isToMissing = !toComp;
              const isFromPortInvalid = Boolean(fromComp && conn.fromPortId && fromComp.ports.length > 0 && !fromComp.ports.some(p => p.id === conn.fromPortId));
              const isToPortInvalid = Boolean(toComp && conn.toPortId && toComp.ports.length > 0 && !toComp.ports.some(p => p.id === conn.toPortId));
              const isWireFloating = isFromMissing || isToMissing || isFromPortInvalid || isToPortInvalid;

              if (isFromMissing && isToMissing) return null;

              const x1 = fromComp ? fromComp.x + fromComp.width / 2 : (toComp ? toComp.x - 40 : 100);
              const y1 = fromComp ? fromComp.y + fromComp.height : (toComp ? toComp.y - 40 : 100);
              const x2 = toComp ? toComp.x + toComp.width / 2 : (fromComp ? fromComp.x + 40 : 200);
              const y2 = toComp ? toComp.y : (fromComp ? fromComp.y + fromComp.height + 40 : 200);

              const isLive = Boolean(fromComp?.isEnergized && toComp?.isEnergized);
              const pathD = `M ${x1} ${y1} L ${x1} ${(y1 + y2) / 2} L ${x2} ${(y1 + y2) / 2} L ${x2} ${y2}`;

              return (
                <g key={conn.id} className="cursor-pointer group">
                  {/* Floating Wire with Missing Terminal */}
                  {isWireFloating ? (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth={3}
                      strokeDasharray="4,4"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                  ) : isLive ? (
                    /* Energized Conductor with Flow Animation in Simulation Mode */
                    <>
                      {/* 1. Pulsing Ambient Energy Glow */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="7"
                        strokeOpacity={isSimulationRunning ? 0.45 : 0.25}
                        strokeLinecap="round"
                        className={isSimulationRunning ? "energy-glow-pulse" : ""}
                        filter="url(#wireNeonGlow)"
                      />

                      {/* 2. Core Solid Copper/Aluminum Conductor Base */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#B45309"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                      />

                      {/* 3. Dynamic Current Flow Streams (only when simulation is running) */}
                      {isSimulationRunning ? (
                        <>
                          {/* Vibrant moving yellow current dash stream */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#FDE047"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className="energy-flow-active"
                          />
                          {/* Supercharged traveling electron sparks */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#FFFFFF"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            className="energy-flow-sparks"
                          />
                        </>
                      ) : (
                        /* Static energized line when simulation is paused */
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      )}
                    </>
                  ) : (
                    /* De-energized Circuit Conductor */
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#64748B"
                      strokeWidth="2.2"
                      strokeDasharray="4,3"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Wire size & tag label + Simulation Flow Indicator */}
                  <g transform={`translate(${(x1 + x2) / 2 + 6}, ${(y1 + y2) / 2 - 4})`}>
                    {isLive && isSimulationRunning && !isWireFloating && (
                      <circle cx="-3" cy="-3" r="2" fill="#10B981" className="animate-ping" />
                    )}
                    <text
                      fill={isWireFloating ? '#EF4444' : isLive ? '#FDE047' : '#94A3B8'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {conn.wireGauge ? `${conn.wireGauge} mm²` : ''}
                      {isWireFloating
                        ? ' ⚠️ SEM TERMINAL'
                        : isLive && isSimulationRunning
                        ? ' ⚡ FLUINDO'
                        : isLive
                        ? ' [PAUSADO]'
                        : ''}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Rubber Band Wire Preview while drawing */}
            {wireStart && (
              <g className="pointer-events-none">
                <line
                  x1={wireStart.x}
                  y1={wireStart.y}
                  x2={mouseWorldPos.x}
                  y2={mouseWorldPos.y}
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  strokeDasharray="4,4"
                />
                <circle cx={mouseWorldPos.x} cy={mouseWorldPos.y} r="4" fill="#38BDF8" />
              </g>
            )}

            {/* Electrical Components */}
            {components.map(comp => {
              const isSelected = selectedComponentIds.includes(comp.id) || selectedComponentId === comp.id;
              const isBusbar = comp.category === 'BUSBAR';
              const rotation = comp.rotation || 0;
              const scaleX = comp.isMirroredX ? -1 : 1;
              const scaleY = comp.isMirroredY ? -1 : 1;

              // Connectivity check (Orphan component)
              const isOrphan = connectivityStatus.orphanComponents.some(o => o.id === comp.id);

              // Check if component has any validation issue
              const hasIssue = validationIssues.some(
                i => i.componentId === comp.id || i.componentTag === comp.tag
              ) || isOrphan;
              const compIssue = validationIssues.find(
                i => i.componentId === comp.id || i.componentTag === comp.tag
              );

              return (
                <g
                  key={comp.id}
                  transform={`translate(${comp.x}, ${comp.y}) rotate(${rotation}, ${comp.width / 2}, ${comp.height / 2}) scale(${scaleX}, ${scaleY})`}
                  onMouseDown={e => handleCompMouseDown(e, comp)}
                  className="cursor-move group"
                >
                  {/* Outer Pulsing Dashed Halo for Orphan Components */}
                  {isOrphan && (
                    <rect
                      x="-6"
                      y="-6"
                      width={comp.width + 12}
                      height={comp.height + 12}
                      rx="8"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2.5"
                      strokeDasharray="6,4"
                      className="animate-pulse"
                    />
                  )}

                  {isBusbar ? (
                    /* Busbar Rendering */
                    <g>
                      <rect
                        width={comp.width}
                        height={comp.height}
                        rx="3"
                        fill={comp.isEnergized ? '#B45309' : '#374151'}
                        stroke={isSelected ? '#F59E0B' : '#D97706'}
                        strokeWidth={isSelected ? 3 : 1.5}
                      />
                      <text
                        x="12"
                        y="16"
                        fill="#FEF3C7"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {comp.tag} — {comp.nominalCurrent}A (380V - 3F+N+PE)
                      </text>
                    </g>
                  ) : (
                    /* Standard Electrical Apparatus Card */
                    <g>
                      {/* Outer Card Body */}
                      <rect
                        width={comp.width}
                        height={comp.height}
                        rx="4"
                        fill="#161A22"
                        stroke={
                          isSelected
                            ? '#F59E0B'
                            : isOrphan
                            ? '#EF4444'
                            : hasIssue
                            ? '#EF4444'
                            : comp.isEnergized
                            ? '#232833'
                            : '#EF4444'
                        }
                        strokeWidth={isSelected ? 2.5 : isOrphan ? 2.5 : hasIssue ? 2 : 1.2}
                        className="transition-colors drop-shadow-md"
                      />

                      {/* Header bar */}
                      <rect
                        x="0"
                        y="0"
                        width={comp.width}
                        height="20"
                        rx="4"
                        fill={
                          isOrphan
                            ? '#450A0A'
                            : hasIssue
                            ? '#450A0A'
                            : comp.isEnergized
                            ? '#1E2533'
                            : '#3B1216'
                        }
                      />

                      {/* Status indicator dot */}
                      <circle
                        cx="10"
                        cy="10"
                        r="4"
                        fill={
                          isOrphan
                            ? '#EF4444'
                            : hasIssue
                            ? '#EF4444'
                            : comp.isEnergized
                            ? '#10B981'
                            : '#EF4444'
                        }
                      />

                      {/* Tag label */}
                      <text
                        x="20"
                        y="14"
                        fill="#F8FAFC"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {comp.tag}
                      </text>

                      {/* Lock Icon Indicator */}
                      {comp.isLocked && (
                        <text x={comp.width - 16} y="14" fill="#64748B" fontSize="9">
                          🔒
                        </text>
                      )}

                      {/* Name / Category */}
                      <text
                        x="10"
                        y="36"
                        fill="#94A3B8"
                        fontSize="9"
                        fontFamily="sans-serif"
                      >
                        {comp.name.length > 20 ? comp.name.substring(0, 18) + '...' : comp.name}
                      </text>

                      {/* Electrical Values In / kW */}
                      <text
                        x="10"
                        y="52"
                        fill="#CBD5E1"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        In: <tspan fill="#F59E0B" fontWeight="bold">{comp.nominalCurrent}A</tspan>
                        {comp.power ? ` | ${comp.power}kW` : ''}
                      </text>

                      {/* Cable size badge */}
                      {comp.cableCrossSection && (
                        <text
                          x="10"
                          y="65"
                          fill="#06B6D4"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          Cabo: {comp.cableCrossSection}mm² ({comp.voltageDropPercent || 1.1}% ΔV)
                        </text>
                      )}

                      {/* Orphan Component Warning Badge */}
                      {isOrphan && (
                        <g>
                          <rect
                            x="6"
                            y={comp.height - 18}
                            width={comp.width - 12}
                            height="14"
                            rx="3"
                            fill="#7F1D1D"
                            fillOpacity="0.95"
                            stroke="#EF4444"
                            strokeWidth="0.8"
                          />
                          <text
                            x={comp.width / 2}
                            y={comp.height - 8}
                            fill="#FCA5A5"
                            fontSize="7.5"
                            fontWeight="bold"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            ⚠️ ÓRFÃO (SEM CONEXÃO)
                          </text>
                        </g>
                      )}

                      {/* Other Validation Warning Badge */}
                      {!isOrphan && hasIssue && (
                        <g transform={`translate(${comp.width - 24}, ${comp.height - 20})`}>
                          <circle cx="10" cy="10" r="8" fill="#EF4444" />
                          <text x="10" y="13" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                            !
                          </text>
                        </g>
                      )}

                      {/* Electrical Ports for connection */}
                      {comp.ports.map(port => {
                        const isPortConnected = connections.some(
                          c =>
                            (c.fromComponentId === comp.id && c.fromPortId === port.id) ||
                            (c.toComponentId === comp.id && c.toPortId === port.id)
                        );

                        return (
                          <g key={port.id}>
                            {/* Open Terminal Warning Halo if unconnected */}
                            {!isPortConnected && (
                              <circle
                                cx={port.x - comp.x}
                                cy={port.y - comp.y}
                                r="7.5"
                                fill="none"
                                stroke="#EF4444"
                                strokeWidth="1.2"
                                strokeDasharray="2,2"
                                opacity="0.85"
                              />
                            )}
                            <circle
                              cx={port.x - comp.x}
                              cy={port.y - comp.y}
                              r="4.5"
                              fill="#0B0D10"
                              stroke={
                                wireStart?.portId === port.id
                                  ? '#38BDF8'
                                  : !isPortConnected
                                  ? '#EF4444'
                                  : '#F59E0B'
                              }
                              strokeWidth="2"
                              className="hover:fill-amber-400 hover:scale-125 transition-all cursor-pointer"
                              onClick={e => handlePortClick(e, comp.id, port.id, port.x, port.y)}
                            />
                          </g>
                        );
                      })}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Viewport Controls Toolbar */}
          <ViewportControls
            onZoomIn={() => handleZoom(0.15)}
            onZoomOut={() => handleZoom(-0.15)}
            zoomLevel={zoom}
            onZoomToFit={handleZoomToFit}
            onResetView={handleResetView}
            isPanMode={isPanMode}
            onTogglePanMode={() => setIsPanMode(prev => !prev)}
            position="bottom-right"
            label="CAD UNIFILAR"
          />
        </div>

        {/* 3. RIGHT PROPERTIES INSPECTOR PANEL */}
        {isInspectorOpen && (
          <PropertiesInspector
            component={selectedComponent}
            onUpdateComponent={updated => updateComponent(updated.id, updated)}
            onDeleteComponent={deleteComponent}
            onDuplicateComponent={duplicateSelected}
            onClose={() => setIsInspectorOpen(false)}
            onToggleBreaker={toggleBreakerState}
          />
        )}
      </div>

      {/* 4. BOTTOM ENGINEERING INSPECTION CONSOLE */}
      <BottomInspectionConsole
        issues={validationIssues}
        loadList={loadList}
        terminalStrips={terminalStrips}
        onSelectComponent={handleFocusComponent}
        cursorCoordinates={mouseWorldPos}
        activePageTitle={activePage.title}
        zoomPercent={Math.round(zoom * 100)}
        snapStatus={snapToGrid}
        onExportLoadListCsv={exportProjectCsv}
        orphanComponents={connectivityStatus.orphanComponents}
        unterminatedWires={connectivityStatus.unterminatedWires}
        onCleanupFloatingWires={handleCleanupFloatingWires}
        onActivateWireTool={() => setActiveCadTool('WIRE')}
      />
    </div>
  );
}
