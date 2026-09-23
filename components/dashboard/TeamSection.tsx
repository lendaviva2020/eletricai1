'use client';

import React from 'react';
import { TeamMember } from '@/types/dashboard';
import {
  Users,
  UserCheck,
  ShieldCheck,
  Wrench,
  Key,
  ArrowRight,
  UserPlus,
  Clock,
} from 'lucide-react';

interface TeamSectionProps {
  team: TeamMember[];
  onOpenManageModal: () => void;
}

export function TeamSection({ team, onOpenManageModal }: TeamSectionProps) {
  const totalMembers = team.length;
  const activeMembers = team.filter(m => m.status === 'ONLINE' || m.status === 'EM_CAMPO').length;
  const engineersCount = team.filter(m => m.roleTitle.includes('Engenheiro')).length;
  const techniciansCount = team.filter(m => m.roleTitle.includes('Técnico')).length;
  const adminsCount = team.filter(m => m.role === 'admin').length;

  return (
    <div className="bg-[#161A22] border border-[#232833] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#232833]">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-sans">
              Equipe & Responsabilidade Técnica
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Engenheiros habilitados CREA, técnicos e controle de permissões
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenManageModal}
          className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-[#0B0D10] border border-cyan-500/30 text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Gerenciar Equipe</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 my-3">
        <div className="bg-[#0D1017] p-2.5 rounded-lg border border-[#232833]">
          <span className="text-[10px] font-mono text-slate-400 block">Total Membros</span>
          <span className="text-lg font-bold font-mono text-slate-100">{totalMembers}</span>
        </div>
        <div className="bg-[#0D1017] p-2.5 rounded-lg border border-[#232833]">
          <span className="text-[10px] font-mono text-slate-400 block">Ativos Agora</span>
          <span className="text-lg font-bold font-mono text-emerald-400">{activeMembers}</span>
        </div>
        <div className="bg-[#0D1017] p-2.5 rounded-lg border border-[#232833]">
          <span className="text-[10px] font-mono text-slate-400 block">Engenheiros CREA</span>
          <span className="text-lg font-bold font-mono text-amber-400">{engineersCount}</span>
        </div>
        <div className="bg-[#0D1017] p-2.5 rounded-lg border border-[#232833]">
          <span className="text-[10px] font-mono text-slate-400 block">Técnicos CFT</span>
          <span className="text-lg font-bold font-mono text-cyan-400">{techniciansCount}</span>
        </div>
        <div className="bg-[#0D1017] p-2.5 rounded-lg border border-[#232833]">
          <span className="text-[10px] font-mono text-slate-400 block">Administradores</span>
          <span className="text-lg font-bold font-mono text-purple-400">{adminsCount}</span>
        </div>
      </div>

      {/* Member cards list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-1">
        {team.map((member) => (
          <div
            key={member.id}
            className="p-3 rounded-lg bg-[#0D1017] border border-[#232833] flex items-center justify-between gap-2.5 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-[#161A22] border border-[#232833] text-amber-400 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                {member.avatarInitials}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {member.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block truncate">
                  {member.roleTitle}
                </span>
                {member.creaNumber && (
                  <span className="text-[9px] font-mono text-amber-400/90 block truncate">
                    {member.creaNumber}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  member.status === 'ONLINE'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : member.status === 'EM_CAMPO'
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    : 'bg-[#161A22] text-slate-400 border-[#232833]'
                }`}
              >
                {member.status === 'ONLINE' ? 'Online' : member.status === 'EM_CAMPO' ? 'Em Campo' : 'Offline'}
              </span>
              <span className="text-[9px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {member.lastActive}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
