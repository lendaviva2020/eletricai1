'use client';

import React, { useState, useEffect } from 'react';
import { useSettings, SettingsTab, SystemSettings, ABNT_DEFAULT_SETTINGS } from '@/components/shared/SettingsContext';
import {
  Sliders,
  ShieldCheck,
  Bot,
  Radio,
  X,
  RotateCcw,
  Check,
  Save,
  Network,
  Cpu,
  Zap,
  Activity,
  AlertTriangle,
  Info,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';

export function SettingsModal() {
  const { isSettingsOpen } = useSettings();
  if (!isSettingsOpen) return null;
  return <SettingsDialogContent />;
}

function SettingsDialogContent() {
  const {
    settings,
    saveSettings,
    resetToAbntDefaults,
    closeSettings,
    activeSettingsTab,
    setActiveSettingsTab,
    testGatewayConnection,
  } = useSettings();

  // Local copy of settings for editing before saving
  const [form, setForm] = useState<SystemSettings>(settings);
  const [pingStatus, setPingStatus] = useState<{
    testing: boolean;
    result?: { success: boolean; message: string; latencyMs: number };
  }>({ testing: false });
  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleFieldChange = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    saveSettings(form);
    setSaveFeedback(true);
    setTimeout(() => {
      setSaveFeedback(false);
      closeSettings();
    }, 600);
  };

  const handleReset = () => {
    setForm(ABNT_DEFAULT_SETTINGS);
    resetToAbntDefaults();
  };

  const handleTestPing = async () => {
    setPingStatus({ testing: true });
    const res = await testGatewayConnection();
    setPingStatus({ testing: false, result: res });
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }>; badge: string }[] = [
    { id: 'workspace', label: 'Workspace & UI', icon: Sliders, badge: 'Grid & Tela' },
    { id: 'engineering', label: 'Normas & Engenharia', icon: ShieldCheck, badge: 'NBR 5410' },
    { id: 'ai_copilot', label: 'IA Copilot & Sandbox', icon: Bot, badge: 'Auditável' },
    { id: 'network', label: 'Rede & Barramento CLP', icon: Radio, badge: 'Modbus / OPC' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in select-none"
    >
      <div className="relative w-full max-w-4xl bg-[#161A22] border border-[#232833] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* ================= MODAL HEADER ================= */}
        <div className="px-6 py-4 border-b border-[#232833] flex items-center justify-between bg-[#11141A]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="settings-title" className="text-sm sm:text-base font-bold text-white tracking-wide font-sans">
                  Configurações do Sistema Industrial
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1F2633] text-amber-300 border border-[#2D3748]">
                  EletricAI OS v2.4
                </span>
              </div>
              <p className="text-xs text-[#8A8F98]">
                Parâmetros globais de interface, conformidade ABNT, limites de ampacidade e comunicação de campo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1F2633] transition-colors border border-transparent hover:border-[#2D3748]"
            title="Fechar janela (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================= MODAL BODY: SIDE TABS & CONTENT ================= */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[420px]">
          {/* SIDE TABS NAVIGATION */}
          <aside
            aria-label="Navegação de Categorias"
            className="w-full md:w-64 bg-[#11141A] border-b md:border-b-0 md:border-r border-[#232833] p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0 no-scrollbar"
          >
            <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#8A8F98] hidden md:block mb-1">
              Categorias Técnicas
            </div>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeSettingsTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSettingsTab(tab.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left whitespace-nowrap md:whitespace-normal ${
                    isActive
                      ? 'bg-[#1E2430] text-amber-400 border border-amber-500/40 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#161A22] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border hidden md:inline-block ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-[#161A22] text-slate-500 border-[#232833]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}

            {/* Quick Standard Status Badge */}
            <div className="mt-auto pt-4 border-t border-[#232833] hidden md:block px-2">
              <div className="p-2.5 rounded bg-[#161A22] border border-[#232833] text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span>Modo Atual:</span>
                  <span className="text-emerald-400">ATIVO</span>
                </div>
                <div className="text-[10px] text-amber-400 font-bold">
                  {form.activeStandard} • {form.gridFrequency}
                </div>
                <div className="text-[10px] text-slate-400">
                  Queda máx: {form.maxVoltageDropGeneralPct}%
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN TAB CONTENT AREA */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-[#0B0D10] text-slate-200 space-y-6">
            {/* =========================================================================
                TAB 1: WORKSPACE & UI
            ========================================================================= */}
            {activeSettingsTab === 'workspace' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-amber-400" />
                    Parâmetros de Interface e Renderização CAD
                  </h3>
                  <p className="text-xs text-[#8A8F98] mt-0.5">
                    Controle de snap do ponteiro, espaçamento do grid milimétrico e políticas de salvamento local.
                  </p>
                </div>

                {/* Section 1: Snap to Grid & Grid Size */}
                <div className="p-4 rounded-lg bg-[#161A22] border border-[#232833] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-white block">
                        Alinhamento Automático ao Grid (Snap-to-Grid)
                      </label>
                      <span className="text-[11px] text-[#8A8F98]">
                        Fixa nós elétricos, barramentos e cabos nas interseções ortogonais milimétricas.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('snapToGrid', !form.snapToGrid)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        form.snapToGrid ? 'bg-amber-500' : 'bg-[#232833]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          form.snapToGrid ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-3 border-t border-[#232833]">
                    <label className="text-xs font-semibold text-white block mb-2">
                      Passo do Grid de Engenharia (Grid Pitch)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 20, 25, 50].map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleFieldChange('gridSize', size)}
                          className={`py-2 px-3 rounded text-xs font-mono text-center border transition-all ${
                            form.gridSize === size
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold shadow-sm'
                              : 'bg-[#11141A] border-[#232833] text-slate-400 hover:text-white hover:border-slate-600'
                          }`}
                        >
                          {size} px
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 2: Auto-save */}
                <div className="p-4 rounded-lg bg-[#161A22] border border-[#232833] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-white block">
                        Auto-salvamento Contínuo (Auto-save)
                      </label>
                      <span className="text-[11px] text-[#8A8F98]">
                        Persiste diagramas, lógicas e mímicos automaticamente em background.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('autoSave', !form.autoSave)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        form.autoSave ? 'bg-emerald-500' : 'bg-[#232833]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          form.autoSave ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {form.autoSave && (
                    <div className="pt-3 border-t border-[#232833] flex items-center justify-between">
                      <span className="text-xs text-slate-300">Intervalo de salvamento periódico:</span>
                      <div className="flex items-center gap-1.5">
                        {[30, 60, 120, 300].map(sec => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => handleFieldChange('autoSaveIntervalSec', sec)}
                            className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                              form.autoSaveIntervalSec === sec
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                                : 'bg-[#11141A] border-[#232833] text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Visual Theme */}
                <div className="p-4 rounded-lg bg-[#161A22] border border-[#232833] space-y-3">
                  <label className="text-xs font-semibold text-white block">
                    Tema Visual da Plataforma (Industrial Cyber-Sovereignty)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'dark_cyber' as const,
                        name: 'Deep Dark Cyber',
                        desc: 'Fundo #0B0D10 e acentos Âmbar #F59E0B oficial',
                        bg: 'bg-[#0B0D10]',
                        accent: 'border-amber-500/60',
                      },
                      {
                        id: 'amber_slate' as const,
                        name: 'Amber Slate Tech',
                        desc: 'Contraste elevado para salas de comando e painéis',
                        bg: 'bg-[#12161F]',
                        accent: 'border-cyan-500/60',
                      },
                      {
                        id: 'midnight_foundry' as const,
                        name: 'Midnight Foundry',
                        desc: 'Matiz escuro para ambientes de iluminação reduzida',
                        bg: 'bg-[#0E0F12]',
                        accent: 'border-slate-500/60',
                      },
                    ].map(themeItem => (
                      <button
                        key={themeItem.id}
                        type="button"
                        onClick={() => handleFieldChange('visualTheme', themeItem.id)}
                        className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                          form.visualTheme === themeItem.id
                            ? 'bg-[#1E2430] border-amber-500 text-white shadow-md'
                            : 'bg-[#11141A] border-[#232833] text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-200">{themeItem.name}</span>
                          <div className={`h-3 w-3 rounded-full ${themeItem.bg} border ${themeItem.accent}`} />
                        </div>
                        <span className="text-[10px] text-[#8A8F98] leading-tight">{themeItem.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 4: Display elements */}
                <div className="p-4 rounded-lg bg-[#161A22] border border-[#232833] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[#1F2633] transition-colors">
                    <input
                      type="checkbox"
                      checked={form.showRulers}
                      onChange={e => handleFieldChange('showRulers', e.target.checked)}
                      className="rounded border-[#232833] bg-[#0B0D10] text-amber-500 focus:ring-amber-500/20"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">Exibir Réguas Métricas</span>
                      <span className="text-[10px] text-slate-500">Graduação em milímetros no topo e lateral do CAD</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[#1F2633] transition-colors">
                    <input
                      type="checkbox"
                      checked={form.showWireTags}
                      onChange={e => handleFieldChange('showWireTags', e.target.checked)}
                      className="rounded border-[#232833] bg-[#0B0D10] text-amber-500 focus:ring-amber-500/20"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">Exibir Tags RMS nos Condutores</span>
                      <span className="text-[10px] text-slate-500">TAG do cabo, bitola e corrente nominal estampadas na linha</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 2: NORMAS & ENGENHARIA
            ========================================================================= */}
            {activeSettingsTab === 'engineering' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Parâmetros Normativos ABNT e Dimensionamento
                  </h3>
                  <p className="text-xs text-[#8A8F98] mt-0.5">
                    Critérios de ampacidade de cabos, queda de tensão admissível e esquemas de aterramento conforme NBR 5410/14039.
                  </p>
                </div>

                {/* Active Standard Selector */}
                <div className="p-4 rounded-lg bg-[#161A22] border border-[#232833] space-y-3">
                  <label className="text-xs font-semibold text-white block">
                    Norma Técnica Ativa de Cálculo
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: 'NBR_5410' as const,
                        name: 'ABNT NBR 5410',
                        sub: 'Baixa Tensão (até 1.000V AC)',
                        color: 'text-amber-400',
                      },
                      {
                        id: 'NBR_14039' as const,
                        name: 'ABNT NBR 14039',
                        sub: 'Média Tensão (1.0kV a 36.2kV)',
                        color: 'text-cyan-400',
                      },
                      {
                        id: 'IEC_60364' as const,
                        name: 'IEC 60364 Standard',
                        sub: 'Padrão Internacional Harmônico',
                        color: 'text-blue-400',
                      },
                    ].map(std => (
                      <button
                        key={std.id}
                        type="button"
                        onClick={() => handleFieldChange('activeStandard', std.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          form.activeStandard === std.id
                            ? 'bg-[#1E2430] border-amber-500/80 shadow-sm'
                            : 'bg-[#11141A] border-[#232833] hover:border-slate-600'
                        }`}
                      >
                        <div className={`text-xs font-bold ${std.color}`}>{std.name}</div>
                        <div className="text-[10px] text-[#8A8F98] mt-0.5">{std.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voltage & Frequency Grid */}
                <div className="p-4 rounded-lg bg-[#161A22] border border-[#232833] grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Nominal Voltage */}
                  <div>
                    <label className="text-xs font-semibold text-white block mb-1.5">
                      Tensão Nominal de Barramento
                    </label>
                    <select
                      value={form.nominalVoltage}
                      onChange={e => handleFieldChange('nominalVoltage', e.target.value)}
                      className="w-full bg-[#11141A] border border-[#232833] rounded px-3 py-2 text-xs font-mono text-amber-300 focus:border-amber-500 outline-none"
                    >
                      <option value="380V / 220V">380V / 220V (Trifásico 4F)</option>
                      <option value="220V / 127V">220V / 127V (Trifásico 4F)</option>
                      <option value="440V / 254V">440V / 254V (Industrial)</option>
                      <option value="13.8 kV MT">13.8 kV (Subestação MT)</option>
                    </select>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="text-xs font-semibold text-white block mb-1.5">
                      Frequência da Rede
                    </label>
                    <select
                      value={form.gridFrequency}
                      onChange={e => handleFieldChange('gridFrequency', e.target.value as '60Hz' | '50Hz')}
                      className="w-full bg-[#11141A] border border-[#232833] rounded px-3 py-2 text-xs font-mono text-slate-200 focus:border-amber-500 outline-none"
                    >
                      <option value="60Hz">60 Hz (Padrão Brasil - ONS/ANEEL)</option>
                      <option value="50Hz">50 Hz (Padrão Mercosul/Europa)</option>
                    </select>
                  </div>

                  {/* Grounding system */}
                  <div>
                    <label className="text-xs font-semibold text-white block mb-1.5">
                      Esquema de Aterramento (NBR 5410)
                    </label>
                    <select
                      value={form.groundingSystem}
                      onChange={e => handleFieldChange('groundingSystem', e.target.value as any)}
                      className="w-full bg-[#11141A] border border-[#232833] rounded px-3 py-2 text-xs font-mono text-cyan-400 focus:border-cyan-500 outline-none"
                    >
                      <option value="TN-S">TN-S (Neutro e PE Separados - Recomendado)</option>
                      <option value="TN-C">TN-C (Neutro e PE Combinados PEN)</option>
                      <option value="TT">TT (Terra de Proteção Independente)</option>
                      <option value="IT">IT (Neutro Isolado / Alta Impedância)</option>
                    </select>
                  </div>
                </div>

                {/* Voltage Drop Limits (Queda de Tensão) */}
                <div className="p-4 rounded-lg bg-[#161A22] border border-[#232833] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        Limites Máximos de Queda de Tensão Admissíveis (ΔV %)
                      </span>
                      <span className="text-[11px] text-[#8A8F98]">
                        Conforme ABNT NBR 5410, item 6.2.7 (Tabela 47).
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      NBR CONFORME
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-[#11141A] p-3 rounded border border-[#232833]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Circuitos Terminais de Força & Iluminação</span>
                        <strong className="text-amber-400 font-mono text-sm">{form.maxVoltageDropGeneralPct.toFixed(1)}%</strong>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="7.0"
                        step="0.5"
                        value={form.maxVoltageDropGeneralPct}
                        onChange={e => handleFieldChange('maxVoltageDropGeneralPct', parseFloat(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                        <span>1.0% (Rigoroso)</span>
                        <span className="text-amber-400">4.0% (Padrão NBR 5410)</span>
                        <span>7.0% (Máx)</span>
                      </div>
                    </div>

                    <div className="bg-[#11141A] p-3 rounded border border-[#232833]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Circuitos de Motores / CCM (Regime Permanente)</span>
                        <strong className="text-cyan-400 font-mono text-sm">{form.maxVoltageDropMotorPct.toFixed(1)}%</strong>
                      </div>
                      <input
                        type="range"
                        min="3.0"
                        max="10.0"
                        step="0.5"
                        value={form.maxVoltageDropMotorPct}
                        onChange={e => handleFieldChange('maxVoltageDropMotorPct', parseFloat(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                        <span>3.0%</span>
                        <span className="text-cyan-400">7.0% (Padrão NBR 5410)</span>
                        <span>10.0% (Partida)</span>
                      </div>
                    </div>
                  </div>

                  {/* Temperature and grouping */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#232833]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300">Temperatura Ambiente de Projeto:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="20"
                          max="60"
                          value={form.ambientTemperatureC}
                          onChange={e => handleFieldChange('ambientTemperatureC', parseInt(e.target.value) || 30)}
                          className="w-16 bg-[#11141A] border border-[#232833] rounded px-2 py-1 text-xs font-mono text-right text-slate-200"
                        />
                        <span className="text-xs font-mono text-slate-400">°C</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300">Fator de Agrupamento de Cabos (K1):</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0.4"
                          max="1.0"
                          step="0.05"
                          value={form.conduitGroupFactor}
                          onChange={e => handleFieldChange('conduitGroupFactor', parseFloat(e.target.value) || 0.8)}
                          className="w-16 bg-[#11141A] border border-[#232833] rounded px-2 py-1 text-xs font-mono text-right text-slate-200"
                        />
                        <span className="text-xs font-mono text-slate-400">x</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 3: IA COPILOT
            ========================================================================= */}
            {activeSettingsTab === 'ai_copilot' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Bot className="h-4 w-4 text-amber-400" />
                    Controle de Autonomia do Copilot & Sandbox de Execução
                  </h3>
                  <p className="text-xs text-[#8A8F98] mt-0.5">
                    Políticas de segurança para geração de lógicas elétricas, prevenção de alucinações e certificação ART.
                  </p>
                </div>

                {/* DeepSeek AI Provider Configuration */}
                <div className="p-4 rounded-lg bg-[#161A22] border border-[#232833] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white block">
                          Provedor IA / Motor de Síntese
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Conectado
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8A8F98]">
                        Geração estruturada de esquemáticos e lógicas com DeepSeek API server-side
                      </span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-mono text-slate-300">
                        {form.aiEnabled ? 'Ativada' : 'Desativada'}
                      </span>
                      <input
                        type="checkbox"
                        checked={form.aiEnabled}
                        onChange={e => handleFieldChange('aiEnabled', e.target.checked)}
                        className="rounded border-[#232833] bg-[#0B0D10] text-amber-500 focus:ring-amber-500/20"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[#232833]">
                    {/* Model */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Modelo DeepSeek
                      </label>
                      <select
                        value={form.aiModel}
                        onChange={e => handleFieldChange('aiModel', e.target.value as any)}
                        className="w-full bg-[#11141A] border border-[#232833] rounded px-2.5 py-1.5 text-xs font-mono text-amber-300 focus:border-amber-500 outline-none"
                      >
                        <option value="deepseek-chat">DeepSeek-V3 (Chat/Síntese)</option>
                        <option value="deepseek-reasoner">DeepSeek-R1 (Raciocínio R1)</option>
                        <option value="deepseek-coder">DeepSeek-Coder (Automação/LD)</option>
                      </select>
                    </div>

                    {/* Max Tokens */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Limite de Tokens
                      </label>
                      <input
                        type="number"
                        min="500"
                        max="8000"
                        step="500"
                        value={form.aiMaxTokens}
                        onChange={e => handleFieldChange('aiMaxTokens', parseInt(e.target.value, 10) || 3000)}
                        className="w-full bg-[#11141A] border border-[#232833] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:border-amber-500 outline-none"
                      />
                    </div>

                    {/* Temperature */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Temperature (Determ.)
                      </label>
                      <input
                        type="number"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={form.aiTemperature}
                        onChange={e => handleFieldChange('aiTemperature', parseFloat(e.target.value) || 0.1)}
                        className="w-full bg-[#11141A] border border-[#232833] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:border-amber-500 outline-none"
                      />
                    </div>

                    {/* Timeout */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Timeout de Requisição
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        step="5"
                        value={form.aiTimeoutSeconds}
                        onChange={e => handleFieldChange('aiTimeoutSeconds', parseInt(e.target.value, 10) || 30)}
                        className="w-full bg-[#11141A] border border-[#232833] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Security Key Status */}
                  <div className="p-2.5 rounded bg-[#11141A] border border-[#232833] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Credencial DEEPSEEK_API_KEY:</span>
                      <span className="text-slate-500">●●●●●●●●●●●●●●●●●●●●</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Isolamento Servidor OK
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Taxa Limite: {form.aiRateLimitPerMinute} req/min
                    </span>
                  </div>
                </div>

                {/* Autonomy Level */}
                <div className="p-4 rounded-lg bg-[#161A22] border border-[#232833] space-y-3">
                  <label className="text-xs font-semibold text-white block">
                    Nível de Autonomia das Edições Automatizadas
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        id: 'mandatory_audit' as const,
                        title: '1. Auditável Obrigatório (Recomendado)',
                        badge: '100% SEGURO',
                        desc: 'Toda alteração em diagrama elétrico, CLP ou mímico DEVE gerar um Patch Preview Diff (verde/vermelho) e aguardar aprovação explícita do engenheiro responsável.',
                        color: 'border-emerald-500/50 bg-emerald-500/5',
                        badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                      },
                      {
                        id: 'assisted_verification' as const,
                        title: '2. Assistido com Confirmação Imediata',
                        badge: 'INTERATIVO',
                        desc: 'A IA gera o código e atualiza as tags compartilhadas em rascunho com destaque visual, mantendo histórico de reversão em 1-clique.',
                        color: 'border-amber-500/50 bg-amber-500/5',
                        badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                      },
                      {
                        id: 'simulation_only' as const,
                        title: '3. Simulação & Diagnóstico Apenas',
                        badge: 'READ-ONLY',
                        desc: 'A IA apenas lê o diagrama, gera relatórios de cálculo e aponta violações normativas sem permissão para propor modificações automáticas.',
                        color: 'border-slate-600 bg-[#11141A]',
                        badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
                      },
                    ].map(lvl => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => handleFieldChange('autonomyLevel', lvl.id)}
                        className={`w-full p-3.5 rounded-lg border text-left transition-all ${
                          form.autonomyLevel === lvl.id
                            ? `${lvl.color} shadow-sm`
                            : 'bg-[#11141A] border-[#232833] hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{lvl.title}</span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${lvl.badgeColor}`}>
                            {lvl.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8A8F98] mt-1.5 leading-relaxed">{lvl.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Engine Isolation and Sandbox */}
                <div className="p-4 rounded-lg bg-[#161A22] border border-[#232833] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        Isolamento Air-Gapped do Motor de Cálculo
                      </span>
                      <span className="text-[11px] text-[#8A8F98]">
                        Executa scripts SCADA e validações em Web Workers segregados sem acesso direto ao DOM ou conexões não autorizadas.
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      WEB WORKER SANDBOX
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#232833]">
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[#1F2633] transition-colors">
                      <input
                        type="checkbox"
                        checked={form.requireArtValidation}
                        onChange={e => handleFieldChange('requireArtValidation', e.target.checked)}
                        className="rounded border-[#232833] bg-[#0B0D10] text-amber-500 focus:ring-amber-500/20"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-200 block">Exigir Registro de CREA/ART</span>
                        <span className="text-[10px] text-slate-500">
                          Exige inserção do número de ART no memorial antes de exportar DXF/PLCopen
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[#1F2633] transition-colors">
                      <input
                        type="checkbox"
                        checked={form.notifyOnPatchDiff}
                        onChange={e => handleFieldChange('notifyOnPatchDiff', e.target.checked)}
                        className="rounded border-[#232833] bg-[#0B0D10] text-amber-500 focus:ring-amber-500/20"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-200 block">Alerta Flutuante de Patch Diff</span>
                        <span className="text-[10px] text-slate-500">
                          Exibe aviso no canto inferior da tela quando a IA sugerir correções de carga
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 4: REDE & CLP
            ========================================================================= */}
            {activeSettingsTab === 'network' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Radio className="h-4 w-4 text-cyan-400" />
                    Comunicação Industrial & Integração de Campo
                  </h3>
                  <p className="text-xs text-[#8A8F98] mt-0.5">
                    Configuração de gateways Ethernet/IP, portas de telemetria Modbus TCP, OPC-UA e taxas de varredura.
                  </p>
                </div>

                {/* Protocol Selector */}
                <div className="p-4 rounded-lg bg-[#161A22] border border-[#232833] space-y-3">
                  <label className="text-xs font-semibold text-white block">
                    Protocolo de Comunicação Industrial Ativo
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'MODBUS_TCP' as const, name: 'Modbus TCP', port: 502, color: 'text-amber-400' },
                      { id: 'OPC_UA' as const, name: 'OPC-UA Binary', port: 4840, color: 'text-cyan-400' },
                      { id: 'MQTT' as const, name: 'MQTT Industrial', port: 1883, color: 'text-emerald-400' },
                      { id: 'PROFINET' as const, name: 'Profinet over IP', port: 34964, color: 'text-purple-400' },
                    ].map(proto => (
                      <button
                        key={proto.id}
                        type="button"
                        onClick={() => {
                          handleFieldChange('protocol', proto.id);
                          handleFieldChange('gatewayPort', proto.port);
                        }}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          form.protocol === proto.id
                            ? 'bg-[#1E2430] border-cyan-500 text-white shadow-sm'
                            : 'bg-[#11141A] border-[#232833] text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className={`text-xs font-bold ${proto.color}`}>{proto.name}</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">Porta {proto.port}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gateway IP, Port & Slave ID */}
                <div className="p-4 rounded-lg bg-[#161A22] border border-[#232833] grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-white block mb-1.5">
                      Endereço IP do Gateway / CLP
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.gatewayIp}
                        onChange={e => handleFieldChange('gatewayIp', e.target.value)}
                        placeholder="192.168.10.20"
                        className="w-full bg-[#11141A] border border-[#232833] rounded px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 outline-none"
                      />
                      <Server className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white block mb-1.5">
                      Porta TCP
                    </label>
                    <input
                      type="number"
                      value={form.gatewayPort}
                      onChange={e => handleFieldChange('gatewayPort', parseInt(e.target.value) || 502)}
                      className="w-full bg-[#11141A] border border-[#232833] rounded px-3 py-2 text-xs font-mono text-cyan-300 focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                {/* Scan Rate & Mode */}
                <div className="p-4 rounded-lg bg-[#161A22] border border-[#232833] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white block mb-1.5">
                      Taxa de Varredura (Polling Scan Rate)
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[100, 250, 500, 1000].map(rate => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => handleFieldChange('scanRateMs', rate)}
                          className={`py-1.5 px-2 rounded text-xs font-mono text-center border transition-all ${
                            form.scanRateMs === rate
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                              : 'bg-[#11141A] border-[#232833] text-slate-400 hover:text-white'
                          }`}
                        >
                          {rate}ms
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white block mb-1.5">
                      Modo Operacional da Conexão
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleFieldChange('connectionMode', 'simulated')}
                        className={`p-2 rounded text-xs font-mono border text-center transition-all ${
                          form.connectionMode === 'simulated'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                            : 'bg-[#11141A] border-[#232833] text-slate-400 hover:text-white'
                        }`}
                      >
                        Simulador Local
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFieldChange('connectionMode', 'live_hardware')}
                        className={`p-2 rounded text-xs font-mono border text-center transition-all ${
                          form.connectionMode === 'live_hardware'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                            : 'bg-[#11141A] border-[#232833] text-slate-400 hover:text-white'
                        }`}
                      >
                        Hardware em Campo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Handshake Ping Test Box */}
                <div className="p-4 rounded-lg bg-[#11141A] border border-[#232833] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Diagnóstico de Conexão com Gateway
                    </span>
                    <span className="text-[11px] text-[#8A8F98]">
                      Envia um pacote de ping e handshake via protocolo {form.protocol}.
                    </span>
                    {pingStatus.result && (
                      <div
                        className={`mt-2 text-xs font-mono p-2 rounded border flex items-center gap-2 ${
                          pingStatus.result.success
                            ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
                            : 'bg-red-950/30 text-red-300 border-red-500/30'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${pingStatus.result.success ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <span>{pingStatus.result.message}</span>
                        {pingStatus.result.success && (
                          <span className="text-slate-400">({pingStatus.result.latencyMs}ms)</span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleTestPing}
                    disabled={pingStatus.testing}
                    className="px-3.5 py-2 rounded-lg bg-[#1E2430] border border-[#2D3748] hover:border-cyan-500/60 text-cyan-400 hover:text-cyan-300 text-xs font-mono font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Activity className={`h-3.5 w-3.5 ${pingStatus.testing ? 'animate-spin' : ''}`} />
                    <span>{pingStatus.testing ? 'Testando Handshake...' : 'Testar Conexão Gateway'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= MODAL FOOTER WITH 3 BUTTONS ================= */}
        <div className="px-6 py-3.5 border-t border-[#232833] bg-[#11141A] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left button: Restaurar Padrões ABNT */}
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-[#161A22] border border-[#232833] hover:border-slate-500 text-slate-300 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-colors"
            title="Reverter para parâmetros originais conforme ABNT NBR 5410"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Restaurar Padrões ABNT</span>
          </button>

          {/* Right buttons: Cancelar & Salvar e Aplicar */}
          <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeSettings}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#161A22] border border-[#232833] hover:bg-[#1E2430] text-slate-300 hover:text-white text-xs font-mono font-medium transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`w-full sm:w-auto px-5 py-2 rounded-lg font-black text-xs font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                saveFeedback
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                  : 'bg-[#F59E0B] hover:bg-amber-400 text-[#0B0D10] shadow-[0_0_15px_rgba(245,158,11,0.25)]'
              }`}
            >
              {saveFeedback ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>CONFIGURAÇÕES APLICADAS!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 stroke-[2.5]" />
                  <span>Salvar e Aplicar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
