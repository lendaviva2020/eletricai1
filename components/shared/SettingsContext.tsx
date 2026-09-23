'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type SettingsTab = 'workspace' | 'engineering' | 'ai_copilot' | 'network';

export type VisualTheme = 'dark_cyber' | 'amber_slate' | 'midnight_foundry';
export type ActiveStandard = 'NBR_5410' | 'NBR_14039' | 'IEC_60364';
export type GroundingSystem = 'TN-S' | 'TN-C' | 'TT' | 'IT';
export type GridFrequency = '60Hz' | '50Hz';
export type AiAutonomyLevel = 'mandatory_audit' | 'assisted_verification' | 'simulation_only';
export type CalculationEngineIsolation = 'air_gapped_worker' | 'edge_deterministic';
export type IndustrialProtocol = 'MODBUS_TCP' | 'OPC_UA' | 'MQTT' | 'PROFINET';
export type ConnectionMode = 'simulated' | 'live_hardware';

export interface SystemSettings {
  // Aba 1: Workspace & UI
  snapToGrid: boolean;
  gridSize: number; // 10, 20, 25, 50 px
  autoSave: boolean;
  autoSaveIntervalSec: number; // 30, 60, 120, 300 seg
  visualTheme: VisualTheme;
  showRulers: boolean;
  showWireTags: boolean;

  // Aba 2: Normas & Engenharia
  activeStandard: ActiveStandard;
  nominalVoltage: string; // '380V / 220V', '220V / 127V', '440V / 254V', '13.8 kV MT'
  gridFrequency: GridFrequency;
  groundingSystem: GroundingSystem;
  maxVoltageDropGeneralPct: number; // Ex: 4.0% conforme NBR 5410 item 6.2.7
  maxVoltageDropMotorPct: number; // Ex: 7.0% para motores
  ambientTemperatureC: number; // Ex: 30°C ar, 40°C CCM
  conduitGroupFactor: number; // Fator de agrupamento ex: 0.80

  // Aba 3: IA Copilot
  autonomyLevel: AiAutonomyLevel;
  calculationEngineIsolation: CalculationEngineIsolation;
  requireArtValidation: boolean;
  deterministicStrictNbr: boolean;
  notifyOnPatchDiff: boolean;

  // Aba 4: Rede & CLP
  protocol: IndustrialProtocol;
  gatewayIp: string;
  gatewayPort: number;
  scanRateMs: number; // 100, 250, 500, 1000 ms
  connectionMode: ConnectionMode;
  slaveId: number;
}

export const ABNT_DEFAULT_SETTINGS: SystemSettings = {
  // Aba 1: Workspace & UI
  snapToGrid: true,
  gridSize: 20,
  autoSave: true,
  autoSaveIntervalSec: 60,
  visualTheme: 'dark_cyber',
  showRulers: true,
  showWireTags: true,

  // Aba 2: Normas & Engenharia
  activeStandard: 'NBR_5410',
  nominalVoltage: '380V / 220V',
  gridFrequency: '60Hz',
  groundingSystem: 'TN-S',
  maxVoltageDropGeneralPct: 4.0, // NBR 5410 item 6.2.7 (4% a partir do barramento principal)
  maxVoltageDropMotorPct: 7.0, // NBR 5410 para circuitos terminais de força/motores
  ambientTemperatureC: 30, // NBR 5410 tabela 40 (temperatura ambiente padrão)
  conduitGroupFactor: 0.8, // NBR 5410 tabela 42

  // Aba 3: IA Copilot
  autonomyLevel: 'mandatory_audit', // Anti-alucinação: Exige aprovação de Patch Diff antes de aplicar
  calculationEngineIsolation: 'air_gapped_worker',
  requireArtValidation: true,
  deterministicStrictNbr: true,
  notifyOnPatchDiff: true,

  // Aba 4: Rede & CLP
  protocol: 'MODBUS_TCP',
  gatewayIp: '192.168.10.20',
  gatewayPort: 502,
  scanRateMs: 250,
  connectionMode: 'simulated',
  slaveId: 1,
};

const STORAGE_KEY = 'voltai_industrial_system_settings_v2';

interface SettingsContextValue {
  settings: SystemSettings;
  updateSettings: (partial: Partial<SystemSettings>) => void;
  saveSettings: (newSettings: SystemSettings) => void;
  resetToAbntDefaults: () => void;
  
  // Modal visibility & tab
  isSettingsOpen: boolean;
  activeSettingsTab: SettingsTab;
  openSettings: (tab?: SettingsTab) => void;
  closeSettings: () => void;
  setActiveSettingsTab: (tab: SettingsTab) => void;

  // Live Gateway Test
  testGatewayConnection: () => Promise<{ success: boolean; message: string; latencyMs: number }>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return {
            ...ABNT_DEFAULT_SETTINGS,
            ...JSON.parse(stored),
          };
        }
      } catch (err) {
        console.warn('Falha ao recuperar configurações do localStorage:', err);
      }
    }
    return ABNT_DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('workspace');

  // Save to localStorage
  const saveSettings = useCallback((newSettings: SystemSettings) => {
    setSettings(newSettings);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      }
    } catch (err) {
      console.error('Erro ao gravar configurações no localStorage:', err);
    }
  }, []);

  // Update partial settings and persist
  const updateSettings = useCallback((partial: Partial<SystemSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...partial };
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      } catch (err) {
        console.error('Erro ao atualizar configurações:', err);
      }
      return updated;
    });
  }, []);

  // Reset to ABNT Defaults
  const resetToAbntDefaults = useCallback(() => {
    setSettings(ABNT_DEFAULT_SETTINGS);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ABNT_DEFAULT_SETTINGS));
      }
    } catch (err) {
      console.error('Erro ao resetar padrões ABNT:', err);
    }
  }, []);

  const openSettings = useCallback((tab?: SettingsTab) => {
    if (tab) {
      setActiveSettingsTab(tab);
    }
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  // Simulated gateway handshake test
  const testGatewayConnection = useCallback(async () => {
    // Artificial latency simulation
    await new Promise(r => setTimeout(r, 600));
    const isLocalSubnet = settings.gatewayIp.startsWith('192.168.') || settings.gatewayIp.startsWith('10.') || settings.gatewayIp === '127.0.0.1';
    
    if (isLocalSubnet && settings.gatewayPort > 0 && settings.gatewayPort < 65535) {
      return {
        success: true,
        message: `Handshake ${settings.protocol} bem-sucedido com ${settings.gatewayIp}:${settings.gatewayPort}. Gateway pronto.`,
        latencyMs: Math.floor(Math.random() * 15) + 8,
      };
    } else {
      return {
        success: false,
        message: `Não foi possível alcançar o Gateway ${settings.gatewayIp}:${settings.gatewayPort}. Verifique a rota industrial ou a máscara de sub-rede.`,
        latencyMs: 999,
      };
    }
  }, [settings.gatewayIp, settings.gatewayPort, settings.protocol]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        saveSettings,
        resetToAbntDefaults,
        isSettingsOpen,
        activeSettingsTab,
        openSettings,
        closeSettings,
        setActiveSettingsTab,
        testGatewayConnection,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve ser usado dentro de um SettingsProvider');
  }
  return context;
}
