'use client';

import React from 'react';
import {
  PlcLadderElement,
  PlcVariable,
  IecDataType,
  LadderContactType,
  LadderCoilType,
  LadderTimerType,
  LadderCounterType,
  LadderCompareOperator,
  LadderMathOperator,
} from '@/types/plc';
import {
  Sliders,
  Tag,
  Shield,
  Clock,
  Hash,
  Calculator,
  Lock,
  Zap,
  Trash2,
  Copy,
} from 'lucide-react';

interface ElementPropertiesProps {
  element: PlcLadderElement | null;
  variables: PlcVariable[];
  onUpdateElement: (updated: Partial<PlcLadderElement>) => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
  isSimulationActive: boolean;
  onToggleForce: (varName: string, val: boolean | number) => void;
}

export function ElementProperties({
  element,
  variables,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  isSimulationActive,
  onToggleForce,
}: ElementPropertiesProps) {
  if (!element) {
    return (
      <div className="w-72 bg-[#11141A] border-l border-[#232833] flex flex-col h-full text-xs font-mono select-none p-4 text-slate-500 justify-center items-center text-center">
        <Sliders className="h-8 w-8 mb-2 opacity-30 text-slate-400" />
        <span className="font-bold text-slate-400">Nenhum elemento selecionado</span>
        <span className="text-[11px] mt-1 text-slate-600">
          Selecione um contato, bobina, timer ou bloco no canvas para inspecionar parâmetros técnicos.
        </span>
      </div>
    );
  }

  const boundVariable = variables.find(v => v.name === element.variableName);

  return (
    <div className="w-80 bg-[#11141A] border-l border-[#232833] flex flex-col h-full text-xs font-mono select-none overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-[#232833] bg-[#161A22] flex items-center justify-between">
        <span className="font-bold text-slate-100 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
          <Sliders className="h-3.5 w-3.5 text-amber-400" />
          Propriedades IEC
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicateElement}
            className="p-1 hover:text-amber-400 text-slate-400 rounded hover:bg-[#232833]"
            title="Duplicar elemento"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDeleteElement}
            className="p-1 hover:text-red-400 text-slate-400 rounded hover:bg-[#232833]"
            title="Excluir elemento"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-4">
        {/* Element Type & Subtype */}
        <div className="p-2.5 rounded bg-[#161A22] border border-[#232833] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Tipo Base:</span>
            <span className="font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px]">
              {element.elementType}
            </span>
          </div>

          {element.elementType === 'CONTACT' && (
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Subtipo de Contato:</label>
              <select
                value={element.contactType || 'CONTACT_NO'}
                onChange={e => onUpdateElement({ contactType: e.target.value as LadderContactType })}
                className="w-full bg-[#0B0D10] border border-[#232833] rounded px-2 py-1 text-slate-200 text-xs focus:border-amber-500 outline-none"
              >
                <option value="CONTACT_NO">Normal Aberto —[ ]—</option>
                <option value="CONTACT_NC">Normal Fechado —[/]—</option>
                <option value="CONTACT_POS_EDGE">Borda Positiva —[P]—</option>
                <option value="CONTACT_NEG_EDGE">Borda Negativa —[N]—</option>
              </select>
            </div>
          )}

          {element.elementType === 'COIL' && (
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Subtipo de Bobina:</label>
              <select
                value={element.coilType || 'COIL_NORMAL'}
                onChange={e => onUpdateElement({ coilType: e.target.value as LadderCoilType })}
                className="w-full bg-[#0B0D10] border border-[#232833] rounded px-2 py-1 text-slate-200 text-xs focus:border-amber-500 outline-none"
              >
                <option value="COIL_NORMAL">Bobina Normal —( )—</option>
                <option value="COIL_NEGATED">Bobina Negada —(/)—</option>
                <option value="COIL_SET">Bobina Set (Latch) —(S)—</option>
                <option value="COIL_RESET">Bobina Reset (Desarme) —(R)—</option>
                <option value="COIL_POS_EDGE">Borda Positiva —(P)—</option>
                <option value="COIL_NEG_EDGE">Borda Negativa —(N)—</option>
              </select>
            </div>
          )}
        </div>

        {/* Variable Binding (TAG) */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Tag className="h-3 w-3 text-cyan-400" />
            TAG Associada:
          </label>
          <select
            value={element.variableName}
            onChange={e => {
              const selectedVar = variables.find(v => v.name === e.target.value);
              onUpdateElement({
                variableName: e.target.value,
                address: selectedVar?.address || '',
              });
            }}
            className="w-full bg-[#161A22] border border-[#232833] rounded px-2 py-1.5 text-slate-200 text-xs focus:border-cyan-500 outline-none font-bold"
          >
            {variables.map(v => (
              <option key={v.id} value={v.name}>
                {v.name} ({v.dataType} - {v.address || 'Interno'})
              </option>
            ))}
          </select>

          {boundVariable && (
            <div className="mt-2 p-2 rounded bg-[#0B0D10] border border-[#232833] space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Endereço IEC:</span>
                <span className="text-cyan-400 font-bold">{boundVariable.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tipo:</span>
                <span className="text-amber-400">{boundVariable.dataType}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Valor Atual:</span>
                <span className={`font-bold ${boundVariable.currentValue ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {String(boundVariable.currentValue)}
                </span>
              </div>
              {boundVariable.comment && (
                <p className="text-[10px] text-slate-500 italic mt-1 border-t border-[#1E2430] pt-1">
                  {boundVariable.comment}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Timer Block Settings */}
        {element.elementType === 'TIMER' && (
          <div className="p-2.5 rounded bg-[#161A22] border border-[#232833] space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Clock className="h-3.5 w-3.5" />
              <span>Parâmetros do Timer {element.timerType}</span>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Preset Time PT (ms):</label>
              <input
                type="number"
                value={element.presetTimeMs ?? 5000}
                onChange={e => onUpdateElement({ presetTimeMs: Number(e.target.value) })}
                step={500}
                className="w-full bg-[#0B0D10] border border-[#232833] rounded px-2 py-1 text-slate-200 text-xs focus:border-amber-500 outline-none"
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Elapsed Time ET:</span>
              <span className="text-emerald-400 font-bold">
                {((element.elapsedTimeMs ?? 0) / 1000).toFixed(2)}s
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Saída Q:</span>
              <span className={`font-bold ${element.timerQ ? 'text-emerald-400' : 'text-slate-500'}`}>
                {element.timerQ ? 'TRUE' : 'FALSE'}
              </span>
            </div>
          </div>
        )}

        {/* Counter Block Settings */}
        {element.elementType === 'COUNTER' && (
          <div className="p-2.5 rounded bg-[#161A22] border border-[#232833] space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Hash className="h-3.5 w-3.5" />
              <span>Parâmetros do Contador {element.counterType}</span>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Preset Value PV:</label>
              <input
                type="number"
                value={element.counterPresetPv ?? 10}
                onChange={e => onUpdateElement({ counterPresetPv: Number(e.target.value) })}
                className="w-full bg-[#0B0D10] border border-[#232833] rounded px-2 py-1 text-slate-200 text-xs focus:border-cyan-500 outline-none"
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Valor Atual CV:</span>
              <span className="text-cyan-400 font-bold">{element.counterCurrentCv ?? 0}</span>
            </div>
          </div>
        )}

        {/* Compare / Math Block Settings */}
        {element.elementType === 'COMPARE' && (
          <div className="p-2.5 rounded bg-[#161A22] border border-[#232833] space-y-2">
            <label className="text-[10px] text-slate-400 block mb-0.5">Operador de Comparação:</label>
            <select
              value={element.compareOp || 'EQ'}
              onChange={e => onUpdateElement({ compareOp: e.target.value as LadderCompareOperator })}
              className="w-full bg-[#0B0D10] border border-[#232833] rounded px-2 py-1 text-slate-200 text-xs focus:border-amber-500 outline-none"
            >
              <option value="EQ">Igual (=)</option>
              <option value="NE">Diferente (&lt;&gt;)</option>
              <option value="GT">Maior que (&gt;)</option>
              <option value="LT">Menor que (&lt;)</option>
              <option value="GE">Maior ou Igual (&gt;=)</option>
              <option value="LE">Menor ou Igual (&lt;=)</option>
            </select>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Valor Comparado (IN2):</label>
              <input
                type="number"
                value={Number(element.in2Value ?? 0)}
                onChange={e => onUpdateElement({ in2Value: Number(e.target.value) })}
                className="w-full bg-[#0B0D10] border border-[#232833] rounded px-2 py-1 text-slate-200 text-xs focus:border-amber-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Force / Debugging Actions */}
        {boundVariable && (
          <div className="p-2.5 rounded bg-[#161A22] border border-[#232833] space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                Forçar Variável
              </span>
              <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${boundVariable.isForced ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-500'}`}>
                {boundVariable.isForced ? 'FORÇADA' : 'LIVRE'}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onToggleForce(boundVariable.name, true)}
                className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${
                  boundVariable.isForced && boundVariable.forcedValue === true
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#232833] text-amber-400 hover:bg-[#2C3342]'
                }`}
              >
                Forçar TRUE
              </button>
              <button
                onClick={() => onToggleForce(boundVariable.name, false)}
                className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${
                  boundVariable.isForced && boundVariable.forcedValue === false
                    ? 'bg-red-500 text-white'
                    : 'bg-[#232833] text-red-400 hover:bg-[#2C3342]'
                }`}
              >
                Forçar FALSE
              </button>
            </div>
          </div>
        )}

        {/* Comment field */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Comentário Técnico:</label>
          <textarea
            value={element.comment || ''}
            onChange={e => onUpdateElement({ comment: e.target.value })}
            placeholder="Documentação de engenharia..."
            rows={2}
            className="w-full bg-[#161A22] border border-[#232833] rounded p-2 text-slate-200 text-xs focus:border-amber-500 outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
}
