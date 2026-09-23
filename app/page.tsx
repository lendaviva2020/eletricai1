'use client';

import React from 'react';
import { WorkspaceProvider, useWorkspace } from '@/components/shared/WorkspaceContext';
import { SettingsProvider } from '@/components/shared/SettingsContext';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { Header } from '@/components/layout/Header';
import { NavigationTabs } from '@/components/layout/NavigationTabs';
import { UnifilarCanvas } from '@/components/unifilar/UnifilarCanvas';
import { MultifilarViewer } from '@/components/multifilar/MultifilarViewer';
import { LadderEditor } from '@/components/ladder/LadderEditor';
import { FbdEditor } from '@/components/fbd/FbdEditor';
import { PlcRackConfig } from '@/components/plc/PlcRackConfig';
import { ScadaMimic } from '@/components/scada/ScadaMimic';
import { DigitalTwin3D } from '@/components/digital-twin/DigitalTwin3D';
import { BomMemorial } from '@/components/bom/BomMemorial';
import { AiCopilotView } from '@/components/ai/AiCopilotView';
import { IndustrialLoginScreen } from '@/components/auth/IndustrialLoginScreen';
import { TenantSelectorScreen } from '@/components/tenant/TenantSelectorScreen';
import { PlantCommandDashboard } from '@/components/dashboard/PlantCommandDashboard';
import { LandingPage } from '@/components/landing/LandingPage';
import { Sparkles, ArrowRight } from 'lucide-react';

function WorkspaceContent() {
  const {
    activeTab,
    setActiveTab,
    activePatch,
    isAuthenticated,
    isSelectingTenant,
    isViewingLanding,
  } = useWorkspace();

  if (isViewingLanding) {
    return (
      <>
        <LandingPage />
        <SettingsModal />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <IndustrialLoginScreen />
        <SettingsModal />
      </>
    );
  }

  if (isSelectingTenant) {
    return (
      <>
        <TenantSelectorScreen />
        <SettingsModal />
      </>
    );
  }

  if (activeTab === 'dashboard') {
    return (
      <>
        <PlantCommandDashboard />
        <SettingsModal />
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B0D10]">
      {/* Top Application Header */}
      <Header />

      {/* Module Navigation Tabs */}
      <NavigationTabs />

      {/* Main Module Viewport */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'unifilar' && <UnifilarCanvas />}
        {activeTab === 'multifilar' && <MultifilarViewer />}
        {activeTab === 'ladder' && <LadderEditor />}
        {activeTab === 'fbd' && <FbdEditor />}
        {activeTab === 'plc' && <PlcRackConfig />}
        {activeTab === 'scada' && <ScadaMimic />}
        {activeTab === 'digital_twin' && <DigitalTwin3D />}
        {activeTab === 'bom' && <BomMemorial />}
        {activeTab === 'ai_copilot' && <AiCopilotView />}

        {/* Global Floating AI Patch Alert if waiting for review in other tabs */}
        {activePatch && activeTab !== 'ai_copilot' && (
          <div className="absolute bottom-4 right-4 z-50 bg-[#161A22] border border-amber-500/50 shadow-2xl rounded-lg p-3 flex items-center gap-3 animate-fade-in text-xs font-mono">
            <div className="h-8 w-8 rounded bg-amber-500/15 flex items-center justify-center text-amber-400">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-slate-100 block">Proposta de Patch da IA Pendente</span>
              <span className="text-[10px] text-amber-300/80">{activePatch.title}</span>
            </div>
            <button
              onClick={() => setActiveTab('ai_copilot')}
              className="ml-2 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-[#0B0D10] font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <span>Revisar Diff</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </main>

      {/* Global Settings Modal */}
      <SettingsModal />
    </div>
  );
}

export default function Page() {
  return (
    <SettingsProvider>
      <WorkspaceProvider>
        <WorkspaceContent />
      </WorkspaceProvider>
    </SettingsProvider>
  );
}

