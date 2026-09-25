'use client';

import React, { useState } from 'react';
import {
  MousePointer,
  GitCommit,
  Plus,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Copy,
  Trash2,
  Undo2,
  Redo2,
  Grid,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Upload,
  Layers,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  FolderOpen,
  Save,
  ShieldCheck,
  Calculator,
} from 'lucide-react';
import { CadTool, ProjectPage } from '@/types/electrical';

interface EngineeringRibbonProps {
  activeTool: CadTool;
  setActiveTool: (tool: CadTool) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRotate: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onOpenLibrary: () => void;
  onAlign: (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  hasSelection: boolean;
  isLocked?: boolean;
  onToggleLock: () => void;
  saveStatus: 'saved' | 'saving' | 'dirty';
  onSaveManual: () => void;
  onExportDxf: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onExportCsv: () => void;
  onPrintPdf: () => void;
  pages: ProjectPage[];
  activePageNumber: number;
  onSelectPage: (num: number) => void;
  aiPrompt: string;
  setAiPrompt: (p: string) => void;
  onExecuteAiCommand: () => void;
  isAiLoading: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  zoomLevel: number;
}

export function EngineeringRibbon({
  activeTool,
  setActiveTool,
  snapToGrid,
  setSnapToGrid,
  gridSize,
  setGridSize,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRotate,
  onFlipH,
  onFlipV,
  onDuplicate,
  onDelete,
  onOpenLibrary,
  onAlign,
  hasSelection,
  isLocked,
  onToggleLock,
  saveStatus,
  onSaveManual,
  onExportDxf,
  onExportJson,
  onImportJson,
  onExportCsv,
  onPrintPdf,
  pages,
  activePageNumber,
  onSelectPage,
  aiPrompt,
  setAiPrompt,
  onExecuteAiCommand,
  isAiLoading,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  zoomLevel,
}: EngineeringRibbonProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMenu = (name: string) => {
    setActiveMenu(prev => (prev === name ? null : name));
  };

  return (
    <div className="flex flex-col bg-[#11141A] border-b border-[#232833] z-30 select-none text-slate-300 w-full min-w-0 max-w-full">
      {/* 1. Dropdown Menubar (Arquivo, Editar, Exibir, Inserir, Projeto, Ferramentas, Análise, Exportar) */}
      <div className="h-7 px-3 bg-[#0D1017] border-b border-[#1E2533] flex items-center justify-between text-[11px] font-mono overflow-x-auto no-scrollbar whitespace-nowrap min-w-0">
        <div className="flex items-center gap-1 shrink-0">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('file')}
              className={`px-2 py-0.5 rounded hover:bg-[#1E2533] transition-colors ${
                activeMenu === 'file' ? 'bg-[#1E2533] text-amber-400 font-bold' : ''
              }`}
            >
              Arquivo
            </button>
            {activeMenu === 'file' && (
              <div className="absolute top-6 left-0 w-48 bg-[#161A22] border border-[#2A313E] rounded shadow-2xl py-1 z-50 flex flex-col text-xs font-sans">
                <button
                  onClick={() => { onSaveManual(); setActiveMenu(null); }}
                  className="px-3 py-1.5 hover:bg-[#232833] flex items-center justify-between text-left"
                >
                  <span className="flex items-center gap-2"><Save className="h-3.5 w-3.5 text-amber-400" /> Salvar Projeto</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+S</span>
                </button>
                <button
                  onClick={() => { onImportJson(); setActiveMenu(null); }}
                  className="px-3 py-1.5 hover:bg-[#232833] flex items-center justify-between text-left"
                >
                  <span className="flex items-center gap-2"><FolderOpen className="h-3.5 w-3.5 text-cyan-400" /> Abrir / Importar JSON</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+O</span>
                </button>
                <div className="h-[1px] bg-[#232833] my-1" />
                <button
                  onClick={() => { onExportDxf(); setActiveMenu(null); }}
                  className="px-3 py-1.5 hover:bg-[#232833] flex items-center gap-2 text-left"
                >
                  <Download className="h-3.5 w-3.5 text-amber-400" /> Exportar CAD DXF
                </button>
                <button
                  onClick={() => { onExportJson(); setActiveMenu(null); }}
                  className="px-3 py-1.5 hover:bg-[#232833] flex items-center gap-2 text-left"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-400" /> Exportar Modelo JSON
                </button>
                <button
                  onClick={() => { onPrintPdf(); setActiveMenu(null); }}
                  className="px-3 py-1.5 hover:bg-[#232833] flex items-center justify-between text-left"
                >
                  <span className="flex items-center gap-2"><Printer className="h-3.5 w-3.5 text-blue-400" /> Imprimir Prancha PDF</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+P</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('edit')}
              className={`px-2 py-0.5 rounded hover:bg-[#1E2533] transition-colors ${
                activeMenu === 'edit' ? 'bg-[#1E2533] text-amber-400 font-bold' : ''
              }`}
            >
              Editar
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute top-6 left-0 w-44 bg-[#161A22] border border-[#2A313E] rounded shadow-2xl py-1 z-50 flex flex-col text-xs font-sans">
                <button
                  disabled={!canUndo}
                  onClick={() => { onUndo(); setActiveMenu(null); }}
                  className="px-3 py-1.5 hover:bg-[#232833] flex items-center justify-between text-left disabled:opacity-40"
                >
                  <span className="flex items-center gap-2"><Undo2 className="h-3.5 w-3.5" /> Desfazer</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+Z</span>
                </button>
                <button
                  disabled={!canRedo}
                  onClick={() => { onRedo(); setActiveMenu(null); }}
                  className="px-3 py-1.5 hover:bg-[#232833] flex items-center justify-between text-left disabled:opacity-40"
                >
                  <span className="flex items-center gap-2"><Redo2 className="h-3.5 w-3.5" /> Refazer</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+Y</span>
                </button>
                <div className="h-[1px] bg-[#232833] my-1" />
                <button
                  disabled={!hasSelection}
                  onClick={() => { onDuplicate(); setActiveMenu(null); }}
                  className="px-3 py-1.5 hover:bg-[#232833] flex items-center justify-between text-left disabled:opacity-40"
                >
                  <span className="flex items-center gap-2"><Copy className="h-3.5 w-3.5" /> Duplicar</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+D</span>
                </button>
                <button
                  disabled={!hasSelection}
                  onClick={() => { onDelete(); setActiveMenu(null); }}
                  className="px-3 py-1.5 hover:bg-[#232833] flex items-center justify-between text-left text-red-400 disabled:opacity-40"
                >
                  <span className="flex items-center gap-2"><Trash2 className="h-3.5 w-3.5" /> Excluir</span>
                  <span className="text-[10px] text-slate-500 font-mono">Del</span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('view')}
              className={`px-2 py-0.5 rounded hover:bg-[#1E2533] transition-colors ${
                activeMenu === 'view' ? 'bg-[#1E2533] text-amber-400 font-bold' : ''
              }`}
            >
              Exibir
            </button>
            {activeMenu === 'view' && (
              <div className="absolute top-6 left-0 w-44 bg-[#161A22] border border-[#2A313E] rounded shadow-2xl py-1 z-50 flex flex-col text-xs font-sans">
                <button onClick={() => { onZoomIn(); setActiveMenu(null); }} className="px-3 py-1.5 hover:bg-[#232833] flex items-center gap-2">
                  <ZoomIn className="h-3.5 w-3.5" /> Zoom In (+15%)
                </button>
                <button onClick={() => { onZoomOut(); setActiveMenu(null); }} className="px-3 py-1.5 hover:bg-[#232833] flex items-center gap-2">
                  <ZoomOut className="h-3.5 w-3.5" /> Zoom Out (-15%)
                </button>
                <button onClick={() => { onZoomFit(); setActiveMenu(null); }} className="px-3 py-1.5 hover:bg-[#232833] flex items-center gap-2">
                  <Maximize2 className="h-3.5 w-3.5" /> Ajustar à Prancha
                </button>
                <div className="h-[1px] bg-[#232833] my-1" />
                <button
                  onClick={() => { setSnapToGrid(!snapToGrid); setActiveMenu(null); }}
                  className="px-3 py-1.5 hover:bg-[#232833] flex items-center justify-between"
                >
                  <span>Snap to Grid</span>
                  <span className="text-amber-400 font-mono font-bold">{snapToGrid ? 'ATIVO' : 'OFF'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Inserir Menu */}
          <div className="relative">
            <button
              onClick={() => { onOpenLibrary(); setActiveMenu(null); }}
              className="px-2 py-0.5 rounded hover:bg-[#1E2533] text-amber-400 font-bold flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Inserir Símbolo
            </button>
          </div>

          {/* Análise & Documentação */}
          <button
            onClick={onExportCsv}
            className="px-2 py-0.5 rounded hover:bg-[#1E2533] text-slate-300 flex items-center gap-1"
            title="Exportar Lista de Cargas em CSV"
          >
            <FileSpreadsheet className="h-3 w-3 text-emerald-400" />
            Lista de Cargas
          </button>
        </div>

        {/* Right Status (Autosave & Active Page) */}
        <div className="flex items-center gap-3">
          {/* Page Selector Tabs */}
          <div className="flex items-center gap-1 bg-[#161A22] px-2 py-0.5 rounded border border-[#232833]">
            <span className="text-[10px] text-slate-500 uppercase">Folha:</span>
            {pages.map(page => (
              <button
                key={page.id}
                onClick={() => onSelectPage(page.pageNumber)}
                className={`px-1.5 py-0.2 rounded font-mono text-[10px] transition-colors ${
                  activePageNumber === page.pageNumber
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={page.title}
              >
                0{page.pageNumber}
              </button>
            ))}
          </div>

          {/* Autosave Indicator */}
          <div className="flex items-center gap-1 text-[10px] font-mono">
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Salvo
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-amber-400 animate-pulse">
                <Clock className="h-3 w-3" />
                Salvando...
              </span>
            )}
            {saveStatus === 'dirty' && (
              <span className="flex items-center gap-1 text-amber-400 cursor-pointer" onClick={onSaveManual} title="Clique para salvar agora">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Alterações pendentes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Tool Strip (Fast Actions, Tools, AI Bar, Grid, Transforms) */}
      <div className="h-11 px-3 flex items-center justify-between gap-2 sm:gap-3 overflow-x-auto no-scrollbar whitespace-nowrap min-w-0">
        {/* Drawing Tools Palette */}
        <div className="flex items-center gap-1 bg-[#161A22] border border-[#232833] p-1 rounded">
          <button
            onClick={() => setActiveTool('SELECT')}
            className={`p-1.5 rounded text-xs transition-colors ${
              activeTool === 'SELECT'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Selecionar elemento / Caixa de seleção múltipla (V)"
          >
            <MousePointer className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveTool('WIRE')}
            className={`p-1.5 rounded text-xs transition-colors ${
              activeTool === 'WIRE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desenhar Condutor / Roteamento ortogonal (W)"
          >
            <GitCommit className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenLibrary}
            className="p-1.5 rounded text-xs text-amber-400 hover:bg-[#1E2533] transition-colors"
            title="Inserir Equipamento da Biblioteca (I)"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Manipulation Tools (Rotate, Flip, Duplicate, Delete, Lock, Undo/Redo) */}
        <div className="flex items-center gap-1">
          <button
            disabled={!canUndo}
            onClick={onUndo}
            className="p-1.5 rounded hover:bg-[#1E2533] text-slate-400 hover:text-slate-200 disabled:opacity-30"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            disabled={!canRedo}
            onClick={onRedo}
            className="p-1.5 rounded hover:bg-[#1E2533] text-slate-400 hover:text-slate-200 disabled:opacity-30"
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-[#232833] mx-1" />

          <button
            disabled={!hasSelection}
            onClick={onRotate}
            className="p-1.5 rounded hover:bg-[#1E2533] text-slate-400 hover:text-slate-200 disabled:opacity-30"
            title="Rotacionar 90° (R)"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
          <button
            disabled={!hasSelection}
            onClick={onFlipH}
            className="p-1.5 rounded hover:bg-[#1E2533] text-slate-400 hover:text-slate-200 disabled:opacity-30"
            title="Espelhar Horizontal"
          >
            <FlipHorizontal className="h-3.5 w-3.5" />
          </button>
          <button
            disabled={!hasSelection}
            onClick={onFlipV}
            className="p-1.5 rounded hover:bg-[#1E2533] text-slate-400 hover:text-slate-200 disabled:opacity-30"
            title="Espelhar Vertical"
          >
            <FlipVertical className="h-3.5 w-3.5" />
          </button>
          <button
            disabled={!hasSelection}
            onClick={onDuplicate}
            className="p-1.5 rounded hover:bg-[#1E2533] text-slate-400 hover:text-slate-200 disabled:opacity-30"
            title="Duplicar (Ctrl+D)"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            disabled={!hasSelection}
            onClick={onToggleLock}
            className={`p-1.5 rounded hover:bg-[#1E2533] disabled:opacity-30 ${
              isLocked ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={isLocked ? 'Destravar elemento' : 'Travar posição do elemento'}
          >
            {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          </button>
          <button
            disabled={!hasSelection}
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400 disabled:opacity-30"
            title="Excluir selecionado (Del)"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Natural Language AI Assistant Prompt Input directly in the Ribbon */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative flex items-center">
            <input
              type="text"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onExecuteAiCommand()}
              placeholder="Ex: 'Adicionar disjuntor 40A e motor 15kW com soft-starter' ou 'Verificar erros'..."
              className="w-full bg-[#161A22] border border-[#2A313E] focus:border-amber-500 rounded pl-7 pr-16 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors"
            />
            <Sparkles className="absolute left-2 h-3.5 w-3.5 text-amber-400 pointer-events-none" />
            <button
              onClick={onExecuteAiCommand}
              disabled={isAiLoading || !aiPrompt.trim()}
              className="absolute right-1 px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-[#0B0D10] text-[10px] font-bold font-mono transition-colors disabled:opacity-40"
            >
              {isAiLoading ? 'Processando...' : 'EXECUTAR'}
            </button>
          </div>
        </div>

        {/* Grid and Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Snap Grid Toggle */}
          <div className="flex items-center gap-1 bg-[#161A22] px-2 py-1 rounded border border-[#232833] text-xs font-mono">
            <button
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`flex items-center gap-1 ${snapToGrid ? 'text-amber-400 font-bold' : 'text-slate-500'}`}
              title="Ativar/desativar snap magnético à grade"
            >
              <Grid className="h-3 w-3" />
              <span>SNAP {snapToGrid ? 'ON' : 'OFF'}</span>
            </button>
            <span className="text-slate-600">|</span>
            <select
              value={gridSize}
              onChange={e => setGridSize(Number(e.target.value))}
              className="bg-transparent text-slate-300 outline-none text-[11px] cursor-pointer"
            >
              <option value={5} className="bg-[#161A22]">5 mm</option>
              <option value={10} className="bg-[#161A22]">10 mm</option>
              <option value={12} className="bg-[#161A22]">12 mm</option>
              <option value={20} className="bg-[#161A22]">20 mm</option>
            </select>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-[#161A22] px-1 py-0.5 rounded border border-[#232833]">
            <button onClick={onZoomOut} className="p-1 rounded hover:bg-[#1E2533] text-slate-400 hover:text-white" title="Zoom Out">
              <ZoomOut className="h-3 w-3" />
            </button>
            <span className="text-[11px] font-mono text-slate-300 w-10 text-center font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button onClick={onZoomIn} className="p-1 rounded hover:bg-[#1E2533] text-slate-400 hover:text-white" title="Zoom In">
              <ZoomIn className="h-3 w-3" />
            </button>
            <button onClick={onZoomFit} className="p-1 rounded hover:bg-[#1E2533] text-slate-400 hover:text-white" title="Ajustar à Tela">
              <Maximize2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
