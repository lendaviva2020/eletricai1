'use client';

import React from 'react';
import {
  PlcProgramConfiguration,
  PlcLadderRung,
  PlcLadderElement,
  PlcVariable,
} from '@/types/plc';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  Eye,
  AlertCircle,
  Clock,
  Hash,
  Calculator,
  MoveRight,
} from 'lucide-react';

interface LadderRungViewProps {
  rung: PlcLadderRung;
  selectedElementId: string | null;
  onSelectElement: (element: PlcLadderElement) => void;
  onToggleContactSignal: (variableName: string) => void;
  onDuplicateRung: (rungNumber: number) => void;
  onDeleteRung: (rungNumber: number) => void;
  onToggleRungEnabled: (rungNumber: number) => void;
  variables: PlcVariable[];
}

export function LadderRungView({
  rung,
  selectedElementId,
  onSelectElement,
  onToggleContactSignal,
  onDuplicateRung,
  onDeleteRung,
  onToggleRungEnabled,
  variables,
}: LadderRungViewProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Group elements into non-coil (inputs/logic) and coil (outputs/actuators)
  const logicElements = rung.elements.filter(e => e.elementType !== 'COIL');
  const coilElements = rung.elements.filter(e => e.elementType === 'COIL');

  // Group logic elements by column to support parallel branches (rows 0, 1, 2)
  const colsMap = new Map<number, PlcLadderElement[]>();
  for (const el of logicElements) {
    if (!colsMap.has(el.col)) colsMap.set(el.col, []);
    colsMap.get(el.col)!.push(el);
  }
  const colKeys = Array.from(colsMap.keys()).sort((a, b) => a - b);

  return (
    <div
      id={`rung_item_${rung.rungNumber}`}
      className={`border rounded-lg transition-colors overflow-hidden ${
        rung.isEnabled
          ? rung.isPowerFlowActive
            ? 'bg-[#0E131C] border-amber-500/40'
            : 'bg-[#10131A] border-[#232833]'
          : 'bg-[#0D0F14] border-[#1E232E] opacity-60'
      }`}
    >
      {/* Rung Header */}
      <div className="h-8 px-3 bg-[#161A22] border-b border-[#232833] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-slate-200"
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <span className="font-bold text-amber-400">
            RUNG {rung.rungNumber}:
          </span>
          <span className="font-semibold text-slate-200">{rung.title}</span>
          {!rung.isEnabled && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
              DESABILITADO
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {rung.isPowerFlowActive && (
            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              CONDUZINDO
            </span>
          )}

          <div className="h-3 w-px bg-[#232833]" />

          <button
            onClick={() => onDuplicateRung(rung.rungNumber)}
            className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-[#232833]"
            title="Duplicar Rung"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            onClick={() => onToggleRungEnabled(rung.rungNumber)}
            className={`p-1 rounded text-xs ${
              rung.isEnabled ? 'text-slate-400 hover:text-slate-200' : 'text-amber-400'
            }`}
            title={rung.isEnabled ? 'Desabilitar Rung' : 'Habilitar Rung'}
          >
            <Eye className="h-3 w-3" />
          </button>
          <button
            onClick={() => onDeleteRung(rung.rungNumber)}
            className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-[#232833]"
            title="Excluir Rung"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Rung Comment */}
      {rung.comment && !isCollapsed && (
        <div className="px-4 py-1.5 bg-[#12161F] border-b border-[#1E232E] text-[11px] text-slate-400 italic font-sans">
          {rung.comment}
        </div>
      )}

      {/* Rung Ladder Visual Conduction Path */}
      {!isCollapsed && (
        <div className="relative p-6 flex items-center justify-between min-h-[140px] select-none">
          {/* Left Power Rail (L+) */}
          <div
            className={`absolute left-4 top-0 bottom-0 w-1.5 rounded-full transition-colors ${
              rung.isEnabled
                ? 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]'
                : 'bg-slate-700'
            }`}
          />

          {/* Right Neutral Rail (M / 0V) */}
          <div className="absolute right-4 top-0 bottom-0 w-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />

          {/* Horizontal Central Power Busline */}
          <div
            className={`absolute left-4 right-4 h-0.5 transition-colors ${
              rung.isPowerFlowActive && rung.isEnabled
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                : 'bg-slate-700'
            }`}
          />

          {/* Logic Elements Area (Columns with optional Parallel Branch Rows) */}
          <div className="flex items-center gap-6 ml-6 z-10">
            {colKeys.map(colIdx => {
              const colEls = colsMap.get(colIdx) || [];
              const hasBranches = colEls.length > 1;

              return (
                <div key={colIdx} className="relative flex flex-col gap-3">
                  {/* Branch vertical rail connector if parallel contacts present (OR branch) */}
                  {hasBranches && (
                    <div className="absolute -left-3 top-4 bottom-4 w-0.5 bg-amber-400/80 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                  )}
                  {hasBranches && (
                    <div className="absolute -right-3 top-4 bottom-4 w-0.5 bg-amber-400/80 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                  )}

                  {colEls.map(el => {
                    const isSelected = el.id === selectedElementId;
                    const boundVar = variables.find(v => v.name === el.variableName);

                    return (
                      <div
                        key={el.id}
                        onClick={() => onSelectElement(el)}
                        onDoubleClick={() => onToggleContactSignal(el.variableName)}
                        className={`flex flex-col items-center justify-center p-2 rounded cursor-pointer transition-all border ${
                          isSelected
                            ? 'ring-2 ring-amber-400 border-amber-400 bg-[#1E2430]'
                            : el.isEnergized
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                            : 'bg-[#161A22] border-[#2A313E] text-slate-400 hover:border-slate-500'
                        }`}
                        title="Clique duplo para alternar sinal (Toggle State) na simulação"
                      >
                        {/* TAG & Address Header */}
                        <span className="text-[10px] font-mono font-bold text-slate-200">
                          {el.variableName}
                        </span>
                        <span className="text-[9px] font-mono text-cyan-400">
                          {el.address || boundVar?.address || 'MEM'}
                        </span>

                        {/* Visual Symbol by Type */}
                        {el.elementType === 'CONTACT' && (
                          <div className="mt-1 text-base font-mono font-bold tracking-widest text-center">
                            {el.contactType === 'CONTACT_NO' && '—[ ]—'}
                            {el.contactType === 'CONTACT_NC' && '—[/]—'}
                            {el.contactType === 'CONTACT_POS_EDGE' && '—[P]—'}
                            {el.contactType === 'CONTACT_NEG_EDGE' && '—[N]—'}
                          </div>
                        )}

                        {el.elementType === 'TIMER' && (
                          <div className="mt-1 flex flex-col items-center bg-[#0B0D10] px-2.5 py-1 rounded border border-[#2A313E]">
                            <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 font-bold">
                              <Clock className="h-3 w-3" />
                              <span>[{el.timerType}]</span>
                            </div>
                            <span className="text-[9px] text-slate-400">
                              PT: {((el.presetTimeMs ?? 5000) / 1000).toFixed(1)}s
                            </span>
                            <span className="text-[9px] text-emerald-400 font-bold">
                              ET: {((el.elapsedTimeMs ?? 0) / 1000).toFixed(1)}s
                            </span>
                          </div>
                        )}

                        {el.elementType === 'COUNTER' && (
                          <div className="mt-1 flex flex-col items-center bg-[#0B0D10] px-2.5 py-1 rounded border border-[#2A313E]">
                            <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 font-bold">
                              <Hash className="h-3 w-3" />
                              <span>[{el.counterType}]</span>
                            </div>
                            <span className="text-[9px] text-slate-400">PV: {el.counterPresetPv ?? 10}</span>
                            <span className="text-[9px] text-cyan-300 font-bold">CV: {el.counterCurrentCv ?? 0}</span>
                          </div>
                        )}

                        {el.elementType === 'COMPARE' && (
                          <div className="mt-1 flex flex-col items-center bg-[#0B0D10] px-2 py-0.5 rounded border border-[#2A313E]">
                            <span className="text-[10px] font-bold text-amber-300">
                              CMP {el.compareOp === 'GT' ? '>' : el.compareOp === 'LT' ? '<' : el.compareOp}
                            </span>
                            <span className="text-[9px] text-slate-400">Ref: {Number(el.in2Value ?? 0)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Right Coils Area */}
          <div className="flex items-center gap-4 mr-6 z-10">
            {coilElements.map(cEl => {
              const isSelected = cEl.id === selectedElementId;
              const boundVar = variables.find(v => v.name === cEl.variableName);

              return (
                <div
                  key={cEl.id}
                  onClick={() => onSelectElement(cEl)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded cursor-pointer transition-all border ${
                    isSelected
                      ? 'ring-2 ring-emerald-400 border-emerald-400 bg-[#1E2430]'
                      : cEl.isEnergized
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'bg-[#161A22] border-[#2A313E] text-slate-500 hover:border-slate-500'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-slate-200">
                    {cEl.variableName}
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400">
                    {cEl.address || boundVar?.address || 'OUT'}
                  </span>

                  <div className="mt-1 text-base font-mono font-bold tracking-widest text-center">
                    {cEl.coilType === 'COIL_NORMAL' && `—( ${cEl.isEnergized ? '●' : ' '} )—`}
                    {cEl.coilType === 'COIL_NEGATED' && `—(/ ${cEl.isEnergized ? '●' : ' '} )—`}
                    {cEl.coilType === 'COIL_SET' && `—(S ${cEl.isEnergized ? '●' : ' '} )—`}
                    {cEl.coilType === 'COIL_RESET' && `—(R ${cEl.isEnergized ? '●' : ' '} )—`}
                    {cEl.coilType === 'COIL_POS_EDGE' && `—(P ${cEl.isEnergized ? '●' : ' '} )—`}
                    {cEl.coilType === 'COIL_NEG_EDGE' && `—(N ${cEl.isEnergized ? '●' : ' '} )—`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
