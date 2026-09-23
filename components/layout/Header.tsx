'use client';

import React, { useState } from 'react';
import { useWorkspace, WhatIfScenario } from '@/components/shared/WorkspaceContext';
import { useSettings } from '@/components/shared/SettingsContext';
import { ScreenNavigationDropdown } from '@/components/layout/ScreenNavigationDropdown';
import { TenantRole } from '@/types/electrical';
import {
  Zap,
  ShieldCheck,
  Building2,
  UserCheck,
  Play,
  Pause,
  Download,
  AlertTriangle,
  Cpu,
  FileSpreadsheet,
  Activity,
  LogOut,
  Home,
  Settings,
} from 'lucide-react';

export function Header() {
  const {
    tenant,
    setTenant,
    user,
    setUserRole,
    logout,
    isSimulationRunning,
    setIsSimulationRunning,
    whatIfScenario,
    setWhatIfScenario,
    downloadDxf,
    downloadPlcopenXml,
    setActiveTab,
    setIsSelectingTenant,
    setIsViewingLanding,
  } = useWorkspace();

  const { openSettings } = useSettings();

  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const tenantsList = [
    {
      id: 'tenant_paulinia_01',
      name: 'Indústria Química Paulínia S/A',
      cnpj: '45.123.890/0001-92',
      location: 'Paulínia - SP, Brasil',
      plan: 'Enterprise Multi-Plant' as const,
      currency: 'BRL' as const,
    },
    {
      id: 'tenant_usina_tiete',
      name: 'Usina Bioelétrica Vale do Tietê',
      cnpj: '12.456.789/0002-14',
      location: 'Araçatuba - SP, Brasil',
      plan: 'Enterprise Multi-Plant' as const,
      currency: 'BRL' as const,
    },
    {
      id: 'tenant_acoforte',
      name: 'Siderúrgica AçoForte Brasil',
      cnpj: '98.765.432/0001-05',
      location: 'Contagem - MG, Brasil',
      plan: 'Industrial Pro' as const,
      currency: 'BRL' as const,
    },
  ];

  return (
    <header className="w-full bg-[#11141A] border-b border-[#232833] text-slate-200 select-none z-30 sticky top-0">
      {/* Top Banner Bar */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#1A1F29]">
        {/* Left: Brand & Project */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Zap className="h-4 w-4 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-wider text-slate-100 font-sans">
                  ELETRIC<span className="text-amber-400 font-black">AI</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#161A22] border border-[#232833] text-amber-300/90 font-mono">
                  v2.4 LTS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-tight">
                Sistema Operacional Industrial com IA
              </p>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-[#232833]" />

          {/* Quick Navigation: Landing Page & Screen Dropdown */}
          <div className="flex items-center gap-1.5">
            {/* Voltar para Início / Landing Page button */}
            <button
              type="button"
              onClick={() => setIsViewingLanding(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#161A22] border border-[#232833] hover:border-amber-500/60 hover:text-white text-xs font-mono text-slate-200 transition-colors shadow-sm"
              title="Voltar para a Página Inicial / Landing Page Institucional"
            >
              <Home className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline font-medium">Início / Landing</span>
            </button>

            {/* Interactive Screen Navigation Dropdown */}
            <ScreenNavigationDropdown />
          </div>

          <div className="h-5 w-[1px] bg-[#232833] hidden md:block" />

          {/* Project Title */}
          <div className="hidden md:flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">
                CCM-01 Planta Moagem & Compressão
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ABNT CONFORME
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              380V / 220V - 60 Hz | TN-S | Icw 35 kA
            </span>
          </div>
        </div>

        {/* Center: Normative Badges */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-[#161A22] border border-[#232833] text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-amber-300/90 font-semibold">NBR 5410</span>
            <span className="text-slate-400 text-[9px]">(BT)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-[#161A22] border border-[#232833] text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-cyan-300/90 font-semibold">NBR 14039</span>
            <span className="text-slate-400 text-[9px]">(MT)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-[#161A22] border border-[#232833] text-slate-300">
            <AlertTriangle className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-300/90 font-semibold">NR-10</span>
            <span className="text-slate-400 text-[9px]">(Segurança)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-[#161A22] border border-[#232833] text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-blue-300/90 font-semibold">IEC 61131-3</span>
          </div>
        </div>

        {/* Right: Tenant, User Role, Simulation & Exports */}
        <div className="flex items-center gap-3">
          {/* Simulation Toggle */}
          <button
            onClick={() => setIsSimulationRunning(p => !p)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
              isSimulationRunning
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/40'
            }`}
            title="Pausar / Retomar loop de simulação e telemetria"
          >
            {isSimulationRunning ? (
              <>
                <Pause className="h-3 w-3 fill-emerald-400" />
                <span className="hidden sm:inline">SIM LIVE</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-amber-400" />
                <span className="hidden sm:inline">PAUSADO</span>
              </>
            )}
          </button>

          {/* What-if Quick Simulator */}
          <div className="hidden xl:flex items-center gap-1 bg-[#161A22] border border-[#232833] px-2 py-1 rounded text-xs">
            <Activity className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[10px] text-slate-400 uppercase font-mono">Modo E-se?:</span>
            <select
              value={whatIfScenario}
              onChange={(e) => setWhatIfScenario(e.target.value as WhatIfScenario)}
              aria-label="Cenário de simulação E-se?"
              className="bg-transparent text-amber-300 text-xs font-mono outline-none cursor-pointer"
            >
              <option value="normal" className="bg-[#161A22] text-slate-200">Operação Normal</option>
              <option value="overload_trip" className="bg-[#161A22] text-red-400">Sobrecarga 150% (Trip)</option>
              <option value="high_temp" className="bg-[#161A22] text-orange-400">Falha Refrigeração 85°C</option>
              <option value="grid_failure" className="bg-[#161A22] text-yellow-400">Queda Concessionária MT</option>
            </select>
          </div>

          {/* Tenant Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161A22] border border-[#232833] hover:border-slate-600 text-xs text-slate-200 transition-colors"
            >
              <Building2 className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline max-w-[120px] truncate text-slate-300 font-medium">
                {tenant.name.split(' ')[0]}
              </span>
            </button>

            {tenantDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-[#161A22] border border-[#232833] rounded shadow-xl py-1 z-50">
                <div className="px-3 py-1.5 border-b border-[#232833] text-[10px] uppercase font-mono text-slate-400">
                  Tenants Multi-Empresa (RLS)
                </div>
                {tenantsList.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTenant(t);
                      setTenantDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#232833] flex flex-col gap-0.5 ${
                      tenant.id === t.id ? 'bg-[#1E2430] border-l-2 border-amber-400' : ''
                    }`}
                  >
                    <span className="font-semibold text-slate-200">{t.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{t.cnpj} - {t.location}</span>
                  </button>
                ))}
                <div className="pt-1 mt-1 border-t border-[#232833]">
                  <button
                    type="button"
                    onClick={() => {
                      setTenantDropdownOpen(false);
                      setIsSelectingTenant(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono text-amber-400 hover:text-amber-300 hover:bg-[#232833] flex items-center justify-between"
                  >
                    <span>Router de Organizações</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Role Badge */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161A22] border border-[#232833] hover:border-slate-600 text-xs text-slate-200 transition-colors"
            >
              <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span
                className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                  user.role === 'admin'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : user.role === 'engineer'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {user.role}
              </span>
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-[#161A22] border border-[#232833] rounded shadow-xl py-1 z-50">
                <div className="px-3 py-1.5 border-b border-[#232833] text-[10px] font-mono text-slate-400">
                  Papel de Acesso (RBAC)
                </div>
                {(['admin', 'engineer', 'member'] as TenantRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setUserRole(r);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#232833] capitalize flex items-center justify-between ${
                      user.role === r ? 'text-amber-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span>{r}</span>
                    {user.role === r && <span className="text-[10px] font-mono">Ativo</span>}
                  </button>
                ))}
                <div className="px-3 py-1 border-t border-[#232833] text-[9px] text-slate-500 font-mono">
                  {user.creaNumber}
                </div>
                <div className="pt-1 border-t border-[#232833] space-y-0.5">
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      setIsViewingLanding(true);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/10 flex items-center gap-1.5 transition-colors font-mono"
                  >
                    <Zap className="h-3 w-3" />
                    <span>Site Institucional</span>
                  </button>
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 transition-colors font-mono"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>Bloquear / Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Exports & Logout */}
          <div className="flex items-center gap-1">
            <button
              onClick={downloadDxf}
              className="p-1.5 rounded bg-[#161A22] border border-[#232833] hover:border-amber-500/50 text-slate-300 hover:text-amber-400 transition-colors"
              title="Exportar CAD Unifilar em DXF"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('bom')}
              className="p-1.5 rounded bg-[#161A22] border border-[#232833] hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 transition-colors"
              title="Ver BOM e Memorial Descritivo"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => openSettings()}
              className="p-1.5 rounded bg-[#161A22] border border-[#232833] hover:border-amber-500/50 text-slate-300 hover:text-amber-400 transition-colors flex items-center justify-center group"
              title="Configurações do Sistema Industrial (Normas ABNT, UI, IA Copilot, Rede CLP)"
            >
              <Settings className="h-3.5 w-3.5 text-slate-300 group-hover:text-amber-400 group-hover:rotate-45 transition-transform duration-200" />
            </button>
            <button
              onClick={logout}
              className="px-2 py-1 rounded bg-[#161A22] border border-[#232833] hover:border-amber-500/50 text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1 text-[11px] font-mono"
              title="Sair da sessão e voltar à Tela de Login"
            >
              <LogOut className="h-3 w-3 text-amber-400" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
