'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { ElectricalComponent, ComponentCategory } from '@/types/electrical';
import { autoSizeCircuit } from '@/lib/nbr5410';
import { ViewportControls } from '@/components/shared/ViewportControls';
import {
  ZoomIn,
  ZoomOut,
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
  Flame,
  Layers,
} from 'lucide-react';

let nextCompIndex = 1;
function createNewComponentId() {
  nextCompIndex += 1;
  return `comp_usr_${nextCompIndex}`;
}

export function UnifilarCanvas() {
  const {
    components,
    connections,
    selectedComponentId,
    setSelectedComponentId,
    toggleBreakerState,
    updateComponent,
    addComponent,
    deleteComponent,
    downloadDxf,
    setActiveTab,
    setActivePatch,
    isSimulationRunning,
  } = useWorkspace();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [isPanMode, setIsPanMode] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [connectingPort, setConnectingPort] = useState<{ compId: string; portId: string } | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [componentLibraryOpen, setComponentLibraryOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const selectedComponent = components.find(c => c.id === selectedComponentId);

  // Zoom handlers
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(2.2, Math.max(0.4, Number((prev + delta).toFixed(2)))));
  };

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 40, y: 30 });
  }, []);

  const handleZoomToFit = useCallback(() => {
    if (!containerRef.current || components.length === 0) {
      setZoom(1);
      setPan({ x: 40, y: 30 });
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

    const contentW = Math.max(120, maxX - minX);
    const contentH = Math.max(120, maxY - minY);

    const padding = 60;
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
    setZoom(prev => Math.min(2.2, Math.max(0.4, Number((prev + delta).toFixed(2)))));
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPanMode || e.button === 1 || (e.button === 0 && e.target === containerRef.current)) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Component click & drag
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleCompMouseDown = (e: React.MouseEvent, comp: ElectricalComponent) => {
    if (isPanMode) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }
    e.stopPropagation();
    setSelectedComponentId(comp.id);
    setDraggingCompId(comp.id);
    setDragOffset({
      x: (e.clientX - pan.x) / zoom - comp.x,
      y: (e.clientY - pan.y) / zoom - comp.y,
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingCompId) {
      const snapGrid = 12;
      const rawX = (e.clientX - pan.x) / zoom - dragOffset.x;
      const rawY = (e.clientY - pan.y) / zoom - dragOffset.y;
      const snappedX = Math.round(rawX / snapGrid) * snapGrid;
      const snappedY = Math.round(rawY / snapGrid) * snapGrid;

      updateComponent(draggingCompId, { x: Math.max(10, snappedX), y: Math.max(10, snappedY) });
    } else if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingCompId(null);
    setIsPanning(false);
  };

  // Connect port handler
  const handlePortClick = (e: React.MouseEvent, compId: string, portId: string) => {
    e.stopPropagation();
    if (!connectingPort) {
      setConnectingPort({ compId, portId });
    } else {
      if (connectingPort.compId !== compId) {
        // Create connection
        setConnectingPort(null);
      } else {
        setConnectingPort(null);
      }
    }
  };

  // AI Prompt generation with Patch Diff
  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/engineer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          currentComponents: components,
          currentTags: [],
        }),
      });

      const data = await res.json();
      if (data.proposal) {
        setActivePatch(data.proposal);
        setActiveTab('ai_copilot');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Add new component from library
  const handleAddNewComponent = (category: ComponentCategory) => {
    const id = createNewComponentId();
    const newComp: ElectricalComponent = {
      id,
      tag: `Q_NEW_${components.length + 1}`,
      name: `Novo Equipamento`,
      category,
      x: 350,
      y: 520,
      width: 140,
      height: 70,
      voltage: 380,
      nominalCurrent: 32,
      operationalCurrent: 24,
      breakingCapacity: 25,
      cableCrossSection: 10,
      voltageDropPercent: 1.1,
      isEnergized: true,
      ports: [
        { id: `p_in_${id}`, type: 'in', x: 420, y: 520 },
        { id: `p_out_${id}`, type: 'out', x: 420, y: 590 },
      ],
      manufacturer: 'WEG',
      partNumber: 'MPW40-32',
      unitCostBrl: 450,
    };
    addComponent(newComp);
    setSelectedComponentId(id);
    setComponentLibraryOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] relative overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-10 px-4 bg-[#11141A] border-b border-[#232833] flex items-center justify-between z-20 select-none">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Diagrama Unifilar CAD
          </span>
          <span className="text-slate-500 text-xs">|</span>
          <span className="text-slate-400 text-xs font-mono">
            {components.length} Equipamentos | {connections.length} Barramentos
          </span>
        </div>

        {/* Natural Language AI Prompt input directly on toolbar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerateWithAi()}
              placeholder="Ex: Adicionar partida com soft-starter para bomba 15cv e verificar queda de tensão NBR 5410..."
              className="w-full bg-[#161A22] border border-[#2A313E] focus:border-amber-500 rounded pl-8 pr-20 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors"
            />
            <Sparkles className="absolute left-2.5 h-3.5 w-3.5 text-amber-400 pointer-events-none" />
            <button
              onClick={handleGenerateWithAi}
              disabled={isAiLoading || !aiPrompt.trim()}
              className="absolute right-1 px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-[#0B0D10] text-[11px] font-bold font-mono transition-colors disabled:opacity-50"
            >
              {isAiLoading ? 'Analisando...' : 'GERAR IA'}
            </button>
          </div>
        </div>

        {/* Canvas Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setComponentLibraryOpen(!componentLibraryOpen)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-mono rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Inserir Componente</span>
          </button>
          <div className="h-4 w-[1px] bg-[#232833] mx-1" />
          <button
            onClick={() => handleZoom(0.15)}
            className="p-1 rounded hover:bg-[#1C222E] text-slate-400 hover:text-slate-200"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.15)}
            className="p-1 rounded hover:bg-[#1C222E] text-slate-400 hover:text-slate-200"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1 rounded hover:bg-[#1C222E] text-slate-400 hover:text-slate-200"
            title="Ajustar ao centro"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-500 w-10 text-right">
            {Math.round(zoom * 100)}%
          </span>
          <div className="h-4 w-[1px] bg-[#232833] mx-1" />
          <button
            onClick={downloadDxf}
            className="flex items-center gap-1 px-2 py-1 text-xs font-mono rounded bg-[#161A22] border border-[#232833] hover:border-slate-500 text-slate-300 transition-colors"
            title="Exportar arquivo DXF"
          >
            <Download className="h-3.5 w-3.5 text-amber-400" />
            <span>DXF</span>
          </button>
        </div>
      </div>

      {/* Component Library Dropdown Modal */}
      {componentLibraryOpen && (
        <div className="absolute top-12 left-4 z-40 bg-[#161A22] border border-[#2A313E] rounded-lg shadow-2xl p-3 w-80 select-none">
          <div className="flex items-center justify-between pb-2 border-b border-[#232833] text-xs font-bold text-slate-200 font-mono">
            <span>BIBLIOTECA DE COMPONENTES ABNT</span>
            <button onClick={() => setComponentLibraryOpen(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2 max-h-80 overflow-y-auto pr-1">
            {[
              { cat: 'MOTOR_BREAKER' as const, label: 'Disjuntor-Motor', desc: 'WEG MPW' },
              { cat: 'CONTACTOR' as const, label: 'Contator Tripolar', desc: 'AC-3 24VDC' },
              { cat: 'THERMAL_RELAY' as const, label: 'Relé Sobrecarga', desc: 'Térmico RW' },
              { cat: 'VFD' as const, label: 'Inversor VFD', desc: 'CFW500' },
              { cat: 'SOFT_STARTER' as const, label: 'Soft-Starter', desc: 'SSW07' },
              { cat: 'MOTOR_3P' as const, label: 'Motor Trifásico', desc: 'W22 IE3' },
              { cat: 'DR_PROTECTION' as const, label: 'Módulo DR 30mA', desc: 'Proteção Choque' },
              { cat: 'DPS_PROTECTION' as const, label: 'DPS Classe II', desc: '45kA Surtos' },
              { cat: 'CAPACITOR_BANK' as const, label: 'Banco de Cap.', desc: 'Correção cos φ' },
            ].map(item => (
              <button
                key={item.cat}
                onClick={() => handleAddNewComponent(item.cat)}
                className="flex flex-col text-left p-2 rounded bg-[#11141A] hover:bg-[#1E2533] border border-[#232833] hover:border-amber-500/50 transition-colors"
              >
                <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Canvas Workspace & Right Inspector Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* SVG CAD Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onWheel={handleWheel}
          className={`flex-1 h-full bg-[#0B0D10] bg-cad-grid relative overflow-hidden select-none ${
            isPanMode
              ? isPanning
                ? 'cursor-grabbing'
                : 'cursor-grab'
              : 'cursor-crosshair'
          }`}
        >
          {/* Snap Grid Indicators */}
          <div className="absolute top-2 left-2 pointer-events-none text-[10px] font-mono text-slate-600">
            GRID: 12mm | ESCALA 1:1 | SNAP ATIVO
          </div>

          <svg
            className="w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {/* Draw Electrical Connections */}
            {connections.map(conn => {
              const fromComp = components.find(c => c.id === conn.fromComponentId);
              const toComp = components.find(c => c.id === conn.toComponentId);
              if (!fromComp || !toComp) return null;

              const x1 = fromComp.x + fromComp.width / 2;
              const y1 = fromComp.y + fromComp.height;
              const x2 = toComp.x + toComp.width / 2;
              const y2 = toComp.y;

              const isLive = fromComp.isEnergized && toComp.isEnergized;

              return (
                <g key={conn.id} className="cursor-pointer">
                  {/* Outer wire glow if live */}
                  {isLive && (
                    <path
                      d={`M ${x1} ${y1} L ${x1} ${(y1 + y2) / 2} L ${x2} ${(y1 + y2) / 2} L ${x2} ${y2}`}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="6"
                      strokeOpacity="0.25"
                      strokeLinecap="round"
                    />
                  )}
                  {/* Physical wire line */}
                  <path
                    d={`M ${x1} ${y1} L ${x1} ${(y1 + y2) / 2} L ${x2} ${(y1 + y2) / 2} L ${x2} ${y2}`}
                    fill="none"
                    stroke={isLive ? '#F59E0B' : '#EF4444'}
                    strokeWidth="2.5"
                    strokeDasharray={isLive ? 'none' : '4,3'}
                    strokeLinecap="round"
                  />
                  {/* Gauge annotation */}
                  {conn.wireGauge && (
                    <text
                      x={(x1 + x2) / 2 + 6}
                      y={(y1 + y2) / 2 - 4}
                      fill="#94A3B8"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {conn.wireGauge} mm²
                    </text>
                  )}
                </g>
              );
            })}

            {/* Draw Components */}
            {components.map(comp => {
              const isSelected = selectedComponentId === comp.id;
              const isBusbar = comp.category === 'BUSBAR';

              return (
                <g
                  key={comp.id}
                  transform={`translate(${comp.x}, ${comp.y})`}
                  onMouseDown={e => handleCompMouseDown(e, comp)}
                  className="cursor-move group"
                >
                  {/* Busbar Component Visual */}
                  {isBusbar ? (
                    <g>
                      <rect
                        width={comp.width}
                        height={comp.height}
                        rx="3"
                        fill={comp.isEnergized ? '#B45309' : '#374151'}
                        stroke={isSelected ? '#F59E0B' : '#D97706'}
                        strokeWidth={isSelected ? 2.5 : 1.5}
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
                    /* Standard Component Box */
                    <g>
                      {/* Component Background Card */}
                      <rect
                        width={comp.width}
                        height={comp.height}
                        rx="4"
                        fill="#161A22"
                        stroke={
                          isSelected
                            ? '#F59E0B'
                            : comp.isEnergized
                            ? '#232833'
                            : '#EF4444'
                        }
                        strokeWidth={isSelected ? 2 : 1.2}
                        className="transition-colors drop-shadow-md"
                      />

                      {/* Header bar */}
                      <rect
                        x="0"
                        y="0"
                        width={comp.width}
                        height="20"
                        rx="4"
                        fill={comp.isEnergized ? '#1E2533' : '#3B1216'}
                      />

                      {/* Status indicator dot */}
                      <circle
                        cx="10"
                        cy="10"
                        r="4"
                        fill={comp.isEnergized ? '#10B981' : '#EF4444'}
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

                      {/* Electrical Values */}
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

                      {/* Ports for connection */}
                      {comp.ports.map(port => (
                        <circle
                          key={port.id}
                          cx={port.x - comp.x}
                          cy={port.y - comp.y}
                          r="4.5"
                          fill="#0B0D10"
                          stroke="#F59E0B"
                          strokeWidth="2"
                          className="hover:fill-amber-400 hover:scale-125 transition-all cursor-pointer"
                          onClick={e => handlePortClick(e, comp.id, port.id)}
                        />
                      ))}
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
            label="CAD 2D"
          />
        </div>

        {/* Right Inspector & Sizing Panel */}
        <div className="w-84 bg-[#11141A] border-l border-[#232833] flex flex-col h-full z-10 select-none overflow-y-auto">
          {selectedComponent ? (
            <div className="p-4 flex flex-col gap-4 text-xs">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#232833]">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-amber-400">
                      {selectedComponent.tag}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        selectedComponent.isEnergized
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {selectedComponent.isEnergized ? 'ENERGIZADO' : 'TRIP / ABERTO'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {selectedComponent.name}
                  </p>
                </div>

                {/* Breaker State Toggle Switch */}
                <button
                  onClick={() => toggleBreakerState(selectedComponent.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono font-bold border transition-colors ${
                    selectedComponent.isEnergized
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
                      : 'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20'
                  }`}
                  title="Comutar estado do disjuntor"
                >
                  {selectedComponent.isEnergized ? (
                    <>
                      <ToggleRight className="h-4 w-4" />
                      <span>FECHAR</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-4 w-4" />
                      <span>ABRIR</span>
                    </>
                  )}
                </button>
              </div>

              {/* NBR 5410 Dimensionamento Card */}
              <div className="bg-[#161A22] border border-[#232833] rounded p-3 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                    <Sliders className="h-3 w-3 text-cyan-400" />
                    Cálculo NBR 5410 / ABNT
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="h-3 w-3" />
                    CONFORME
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-[#0D1017] p-2 rounded border border-[#1A1F29]">
                    <span className="text-slate-500 text-[10px]">Corrente Nominal (In)</span>
                    <p className="text-slate-100 font-bold text-sm">
                      {selectedComponent.nominalCurrent} <span className="text-amber-400 text-xs">A</span>
                    </p>
                  </div>
                  <div className="bg-[#0D1017] p-2 rounded border border-[#1A1F29]">
                    <span className="text-slate-500 text-[10px]">Corrente de Projeto (Ib)</span>
                    <p className="text-slate-100 font-bold text-sm">
                      {selectedComponent.operationalCurrent || selectedComponent.nominalCurrent * 0.75}{' '}
                      <span className="text-cyan-400 text-xs">A</span>
                    </p>
                  </div>
                  <div className="bg-[#0D1017] p-2 rounded border border-[#1A1F29]">
                    <span className="text-slate-500 text-[10px]">Seção do Cabo</span>
                    <p className="text-slate-100 font-bold text-sm">
                      {selectedComponent.cableCrossSection || 16}{' '}
                      <span className="text-emerald-400 text-xs">mm²</span>
                    </p>
                  </div>
                  <div className="bg-[#0D1017] p-2 rounded border border-[#1A1F29]">
                    <span className="text-slate-500 text-[10px]">Queda de Tensão (ΔV)</span>
                    <p
                      className={`font-bold text-sm ${
                        (selectedComponent.voltageDropPercent || 1.1) > 4
                          ? 'text-red-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {selectedComponent.voltageDropPercent || 1.1}%
                    </p>
                  </div>
                </div>

                {/* Cable Info */}
                <div className="text-[10px] text-slate-400 font-mono bg-[#0D1017] p-2 rounded border border-[#1A1F29] flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span>Isolação:</span>
                    <span className="text-slate-200">{selectedComponent.cableType || 'Afumex 90°C'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comprimento Alimentador:</span>
                    <span className="text-slate-200">{selectedComponent.cableLength || 35} metros</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Poder de Interrupção (Icu):</span>
                    <span className="text-amber-400">{selectedComponent.breakingCapacity || 25} kA</span>
                  </div>
                </div>
              </div>

              {/* Commercial Specs & Manufacturer */}
              <div className="bg-[#161A22] border border-[#232833] rounded p-3 flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Especificação Comercial & BOM
                </span>
                <div className="text-[11px] font-mono flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fabricante:</span>
                    <span className="text-slate-200 font-semibold">{selectedComponent.manufacturer || 'WEG'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Part Number:</span>
                    <span className="text-cyan-400">{selectedComponent.partNumber || 'DWA160'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Custo Unitário:</span>
                    <span className="text-emerald-400 font-bold">
                      R$ {selectedComponent.unitCostBrl?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '890,00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => deleteComponent(selectedComponent.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-red-950/30 border border-red-500/30 hover:bg-red-900/40 text-red-400 text-xs font-mono transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Excluir</span>
                </button>
                <button
                  onClick={() => setActiveTab('multifilar')}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-cyan-950/30 border border-cyan-500/30 hover:bg-cyan-900/40 text-cyan-300 text-xs font-mono transition-colors"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Ver Multifilar</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full gap-2">
              <AlertCircle className="h-8 w-8 text-slate-600" />
              <p className="text-xs font-mono">
                Selecione um disjuntor, barramento ou motor no CAD para inspecionar parâmetros elétricos e cálculos NBR 5410.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
