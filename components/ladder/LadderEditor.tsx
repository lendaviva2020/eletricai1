'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { LadderRung, LadderElement, LadderElementType } from '@/types/electrical';
import {
  Play,
  Plus,
  Binary,
  Code2,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
} from 'lucide-react';

export function LadderEditor() {
  const {
    ladderRungs,
    toggleLadderContact,
    addLadderRung,
    sharedTags,
    updateTagValue,
  } = useWorkspace();

  const [activeSubTab, setActiveSubTab] = useState<'visual' | 'st_code' | 'il_code'>('visual');
  const [selectedElement, setSelectedElement] = useState<{ rungId: string; element: LadderElement } | null>(null);

  // Generate Structured Text (ST) IEC 61131-3 code
  const generateStCode = () => {
    return `(* ==========================================================
   PROGRAMA PRINCIPAL IEC 61131-3: ELETRICAI
   PROJETO: CCM-01 PLANTA DE MOAGEM E COMPRESSAO
   DATA: ${new Date().toLocaleDateString('pt-BR')}
   PADRAO: IEC 61131-3 / PLCOPEN XML COMPLIANT
========================================================== *)

PROGRAM Main_Control_Logic
VAR
    BTN_EMERGENCIA      AT %I0.0 : BOOL; (* Botao Cogumelo NR-10 *)
    FT01_TERMIC_COMP    AT %I0.1 : BOOL; (* Rele Termico 95-96 *)
    BTN_PARTIDA_COMP    AT %I0.2 : BOOL; (* Botoeira Liga *)
    BTN_PARADA_COMP     AT %I0.3 : BOOL; (* Botoeira Desliga *)
    Q01_GERAL           AT %Q0.0 : BOOL; (* Disjuntor Geral 630A *)
    KM01_COMPRESSOR     AT %Q0.2 : BOOL; (* Contator Principal *)
    KM02_ESTRELA        AT %Q0.3 : BOOL; (* Partida Y *)
    KM03_TRIANGULO      AT %Q0.4 : BOOL; (* Regime Triangulo *)
    LAMP_ALARME_FALHA   AT %Q0.7 : BOOL; (* Baliza Alarme *)
    
    TON_Partida_YD      : TON;           (* Temporizador IEC *)
END_VAR

// NETWORK 0: Intertravamento de Seguranca NR-10 / NR-12
IF BTN_EMERGENCIA AND FT01_TERMIC_COMP THEN
    Q01_GERAL := TRUE;
    LAMP_ALARME_FALHA := FALSE;
ELSE
    Q01_GERAL := FALSE;
    KM01_COMPRESSOR := FALSE;
    LAMP_ALARME_FALHA := TRUE;
END_IF;

// NETWORK 1: Auto-retencao Contator Compressor KM01 (Start/Stop)
IF (BTN_PARTIDA_COMP OR KM01_COMPRESSOR) AND BTN_PARADA_COMP AND Q01_GERAL THEN
    KM01_COMPRESSOR := TRUE;
ELSIF NOT BTN_PARADA_COMP OR NOT Q01_GERAL THEN
    KM01_COMPRESSOR := FALSE;
END_IF;

// NETWORK 2: Temporizacao Estrela-Triangulo TON (T#6s)
TON_Partida_YD(IN := KM01_COMPRESSOR, PT := T#6s);
IF TON_Partida_YD.Q THEN
    KM02_ESTRELA := FALSE;
    KM03_TRIANGULO := TRUE;
ELSE
    KM02_ESTRELA := KM01_COMPRESSOR;
    KM03_TRIANGULO := FALSE;
END_IF;

END_PROGRAM
`;
  };

  // Generate Instruction List (IL) IEC 61131-3 code
  const generateIlCode = () => {
    return `(* INSTRUCTION LIST (IL) IEC 61131-3 *)
LD   %I0.0       (* BTN_EMERGENCIA *)
AND  %I0.1       (* FT01_TERMIC_COMP *)
ST   %Q0.0       (* Q01_GERAL *)

LD   %I0.2       (* BTN_PARTIDA_COMP *)
OR   %Q0.2       (* Selo KM01_COMPRESSOR *)
AND  %I0.3       (* BTN_PARADA_COMP *)
AND  %Q0.0       (* Intertravamento Q01 *)
ST   %Q0.2       (* KM01_COMPRESSOR *)

CAL  TON_Partida_YD(IN:=%Q0.2, PT:=T#6s)
LD   TON_Partida_YD.Q
ST   %Q0.4       (* KM03_TRIANGULO *)
`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] text-slate-200 select-none overflow-hidden">
      {/* Top Bar */}
      <div className="h-11 px-4 bg-[#11141A] border-b border-[#232833] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Binary className="h-4 w-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-xs text-slate-100 uppercase tracking-wider">
              Editor Ladder IEC 61131-3
            </span>
            <span className="text-slate-500 text-[10px] ml-2">
              (Ciclo de Varredura CLP: 12ms)
            </span>
          </div>
        </div>

        {/* View Switcher: Ladder Visual / ST Code / IL Code */}
        <div className="flex items-center gap-1 bg-[#161A22] border border-[#232833] p-1 rounded">
          <button
            onClick={() => setActiveSubTab('visual')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-mono rounded transition-colors ${
              activeSubTab === 'visual'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Binary className="h-3.5 w-3.5" />
            <span>Visual Rungs</span>
          </button>
          <button
            onClick={() => setActiveSubTab('st_code')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-mono rounded transition-colors ${
              activeSubTab === 'st_code'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Structured Text (ST)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('il_code')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-mono rounded transition-colors ${
              activeSubTab === 'il_code'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>Instruction List (IL)</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {activeSubTab === 'visual' ? (
          /* Visual Ladder Canvas */
          <div className="flex-1 bg-[#11141A] border border-[#232833] rounded-lg p-6 overflow-y-auto flex flex-col gap-6 relative shadow-inner">
            {/* Legend & Instructions */}
            <div className="flex items-center justify-between pb-3 border-b border-[#232833] text-xs font-mono">
              <div className="flex items-center gap-4">
                <span className="text-slate-400">Clique em qualquer contato para alternar o sinal na simulação:</span>
                <span className="text-amber-400 font-bold">—[ ]— Normal Aberto</span>
                <span className="text-cyan-400 font-bold">—[/]— Normal Fechado</span>
                <span className="text-emerald-400 font-bold">—( )— Bobina de Saída</span>
              </div>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                SIMULAÇÃO CLP ATIVA
              </span>
            </div>

            {/* Render Each Ladder Rung */}
            <div className="flex flex-col gap-8 pl-8 pr-8 relative">
              {/* Left Power Rail (L+) */}
              <div className="absolute top-0 bottom-0 left-4 w-1.5 bg-amber-500/80 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />

              {/* Right Neutral Rail (M) */}
              <div className="absolute top-0 bottom-0 right-4 w-1.5 bg-blue-500/80 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />

              {ladderRungs.map(rung => (
                <div key={rung.id} className="flex flex-col gap-2 relative">
                  {/* Rung Header */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-amber-400">
                      RUNG {rung.number}: {rung.title}
                    </span>
                    <span className="text-slate-500 text-[11px]">{rung.comment}</span>
                  </div>

                  {/* Rung Wire Line */}
                  <div className="h-24 bg-[#0D1017] border border-[#232833] rounded flex items-center px-4 relative overflow-hidden">
                    {/* Horizontal Power Line */}
                    <div
                      className={`absolute left-0 right-0 h-1 ${
                        rung.isPowerFlowActive
                          ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                          : 'bg-[#2A3342]'
                      }`}
                    />

                    {/* Rung Elements */}
                    <div className="flex items-center justify-between w-full relative z-10">
                      {/* Left contact elements */}
                      <div className="flex items-center gap-6">
                        {rung.elements
                          .filter(e => e.type !== 'COIL')
                          .map(elem => {
                            const isTon = elem.type === 'TIMER_TON';

                            return (
                              <button
                                key={elem.id}
                                onClick={() => toggleLadderContact(rung.id, elem.id)}
                                className={`flex flex-col items-center justify-center p-2 rounded border transition-all cursor-pointer ${
                                  elem.isEnergized
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                                    : 'bg-[#161A22] border-[#2A313E] text-slate-400 hover:border-slate-500'
                                }`}
                              >
                                <span className="text-[10px] font-mono font-bold">{elem.tagName}</span>
                                <span className="text-[9px] font-mono text-cyan-400">{elem.address}</span>

                                {isTon ? (
                                  /* Timer TON block visual */
                                  <div className="mt-1 flex flex-col items-center bg-[#0B0D10] px-2 py-1 rounded border border-[#2A313E]">
                                    <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 font-bold">
                                      <Clock className="h-3 w-3" />
                                      <span>[TON]</span>
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-400">PT: {elem.presetTime}</span>
                                    <span className="text-[9px] font-mono text-emerald-400 font-bold">ET: {elem.elapsedTime}</span>
                                  </div>
                                ) : (
                                  /* Standard Contact Symbol */
                                  <div className="mt-1 text-base font-mono font-bold tracking-wider">
                                    {elem.type === 'CONTACT_NO' ? '—[ ]—' : '—[/]—'}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                      </div>

                      {/* Right Output Coil */}
                      {rung.elements
                        .filter(e => e.type === 'COIL')
                        .map(elem => (
                          <div
                            key={elem.id}
                            className={`flex flex-col items-center justify-center p-2.5 rounded border transition-all ${
                              elem.isEnergized
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                : 'bg-[#161A22] border-[#2A313E] text-slate-500'
                            }`}
                          >
                            <span className="text-[10px] font-mono font-bold">{elem.tagName}</span>
                            <span className="text-[9px] font-mono text-cyan-400">{elem.address}</span>
                            <div className="mt-1 text-base font-mono font-bold tracking-wider">
                              —( {elem.isEnergized ? '●' : ' '} )—
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeSubTab === 'st_code' ? (
          /* Structured Text (ST) Code View */
          <div className="flex-1 bg-[#11141A] border border-[#232833] rounded-lg p-4 font-mono text-xs overflow-auto flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#232833] text-slate-400">
              <span>CÓDIGO COMPILADO EM TEXTO ESTRUTURADO (IEC 61131-3 ST)</span>
              <button
                onClick={() => navigator.clipboard.writeText(generateStCode())}
                className="px-2 py-1 rounded bg-[#161A22] hover:bg-[#232833] text-amber-400 text-[11px]"
              >
                Copiar ST
              </button>
            </div>
            <pre className="mt-3 text-emerald-400 font-mono text-xs whitespace-pre leading-relaxed">
              {generateStCode()}
            </pre>
          </div>
        ) : (
          /* Instruction List (IL) View */
          <div className="flex-1 bg-[#11141A] border border-[#232833] rounded-lg p-4 font-mono text-xs overflow-auto flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#232833] text-slate-400">
              <span>INSTRUCTION LIST (IEC 61131-3 IL)</span>
              <button
                onClick={() => navigator.clipboard.writeText(generateIlCode())}
                className="px-2 py-1 rounded bg-[#161A22] hover:bg-[#232833] text-cyan-400 text-[11px]"
              >
                Copiar IL
              </button>
            </div>
            <pre className="mt-3 text-cyan-300 font-mono text-xs whitespace-pre leading-relaxed">
              {generateIlCode()}
            </pre>
          </div>
        )}

        {/* Sidebar: Shared Tags Autocomplete Table */}
        <div className="w-72 bg-[#11141A] border border-[#232833] rounded-lg p-4 flex flex-col text-xs font-mono select-none">
          <span className="font-bold text-slate-100 pb-2 border-b border-[#232833] uppercase">
            Shared Tags CLP / I/O
          </span>
          <div className="flex-1 overflow-y-auto mt-2 flex flex-col gap-1.5 pr-1">
            {sharedTags.map(tag => (
              <div
                key={tag.id}
                className="p-2 rounded bg-[#161A22] border border-[#232833] flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{tag.name}</span>
                  <span className="text-cyan-400 text-[10px]">{tag.address}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{tag.dataType}</span>
                  <span
                    className={`font-bold ${
                      typeof tag.currentValue === 'boolean'
                        ? tag.currentValue
                          ? 'text-emerald-400'
                          : 'text-red-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {String(tag.currentValue)} {tag.unit || ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
