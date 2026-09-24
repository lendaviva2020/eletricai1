'use client';

import React from 'react';
import {
  PlcLadderElement,
  PlcLadderElementType,
  LadderContactType,
  LadderCoilType,
  LadderTimerType,
  LadderCounterType,
  LadderCompareOperator,
  LadderMathOperator,
} from '@/types/plc';
import {
  MousePointer,
  Maximize2,
  Clock,
  Layers,
  ArrowRightLeft,
  Calculator,
  Plus,
  Play,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Hash,
} from 'lucide-react';

interface ElementPaletteProps {
  onInsertElement: (
    elementType: PlcLadderElementType,
    subType?: string,
    variableName?: string
  ) => void;
  availableVariables: string[];
}

export function ElementPalette({
  onInsertElement,
  availableVariables,
}: ElementPaletteProps) {
  return (
    <div className="w-56 bg-[#11141A] border-r border-[#232833] flex flex-col h-full text-xs font-mono select-none overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-[#232833] bg-[#161A22] flex items-center justify-between">
        <span className="font-bold text-slate-100 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
          <Layers className="h-3.5 w-3.5 text-amber-400" />
          Elementos IEC
        </span>
        <span className="text-[10px] text-slate-500">61131-3</span>
      </div>

      <div className="p-2 space-y-4">
        {/* Contacts Category */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 block mb-1.5">
            Contatos Digitais
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onInsertElement('CONTACT', 'CONTACT_NO')}
              className="flex flex-col items-center justify-center p-2 rounded bg-[#161A22] border border-[#232833] hover:border-amber-500/50 hover:bg-[#1E2430] text-slate-200 transition-colors group"
              title="Contato Normal Aberto —[ ]—"
            >
              <span className="font-bold text-amber-400 text-sm group-hover:scale-110 transition-transform">
                —[ ]—
              </span>
              <span className="text-[9px] text-slate-400 mt-1">NO (NA)</span>
            </button>

            <button
              onClick={() => onInsertElement('CONTACT', 'CONTACT_NC')}
              className="flex flex-col items-center justify-center p-2 rounded bg-[#161A22] border border-[#232833] hover:border-cyan-500/50 hover:bg-[#1E2430] text-slate-200 transition-colors group"
              title="Contato Normal Fechado —[/]—"
            >
              <span className="font-bold text-cyan-400 text-sm group-hover:scale-110 transition-transform">
                —[/]—
              </span>
              <span className="text-[9px] text-slate-400 mt-1">NC (NF)</span>
            </button>

            <button
              onClick={() => onInsertElement('CONTACT', 'CONTACT_POS_EDGE')}
              className="flex flex-col items-center justify-center p-2 rounded bg-[#161A22] border border-[#232833] hover:border-emerald-500/50 hover:bg-[#1E2430] text-slate-200 transition-colors group"
              title="Transição Positiva de Borda —[P]—"
            >
              <span className="font-bold text-emerald-400 text-xs group-hover:scale-110 transition-transform">
                —[P]—
              </span>
              <span className="text-[9px] text-slate-400 mt-1">Borda +</span>
            </button>

            <button
              onClick={() => onInsertElement('CONTACT', 'CONTACT_NEG_EDGE')}
              className="flex flex-col items-center justify-center p-2 rounded bg-[#161A22] border border-[#232833] hover:border-orange-500/50 hover:bg-[#1E2430] text-slate-200 transition-colors group"
              title="Transição Negativa de Borda —[N]—"
            >
              <span className="font-bold text-orange-400 text-xs group-hover:scale-110 transition-transform">
                —[N]—
              </span>
              <span className="text-[9px] text-slate-400 mt-1">Borda -</span>
            </button>
          </div>
        </div>

        {/* Coils Category */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 block mb-1.5">
            Bobinas & Saídas
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onInsertElement('COIL', 'COIL_NORMAL')}
              className="flex flex-col items-center justify-center p-2 rounded bg-[#161A22] border border-[#232833] hover:border-emerald-500/50 hover:bg-[#1E2430] text-slate-200 transition-colors group"
              title="Bobina Normal —( )—"
            >
              <span className="font-bold text-emerald-400 text-sm group-hover:scale-110 transition-transform">
                —( )—
              </span>
              <span className="text-[9px] text-slate-400 mt-1">Normal</span>
            </button>

            <button
              onClick={() => onInsertElement('COIL', 'COIL_NEGATED')}
              className="flex flex-col items-center justify-center p-2 rounded bg-[#161A22] border border-[#232833] hover:border-rose-500/50 hover:bg-[#1E2430] text-slate-200 transition-colors group"
              title="Bobina Negada —(/)—"
            >
              <span className="font-bold text-rose-400 text-sm group-hover:scale-110 transition-transform">
                —(/)—
              </span>
              <span className="text-[9px] text-slate-400 mt-1">Negada</span>
            </button>

            <button
              onClick={() => onInsertElement('COIL', 'COIL_SET')}
              className="flex flex-col items-center justify-center p-2 rounded bg-[#161A22] border border-[#232833] hover:border-amber-500/50 hover:bg-[#1E2430] text-slate-200 transition-colors group"
              title="Bobina Set Retentiva —(S)—"
            >
              <span className="font-bold text-amber-400 text-xs group-hover:scale-110 transition-transform">
                —(S)—
              </span>
              <span className="text-[9px] text-slate-400 mt-1">SET Latch</span>
            </button>

            <button
              onClick={() => onInsertElement('COIL', 'COIL_RESET')}
              className="flex flex-col items-center justify-center p-2 rounded bg-[#161A22] border border-[#232833] hover:border-blue-500/50 hover:bg-[#1E2430] text-slate-200 transition-colors group"
              title="Bobina Reset Desarme —(R)—"
            >
              <span className="font-bold text-blue-400 text-xs group-hover:scale-110 transition-transform">
                —(R)—
              </span>
              <span className="text-[9px] text-slate-400 mt-1">RESET</span>
            </button>
          </div>
        </div>

        {/* Timers & Counters */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 block mb-1.5">
            Temporizadores & Contadores
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onInsertElement('TIMER', 'TON')}
              className="flex items-center gap-1.5 p-2 rounded bg-[#161A22] border border-[#232833] hover:border-amber-500/50 hover:bg-[#1E2430] text-slate-200 transition-colors"
              title="Temporizador On-Delay TON"
            >
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-bold text-[11px]">TON</span>
            </button>

            <button
              onClick={() => onInsertElement('TIMER', 'TOF')}
              className="flex items-center gap-1.5 p-2 rounded bg-[#161A22] border border-[#232833] hover:border-amber-500/50 hover:bg-[#1E2430] text-slate-200 transition-colors"
              title="Temporizador Off-Delay TOF"
            >
              <Clock className="h-3.5 w-3.5 text-blue-400" />
              <span className="font-bold text-[11px]">TOF</span>
            </button>

            <button
              onClick={() => onInsertElement('TIMER', 'TP')}
              className="flex items-center gap-1.5 p-2 rounded bg-[#161A22] border border-[#232833] hover:border-amber-500/50 hover:bg-[#1E2430] text-slate-200 transition-colors"
              title="Temporizador de Pulso TP"
            >
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-bold text-[11px]">TP</span>
            </button>

            <button
              onClick={() => onInsertElement('COUNTER', 'CTU')}
              className="flex items-center gap-1.5 p-2 rounded bg-[#161A22] border border-[#232833] hover:border-amber-500/50 hover:bg-[#1E2430] text-slate-200 transition-colors"
              title="Contador Crescente CTU"
            >
              <Hash className="h-3.5 w-3.5 text-cyan-400" />
              <span className="font-bold text-[11px]">CTU</span>
            </button>

            <button
              onClick={() => onInsertElement('COUNTER', 'CTD')}
              className="flex items-center gap-1.5 p-2 rounded bg-[#161A22] border border-[#232833] hover:border-amber-500/50 hover:bg-[#1E2430] text-slate-200 transition-colors"
              title="Contador Decrescente CTD"
            >
              <Hash className="h-3.5 w-3.5 text-cyan-400" />
              <span className="font-bold text-[11px]">CTD</span>
            </button>

            <button
              onClick={() => onInsertElement('COUNTER', 'CTUD')}
              className="flex items-center gap-1.5 p-2 rounded bg-[#161A22] border border-[#232833] hover:border-amber-500/50 hover:bg-[#1E2430] text-slate-200 transition-colors"
              title="Contador Bidirecional CTUD"
            >
              <Hash className="h-3.5 w-3.5 text-purple-400" />
              <span className="font-bold text-[11px]">CTUD</span>
            </button>
          </div>
        </div>

        {/* Comparators & Math */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 block mb-1.5">
            Comparação & Matemática
          </span>
          <div className="grid grid-cols-3 gap-1">
            {(['EQ', 'NE', 'GT', 'LT', 'GE', 'LE'] as LadderCompareOperator[]).map(op => (
              <button
                key={op}
                onClick={() => onInsertElement('COMPARE', op)}
                className="p-1.5 text-center rounded bg-[#161A22] border border-[#232833] hover:border-amber-500/40 text-[10px] text-amber-300 font-bold hover:bg-[#1E2430]"
              >
                {op === 'EQ' ? '=' : op === 'NE' ? '<>' : op === 'GT' ? '>' : op === 'LT' ? '<' : op === 'GE' ? '>=' : '<='}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {(['ADD', 'SUB', 'MUL', 'DIV', 'MOD', 'LIMIT'] as LadderMathOperator[]).map(mOp => (
              <button
                key={mOp}
                onClick={() => onInsertElement('MATH', mOp)}
                className="flex items-center justify-center p-1 rounded bg-[#161A22] border border-[#232833] hover:border-emerald-500/40 text-[10px] text-slate-300 hover:text-emerald-400 hover:bg-[#1E2430]"
              >
                {mOp}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
