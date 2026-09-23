'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { AiPatchProposal, PatchChange } from '@/types/electrical';
import {
  Bot,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Send,
} from 'lucide-react';

export function AiCopilotView() {
  const {
    activePatch,
    setActivePatch,
    applyPatch,
    rejectPatch,
    components,
    sharedTags,
    setActiveTab,
  } = useWorkspace();

  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPromptChips = [
    'Adicionar partida estrela-triângulo para motor 30cv com disjuntores e contatores K1, K2, K3',
    'Adequar proteção contra choque e incêndio com DR 300mA per NBR 5410 item 5.1.3',
    'Redimensionar cabo alimentador para manter queda de tensão inferior a 4.0%',
    'Adicionar banco de capacitores automático 30 kVAr para FP >= 0.95',
  ];

  const handleSendPrompt = async (textToSend?: string) => {
    const query = textToSend || promptInput;
    if (!query.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/engineer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          currentComponents: components,
          currentTags: sharedTags,
        }),
      });

      const data = await res.json();
      if (data.proposal) {
        setActivePatch(data.proposal);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      if (!textToSend) setPromptInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] text-slate-200 select-none overflow-hidden">
      {/* Top Banner */}
      <div className="h-12 px-6 bg-[#11141A] border-b border-[#232833] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-slate-100 uppercase tracking-wider">
                IA Copilot Engenharia & Patch Preview Diff
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                Gemini 3.8 Flash • NBR 5410
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Regra estrita de soberania técnica: alterações nunca são aplicadas sem aprovação explícita em preview diff
            </p>
          </div>
        </div>

        {activePatch && (
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            1 PATCH AGUARDANDO REVISÃO
          </span>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Left Column: AI Assistant Prompting & Normative Advisory */}
        <div className="w-1/3 flex flex-col gap-4 bg-[#11141A] border border-[#232833] rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2 pb-2 border-b border-[#232833]">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="font-mono font-bold text-xs text-slate-100">
              SOLICITAR CONSULTORIA OU MODIFICAÇÃO
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Descreva a intervenção desejada em linguagem natural. O modelo analisará as normas
            <strong> NBR 5410</strong>, <strong>NBR 14039</strong> e <strong>NR-10</strong>, calculando
            capacidades de condução, queda de tensão e gerando a proposta de patch auditável.
          </p>

          {/* Quick Prompt Chips */}
          <div className="flex flex-col gap-1.5 mt-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
              Sugestões Rápidas de Engenharia:
            </span>
            {quickPromptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(chip)}
                className="text-left text-[11px] p-2 rounded bg-[#161A22] hover:bg-[#1E2533] border border-[#232833] hover:border-amber-500/40 text-slate-300 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Prompt Input Box */}
          <div className="mt-auto flex flex-col gap-2">
            <div className="relative">
              <textarea
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
                rows={3}
                placeholder="Digite sua solicitação técnica para o EletricAI..."
                className="w-full bg-[#161A22] border border-[#2A313E] focus:border-amber-500 rounded p-3 text-xs text-slate-200 placeholder-slate-500 outline-none resize-none transition-colors"
              />
            </div>
            <button
              onClick={() => handleSendPrompt()}
              disabled={isLoading || !promptInput.trim()}
              className="w-full py-2 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#0B0D10] font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              {isLoading ? (
                <span>ANALISANDO NORMAS ABNT...</span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 fill-[#0B0D10]" />
                  <span>GERAR PATCH PREVIEW DIFF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Patch Preview Diff Reviewer */}
        <div className="flex-1 bg-[#11141A] border border-[#232833] rounded-lg p-6 flex flex-col overflow-y-auto shadow-inner">
          {activePatch ? (
            <div className="flex flex-col gap-5">
              {/* Proposal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#232833]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      PREVIEW DE PATCH #1
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Criado em: {new Date(activePatch.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-100 mt-1">
                    {activePatch.title}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    {activePatch.summary}
                  </p>
                </div>
              </div>

              {/* Impact Badges */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-[#161A22] p-3 rounded border border-[#232833] flex items-center gap-3">
                  <TrendingDown className="h-5 w-5 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-slate-400">Impacto Queda de Tensão (ΔV)</span>
                    <p className="text-slate-100 font-bold">{activePatch.voltageDropImpact}</p>
                  </div>
                </div>
                <div className="bg-[#161A22] p-3 rounded border border-[#232833] flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-amber-400" />
                  <div>
                    <span className="text-[10px] text-slate-400">Impacto Orçamentário BOM</span>
                    <p className="text-slate-100 font-bold">
                      + R$ {activePatch.costImpactBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Safety Warnings per NR-10 */}
              {activePatch.safetyWarnings.length > 0 && (
                <div className="bg-red-950/20 border border-red-500/40 rounded p-3 flex flex-col gap-1.5 text-xs font-mono text-red-300">
                  <div className="flex items-center gap-1.5 font-bold text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>PRESCRIÇÕES CRÍTICAS DE SEGURANÇA (NR-10)</span>
                  </div>
                  <ul className="list-disc pl-5 flex flex-col gap-0.5 text-[11px]">
                    {activePatch.safetyWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Changes Diff List */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Alterações Detalhadas no Modelo ({activePatch.changes.length} itens)
                </span>

                <div className="flex flex-col gap-2.5">
                  {activePatch.changes.map((change, i) => {
                    const isAdd = change.action === 'ADD';
                    const isRemove = change.action === 'REMOVE';
                    const isModify = change.action === 'MODIFY';

                    return (
                      <div
                        key={i}
                        className={`p-3.5 rounded border text-xs font-mono flex flex-col gap-2 ${
                          isAdd
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : isRemove
                            ? 'bg-red-950/20 border-red-500/40'
                            : 'bg-amber-950/20 border-amber-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isAdd
                                  ? 'bg-emerald-500/30 text-emerald-300'
                                  : isRemove
                                  ? 'bg-red-500/30 text-red-300'
                                  : 'bg-amber-500/30 text-amber-300'
                              }`}
                            >
                              {change.action === 'ADD' ? '+ ADICIONAR' : change.action === 'MODIFY' ? '~ ALTERAR' : '- REMOVER'}
                            </span>
                            <span className="font-bold text-slate-100">
                              {change.targetName}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              [{change.targetType}]
                            </span>
                          </div>
                          <span className="text-cyan-400 text-[10px]">
                            {change.nbrNormReference}
                          </span>
                        </div>

                        {/* Rationale */}
                        <p className="text-[11px] text-slate-300">
                          {change.technicalRationale}
                        </p>

                        {/* Details diff */}
                        {isModify && change.before && (
                          <div className="bg-[#0B0D10] p-2 rounded text-[10px] grid grid-cols-2 gap-2 text-slate-400">
                            <div>
                              <span className="text-red-400 font-bold block">- Antes:</span>
                              <pre className="text-slate-400 whitespace-pre-wrap">{JSON.stringify(change.before, null, 2)}</pre>
                            </div>
                            <div>
                              <span className="text-emerald-400 font-bold block">+ Depois:</span>
                              <pre className="text-emerald-300 whitespace-pre-wrap">{JSON.stringify(change.after, null, 2)}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Approval Bar */}
              <div className="mt-4 pt-4 border-t border-[#232833] flex items-center justify-end gap-3">
                <button
                  onClick={rejectPatch}
                  className="px-4 py-2 rounded bg-[#161A22] hover:bg-[#232833] text-slate-300 font-mono text-xs font-bold border border-[#232833] transition-colors"
                >
                  Rejeitar Proposta
                </button>
                <button
                  onClick={() => {
                    applyPatch(activePatch);
                    setActiveTab('unifilar');
                  }}
                  className="px-5 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-[#0B0D10] font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  <CheckCircle2 className="h-4 w-4 fill-[#0B0D10] text-emerald-500" />
                  <span>Aprovar e Aplicar Patch no Projeto</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3 text-slate-500">
              <Bot className="h-12 w-12 text-slate-600" />
              <p className="font-mono text-xs max-w-md">
                Nenhum patch de engenharia pendente de revisão. Digite uma solicitação à esquerda ou selecione uma sugestão para gerar um Patch Preview Diff.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
