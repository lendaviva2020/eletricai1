'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import {
  FileSpreadsheet,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Building,
  HardHat,
} from 'lucide-react';

export function BomMemorial() {
  const { bomItems, tenant, user, components } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'bom_table' | 'memorial_abnt'>('bom_table');

  const totalCostBrl = bomItems.reduce((acc, item) => acc + item.totalPriceBrl, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] text-slate-200 select-none overflow-hidden">
      {/* Top Banner */}
      <div className="h-12 px-6 bg-[#11141A] border-b border-[#232833] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-slate-100 uppercase tracking-wider">
                BOM Comercial & Memorial Descritivo ABNT
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                NBR 5410 / NBR 14039
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Precificação real em BRL (R$) com peças de catálogo WEG, Schneider e Prysmian
            </p>
          </div>
        </div>

        {/* View Switcher & Print */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#161A22] border border-[#232833] p-1 rounded">
            <button
              onClick={() => setActiveTab('bom_table')}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                activeTab === 'bom_table'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lista de Materiais (BOM)
            </button>
            <button
              onClick={() => setActiveTab('memorial_abnt')}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                activeTab === 'memorial_abnt'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Memorial Descritivo Técnico
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {activeTab === 'bom_table' ? (
          /* Table of Materials */
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#11141A] border border-[#232833] rounded-lg p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                  Valor Total dos Materiais
                </span>
                <p className="text-xl font-mono font-black text-emerald-400 mt-1">
                  R$ {totalCostBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-slate-500 font-mono mt-1">
                  Valores médios mercado BR
                </span>
              </div>

              <div className="bg-[#11141A] border border-[#232833] rounded-lg p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                  Total de Itens de Catálogo
                </span>
                <p className="text-xl font-mono font-black text-cyan-400 mt-1">
                  {bomItems.length} componentes
                </p>
                <span className="text-[10px] text-slate-500 font-mono mt-1">
                  WEG, Schneider, Prysmian
                </span>
              </div>

              <div className="bg-[#11141A] border border-[#232833] rounded-lg p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                  Estimativa de Montagem & Painel
                </span>
                <p className="text-xl font-mono font-black text-amber-400 mt-1">
                  R$ {(totalCostBrl * 0.28).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-slate-500 font-mono mt-1">
                  Mão de obra qualificada NR-10
                </span>
              </div>

              <div className="bg-[#11141A] border border-[#232833] rounded-lg p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                  Conformidade Normativa
                </span>
                <p className="text-xl font-mono font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  100% ABNT
                </p>
                <span className="text-[10px] text-slate-500 font-mono mt-1">
                  NBR 5410 / NBR 14039
                </span>
              </div>
            </div>

            {/* BOM Table */}
            <div className="bg-[#11141A] border border-[#232833] rounded-lg overflow-hidden shadow-inner">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#161A22] border-b border-[#232833] text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">TAG</th>
                    <th className="p-3">Descrição do Equipamento</th>
                    <th className="p-3">Norma ABNT</th>
                    <th className="p-3">Fabricante / Modelo</th>
                    <th className="p-3 text-right">Qtd</th>
                    <th className="p-3 text-right">Unitário (R$)</th>
                    <th className="p-3 text-right">Total (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1F29] text-slate-300">
                  {bomItems.map(item => (
                    <tr key={item.id} className="hover:bg-[#161A22]/50 transition-colors">
                      <td className="p-3 text-slate-500">{item.itemNumber}</td>
                      <td className="p-3 font-bold text-amber-400">{item.tag}</td>
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-slate-400">{item.normReference}</td>
                      <td className="p-3 text-cyan-400">{item.manufacturer} {item.model}</td>
                      <td className="p-3 text-right">{item.quantity} {item.unit}</td>
                      <td className="p-3 text-right">R$ {item.unitPriceBrl.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        R$ {item.totalPriceBrl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Technical Descriptive Memorial Document formatted per ABNT */
          <div className="flex-1 bg-[#11141A] border border-[#232833] rounded-lg p-8 overflow-y-auto font-serif text-slate-300 leading-relaxed max-w-4xl mx-auto shadow-2xl">
            <div className="text-center pb-6 border-b border-[#232833] font-sans">
              <h1 className="text-xl font-bold text-slate-100 tracking-wider">
                MEMORIAL DESCRITIVO E ESPECIFICAÇÃO TÉCNICA
              </h1>
              <p className="text-xs text-amber-400 font-mono mt-1">
                INSTALAÇÃO ELÉTRICA INDUSTRIAL EM BAIXA E MÉDIA TENSÃO
              </p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                CONFORMIDADE COM ABNT NBR 5410, ABNT NBR 14039 E NR-10
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-6 font-sans text-xs">
              {/* Identification Block */}
              <div className="bg-[#161A22] p-4 rounded border border-[#232833] grid grid-cols-2 gap-4 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block">CLIENTE / EMPRESA:</span>
                  <span className="text-slate-100 font-bold">{tenant.name}</span>
                  <span className="text-slate-400 block text-[10px]">{tenant.cnpj} - {tenant.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">RESPONSÁVEL TÉCNICO:</span>
                  <span className="text-slate-100 font-bold">{user.name}</span>
                  <span className="text-cyan-400 block text-[10px]">{user.creaNumber}</span>
                </div>
              </div>

              {/* Chapter 1 */}
              <div>
                <h2 className="text-sm font-bold text-amber-400 font-mono mb-2 uppercase">
                  1. OBJETIVO E ESCOPO DO FORNECIMENTO
                </h2>
                <p className="text-slate-300 leading-relaxed">
                  O presente memorial descritivo estabelece as diretrizes e critérios técnicos para o fornecimento,
                  montagem e comissionamento do Centro de Controle de Motores (CCM-01), destinado ao acionamento e proteção
                  dos compressores e sistemas de exaustão da planta de moagem. Todas as instalações foram projetadas com
                  base na norma <strong>ABNT NBR 5410 (Instalações Elétricas de Baixa Tensão)</strong>, respeitando as
                  prescrições de segurança estabelecidas pela <strong>NR-10 (Segurança em Instalações e Serviços em Eletricidade)</strong>.
                </p>
              </div>

              {/* Chapter 2 */}
              <div>
                <h2 className="text-sm font-bold text-amber-400 font-mono mb-2 uppercase">
                  2. CARACTERÍSTICAS DA REDE E FORNECIMENTO
                </h2>
                <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-300">
                  <li><strong>Tensão de Alimentação Primária:</strong> 13.800 V (Média Tensão NBR 14039).</li>
                  <li><strong>Tensão Secundária de Fornecimento:</strong> 380 V (Trifásico entre fases) / 220 V (Fase-Neutro), 60 Hz.</li>
                  <li><strong>Esquema de Aterramento Adotado:</strong> <strong>TN-S</strong> (Condutor neutro N e condutor de proteção PE estritamente separados em toda a extensão da instalação).</li>
                  <li><strong>Nível de Curto-Circuito Simétrico Adotado:</strong> 35 kA (1 segundo) nos barramentos principais.</li>
                </ul>
              </div>

              {/* Chapter 3 */}
              <div>
                <h2 className="text-sm font-bold text-amber-400 font-mono mb-2 uppercase">
                  3. CRITÉRIOS DE DIMENSIONAMENTO DE CONDUTORES E PROTEÇÃO (NBR 5410)
                </h2>
                <p className="text-slate-300 leading-relaxed">
                  O dimensionamento dos condutores elétricos obedece simultaneamente a quatro critérios fundamentais:
                </p>
                <ol className="list-decimal pl-5 flex flex-col gap-1.5 text-slate-300 mt-2">
                  <li>
                    <strong>Critério da Capacidade de Condução de Corrente (Iz):</strong> Fatores de agrupamento (FCA) e
                    temperatura ambiente (FCT = 40°C no interior dos leitos de cabos). Cabos Prysmian Afumex Plus 90°C não propagantes de chamas e livres de halogênio (baixa emissão de fumaça e gases tóxicos).
                  </li>
                  <li>
                    <strong>Critério da Queda de Tensão Máxima Admissível:</strong> Não superior a 4,0% para os circuitos
                    terminais alimentados diretamente pelo barramento do CCM-01, conforme tabela 42 da NBR 5410.
                  </li>
                  <li>
                    <strong>Proteção contra Sobrecargas e Curtos-Circuitos:</strong> Coordenação tipo 2 assegurada entre
                    disjuntores-motores WEG MPW, contatores tripolares CWB e relés térmicos bimetálicos classe 10.
                  </li>
                  <li>
                    <strong>Proteção contra Surtos Atmosféricos (DPS) e Correntes de Fuga (DR):</strong> Aplicação de DPS
                    Classe II (45 kA, 275 V) e dispositivo diferencial residual de 300 mA seletivo nos alimentadores gerais.
                  </li>
                </ol>
              </div>

              {/* Signatures */}
              <div className="pt-8 border-t border-[#232833] flex justify-between font-mono text-[10px] text-slate-400">
                <div>
                  <p className="text-slate-100 font-bold">{user.name}</p>
                  <p>{user.creaNumber}</p>
                  <p>Engenheiro Eletricista Responsável</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-100 font-bold">{tenant.name}</p>
                  <p>Aprovado para Execução</p>
                  <p>{new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
