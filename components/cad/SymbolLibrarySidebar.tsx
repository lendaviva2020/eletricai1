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
  HelpCircle,
  Plus,
  Radio,
} from 'lucide-react';
import { SYMBOL_LIBRARY, SymbolDefinition } from '@/lib/symbol-library';

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

  if (!isOpen) return null;

  const categories = [
    { id: 'ALL', label: 'Todos os Símbolos', count: SYMBOL_LIBRARY.length },
    { id: 'FONTES', label: 'Fontes & Alimentação', icon: Zap },
    { id: 'PROTECAO', label: 'Proteção & Disjuntores', icon: Shield },
    { id: 'COMANDO', label: 'Comando & Partidas', icon: Sliders },
    { id: 'CARGAS', label: 'Cargas & Motores', icon: Activity },
    { id: 'MEDICAO', label: 'Medição & Instrumentação', icon: Gauge },
    { id: 'CONEXAO', label: 'Bornes & Barramentos', icon: Layers },
    { id: 'ATERRAMENTO', label: 'Aterramento & Proteção PE', icon: Radio },
  ];

  const filteredSymbols = SYMBOL_LIBRARY.filter(sym => {
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
    <div className="w-80 h-full bg-[#11141A] border-r border-[#232833] flex flex-col z-20 select-none shadow-2xl">
      {/* Header */}
      <div className="h-12 px-4 border-b border-[#232833] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono font-bold text-xs text-slate-100 uppercase tracking-wider">
            Biblioteca de Símbolos IEC
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[#1E2533] text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-[#232833]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, tag, IEC ou norma..."
            className="w-full bg-[#161A22] border border-[#232833] focus:border-amber-500 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors"
          />
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
        </div>
      </div>

      {/* Category Pills */}
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

      {/* Symbol List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          {filteredSymbols.length} componentes encontrados
        </span>

        {filteredSymbols.map(sym => (
          <div
            key={sym.id}
            className="p-3 rounded bg-[#161A22] border border-[#232833] hover:border-amber-500/50 hover:bg-[#1C212B] transition-all flex flex-col gap-1.5 cursor-pointer group"
            onClick={() => onInsertSymbol(sym)}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                {sym.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-mono border border-amber-500/30">
                {sym.tagPrefix}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {sym.shortDescription}
            </p>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-[#232833]">
              <span>{sym.iecCode}</span>
              <span className="text-amber-400 flex items-center gap-1 group-hover:underline">
                <Plus className="h-3 w-3" /> Inserir no CAD
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
