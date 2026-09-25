'use client';

import React, { useState, useEffect } from 'react';
import {
  AiStructuredCircuitSpecification,
  AiCircuitSpecComponent,
} from '@/types/electrical';
import {
  Sparkles,
  CheckCircle2,
  X,
  Zap,
  Shield,
  Activity,
  Sliders,
  AlertTriangle,
  Layers,
  ChevronRight,
  Plus,
  Play,
  Check,
  Bot,
  RefreshCw,
  Cpu,
  ArrowRight,
  Info,
} from 'lucide-react';

interface AiCircuitGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  specification: AiStructuredCircuitSpecification | null;
  isLoading: boolean;
  generationStep: string;
  onApplyCircuit: (spec: AiStructuredCircuitSpecification) => void;
  onRunPrompt: (promptText: string) => void;
}

export function AiCircuitGenerationModal({
  isOpen,
  onClose,
  specification,
  isLoading,
  generationStep,
  onApplyCircuit,
  onRunPrompt,
}: AiCircuitGenerationModalProps) {
  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'COMPONENTS' | 'CONNECTIONS' | 'LADDER' | 'CALCULATIONS'>('PREVIEW');
  const [inputPrompt, setInputPrompt] = useState('');
  const [prevSpecification, setPrevSpecification] = useState<AiStructuredCircuitSpecification | null>(specification);
  const [editableSpec, setEditableSpec] = useState<AiStructuredCircuitSpecification | null>(
    specification ? JSON.parse(JSON.stringify(specification)) : null
  );
  const [isEditing, setIsEditing] = useState(false);

  if (specification !== prevSpecification) {
    setPrevSpecification(specification);
    setEditableSpec(specification ? JSON.parse(JSON.stringify(specification)) : null);
  }

  if (!isOpen) return null;

  const quickPrompts = [
    { label: 'Partida Direta 15 kW', prompt: 'Crie uma partida direta para motor trifásico de 15 kW 380V com disjuntor-motor, contator, relé térmico e botoeiras' },
    { label: 'Estrela-Triângulo 30 kW', prompt: 'Crie uma partida estrela-triângulo para motor trifásico 30 kW 380V com temporizador e intertravamento' },
    { label: 'Reversão de Motor', prompt: 'Crie uma partida com reversão para motor de 10 CV com intertravamento mecânico e elétrico entre contatores' },
    { label: 'Duas Bombas com Alternância', prompt: 'Crie um sistema de comando para duas bombas de água com alternância automática e manual' },
    { label: 'Circuito de Emergência', prompt: 'Crie um circuito de segurança e parada de emergência monitorado conforme NR-10 e NR-12' },
  ];

  const handleApply = () => {
    if (editableSpec) {
      onApplyCircuit(editableSpec);
      onClose();
    }
  };

  const handleUpdateComponentParam = <K extends keyof AiCircuitSpecComponent>(
    tag: string,
    field: K,
    value: AiCircuitSpecComponent[K]
  ) => {
    if (!editableSpec) return;
    setEditableSpec({
      ...editableSpec,
      components: editableSpec.components.map(c => (c.tag === tag ? { ...c, [field]: value } : c)),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#11141A] border border-[#232833] rounded-xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-[#161A22] border-b border-[#232833] flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-1.5 font-sans">
                  EletricAI <span className="text-amber-400 font-mono">DeepSeek Core</span>
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-medium">
                  ABNT NBR 5410 & NR-10
                </span>
                {specification?.provider && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E2533] border border-[#2D3748] text-slate-300 font-mono">
                    Provedor: {specification.provider === 'deepseek-v3' ? 'DeepSeek-V3' : 'EletricAI Engine'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Sintetizador Elétrico em Linguagem Natural com Validação de Engenharia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#232833] text-slate-400 hover:text-white transition-colors"
            title="Fechar (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Natural Language Prompt Ribbon with Suggestions */}
        <div className="p-3 sm:p-4 bg-[#0D1017] border-b border-[#1E2533] space-y-2.5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && inputPrompt.trim() && !isLoading) {
                    onRunPrompt(inputPrompt.trim());
                  }
                }}
                placeholder="Descreva o circuito que deseja criar (ex: 'Crie uma partida direta para motor 15 kW 380V com disjuntor, contator e relé térmico')..."
                className="w-full bg-[#161A22] border border-[#2A313E] focus:border-amber-500 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
                disabled={isLoading}
              />
              <Sparkles className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-amber-400 pointer-events-none" />
            </div>
            <button
              onClick={() => {
                if (inputPrompt.trim() && !isLoading) {
                  onRunPrompt(inputPrompt.trim());
                }
              }}
              disabled={isLoading || !inputPrompt.trim()}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors disabled:opacity-40 shrink-0 font-mono shadow-md"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Interpretando...</span>
                </>
              ) : (
                <>
                  <span>GERAR</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] text-slate-500 font-mono shrink-0 hidden sm:inline">Sugestões:</span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputPrompt(qp.prompt);
                  onRunPrompt(qp.prompt);
                }}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-md bg-[#161A22] hover:bg-[#1E2533] border border-[#232833] hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          {/* Loading State with Progressive Steps */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-5">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-amber-400 animate-pulse" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-sm font-bold text-slate-100 font-mono">{generationStep || 'Processando solicitação...'}</h3>
                <p className="text-xs text-slate-400 max-w-md">
                  Interpretando especificações técnicas com DeepSeek e calculando grandezas elétricas segundo a ABNT NBR 5410.
                </p>
              </div>

              {/* Progress Steps Indicators */}
              <div className="flex items-center gap-2 max-w-sm w-full px-4">
                {['Analisando', 'Identificando', 'Dimensionando', 'Montando', 'Concluído'].map((step, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="h-1.5 w-full rounded-full bg-amber-500/30 overflow-hidden">
                      <div className="h-full bg-amber-400 animate-pulse" />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specification Content */}
          {!isLoading && editableSpec && (
            <>
              {/* Configuration Banner */}
              <div className="p-3 sm:p-4 rounded-lg bg-[#161A22] border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-400 font-mono font-bold uppercase tracking-wider">
                      EletricAI encontrou a seguinte configuração:
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold">
                      {editableSpec.circuitType.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">{editableSpec.title}</h3>
                  <p className="text-xs text-slate-400">{editableSpec.summary}</p>
                </div>

                {/* Sizing Quick Numbers */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0 overflow-x-auto py-1">
                  <div className="px-3 py-1.5 rounded bg-[#11141A] border border-[#232833] text-center font-mono">
                    <span className="text-[10px] text-slate-400 block">Corrente In</span>
                    <span className="text-xs font-bold text-amber-400">
                      {editableSpec.engineeringCalculations.nominalCurrentA} A
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded bg-[#11141A] border border-[#232833] text-center font-mono">
                    <span className="text-[10px] text-slate-400 block">Disjuntor</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {editableSpec.engineeringCalculations.recommendedBreakerA} A
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded bg-[#11141A] border border-[#232833] text-center font-mono">
                    <span className="text-[10px] text-slate-400 block">Condutor</span>
                    <span className="text-xs font-bold text-cyan-400">
                      {editableSpec.engineeringCalculations.recommendedCableMm2} mm²
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded bg-[#11141A] border border-[#232833] text-center font-mono">
                    <span className="text-[10px] text-slate-400 block">Queda ΔV</span>
                    <span className="text-xs font-bold text-slate-200">
                      {editableSpec.engineeringCalculations.calculatedVoltageDropPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* View Tabs */}
              <div className="flex items-center gap-1 border-b border-[#232833] overflow-x-auto no-scrollbar font-mono text-xs">
                <button
                  onClick={() => setActiveTab('PREVIEW')}
                  className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'PREVIEW'
                      ? 'border-amber-400 text-amber-400 font-bold bg-[#161A22]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>Diagrama Visual</span>
                </button>
                <button
                  onClick={() => setActiveTab('COMPONENTS')}
                  className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'COMPONENTS'
                      ? 'border-amber-400 text-amber-400 font-bold bg-[#161A22]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Componentes ({editableSpec.components.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('CONNECTIONS')}
                  className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'CONNECTIONS'
                      ? 'border-amber-400 text-amber-400 font-bold bg-[#161A22]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Conexões & Cabos ({editableSpec.connections.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('LADDER')}
                  className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'LADDER'
                      ? 'border-amber-400 text-amber-400 font-bold bg-[#161A22]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Lógica Ladder IEC ({editableSpec.ladderRungs.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('CALCULATIONS')}
                  className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'CALCULATIONS'
                      ? 'border-amber-400 text-amber-400 font-bold bg-[#161A22]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Memorial NBR 5410</span>
                </button>
              </div>

              {/* Tab 1: Interactive SVG Visual Preview */}
              {activeTab === 'PREVIEW' && (
                <div className="bg-[#0B0D10] border border-[#232833] rounded-lg p-4 flex flex-col items-center justify-center min-h-[320px] overflow-x-auto relative">
                  <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                    <span>Topologia Unifilar & Multifilar Recomendada</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Coordenação Tipo 2 OK
                    </span>
                  </div>

                  <svg viewBox="0 0 760 300" className="w-full max-w-3xl h-auto select-none bg-[#0D1017] rounded border border-[#1E2533]">
                    {/* Busbar Line */}
                    <line x1="40" y1="30" x2="720" y2="30" stroke="#F59E0B" strokeWidth="4" />
                    <text x="50" y="22" fill="#F59E0B" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      BARRAMENTO CCM-01 (380V - 60Hz - TN-S)
                    </text>

                    {/* Circuit Branch 1: Power Train */}
                    <g transform="translate(180, 30)">
                      {/* Feeder to Breaker */}
                      <line x1="70" y1="0" x2="70" y2="40" stroke="#F59E0B" strokeWidth="2.5" />
                      <text x="80" y="25" fill="#94A3B8" fontSize="9" fontFamily="monospace">
                        3x{editableSpec.engineeringCalculations.recommendedCableMm2}mm²
                      </text>

                      {/* Motor Breaker */}
                      <rect x="15" y="40" width="110" height="40" rx="3" fill="#161A22" stroke="#F59E0B" strokeWidth="1.5" />
                      <text x="25" y="56" fill="#F8FAFC" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        {editableSpec.components.find(c => c.category === 'MOTOR_BREAKER')?.tag || 'QF01'}
                      </text>
                      <text x="25" y="70" fill="#94A3B8" fontSize="8" fontFamily="monospace">
                        MPW {editableSpec.engineeringCalculations.recommendedBreakerA}A / 35kA
                      </text>

                      {/* Line to Contactor */}
                      <line x1="70" y1="80" x2="70" y2="110" stroke="#F59E0B" strokeWidth="2.5" />

                      {/* Contactor */}
                      <rect x="15" y="110" width="110" height="40" rx="3" fill="#161A22" stroke="#38BDF8" strokeWidth="1.5" />
                      <text x="25" y="126" fill="#F8FAFC" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        {editableSpec.components.find(c => c.category === 'CONTACTOR')?.tag || 'KM01'}
                      </text>
                      <text x="25" y="140" fill="#38BDF8" fontSize="8" fontFamily="monospace">
                        Contator AC-3 {editableSpec.engineeringCalculations.recommendedContactorA}A (24VDC)
                      </text>

                      {/* Line to Thermal */}
                      <line x1="70" y1="150" x2="70" y2="180" stroke="#F59E0B" strokeWidth="2.5" />

                      {/* Thermal Relay */}
                      <rect x="15" y="180" width="110" height="35" rx="3" fill="#161A22" stroke="#10B981" strokeWidth="1.5" />
                      <text x="25" y="195" fill="#F8FAFC" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        {editableSpec.components.find(c => c.category === 'THERMAL_RELAY')?.tag || 'RT01'}
                      </text>
                      <text x="25" y="208" fill="#10B981" fontSize="8" fontFamily="monospace">
                        Sobrecarga {editableSpec.engineeringCalculations.thermalRelaySettingMinA}-{editableSpec.engineeringCalculations.thermalRelaySettingMaxA}A
                      </text>

                      {/* Line to Motor */}
                      <line x1="70" y1="215" x2="70" y2="245" stroke="#F59E0B" strokeWidth="2.5" />

                      {/* Motor */}
                      <circle cx="70" cy="265" r="20" fill="#161A22" stroke="#F59E0B" strokeWidth="2" />
                      <text x="60" y="268" fill="#F8FAFC" fontSize="10" fontFamily="monospace" fontWeight="bold">M 3~</text>
                      <text x="96" y="268" fill="#F59E0B" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        {editableSpec.components.find(c => c.category === 'MOTOR_3P')?.tag || 'M01'}
                      </text>

                      {/* Grounding Wire PE */}
                      <line x1="50" y1="265" x2="0" y2="265" stroke="#10B981" strokeWidth="2" strokeDasharray="3,2" />
                      <text x="5" y="258" fill="#10B981" fontSize="8" fontFamily="monospace">PE Terra</text>
                    </g>

                    {/* Circuit Branch 2: Control & Pushbuttons Panel */}
                    <g transform="translate(450, 45)">
                      <rect x="0" y="0" width="260" height="240" rx="4" fill="#11141A" stroke="#232833" strokeWidth="1.5" />
                      <text x="15" y="24" fill="#38BDF8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        PAINEL DE COMANDO & SEGURANÇA 24VDC
                      </text>

                      {/* Emergency */}
                      <circle cx="35" cy="55" r="10" fill="#EF4444" stroke="#DC2626" strokeWidth="2" />
                      <text x="55" y="58" fill="#F8FAFC" fontSize="9" fontFamily="monospace">
                        {editableSpec.components.find(c => c.role === 'EMERGENCY')?.tag || 'S0'}: Parada de Emergência (NF)
                      </text>

                      {/* Stop */}
                      <circle cx="35" cy="95" r="8" fill="#991B1B" />
                      <text x="55" y="98" fill="#F8FAFC" fontSize="9" fontFamily="monospace">
                        {editableSpec.components.find(c => c.tag?.startsWith('S2'))?.tag || 'S2'}: Botoeira Desliga (NF)
                      </text>

                      {/* Start */}
                      <circle cx="35" cy="135" r="8" fill="#16A34A" />
                      <text x="55" y="138" fill="#F8FAFC" fontSize="9" fontFamily="monospace">
                        {editableSpec.components.find(c => c.tag?.startsWith('S1'))?.tag || 'S1'}: Botoeira Liga (NA)
                      </text>

                      {/* Pilot Light */}
                      <circle cx="35" cy="175" r="8" fill="#22C55E" stroke="#86EFAC" strokeWidth="2" />
                      <text x="55" y="178" fill="#F8FAFC" fontSize="9" fontFamily="monospace">
                        {editableSpec.components.find(c => c.role === 'SIGNALLING')?.tag || 'H1'}: Sinalizador Marcha LED
                      </text>

                      <rect x="15" y="200" width="230" height="28" rx="2" fill="#161A22" stroke="#1E2533" />
                      <text x="25" y="218" fill="#A855F7" fontSize="8.5" fontFamily="monospace">
                        Interface PLC: %I1.0..%I1.3 &rarr; %Q1.0..%Q1.1
                      </text>
                    </g>
                  </svg>
                </div>
              )}

              {/* Tab 2: Detailed Components List */}
              {activeTab === 'COMPONENTS' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">
                      Componentes eletrotécnicos a serem adicionados ao projeto:
                    </span>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1"
                    >
                      <Sliders className="h-3 w-3" />
                      {isEditing ? 'Concluir Ajustes' : 'Editar Parâmetros'}
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-[#232833] rounded-lg">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#161A22] text-slate-400 border-b border-[#232833]">
                        <tr>
                          <th className="p-2.5">TAG</th>
                          <th className="p-2.5">Função</th>
                          <th className="p-2.5">Descrição</th>
                          <th className="p-2.5">In (A)</th>
                          <th className="p-2.5">Tensão</th>
                          <th className="p-2.5">Fabricante / Ref</th>
                          <th className="p-2.5">Faixa / Bitola</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E2533]">
                        {editableSpec.components.map(comp => (
                          <tr key={comp.tag} className="hover:bg-[#161A22]/60">
                            <td className="p-2.5 font-bold text-amber-400">{comp.tag}</td>
                            <td className="p-2.5">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1E2533] text-slate-300">
                                {comp.role}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-200">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={comp.name}
                                  onChange={e => handleUpdateComponentParam(comp.tag, 'name', e.target.value)}
                                  className="w-full bg-[#11141A] border border-[#2A313E] rounded px-1.5 py-0.5 text-xs text-slate-200"
                                />
                              ) : (
                                comp.name
                              )}
                            </td>
                            <td className="p-2.5 font-bold text-cyan-400">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={comp.nominalCurrent}
                                  onChange={e => handleUpdateComponentParam(comp.tag, 'nominalCurrent', parseFloat(e.target.value))}
                                  className="w-16 bg-[#11141A] border border-[#2A313E] rounded px-1 py-0.5 text-xs"
                                />
                              ) : (
                                `${comp.nominalCurrent} A`
                              )}
                            </td>
                            <td className="p-2.5 text-slate-300">{comp.voltage} V</td>
                            <td className="p-2.5 text-slate-400">
                              {comp.manufacturer || 'WEG'} {comp.partNumber || ''}
                            </td>
                            <td className="p-2.5 text-emerald-400">
                              {comp.cableCrossSection ? `${comp.cableCrossSection} mm²` : comp.settingRange || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Connections & Cables */}
              {activeTab === 'CONNECTIONS' && (
                <div className="space-y-3">
                  <div className="overflow-x-auto border border-[#232833] rounded-lg">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#161A22] text-slate-400 border-b border-[#232833]">
                        <tr>
                          <th className="p-2.5">De (Origem)</th>
                          <th className="p-2.5">Para (Destino)</th>
                          <th className="p-2.5">Função</th>
                          <th className="p-2.5">Bitola NBR 5410</th>
                          <th className="p-2.5">Cor Identificação</th>
                          <th className="p-2.5">Descrição Técnica</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E2533]">
                        {editableSpec.connections.map((conn, idx) => (
                          <tr key={idx} className="hover:bg-[#161A22]/60">
                            <td className="p-2.5 font-bold text-amber-400">
                              {conn.fromTag} <span className="text-[10px] text-slate-500 font-normal">({conn.fromPort})</span>
                            </td>
                            <td className="p-2.5 font-bold text-cyan-400">
                              {conn.toTag} <span className="text-[10px] text-slate-500 font-normal">({conn.toPort})</span>
                            </td>
                            <td className="p-2.5">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1E2533] text-slate-300">
                                {conn.circuitRole}
                              </span>
                            </td>
                            <td className="p-2.5 font-bold text-emerald-400">{conn.wireGaugeMm2} mm²</td>
                            <td className="p-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: conn.wireColor }} />
                                <span className="text-slate-300 text-[11px]">{conn.wireColor}</span>
                              </div>
                            </td>
                            <td className="p-2.5 text-slate-300">{conn.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 4: Ladder Logic */}
              {activeTab === 'LADDER' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-400 font-mono">
                    Lógica de comando gerada automaticamente conforme IEC 61131-3:
                  </div>

                  <div className="space-y-3">
                    {editableSpec.ladderRungs.map((rung, rIdx) => (
                      <div key={rIdx} className="p-3.5 rounded-lg bg-[#0E1117] border border-[#232833] space-y-2 font-mono">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-400">{rung.title}</span>
                          <span className="text-[10px] text-slate-500">IEC 61131-3 LD</span>
                        </div>
                        <p className="text-[11px] text-slate-400 italic">{rung.comment}</p>

                        <div className="flex items-center gap-2 overflow-x-auto py-2 px-3 bg-[#161A22] rounded border border-[#1E2533]">
                          {rung.elements.map((el, eIdx) => (
                            <div key={eIdx} className="flex items-center gap-2 shrink-0">
                              <div className="p-2 rounded bg-[#0D1017] border border-[#2A313E] text-center min-w-[90px]">
                                <span className="text-[9px] text-slate-500 block uppercase">{el.type.replace('_', ' ')}</span>
                                <span className="text-xs font-bold text-cyan-400 block">{el.variable}</span>
                                {el.comment && <span className="text-[9px] text-slate-400 block">{el.comment}</span>}
                              </div>
                              {eIdx < rung.elements.length - 1 && <span className="text-amber-500 font-bold">&rarr;</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Variables Table */}
                  <div className="mt-3">
                    <span className="text-xs font-mono font-bold text-slate-300 block mb-1.5">Variáveis do CLP Declaradas:</span>
                    <div className="overflow-x-auto border border-[#232833] rounded-lg">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#161A22] text-slate-400">
                          <tr>
                            <th className="p-2">Nome</th>
                            <th className="p-2">Endereço I/O</th>
                            <th className="p-2">Tipo</th>
                            <th className="p-2">Direção</th>
                            <th className="p-2">Descrição</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E2533]">
                          {editableSpec.variables.map(v => (
                            <tr key={v.name} className="hover:bg-[#161A22]/50">
                              <td className="p-2 text-cyan-400 font-bold">{v.name}</td>
                              <td className="p-2 text-amber-400">{v.address}</td>
                              <td className="p-2 text-slate-300">{v.dataType}</td>
                              <td className="p-2 text-emerald-400">{v.direction}</td>
                              <td className="p-2 text-slate-400">{v.comment}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Engineering Calculations & Normative Compliance */}
              {activeTab === 'CALCULATIONS' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-lg bg-[#161A22] border border-[#232833] space-y-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="h-4 w-4" /> Dimensionamento Elétrico ABNT NBR 5410
                      </span>
                      <div className="space-y-1.5 text-slate-300">
                        <div className="flex justify-between">
                          <span>Corrente Nominal de Projeto (Ib):</span>
                          <strong className="text-slate-100">{editableSpec.engineeringCalculations.designCurrentIb} A</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Disjuntor Recomendado (In):</span>
                          <strong className="text-emerald-400">{editableSpec.engineeringCalculations.recommendedBreakerA} A</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Contator Recomendado (AC-3):</span>
                          <strong className="text-cyan-400">{editableSpec.engineeringCalculations.recommendedContactorA} A</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Faixa de Ajuste do Relé Térmico:</span>
                          <strong className="text-slate-100">
                            {editableSpec.engineeringCalculations.thermalRelaySettingMinA} A .. {editableSpec.engineeringCalculations.thermalRelaySettingMaxA} A
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Seção Mínima de Condutor (Iz ≥ In):</span>
                          <strong className="text-amber-400">{editableSpec.engineeringCalculations.recommendedCableMm2} mm²</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Queda de Tensão Calculada (ΔV):</span>
                          <strong className="text-slate-100">
                            {editableSpec.engineeringCalculations.calculatedVoltageDropPercent.toFixed(2)}% (Máx 4.0%)
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Potência Aparente / Reativa:</span>
                          <strong className="text-slate-100">
                            {editableSpec.engineeringCalculations.apparentPowerKva} kVA / {editableSpec.engineeringCalculations.reactivePowerKvar} kVAr
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-[#161A22] border border-[#232833] space-y-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Shield className="h-4 w-4" /> Normas Técnicas Atendidas
                      </span>
                      <ul className="space-y-1 text-slate-300 text-[11px]">
                        {editableSpec.engineeringCalculations.standardReferences.map((ref, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                            <span>{ref}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Premises & Warnings */}
                  <div className="p-3 rounded-lg bg-[#0E1117] border border-[#232833] space-y-1.5 text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300 uppercase block">Premissas de Engenharia Adotadas:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {editableSpec.engineeringCalculations.premises.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {editableSpec.engineeringCalculations.warnings.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/40 space-y-1 text-[11px] text-amber-300">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Advertências Técnicas de Engenharia:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {editableSpec.engineeringCalculations.warnings.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-[#161A22] border-t border-[#232833] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#232833] hover:bg-[#2D3444] text-slate-300 font-mono text-xs transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            {editableSpec && !isLoading && (
              <>
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setActiveTab('COMPONENTS');
                  }}
                  className="px-3 sm:px-4 py-2 rounded-lg border border-[#2E3748] hover:border-amber-500/50 text-slate-300 hover:text-white font-mono text-xs transition-colors"
                >
                  {isEditing ? 'Concluir Edição' : 'Editar'}
                </button>

                <button
                  onClick={handleApply}
                  className="px-4 sm:px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs flex items-center gap-1.5 transition-colors shadow-lg"
                >
                  <Check className="h-4 w-4" />
                  <span>Adicionar ao projeto</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
