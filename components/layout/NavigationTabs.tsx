'use client';

import React from 'react';
import { useWorkspace, WorkspaceTab } from '@/components/shared/WorkspaceContext';
import { useSettings } from '@/components/shared/SettingsContext';
import {
  LayoutDashboard,
  Network,
  Split,
  Binary,
  Layers,
  Cpu,
  Tv,
  Boxes,
  FileSpreadsheet,
  Bot,
  Sparkles,
  Home,
  Settings,
} from 'lucide-react';

interface TabItem {
  id: WorkspaceTab;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

export function NavigationTabs() {
  const { activeTab, setActiveTab, activePatch, setIsViewingLanding } = useWorkspace();
  const { openSettings } = useSettings();

  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Hub de Comando', icon: LayoutDashboard, badge: 'Plant Hub', accentColor: 'text-amber-400' },
    { id: 'unifilar', label: 'Unifilar CAD', icon: Network, accentColor: 'text-amber-400' },
    { id: 'multifilar', label: 'Multifilar 1-Clique', icon: Split, badge: 'L1/L2/L3/N/PE', accentColor: 'text-cyan-400' },
    { id: 'ladder', label: 'Ladder IEC 61131-3', icon: Binary, badge: 'TON/TOF', accentColor: 'text-emerald-400' },
    { id: 'fbd', label: 'FBD Blocos', icon: Layers, accentColor: 'text-blue-400' },
    { id: 'plc', label: 'Rack PLC & I/O', icon: Cpu, badge: 'PLCopen', accentColor: 'text-purple-400' },
    { id: 'scada', label: 'SCADA Mímico', icon: Tv, badge: 'Sandbox Worker', accentColor: 'text-amber-400' },
    { id: 'digital_twin', label: 'Digital Twin 3D', icon: Boxes, badge: 'WebGL', accentColor: 'text-emerald-400' },
    { id: 'bom', label: 'BOM & Memorial', icon: FileSpreadsheet, badge: 'R$ NBR 5410', accentColor: 'text-cyan-400' },
    { id: 'ai_copilot', label: 'IA Copilot & Patch Diff', icon: Bot, badge: activePatch ? 'Patch Pendente' : 'IA Nativa', accentColor: 'text-amber-400' },
  ];

  return (
    <div className="w-full bg-[#0D1017] border-b border-[#232833] px-3 flex items-center justify-between overflow-x-auto select-none no-scrollbar">
      <div className="flex items-center gap-1 py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t transition-all whitespace-nowrap relative border-b-2 ${
                isActive
                  ? 'bg-[#161A22] text-slate-100 border-amber-400 shadow-[inset_0_1px_0_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#131720] border-transparent'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? tab.accentColor : 'text-slate-400'}`} />
              <span>{tab.label}</span>

              {tab.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                    tab.id === 'ai_copilot' && activePatch
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                      : isActive
                      ? 'bg-[#1F2633] text-slate-300 border-[#2D3748]'
                      : 'bg-[#161A22] text-slate-400 border-[#232833]'
                  }`}
                >
                  {tab.id === 'ai_copilot' && activePatch ? (
                    <span className="flex items-center gap-1 font-bold">
                      <Sparkles className="h-2 w-2 text-amber-400" />
                      1 PATCH
                    </span>
                  ) : (
                    tab.badge
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right side quick actions */}
      <div className="hidden xl:flex items-center gap-1.5 pl-3 py-1 shrink-0">
        <button
          type="button"
          onClick={() => setIsViewingLanding(true)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono text-slate-400 hover:text-amber-400 hover:bg-[#161A22] border border-transparent hover:border-[#232833] transition-colors"
          title="Voltar para a Landing Page Institucional"
        >
          <Home className="h-3 w-3 text-amber-400" />
          <span>Início</span>
        </button>

        <button
          type="button"
          onClick={() => openSettings()}
          className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-[#161A22] border border-transparent hover:border-[#232833] transition-colors"
          title="Abrir Configurações do Sistema"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

