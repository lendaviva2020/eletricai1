'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronUp,
  ChevronDown,
  FileSpreadsheet,
  Layers,
  Calculator,
  ShieldCheck,
  Search,
  Download,
  Focus,
} from 'lucide-react';
import {
  ElectricalValidationIssue,
  LoadListItem,
  TerminalStrip,
  IssueSeverity,
} from '@/types/electrical';

interface BottomInspectionConsoleProps {
  issues: ElectricalValidationIssue[];
  loadList: LoadListItem[];
  terminalStrips: TerminalStrip[];
  onSelectComponent: (id: string) => void;
  cursorCoordinates: { x: number; y: number };
  activePageTitle: string;
  zoomPercent: number;
  snapStatus: boolean;
  onExportLoadListCsv: () => void;
  // Connectivity Alert & Actions
  orphanComponents?: Array<{ id: string; tag: string; name: string }>;
  unterminatedWires?: Array<{ id: string; wireNumber?: string }>;
  onCleanupFloatingWires?: () => void;
  onActivateWireTool?: () => void;
}

export function BottomInspectionConsole({
  issues,
  loadList,
  terminalStrips,
  onSelectComponent,
  cursorCoordinates,
  activePageTitle,
  zoomPercent,
  snapStatus,
  onExportLoadListCsv,
  orphanComponents = [],
  unterminatedWires = [],
  onCleanupFloatingWires,
  onActivateWireTool,
}: BottomInspectionConsoleProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'VALIDATION' | 'LOAD_LIST' | 'TERMINALS' | 'CALCULATIONS'>('VALIDATION');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const errorCount = issues.filter(i => i.severity === 'ERROR').length;
  const warningCount = issues.filter(i => i.severity === 'WARNING').length;
  const recCount = issues.filter(i => i.severity === 'RECOMMENDATION').length;
  const infoCount = issues.filter(i => i.severity === 'INFO').length;

  const connectivityIssues = issues.filter(i => i.category === 'CONNECTIVITY');
  const orphanCount = orphanComponents.length > 0 
    ? orphanComponents.length 
    : connectivityIssues.filter(i => i.code === 'ERR_ORPHAN_COMP').length;
  const unterminatedCount = unterminatedWires.length > 0
    ? unterminatedWires.length
    : connectivityIssues.filter(i => i.code === 'ERR_FLOATING_WIRE').length;
  const hasConnectivityAlert = orphanCount > 0 || unterminatedCount > 0;

  const filteredIssues = issues.filter(i => {
    if (selectedSeverity === 'ALL') return true;
    if (selectedSeverity === 'CONNECTIVITY') return i.category === 'CONNECTIVITY';
    return i.severity === selectedSeverity;
  });

  return (
    <div className="bg-[#11141A] border-t border-[#232833] flex flex-col z-20 select-none text-slate-200">
      {/* Visual Connectivity Alert Banner */}
      {hasConnectivityAlert && (
        <div className="bg-gradient-to-r from-red-950/95 via-[#231215] to-[#161A22] border-b border-red-500/50 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded bg-red-500/20 border border-red-500/60 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-300 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping inline-block" />
                  ALERTA VISUAL DE CONECTIVIDADE
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white uppercase shadow-sm">
                  {orphanCount + unterminatedCount} ANOMALIA{orphanCount + unterminatedCount > 1 ? 'S' : ''} DETECTADA{orphanCount + unterminatedCount > 1 ? 'S' : ''}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/90 mt-0.5">
                {orphanCount > 0 && (
                  <span className="font-semibold text-amber-300">
                    {orphanCount} componente(s) órfão(s) sem condutor conectado aos bornes.
                  </span>
                )}
                {orphanCount > 0 && unterminatedCount > 0 && ' • '}
                {unterminatedCount > 0 && (
                  <span className="font-semibold text-red-300">
                    {unterminatedCount} fio(s) sem terminal de conexão definido na prancha.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons for Connectivity */}
          <div className="flex items-center gap-2 flex-wrap">
            {orphanComponents.length > 0 && (
              <div className="flex items-center gap-1.5 bg-black/40 border border-red-500/30 px-2 py-1 rounded">
                <span className="text-[10px] text-slate-400">Focar Órfão:</span>
                {orphanComponents.slice(0, 3).map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      onSelectComponent(comp.id);
                      setActiveTab('VALIDATION');
                      setIsOpen(true);
                    }}
                    className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/40 text-[10px] font-bold transition-colors flex items-center gap-1"
                    title={`Focar em ${comp.tag} (${comp.name})`}
                  >
                    <Focus className="h-3 w-3" />
                    <span>{comp.tag}</span>
                  </button>
                ))}
              </div>
            )}

            {onActivateWireTool && (
              <button
                onClick={onActivateWireTool}
                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] flex items-center gap-1.5 shadow transition-colors"
                title="Ativar ferramenta de desenho de fios (WIRE)"
              >
                <span>⚡ Traçar Condutor (WIRE)</span>
              </button>
            )}

            {onCleanupFloatingWires && unterminatedCount > 0 && (
              <button
                onClick={onCleanupFloatingWires}
                className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title="Excluir fios com terminais inexistentes"
              >
                <span>🧹 Limpar Fios Soltos</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Console Tab Bar & Status Summary */}
      <div className="h-9 px-4 bg-[#0D1017] border-b border-[#1E2533] flex items-center justify-between">
        {/* Left Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setActiveTab('VALIDATION'); setIsOpen(true); }}
            className={`px-3 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
              activeTab === 'VALIDATION' && isOpen
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Validação de Engenharia</span>
            {(criticalCount > 0 || errorCount > 0) && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500/20 text-red-400 font-bold border border-red-500/40">
                {criticalCount + errorCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('LOAD_LIST'); setIsOpen(true); }}
            className={`px-3 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
              activeTab === 'LOAD_LIST' && isOpen
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-400" />
            <span>Lista de Cargas ({loadList.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('TERMINALS'); setIsOpen(true); }}
            className={`px-3 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
              activeTab === 'TERMINALS' && isOpen
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>Bornes & Régua -X1</span>
          </button>

          <button
            onClick={() => { setActiveTab('CALCULATIONS'); setIsOpen(true); }}
            className={`px-3 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
              activeTab === 'CALCULATIONS' && isOpen
                ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="h-3.5 w-3.5 text-indigo-400" />
            <span>Fórmulas NBR 5410</span>
          </button>
        </div>

        {/* Right Status Information */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="text-slate-500">Coord:</span>
            <span className="text-slate-200">X: {cursorCoordinates.x}mm, Y: {cursorCoordinates.y}mm</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-500">Prancha:</span>
            <span className="text-amber-400">{activePageTitle}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-500">Snap:</span>
            <span className={snapStatus ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {snapStatus ? 'ATIVO' : 'OFF'}
            </span>
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded hover:bg-[#1E2533] text-slate-400 hover:text-slate-200 transition-colors"
            title={isOpen ? 'Recolher console' : 'Expandir console'}
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Console Content */}
      {isOpen && (
        <div className="h-64 overflow-y-auto p-3 bg-[#11141A]">
          {/* TAB 1: VALIDAÇÃO DO PROJETO */}
          {activeTab === 'VALIDATION' && (
            <div className="flex flex-col gap-3">
              {/* Severity Filter Badges */}
              <div className="flex items-center justify-between pb-2 border-b border-[#232833]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 font-bold">Filtro de Severidade:</span>
                  <button
                    onClick={() => setSelectedSeverity('ALL')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      selectedSeverity === 'ALL'
                        ? 'bg-slate-700 text-white font-bold'
                        : 'bg-[#161A22] text-slate-400 border border-[#232833]'
                    }`}
                  >
                    Todos ({issues.length})
                  </button>
                  <button
                    onClick={() => setSelectedSeverity('CONNECTIVITY')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 ${
                      selectedSeverity === 'CONNECTIVITY'
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-rose-950/40 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Conectividade ({connectivityIssues.length})
                  </button>
                  <button
                    onClick={() => setSelectedSeverity('CRITICAL')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      selectedSeverity === 'CRITICAL'
                        ? 'bg-red-500 text-white font-bold'
                        : 'bg-red-950/30 text-red-400 border border-red-500/30'
                    }`}
                  >
                    Crítico ({criticalCount})
                  </button>
                  <button
                    onClick={() => setSelectedSeverity('ERROR')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      selectedSeverity === 'ERROR'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-amber-950/30 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    Erros ({errorCount})
                  </button>
                  <button
                    onClick={() => setSelectedSeverity('WARNING')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      selectedSeverity === 'WARNING'
                        ? 'bg-yellow-600 text-black font-bold'
                        : 'bg-yellow-950/30 text-yellow-300 border border-yellow-500/30'
                    }`}
                  >
                    Atenção ({warningCount})
                  </button>
                  <button
                    onClick={() => setSelectedSeverity('RECOMMENDATION')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      selectedSeverity === 'RECOMMENDATION'
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-cyan-950/30 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    Recomendações ({recCount})
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  Normas: <span className="text-amber-400 font-bold">ABNT NBR 5410 / IEC 60364 / IEC 60947</span>
                </div>
              </div>

              {/* Issue Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredIssues.map(issue => {
                  const isCrit = issue.severity === 'CRITICAL';
                  const isErr = issue.severity === 'ERROR';
                  const isWarn = issue.severity === 'WARNING';
                  const isRec = issue.severity === 'RECOMMENDATION';

                  const badgeBg = isCrit
                    ? 'bg-red-500/10 border-red-500/40 text-red-300'
                    : isErr
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : isWarn
                    ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300'
                    : isRec
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-300';

                  return (
                    <div
                      key={issue.id}
                      className={`p-3 rounded-lg border ${badgeBg} flex flex-col gap-1.5 transition-all hover:border-amber-400/50`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isCrit && <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                          {isErr && <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />}
                          {isWarn && <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />}
                          {isRec && <Info className="h-4 w-4 text-cyan-400 flex-shrink-0" />}
                          <span className="font-bold text-xs">{issue.title}</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 border border-white/10 uppercase">
                          {issue.severity}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {issue.description}
                      </p>

                      <div className="text-[10px] text-slate-400 bg-black/30 p-1.5 rounded flex flex-col gap-0.5 border border-white/5">
                        <span><strong className="text-slate-300">Causa Técnica:</strong> {issue.reason}</span>
                        <span><strong className="text-amber-400">Ação Corretiva:</strong> {issue.suggestion}</span>
                      </div>

                      {issue.componentId && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => onSelectComponent(issue.componentId!)}
                            className="px-2 py-0.5 rounded bg-[#161A22] hover:bg-[#232833] text-amber-300 border border-amber-500/30 text-[10px] font-mono flex items-center gap-1 transition-colors"
                          >
                            <Focus className="h-3 w-3" />
                            Focar no Diagrama ({issue.componentTag})
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LISTA DE CARGAS (LOAD LIST) */}
          {activeTab === 'LOAD_LIST' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#232833]">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Tabela Completa de Cargas Industriais (Quadro CCM-01 / QGBT)
                </span>
                <button
                  onClick={onExportLoadListCsv}
                  className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono flex items-center gap-1 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  Exportar CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-[#161A22] text-slate-400 border-b border-[#232833]">
                      <th className="p-2">TAG</th>
                      <th className="p-2">Equipamento</th>
                      <th className="p-2">Potência</th>
                      <th className="p-2">Tensão</th>
                      <th className="p-2">In (A)</th>
                      <th className="p-2">Cos φ</th>
                      <th className="p-2">Rend. %</th>
                      <th className="p-2">Demanda</th>
                      <th className="p-2">Disjuntor</th>
                      <th className="p-2">Cabo</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadList.map(item => (
                      <tr
                        key={item.id}
                        className="border-b border-[#1E2533] hover:bg-[#161A22] transition-colors"
                      >
                        <td className="p-2 text-amber-400 font-bold">{item.tag}</td>
                        <td className="p-2 text-slate-200">{item.equipmentName}</td>
                        <td className="p-2 text-cyan-300">{item.powerKw} kW ({item.powerHp || '-'} CV)</td>
                        <td className="p-2">{item.voltageV}V</td>
                        <td className="p-2 font-bold text-slate-100">{item.nominalCurrentA} A</td>
                        <td className="p-2">{item.powerFactor}</td>
                        <td className="p-2">{item.efficiencyPercent}%</td>
                        <td className="p-2 text-emerald-400 font-bold">{item.demandKw} kW</td>
                        <td className="p-2 text-amber-300">{item.breakerRatingA}A</td>
                        <td className="p-2">{item.cableSectionMm2} mm²</td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TERMINAL STRIP (BORNES E RÉGUA -X1) */}
          {activeTab === 'TERMINALS' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#232833]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                    Régua de Bornes -X1 (Painel CCM-01)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Conexão de Campo / Motores / Botoeiras
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-[#161A22] text-slate-400 border-b border-[#232833]">
                      <th className="p-2">Borne nº</th>
                      <th className="p-2">Tipo</th>
                      <th className="p-2">Fio Interno</th>
                      <th className="p-2">Equipamento Painel</th>
                      <th className="p-2">Destino em Campo</th>
                      <th className="p-2">Bitola</th>
                      <th className="p-2">Ponte / Jumper</th>
                      <th className="p-2">Folha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {terminalStrips[0]?.terminals.map(t => (
                      <tr key={t.id} className="border-b border-[#1E2533] hover:bg-[#161A22]">
                        <td className="p-2 text-cyan-300 font-bold">{t.terminalNumber}</td>
                        <td className="p-2 text-slate-400">{t.type}</td>
                        <td className="p-2 text-amber-400">{t.wireInTag}</td>
                        <td className="p-2 text-slate-200">{t.fromDeviceTag}</td>
                        <td className="p-2 text-slate-200">{t.toDeviceTag}</td>
                        <td className="p-2 font-bold">{t.wireGaugeMm2} mm²</td>
                        <td className="p-2 text-slate-400">{t.isBridgeConnected ? 'PONTE INTERNA' : '-'}</td>
                        <td className="p-2 text-slate-500">{t.pageRef}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FÓRMULAS E CÁLCULOS NBR 5410 */}
          {activeTab === 'CALCULATIONS' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded bg-[#161A22] border border-[#232833] flex flex-col gap-1.5">
                <span className="font-mono text-xs font-bold text-amber-400">1. Corrente de Projeto (Ib)</span>
                <code className="text-[11px] bg-[#0D1017] p-2 rounded text-cyan-300 font-mono">
                  Ib = P / (√3 · V · cos φ · η)
                </code>
                <p className="text-[10px] text-slate-400">
                  Calculada para cada circuito com base na potência no eixo (kW), tensão nominal entre fases (V), fator de potência e rendimento nominal do motor.
                </p>
              </div>

              <div className="p-3 rounded bg-[#161A22] border border-[#232833] flex flex-col gap-1.5">
                <span className="font-mono text-xs font-bold text-amber-400">2. Queda de Tensão (ΔV%)</span>
                <code className="text-[11px] bg-[#0D1017] p-2 rounded text-cyan-300 font-mono">
                  ΔU = √3 · Ib · (R·cosφ + X·senφ)
                </code>
                <p className="text-[10px] text-slate-400">
                  NBR 5410 item 6.2.7. Limite máximo: 4.0% para circuitos terminais e 2.0% para alimentadores gerais entre subestação e QGBT.
                </p>
              </div>

              <div className="p-3 rounded bg-[#161A22] border border-[#232833] flex flex-col gap-1.5">
                <span className="font-mono text-xs font-bold text-amber-400">3. Coordenação Sobrecarga</span>
                <code className="text-[11px] bg-[#0D1017] p-2 rounded text-cyan-300 font-mono">
                  Ib ≤ In ≤ Iz  e  I2 ≤ 1.45 · Iz
                </code>
                <p className="text-[10px] text-slate-400">
                  Garante que o cabo opere dentro da sua capacidade térmica Iz considerando temperatura ambiente e fatores de agrupamento (FCA / FCT).
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
