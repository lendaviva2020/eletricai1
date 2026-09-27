'use client';

import React from 'react';

interface ElectricalAppIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  withGlow?: boolean;
  animate?: boolean;
}

const sizeMap = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
  '2xl': 'w-16 h-16',
};

/**
 * High-Precision Industrial Electrical Icon for EletricAI OS
 * Features:
 * - Geometric industrial hex shield
 * - Three-phase busbar tracks (L1, L2, L3)
 * - Sharp central electrical discharge node (Amber #F59E0B)
 * - Automation pulse nodes (Cyan #06B6D4)
 * - Grounding/PE safety reference marker
 */
export function ElectricalAppIcon({
  size = 'md',
  className = '',
  withGlow = true,
  animate = false,
}: ElectricalAppIconProps) {
  const dimensionClass = sizeMap[size] || 'w-8 h-8';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${dimensionClass} ${className}`}
      title="EletricAI — Sistema Operacional de Engenharia Elétrica & Automação"
    >
      {/* Ambient electrical glow */}
      {withGlow && (
        <div
          className={`absolute inset-0 rounded-lg bg-amber-500/20 blur-[6px] pointer-events-none ${
            animate ? 'animate-pulse' : ''
          }`}
        />
      )}

      {/* SVG Electrical Symbol */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_2px_8px_rgba(245,158,11,0.35)]"
      >
        {/* Background Industrial Rounded Hexagon Container */}
        <path
          d="M24 3L42 12V36L24 45L6 36V12L24 3Z"
          fill="#11141A"
          stroke="#F59E0B"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Inner Technical Border / Air-Gap */}
        <path
          d="M24 7L38 14V34L24 41L10 34V14L24 7Z"
          stroke="#232833"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Phase Busbar Lines (L1, L2, L3 - Top to Center) */}
        <line x1="18" y1="11" x2="18" y2="18" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <line x1="24" y1="9" x2="24" y2="16" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="30" y1="11" x2="30" y2="18" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

        {/* Industrial Electrical Lightning Core */}
        <path
          d="M26 15L15 26.5H23.5L20.5 37L33 24.5H25L26 15Z"
          fill="url(#amber-electric-gradient)"
          stroke="#FFFBEB"
          strokeWidth="1.2"
          strokeLinejoin="miter"
          strokeMiterlimit="4"
        />

        {/* Electrical Connection Nodes (Left & Right Terminals) */}
        <circle cx="10" cy="24" r="2" fill="#06B6D4" stroke="#161A22" strokeWidth="1" />
        <circle cx="38" cy="24" r="2" fill="#10B981" stroke="#161A22" strokeWidth="1" />

        {/* Protective Earth (PE) Grounding Symbol Indicator at Bottom */}
        <line x1="21" y1="39" x2="27" y2="39" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="22.5" y1="41" x2="25.5" y2="41" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="23.5" y1="43" x2="24.5" y2="43" stroke="#10B981" strokeWidth="1" strokeLinecap="round" />

        {/* Linear Gradients Definition */}
        <defs>
          <linearGradient id="amber-electric-gradient" x1="15" y1="15" x2="33" y2="37" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="0.4" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Complete Brand Lockup with New Industrial Electrical Icon & Typography
 */
export function ElectricalBrandLogo({
  size = 'md',
  showBadge = true,
  badgeText = 'v2.4 LTS',
  subtitle = 'Sistema Operacional Industrial',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  badgeText?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <ElectricalAppIcon size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'} withGlow />
      <div>
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-bold tracking-wider text-slate-100 font-sans text-sm sm:text-base">
            ELETRIC<span className="text-amber-400 font-black">AI</span>
          </span>
          {showBadge && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#161A22] border border-[#232833] text-amber-300/90 font-mono">
              {badgeText}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[10px] text-slate-400 tracking-tight mt-0.5 font-mono">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
