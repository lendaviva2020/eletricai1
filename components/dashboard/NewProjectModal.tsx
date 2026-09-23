'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { IndustrialProject, ProjectType } from '@/types/dashboard';
import {
  FolderPlus,
  X,
  Zap,
  Check,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: IndustrialProject) => void;
}

export function NewProjectModal({ isOpen, onClose, onAddProject }: NewProjectModalProps) {
  const { user, setActiveTab } = useWorkspace();

  const [name, setName] = useState('');
  const [code, setCode] = useState(() => 'EAI-PRJ-2024-00' + Math.floor(10 + Math.random() * 90));
  const [type, setType] = useState<ProjectType>('CCM_BT');
  const [normativeStandard, setNormativeStandard] = useState<IndustrialProject['normativeStandard']>('ABNT NBR 5410');
  const [nominalVoltage, setNominalVoltage] = useState('380V / 220V - 60 Hz');
  const [targetTab, setTargetTab] = useState<IndustrialProject['targetTab']>('unifilar');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let typeLabel = 'Centro de Controle de Motores (BT)';
    if (type === 'SUBESTACAO_MT') typeLabel = 'Subestação Abrigada MT/BT';
    else if (type === 'AUTOMACAO_CLP') typeLabel = 'Automação & CLP IEC 61131-3';
    else if (type === 'QGBT_DISTRIBUICAO') typeLabel = 'Quadro Geral de Baixa Tensão';
    else if (type === 'SOLAR_FOTOVOLTAICO') typeLabel = 'Geração Solar Fotovoltaica';

    const newProject: IndustrialProject = {
      id: `proj_${Date.now()}`,
      name: name.trim(),
      code: code.trim(),
      type,
      typeLabel,
      status: 'EM_EXECUCAO',
      progressPercent: 15,
      lastUpdated: 'Agora',
      lastUpdatedTimestamp: Date.now(),
      updatedBy: {
        name: user.name,
        role: user.role,
        creaNumber: user.creaNumber,
      },
      nominalVoltage,
      normativeStandard,
      targetTab,
      description: description.trim() || 'Projeto elétrico industrial em elaboração.',
    };

    onAddProject(newProject);
    onClose();
    setActiveTab(targetTab);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161A22] border border-[#232833] w-full max-w-xl rounded-2xl shadow-2xl p-6 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#232833]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <FolderPlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Criar Novo Projeto Elétrico Industrial
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                CAD Unifilar, Lógica CLP e parametrização ABNT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#12161F]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">
              Nome do Projeto / Painel
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Subestação SE-03 15kV Expansão Grãos"
              className="w-full px-3 py-2 rounded-lg bg-[#0D1017] border border-[#232833] text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Código do Projeto
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0D1017] border border-[#232833] text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Tipo de Instalação
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as ProjectType)}
                className="w-full px-2.5 py-2 rounded-lg bg-[#0D1017] border border-[#232833] text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="CCM_BT">Centro de Controle de Motores (CCM-BT)</option>
                <option value="SUBESTACAO_MT">Subestação Abrigada (MT - 13.8kV)</option>
                <option value="AUTOMACAO_CLP">Automação & CLP (IEC 61131-3)</option>
                <option value="QGBT_DISTRIBUICAO">Quadro Geral de Baixa Tensão (QGBT)</option>
                <option value="SOLAR_FOTOVOLTAICO">Usinas Solares / Inversores</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Norma Base
              </label>
              <select
                value={normativeStandard}
                onChange={e => setNormativeStandard(e.target.value as IndustrialProject['normativeStandard'])}
                className="w-full px-2 py-2 rounded-lg bg-[#0D1017] border border-[#232833] text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="ABNT NBR 5410">ABNT NBR 5410 (BT)</option>
                <option value="ABNT NBR 14039">ABNT NBR 14039 (MT)</option>
                <option value="IEC 60364">IEC 60364 (Global)</option>
                <option value="NR-10">NR-10 Segurança</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Tensão Nominal
              </label>
              <input
                type="text"
                value={nominalVoltage}
                onChange={e => setNominalVoltage(e.target.value)}
                placeholder="Ex: 380V / 220V - 60 Hz"
                className="w-full px-2.5 py-2 rounded-lg bg-[#0D1017] border border-[#232833] text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Módulo Inicial
              </label>
              <select
                value={targetTab}
                onChange={e => setTargetTab(e.target.value as IndustrialProject['targetTab'])}
                className="w-full px-2 py-2 rounded-lg bg-[#0D1017] border border-[#232833] text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="unifilar">CAD Unifilar</option>
                <option value="ladder">Editor Ladder CLP</option>
                <option value="scada">Supervisório SCADA</option>
                <option value="digital_twin">Digital Twin 3D</option>
                <option value="bom">Relatórios BOM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">
              Descrição do Painel / Observações Técnicas
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Alimentador principal com disjuntor caixa moldada 400A e barramento de cobre estanhado."
              className="w-full px-3 py-2 rounded-lg bg-[#0D1017] border border-[#232833] text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-[#232833] flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Responsável: <strong className="text-slate-200">{user.name}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#0D1017] border border-[#232833] text-slate-300 hover:text-white text-xs font-mono transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0B0D10] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Check className="h-4 w-4" />
                <span>Criar & Abrir Workspace</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
