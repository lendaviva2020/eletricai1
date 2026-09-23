'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { IndustrialProject } from '@/types/dashboard';
import {
  Bot,
  Sparkles,
  Search,
  AlertTriangle,
  FileSpreadsheet,
  FileCheck2,
  ArrowRight,
  Send,
  Zap,
  ShieldCheck,
} from 'lucide-react';

interface EletricAiIntelligenceCardProps {
  selectedProject: IndustrialProject;
}

export function EletricAiIntelligenceCard({ selectedProject }: EletricAiIntelligenceCardProps) {
  const { setActiveTab } = useWorkspace();
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastActionFeedback, setLastActionFeedback] = useState<string | null>(null);

  const handleActionClick = (actionName: string, targetTab: 'ai_copilot' | 'bom' | 'unifilar') => {
    setIsProcessing(true);
    setLastActionFeedback(`Executando ${actionName} para ${selectedProject.name}...`);
    setTimeout(() => {
      setIsProcessing(false);
      setActiveTab(targetTab);
    }, 700);
  };

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptInput.trim()) return;
    setIsProcessing(true);
    setLastActionFeedback(`Enviando prompt ao Copilot: "${aiPromptInput}"`);
    setTimeout(() => {
      setIsProcessing(false);
      setActiveTab('ai_copilot');
    }, 600);
  };

  return (
    <div className="bg-[#161A22] border border-amber-500/40 rounded-xl p-5 relative overflow-hidden shadow-lg">
      {/* Background technical watermarks */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Bot className="w-48 h-48 text-amber-400" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          {/* Top Tag & Project Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">
                  EletricAI Intelligence
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Assistente Determinístico NBR 5410 & IEC 61131-3
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0D1017] border border-[#232833] text-[11px] font-mono text-slate-300">
              <span className="text-slate-400">Contexto Ativo:</span>
              <span className="text-amber-400 font-semibold truncate max-w-[200px]">
                {selectedProject.name}
              </span>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-base sm:text-lg font-bold text-slate-100 font-sans mt-4">
            Como posso ajudar no seu projeto elétrico hoje?
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1 max-w-2xl leading-relaxed">
            Verificação instantânea de seções de condutores, seletividade de disjuntores caixa moldada, intertravamento Ladder e geração de Patch Diff para auditoria.
          </p>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
            <button
              type="button"
              onClick={() => handleActionClick('Análise de Projeto', 'ai_copilot')}
              className="p-2.5 rounded-lg bg-[#0D1017] hover:bg-amber-500 hover:text-[#0B0D10] border border-[#232833] hover:border-amber-500 text-slate-300 text-xs font-mono transition-all text-left flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400 group-hover:text-[#0B0D10]" />
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="font-semibold text-[11px]">Analisar projeto</span>
            </button>

            <button
              type="button"
              onClick={() => handleActionClick('Encontrar Inconsistências', 'unifilar')}
              className="p-2.5 rounded-lg bg-[#0D1017] hover:bg-amber-500 hover:text-[#0B0D10] border border-[#232833] hover:border-amber-500 text-slate-300 text-xs font-mono transition-all text-left flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Search className="h-3.5 w-3.5 text-cyan-400 group-hover:text-[#0B0D10]" />
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="font-semibold text-[11px]">Inconsistências</span>
            </button>

            <button
              type="button"
              onClick={() => handleActionClick('Explicar Erro', 'ai_copilot')}
              className="p-2.5 rounded-lg bg-[#0D1017] hover:bg-amber-500 hover:text-[#0B0D10] border border-[#232833] hover:border-amber-500 text-slate-300 text-xs font-mono transition-all text-left flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400 group-hover:text-[#0B0D10]" />
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="font-semibold text-[11px]">Explicar erro</span>
            </button>

            <button
              type="button"
              onClick={() => handleActionClick('Gerar Relatório', 'bom')}
              className="p-2.5 rounded-lg bg-[#0D1017] hover:bg-amber-500 hover:text-[#0B0D10] border border-[#232833] hover:border-amber-500 text-slate-300 text-xs font-mono transition-all text-left flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400 group-hover:text-[#0B0D10]" />
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="font-semibold text-[11px]">Gerar relatório</span>
            </button>

            <button
              type="button"
              onClick={() => handleActionClick('Análise do Diagrama Elétrico', 'unifilar')}
              className="p-2.5 rounded-lg bg-[#0D1017] hover:bg-amber-500 hover:text-[#0B0D10] border border-[#232833] hover:border-amber-500 text-slate-300 text-xs font-mono transition-all text-left flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Zap className="h-3.5 w-3.5 text-amber-400 group-hover:text-[#0B0D10]" />
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="font-semibold text-[11px]">Diagrama Elétrico</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai_copilot')}
              className="p-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 hover:text-[#0B0D10] border border-amber-500/30 text-amber-400 text-xs font-mono transition-all text-left flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Sparkles className="h-3.5 w-3.5 group-hover:text-[#0B0D10]" />
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="font-bold text-[11px]">Abrir Copilot</span>
            </button>
          </div>
        </div>

        {/* Interactive Prompt Input */}
        <form onSubmit={handleSendPrompt} className="mt-4 pt-3 border-t border-[#232833]/60">
          <div className="relative flex items-center">
            <input
              type="text"
              value={aiPromptInput}
              onChange={e => setAiPromptInput(e.target.value)}
              placeholder={`Pergunte algo sobre ${selectedProject.name} (ex: "Dimensionar cabo para Q02 com queda < 4%")`}
              className="w-full pl-3 pr-24 py-2 rounded-lg bg-[#0D1017] border border-[#232833] text-xs font-mono text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isProcessing || !aiPromptInput.trim()}
              className="absolute right-1.5 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#0B0D10] text-xs font-mono font-bold flex items-center gap-1 transition-colors"
            >
              <span>Perguntar</span>
              <Send className="h-3 w-3" />
            </button>
          </div>
          {lastActionFeedback && (
            <p className="text-[10px] font-mono text-amber-400 mt-1.5 flex items-center gap-1 animate-fade-in">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              {lastActionFeedback}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
