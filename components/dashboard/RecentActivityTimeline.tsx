'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { ActivityEvent, ActivityEventType } from '@/types/dashboard';
import {
  Clock,
  Bot,
  FileCode,
  FileSpreadsheet,
  Download,
  UserPlus,
  AlertOctagon,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';

interface RecentActivityTimelineProps {
  activities: ActivityEvent[];
}

export function RecentActivityTimeline({ activities }: RecentActivityTimelineProps) {
  const { setActiveTab } = useWorkspace();
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filtered = activities.filter(a => {
    if (selectedType === 'ALL') return true;
    return a.type === selectedType;
  });

  const getEventIcon = (type: ActivityEventType) => {
    switch (type) {
      case 'AI_ANALYSIS_EXECUTED':
        return <Bot className="h-3.5 w-3.5 text-amber-400" />;
      case 'PROJECT_UPDATED':
      case 'CABLE_RESIZED':
        return <FileCode className="h-3.5 w-3.5 text-cyan-400" />;
      case 'REPORT_GENERATED':
        return <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />;
      case 'PROJECT_EXPORTED':
        return <Download className="h-3.5 w-3.5 text-purple-400" />;
      case 'MEMBER_ADDED':
        return <UserPlus className="h-3.5 w-3.5 text-blue-400" />;
      case 'BREAKER_TRIP':
        return <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />;
      default:
        return <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-[#161A22] border border-[#232833] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#232833]">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-sans">
              Atividade Recente da Planta
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Trilha de auditoria em tempo real das alterações de engenharia
            </p>
          </div>
        </div>

        {/* Filter dropdown */}
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="bg-[#0D1017] border border-[#232833] text-slate-300 text-[11px] font-mono rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500"
        >
          <option value="ALL">Todos os Eventos</option>
          <option value="AI_ANALYSIS_EXECUTED">Análises de IA</option>
          <option value="PROJECT_UPDATED">Modificações no CAD</option>
          <option value="REPORT_GENERATED">Relatórios & BOM</option>
          <option value="BREAKER_TRIP">Simulação de Trips</option>
        </select>
      </div>

      {/* Timeline items */}
      <div className="relative pl-5 mt-4 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#232833]">
        {filtered.map((event) => (
          <div key={event.id} className="relative group">
            {/* Timeline node dot */}
            <div className="absolute -left-5 top-1 h-4 w-4 rounded-full bg-[#11141A] border border-[#232833] flex items-center justify-center group-hover:border-amber-400 transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 group-hover:bg-amber-400" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4 bg-[#12161F]/40 p-2.5 rounded-lg border border-transparent hover:border-[#232833] transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-[#161A22] border border-[#232833]">
                    {getEventIcon(event.type)}
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    {event.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {event.description}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-400">
                  <span className="text-slate-300">{event.user.name}</span>
                  <span>•</span>
                  <span>{event.timestamp}</span>
                </div>
              </div>

              {event.targetTab && (
                <button
                  type="button"
                  onClick={() => setActiveTab(event.targetTab!)}
                  className="self-end sm:self-center px-2 py-1 rounded bg-[#161A22] hover:bg-amber-500/10 border border-[#232833] hover:border-amber-500/40 text-[10px] font-mono text-slate-300 hover:text-amber-400 flex items-center gap-1 transition-colors shrink-0"
                  title="Abrir contexto no Workspace"
                >
                  <span>Abrir Contexto</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
