'use client';

import React from 'react';
import {
  PlcProgramConfiguration,
  PlcVariable,
  IecDataType,
  VariableScope,
} from '@/types/plc';
import {
  Table,
  Plus,
  Trash2,
  Lock,
  Search,
  CheckCircle,
  Shield,
  Download,
} from 'lucide-react';

interface VariableManagerProps {
  program: PlcProgramConfiguration;
  onUpdateVariable: (updatedVar: PlcVariable) => void;
  onAddVariable: (newVar: PlcVariable) => void;
  onDeleteVariable: (varId: string) => void;
  onToggleForce: (varName: string, val: boolean | number) => void;
  onUnforceVariable: (varName: string) => void;
}

export function VariableManager({
  program,
  onUpdateVariable,
  onAddVariable,
  onDeleteVariable,
  onToggleForce,
  onUnforceVariable,
}: VariableManagerProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterScope, setFilterScope] = React.useState<string>('ALL');

  const filteredVars = program.globalVariables.filter(v => {
    const matchSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.address && v.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.comment && v.comment.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchScope = filterScope === 'ALL' || v.scope === filterScope;
    return matchSearch && matchScope;
  });

  const handleAddNew = () => {
    const newIdx = program.globalVariables.length + 1;
    const newVar: PlcVariable = {
      id: `var_user_${Date.now()}`,
      name: `NOVA_TAG_${newIdx}`,
      dataType: 'BOOL',
      address: `%M${newIdx}.0`,
      initialValue: false,
      currentValue: false,
      isForced: false,
      isRetentive: false,
      isConstant: false,
      scope: 'VAR_GLOBAL',
      comment: 'Nova variável adicionada pelo engenheiro',
    };
    onAddVariable(newVar);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#11141A] text-slate-200 font-mono text-xs overflow-hidden">
      {/* Action Toolbar */}
      <div className="h-10 px-4 bg-[#161A22] border-b border-[#232833] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nova Variável (TAG)</span>
          </button>

          <select
            value={filterScope}
            onChange={e => setFilterScope(e.target.value)}
            className="bg-[#0B0D10] border border-[#232833] rounded px-2 py-1 text-slate-300 outline-none"
          >
            <option value="ALL">Todos os Escopos</option>
            <option value="VAR_GLOBAL">VAR_GLOBAL</option>
            <option value="VAR_INPUT">VAR_INPUT</option>
            <option value="VAR_OUTPUT">VAR_OUTPUT</option>
          </select>
        </div>

        <div className="relative">
          <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Pesquisar TAG, %I, %Q..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-[#0B0D10] border border-[#232833] rounded pl-8 pr-3 py-1 text-slate-200 outline-none focus:border-amber-500 w-64"
          />
        </div>
      </div>

      {/* Variables Grid Table */}
      <div className="flex-1 overflow-auto p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#232833] text-slate-500 text-[10px] uppercase">
              <th className="pb-2">Nome (TAG)</th>
              <th className="pb-2">Tipo IEC 61131-3</th>
              <th className="pb-2">Endereço IEC</th>
              <th className="pb-2">Valor Inicial</th>
              <th className="pb-2">Valor Atual</th>
              <th className="pb-2">Retentiva (RETAIN)</th>
              <th className="pb-2">Status Forçado</th>
              <th className="pb-2">Comentário Técnico</th>
              <th className="pb-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredVars.map(v => (
              <tr key={v.id} className="border-b border-[#1E2430] hover:bg-[#161A22] text-[11px]">
                <td className="py-2">
                  <input
                    type="text"
                    value={v.name}
                    onChange={e => onUpdateVariable({ ...v, name: e.target.value })}
                    className="bg-transparent font-bold text-slate-100 outline-none hover:border-b hover:border-slate-500 w-full"
                  />
                </td>
                <td className="py-2">
                  <select
                    value={v.dataType}
                    onChange={e => onUpdateVariable({ ...v, dataType: e.target.value as IecDataType })}
                    className="bg-[#0B0D10] border border-[#232833] rounded px-1.5 py-0.5 text-amber-400 outline-none"
                  >
                    {(['BOOL', 'INT', 'DINT', 'UINT', 'REAL', 'TIME', 'STRING'] as IecDataType[]).map(dt => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2">
                  <input
                    type="text"
                    value={v.address || ''}
                    onChange={e => onUpdateVariable({ ...v, address: e.target.value })}
                    placeholder="ex: %I0.0"
                    className="bg-transparent text-cyan-400 outline-none hover:border-b hover:border-slate-500 w-24"
                  />
                </td>
                <td className="py-2 text-slate-400">{String(v.initialValue)}</td>
                <td className="py-2">
                  <span
                    className={`font-bold ${
                      typeof v.currentValue === 'boolean'
                        ? v.currentValue
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                        : 'text-amber-400'
                    }`}
                  >
                    {String(v.currentValue)} {v.unit || ''}
                  </span>
                </td>
                <td className="py-2">
                  <input
                    type="checkbox"
                    checked={v.isRetentive}
                    onChange={e => onUpdateVariable({ ...v, isRetentive: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500 cursor-pointer"
                  />
                </td>
                <td className="py-2">
                  {v.isForced ? (
                    <button
                      onClick={() => onUnforceVariable(v.name)}
                      className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-bold"
                    >
                      FORÇADA ({String(v.forcedValue)})
                    </button>
                  ) : (
                    <span className="text-slate-600 text-[10px]">Livre</span>
                  )}
                </td>
                <td className="py-2">
                  <input
                    type="text"
                    value={v.comment || ''}
                    onChange={e => onUpdateVariable({ ...v, comment: e.target.value })}
                    className="bg-transparent text-slate-400 outline-none hover:border-b hover:border-slate-500 w-full"
                  />
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => onDeleteVariable(v.id)}
                    className="p-1 hover:text-red-400 text-slate-500 rounded"
                    title="Excluir variável"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
