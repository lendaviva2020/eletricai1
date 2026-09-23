'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import {
  Tv,
  Play,
  Terminal,
  AlertTriangle,
  RotateCw,
  Gauge,
  Activity,
  ShieldAlert,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export function ScadaMimic() {
  const {
    sharedTags,
    updateTagValue,
    scadaScript,
    setScadaScript,
    scadaLogs,
    runScadaSandbox,
    toggleBreakerState,
    whatIfScenario,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'mimic' | 'script_sandbox'>('mimic');

  // Retrieve current tag values
  const compTag = sharedTags.find(t => t.name === 'KM01_COMPRESSOR');
  const exhTag = sharedTags.find(t => t.name === 'KM04_EXAUSTOR');
  const pressTag = sharedTags.find(t => t.name === 'PRESSAO_REDE_AR');
  const tempTag = sharedTags.find(t => t.name === 'TEMP_MANCAL_COMP');
  const currTag = sharedTags.find(t => t.name === 'CORRENTE_FASE_R');
  const emergTag = sharedTags.find(t => t.name === 'BTN_EMERGENCIA');

  const isCompressorRunning = Boolean(compTag?.currentValue);
  const isExhaustorRunning = Boolean(exhTag?.currentValue);
  const pressureVal = Number(pressTag?.currentValue || 7.4);
  const tempVal = Number(tempTag?.currentValue || 64.8);
  const currVal = Number(currTag?.currentValue || 41.6);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] text-slate-200 select-none overflow-hidden">
      {/* Top SCADA Header */}
      <div className="h-12 px-6 bg-[#11141A] border-b border-[#232833] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Tv className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-slate-100 uppercase tracking-wider">
                SCADA Supervisório Industrial (Mímico & Sandbox)
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                TELEMETRIA LIVE 100ms
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Protocolos: Modbus TCP & OPC-UA | Sandbox: Web Worker Air-Gapped Isolado
            </p>
          </div>
        </div>

        {/* View Switcher: Mimic Screen / Sandbox Code */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#161A22] border border-[#232833] p-1 rounded">
            <button
              onClick={() => setActiveTab('mimic')}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                activeTab === 'mimic'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mímico Gráfico
            </button>
            <button
              onClick={() => setActiveTab('script_sandbox')}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                activeTab === 'script_sandbox'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sandbox Script Web Worker
            </button>
          </div>
        </div>
      </div>

      {/* Main SCADA Workspace */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {activeTab === 'mimic' ? (
          /* Mímico Gráfico Industrial */
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
            {/* Alarm Banner */}
            <div className={`p-3 rounded border flex items-center justify-between text-xs font-mono transition-colors ${
              tempVal > 80 || currVal > 50
                ? 'bg-red-950/40 border-red-500 text-red-300'
                : 'bg-[#161A22] border-[#232833] text-slate-300'
            }`}>
              <div className="flex items-center gap-2">
                {tempVal > 80 || currVal > 50 ? (
                  <AlertTriangle className="h-4 w-4 text-red-400 animate-bounce" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                )}
                <span>
                  {tempVal > 80
                    ? `[ALARME ALTO] Temperatura de Mancal MTR01 acima do limite crítico: ${tempVal}°C!`
                    : currVal > 50
                    ? `[ALARME SOBRECORRENTE] Corrente Fase R em ${currVal}A (In=42A)!`
                    : 'Sistema operando dentro dos limites nominais da ABNT NBR 5410.'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                SCADA NODE: OPCUA://192.168.10.20:4840
              </span>
            </div>

            {/* Industrial Mimic Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Motor 1: Compressor 30cv */}
              <div className="bg-[#11141A] border border-[#232833] rounded-lg p-5 flex flex-col justify-between relative shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-[#232833]">
                  <span className="font-mono font-bold text-xs text-amber-400">
                    MTR01: COMPRESSOR 30 CV
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                      isCompressorRunning
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {isCompressorRunning ? 'EM OPERAÇÃO' : 'PARADO'}
                  </span>
                </div>

                {/* Animated Rotating Motor Graphic */}
                <div className="py-6 flex items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`h-24 w-24 rounded-full border-4 flex items-center justify-center transition-all ${
                        isCompressorRunning
                          ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                          : 'border-[#232833] bg-[#0D1017]'
                      }`}
                    >
                      <RotateCw
                        className={`h-12 w-12 text-amber-400 ${
                          isCompressorRunning ? 'animate-spin' : 'opacity-40'
                        }`}
                        style={{ animationDuration: '1.2s' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Motor Controls */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#232833]">
                  <button
                    onClick={() => updateTagValue('KM01_COMPRESSOR', true)}
                    className="flex-1 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors"
                  >
                    LIGAR
                  </button>
                  <button
                    onClick={() => updateTagValue('KM01_COMPRESSOR', false)}
                    className="flex-1 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-colors"
                  >
                    DESLIGAR
                  </button>
                </div>
              </div>

              {/* Analog Gauge: Pressure */}
              <div className="bg-[#11141A] border border-[#232833] rounded-lg p-5 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-[#232833]">
                  <span className="font-mono font-bold text-xs text-cyan-400">
                    PRESSÃO DO RESERVATÓRIO
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">0 - 16 bar</span>
                </div>

                {/* Gauge Needle Visual */}
                <div className="py-4 flex flex-col items-center justify-center">
                  <div className="relative w-40 h-24 flex items-end justify-center overflow-hidden">
                    <div className="w-40 h-40 rounded-full border-8 border-[#232833] border-t-cyan-500 border-r-amber-500" />
                    <div className="absolute bottom-0 text-center">
                      <span className="text-3xl font-mono font-black text-slate-100">
                        {pressureVal.toFixed(2)}
                      </span>
                      <span className="text-xs font-mono text-cyan-400 ml-1">bar</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-400 flex justify-between pt-3 border-t border-[#232833]">
                  <span>Set-point Alívio: 9.0 bar</span>
                  <span className="text-emerald-400">Normal</span>
                </div>
              </div>

              {/* Bar Graph: Mancal Temperature */}
              <div className="bg-[#11141A] border border-[#232833] rounded-lg p-5 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-[#232833]">
                  <span className="font-mono font-bold text-xs text-orange-400">
                    TEMPERATURA MANCAL MTR01
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">PT100 RTD</span>
                </div>

                <div className="py-4 flex items-center justify-center gap-6">
                  {/* Vertical Thermometer Bar */}
                  <div className="h-28 w-6 bg-[#0D1017] rounded-full border border-[#232833] p-1 flex flex-col justify-end">
                    <div
                      className={`w-full rounded-full transition-all ${
                        tempVal > 80 ? 'bg-red-500' : 'bg-gradient-to-t from-emerald-500 to-amber-500'
                      }`}
                      style={{ height: `${Math.min(100, (tempVal / 100) * 100)}%` }}
                    />
                  </div>
                  <div>
                    <span className="text-3xl font-mono font-black text-slate-100">
                      {tempVal.toFixed(1)}
                    </span>
                    <span className="text-sm font-mono text-orange-400 ml-1">°C</span>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      Limite NBR 5410: 85.0°C
                    </p>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-400 flex justify-between pt-3 border-t border-[#232833]">
                  <span>Alarme Alto: 80.0°C</span>
                  <span className={tempVal > 80 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {tempVal > 80 ? 'CRÍTICO' : 'SEGURO'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Trip Simulator */}
            <div className="bg-[#11141A] border border-[#232833] rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                <div>
                  <span className="font-mono font-bold text-xs text-slate-100">
                    Comutação Rápida de Campo (Intertravamento NR-10)
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Acione para testar resposta em cascata no Unifilar, Ladder e Digital Twin.
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleBreakerState('Q02_COMPRESSOR')}
                className="px-3 py-1.5 rounded bg-red-950/40 border border-red-500/40 hover:bg-red-900/50 text-red-300 font-mono text-xs font-bold transition-colors"
              >
                Alternar Disjuntor Q02
              </button>
            </div>
          </div>
        ) : (
          /* Web Worker Sandbox Script Editor & Execution Console */
          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Script Code Area */}
            <div className="flex-1 bg-[#11141A] border border-[#232833] rounded-lg p-4 flex flex-col font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-[#232833]">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Terminal className="h-4 w-4" />
                  <span>AIR-GAPPED WEB WORKER SANDBOX (ISOLAMENTO TOTAL)</span>
                </div>
                <button
                  onClick={runScadaSandbox}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded bg-amber-500 hover:bg-amber-400 text-[#0B0D10] transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-[#0B0D10]" />
                  <span>Executar Ciclo Sandbox</span>
                </button>
              </div>

              <textarea
                value={scadaScript}
                onChange={e => setScadaScript(e.target.value)}
                className="flex-1 bg-transparent text-slate-200 mt-3 outline-none resize-none font-mono text-xs leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Execution Logs Console */}
            <div className="w-80 bg-[#11141A] border border-[#232833] rounded-lg p-4 flex flex-col font-mono text-xs select-none">
              <span className="font-bold text-slate-100 pb-2 border-b border-[#232833] uppercase flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-amber-400" />
                Console de Execução
              </span>

              <div className="flex-1 overflow-y-auto mt-2 flex flex-col gap-1.5 pr-1">
                {scadaLogs.map((log, index) => (
                  <div
                    key={index}
                    className="p-2 rounded bg-[#0D1017] border border-[#1A1F29] text-[10px] flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between text-slate-500">
                      <span>{log.timestamp}</span>
                      <span
                        className={`font-bold ${
                          log.level === 'WARN'
                            ? 'text-yellow-400'
                            : log.level === 'ERROR'
                            ? 'text-red-400'
                            : log.level === 'SUCCESS'
                            ? 'text-emerald-400'
                            : 'text-cyan-400'
                        }`}
                      >
                        {log.level}
                      </span>
                    </div>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
