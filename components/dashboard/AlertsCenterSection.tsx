'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { IndustrialAlert, AlertSeverity } from '@/types/dashboard';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Tag,
  Wrench,
  Check,
} from 'lucide-react';

interface AlertsCenterSectionProps {
  alerts: IndustrialAlert[];
  onToggleResolveAlert: (id: string) => void;
}

export function AlertsCenterSection({ alerts, onToggleResolveAlert }: AlertsCenterSectionProps) {
  const { setActiveTab } = useWorkspace();
  const [activeSeverity, setActiveSeverity] = useState<AlertSeverity | 'ALL'>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (activeSeverity === 'ALL') return true;
    return a.severity === activeSeverity;
  });

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold">
            <AlertOctagon className="h-3 w-3" />
            Crítico
          </span>
        );
      case 'ATENCAO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
            <AlertTriangle className="h-3 w-3" />
            Atenção
          </span>
        );
      case 'RECOMENDACAO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
            <Info className="h-3 w-3" />
            Recomendação
          </span>
        );
      case 'RESOLVIDO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            <CheckCircle2 className="h-3 w-3" />
            Resolvido
          </span>
        );
    }
  };

  return (
    <div className="bg-[#161A22] border border-[#232833] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#232833]">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-sans">
              Central de Alertas & Inconsistências
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Monitoramento contínuo de violações NBR 5410, I/O e telemetria
            </p>
          </div>
        </div>

        {/* Severity filter pills */}
        <div className="flex items-center bg-[#0D1017] p-0.5 rounded-lg border border-[#232833] text-[11px] font-mono">
          <button
            onClick={() => setActiveSeverity('ALL')}
            className={`px-2 py-1 rounded transition-colors ${
              activeSeverity === 'ALL' ? 'bg-[#161A22] text-slate-100 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({alerts.length})
          </button>
          <button
            onClick={() => setActiveSeverity('CRITICO')}
            className={`px-2 py-1 rounded transition-colors ${
              activeSeverity === 'CRITICO' ? 'bg-rose-500/20 text-rose-400 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Crítico ({alerts.filter(a => a.severity === 'CRITICO').length})
          </button>
          <button
            onClick={() => setActiveSeverity('ATENCAO')}
            className={`px-2 py-1 rounded transition-colors ${
              activeSeverity === 'ATENCAO' ? 'bg-amber-500/20 text-amber-400 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Atenção ({alerts.filter(a => a.severity === 'ATENCAO').length})
          </button>
          <button
            onClick={() => setActiveSeverity('RECOMENDACAO')}
            className={`px-2 py-1 rounded transition-colors ${
              activeSeverity === 'RECOMENDACAO' ? 'bg-cyan-500/20 text-cyan-400 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recomendação
          </button>
          <button
            onClick={() => setActiveSeverity('RESOLVIDO')}
            className={`px-2 py-1 rounded transition-colors ${
              activeSeverity === 'RESOLVIDO' ? 'bg-emerald-500/20 text-emerald-400 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Resolvidos
          </button>
        </div>
      </div>

      {/* Alerts list */}
      <div className="divide-y divide-[#1F2633] mt-2">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className="py-3 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#12161F]/60 px-2 rounded-lg transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-100">
                  {alert.title}
                </span>
                {getSeverityBadge(alert.severity)}
                {alert.sourceTag && (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 rounded">
                    TAG: {alert.sourceTag}
                  </span>
                )}
                <span className="text-[10px] font-mono text-slate-400">
                  {alert.timestamp}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                {alert.description}
              </p>

              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/90">
                <Wrench className="h-3 w-3 shrink-0" />
                <span className="text-slate-300">Sugestão:</span>
                <span>{alert.suggestedAction}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={() => onToggleResolveAlert(alert.id)}
                className={`p-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1 ${
                  alert.isResolved
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-[#0D1017] border-[#232833] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
                title={alert.isResolved ? 'Reabrir alerta' : 'Marcar como resolvido'}
              >
                <Check className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{alert.isResolved ? 'Resolvido' : 'Concluir'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab(alert.targetTab)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-[#0B0D10] border border-amber-500/30 text-xs font-mono font-medium flex items-center gap-1.5 transition-all"
                title={`Abrir contexto técnico em ${alert.targetTab.toUpperCase()}`}
              >
                <span>Corrigir no Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
