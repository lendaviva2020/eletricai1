'use client';

import React from 'react';
import { IndustrialProject, IndustrialAlert } from '@/types/dashboard';
import {
  TrendingUp,
  PieChart,
  BarChart3,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';

interface IndicatorsSectionProps {
  projects: IndustrialProject[];
  alerts: IndustrialAlert[];
}

export function IndicatorsSection({ projects, alerts }: IndicatorsSectionProps) {
  // Activity over last 7 days (simulated realistic engineering commits/edits)
  const last7DaysData = [
    { day: 'Qui', edits: 18, analyses: 4 },
    { day: 'Sex', edits: 34, analyses: 7 },
    { day: 'Sáb', edits: 12, analyses: 2 },
    { day: 'Dom', edits: 5, analyses: 1 },
    { day: 'Seg', edits: 42, analyses: 9 },
    { day: 'Ter', edits: 58, analyses: 12 },
    { day: 'Hoje', edits: 47, analyses: 11 },
  ];

  const maxEdits = Math.max(...last7DaysData.map(d => d.edits));

  // Projects by status count
  const statusCounts = {
    EM_EXECUCAO: projects.filter(p => p.status === 'EM_EXECUCAO').length,
    EM_COMISSIONAMENTO: projects.filter(p => p.status === 'EM_COMISSIONAMENTO').length,
    CONCLUIDO: projects.filter(p => p.status === 'CONCLUIDO').length,
    REVISAO_TECNICA: projects.filter(p => p.status === 'REVISAO_TECNICA').length,
  };

  // Alerts by category
  const categoryCounts = {
    NBR_5410: alerts.filter(a => a.category === 'NBR_5410').length,
    MODBUS_REDE: alerts.filter(a => a.category === 'MODBUS_REDE').length,
    CLP_IO: alerts.filter(a => a.category === 'CLP_IO').length,
    SEGURANCA_NR10: alerts.filter(a => a.category === 'SEGURANCA_NR10').length,
    SOBRECARGA: alerts.filter(a => a.category === 'SOBRECARGA').length,
  };

  return (
    <div className="bg-[#161A22] border border-[#232833] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#232833]">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-sans">
              Indicadores de Desempenho & Métricas
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Produtividade de cálculo, conformidade normativa e ritmo de engenharia
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* 1. Atividade dos últimos 7 dias (Bar Chart) */}
        <div className="bg-[#0D1017] p-3.5 rounded-lg border border-[#232833] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200">
              Atividade nos Últimos 7 Dias
            </span>
            <span className="text-[10px] font-mono text-amber-400">
              216 operações CAD/CLP
            </span>
          </div>

          <div className="h-32 flex items-end justify-between gap-2 pt-4 px-1">
            {last7DaysData.map((d, i) => {
              const heightPercent = Math.round((d.edits / maxEdits) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.edits}
                  </span>
                  <div className="w-full bg-[#161A22] rounded-t overflow-hidden flex flex-col justify-end" style={{ height: '70%' }}>
                    <div
                      className={`w-full rounded-t transition-all duration-500 ${
                        d.day === 'Hoje' ? 'bg-amber-400' : 'bg-slate-600 group-hover:bg-slate-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between border-t border-[#1F2633] pt-2">
            <span>Média: 30.8 op/dia</span>
            <span className="text-emerald-400">+18% esta semana</span>
          </div>
        </div>

        {/* 2. Projetos por Status */}
        <div className="bg-[#0D1017] p-3.5 rounded-lg border border-[#232833] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200">
              Projetos por Status
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Total: {projects.length}
            </span>
          </div>

          <div className="space-y-2 py-1">
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-0.5">
                <span>Em Execução</span>
                <span className="font-bold text-amber-400">{statusCounts.EM_EXECUCAO}</span>
              </div>
              <div className="w-full bg-[#161A22] h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${(statusCounts.EM_EXECUCAO / projects.length) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-0.5">
                <span>Comissionamento</span>
                <span className="font-bold text-cyan-400">{statusCounts.EM_COMISSIONAMENTO}</span>
              </div>
              <div className="w-full bg-[#161A22] h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${(statusCounts.EM_COMISSIONAMENTO / projects.length) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-0.5">
                <span>Concluídos (As-Built)</span>
                <span className="font-bold text-emerald-400">{statusCounts.CONCLUIDO}</span>
              </div>
              <div className="w-full bg-[#161A22] h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${(statusCounts.CONCLUIDO / projects.length) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 border-t border-[#1F2633] pt-2 flex items-center justify-between">
            <span>Taxa de Entrega: 100% no prazo</span>
          </div>
        </div>

        {/* 3. Alertas por Categoria & Utilização */}
        <div className="bg-[#0D1017] p-3.5 rounded-lg border border-[#232833] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200">
              Distribuição dos Alertas
            </span>
            <span className="text-[10px] font-mono text-rose-400">
              {alerts.length} totais
            </span>
          </div>

          <div className="space-y-1.5 py-1 text-[11px] font-mono">
            <div className="flex items-center justify-between p-1.5 rounded bg-[#161A22] border border-[#232833]">
              <span className="text-slate-300">Queda de Tensão (NBR 5410)</span>
              <span className="text-amber-400 font-bold">{categoryCounts.NBR_5410}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-[#161A22] border border-[#232833]">
              <span className="text-slate-300">Barramento Modbus TCP</span>
              <span className="text-rose-400 font-bold">{categoryCounts.MODBUS_REDE}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-[#161A22] border border-[#232833]">
              <span className="text-slate-300">Lógica CLP & I/O</span>
              <span className="text-cyan-400 font-bold">{categoryCounts.CLP_IO}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-[#161A22] border border-[#232833]">
              <span className="text-slate-300">Proteção NR-10 & DPS</span>
              <span className="text-slate-400 font-bold">{categoryCounts.SEGURANCA_NR10}</span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 border-t border-[#1F2633] pt-2 flex items-center justify-between">
            <span>Conformidade Geral: 94.2%</span>
            <span className="text-emerald-400 font-semibold">APROVADO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
