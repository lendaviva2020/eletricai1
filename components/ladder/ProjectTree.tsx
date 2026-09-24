'use client';

import React from 'react';
import {
  PlcProgramConfiguration,
  PlcPou,
  PlcVariable,
  PlcLadderRung,
} from '@/types/plc';
import {
  FolderTree,
  FileCode2,
  Cpu,
  Layers,
  Table,
  Plus,
  Trash2,
  Edit2,
  Copy,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';

interface ProjectTreeProps {
  program: PlcProgramConfiguration;
  activePouId: string;
  onSelectPou: (pouId: string) => void;
  onAddPou: () => void;
  onSelectRung: (rungNumber: number) => void;
  onOpenVariablesTab: () => void;
  onOpenIoTab: () => void;
  onOpenInterlocksTab: () => void;
}

export function ProjectTree({
  program,
  activePouId,
  onSelectPou,
  onAddPou,
  onSelectRung,
  onOpenVariablesTab,
  onOpenIoTab,
  onOpenInterlocksTab,
}: ProjectTreeProps) {
  const [pousExpanded, setPousExpanded] = React.useState(true);
  const [ioExpanded, setIoExpanded] = React.useState(true);
  const [varsExpanded, setVarsExpanded] = React.useState(true);

  return (
    <div className="w-64 bg-[#11141A] border-r border-[#232833] flex flex-col h-full text-xs font-mono select-none overflow-y-auto">
      {/* Title */}
      <div className="p-3 border-b border-[#232833] bg-[#161A22] flex items-center justify-between">
        <span className="font-bold text-slate-100 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
          <FolderTree className="h-3.5 w-3.5 text-amber-400" />
          Árvore do Projeto
        </span>
        <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
          PLC
        </span>
      </div>

      <div className="p-2 space-y-2">
        {/* Project Name & Specs */}
        <div className="p-2 rounded bg-[#161A22] border border-[#232833]">
          <div className="text-slate-200 font-bold truncate text-[11px]">
            {program.projectName}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
            <span>{program.standardReference}</span>
            <span className="text-amber-400">{program.revision}</span>
          </div>
        </div>

        {/* POUs (Program Organization Units) */}
        <div>
          <div
            onClick={() => setPousExpanded(!pousExpanded)}
            className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-[#1E2430] cursor-pointer text-slate-300 font-bold"
          >
            <div className="flex items-center gap-1.5">
              {pousExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <FileCode2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Programas (POUs)</span>
            </div>
            <button
              onClick={e => {
                e.stopPropagation();
                onAddPou();
              }}
              className="p-0.5 hover:text-amber-400 text-slate-400"
              title="Criar nova POU IEC 61131-3"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {pousExpanded && (
            <div className="pl-4 space-y-1 mt-1">
              {program.pous.map(pou => {
                const isActive = pou.id === activePouId;
                return (
                  <div key={pou.id} className="space-y-0.5">
                    <button
                      onClick={() => onSelectPou(pou.id)}
                      className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold'
                          : 'hover:bg-[#1E2430] text-slate-300'
                      }`}
                    >
                      <span className="truncate">{pou.name}</span>
                      <span className="text-[9px] px-1 py-0.2 bg-[#0B0D10] text-cyan-400 rounded">
                        {pou.language}
                      </span>
                    </button>

                    {isActive && (
                      <div className="pl-3 space-y-0.5 border-l border-amber-500/30 ml-2">
                        {pou.rungs.map(rung => (
                          <button
                            key={rung.id}
                            onClick={() => onSelectRung(rung.rungNumber)}
                            className="w-full text-left py-0.5 px-1.5 text-[10px] text-slate-400 hover:text-slate-200 hover:bg-[#161A22] rounded truncate flex items-center gap-1"
                          >
                            <span className="text-amber-400 font-mono">R{rung.rungNumber}:</span>
                            <span className="truncate">{rung.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Variables & Tags Table */}
        <div>
          <button
            onClick={onOpenVariablesTab}
            className="w-full text-left py-1.5 px-2 rounded hover:bg-[#1E2430] text-slate-300 font-bold flex items-center justify-between"
          >
            <div className="flex items-center gap-1.5">
              <Table className="h-3.5 w-3.5 text-emerald-400" />
              <span>Tabela de Variáveis</span>
            </div>
            <span className="text-[10px] text-slate-500 bg-[#0B0D10] px-1.5 py-0.5 rounded">
              {program.globalVariables.length}
            </span>
          </button>
        </div>

        {/* I/O Hardware Configuration */}
        <div>
          <button
            onClick={onOpenIoTab}
            className="w-full text-left py-1.5 px-2 rounded hover:bg-[#1E2430] text-slate-300 font-bold flex items-center justify-between"
          >
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-blue-400" />
              <span>Configuração I/O (Rack)</span>
            </div>
            <span className="text-[10px] text-slate-500 bg-[#0B0D10] px-1.5 py-0.5 rounded">
              {program.rack.modules.length} slots
            </span>
          </button>
        </div>

        {/* Interlocks & Safety Rules */}
        <div>
          <button
            onClick={onOpenInterlocksTab}
            className="w-full text-left py-1.5 px-2 rounded hover:bg-[#1E2430] text-slate-300 font-bold flex items-center justify-between"
          >
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
              <span>Intertravamentos & Alarmes</span>
            </div>
            <span className="text-[10px] text-slate-500 bg-[#0B0D10] px-1.5 py-0.5 rounded">
              {program.interlocks.length}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
