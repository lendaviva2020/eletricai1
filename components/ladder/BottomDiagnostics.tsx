'use client';

import React from 'react';
import {
  PlcProgramConfiguration,
  PlcDiagnosticIssue,
  PlcCrossReferenceItem,
  PlcWatchItem,
  PlcForceItem,
} from '@/types/plc';
import {
  AlertTriangle,
  CheckCircle2,
  Table,
  ArrowRightLeft,
  Lock,
  Activity,
  Trash2,
  Plus,
  Search,
} from 'lucide-react';

interface BottomDiagnosticsProps {
  issues: PlcDiagnosticIssue[];
  crossRefs: PlcCrossReferenceItem[];
  program: PlcProgramConfiguration;
  onNavigateToRung: (rungNumber: number) => void;
  onUnforceVariable: (varName: string) => void;
  onForceVariable: (varName: string, val: boolean | number) => void;
}

export function BottomDiagnostics({
  issues,
  crossRefs,
  program,
  onNavigateToRung,
  onUnforceVariable,
  onForceVariable,
}: BottomDiagnosticsProps) {
  const [activeTab, setActiveTab] = React.useState<'diagnostics' | 'watch' | 'force' | 'crossref' | 'audit'>('diagnostics');
  const [searchTerm, setSearchTerm] = React.useState('');

  const criticalCount = issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'ERROR').length;
  const warningCount = issues.filter(i => i.severity === 'WARNING').length;

  const forcedVars = program.globalVariables.filter(v => v.isForced);

  return (
    <div className="h-64 bg-[#11141A] border-t border-[#232833] flex flex-col font-mono text-xs select-none">
      {/* Top Tab Header */}
      <div className="h-9 px-3 bg-[#161A22] border-b border-[#232833] flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 text-xs transition-colors font-bold ${
              activeTab === 'diagnostics'
                ? 'border-amber-400 text-amber-400 bg-[#1A1F29]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Diagnósticos</span>
            {criticalCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-full text-[10px]">
                {criticalCount}
              </span>
            )}
            {warningCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-full text-[10px]">
                {warningCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('watch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 text-xs transition-colors font-bold ${
              activeTab === 'watch'
                ? 'border-cyan-400 text-cyan-400 bg-[#1A1F29]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="h-3.5 w-3.5 text-cyan-400" />
            <span>Tabela Watch</span>
            <span className="text-[10px] text-slate-500">({program.globalVariables.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('force')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 text-xs transition-colors font-bold ${
              activeTab === 'force'
                ? 'border-orange-400 text-orange-400 bg-[#1A1F29]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="h-3.5 w-3.5 text-orange-400" />
            <span>Forçamentos</span>
            {forcedVars.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-orange-500/20 border border-orange-500/40 text-orange-400 rounded-full text-[10px] animate-pulse">
                {forcedVars.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('crossref')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 text-xs transition-colors font-bold ${
              activeTab === 'crossref'
                ? 'border-emerald-400 text-emerald-400 bg-[#1A1F29]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-emerald-400" />
            <span>Referências Cruzadas</span>
          </button>
        </div>

        {/* Search bar inside tab panel */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3 w-3 text-slate-500 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Filtrar TAG / Rung..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-[#0B0D10] border border-[#232833] rounded pl-7 pr-2 py-1 text-slate-200 text-[11px] outline-none focus:border-amber-500 w-44"
            />
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* 1. Diagnostics Tab */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-1.5">
            {issues.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-400 p-4">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-bold">Nenhum erro de compilação ou inconsistência lógica detectada per IEC 61131-3:2025.</span>
              </div>
            ) : (
              issues
                .filter(
                  i =>
                    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    i.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(iss => (
                  <div
                    key={iss.id}
                    onClick={() => iss.rungNumber !== undefined && onNavigateToRung(iss.rungNumber)}
                    className={`p-2 rounded border flex items-start justify-between cursor-pointer transition-colors ${
                      iss.severity === 'CRITICAL' || iss.severity === 'ERROR'
                        ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                        : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                            iss.severity === 'CRITICAL' || iss.severity === 'ERROR'
                              ? 'bg-red-500 text-white'
                              : 'bg-amber-500 text-black'
                          }`}
                        >
                          {iss.code}
                        </span>
                        <span className="font-bold text-slate-200">{iss.title}</span>
                        {iss.rungNumber !== undefined && (
                          <span className="text-amber-400 font-bold underline text-[11px]">
                            Ir para Rung {iss.rungNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1">{iss.description}</p>
                      <p className="text-emerald-400 text-[10px] mt-0.5">Sugestão: {iss.suggestion}</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* 2. Watch Table */}
        {activeTab === 'watch' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#232833] text-slate-500 text-[10px] uppercase">
                <th className="pb-1.5">TAG</th>
                <th className="pb-1.5">Tipo</th>
                <th className="pb-1.5">Endereço</th>
                <th className="pb-1.5">Valor Atual</th>
                <th className="pb-1.5">Status</th>
                <th className="pb-1.5">Descrição</th>
                <th className="pb-1.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {program.globalVariables
                .filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(v => (
                  <tr key={v.id} className="border-b border-[#1E2430] hover:bg-[#161A22] text-[11px]">
                    <td className="py-1 font-bold text-slate-200">{v.name}</td>
                    <td className="py-1 text-amber-400">{v.dataType}</td>
                    <td className="py-1 text-cyan-400">{v.address || 'Interno'}</td>
                    <td className="py-1 font-bold">
                      <span className={v.currentValue ? 'text-emerald-400' : 'text-slate-500'}>
                        {String(v.currentValue)} {v.unit || ''}
                      </span>
                    </td>
                    <td className="py-1">
                      {v.isForced ? (
                        <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded text-[10px] border border-orange-500/30">
                          FORÇADA
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-[10px]">Normal</span>
                      )}
                    </td>
                    <td className="py-1 text-slate-400 truncate max-w-xs">{v.comment || v.description}</td>
                    <td className="py-1 text-right">
                      {typeof v.currentValue === 'boolean' && (
                        <button
                          onClick={() => onForceVariable(v.name, !v.currentValue)}
                          className="px-2 py-0.5 rounded bg-[#232833] hover:bg-[#2F3847] text-slate-200 text-[10px]"
                        >
                          Alternar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* 3. Force Table */}
        {activeTab === 'force' && (
          <div>
            {forcedVars.length === 0 ? (
              <div className="text-slate-500 p-4 text-center">
                Nenhuma variável com forçamento ativo. Em ambiente industrial online, todas as saídas respondem estritamente à lógica programada.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#232833] text-slate-500 text-[10px] uppercase">
                    <th className="pb-1.5">TAG Forçada</th>
                    <th className="pb-1.5">Tipo</th>
                    <th className="pb-1.5">Endereço</th>
                    <th className="pb-1.5">Valor Forçado</th>
                    <th className="pb-1.5">Ação de Segurança</th>
                  </tr>
                </thead>
                <tbody>
                  {forcedVars.map(fv => (
                    <tr key={fv.id} className="border-b border-[#1E2430] hover:bg-[#161A22] text-[11px]">
                      <td className="py-1 font-bold text-orange-400">{fv.name}</td>
                      <td className="py-1 text-slate-400">{fv.dataType}</td>
                      <td className="py-1 text-cyan-400">{fv.address || 'N/A'}</td>
                      <td className="py-1 font-bold text-white bg-orange-600/30 px-2 py-0.5 rounded inline-block">
                        {String(fv.forcedValue)}
                      </td>
                      <td className="py-1">
                        <button
                          onClick={() => onUnforceVariable(fv.name)}
                          className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[10px] font-bold"
                        >
                          Liberar Forçamento (UNFORCE)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 4. Cross Reference Table */}
        {activeTab === 'crossref' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#232833] text-slate-500 text-[10px] uppercase">
                <th className="pb-1.5">TAG</th>
                <th className="pb-1.5">POU</th>
                <th className="pb-1.5">Rung</th>
                <th className="pb-1.5">Elemento</th>
                <th className="pb-1.5">Acesso</th>
                <th className="pb-1.5 text-right">Navegação</th>
              </tr>
            </thead>
            <tbody>
              {crossRefs
                .filter(cr => cr.variableName.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((cr, idx) => (
                  <tr key={idx} className="border-b border-[#1E2430] hover:bg-[#161A22] text-[11px]">
                    <td className="py-1 font-bold text-slate-200">{cr.variableName}</td>
                    <td className="py-1 text-cyan-400">{cr.pouName}</td>
                    <td className="py-1 text-amber-400 font-bold">Rung {cr.rungNumber}</td>
                    <td className="py-1 text-slate-300">{cr.elementType}</td>
                    <td className="py-1">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          cr.accessMode === 'WRITE'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {cr.accessMode}
                      </span>
                    </td>
                    <td className="py-1 text-right">
                      <button
                        onClick={() => onNavigateToRung(cr.rungNumber)}
                        className="px-2 py-0.5 rounded bg-[#232833] hover:bg-[#2F3847] text-amber-400 text-[10px]"
                      >
                        Ir para Rung
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
