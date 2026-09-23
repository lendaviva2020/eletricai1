'use client';

import React from 'react';
import {
  HelpCircle,
  X,
  BookOpen,
  Keyboard,
  ShieldCheck,
  Zap,
  Cpu,
  FileSpreadsheet,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161A22] border border-[#232833] w-full max-w-2xl rounded-2xl shadow-2xl p-6 font-sans">
        <div className="flex items-center justify-between pb-4 border-b border-[#232833]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Central de Ajuda & Referência Técnica
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Normas ABNT, atalhos de teclado e guia de operação do EletricAI
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

        <div className="space-y-4 my-4 max-h-[65vh] overflow-y-auto pr-1 text-xs">
          {/* Normas */}
          <div className="bg-[#0D1017] p-3.5 rounded-xl border border-[#232833]">
            <div className="flex items-center gap-2 text-amber-400 font-mono font-bold mb-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Conformidade Normativa Ativa</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 font-mono text-[11px]">
              <li>• <strong className="text-slate-100">ABNT NBR 5410:</strong> Instalações elétricas de baixa tensão (queda de tensão max 4.0% em terminais, dimensionamento por ampacidade e sobrecarga).</li>
              <li>• <strong className="text-slate-100">ABNT NBR 14039:</strong> Instalações elétricas de média tensão (1.0 kV a 36.2 kV), proteção 50/51.</li>
              <li>• <strong className="text-slate-100">NR-10 & NR-12:</strong> Segurança em instalações e serviços elétricos com intertravamento mecânico e elétrico.</li>
              <li>• <strong className="text-slate-100">IEC 61131-3:</strong> Padrão internacional para linguagens de CLP (Ladder, FBD, ST).</li>
            </ul>
          </div>

          {/* Atalhos */}
          <div className="bg-[#0D1017] p-3.5 rounded-xl border border-[#232833]">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold mb-2">
              <Keyboard className="h-4 w-4" />
              <span>Atalhos de Teclado no Sistema</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded bg-[#161A22] border border-[#232833]">
                <span>Busca Global:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#0D1017] border border-[#232833] text-amber-400">Ctrl + K</kbd>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-[#161A22] border border-[#232833]">
                <span>Configurações:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#0D1017] border border-[#232833] text-slate-300">Ícone Engrenagem</kbd>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-[#161A22] border border-[#232833]">
                <span>Alternar Módulos:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#0D1017] border border-[#232833] text-slate-300">Sidebar / Dropdown</kbd>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-[#161A22] border border-[#232833]">
                <span>Multi-tenant:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#0D1017] border border-[#232833] text-slate-300">Header Organização</kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#232833] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0B0D10] text-xs font-mono font-bold transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
