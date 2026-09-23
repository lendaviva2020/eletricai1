'use client';

import React from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { IndustrialProject, IndustrialAlert, TeamMember } from '@/types/dashboard';
import {
  FolderGit2,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Users,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface MainSummaryCardsProps {
  projects: IndustrialProject[];
  alerts: IndustrialAlert[];
  team: TeamMember[];
  onSelectProjectsView: () => void;
  onSelectAlertsView: () => void;
  onSelectTeamView: () => void;
}

export function MainSummaryCards({
  projects,
  alerts,
  team,
  onSelectProjectsView,
  onSelectAlertsView,
  onSelectTeamView,
}: MainSummaryCardsProps) {
  const { tenant, setActiveTab, sharedTags, components } = useWorkspace();

  const activeProjectsCount = projects.filter(p => p.status === 'EM_EXECUCAO' || p.status === 'EM_COMISSIONAMENTO').length;
  const completedProjectsCount = projects.filter(p => p.status === 'CONCLUIDO').length;
  const pendingAlerts = alerts.filter(a => !a.isResolved);
  const criticalCount = pendingAlerts.filter(a => a.severity === 'CRITICO').length;
  const warningCount = pendingAlerts.filter(a => a.severity === 'ATENCAO').length;

  // Plan usage calculation
  const totalTags = sharedTags.length;
  const totalComponents = components.length;
  const planTagLimit = 100;
  const tagUsagePercent = Math.min(100, Math.round((totalTags / planTagLimit) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {/* 1. Projetos Ativos */}
      <div
        onClick={onSelectProjectsView}
        className="bg-[#161A22] border border-[#232833] hover:border-amber-500/50 rounded-xl p-3.5 flex flex-col justify-between transition-all group cursor-pointer shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Projetos Ativos
          </span>
          <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FolderGit2 className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {activeProjectsCount}
            </span>
            <span className="text-xs text-amber-400 font-mono font-medium">
              em andamento
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono flex items-center justify-between">
            <span>{projects.length} cadastrados no tenant</span>
            <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-amber-400 transition-colors" />
          </p>
        </div>
      </div>

      {/* 2. Projetos Concluídos */}
      <div
        onClick={onSelectProjectsView}
        className="bg-[#161A22] border border-[#232833] hover:border-emerald-500/50 rounded-xl p-3.5 flex flex-col justify-between transition-all group cursor-pointer shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Projetos Concluídos
          </span>
          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {completedProjectsCount}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-medium">
              as-built / 100%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono flex items-center justify-between">
            <span>Memorial descritivo homologado</span>
            <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-emerald-400 transition-colors" />
          </p>
        </div>
      </div>

      {/* 3. Alertas Pendentes */}
      <div
        onClick={onSelectAlertsView}
        className="bg-[#161A22] border border-[#232833] hover:border-rose-500/50 rounded-xl p-3.5 flex flex-col justify-between transition-all group cursor-pointer shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Alertas Pendentes
          </span>
          <div className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400">
              {pendingAlerts.length}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({criticalCount} críticos, {warningCount} atenção)
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono flex items-center justify-between">
            <span>Ação técnica recomendada</span>
            <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-rose-400 transition-colors" />
          </p>
        </div>
      </div>

      {/* 4. Análises Realizadas pela IA */}
      <div
        onClick={() => setActiveTab('ai_copilot')}
        className="bg-[#161A22] border border-[#232833] hover:border-amber-500/50 rounded-xl p-3.5 flex flex-col justify-between transition-all group cursor-pointer shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Análises de IA
          </span>
          <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Bot className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              28
            </span>
            <span className="text-xs text-amber-400 font-mono font-medium">
              96.4% ABNT
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono flex items-center justify-between">
            <span>Patch Diff Auditável</span>
            <Sparkles className="h-3 w-3 text-amber-400" />
          </p>
        </div>
      </div>

      {/* 5. Membros da Equipe */}
      <div
        onClick={onSelectTeamView}
        className="bg-[#161A22] border border-[#232833] hover:border-cyan-500/50 rounded-xl p-3.5 flex flex-col justify-between transition-all group cursor-pointer shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Equipe da Planta
          </span>
          <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {team.length}
            </span>
            <span className="text-xs text-cyan-400 font-mono font-medium">
              {team.filter(m => m.status === 'ONLINE').length} online
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono flex items-center justify-between">
            <span>3 Eng. CREA habilitados</span>
            <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          </p>
        </div>
      </div>

      {/* 6. Uso do Plano */}
      <div
        onClick={() => setActiveTab('bom')}
        className="bg-[#161A22] border border-[#232833] hover:border-slate-600 rounded-xl p-3.5 flex flex-col justify-between transition-all group cursor-pointer shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Uso do Plano
          </span>
          <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Activity className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {tagUsagePercent}%
            </span>
            <span className="text-xs text-slate-400 font-mono font-medium truncate">
              {tenant.plan.split(' ')[0]}
            </span>
          </div>
          <div className="w-full bg-[#0D1017] rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${tagUsagePercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono flex items-center justify-between">
            <span>{totalTags} tags ativas de {planTagLimit}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
