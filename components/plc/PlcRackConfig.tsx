'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { PlcSlot } from '@/types/electrical';
import {
  Cpu,
  Download,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Network,
  Binary,
  Layers,
} from 'lucide-react';

export function PlcRackConfig() {
  const { plcRack, updatePlcSlot, sharedTags, downloadPlcopenXml } = useWorkspace();
  const [selectedSlotNumber, setSelectedSlotNumber] = useState<number>(2);

  const selectedSlot = plcRack.slots.find(s => s.slotNumber === selectedSlotNumber);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] text-slate-200 select-none overflow-hidden">
      {/* Top Banner */}
      <div className="h-12 px-6 bg-[#11141A] border-b border-[#232833] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-slate-100 uppercase tracking-wider">
                Configuração de Hardware & Rack CLP (IEC 61131-3)
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                {plcRack.chassisName}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              IP: {plcRack.ipAddress} | Ciclo de Varredura: {plcRack.cycleTimeMs} ms | Formato: PLCopen XML
            </p>
          </div>
        </div>

        {/* Action Button: Download PLCopen XML */}
        <button
          onClick={downloadPlcopenXml}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-[0_0_12px_rgba(168,85,247,0.3)]"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Exportar PLCopen XML</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Visual Rack Hardware View */}
        <div className="flex-1 bg-[#11141A] border border-[#232833] rounded-lg p-6 flex flex-col justify-between relative shadow-inner bg-cad-grid">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#232833]">
              <span className="text-xs font-mono font-bold text-slate-200">
                CHASSIS MODULAR DIN 8 SLOTS (RACK INDUSTRIAL)
              </span>
              <span className="text-emerald-400 text-xs font-mono flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Slots 100% Compatíveis
              </span>
            </div>

            {/* Render Hardware Slots */}
            <div className="grid grid-cols-7 gap-3 mt-6">
              {plcRack.slots.map(slot => {
                const isSelected = selectedSlotNumber === slot.slotNumber;

                return (
                  <button
                    key={slot.slotNumber}
                    onClick={() => setSelectedSlotNumber(slot.slotNumber)}
                    className={`flex flex-col rounded border p-3 min-h-[300px] text-left transition-all relative ${
                      isSelected
                        ? 'bg-[#1F2633] border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                        : 'bg-[#161A22] border-[#2A313E] hover:border-slate-500'
                    }`}
                  >
                    {/* Slot Header Label */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#2A313E] w-full text-[10px] font-mono">
                      <span className="font-bold text-purple-400">SLOT {slot.slotNumber}</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    </div>

                    {/* Module Graphic Simulation */}
                    <div className="flex-1 flex flex-col justify-between py-4">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-slate-100 block">
                          {slot.moduleType}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono line-clamp-2 mt-1">
                          {slot.name}
                        </span>
                        <span className="text-[9px] text-purple-300 font-mono mt-1 block">
                          {slot.partNumber}
                        </span>
                      </div>

                      {/* LED status indicators */}
                      <div className="flex flex-col gap-1 py-2 border-y border-[#232833] text-[9px] font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">RUN:</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">BUS:</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </div>
                      </div>

                      {/* Address Range Badge */}
                      <div className="text-[10px] font-mono text-cyan-400 bg-[#0B0D10] p-1.5 rounded border border-[#232833] text-center">
                        {slot.startAddress} .. {slot.endAddress}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bus Bar Rail Visual */}
          <div className="h-3 w-full bg-gradient-to-r from-purple-500/20 via-slate-600 to-purple-500/20 rounded-full border border-[#232833]" />
        </div>

        {/* Sidebar: Slot Details & Automatic I/O Mapping */}
        <div className="w-84 bg-[#11141A] border border-[#232833] rounded-lg p-4 flex flex-col text-xs font-mono select-none">
          <span className="font-bold text-slate-100 pb-2 border-b border-[#232833] uppercase">
            Mapeamento de Endereços I/O
          </span>

          {selectedSlot ? (
            <div className="mt-3 flex flex-col gap-3">
              <div className="bg-[#161A22] p-3 rounded border border-[#232833] flex flex-col gap-1">
                <span className="text-purple-400 font-bold">SLOT {selectedSlot.slotNumber}: {selectedSlot.moduleType}</span>
                <span className="text-slate-300">{selectedSlot.name}</span>
                <span className="text-slate-500 text-[10px]">{selectedSlot.partNumber}</span>
                <span className="text-cyan-400 text-[10px] mt-1">
                  Faixa de I/O: {selectedSlot.startAddress} até {selectedSlot.endAddress} ({selectedSlot.channelCount} canais)
                </span>
              </div>

              {/* Tag Binding List */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Tags Vinculadas</span>
                <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
                  {selectedSlot.mappedTags.length > 0 ? (
                    selectedSlot.mappedTags.map(tagName => {
                      const tag = sharedTags.find(t => t.name === tagName);
                      return (
                        <div
                          key={tagName}
                          className="p-2 rounded bg-[#0D1017] border border-[#232833] flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-200 block">{tagName}</span>
                            <span className="text-cyan-400 text-[10px]">{tag?.address || '-'}</span>
                          </div>
                          <span className="text-amber-400 font-bold text-[10px]">
                            {tag ? String(tag.currentValue) : '-'}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-slate-500 text-xs italic">Nenhuma tag alocada neste slot.</span>
                  )}
                </div>
              </div>

              {/* Normative Validation */}
              <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-[10px] mt-auto">
                Isolamento galvânico 500VDC conforme IEC 61131-2. Compatível com protocolo CLPopen XML.
              </div>
            </div>
          ) : (
            <p className="mt-4 text-slate-500 text-xs">Selecione um slot para ver os canais.</p>
          )}
        </div>
      </div>
    </div>
  );
}
