'use client';

import React from 'react';
import {
  PlcProgramConfiguration,
  PlcVariable,
  IoModuleConfig,
  IoChannelConfig,
} from '@/types/plc';
import {
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sliders,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface HardwareIoViewProps {
  program: PlcProgramConfiguration;
  onUpdateChannelState: (channelId: string, state: boolean | number) => void;
  onUpdateChannelTag: (channelId: string, tag: string) => void;
}

export function HardwareIoView({
  program,
  onUpdateChannelState,
  onUpdateChannelTag,
}: HardwareIoViewProps) {
  const [selectedSlotNumber, setSelectedSlotNumber] = React.useState<number>(2);

  const selectedModule = program.rack.modules.find(m => m.slotNumber === selectedSlotNumber);

  return (
    <div className="flex-1 flex bg-[#11141A] text-slate-200 font-mono text-xs overflow-hidden">
      {/* Rack Slots Overview Column */}
      <div className="w-72 border-r border-[#232833] flex flex-col h-full bg-[#141820]">
        <div className="p-3 border-b border-[#232833] bg-[#161A22] flex items-center justify-between">
          <span className="font-bold text-slate-100 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            Chassi / Rack CLP
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">192.168.10.20</span>
        </div>

        <div className="p-3 space-y-2 overflow-y-auto">
          {program.rack.modules.map(mod => {
            const isSelected = mod.slotNumber === selectedSlotNumber;
            return (
              <div
                key={mod.id}
                onClick={() => setSelectedSlotNumber(mod.slotNumber)}
                className={`p-2.5 rounded border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-500/15 border-blue-400 text-blue-200 shadow-md'
                    : 'bg-[#181C26] border-[#232833] hover:border-slate-500 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Slot #{mod.slotNumber}
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-[#0B0D10] text-cyan-400 font-bold">
                    {mod.type}
                  </span>
                </div>
                <div className="font-bold text-slate-100 mt-1 truncate">{mod.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{mod.catalogNumber}</div>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Canais: {mod.channels.length}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Online
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Module Channels Mapping Table */}
      <div className="flex-1 flex flex-col h-full bg-[#11141A]">
        {selectedModule ? (
          <>
            <div className="h-11 px-4 bg-[#161A22] border-b border-[#232833] flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-100 text-xs">
                  Slot #{selectedModule.slotNumber}: {selectedModule.name}
                </span>
                <span className="text-slate-500 text-[10px] ml-2 font-mono">
                  [{selectedModule.catalogNumber}]
                </span>
              </div>
              <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                Mapeamento IEC 61131-3
              </span>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {selectedModule.channels.length === 0 ? (
                <div className="text-slate-500 p-8 text-center">
                  Este módulo não possui canais de I/O discretos (módulo de sistema/CPU).
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#232833] text-slate-500 text-[10px] uppercase">
                      <th className="pb-2">Canal</th>
                      <th className="pb-2">Endereço IEC</th>
                      <th className="pb-2">Tipo</th>
                      <th className="pb-2">TAG Mapeada</th>
                      <th className="pb-2">Estado Físico / Simulado</th>
                      <th className="pb-2">Descrição Funcional</th>
                      <th className="pb-2 text-right">Controle Simulação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedModule.channels.map(ch => (
                      <tr key={ch.id} className="border-b border-[#1E2430] hover:bg-[#161A22] text-[11px]">
                        <td className="py-2 text-slate-400 font-bold">{ch.name}</td>
                        <td className="py-2 font-bold text-cyan-400">{ch.address}</td>
                        <td className="py-2 text-amber-400">{ch.type}</td>
                        <td className="py-2 font-bold text-slate-200">
                          {ch.tag || <span className="text-slate-600 italic">Livre</span>}
                        </td>
                        <td className="py-2">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              ch.state
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-[#0B0D10] text-slate-500 border border-[#232833]'
                            }`}
                          >
                            {String(ch.state)} {ch.unit || ''}
                          </span>
                        </td>
                        <td className="py-2 text-slate-400">{ch.description || 'Canal I/O'}</td>
                        <td className="py-2 text-right">
                          {typeof ch.state === 'boolean' && (
                            <button
                              onClick={() => onUpdateChannelState(ch.id, !ch.state)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                                ch.state
                                  ? 'bg-amber-500 text-black hover:bg-amber-400'
                                  : 'bg-[#232833] text-slate-300 hover:bg-[#2E3747]'
                              }`}
                            >
                              Alternar Sinal
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Selecione um slot de hardware à esquerda.
          </div>
        )}
      </div>
    </div>
  );
}
