'use client';

import React, { useState, useMemo } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { Split, Zap, AlertTriangle, Shield, CheckCircle2, Sliders } from 'lucide-react';
import { UnifilarEngineeringEngine } from '@/lib/engineering/unifilar/unifilar-engine';
import { MultifilarSchematicRouter, MultifilarSchematicData, PhaseConductor } from '@/lib/engineering/multifilar/schematic-router';
import { CircuitSimulatorPanel } from '@/components/multifilar/CircuitSimulatorPanel';

export function MultifilarViewer() {
  const { components, connections, sharedTags, ladderRungs, toggleBreakerState } = useWorkspace();

  const simulationResult = useMemo(
    () => UnifilarEngineeringEngine.simulatePowerFlow(components, connections),
    [components, connections]
  );

  const schematicData = useMemo(
    () => MultifilarSchematicRouter.generateFullSchematic(
      components,
      connections,
      ladderRungs,
      sharedTags,
      simulationResult
    ),
    [components, connections, ladderRungs, sharedTags, simulationResult]
  );

  const [selectedCircuit, setSelectedCircuit] = useState<string>('all');

  const [view, setView] = useState<'schematic' | 'simulator'>('schematic');

  if (view === 'simulator') {
    return <CircuitSimulatorPanel onBack={() => setView('schematic')} />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] text-slate-200 select-none overflow-hidden">
      {/* Top Banner / Generator Status */}
      <div className="min-h-12 px-4 sm:px-6 py-2 bg-[#11141A] border-b border-[#232833] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Split className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-slate-100 uppercase tracking-wider">
                Gerador Multifilar Automático 1-Clique
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                L1 • L2 • L3 • N • PE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Inferência física por tipo de carga e condutores ABNT NBR 5410 item 6.1.5.3
            </p>
          </div>
        </div>

        {/* View Switcher: project schematic vs circuit simulator */}
        <div className="flex items-center gap-1 bg-[#161A22] border border-[#232833] p-1 rounded">
          <button
            type="button"
            onClick={() => setView('schematic')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
              view === 'schematic'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Esquema do Projeto
          </button>
          <button
            type="button"
            onClick={() => setView('simulator')}
            className="px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap text-slate-400 hover:text-slate-200"
          >
            Simulador de Circuitos
          </button>
        </div>

        {/* Circuit Selector Buttons */}
        <div className="flex items-center gap-1 bg-[#161A22] border border-[#232833] p-1 rounded overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedCircuit('all')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
              selectedCircuit === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos Circuitos
          </button>
          {schematicData.derivations.map((der, idx) => (
            <button
              key={der.id}
              onClick={() => setSelectedCircuit(der.id)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                selectedCircuit === der.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {der.componentTag} ({der.cableSpec.sectionMm2}mm²)
            </button>
          ))}
          {schematicData.commandCircuits.length > 0 && (
            <button
              onClick={() => setSelectedCircuit('command')}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                selectedCircuit === 'command'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Circuito Comando 24VDC
            </button>
          )}
        </div>
      </div>

      {/* Main Multifilar Visual Canvas */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-3 sm:p-6 gap-4 sm:gap-6">
        {/* Schematic SVG Renderer */}
        <div className="flex-1 min-h-[460px] bg-[#11141A] border border-[#232833] rounded-lg p-3 sm:p-6 flex flex-col relative overflow-auto shadow-inner bg-cad-grid">
          <div className="flex items-center justify-between pb-4 border-b border-[#232833]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400">
                ESQUEMA MULTIFILAR DE POTÊNCIA (3F+PE 380V)
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Esquema de Aterramento TN-S
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                L1 (Fase R)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                L2 (Fase S)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
                L3 (Fase T)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                N (Neutro)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                PE (Terra)
              </span>
            </div>
          </div>

          {/* SVG Diagram Canvas */}
          <div className="flex-1 flex items-center justify-center min-h-[500px]">
            <svg viewBox="0 0 750 480" className="w-full max-w-4xl h-auto select-none">
              {/* Busbars L1, L2, L3, N, PE at Top */}
              <g id="busbars">
                {Array.from(schematicData.busbarLayout.yPositions.entries()).map(([phase, y]) => (
                  <g key={phase}>
                    <line
                      x1={schematicData.busbarLayout.xStart}
                      y1={y}
                      x2={schematicData.busbarLayout.xEnd}
                      y2={y}
                      stroke={MultifilarSchematicRouter.getPhaseColor(phase as PhaseConductor)}
                      strokeWidth={phase === 'PE' ? 3 : 4}
                      strokeDasharray={phase === 'PE' ? '6,4' : undefined}
                    />
                    <text
                      x={schematicData.busbarLayout.xStart - 30}
                      y={y + 4}
                      fill={MultifilarSchematicRouter.getPhaseColor(phase as PhaseConductor)}
                      fontSize="12"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {phase}
                    </text>
                  </g>
                ))}
              </g>

              {/* Power Derivations */}
              {schematicData.derivations
                .filter(der => selectedCircuit === 'all' || selectedCircuit === der.id)
                .map((der, derIdx) => {
                  const comp = components.find(c => c.id === der.componentId);
                  const isEnergized = simulationResult.energizedComponentIds.has(der.componentId);
                  const nodeState = simulationResult.nodeStates.get(der.componentId);
                  
                  return (
                    <g key={der.id} id={`derivation_${der.componentId}`}>
                      {/* Vertical drops from busbars to breaker */}
                      {der.phases.map(phase => {
                        const tapPoint = der.tapPoints.get(phase);
                        if (!tapPoint) return null;
                        const targetY = derIdx * 120 + 170;
                        const pathD = `M ${tapPoint.x} ${tapPoint.y} L ${tapPoint.x} ${targetY}`;
                        return (
                          <path
                            key={phase}
                            d={pathD}
                            fill="none"
                            stroke={isEnergized ? MultifilarSchematicRouter.getPhaseColor(phase as PhaseConductor) : '#EF4444'}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                          />
                        );
                      })}
                      
                      {/* Component representation - simplified */}
                      {comp && (
                        <g transform={`translate(${comp.x}, ${comp.y})`}>
                          <rect
                            x="0"
                            y="0"
                            width={comp.width}
                            height={comp.height}
                            rx="3"
                            fill="#161A22"
                            stroke="#232833"
                            strokeWidth="1.5"
                          />
                          <text
                            x="10"
                            y="20"
                            fill="#F8FAFC"
                            fontSize="11"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {comp.tag}
                          </text>
                          <text
                            x="10"
                            y="36"
                            fill="#94A3B8"
                            fontSize="9"
                            fontFamily="monospace"
                          >
                            In={comp.nominalCurrent}A | {comp.cableCrossSection}mm²
                          </text>
                          <text
                            x="10"
                            y="48"
                            fill={isEnergized ? '#10B981' : '#EF4444'}
                            fontSize="9"
                            fontFamily="monospace"
                          >
                            {isEnergized ? '● ENERGIZADO' : '○ DESENERGIZADO'}
                          </text>
                          {nodeState && (
                            <text
                              x="10"
                              y="58"
                              fill="#06B6D4"
                              fontSize="8"
                              fontFamily="monospace"
                            >
                              ΔV: {nodeState.cumulativeVoltageDropPercent.toFixed(2)}% | Ib: {nodeState.operationalCurrentA.toFixed(1)}A
                            </text>
                          )}
                        </g>
                      )}
                    </g>
                  );
                })}
              
              {/* Motor Terminal Boxes with PE */}
              {schematicData.motorTerminalBoxes.map(mt => (
                <g key={mt.componentId} transform={`translate(${mt.terminalBox.x}, ${mt.terminalBox.y})`}>
                  <rect
                    x="0"
                    y="0"
                    width={mt.terminalBox.width}
                    height={mt.terminalBox.height}
                    rx="3"
                    fill="#0D1017"
                    stroke="#10B981"
                    strokeWidth="1.5"
                    strokeDasharray="4,2"
                  />
                  <text x="5" y="14" fill="#10B981" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    Caixa de Bornes - {mt.tag}
                  </text>
                  {Array.from(mt.terminals.entries()).map(([termId, term], idx) => (
                    <g key={termId} transform={`translate(${term.x - mt.terminalBox.x}, ${term.y - mt.terminalBox.y})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r="5"
                        fill="#10B981"
                        stroke="#FFFFFF"
                        strokeWidth="1"
                      />
                      <text
                        x="12"
                        y="4"
                        fill="#E2E8F0"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {termId} ({MultifilarSchematicRouter.getPhaseLabel(term.phase)})
                      </text>
                    </g>
                  ))}
                </g>
              ))}

              {/* Command Circuit Area */}
              {selectedCircuit === 'command' || selectedCircuit === 'all' ? (
                <g id="command_preview" transform={`translate(${MultifilarSchematicRouter.COMMAND_AREA_X}, ${MultifilarSchematicRouter.COMMAND_AREA_Y})`}>
                  <rect
                    x="0"
                    y="0"
                    width="300"
                    height="280"
                    rx="4"
                    fill="#0D1017"
                    stroke="#232833"
                    strokeWidth="1.5"
                  />
                  <text
                    x="15"
                    y="25"
                    fill="#06B6D4"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    CIRCUITO DE COMANDO 24VDC
                  </text>
                  
                  {schematicData.commandCircuits.map(cmd => (
                    <g key={cmd.id}>
                      {/* +24V Rail */}
                      <line
                        x1="20"
                        y1={cmd.rails.positive}
                        x2="280"
                        y2={cmd.rails.positive}
                        stroke="#EF4444"
                        strokeWidth="2"
                      />
                      <text
                        x="240"
                        y={cmd.rails.positive - 5}
                        fill="#EF4444"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        +24VDC
                      </text>

                      {cmd.rungs.map((rung, rungIdx) => (
                        <g key={rung.id} transform={`translate(0, ${rungIdx * 35 + 60})`}>
                          {rung.contacts.map((contact, contactIdx) => (
                            <text
                              key={contact.id}
                              x={25 + contactIdx * 60}
                              y="15"
                              fill={rung.isEnergized ? '#10B981' : '#E2E8F0'}
                              fontSize="9"
                              fontFamily="monospace"
                            >
                              {contact.type} {contact.tagName} ({contact.address})
                            </text>
                          ))}
                          {rung.coil && (
                            <text
                              x="240"
                              y="15"
                              fill={rung.coil.isEnergized ? '#10B981' : '#64748B'}
                              fontSize="9"
                              fontFamily="monospace"
                              fontWeight={rung.coil.isEnergized ? 'bold' : 'normal'}
                            >
                              {rung.coil.isEnergized ? '●' : '○'} {rung.coil.tagName} ({rung.coil.address})
                            </text>
                          )}
                        </g>
                      ))}

                      {/* 0V Rail */}
                      <line
                        x1="20"
                        y1={cmd.rails.negative}
                        x2="280"
                        y2={cmd.rails.negative}
                        stroke="#3B82F6"
                        strokeWidth="2"
                      />
                      <text
                        x="250"
                        y={cmd.rails.negative - 5}
                        fill="#3B82F6"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        0VDC
                      </text>
                    </g>
                  ))}
                </g>
              ) : null}
            </svg>
          </div>
        </div>

        {/* Sidebar Normative Specification */}
        <div className="w-full lg:w-80 bg-[#11141A] border border-[#232833] rounded-lg p-4 flex flex-col gap-4 text-xs font-mono select-none">
          <div className="flex items-center gap-2 pb-3 border-b border-[#232833]">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="font-bold text-slate-100">IDENTIFICAÇÃO DE CONDUTORES</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-2.5 rounded bg-[#161A22] border border-[#232833]">
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <span>Fases L1, L2, L3:</span>
                <span>Preto / Cinza / Marrom</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Conforme NBR 5410 item 6.1.5.3.1 - Condutores de fase.
              </p>
            </div>

            <div className="p-2.5 rounded bg-[#161A22] border border-[#232833]">
              <div className="flex items-center justify-between text-blue-400 font-bold">
                <span>Neutro (N):</span>
                <span>Azul-claro</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Uso exclusivo da cor azul-clara para qualquer condutor neutro isolado.
              </p>
            </div>

            <div className="p-2.5 rounded bg-[#161A22] border border-[#232833]">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Proteção (PE):</span>
                <span>Verde-Amarelo</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Condutor de proteção ligado à barra de terra equipotencial BEP.
              </p>
            </div>
          </div>

          {/* Quick Breaker Switch Test */}
          <div className="mt-auto pt-4 border-t border-[#232833] flex flex-col gap-2">
            <span className="text-[10px] uppercase text-slate-400 font-bold">Teste de Interrupção</span>
            {schematicData.derivations.length > 0 && (
              <>
                {schematicData.derivations.map(der => {
                  const comp = components.find(c => c.id === der.componentId);
                  if (!comp) return null;
                  const isEnergized = simulationResult.energizedComponentIds.has(der.componentId);
                  return (
                    <button
                      key={der.id}
                      onClick={() => toggleBreakerState(der.componentId)}
                      className={`w-full py-2 rounded text-xs font-bold transition-colors ${
                        isEnergized
                          ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                          : 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
                      }`}
                    >
                      {isEnergized ? `SIMULAR DISPARO ${comp.tag}` : `REARMAR ${comp.tag}`}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
