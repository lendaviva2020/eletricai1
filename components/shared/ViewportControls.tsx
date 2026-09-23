'use client';

import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Hand,
  Compass,
} from 'lucide-react';

export interface ViewportControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomToFit: () => void;
  onResetView: () => void;
  isPanMode?: boolean;
  onTogglePanMode?: () => void;
  zoomLevel?: number; // e.g. 1 for 100%
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
  label?: string;
}

export function ViewportControls({
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  onResetView,
  isPanMode = false,
  onTogglePanMode,
  zoomLevel,
  position = 'bottom-right',
  className = '',
  label,
}: ViewportControlsProps) {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }[position];

  return (
    <aside
      aria-label="Controles de Visualização"
      className={`absolute ${positionClasses} z-30 flex items-center gap-1 bg-[#161A22]/95 backdrop-blur-md border border-[#232833] rounded-lg p-1 shadow-2xl transition-all select-none ${className}`}
    >
      {/* Optional Mode/Context Label */}
      {label && (
        <>
          <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 font-semibold uppercase tracking-wider hidden sm:inline-block">
            {label}
          </span>
          <div className="h-4 w-[1px] bg-[#232833] mx-0.5 hidden sm:block" />
        </>
      )}

      {/* Pan-mode toggle button */}
      {onTogglePanMode && (
        <button
          type="button"
          onClick={onTogglePanMode}
          className={`relative p-1.5 rounded transition-colors flex items-center justify-center group ${
            isPanMode
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-[#1F2633] border border-transparent'
          }`}
          title={isPanMode ? 'Modo Panorâmica: ATIVO (Clique para desativar)' : 'Modo Panorâmica: DESATIVADO (Clique para ativar arrasto)'}
          aria-pressed={isPanMode}
        >
          <Hand className="h-4 w-4" />
          <span className="sr-only">Alternar modo pan</span>

          {/* Mini active indicator dot */}
          {isPanMode && (
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
          )}
        </button>
      )}

      {/* Divider */}
      <div className="h-4 w-[1px] bg-[#232833] mx-0.5" />

      {/* Zoom In button */}
      {onZoomIn && (
        <button
          type="button"
          onClick={onZoomIn}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1F2633] border border-transparent transition-colors flex items-center justify-center"
          title="Aumentar zoom (Zoom In)"
        >
          <ZoomIn className="h-4 w-4" />
          <span className="sr-only">Zoom In</span>
        </button>
      )}

      {/* Zoom level readout */}
      {zoomLevel !== undefined && (
        <span
          className="text-[11px] font-mono font-medium text-slate-300 px-1 min-w-[2.8rem] text-center"
          title="Nível de ampliação atual"
        >
          {Math.round(zoomLevel * 100)}%
        </span>
      )}

      {/* Zoom Out button */}
      {onZoomOut && (
        <button
          type="button"
          onClick={onZoomOut}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1F2633] border border-transparent transition-colors flex items-center justify-center"
          title="Diminuir zoom (Zoom Out)"
        >
          <ZoomOut className="h-4 w-4" />
          <span className="sr-only">Zoom Out</span>
        </button>
      )}

      {/* Divider */}
      <div className="h-4 w-[1px] bg-[#232833] mx-0.5" />

      {/* Zoom-to-fit button */}
      <button
        type="button"
        onClick={onZoomToFit}
        className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1F2633] border border-transparent transition-colors flex items-center justify-center"
        title="Ajustar à tela / Enquadrar tudo (Zoom to fit)"
      >
        <Maximize2 className="h-4 w-4" />
        <span className="sr-only">Ajustar à tela</span>
      </button>

      {/* Reset view button */}
      <button
        type="button"
        onClick={onResetView}
        className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1F2633] border border-transparent transition-colors flex items-center justify-center"
        title="Redefinir visualização original (Reset view)"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="sr-only">Redefinir visualização</span>
      </button>
    </aside>
  );
}
