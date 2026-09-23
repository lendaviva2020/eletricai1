'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace, WorkspaceTab } from '@/components/shared/WorkspaceContext';
import {
  ChevronDown,
  LayoutGrid,
  Network,
  Binary,
  Tv,
  Boxes,
  FileSpreadsheet,
  LayoutDashboard,
  Split,
  Layers,
  Cpu,
  Bot,
  Zap,
  Check,
} from 'lucide-react';

interface ScreenNavigationDropdownProps {
  buttonClassName?: string;
  showIconOnly?: boolean;
}

export function ScreenNavigationDropdown({
  buttonClassName = '',
  showIconOnly = false,
}: ScreenNavigationDropdownProps) {
  const {
    activeTab,
    setActiveTab,
    isViewingLanding,
    setIsViewingLanding,
  } = useWorkspace();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleNavigate = (action: 'landing' | WorkspaceTab) => {
    if (action === 'landing') {
      setIsViewingLanding(true);
    } else {
      setIsViewingLanding(false);
      setActiveTab(action);
    }
    setIsOpen(false);
  };

  const currentLabel = isViewingLanding
    ? 'Landing Page'
    : {
        dashboard: 'Hub de Comando',
        unifilar: 'CAD Unifilar',
        multifilar: 'Multifilar',
        ladder: 'Editor Ladder CLP',
        fbd: 'FBD Blocos',
        plc: 'Rack CLP & I/O',
        scada: 'Supervisório SCADA',
        digital_twin: 'Digital Twin 3D',
        bom: 'Relatórios BOM',
        ai_copilot: 'IA Copilot',
      }[activeTab];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161A22] border border-[#232833] hover:border-amber-500/60 hover:text-white text-xs font-mono text-slate-200 transition-all cursor-pointer shadow-sm group ${
          isOpen ? 'border-amber-500 text-amber-400 bg-[#1E2430]' : ''
        } ${buttonClassName}`}
        title="Alternar instantaneamente entre os módulos da plataforma VOLTAI"
        aria-expanded={isOpen}
      >
        <LayoutGrid className="h-3.5 w-3.5 text-amber-400 group-hover:rotate-90 transition-transform duration-200" />
        {!showIconOnly && (
          <>
            <span className="font-semibold tracking-tight">Navegar Telas</span>
            <span className="text-[10px] text-slate-400 hidden lg:inline font-mono">
              ({currentLabel})
            </span>
            <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
          </>
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-[#161A22] border border-[#232833] rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.85)] py-2 z-50 animate-fade-in backdrop-blur-md">
          {/* Header */}
          <div className="px-3.5 py-1.5 border-b border-[#232833] flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
              Módulos do Sistema VOLTAI
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Shared Tag Engine
            </span>
          </div>

          <div className="max-h-[75vh] overflow-y-auto p-1.5 space-y-1">
            {/* 1. Portal & Hub */}
            <div className="px-2 pt-1 pb-0.5 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              Portal & Gestão
            </div>

            {/* Landing Page */}
            <button
              type="button"
              onClick={() => handleNavigate('landing')}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                isViewingLanding
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#1E2430]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <span className="block font-semibold">Landing Page Institucional</span>
                  <span className="text-[10px] text-slate-400">Página inicial, apresentação e planos</span>
                </div>
              </div>
              {isViewingLanding && <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
            </button>

            {/* Hub de Comando / Dashboard */}
            <button
              type="button"
              onClick={() => handleNavigate('dashboard')}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                !isViewingLanding && activeTab === 'dashboard'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#1E2430]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <span className="block font-semibold">Hub de Comando da Planta</span>
                  <span className="text-[10px] text-slate-400">KPIs de energia, status de gateways e tags</span>
                </div>
              </div>
              {!isViewingLanding && activeTab === 'dashboard' && (
                <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              )}
            </button>

            {/* 2. Engenharia Elétrica & CAD */}
            <div className="px-2 pt-2 pb-0.5 text-[9px] font-mono text-slate-500 uppercase tracking-wider border-t border-[#232833] mt-1">
              Engenharia Elétrica & Diagramas
            </div>

            {/* CAD Unifilar */}
            <button
              type="button"
              onClick={() => handleNavigate('unifilar')}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                !isViewingLanding && activeTab === 'unifilar'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#1E2430]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Network className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <span className="block font-semibold">Workspace CAD Unifilar</span>
                  <span className="text-[10px] text-slate-400">Diagrama de potência, disjuntores e cargas</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-amber-400 font-mono">NBR 5410</span>
                {!isViewingLanding && activeTab === 'unifilar' && (
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                )}
              </div>
            </button>

            {/* Multifilar */}
            <button
              type="button"
              onClick={() => handleNavigate('multifilar')}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                !isViewingLanding && activeTab === 'multifilar'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#1E2430]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Split className="h-4 w-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="block font-semibold">Multifilar 1-Clique</span>
                  <span className="text-[10px] text-slate-400">Fases L1/L2/L3, Neutro e PE expandidos</span>
                </div>
              </div>
              {!isViewingLanding && activeTab === 'multifilar' && (
                <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              )}
            </button>

            {/* Digital Twin 3D */}
            <button
              type="button"
              onClick={() => handleNavigate('digital_twin')}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                !isViewingLanding && activeTab === 'digital_twin'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#1E2430]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Boxes className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="block font-semibold">Digital Twin 3D</span>
                  <span className="text-[10px] text-slate-400">Maquete WebGL de cubículos CCM e motor</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-emerald-400 font-mono">3D WebGL</span>
                {!isViewingLanding && activeTab === 'digital_twin' && (
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                )}
              </div>
            </button>

            {/* BOM & Memorial */}
            <button
              type="button"
              onClick={() => handleNavigate('bom')}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                !isViewingLanding && activeTab === 'bom'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#1E2430]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="h-4 w-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="block font-semibold">Relatórios BOM & Memorial</span>
                  <span className="text-[10px] text-slate-400">Lista de materiais, custos R$ e memorial ABNT</span>
                </div>
              </div>
              {!isViewingLanding && activeTab === 'bom' && (
                <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              )}
            </button>

            {/* 3. Automação Industrial & CLP */}
            <div className="px-2 pt-2 pb-0.5 text-[9px] font-mono text-slate-500 uppercase tracking-wider border-t border-[#232833] mt-1">
              Automação & CLP IEC 61131-3
            </div>

            {/* Ladder */}
            <button
              type="button"
              onClick={() => handleNavigate('ladder')}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                !isViewingLanding && activeTab === 'ladder'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#1E2430]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Binary className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="block font-semibold">Editor Ladder CLP</span>
                  <span className="text-[10px] text-slate-400">Rungs, contatos NA/NF, bobinas e timers TON</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-emerald-400 font-mono">IEC 61131</span>
                {!isViewingLanding && activeTab === 'ladder' && (
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                )}
              </div>
            </button>

            {/* SCADA */}
            <button
              type="button"
              onClick={() => handleNavigate('scada')}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                !isViewingLanding && activeTab === 'scada'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#1E2430]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tv className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <span className="block font-semibold">Supervisório SCADA</span>
                  <span className="text-[10px] text-slate-400">Mímico em tempo real e Web Worker seguro</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-amber-400 font-mono">Modbus TCP</span>
                {!isViewingLanding && activeTab === 'scada' && (
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                )}
              </div>
            </button>

            {/* IA Copilot */}
            <button
              type="button"
              onClick={() => handleNavigate('ai_copilot')}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                !isViewingLanding && activeTab === 'ai_copilot'
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#1E2430]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bot className="h-4 w-4 text-purple-400 shrink-0" />
                <div>
                  <span className="block font-semibold">IA Copilot & Patch Diff</span>
                  <span className="text-[10px] text-slate-400">Auditoria ABNT e propostas de engenharia</span>
                </div>
              </div>
              {!isViewingLanding && activeTab === 'ai_copilot' && (
                <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
