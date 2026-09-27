'use client';

import React, { useState } from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, Info, BellOff } from 'lucide-react';

export type ScadaAlarmSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface ScadaAlarm {
  id: string;
  severity: ScadaAlarmSeverity;
  title: string;
  message: string;
  sourceTag?: string;
  timestamp?: string;
}

interface AlarmBannerProps {
  alarms: ScadaAlarm[];
  /** Endereço do nó de supervisão exibido no rodapé do banner. */
  endpoint?: string;
  /** Quando informado, habilita o reconhecimento visual do alarme. */
  onAcknowledge?: (alarmId: string) => void;
}

const SEVERITY_RANK: Record<ScadaAlarmSeverity, number> = {
  CRITICAL: 3,
  WARNING: 2,
  INFO: 1,
};

const SEVERITY_STYLES: Record<ScadaAlarmSeverity, string> = {
  CRITICAL: 'bg-red-950/40 border-red-500 text-red-300',
  WARNING: 'bg-amber-950/40 border-amber-500 text-amber-300',
  INFO: 'bg-[#161A22] border-[#232833] text-slate-300',
};

function SeverityIcon({ severity, className }: { severity: ScadaAlarmSeverity; className?: string }) {
  if (severity === 'CRITICAL') return <AlertOctagon className={className} />;
  if (severity === 'WARNING') return <AlertTriangle className={className} />;
  return <Info className={className} />;
}

function severityLabel(severity: ScadaAlarmSeverity): string {
  if (severity === 'CRITICAL') return 'ALARME ALTO';
  if (severity === 'WARNING') return 'ALERTA';
  return 'INFORMATIVO';
}

export function AlarmBanner({ alarms, endpoint, onAcknowledge }: AlarmBannerProps) {
  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>([]);

  const activeAlarms = [...alarms].sort(
    (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
  );
  const topAlarm = activeAlarms[0];
  const isAlarmed = Boolean(topAlarm);
  const isCriticalUnacknowledged =
    topAlarm?.severity === 'CRITICAL' && !acknowledgedIds.includes(topAlarm.id);

  const handleAcknowledge = (alarmId: string) => {
    setAcknowledgedIds(prev => (prev.includes(alarmId) ? prev : [...prev, alarmId]));
    onAcknowledge?.(alarmId);
  };

  return (
    <div
      className={`p-3 rounded border flex items-center justify-between gap-3 text-xs font-mono transition-colors ${
        isAlarmed ? SEVERITY_STYLES[topAlarm.severity] : 'bg-[#161A22] border-[#232833] text-slate-300'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 min-w-0">
        {isAlarmed ? (
          <SeverityIcon
            severity={topAlarm.severity}
            className={`h-4 w-4 shrink-0 ${
              topAlarm.severity === 'CRITICAL' && isCriticalUnacknowledged
                ? 'text-red-400 animate-bounce'
                : topAlarm.severity === 'CRITICAL'
                ? 'text-red-400'
                : topAlarm.severity === 'WARNING'
                ? 'text-amber-400'
                : 'text-slate-400'
            }`}
          />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
        )}

        <span className="truncate">
          {isAlarmed ? (
            <>
              <span className="font-bold">[{severityLabel(topAlarm.severity)}]</span>{' '}
              {topAlarm.message}
              {activeAlarms.length > 1 && (
                <span className="text-[10px] opacity-75"> (+{activeAlarms.length - 1} outro(s) alarme(s))</span>
              )}
            </>
          ) : (
            'Sistema operando dentro dos limites nominais da ABNT NBR 5410.'
          )}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isAlarmed &&
          topAlarm.severity === 'CRITICAL' &&
          typeof onAcknowledge === 'function' &&
          !acknowledgedIds.includes(topAlarm.id) && (
          <button
            type="button"
            onClick={() => handleAcknowledge(topAlarm.id)}
            className="px-2 py-1 rounded border border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition-colors text-[10px] font-mono flex items-center gap-1"
            title="Reconhecer o alarme (apenas visual — não desativa a proteção física)"
          >
            <BellOff className="h-3 w-3" />
            Reconhecer
          </button>
        )}

        {isAlarmed && acknowledgedIds.includes(topAlarm.id) && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-600 text-slate-400">
            ACK
          </span>
        )}

        <span className="text-[10px] text-slate-500 hidden sm:inline">
          {endpoint ?? 'DADO_NAO_INFORMADO'}
        </span>
      </div>
    </div>
  );
}

export default AlarmBanner;
