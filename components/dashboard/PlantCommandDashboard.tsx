'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { useSettings } from '@/components/shared/SettingsContext';
import {
  IndustrialProject,
  IndustrialAlert,
  ActivityEvent,
  TeamMember,
  SystemNotification,
} from '@/types/dashboard';
import {
  INITIAL_PROJECTS,
  INITIAL_ALERTS,
  INITIAL_ACTIVITIES,
  INITIAL_TEAM,
  INITIAL_NOTIFICATIONS,
} from '@/lib/dashboard-data';
import { DashboardSidebar, DashboardActiveView } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { MainSummaryCards } from './MainSummaryCards';
import { RecentProjectsSection } from './RecentProjectsSection';
import { RecentActivityTimeline } from './RecentActivityTimeline';
import { AlertsCenterSection } from './AlertsCenterSection';
import { EletricAiIntelligenceCard } from './EletricAiIntelligenceCard';
import { IndustrialMonitoringSummary } from './IndustrialMonitoringSummary';
import { IndicatorsSection } from './IndicatorsSection';
import { TeamSection } from './TeamSection';
import { ManageTeamModal } from './ManageTeamModal';
import { NewProjectModal } from './NewProjectModal';
import { HelpModal } from './HelpModal';
import { LayoutDashboard, FolderGit2, AlertTriangle, Activity, Users } from 'lucide-react';

export function PlantCommandDashboard() {
  const { setActiveTab } = useWorkspace();
  const { openSettings } = useSettings();

  // State
  const [currentView, setCurrentView] = useState<DashboardActiveView>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<IndustrialProject[]>(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<IndustrialProject>(INITIAL_PROJECTS[0]);
  const [alerts, setAlerts] = useState<IndustrialAlert[]>(INITIAL_ALERTS);
  const [activities, setActivities] = useState<ActivityEvent[]>(INITIAL_ACTIVITIES);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);

  // Modals state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isManageTeamModalOpen, setIsManageTeamModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Notifications handlers
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Add new project
  const handleAddProject = (newProject: IndustrialProject) => {
    setProjects(prev => [newProject, ...prev]);
    setSelectedProject(newProject);
    const newActivity: ActivityEvent = {
      id: `act_${Date.now()}`,
      type: 'PROJECT_CREATED',
      title: `Projeto "${newProject.name}" Criado`,
      description: `Iniciado novo diagrama sob norma ${newProject.normativeStandard} (${newProject.nominalVoltage}).`,
      timestamp: 'Agora',
      user: { name: newProject.updatedBy.name, role: newProject.updatedBy.role },
      badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      targetTab: newProject.targetTab,
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  // Toggle resolve alert
  const handleToggleResolveAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(a => {
        if (a.id === id) {
          const nextResolved = !a.isResolved;
          return {
            ...a,
            isResolved: nextResolved,
            severity: nextResolved ? 'RESOLVIDO' : 'ATENCAO',
          };
        }
        return a;
      })
    );
  };

  // Add team member
  const handleAddTeamMember = (member: TeamMember) => {
    setTeam(prev => [...prev, member]);
    const newActivity: ActivityEvent = {
      id: `act_${Date.now()}`,
      type: 'MEMBER_ADDED',
      title: `Novo Membro: ${member.name}`,
      description: `Integrado com função ${member.roleTitle} ${member.creaNumber ? `(${member.creaNumber})` : ''}.`,
      timestamp: 'Agora',
      user: { name: 'Eng. Luis Felipe', role: 'admin' },
      badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  // Remove team member
  const handleRemoveTeamMember = (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
  };

  const criticalAlertCount = alerts.filter(a => a.severity === 'CRITICO' && !a.isResolved).length;

  return (
    <div className="flex w-full h-full bg-[#0B0D10] text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Sidebar */}
      <DashboardSidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(p => !p)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        criticalAlertCount={criticalAlertCount}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header */}
        <DashboardHeader
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onClearAllNotifications={handleClearAllNotifications}
          onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
          projects={projects}
          onSelectProject={p => {
            setSelectedProject(p);
            setActiveTab(p.targetTab);
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(p => !p)}
        />

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
          {/* View: Overview (Hub Principal) */}
          {currentView === 'overview' && (
            <>
              {/* 1. Main Summary Cards */}
              <MainSummaryCards
                projects={projects}
                alerts={alerts}
                team={team}
                onSelectProjectsView={() => setCurrentView('projects')}
                onSelectAlertsView={() => setCurrentView('alerts')}
                onSelectTeamView={() => setCurrentView('team')}
              />

              {/* 2. EletricAI Intelligence Spotlight */}
              <EletricAiIntelligenceCard selectedProject={selectedProject} />

              {/* 3. Recent Projects & Recent Activity */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <div className="xl:col-span-2">
                  <RecentProjectsSection
                    projects={projects}
                    onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
                    onSelectProject={setSelectedProject}
                  />
                </div>
                <div className="xl:col-span-1">
                  <RecentActivityTimeline activities={activities} />
                </div>
              </div>

              {/* 4. Alerts Center */}
              <AlertsCenterSection
                alerts={alerts}
                onToggleResolveAlert={handleToggleResolveAlert}
              />

              {/* 5. Industrial Monitoring Summary */}
              <IndustrialMonitoringSummary />

              {/* 6. Indicators & Team Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <IndicatorsSection projects={projects} alerts={alerts} />
                <TeamSection
                  team={team}
                  onOpenManageModal={() => setIsManageTeamModalOpen(true)}
                />
              </div>
            </>
          )}

          {/* View: Projects specific filter */}
          {currentView === 'projects' && (
            <div className="space-y-5">
              <RecentProjectsSection
                projects={projects}
                onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
                onSelectProject={setSelectedProject}
              />
              <IndicatorsSection projects={projects} alerts={alerts} />
            </div>
          )}

          {/* View: Alerts specific filter */}
          {currentView === 'alerts' && (
            <div className="space-y-5">
              <AlertsCenterSection
                alerts={alerts}
                onToggleResolveAlert={handleToggleResolveAlert}
              />
              <EletricAiIntelligenceCard selectedProject={selectedProject} />
            </div>
          )}

          {/* View: Monitoring specific filter */}
          {currentView === 'monitoring' && (
            <div className="space-y-5">
              <IndustrialMonitoringSummary />
              <IndicatorsSection projects={projects} alerts={alerts} />
            </div>
          )}

          {/* View: Team specific filter */}
          {currentView === 'team' && (
            <div className="space-y-5">
              <TeamSection
                team={team}
                onOpenManageModal={() => setIsManageTeamModalOpen(true)}
              />
              <RecentActivityTimeline activities={activities} />
            </div>
          )}

          {/* View: Indicators specific filter */}
          {currentView === 'indicators' && (
            <div className="space-y-5">
              <IndicatorsSection projects={projects} alerts={alerts} />
              <IndustrialMonitoringSummary />
            </div>
          )}
        </main>

        {/* Mobile View Navigation Bar */}
        <div className="md:hidden border-t border-[#232833] bg-[#0D1017] px-2 py-1.5 flex items-center justify-around z-20 shrink-0 select-none">
          <button
            onClick={() => setCurrentView('overview')}
            className={`flex flex-col items-center gap-0.5 p-1 rounded text-[10px] font-mono transition-colors ${
              currentView === 'overview' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Hub</span>
          </button>
          <button
            onClick={() => setCurrentView('projects')}
            className={`flex flex-col items-center gap-0.5 p-1 rounded text-[10px] font-mono transition-colors ${
              currentView === 'projects' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="h-4 w-4" />
            <span>Projetos</span>
          </button>
          <button
            onClick={() => setCurrentView('alerts')}
            className={`flex flex-col items-center gap-0.5 p-1 rounded text-[10px] font-mono relative transition-colors ${
              currentView === 'alerts' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Alertas</span>
            {criticalAlertCount > 0 && (
              <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setCurrentView('monitoring')}
            className={`flex flex-col items-center gap-0.5 p-1 rounded text-[10px] font-mono transition-colors ${
              currentView === 'monitoring' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Telemetria</span>
          </button>
          <button
            onClick={() => setCurrentView('team')}
            className={`flex flex-col items-center gap-0.5 p-1 rounded text-[10px] font-mono transition-colors ${
              currentView === 'team' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Equipe</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onAddProject={handleAddProject}
      />

      <ManageTeamModal
        isOpen={isManageTeamModalOpen}
        onClose={() => setIsManageTeamModalOpen(false)}
        team={team}
        onAddMember={handleAddTeamMember}
        onRemoveMember={handleRemoveTeamMember}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
