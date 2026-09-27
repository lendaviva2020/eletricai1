'use client';

import React, { useState, useMemo } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { CircuitType } from '@/types/electrical';
import {
  MultifilarSchematicRouter,
  NBR5410_WIRE_COLORS,
  MultifilarConductorSegment,
} from '@/lib/engineering/multifilar/schematic-router';
import {
  Split,
  Zap,
  AlertTriangle,
  Shield,
  CheckCircle2,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Info,
  Layers,
  ArrowRight,
  Flame,
  Power,
  Activity,
  FileText,
} from 'lucide-react';

interface CircuitSimulatorPanelProps {
  /** Volta para o esquema multifilar do projeto atual. */
  onBack?: () => void;
}

export function CircuitSimulatorPanel({ onBack }: CircuitSimulatorPanelProps) {
  const { toggleBreakerState } = useWorkspace();

  // Active circuit selection
  const [activeCircuitType, setActiveCircuitType] = useState<CircuitType>('direct_starter');

  // Interactive circuit state simulation
  const [isBreakerClosed, setIsBreakerClosed] = useState<boolean>(true);
  const [isEmergencyPressed, setIsEmergencyPressed] = useState<boolean>(false);
  const [isThermalTripped, setIsThermalTripped] = useState<boolean>(false);
  const [isContactorActive, setIsContactorActive] = useState<boolean>(true);
  const [isReversingActive, setIsReversingActive] = useState<boolean>(false);
  const [isFlowAnimationRunning, setIsFlowAnimationRunning] = useState<boolean>(true);

  // Inspector of clicked conductor
  const [selectedWire, setSelectedWire] = useState<MultifilarConductorSegment | null>(null);

  // Generate derivation model from engine
  const circuitModel = useMemo(() => {
    return MultifilarSchematicRouter.generateMotorDerivation(activeCircuitType, {
      isBreakerClosed,
      isContactorEnergized: isContactorActive,
      isReversingContactorEnergized: isReversingActive,
      isThermalTripped,
      isEmergencyPressed,
    });
  }, [
    activeCircuitType,
    isBreakerClosed,
    isContactorActive,
    isReversingActive,
    isThermalTripped,
    isEmergencyPressed,
  ]);

  // Handle circuit change & reset defaults
  const handleSelectCircuit = (type: CircuitType) => {
    setActiveCircuitType(type);
    setIsBreakerClosed(true);
    setIsEmergencyPressed(false);
    setIsThermalTripped(false);
    setIsContactorActive(true);
    setIsReversingActive(false);
    setSelectedWire(null);
  };

  // Motor state helper
  const isMotorOperating =
    isBreakerClosed && !isEmergencyPressed && !isThermalTripped && (isContactorActive || isReversingActive);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] text-slate-200 select-none overflow-hidden">
      {/* Top Banner / Multifilar Engine Header */}
      <div className="min-h-14 px-4 sm:px-6 py-2.5 bg-[#11141A] border-b border-[#232833] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-2.5 py-1 text-xs font-mono rounded border border-[#232833] bg-[#161A22] text-slate-300 hover:text-slate-100 hover:border-cyan-500/40 transition-colors whitespace-nowrap"
            >
              &larr; Esquema do Projeto
            </button>
          )}
          <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Split className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-100 uppercase tracking-wider">
                Editor Multifilar Trifásico (3P+N+PE)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                NBR 5410 &bull; IEC 60947
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Roteamento vetorial ortogonal de condutores de potência e comando com bitolas em mm² e código de cores normalizado.
            </p>
          </div>
        </div>

        {/* Circuit Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-[#161A22] border border-[#232833] p-1 rounded-lg overflow-x-auto max-w-full">
          <button
            onClick={() => handleSelectCircuit('direct_starter')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-all whitespace-nowrap cursor-pointer ${
              activeCircuitType === 'direct_starter'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CCT 01 (Partida Direta 30cv)
          </button>
          <button
            onClick={() => handleSelectCircuit('reversing')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-all whitespace-nowrap cursor-pointer ${
              activeCircuitType === 'reversing'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CCT 02 (Chave Reversora 20cv)
          </button>
          <button
            onClick={() => handleSelectCircuit('vfd_inverter')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-all whitespace-nowrap cursor-pointer ${
              activeCircuitType === 'vfd_inverter'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CCT 03 (Inversor VFD 10cv)
          </button>
          <button
            onClick={() => handleSelectCircuit('star_delta')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-all whitespace-nowrap cursor-pointer ${
              activeCircuitType === 'star_delta'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CCT 04 (Estrela-Triângulo 50cv)
          </button>
        </div>
      </div>

      {/* Main Multifilar Working Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-3 sm:p-5 gap-4">
        {/* Schematic SVG Renderer Canvas */}
        <div className="flex-1 min-h-[520px] bg-[#11141A] border border-[#232833] rounded-xl flex flex-col relative overflow-hidden shadow-2xl bg-cad-grid">
          {/* Top Control Bar of Schematic */}
          <div className="px-4 py-3 border-b border-[#232833] bg-[#141822]/90 backdrop-blur flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {circuitModel.tag}: {circuitModel.title}
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-[#1C212C] text-slate-300 font-mono border border-[#232833]">
                  Esquema {circuitModel.groundingSystem}
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-amber-500/10 text-amber-300 font-mono border border-amber-500/30">
                  Coordenação {circuitModel.coordinationType}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{circuitModel.subtitle}</p>
            </div>

            {/* Quick Interactive Derivation Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              {/* Breaker Switch */}
              <button
                onClick={() => setIsBreakerClosed(p => !p)}
                className={`px-2.5 py-1 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isBreakerClosed
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                    : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                }`}
                title="Abrir ou fechar o disjuntor principal"
              >
                <Power className="h-3.5 w-3.5" />
                <span>{isBreakerClosed ? 'Disjuntor FECHADO' : 'Disjuntor ABERTO'}</span>
              </button>

              {/* Contactor Coil Toggle / Reversing options */}
              {activeCircuitType === 'reversing' ? (
                <div className="flex items-center gap-1 bg-[#1A1F2B] p-0.5 rounded border border-[#232833]">
                  <button
                    onClick={() => {
                      setIsContactorActive(true);
                      setIsReversingActive(false);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                      isContactorActive
                        ? 'bg-cyan-500 text-black shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    KM1 (Avanço)
                  </button>
                  <button
                    onClick={() => {
                      setIsContactorActive(false);
                      setIsReversingActive(true);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                      isReversingActive
                        ? 'bg-cyan-500 text-black shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    KM2 (Recuo)
                  </button>
                  <button
                    onClick={() => {
                      setIsContactorActive(false);
                      setIsReversingActive(false);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                      !isContactorActive && !isReversingActive
                        ? 'bg-slate-700 text-slate-200'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Parar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsContactorActive(p => !p)}
                  className={`px-2.5 py-1 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isContactorActive
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25'
                      : 'bg-[#1C212C] text-slate-400 border-[#232833] hover:text-slate-200'
                  }`}
                  title="Acionar ou desligar a bobina do contator"
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>{isContactorActive ? 'KM01 Ligado' : 'KM01 Desligado'}</span>
                </button>
              )}

              {/* Thermal Relay Trip Simulator */}
              <button
                onClick={() => setIsThermalTripped(p => !p)}
                className={`px-2.5 py-1 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isThermalTripped
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                    : 'bg-[#1C212C] text-slate-400 border-[#232833] hover:text-slate-200'
                }`}
                title="Simular disparo por sobrecorrente térmica no relé bimetálico"
              >
                <Flame className="h-3.5 w-3.5" />
                <span>{isThermalTripped ? 'Sobrecarga Térmica (DISPARADO)' : 'Relé Térmico OK'}</span>
              </button>

              {/* Flow Animation Toggle */}
              <button
                onClick={() => setIsFlowAnimationRunning(p => !p)}
                className={`p-1.5 rounded border transition-colors cursor-pointer ${
                  isFlowAnimationRunning
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-[#1C212C] text-slate-400 border-[#232833]'
                }`}
                title={isFlowAnimationRunning ? 'Pausar fluxo de corrente' : 'Ativar fluxo de corrente'}
              >
                {isFlowAnimationRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* SVG Vector Drawing Area */}
          <div className="flex-1 relative overflow-auto p-4 flex items-center justify-center min-h-[520px]">
            <svg
              viewBox="0 0 880 540"
              className="w-full max-w-5xl h-auto select-none"
              style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.4))' }}
            >
              <defs>
                <style>{`
                  @keyframes multifilarCurrentFlow {
                    from { stroke-dashoffset: 24; }
                    to { stroke-dashoffset: 0; }
                  }
                  .multifilar-flow-active {
                    animation: multifilarCurrentFlow 1s linear infinite;
                  }
                `}</style>
                <filter id="conductorGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. HORIZONTAL BUSBARS AT TOP (L1, L2, L3, N, PE) */}
              <g id="main_busbars">
                {/* L1 Busbar */}
                <line x1="80" y1="35" x2="800" y2="35" stroke={NBR5410_WIRE_COLORS.L1.hex} strokeWidth="5" strokeLinecap="round" />
                <rect x="25" y="24" width="45" height="22" rx="4" fill="#1C212C" stroke={NBR5410_WIRE_COLORS.L1.hex} strokeWidth="1.2" />
                <text x="47" y="39" fill={NBR5410_WIRE_COLORS.L1.hex} fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  L1
                </text>

                {/* L2 Busbar */}
                <line x1="80" y1="60" x2="800" y2="60" stroke={NBR5410_WIRE_COLORS.L2.hex} strokeWidth="5" strokeLinecap="round" />
                <rect x="25" y="49" width="45" height="22" rx="4" fill="#1C212C" stroke={NBR5410_WIRE_COLORS.L2.hex} strokeWidth="1.2" />
                <text x="47" y="64" fill="#E2E8F0" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  L2
                </text>

                {/* L3 Busbar */}
                <line x1="80" y1="85" x2="800" y2="85" stroke={NBR5410_WIRE_COLORS.L3.hex} strokeWidth="5" strokeLinecap="round" />
                <rect x="25" y="74" width="45" height="22" rx="4" fill="#1C212C" stroke={NBR5410_WIRE_COLORS.L3.hex} strokeWidth="1.2" />
                <text x="47" y="89" fill={NBR5410_WIRE_COLORS.L3.hex} fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  L3
                </text>

                {/* Neutral (N) Busbar */}
                <line x1="80" y1="110" x2="800" y2="110" stroke={NBR5410_WIRE_COLORS.N.hex} strokeWidth="4.5" strokeLinecap="round" strokeDasharray="12,3" />
                <rect x="25" y="99" width="45" height="22" rx="4" fill="#1C212C" stroke={NBR5410_WIRE_COLORS.N.hex} strokeWidth="1.2" />
                <text x="47" y="114" fill={NBR5410_WIRE_COLORS.N.hex} fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  N
                </text>

                {/* Protective Earth (PE) Busbar */}
                <line x1="80" y1="135" x2="800" y2="135" stroke={NBR5410_WIRE_COLORS.PE.hex} strokeWidth="5" strokeLinecap="round" strokeDasharray="8,4" />
                <rect x="25" y="124" width="45" height="22" rx="4" fill="#1C212C" stroke={NBR5410_WIRE_COLORS.PE.hex} strokeWidth="1.2" />
                <text x="47" y="139" fill={NBR5410_WIRE_COLORS.PE.hex} fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  PE
                </text>
              </g>

              {/* 2. MULTIFILAR CONDUCTORS (POWER & PROTECTION PATHS) */}
              <g id="circuit_conductors">
                {circuitModel.conductors.map(c => {
                  const isSelected = selectedWire?.id === c.id;
                  const isEnergizedLive = c.isEnergized && isBreakerClosed && !isThermalTripped;

                  return (
                    <g
                      key={c.id}
                      onClick={() => setSelectedWire(c)}
                      className="cursor-pointer group"
                    >
                      {/* Interactive click target hitbox */}
                      <path
                        d={c.pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />

                      {/* Selection Glow Indicator */}
                      {isSelected && (
                        <path
                          d={c.pathD}
                          fill="none"
                          stroke="#38BDF8"
                          strokeWidth="8"
                          strokeOpacity="0.6"
                          strokeLinecap="round"
                        />
                      )}

                      {/* Base Conductor Line */}
                      <path
                        d={c.pathD}
                        fill="none"
                        stroke={isEnergizedLive ? c.colorHex : '#334155'}
                        strokeWidth={c.role === 'PE' ? '3' : '3.8'}
                        strokeLinecap="round"
                        strokeDasharray={c.role === 'PE' ? '6,3' : undefined}
                      />

                      {/* Electron Current Pulse Stream when live & simulating */}
                      {isEnergizedLive && isFlowAnimationRunning && isMotorOperating && (
                        <path
                          d={c.pathD}
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeDasharray="4,8"
                          className="multifilar-flow-active"
                          opacity="0.85"
                        />
                      )}

                      {/* Conductor Tag & Gauge in mm² Badge */}
                      <g transform={`translate(${c.labelCoord.x}, ${c.labelCoord.y})`}>
                        <rect
                          x="0"
                          y="-9"
                          width="68"
                          height="14"
                          rx="3"
                          fill="#0D1117"
                          stroke={isEnergizedLive ? c.colorHex : '#475569'}
                          strokeWidth="0.8"
                          fillOpacity="0.92"
                        />
                        <text
                          x="34"
                          y="1.5"
                          fill={isEnergizedLive ? '#F8FAFC' : '#94A3B8'}
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {c.gaugeMm2}mm² ({c.role})
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>

              {/* 3. SCHEMATIC COMPONENTS */}
              <g id="schematic_components">
                {circuitModel.components.map(comp => {
                  const isCompTripped = comp.isTripped;

                  return (
                    <g key={comp.id} transform={`translate(${comp.x}, ${comp.y})`}>
                      {/* Component Body Box */}
                      <rect
                        x="0"
                        y="0"
                        width={comp.width}
                        height={comp.height}
                        rx="6"
                        fill="#161B26"
                        stroke={isCompTripped ? '#EF4444' : comp.isEnergized ? '#F59E0B' : '#334155'}
                        strokeWidth="1.6"
                      />

                      {/* Tag Header */}
                      <rect
                        x="0"
                        y="0"
                        width={comp.width}
                        height="20"
                        rx="6"
                        fill={isCompTripped ? '#7F1D1D' : '#1F2433'}
                      />
                      <text
                        x="8"
                        y="14"
                        fill={isCompTripped ? '#FCA5A5' : '#F8FAFC'}
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {comp.tag}
                      </text>
                      <text
                        x={comp.width - 8}
                        y="14"
                        fill={isCompTripped ? '#EF4444' : comp.isEnergized ? '#10B981' : '#64748B'}
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="end"
                      >
                        {comp.stateText}
                      </text>

                      {/* Component Descriptive Name */}
                      <text
                        x="8"
                        y="34"
                        fill="#CBD5E1"
                        fontSize="8.5"
                        fontFamily="sans-serif"
                      >
                        {comp.name.length > 25 ? comp.name.substring(0, 23) + '...' : comp.name}
                      </text>

                      {/* Terminals with Standard Numbering */}
                      {comp.terminals.map(term => (
                        <g key={term.id} transform={`translate(${term.x - comp.x}, ${term.y - comp.y})`}>
                          <circle
                            cx="0"
                            cy="0"
                            r="3.5"
                            fill="#0B0D10"
                            stroke={NBR5410_WIRE_COLORS[term.role]?.hex || '#CBD5E1'}
                            strokeWidth="1.5"
                          />
                          <text
                            cx="0"
                            y={term.y - comp.y < 10 ? -5 : 10}
                            fill="#94A3B8"
                            fontSize="7.5"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {term.number}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })}
              </g>

              {/* 4. MOTOR REPRESENTATION AT BOTTOM */}
              <g transform="translate(195, 480)">
                {/* Motor Stator Circle */}
                <circle
                  cx="50"
                  cy="20"
                  r="30"
                  fill="#161B26"
                  stroke={isMotorOperating ? '#10B981' : '#334155'}
                  strokeWidth="2.5"
                />
                <text x="50" y="16" fill="#F8FAFC" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  M 3~
                </text>
                <text
                  x="50"
                  y="28"
                  fill={isMotorOperating ? '#10B981' : '#94A3B8'}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {isMotorOperating ? 'EM ROTAÇÃO' : 'PARADO'}
                </text>

                {/* PE Connection to Frame */}
                <path
                  d="M 125 -40 L 125 20 L 80 20"
                  fill="none"
                  stroke={NBR5410_WIRE_COLORS.PE.hex}
                  strokeWidth="2.5"
                  strokeDasharray="6,3"
                />
                <text x="130" y="10" fill={NBR5410_WIRE_COLORS.PE.hex} fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  PE (Carcaça Aterrada)
                </text>
              </g>

              {/* 5. 24VDC COMMAND CIRCUIT INTERLOCK ON RIGHT */}
              <g transform="translate(480, 160)">
                <rect
                  x="0"
                  y="0"
                  width="360"
                  height="340"
                  rx="8"
                  fill="#0D1117"
                  stroke="#232833"
                  strokeWidth="1.6"
                />

                {/* Title */}
                <rect x="0" y="0" width="360" height="28" rx="8" fill="#161B26" />
                <text x="15" y="18" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  CIRCUITO DE COMANDO & INTERTRAVAMENTO (24VDC)
                </text>

                {/* +24VDC Power Rail */}
                <line x1="20" y1="45" x2="340" y2="45" stroke={NBR5410_WIRE_COLORS.CMD_24V.hex} strokeWidth="2.5" />
                <text x="25" y="40" fill={NBR5410_WIRE_COLORS.CMD_24V.hex} fontSize="9" fontFamily="monospace" fontWeight="bold">
                  BARRA +24VDC (Condutor Vermelho 1.5mm²)
                </text>

                {/* Signals Table */}
                <g transform="translate(15, 60)">
                  {circuitModel.commandSignals.map((sig, idx) => {
                    const rowY = idx * 52;
                    return (
                      <g key={sig.tag} transform={`translate(0, ${rowY})`}>
                        <rect
                          x="0"
                          y="0"
                          width="330"
                          height="44"
                          rx="4"
                          fill="#131722"
                          stroke={sig.isActive ? '#10B981' : '#334155'}
                          strokeWidth="1"
                        />
                        <circle
                          cx="15"
                          cy="22"
                          r="5"
                          fill={sig.isActive ? '#10B981' : '#EF4444'}
                        />
                        <text x="28" y="18" fill="#F8FAFC" fontSize="10" fontFamily="monospace" fontWeight="bold">
                          {sig.tag} &bull; {sig.address}
                        </text>
                        <text x="28" y="32" fill="#94A3B8" fontSize="8.5" fontFamily="sans-serif">
                          {sig.name}
                        </text>
                        <text
                          x="320"
                          y="24"
                          fill={sig.isActive ? '#10B981' : '#EF4444'}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="end"
                        >
                          {sig.isActive ? '[ FECHADO ]' : '[ ABERTO ]'}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* 0VDC Ground/Return Rail */}
                <line x1="20" y1="320" x2="340" y2="320" stroke={NBR5410_WIRE_COLORS.CMD_0V.hex} strokeWidth="2.5" />
                <text x="25" y="315" fill={NBR5410_WIRE_COLORS.CMD_0V.hex} fontSize="9" fontFamily="monospace" fontWeight="bold">
                  RETORNO 0VDC (Condutor Azul-Escuro 1.5mm²)
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Right Sidebar: Normative Specification & Wire Inspection */}
        <div className="w-full lg:w-96 bg-[#11141A] border border-[#232833] rounded-xl p-4 sm:p-5 flex flex-col gap-4 text-xs font-mono select-none overflow-y-auto">
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 border-b border-[#232833]">
            <Shield className="h-4.5 w-4.5 text-emerald-400" />
            <span className="font-bold text-slate-100 text-sm">PADRÃO NORMADO NBR 5410</span>
          </div>

          {/* Wire Color Legend */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Código Oficial de Cores (Item 6.1.5.3)
            </span>

            <div className="grid grid-cols-1 gap-2">
              {/* L1 */}
              <div className="p-2.5 rounded-lg bg-[#161B26] border border-[#232833] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: NBR5410_WIRE_COLORS.L1.hex }} />
                  <div>
                    <span className="font-bold text-slate-200">Fase L1 (R):</span>
                    <span className="text-[10px] text-slate-400 block">Condutor Marrom / Âmbar</span>
                  </div>
                </div>
                <span className="text-[10px] text-amber-400 font-bold">{circuitModel.powerCableGaugeMm2} mm²</span>
              </div>

              {/* L2 */}
              <div className="p-2.5 rounded-lg bg-[#161B26] border border-[#232833] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-3.5 w-3.5 rounded-full border border-slate-600" style={{ backgroundColor: NBR5410_WIRE_COLORS.L2.hex }} />
                  <div>
                    <span className="font-bold text-slate-200">Fase L2 (S):</span>
                    <span className="text-[10px] text-slate-400 block">Condutor Preto</span>
                  </div>
                </div>
                <span className="text-[10px] text-amber-400 font-bold">{circuitModel.powerCableGaugeMm2} mm²</span>
              </div>

              {/* L3 */}
              <div className="p-2.5 rounded-lg bg-[#161B26] border border-[#232833] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: NBR5410_WIRE_COLORS.L3.hex }} />
                  <div>
                    <span className="font-bold text-slate-200">Fase L3 (T):</span>
                    <span className="text-[10px] text-slate-400 block">Condutor Cinza</span>
                  </div>
                </div>
                <span className="text-[10px] text-amber-400 font-bold">{circuitModel.powerCableGaugeMm2} mm²</span>
              </div>

              {/* Neutral */}
              <div className="p-2.5 rounded-lg bg-[#161B26] border border-[#232833] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: NBR5410_WIRE_COLORS.N.hex }} />
                  <div>
                    <span className="font-bold text-slate-200">Neutro (N):</span>
                    <span className="text-[10px] text-slate-400 block">Azul-claro exclusivo</span>
                  </div>
                </div>
                <span className="text-[10px] text-cyan-400 font-bold">{circuitModel.powerCableGaugeMm2} mm²</span>
              </div>

              {/* PE Ground */}
              <div className="p-2.5 rounded-lg bg-[#161B26] border border-[#232833] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: NBR5410_WIRE_COLORS.PE.hex }} />
                  <div>
                    <span className="font-bold text-slate-200">Proteção (PE):</span>
                    <span className="text-[10px] text-slate-400 block">Verde / Verde-Amarelo</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">{circuitModel.peCableGaugeMm2} mm² (Tab. 58)</span>
              </div>
            </div>
          </div>

          {/* PE Sizing Formula Callout */}
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
            <span className="font-bold block text-[11px]">Dimensionamento PE (Tabela 58 NBR 5410):</span>
            <p className="text-[10px] text-slate-300 mt-1">
              Como a seção da fase é <strong>{circuitModel.powerCableGaugeMm2} mm²</strong> (&le; 16 mm²), a seção mínima do condutor de terra <strong>SPE = {circuitModel.peCableGaugeMm2} mm²</strong>.
            </p>
          </div>

          {/* Wire Inspection Details on Click */}
          {selectedWire ? (
            <div className="p-3.5 rounded-lg bg-[#161B26] border border-cyan-500/40 text-slate-200 space-y-2">
              <div className="flex items-center justify-between border-b border-[#232833] pb-1.5">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  Inspeção do Condutor {selectedWire.wireTag}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                  {selectedWire.gaugeMm2} mm²
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <p>
                  <strong>Função:</strong> {selectedWire.role} ({selectedWire.voltageV}V)
                </p>
                <p>
                  <strong>Origem &rarr; Destino:</strong> {selectedWire.startLabel} &rarr; {selectedWire.endLabel}
                </p>
                <p>
                  <strong>Corrente Atual:</strong> {selectedWire.actualCurrentA.toFixed(1)} A
                </p>
                <p className="text-[10px] text-slate-400">
                  <strong>Referência:</strong> {selectedWire.normativeRef}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[#161B26] border border-[#232833] text-center text-slate-400 text-[11px]">
              Clique em qualquer condutor do diagrama para inspecionar bitola, corrente e referência normativa.
            </div>
          )}

          {/* Circuit Engineering Specs Card */}
          <div className="mt-auto pt-3 border-t border-[#232833] space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-300">
              <span>Potência Mecânica:</span>
              <span className="font-bold text-amber-400">{circuitModel.nominalPowerKw} kW ({Math.round(circuitModel.nominalPowerKw * 1.36)} cv)</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Corrente Nominal (Ib):</span>
              <span className="font-bold text-cyan-400">{circuitModel.nominalCurrentA} A</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Fator de Potência:</span>
              <span className="font-bold text-slate-200">{circuitModel.powerFactor}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Cabo de Comando:</span>
              <span className="font-bold text-red-400">{circuitModel.commandCableGaugeMm2} mm² (24VDC)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
