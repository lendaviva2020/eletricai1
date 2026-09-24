'use client';

import React from 'react';
import {
  PlcProgramConfiguration,
  PlcTraceSample,
} from '@/types/plc';
import {
  Activity,
  Play,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';

interface SimulationTraceViewProps {
  traceSamples: PlcTraceSample[];
  monitoredTags: string[];
}

export function SimulationTraceView({
  traceSamples,
  monitoredTags,
}: SimulationTraceViewProps) {
  const displayTags = monitoredTags.slice(0, 4);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#11141A] text-slate-200 font-mono text-xs overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#232833]">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <span className="font-bold text-slate-100 text-sm">
            Osciloscópio / Gravador de Tendências em Tempo Real (PLC Trace)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">
            Amostras gravadas: {traceSamples.length}
          </span>
        </div>
      </div>

      {/* SVG Multi-channel Waveform Viewer */}
      <div className="flex-1 flex flex-col justify-around py-4 gap-4">
        {displayTags.map((tag, channelIdx) => {
          const channelColor =
            channelIdx === 0
              ? '#F59E0B' // amber
              : channelIdx === 1
              ? '#10B981' // emerald
              : channelIdx === 2
              ? '#06B6D4' // cyan
              : '#A855F7'; // purple

          // Build SVG path points
          const maxSamples = 50;
          const recentSamples = traceSamples.slice(-maxSamples);
          let pathD = '';

          recentSamples.forEach((sample, i) => {
            const rawVal = sample.values[tag] ?? 0;
            const numVal = typeof rawVal === 'boolean' ? (rawVal ? 1 : 0) : Number(rawVal);
            
            // Normalize y coordinate: 0..1 maps to 40..5 px inside channel track
            const normalizedY = 40 - Math.min(35, Math.max(0, numVal * 35));
            const x = (i / (maxSamples - 1 || 1)) * 900;

            if (i === 0) {
              pathD += `M ${x} ${normalizedY}`;
            } else {
              // Stepped signal for boolean logic
              const prevSample = recentSamples[i - 1];
              const prevRaw = prevSample.values[tag] ?? 0;
              const prevNum = typeof prevRaw === 'boolean' ? (prevRaw ? 1 : 0) : Number(prevRaw);
              const prevY = 40 - Math.min(35, Math.max(0, prevNum * 35));
              pathD += ` L ${x} ${prevY} L ${x} ${normalizedY}`;
            }
          });

          const currentSample = recentSamples[recentSamples.length - 1];
          const currentVal = currentSample ? currentSample.values[tag] : 'N/A';

          return (
            <div
              key={tag}
              className="h-20 bg-[#0B0D10] border border-[#232833] rounded p-2 relative flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[11px] z-10">
                <span className="font-bold" style={{ color: channelColor }}>
                  CH {channelIdx + 1}: {tag}
                </span>
                <span className="font-bold text-slate-300">
                  Valor Atual: {String(currentVal)}
                </span>
              </div>

              {/* Grid Background Line */}
              <div className="absolute inset-x-0 top-1/2 h-px bg-[#1A1F29]" />

              {/* SVG Wave */}
              <svg className="w-full h-12 overflow-visible">
                <path
                  d={pathD || 'M 0 35 L 900 35'}
                  fill="none"
                  stroke={channelColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
