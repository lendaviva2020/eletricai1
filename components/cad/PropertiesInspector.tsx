'use client';

import React from 'react';
import {
  X,
  Sliders,
  Shield,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Copy,
  Trash2,
  Lock,
  Unlock,
} from 'lucide-react';
import { ElectricalComponent } from '@/types/electrical';
import { calcDetailedVoltageDrop, verifyOverloadCoordination } from '@/lib/electrical-calc';

interface PropertiesInspectorProps {
  component: ElectricalComponent | null;
  onUpdateComponent: (updated: ElectricalComponent) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (comp: ElectricalComponent) => void;
  onClose: () => void;
  onToggleBreaker?: (tag: string) => void;
}

export function PropertiesInspector({
  component,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onClose,
  onToggleBreaker,
}: PropertiesInspectorProps) {
  if (!component) return null;

  const handleChange = <K extends keyof ElectricalComponent>(field: K, value: ElectricalComponent[K]) => {
    onUpdateComponent({
      ...component,
      [field]: value,
    });
  };

  // Cálculos dinâmicos em tempo real para o inspetor
  const vDropResult = component.operationalCurrent && component.cableLength && component.cableCrossSection
    ? calcDetailedVoltageDrop(
        component.operationalCurrent,
        component.cableLength,
        component.cableCrossSection,
        component.voltage || 380,
        component.powerFactor || 0.85
      )
    : null;

  return (
    <div className="w-84 h-full bg-[#11141A] border-l border-[#232833] flex flex-col z-20 select-none shadow-2xl overflow-hidden text-slate-200">
      {/* Header */}
      <div className="h-12 px-4 border-b border-[#232833] flex items-center justify-between bg-[#161A22]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sliders className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-mono font-bold text-xs text-slate-100 uppercase tracking-wider block">
              Inspetor de Propriedades
            </span>
            <span className="text-[10px] text-amber-400 font-mono">{component.tag}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[#232833] text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content Form Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-xs">
        {/* 1. Identificação Básica */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold border-b border-[#232833] pb-1">
            Identificação & Tag
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">TAG Normativo</label>
              <input
                type="text"
                value={component.tag}
                onChange={e => handleChange('tag', e.target.value)}
                className="w-full bg-[#161A22] border border-[#232833] focus:border-amber-500 rounded px-2.5 py-1 font-mono text-amber-400 font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Código Fabricante</label>
              <input
                type="text"
                value={component.partNumber || ''}
                onChange={e => handleChange('partNumber', e.target.value)}
                placeholder="Ex: DWA160-63"
                className="w-full bg-[#161A22] border border-[#232833] focus:border-amber-500 rounded px-2.5 py-1 font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Nome / Descrição do Equipamento</label>
            <input
              type="text"
              value={component.name}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full bg-[#161A22] border border-[#232833] focus:border-amber-500 rounded px-2.5 py-1 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Fabricante</label>
              <input
                type="text"
                value={component.manufacturer || 'WEG'}
                onChange={e => handleChange('manufacturer', e.target.value)}
                className="w-full bg-[#161A22] border border-[#232833] focus:border-amber-500 rounded px-2.5 py-1 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Grau de Proteção</label>
              <input
                type="text"
                value={component.ipRating || 'IP55'}
                onChange={e => handleChange('ipRating', e.target.value)}
                className="w-full bg-[#161A22] border border-[#232833] focus:border-amber-500 rounded px-2.5 py-1 font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Grandezas Elétricas Nominais */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold border-b border-[#232833] pb-1">
            Grandezas Elétricas Nominais
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Tensão Nominal (V)</label>
              <input
                type="number"
                value={component.voltage}
                onChange={e => handleChange('voltage', Number(e.target.value))}
                className="w-full bg-[#161A22] border border-[#232833] focus:border-amber-500 rounded px-2.5 py-1 font-mono outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Corrente Nominal In (A)</label>
              <input
                type="number"
                value={component.nominalCurrent}
                onChange={e => handleChange('nominalCurrent', Number(e.target.value))}
                className="w-full bg-[#161A22] border border-[#232833] focus:border-amber-500 rounded px-2.5 py-1 font-mono text-amber-300 font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Corrente Operação Ib (A)</label>
              <input
                type="number"
                value={component.operationalCurrent || component.nominalCurrent}
                onChange={e => handleChange('operationalCurrent', Number(e.target.value))}
                className="w-full bg-[#161A22] border border-[#232833] focus:border-amber-500 rounded px-2.5 py-1 font-mono outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Poder de Interrupção Icu (kA)</label>
              <input
                type="number"
                value={component.breakingCapacity || 25}
                onChange={e => handleChange('breakingCapacity', Number(e.target.value))}
                className="w-full bg-[#161A22] border border-[#232833] focus:border-amber-500 rounded px-2.5 py-1 font-mono outline-none"
              />
            </div>
          </div>

          {/* Motor Specific Details */}
          {component.category === 'MOTOR_3P' && (
            <div className="p-2.5 rounded bg-[#161A22] border border-[#232833] flex flex-col gap-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold">Parâmetros de Motor Trifásico</span>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[9px] text-slate-400 block">Potência (kW)</label>
                  <input
                    type="number"
                    value={component.power || 22}
                    onChange={e => handleChange('power', Number(e.target.value))}
                    className="w-full bg-[#0D1017] border border-[#232833] rounded px-1.5 py-1 font-mono text-[11px] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block">Potência (CV)</label>
                  <input
                    type="number"
                    value={component.powerHp || 30}
                    onChange={e => handleChange('powerHp', Number(e.target.value))}
                    className="w-full bg-[#0D1017] border border-[#232833] rounded px-1.5 py-1 font-mono text-[11px] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block">Cos φ</label>
                  <input
                    type="number"
                    step="0.01"
                    value={component.powerFactor || 0.86}
                    onChange={e => handleChange('powerFactor', Number(e.target.value))}
                    className="w-full bg-[#0D1017] border border-[#232833] rounded px-1.5 py-1 font-mono text-[11px] outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Condutor & Queda de Tensão NBR 5410 */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold border-b border-[#232833] pb-1">
            Dimensionamento de Condutores NBR 5410
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Seção do Cabo (mm²)</label>
              <select
                value={component.cableCrossSection || 16}
                onChange={e => handleChange('cableCrossSection', Number(e.target.value))}
                className="w-full bg-[#161A22] border border-[#232833] focus:border-amber-500 rounded px-2 py-1 font-mono outline-none"
              >
                {[2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240].map(s => (
                  <option key={s} value={s}>{s} mm²</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Comprimento (m)</label>
              <input
                type="number"
                value={component.cableLength || 30}
                onChange={e => handleChange('cableLength', Number(e.target.value))}
                className="w-full bg-[#161A22] border border-[#232833] focus:border-amber-500 rounded px-2.5 py-1 font-mono outline-none"
              />
            </div>
          </div>

          {/* Resultado de Queda de Tensão Calculado */}
          {vDropResult && (
            <div className={`p-2.5 rounded border ${
              vDropResult.value.isCompliant
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-red-950/20 border-red-500/30 text-red-300'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                <span>Queda de Tensão ΔV%:</span>
                <span>{vDropResult.value.dropPercent.toFixed(2)}%</span>
              </div>
              <p className="text-[10px] mt-1 opacity-90">
                {vDropResult.value.isCompliant
                  ? '✓ Conforme NBR 5410 item 6.2.7 (Limite máximo: 4.0%)'
                  : '⚠ Alerta: Excede o limite máximo permitido de 4.0% da NBR 5410.'}
              </p>
            </div>
          )}
        </div>

        {/* 4. Estado Operacional & Interrupção */}
        <div className="p-3 rounded bg-[#161A22] border border-[#232833] flex flex-col gap-2">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Estado Operacional</span>
          <div className="flex items-center justify-between">
            <span className="text-xs">Energizado:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              component.isEnergized ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}>
              {component.isEnergized ? 'SIM (380V ATIVO)' : 'NÃO (DESLIGADO)'}
            </span>
          </div>

          {onToggleBreaker && (component.category === 'MAIN_BREAKER' || component.category === 'MOTOR_BREAKER') && (
            <button
              onClick={() => onToggleBreaker(component.tag)}
              className="mt-1 w-full py-1.5 rounded bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition-colors"
            >
              {component.isEnergized ? 'DISPARAR / ABRIR DISJUNTOR' : 'REARMAR / FECHAR DISJUNTOR'}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-2 flex items-center gap-2 border-t border-[#232833]">
          <button
            onClick={() => onDuplicateComponent(component)}
            className="flex-1 py-1.5 rounded bg-[#161A22] border border-[#232833] hover:bg-[#232833] text-slate-300 flex items-center justify-center gap-1.5 font-mono text-xs transition-colors"
          >
            <Copy className="h-3.5 w-3.5" /> Duplicar
          </button>
          <button
            onClick={() => onDeleteComponent(component.id)}
            className="py-1.5 px-3 rounded bg-red-950/20 border border-red-500/40 hover:bg-red-950/40 text-red-400 flex items-center justify-center gap-1.5 font-mono text-xs transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
