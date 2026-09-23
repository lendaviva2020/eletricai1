'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { Split, Zap, AlertTriangle, Shield, CheckCircle2, Sliders } from 'lucide-react';

export function MultifilarViewer() {
  const { components, sharedTags, toggleBreakerState } = useWorkspace();
  const [selectedCircuit, setSelectedCircuit] = useState<'cct_comp' | 'cct_exh' | 'cct_cmd'>('cct_comp');

  // Find compressor component & tags
  const compBreaker = components.find(c => c.tag === 'Q02_COMPRESSOR');
  const compContactor = components.find(c => c.tag === 'KM01_COMPRESSOR');
  const compThermal = components.find(c => c.tag === 'FT01_TERMIC_COMP');
  const compMotor = components.find(c => c.tag === 'MTR01_COMPRESSOR');

  const isCompEnergized = compBreaker?.isEnergized && compContactor?.isEnergized;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] text-slate-200 select-none overflow-hidden">
      {/* Top Banner / Generator Status */}
      <div className="h-12 px-6 bg-[#11141A] border-b border-[#232833] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Split className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-slate-100 uppercase tracking-wider">
                Gerador Multifilar Automático 1-Clique
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                L1 • L2 • L3 • N • PE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Inferência física por tipo de carga e condutores ABNT NBR 5410 item 6.1.5.3
            </p>
          </div>
        </div>

        {/* Circuit Selector Buttons */}
        <div className="flex items-center gap-1 bg-[#161A22] border border-[#232833] p-1 rounded">
          <button
            onClick={() => setSelectedCircuit('cct_comp')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
              selectedCircuit === 'cct_comp'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CCT 01 (Compressor 30cv)
          </button>
          <button
            onClick={() => setSelectedCircuit('cct_exh')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
              selectedCircuit === 'cct_exh'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CCT 02 (Exaustor VFD 10cv)
          </button>
          <button
            onClick={() => setSelectedCircuit('cct_cmd')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
              selectedCircuit === 'cct_cmd'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Circuito de Comando 24VDC
          </button>
        </div>
      </div>

      {/* Main Multifilar Visual Canvas */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Schematic SVG Renderer */}
        <div className="flex-1 bg-[#11141A] border border-[#232833] rounded-lg p-6 flex flex-col relative overflow-auto shadow-inner bg-cad-grid">
          <div className="flex items-center justify-between pb-4 border-b border-[#232833]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400">
                ESQUEMA MULTIFILAR DE POTÊNCIA (3F+PE 380V)
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Esquema de Aterramento TN-S
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                L1 (Fase R)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                L2 (Fase S)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
                L3 (Fase T)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                N (Neutro)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                PE (Terra)
              </span>
            </div>
          </div>

          {/* SVG Diagram Canvas */}
          <div className="flex-1 flex items-center justify-center min-h-[500px]">
            <svg viewBox="0 0 750 480" className="w-full max-w-4xl h-auto select-none">
              {/* Busbars L1, L2, L3, PE at Top */}
              <g id="busbars">
                {/* L1 Bus */}
                <line x1="50" y1="40" x2="700" y2="40" stroke="#F59E0B" strokeWidth="4" />
                <text x="20" y="44" fill="#F59E0B" fontSize="12" fontFamily="monospace" fontWeight="bold">L1</text>

                {/* L2 Bus */}
                <line x1="50" y1="65" x2="700" y2="65" stroke="#94A3B8" strokeWidth="4" />
                <text x="20" y="69" fill="#94A3B8" fontSize="12" fontFamily="monospace" fontWeight="bold">L2</text>

                {/* L3 Bus */}
                <line x1="50" y1="90" x2="700" y2="90" stroke="#CBD5E1" strokeWidth="4" />
                <text x="20" y="94" fill="#CBD5E1" fontSize="12" fontFamily="monospace" fontWeight="bold">L3</text>

                {/* PE Ground Bus */}
                <line x1="50" y1="115" x2="700" y2="115" stroke="#10B981" strokeWidth="3" strokeDasharray="6,4" />
                <text x="20" y="119" fill="#10B981" fontSize="12" fontFamily="monospace" fontWeight="bold">PE</text>
              </g>

              {/* Feeders dropping down to Disjuntor Q02 */}
              <g id="feeder_lines">
                <line x1="180" y1="40" x2="180" y2="170" stroke={compBreaker?.isEnergized ? '#F59E0B' : '#EF4444'} strokeWidth="2.5" />
                <line x1="220" y1="65" x2="220" y2="170" stroke={compBreaker?.isEnergized ? '#94A3B8' : '#EF4444'} strokeWidth="2.5" />
                <line x1="260" y1="90" x2="260" y2="170" stroke={compBreaker?.isEnergized ? '#CBD5E1' : '#EF4444'} strokeWidth="2.5" />
                {/* PE runs straight to motor frame */}
                <line x1="300" y1="115" x2="300" y2="440" stroke="#10B981" strokeWidth="2" strokeDasharray="6,3" />
              </g>

              {/* Component 1: Disjuntor Motor Q02 */}
              <g id="disjuntor_q02" transform="translate(150, 170)">
                <rect x="0" y="0" width="140" height="55" rx="3" fill="#161A22" stroke="#232833" strokeWidth="1.5" />
                <text x="10" y="20" fill="#F8FAFC" fontSize="11" fontFamily="monospace" fontWeight="bold">Q02 (DWA160-63)</text>
                <text x="10" y="36" fill="#94A3B8" fontSize="9" fontFamily="monospace">In=63A | Icu=25kA</text>
                <text x="10" y="48" fill={compBreaker?.isEnergized ? '#10B981' : '#EF4444'} fontSize="9" fontFamily="monospace">
                  {compBreaker?.isEnergized ? '● FECHADO' : '○ TRIP/ABERTO'}
                </text>

                {/* Internal breaker contact symbols */}
                <circle cx="30" cy="5" r="2.5" fill="#F59E0B" />
                <circle cx="70" cy="5" r="2.5" fill="#94A3B8" />
                <circle cx="110" cy="5" r="2.5" fill="#CBD5E1" />
              </g>

              {/* Lines from Breaker to Contactor KM01 */}
              <g id="breaker_to_contactor">
                <line x1="180" y1="225" x2="180" y2="265" stroke={isCompEnergized ? '#F59E0B' : '#EF4444'} strokeWidth="2.5" />
                <line x1="220" y1="225" x2="220" y2="265" stroke={isCompEnergized ? '#94A3B8' : '#EF4444'} strokeWidth="2.5" />
                <line x1="260" y1="225" x2="260" y2="265" stroke={isCompEnergized ? '#CBD5E1' : '#EF4444'} strokeWidth="2.5" />
              </g>

              {/* Component 2: Contator KM01 */}
              <g id="contator_km01" transform="translate(150, 265)">
                <rect x="0" y="0" width="140" height="50" rx="3" fill="#161A22" stroke="#232833" strokeWidth="1.5" />
                <text x="10" y="18" fill="#F8FAFC" fontSize="11" fontFamily="monospace" fontWeight="bold">KM01 (CWB50)</text>
                <text x="10" y="32" fill="#94A3B8" fontSize="9" fontFamily="monospace">AC-3 50A | Bobina 24VDC</text>
                <text x="10" y="44" fill={compContactor?.isEnergized ? '#10B981' : '#64748B'} fontSize="9" fontFamily="monospace">
                  Bobina: {compContactor?.isEnergized ? 'ENERGIZADA (A1-A2)' : 'DESLIGADA'}
                </text>
              </g>

              {/* Lines from Contactor to Thermal Relay FT01 */}
              <g id="contactor_to_thermal">
                <line x1="180" y1="315" x2="180" y2="350" stroke={isCompEnergized ? '#F59E0B' : '#EF4444'} strokeWidth="2.5" />
                <line x1="220" y1="315" x2="220" y2="350" stroke={isCompEnergized ? '#94A3B8' : '#EF4444'} strokeWidth="2.5" />
                <line x1="260" y1="315" x2="260" y2="350" stroke={isCompEnergized ? '#CBD5E1' : '#EF4444'} strokeWidth="2.5" />
              </g>

              {/* Component 3: Relé Térmico FT01 */}
              <g id="thermal_relay_ft01" transform="translate(150, 350)">
                <rect x="0" y="0" width="140" height="45" rx="3" fill="#161A22" stroke="#232833" strokeWidth="1.5" />
                <text x="10" y="18" fill="#F8FAFC" fontSize="11" fontFamily="monospace" fontWeight="bold">FT01 (RW67)</text>
                <text x="10" y="32" fill="#94A3B8" fontSize="9" fontFamily="monospace">Ajuste: 42.0A | Classe 10</text>
              </g>

              {/* Lines from Thermal Relay to Motor W22 */}
              <g id="thermal_to_motor">
                <line x1="180" y1="395" x2="180" y2="430" stroke={isCompEnergized ? '#F59E0B' : '#64748B'} strokeWidth="2.5" />
                <line x1="220" y1="395" x2="220" y2="430" stroke={isCompEnergized ? '#94A3B8' : '#64748B'} strokeWidth="2.5" />
                <line x1="260" y1="395" x2="260" y2="430" stroke={isCompEnergized ? '#CBD5E1' : '#64748B'} strokeWidth="2.5" />
              </g>

              {/* Component 4: Motor 3-Phase MTR01 */}
              <g id="motor_mtr01" transform="translate(150, 430)">
                <circle cx="70" cy="35" r="32" fill="#161A22" stroke={isCompEnergized ? '#F59E0B' : '#334155'} strokeWidth="2" />
                <text x="56" y="32" fill="#F8FAFC" fontSize="12" fontFamily="monospace" fontWeight="bold">M 3~</text>
                <text x="52" y="48" fill="#F59E0B" fontSize="9" fontFamily="monospace" fontWeight="bold">30 CV</text>

                {/* PE Connection to Motor Shell */}
                <line x1="300" y1="440" x2="220" y2="450" stroke="#10B981" strokeWidth="2" strokeDasharray="4,2" />
                <text x="230" y="475" fill="#10B981" fontSize="9" fontFamily="monospace">PE (Carcaça Aterrada)</text>
              </g>

              {/* Command Circuit Box on Right */}
              <g id="command_preview" transform="translate(420, 160)">
                <rect x="0" y="0" width="300" height="280" rx="4" fill="#0D1017" stroke="#232833" strokeWidth="1.5" />
                <text x="15" y="25" fill="#06B6D4" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  CIRCUITO DE COMANDO 24VDC (INTERTRAVAMENTO)
                </text>

                {/* +24V Rail */}
                <line x1="20" y1="50" x2="280" y2="50" stroke="#EF4444" strokeWidth="2" />
                <text x="240" y="45" fill="#EF4444" fontSize="9" fontFamily="monospace">+24VDC</text>

                {/* Emergency Mushroom Button Symbol */}
                <text x="25" y="80" fill="#E2E8F0" fontSize="10" fontFamily="monospace">1. Botão Emergência (%I0.0): NF [ OK ]</text>
                {/* Thermal Contact 95-96 */}
                <text x="25" y="115" fill="#E2E8F0" fontSize="10" fontFamily="monospace">2. Contato FT01 95-96 (%I0.1): NF [ OK ]</text>
                {/* Stop Pushbutton */}
                <text x="25" y="150" fill="#E2E8F0" fontSize="10" fontFamily="monospace">3. Botoeira Desliga (%I0.3): NF [ OK ]</text>
                {/* Start Pushbutton & Seal Contact */}
                <text x="25" y="185" fill="#E2E8F0" fontSize="10" fontFamily="monospace">4. Botoeira Liga (%I0.2) // Selo KM01</text>
                {/* Coil KM01 */}
                <text x="25" y="220" fill="#10B981" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  5. Bobina KM01 (%Q0.2) &rarr; {compContactor?.isEnergized ? 'ACIONADA' : 'EM ESPERA'}
                </text>

                {/* 0V Rail */}
                <line x1="20" y1="255" x2="280" y2="255" stroke="#3B82F6" strokeWidth="2" />
                <text x="250" y="250" fill="#3B82F6" fontSize="9" fontFamily="monospace">0VDC</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Sidebar Normative Specification */}
        <div className="w-80 bg-[#11141A] border border-[#232833] rounded-lg p-4 flex flex-col gap-4 text-xs font-mono select-none">
          <div className="flex items-center gap-2 pb-3 border-b border-[#232833]">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="font-bold text-slate-100">IDENTIFICAÇÃO DE CONDUTORES</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-2.5 rounded bg-[#161A22] border border-[#232833]">
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <span>Fases L1, L2, L3:</span>
                <span>Preto / Cinza / Marrom</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Conforme NBR 5410 item 6.1.5.3.1 - Condutores de fase.
              </p>
            </div>

            <div className="p-2.5 rounded bg-[#161A22] border border-[#232833]">
              <div className="flex items-center justify-between text-blue-400 font-bold">
                <span>Neutro (N):</span>
                <span>Azul-claro</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Uso exclusivo da cor azul-clara para qualquer condutor neutro isolado.
              </p>
            </div>

            <div className="p-2.5 rounded bg-[#161A22] border border-[#232833]">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Proteção (PE):</span>
                <span>Verde-Amarelo</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Condutor de proteção ligado à barra de terra equipotencial BEP.
              </p>
            </div>
          </div>

          {/* Quick Breaker Switch Test */}
          <div className="mt-auto pt-4 border-t border-[#232833] flex flex-col gap-2">
            <span className="text-[10px] uppercase text-slate-400 font-bold">Teste de Interrupção</span>
            <button
              onClick={() => toggleBreakerState('Q02_COMPRESSOR')}
              className={`w-full py-2 rounded text-xs font-bold transition-colors ${
                compBreaker?.isEnergized
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
              }`}
            >
              {compBreaker?.isEnergized ? 'SIMULAR DISPARO DISJUNTOR Q02' : 'REARMAR DISJUNTOR Q02'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
