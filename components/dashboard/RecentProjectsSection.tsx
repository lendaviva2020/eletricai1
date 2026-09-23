'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { IndustrialProject, ProjectStatus } from '@/types/dashboard';
import {
  FolderGit2,
  Cpu,
  ArrowRight,
  Plus,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface RecentProjectsSectionProps {
  projects: IndustrialProject[];
  onOpenNewProjectModal: () => void;
  onSelectProject: (project: IndustrialProject) => void;
}

export function RecentProjectsSection({
  projects,
  onOpenNewProjectModal,
  onSelectProject,
}: RecentProjectsSectionProps) {
  const { setActiveTab } = useWorkspace();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const filteredProjects = projects.filter(p => {
    if (filter === 'ACTIVE') return p.status === 'EM_EXECUCAO' || p.status === 'EM_COMISSIONAMENTO';
    if (filter === 'COMPLETED') return p.status === 'CONCLUIDO';
    return true;
  });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'EM_EXECUCAO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Em Execução
          </span>
        );
      case 'EM_COMISSIONAMENTO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Comissionamento
          </span>
        );
      case 'CONCLUIDO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Concluído (As-Built)
          </span>
        );
      case 'REVISAO_TECNICA':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400">
            Revisão ART
          </span>
        );
    }
  };

  return (
    <div className="bg-[#161A22] border border-[#232833] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
      {/* Header with Title & Quick Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#232833]">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <FolderGit2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-sans">
              Projetos Recentes
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Painéis elétricos, subestações e lógicas sob conformidade ABNT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Filter tabs */}
          <div className="flex items-center bg-[#0D1017] p-0.5 rounded-lg border border-[#232833] text-[11px] font-mono">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2 py-1 rounded transition-colors ${
                filter === 'ALL' ? 'bg-[#161A22] text-amber-400 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({projects.length})
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-2 py-1 rounded transition-colors ${
                filter === 'ACTIVE' ? 'bg-[#161A22] text-amber-400 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-2 py-1 rounded transition-colors ${
                filter === 'COMPLETED' ? 'bg-[#161A22] text-emerald-400 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Concluídos
            </button>
          </div>

          {/* "+ Novo projeto" button */}
          <button
            type="button"
            onClick={onOpenNewProjectModal}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500 hover:text-[#0B0D10] text-amber-400 font-mono text-xs font-semibold flex items-center gap-1 transition-all"
            title="Criar novo diagrama elétrico industrial"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Projects List Grid */}
      <div className="divide-y divide-[#1F2633] mt-2">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="py-3 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#12161F]/60 px-2 rounded-lg transition-colors group"
          >
            {/* Left: Project Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {project.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.2 rounded bg-[#0D1017] border border-[#232833]">
                  {project.code}
                </span>
                {getStatusBadge(project.status)}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] font-mono text-slate-400">
                <span className="text-slate-300 font-medium">
                  {project.typeLabel}
                </span>
                <span>•</span>
                <span className="text-amber-400/90">
                  {project.normativeStandard}
                </span>
                <span>•</span>
                <span>{project.nominalVoltage}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-3 w-3" />
                  {project.lastUpdated}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <User className="h-3 w-3" />
                  {project.updatedBy.name}
                </span>
              </div>
            </div>

            {/* Right: Progress & Action */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex flex-col items-end w-28">
                <div className="flex items-center justify-between w-full text-[10px] font-mono mb-1">
                  <span className="text-slate-400">Progresso</span>
                  <span className="font-bold text-slate-200">{project.progressPercent}%</span>
                </div>
                <div className="w-full bg-[#0D1017] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      project.progressPercent === 100
                        ? 'bg-emerald-400'
                        : project.progressPercent > 70
                        ? 'bg-amber-400'
                        : 'bg-cyan-400'
                    }`}
                    style={{ width: `${project.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action: Abrir Workspace */}
              <button
                type="button"
                onClick={() => {
                  onSelectProject(project);
                  setActiveTab(project.targetTab);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#0D1017] hover:bg-amber-500 hover:text-[#0B0D10] border border-[#232833] hover:border-amber-500 text-slate-200 text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm"
                title={`Abrir Workspace no módulo ${project.targetTab.toUpperCase()}`}
              >
                <span>Abrir Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer: Ver todos os projetos */}
      <div className="pt-3 border-t border-[#232833] flex items-center justify-between mt-2">
        <span className="text-[11px] font-mono text-slate-400">
          Exibindo {filteredProjects.length} de {projects.length} projetos
        </span>
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className="text-xs font-mono text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>Ver todos os projetos</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
