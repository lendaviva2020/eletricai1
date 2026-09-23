'use client';

import React, { useState } from 'react';
import { TeamMember } from '@/types/dashboard';
import { TenantRole } from '@/types/electrical';
import {
  Users,
  X,
  UserPlus,
  ShieldCheck,
  Check,
  Mail,
  Building2,
  Trash2,
} from 'lucide-react';

interface ManageTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamMember[];
  onAddMember: (member: TeamMember) => void;
  onRemoveMember: (id: string) => void;
}

export function ManageTeamModal({
  isOpen,
  onClose,
  team,
  onAddMember,
  onRemoveMember,
}: ManageTeamModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TenantRole>('engineer');
  const [roleTitle, setRoleTitle] = useState<TeamMember['roleTitle']>('Engenheiro Eletricista Sênior');
  const [crea, setCrea] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newMember: TeamMember = {
      id: `team_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      roleTitle,
      creaNumber: crea.trim() || undefined,
      status: 'ONLINE',
      lastActive: 'Agora',
      avatarInitials: name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
    };

    onAddMember(newMember);
    setFeedback(`Membro ${name} adicionado com sucesso!`);
    setName('');
    setEmail('');
    setCrea('');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161A22] border border-[#232833] w-full max-w-2xl rounded-2xl shadow-2xl p-6 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#232833]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Gerenciamento de Equipe da Planta
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Controle de acesso baseado em funções (RBAC) e habilitação CREA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#12161F]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {feedback && (
          <div className="my-3 p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <Check className="h-3.5 w-3.5" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Add Member Form */}
        <form onSubmit={handleSubmit} className="my-4 p-4 rounded-xl bg-[#0D1017] border border-[#232833] space-y-3">
          <div className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1.5">
            <UserPlus className="h-3.5 w-3.5" />
            <span>Adicionar Novo Integrante</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Eng. Roberto Vasconcelos"
                className="w-full px-2.5 py-1.5 rounded bg-[#161A22] border border-[#232833] text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">E-mail Corporativo</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="roberto.v@copacol.ind.br"
                className="w-full px-2.5 py-1.5 rounded bg-[#161A22] border border-[#232833] text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Papel (RBAC)</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as TenantRole)}
                className="w-full px-2 py-1.5 rounded bg-[#161A22] border border-[#232833] text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="admin">Administrador</option>
                <option value="engineer">Engenheiro</option>
                <option value="member">Técnico / Membro</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Função Técnica</label>
              <select
                value={roleTitle}
                onChange={e => setRoleTitle(e.target.value as TeamMember['roleTitle'])}
                className="w-full px-2 py-1.5 rounded bg-[#161A22] border border-[#232833] text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Engenheiro Eletricista Sênior">Engenheiro Eletricista Sênior</option>
                <option value="Engenheiro de Automação">Engenheiro de Automação</option>
                <option value="Técnico em Eletrotécnica">Técnico em Eletrotécnica</option>
                <option value="Coordenador de Manutenção">Coordenador de Manutenção</option>
                <option value="Administrador da Planta">Administrador da Planta</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Registro CREA / CFT</label>
              <input
                type="text"
                value={crea}
                onChange={e => setCrea(e.target.value)}
                placeholder="Ex: CREA-PR 99.123/D"
                className="w-full px-2.5 py-1.5 rounded bg-[#161A22] border border-[#232833] text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0B0D10] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Cadastrar Membro</span>
            </button>
          </div>
        </form>

        {/* Existing Members Table */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Integrantes Cadastrados ({team.length})
          </div>
          {team.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D1017] border border-[#232833] text-xs font-mono"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                  {m.avatarInitials}
                </div>
                <div>
                  <span className="font-bold text-slate-200 block">{m.name}</span>
                  <span className="text-[10px] text-slate-400">{m.roleTitle} {m.creaNumber ? `• ${m.creaNumber}` : ''}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#161A22] border border-[#232833] text-slate-300">
                  {m.role.toUpperCase()}
                </span>
                {team.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember(m.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remover acesso"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-[#232833] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#0D1017] border border-[#232833] text-slate-300 hover:text-white text-xs font-mono transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
