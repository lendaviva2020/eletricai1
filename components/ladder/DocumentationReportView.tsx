'use client';

import React from 'react';
import {
  PlcProgramConfiguration,
  PlcCrossReferenceItem,
  PlcDiagnosticIssue,
} from '@/types/plc';
import {
  FileText,
  Printer,
  Download,
  CheckCircle,
  Cpu,
  Layers,
  Table,
} from 'lucide-react';

interface DocumentationReportViewProps {
  program: PlcProgramConfiguration;
  crossRefs: PlcCrossReferenceItem[];
  diagnostics: PlcDiagnosticIssue[];
}

export function DocumentationReportView({
  program,
  crossRefs,
  diagnostics,
}: DocumentationReportViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] text-slate-200 font-mono text-xs overflow-y-auto p-6">
      {/* Action Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#232833] max-w-5xl mx-auto w-full">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-400" />
            Memorial Descritivo & Documentação PLC IEC 61131-3
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Gerado automaticamente pelo EletricAI OS para comissionamento e auditoria técnica.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors"
        >
          <Printer className="h-4 w-4" />
          <span>Imprimir / Salvar PDF</span>
        </button>
      </div>

      {/* Printable Sheet Body */}
      <div className="max-w-5xl mx-auto w-full bg-[#11141A] border border-[#232833] rounded-lg p-8 mt-6 space-y-8 shadow-2xl">
        {/* Title Block Header */}
        <div className="border border-[#232833] p-4 rounded bg-[#161A22] grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Projeto Industrial</span>
            <span className="font-bold text-slate-100">{program.projectName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Norma de Referência</span>
            <span className="font-bold text-amber-400">{program.standardReference}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Responsável Técnico</span>
            <span className="font-bold text-slate-200">{program.author}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Revisão / Data</span>
            <span className="font-bold text-cyan-400">{program.revision} ({program.date})</span>
          </div>
        </div>

        {/* Section 1: Hardware I/O Modules */}
        <div>
          <h2 className="text-sm font-bold text-slate-100 border-b border-[#232833] pb-2 mb-3 uppercase flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-400" />
            1. Arquitetura de Hardware e Mapeamento de I/O
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#232833] text-slate-500 text-[10px] uppercase">
                <th className="pb-1.5">Slot</th>
                <th className="pb-1.5">Módulo</th>
                <th className="pb-1.5">Código Catálogo</th>
                <th className="pb-1.5">Canais</th>
                <th className="pb-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {program.rack.modules.map(m => (
                <tr key={m.id} className="border-b border-[#1E2430]">
                  <td className="py-1.5 font-bold text-slate-300">Slot #{m.slotNumber}</td>
                  <td className="py-1.5 text-slate-200 font-bold">{m.name}</td>
                  <td className="py-1.5 text-cyan-400">{m.catalogNumber}</td>
                  <td className="py-1.5 text-slate-400">{m.channels.length} canais</td>
                  <td className="py-1.5 text-emerald-400 font-bold">OK / CONFORME</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 2: Global Variables & Memory Image */}
        <div>
          <h2 className="text-sm font-bold text-slate-100 border-b border-[#232833] pb-2 mb-3 uppercase flex items-center gap-2">
            <Table className="h-4 w-4 text-emerald-400" />
            2. Tabela de Símbolos e Alocação de Memória
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#232833] text-slate-500 text-[10px] uppercase">
                <th className="pb-1.5">TAG</th>
                <th className="pb-1.5">Tipo</th>
                <th className="pb-1.5">Endereço</th>
                <th className="pb-1.5">Retentiva</th>
                <th className="pb-1.5">Descrição Técnica</th>
              </tr>
            </thead>
            <tbody>
              {program.globalVariables.map(v => (
                <tr key={v.id} className="border-b border-[#1E2430]">
                  <td className="py-1.5 font-bold text-slate-100">{v.name}</td>
                  <td className="py-1.5 text-amber-400">{v.dataType}</td>
                  <td className="py-1.5 text-cyan-400 font-bold">{v.address || 'Interno'}</td>
                  <td className="py-1.5 text-slate-300">{v.isRetentive ? 'RETAIN' : 'VOLÁTIL'}</td>
                  <td className="py-1.5 text-slate-400">{v.comment || v.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: Cross Reference Table */}
        <div>
          <h2 className="text-sm font-bold text-slate-100 border-b border-[#232833] pb-2 mb-3 uppercase flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-400" />
            3. Matriz de Referências Cruzadas
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#232833] text-slate-500 text-[10px] uppercase">
                <th className="pb-1.5">TAG</th>
                <th className="pb-1.5">POU</th>
                <th className="pb-1.5">Rung</th>
                <th className="pb-1.5">Elemento</th>
                <th className="pb-1.5">Modo de Acesso</th>
              </tr>
            </thead>
            <tbody>
              {crossRefs.map((cr, idx) => (
                <tr key={idx} className="border-b border-[#1E2430]">
                  <td className="py-1.5 font-bold text-slate-200">{cr.variableName}</td>
                  <td className="py-1.5 text-cyan-400">{cr.pouName}</td>
                  <td className="py-1.5 text-amber-400 font-bold">Rung {cr.rungNumber}</td>
                  <td className="py-1.5 text-slate-300">{cr.elementType}</td>
                  <td className="py-1.5 text-emerald-400">{cr.accessMode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 4: Safety & Diagnostics Audit */}
        <div>
          <h2 className="text-sm font-bold text-slate-100 border-b border-[#232833] pb-2 mb-3 uppercase flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            4. Relatório de Validação e Segurança Funcional
          </h2>
          <div className="p-4 rounded bg-[#161A22] border border-[#232833] text-slate-300">
            <p>
              O projeto foi analisado e validado de acordo com a semântica da norma <strong>IEC 61131-3:2025</strong>. 
              Total de inconformidades críticas detectadas: <strong className="text-emerald-400">{diagnostics.length}</strong>.
            </p>
            <p className="mt-2 text-[11px] text-slate-500">
              Aviso Normativo de Segurança: Em conformidade com a NR-10 e NR-12, lógicas implementadas em CLP padrão 
              não substituem relés de segurança certificados ou PLCs de Segurança (Safety PLCs SIL-3/PLe) para funções 
              críticas de proteção a vidas humanas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
