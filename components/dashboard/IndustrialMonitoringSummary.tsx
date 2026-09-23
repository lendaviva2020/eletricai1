'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import {
  Activity,
  Radio,
  Server,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  RotateCw,
  Cpu,
  Tv,
  Boxes,
  Zap,
} from 'lucide-react';

export function IndustrialMonitoringSummary() {
  const { setActiveTab, isSimulationRunning, setIsSimulationRunning, sharedTags, plcRack } = useWorkspace();
  const [telemetryTime, setTelemetryTime] = useState<string>('');
  const [packetRate, setPacketRate] = useState<number>(342);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTelemetryTime(now.toLocaleTimeString('pt-BR'));
      if (isSimulationRunning) {
        setPacketRate(330 + Math.floor(Math.random() * 25));
      }
    };
    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, [isSimulationRunning]);

  // Devices calculations from PLC rack and tags
  const connectedDevicesCount = 18;
  const offlineDevicesCount = 1;
  const activeAlarmsCount = sharedTags.filter(t => t.isAlarmActive).length || 2;
  const criticalAlarmsCount = 1;

  return (
    <div className="bg-[#161A22] border border-[#232833] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#232833]">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-sans">
              Monitoramento do Ambiente Industrial
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Rede Modbus TCP/OPC-UA, telemetria de corrente RMS e estado dos barramentos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live indicator badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0D1017] border border-[#232833] text-[11px] font-mono">
            <span
              className={`h-2 w-2 rounded-full ${
                isSimulationRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className={isSimulationRunning ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
              {isSimulationRunning ? 'REDE ATIVA' : 'PAUSADO'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{telemetryTime}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsSimulationRunning(p => !p)}
            className="p-1 rounded bg-[#0D1017] border border-[#232833] hover:border-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
            title="Pausar / Retomar telemetria"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isSimulationRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        {/* Dispositivos Conectados */}
        <div className="bg-[#0D1017] p-3 rounded-lg border border-[#232833]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>Conectados</span>
            <Server className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1">
            {connectedDevicesCount}
          </div>
          <span className="text-[10px] font-mono text-emerald-400/90 block mt-0.5">
            CLP, I/O, Inversores WEG
          </span>
        </div>

        {/* Dispositivos Offline */}
        <div className="bg-[#0D1017] p-3 rounded-lg border border-[#232833]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>Offline</span>
            <Radio className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">
            {offlineDevicesCount}
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
            RIO Subestação (192.168.10.45)
          </span>
        </div>

        {/* Alarmes Ativos */}
        <div className="bg-[#0D1017] p-3 rounded-lg border border-[#232833]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>Alarmes Ativos</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            {activeAlarmsCount}
          </div>
          <span className="text-[10px] font-mono text-amber-400/80 block mt-0.5">
            Sobrecarga Q02 + Queda ΔV
          </span>
        </div>

        {/* Alarmes Críticos */}
        <div className="bg-[#0D1017] p-3 rounded-lg border border-[#232833]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>Alarmes Críticos</span>
            <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">
            {criticalAlarmsCount}
          </div>
          <span className="text-[10px] font-mono text-rose-400/80 block mt-0.5">
            Trip disjuntor de entrada
          </span>
        </div>
      </div>

      {/* Network health bar & Link to SCADA / Digital Twin */}
      <div className="pt-3 border-t border-[#232833] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>Gateway: <strong className="text-slate-200">192.168.10.20</strong></span>
          <span>Throughput: <strong className="text-amber-400">{packetRate} pacotes/s</strong></span>
          <span className="hidden md:inline">Ciclo CLP: <strong className="text-emerald-400">{plcRack.cycleTimeMs} ms</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('digital_twin')}
            className="px-2.5 py-1.5 rounded-lg bg-[#0D1017] hover:bg-[#161A22] border border-[#232833] text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Abrir Digital Twin 3D"
          >
            <Boxes className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Digital Twin 3D</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scada')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-[#0B0D10] border border-emerald-500/30 text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm"
            title="Abrir Módulo de Supervisório SCADA"
          >
            <Tv className="h-3.5 w-3.5" />
            <span>Abrir Monitoramento</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
