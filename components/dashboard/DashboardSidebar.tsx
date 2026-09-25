'use client';

import React, { useEffect } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { useSettings } from '@/components/shared/SettingsContext';
import {
  LayoutDashboard,
  FolderGit2,
  Cpu,
  Bot,
  Activity,
  AlertTriangle,
  Library,
  Users,
  FileSpreadsheet,
  Building2,
  Settings,
  HelpCircle,
  Zap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Radio,
  LogOut,
  X,
} from 'lucide-react';

export type DashboardActiveView =
  | 'overview'
  | 'projects'
  | 'alerts'
  | 'monitoring'
  | 'team'
  | 'indicators';

interface DashboardSidebarProps {
  currentView: DashboardActiveView;
  onSelectView: (view: DashboardActiveView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenHelp: () => void;
  criticalAlertCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function DashboardSidebar({
  currentView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  onOpenHelp,
  criticalAlertCount,
  isMobileOpen = false,
  onCloseMobile,
}: DashboardSidebarProps) {
  const { setActiveTab, setIsSelectingTenant, isSimulationRunning, logout } = useWorkspace();
  const { openSettings } = useSettings();

  // Close on ESC key when mobile drawer is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const handleNavClick = (action: () => void) => {
    action();
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const mainNavItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard,
      action: () => onSelectView('overview'),
      isActive: currentView === 'overview',
      badge: 'Hub',
    },
    {
      id: 'projects',
      label: 'Projetos',
      icon: FolderGit2,
      action: () => onSelectView('projects'),
      isActive: currentView === 'projects',
      badge: '4',
    },
    {
      id: 'workspace',
      label: 'Workspace',
      icon: Cpu,
      action: () => setActiveTab('unifilar'),
      isActive: false,
      badge: 'CAD/CLP',
      accentColor: 'text-amber-400',
    },
    {
      id: 'eletricai_ia',
      label: 'EletricAi IA',
      icon: Bot,
      action: () => setActiveTab('ai_copilot'),
      isActive: false,
      badge: 'Copilot',
      accentColor: 'text-amber-400',
    },
    {
      id: 'monitoring',
      label: 'Monitoramento',
      icon: Activity,
      action: () => onSelectView('monitoring'),
      isActive: currentView === 'monitoring',
      badge: isSimulationRunning ? 'Live' : 'Pausa',
      badgeColor: isSimulationRunning ? 'text-emerald-400 border-emerald-500/30' : 'text-slate-400 border-slate-700',
    },
    {
      id: 'alerts',
      label: 'Alertas',
      icon: AlertTriangle,
      action: () => onSelectView('alerts'),
      isActive: currentView === 'alerts',
      badge: criticalAlertCount > 0 ? `${criticalAlertCount} Crítico` : 'Normal',
      badgeColor: criticalAlertCount > 0 ? 'text-rose-400 border-rose-500/40 bg-rose-500/10' : undefined,
    },
    {
      id: 'library',
      label: 'Biblioteca',
      icon: Library,
      action: () => setActiveTab('unifilar'),
      isActive: false,
      badge: 'NBR',
    },
    {
      id: 'team',
      label: 'Equipe',
      icon: Users,
      action: () => onSelectView('team'),
      isActive: currentView === 'team',
      badge: '5',
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: FileSpreadsheet,
      action: () => setActiveTab('bom'),
      isActive: false,
      badge: 'BOM/ART',
    },
  ];

  const bottomNavItems = [
    {
      id: 'org',
      label: 'Organização',
      icon: Building2,
      action: () => setIsSelectingTenant(true),
      title: 'Alternar Planta / Multi-tenant',
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      action: () => openSettings(),
      title: 'Configurações de Normas, UI, IA e Barramento',
    },
    {
      id: 'help',
      label: 'Ajuda',
      icon: HelpCircle,
      action: onOpenHelp,
      title: 'Normas ABNT, Manuais e Suporte Técnico',
    },
    {
      id: 'logout',
      label: 'Sair',
      icon: LogOut,
      action: logout,
      title: 'Encerrar Sessão e Sair do Sistema',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 md:relative md:z-30 h-full bg-[#0D1017] border-r border-[#232833] flex flex-col shrink-0 transition-transform md:transition-all duration-200 select-none ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-16' : 'md:w-64'} w-72 max-w-[85vw]`}
      >
        {/* Top Header Logo */}
        <div className="h-14 px-3 flex items-center justify-between border-b border-[#1A1F29] gap-2">
          <div className={`flex items-center gap-2.5 overflow-hidden ${isCollapsed ? 'md:justify-center md:w-full' : ''}`}>
            <div className="h-8 w-8 rounded bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="h-4 w-4 fill-amber-400" />
            </div>
            <div className={`flex flex-col min-w-0 ${isCollapsed ? 'md:hidden' : ''}`}>
              <span className="font-bold text-sm tracking-wider text-slate-100 font-sans truncate">
                ELETRIC<span className="text-amber-400 font-black">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-tight truncate">
                Plataforma Industrial
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#161A22] border border-[#232833] transition-colors"
                title="Fechar menu lateral"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Desktop Collapse Button */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden md:flex p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#161A22] border border-transparent hover:border-[#232833] transition-colors"
                title="Recolher Sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Nav Items */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 no-scrollbar">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.action)}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative cursor-pointer ${
                  item.isActive
                    ? 'bg-[#161A22] text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#12161F] border border-transparent'
                } ${isCollapsed ? 'md:justify-center md:px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    item.isActive
                      ? 'text-amber-400'
                      : item.accentColor || 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />

                <div className={`flex items-center justify-between flex-1 min-w-0 ${isCollapsed ? 'md:hidden' : ''}`}>
                  <span className="truncate text-left font-sans">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ml-1.5 shrink-0 ${
                        item.badgeColor ||
                        (item.isActive
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-[#161A22] text-slate-400 border-[#232833]')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Nav / Divider */}
        <div className="p-2 border-t border-[#1A1F29] space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.action)}
                className={`w-full flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#12161F] border border-transparent transition-all group cursor-pointer ${
                  isCollapsed ? 'md:justify-center md:px-0' : ''
                } ${item.id === 'logout' ? 'hover:text-rose-400 hover:bg-rose-500/10' : ''}`}
                title={item.title}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    item.id === 'logout'
                      ? 'text-rose-400'
                      : 'text-slate-400 group-hover:text-amber-400'
                  }`}
                />
                <span className={`truncate text-left font-sans ${isCollapsed ? 'md:hidden' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Expand button when collapsed */}
          {isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden md:flex w-full items-center justify-center py-1.5 text-slate-400 hover:text-amber-400 hover:bg-[#12161F] rounded-lg transition-colors mt-1"
              title="Expandir Sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Normative footer watermark */}
        <div className={`p-3 bg-[#090B0E] border-t border-[#161A22] text-[10px] font-mono text-slate-400 flex items-center justify-between ${isCollapsed ? 'md:hidden' : ''}`}>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>NBR 5410 / NR-10</span>
          </div>
          <span className="text-slate-400">v2.4 LTS</span>
        </div>
      </aside>
    </>
  );
}
