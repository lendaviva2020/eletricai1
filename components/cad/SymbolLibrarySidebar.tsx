'use client';

import React, { useState } from 'react';
import {
  Search,
  X,
  Zap,
  Shield,
  Sliders,
  Gauge,
  Activity,
  Layers,
  Plus,
  Radio,
  Cpu,
  Bookmark,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { SYMBOL_LIBRARY, SymbolDefinition } from '@/lib/symbol-library';
import { UNIVERSAL_SYMBOL_CATALOG, UniversalSymbolItem } from '@/lib/engineering/symbols/library-catalog';

interface SymbolLibrarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSymbol: (symbol: SymbolDefinition) => void;
}

export function SymbolLibrarySidebar({
  isOpen,
  onClose,
  onInsertSymbol,
}: SymbolLibrarySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStandard, setSelectedStandard] = useState<string>('ALL');
  const [activeCatalogTab, setActiveCatalogTab] = useState<'UNIVERSAL' | 'CLASSIC'>('UNIVERSAL');

  if (!isOpen) return null;

  const categories = [
    { id: 'ALL', label: 'Todos', icon: Layers },
    { id: 'FONTES', label: 'Fontes & MT/BT', icon: Zap },
    { id: 'PROTECAO', label: 'Proteção & Disjuntores', icon: Shield },
    { id: 'COMANDO', label: 'Manobra & Comando', icon: Sliders },
    { id: 'CARGAS', label: 'Cargas & Motores', icon: Activity },
    { id: 'CLP_AUTOMACAO', label: 'CLP & Automação', icon: Cpu },
    { id: 'MEDICAO', label: 'Medição & TCs', icon: Gauge },
    { id: 'ATERRAMENTO', label: 'Aterramento & SPDA', icon: Radio },
  ];

  // Map UniversalSymbolItem to SymbolDefinition for canvas insertion
  const handleInsertUniversal = (item: UniversalSymbolItem) => {
    const symbolDef: SymbolDefinition = {
      id: item.id,
      category: item.category === 'CLP_AUTOMACAO' ? 'COMUNICACAO' : (item.category as SymbolDefinition['category']),
      name: item.name,
      shortDescription: item.shortDescription,
      iecCode: item.standardReference,
      tagPrefix: item.tagPrefix,
      defaultCategory: item.defaultCategory,
      width: item.width,
      height: item.height,
      defaultVoltage: item.defaultSpecs.voltageV,
      defaultNominalCurrent: item.defaultSpecs.nominalCurrentA,
      defaultPowerKw: item.defaultSpecs.powerKw,
      defaultManufacturer: item.defaultSpecs.manufacturer,
      defaultPartNumber: item.defaultSpecs.model || item.defaultSpecs.partNumber,
      iconType: item.category.toLowerCase(),
      ports: item.terminals.map(t => ({
        id: t.id,
        type: t.direction === 'NORTH' ? 'in' : t.direction === 'SOUTH' ? 'out' : 'bus',
        x: t.relativeX,
        y: t.relativeY,
        label: t.label || t.terminalNumber,
      })),
    };

    onInsertSymbol(symbolDef);
  };

  const filteredUniversal = UNIVERSAL_SYMBOL_CATALOG.filter(sym => {
    const matchesCat = selectedCategory === 'ALL' || sym.category === selectedCategory;
    const matchesStandard = selectedStandard === 'ALL' || sym.standard === selectedStandard;
    const matchesSearch =
      !searchQuery.trim() ||
      sym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sym.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sym.standardReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sym.tagPrefix.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sym.defaultSpecs.manufacturer && sym.defaultSpecs.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sym.defaultSpecs.model && sym.defaultSpecs.model.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesStandard && matchesSearch;
  });

  const filteredClassic = SYMBOL_LIBRARY.filter(sym => {
    const matchesCat = selectedCategory === 'ALL' || sym.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      sym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sym.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sym.iecCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sym.tagPrefix.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-88 h-full bg-[#11141A] border-r border-[#232833] flex flex-col z-20 select-none shadow-2xl">
      {/* Header */}
      <div className="h-12 px-4 border-b border-[#232833] flex items-center justify-between bg-[#0D1017]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-mono font-bold text-xs text-slate-100 uppercase tracking-wider block">
              Biblioteca Universal CAD
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              ABNT NBR 5410 / IEC 60617 / ANSI
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[#1E2533] text-slate-400 hover:text-slate-200 transition-colors"
          title="Fechar Biblioteca"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Catalog Selector Tab */}
      <div className="grid grid-cols-2 p-1.5 bg-[#0A0D13] border-b border-[#232833] gap-1">
        <button
          onClick={() => setActiveCatalogTab('UNIVERSAL')}
          className={`py-1 text-center font-mono text-[11px] rounded transition-all flex items-center justify-center gap-1.5 ${
            activeCatalogTab === 'UNIVERSAL'
              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="h-3 w-3 text-amber-400" />
          Normatizada ({UNIVERSAL_SYMBOL_CATALOG.length})
        </button>
        <button
          onClick={() => setActiveCatalogTab('CLASSIC')}
          className={`py-1 text-center font-mono text-[11px] rounded transition-all flex items-center justify-center gap-1.5 ${
            activeCatalogTab === 'CLASSIC'
              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bookmark className="h-3 w-3 text-slate-400" />
          Catálogo Rápido ({SYMBOL_LIBRARY.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-[#232833] bg-[#0E1219]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por tag, potência, norma, fabricante..."
            className="w-full bg-[#161A22] border border-[#232833] focus:border-amber-500 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors"
          />
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="px-3 py-2 border-b border-[#232833] flex flex-wrap gap-1 bg-[#0D1017]">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
              selectedCategory === cat.id
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'bg-[#161A22] text-slate-400 hover:text-slate-200 border border-[#232833]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Symbol List Container */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider px-1">
          <span>
            {activeCatalogTab === 'UNIVERSAL' ? filteredUniversal.length : filteredClassic.length} símbolos disponíveis
          </span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Info className="h-3 w-3" /> Snap Magnético Ativo
          </span>
        </div>

        {/* Universal Catalog Render */}
        {activeCatalogTab === 'UNIVERSAL' && (
          filteredUniversal.map(sym => (
            <div
              key={sym.id}
              className="p-3 rounded-md bg-[#161A22] border border-[#232833] hover:border-amber-500/60 hover:bg-[#1A202C] transition-all flex flex-col gap-2 cursor-pointer group shadow-sm"
              onClick={() => handleInsertUniversal(sym)}
            >
              {/* Item Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors leading-tight">
                    {sym.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                    {sym.subcategory} • {sym.standardReference}
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold border border-amber-500/30 shrink-0">
                  {sym.tagPrefix}
                </span>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {sym.shortDescription}
              </p>

              {/* Technical Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
                {sym.defaultSpecs.voltageV > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {sym.defaultSpecs.voltageV}V
                  </span>
                )}
                {sym.defaultSpecs.nominalCurrentA > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    In: {sym.defaultSpecs.nominalCurrentA}A
                  </span>
                )}
                {sym.defaultSpecs.powerKw && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {sym.defaultSpecs.powerKw} kW
                  </span>
                )}
                {sym.defaultSpecs.manufacturer && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-700/40 text-slate-300 border border-slate-600/30">
                    {sym.defaultSpecs.manufacturer} {sym.defaultSpecs.model ? `• ${sym.defaultSpecs.model}` : ''}
                  </span>
                )}
              </div>

              {/* Terminals Footer */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-[#232833]">
                <span className="flex items-center gap-1 text-slate-400">
                  Bornes: {sym.terminals.map(t => t.terminalNumber).join(', ')}
                </span>
                <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <Plus className="h-3 w-3" /> Inserir
                </span>
              </div>
            </div>
          ))
        )}

        {/* Classic Catalog Render */}
        {activeCatalogTab === 'CLASSIC' && (
          filteredClassic.map(sym => (
            <div
              key={sym.id}
              className="p-3 rounded-md bg-[#161A22] border border-[#232833] hover:border-amber-500/60 hover:bg-[#1A202C] transition-all flex flex-col gap-2 cursor-pointer group shadow-sm"
              onClick={() => onInsertSymbol(sym)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                  {sym.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono border border-amber-500/30">
                  {sym.tagPrefix}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {sym.shortDescription}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1.5 border-t border-[#232833]">
                <span>{sym.iecCode}</span>
                <span className="text-amber-400 flex items-center gap-1 group-hover:underline">
                  <Plus className="h-3 w-3" /> Inserir no CAD
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
