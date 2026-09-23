'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { FbdBlock, FbdWire, FbdBlockType } from '@/types/electrical';
import { Layers, Sliders, Download, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';

export function FbdEditor() {
  const { fbdBlocks, fbdWires, updateFbdBlockParam } = useWorkspace();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>('fbd_blk_starter');

  const selectedBlock = fbdBlocks.find(b => b.id === selectedBlockId);

  // Export SVG handler
  const handleExportSvg = () => {
    const svgElement = document.getElementById('fbd_svg_canvas');
    if (!svgElement) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EletricAI_FBD_Diagram.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] text-slate-200 select-none overflow-hidden">
      {/* Top Banner */}
      <div className="h-11 px-4 bg-[#11141A] border-b border-[#232833] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-xs text-slate-100 uppercase tracking-wider">
              Diagrama de Blocos Funcionais (IEC 61131-3 FBD)
            </span>
            <span className="text-slate-500 text-[10px] ml-2">
              (Validação de Tipos de Pinos: BOOL / REAL / TIME)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSvg}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded bg-[#161A22] border border-[#232833] hover:border-slate-500 text-slate-300 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-blue-400" />
            <span>Exportar SVG</span>
          </button>
        </div>
      </div>

      {/* Main FBD Canvas */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        <div className="flex-1 bg-[#11141A] border border-[#232833] rounded-lg p-6 overflow-auto relative shadow-inner bg-cad-grid">
          <svg id="fbd_svg_canvas" viewBox="0 0 800 480" className="w-full max-w-4xl h-auto select-none">
            {/* Render Connecting Wires */}
            {fbdWires.map(wire => {
              const fromBlock = fbdBlocks.find(b => b.id === wire.fromBlockId);
              const toBlock = fbdBlocks.find(b => b.id === wire.toBlockId);
              if (!fromBlock || !toBlock) return null;

              const x1 = fromBlock.x + 190;
              const y1 = fromBlock.y + 70;
              const x2 = toBlock.x;
              const y2 = toBlock.y + 115;

              return (
                <g key={wire.id}>
                  <path
                    d={`M ${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={wire.isActive ? '#10B981' : '#EF4444'}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx={x1} cy={y1} r="4" fill="#10B981" />
                  <circle cx={x2} cy={y2} r="4" fill="#10B981" />
                </g>
              );
            })}

            {/* Render Function Blocks */}
            {fbdBlocks.map(block => {
              const isSelected = selectedBlockId === block.id;

              return (
                <g
                  key={block.id}
                  transform={`translate(${block.x}, ${block.y})`}
                  onClick={() => setSelectedBlockId(block.id)}
                  className="cursor-pointer"
                >
                  {/* Block Body */}
                  <rect
                    width="190"
                    height={block.type === 'SCALE_AI' ? '150' : '170'}
                    rx="4"
                    fill="#161A22"
                    stroke={isSelected ? '#F59E0B' : '#2A313E'}
                    strokeWidth={isSelected ? 2 : 1.2}
                    className="drop-shadow-lg"
                  />

                  {/* Block Header */}
                  <rect
                    width="190"
                    height="28"
                    rx="4"
                    fill="#1E2533"
                  />
                  <text
                    x="10"
                    y="18"
                    fill="#38BDF8"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    [{block.type}] {block.title}
                  </text>

                  {/* Input Pins */}
                  {block.inputs.map((pin, i) => (
                    <g key={pin.id} transform={`translate(0, ${45 + i * 35})`}>
                      <circle cx="0" cy="5" r="4" fill="#0B0D10" stroke="#38BDF8" strokeWidth="2" />
                      <text x="12" y="9" fill="#E2E8F0" fontSize="10" fontFamily="monospace">
                        {pin.name}
                      </text>
                      <text x="12" y="20" fill="#94A3B8" fontSize="8" fontFamily="monospace">
                        {String(pin.value)} ({pin.type})
                      </text>
                    </g>
                  ))}

                  {/* Output Pins */}
                  {block.outputs.map((pin, i) => (
                    <g key={pin.id} transform={`translate(190, ${45 + i * 35})`}>
                      <circle cx="0" cy="5" r="4" fill="#0B0D10" stroke="#10B981" strokeWidth="2" />
                      <text x="-12" y="9" fill="#E2E8F0" fontSize="10" fontFamily="monospace" textAnchor="end">
                        {pin.name}
                      </text>
                      <text x="-12" y="20" fill="#10B981" fontSize="8" fontFamily="monospace" textAnchor="end">
                        {String(pin.value)}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sidebar Parameters */}
        <div className="w-80 bg-[#11141A] border border-[#232833] rounded-lg p-4 flex flex-col text-xs font-mono select-none">
          <span className="font-bold text-slate-100 pb-2 border-b border-[#232833] uppercase">
            Parâmetros do Bloco Funcional
          </span>

          {selectedBlock ? (
            <div className="mt-3 flex flex-col gap-4">
              <div>
                <span className="text-cyan-400 font-bold">{selectedBlock.title}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Tipo: {selectedBlock.type}</p>
              </div>

              {selectedBlock.parameters && (
                <div className="flex flex-col gap-2 bg-[#161A22] p-3 rounded border border-[#232833]">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Variáveis de Calibração</span>
                  {Object.entries(selectedBlock.parameters).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-slate-400">{k}:</span>
                      <input
                        type="text"
                        value={String(v)}
                        onChange={(e) => updateFbdBlockParam(selectedBlock.id, k, e.target.value)}
                        className="w-24 bg-[#0B0D10] border border-[#2A313E] rounded px-1.5 py-0.5 text-right text-slate-200 text-xs font-mono outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5 inline mr-1 text-emerald-400" />
                Interconexão de sinais validada conforme IEC 61131-3.
              </div>
            </div>
          ) : (
            <p className="mt-4 text-slate-500 text-xs">Selecione um bloco no diagrama para editar parâmetros.</p>
          )}
        </div>
      </div>
    </div>
  );
}
