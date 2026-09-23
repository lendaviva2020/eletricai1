'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { useSettings } from '@/components/shared/SettingsContext';
import { SystemNotification, IndustrialProject } from '@/types/dashboard';
import {
  Search,
  Bell,
  Building2,
  ChevronDown,
  UserCheck,
  LogOut,
  Settings,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Check,
  Sparkles,
  AlertTriangle,
  FileSpreadsheet,
  Cpu,
  Layers,
  Home,
  X,
} from 'lucide-react';

interface DashboardHeaderProps {
  notifications: SystemNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onClearAllNotifications: () => void;
  onOpenNewProjectModal: () => void;
  projects: IndustrialProject[];
  onSelectProject: (project: IndustrialProject) => void;
}

export function DashboardHeader({
  notifications,
  onMarkNotificationAsRead,
  onClearAllNotifications,
  onOpenNewProjectModal,
  projects,
  onSelectProject,
}: DashboardHeaderProps) {
  const {
    user,
    tenant,
    logout,
    setIsSelectingTenant,
    setActiveTab,
    setIsViewingLanding,
    sharedTags,
  } = useWorkspace();

  const { openSettings } = useSettings();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Notifications Popover
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Profile Dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Time of day greeting
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  });

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered items for global search
  const filteredProjects = searchQuery.trim()
    ? projects.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.typeLabel.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredTags = searchQuery.trim()
    ? sharedTags.filter(
        t =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="w-full bg-[#11141A] border-b border-[#232833] px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-md">
      {/* 1. Left: Personalized Greeting & Current Tenant */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-100 font-sans tracking-tight">
            {greeting}, <span className="text-amber-400">{user.name.replace('Eng. ', '').replace('Engª. ', '')}</span>
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => setIsSelectingTenant(true)}
              className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-300 hover:text-amber-400 transition-colors"
              title="Clique para alternar entre unidades industriais"
            >
              <Building2 className="h-3 w-3 text-amber-400 shrink-0" />
              <span className="font-semibold underline decoration-slate-600 underline-offset-2">
                {tenant.name}
              </span>
            </button>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
              {tenant.plan}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Center: Global Search Input with Ctrl+K shortcut */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            id="global-dashboard-search"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Buscar projetos, tags (%Q0.2, Q02), circuitos..."
            className="w-full pl-9 pr-14 py-1.5 rounded-lg bg-[#161A22] border border-[#232833] text-xs font-mono text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-amber-500/70 transition-colors"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="h-3 w-3" />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#11141A] border border-[#232833] text-slate-400">
              Ctrl+K
            </kbd>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {isSearchFocused && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#161A22] border border-[#232833] rounded-lg shadow-2xl p-2 z-50 text-xs font-mono max-h-80 overflow-y-auto">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider px-2 py-1 font-sans">
              Projetos Encontrados ({filteredProjects.length})
            </div>
            {filteredProjects.length > 0 ? (
              filteredProjects.map(proj => (
                <button
                  key={proj.id}
                  onClick={() => {
                    onSelectProject(proj);
                    setIsSearchFocused(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1E232E] text-slate-200 flex items-center justify-between group transition-colors"
                >
                  <div>
                    <span className="font-semibold text-slate-100 block">{proj.name}</span>
                    <span className="text-[10px] text-slate-400">{proj.code} • {proj.typeLabel}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-amber-400 transition-colors" />
                </button>
              ))
            ) : (
              <div className="text-slate-400 text-[11px] px-2 py-1">Nenhum projeto coincidente</div>
            )}

            <div className="text-[10px] text-slate-400 uppercase tracking-wider px-2 pt-2 pb-1 font-sans border-t border-[#232833] mt-1">
              Tags do Barramento PLC ({filteredTags.length})
            </div>
            {filteredTags.length > 0 ? (
              filteredTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => {
                    setActiveTab('unifilar');
                    setIsSearchFocused(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1E232E] text-slate-200 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">{tag.name}</span>
                    <span className="text-slate-400 text-[10px]">{tag.address}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{tag.description}</span>
                </button>
              ))
            ) : (
              <div className="text-slate-400 text-[11px] px-2 py-1">Nenhuma tag coincidente</div>
            )}
          </div>
        )}
      </div>

      {/* 3. Right: Notifications, Quick Actions & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Landing Page Link */}
        <button
          type="button"
          onClick={() => setIsViewingLanding(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#161A22] border border-[#232833] hover:border-slate-600 text-slate-300 hover:text-white text-xs font-mono transition-colors hidden sm:flex"
          title="Ver Landing Page Institucional"
        >
          <Home className="h-3.5 w-3.5 text-amber-400" />
          <span>Início</span>
        </button>

        {/* Notifications Popover Toggle */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(p => !p)}
            className="p-1.5 rounded-lg bg-[#161A22] border border-[#232833] hover:border-slate-600 text-slate-300 hover:text-white relative transition-colors"
            title="Central de Notificações"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-[#0B0D10] text-[9px] font-mono font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#161A22] border border-[#232833] rounded-xl shadow-2xl p-3 z-50 animate-fade-in font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-[#232833]">
                <div className="flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-slate-100">Notificações do Sistema</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onClearAllNotifications}
                    className="text-[10px] font-mono text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    Marcar todas lidas
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#1F2633] max-h-72 overflow-y-auto my-1">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onMarkNotificationAsRead(n.id);
                        if (n.targetTab) setActiveTab(n.targetTab);
                        setNotificationsOpen(false);
                      }}
                      className={`py-2 px-1 cursor-pointer hover:bg-[#1E232E] rounded transition-colors ${
                        !n.isRead ? 'bg-[#191F2C]/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-xs font-semibold ${!n.isRead ? 'text-amber-400' : 'text-slate-200'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400 font-mono">
                    Nenhuma notificação no momento.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* System Settings Cog */}
        <button
          type="button"
          onClick={() => openSettings()}
          className="p-1.5 rounded-lg bg-[#161A22] border border-[#232833] hover:border-amber-500/50 text-slate-300 hover:text-amber-400 transition-colors group"
          title="Configurações do Sistema Industrial"
        >
          <Settings className="h-4 w-4 group-hover:rotate-45 transition-transform duration-200" />
        </button>

        {/* Primary CTA "+ Novo projeto" */}
        <button
          type="button"
          onClick={onOpenNewProjectModal}
          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0B0D10] font-black text-xs font-mono tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[3]" />
          <span className="hidden sm:inline">+ NOVO PROJETO</span>
          <span className="sm:hidden">+ NOVO</span>
        </button>

        {/* Abrir Workspace CTA */}
        <button
          type="button"
          onClick={() => setActiveTab('unifilar')}
          className="px-3 py-1.5 rounded-lg bg-[#161A22] border border-[#232833] hover:border-amber-500/50 text-slate-200 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5"
          title="Ir para os Editores de Engenharia do Workspace"
        >
          <Cpu className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden md:inline font-semibold">Workspace</span>
        </button>

        {/* Profile Avatar & Menu */}
        <div ref={profileRef} className="relative pl-1">
          <button
            type="button"
            onClick={() => setProfileOpen(p => !p)}
            className="flex items-center gap-2 p-0.5 rounded-lg hover:bg-[#161A22] transition-colors"
          >
            <div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-mono text-[11px] font-bold">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#161A22] border border-[#232833] rounded-xl shadow-2xl p-3 z-50 animate-fade-in font-sans text-xs">
              <div className="pb-2.5 border-b border-[#232833]">
                <span className="font-bold text-slate-100 block">{user.name}</span>
                <span className="text-[11px] text-slate-400 font-mono block">{user.email}</span>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    {user.role.toUpperCase()}
                  </span>
                  {user.creaNumber && (
                    <span className="text-[10px] font-mono text-slate-400">
                      {user.creaNumber}
                    </span>
                  )}
                </div>
              </div>

              <div className="py-2 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    setIsSelectingTenant(true);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-[#1E232E] text-slate-300 flex items-center gap-2 transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  <span>Alternar Empresa / Tenant</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    openSettings('workspace');
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-[#1E232E] text-slate-300 flex items-center gap-2 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>Configurações do Sistema</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#232833]">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-rose-500/10 text-rose-400 flex items-center gap-2 transition-colors font-mono"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Encerrar Sessão</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
