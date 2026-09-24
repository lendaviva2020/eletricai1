'use client';

import React from 'react';
import { TitleBlockInfo } from '@/types/electrical';

interface TitleBlockSheetProps {
  sheetWidth: number;
  sheetHeight: number;
  titleBlock: TitleBlockInfo;
  sheetTitle: string;
}

export function TitleBlockSheet({
  sheetWidth,
  sheetHeight,
  titleBlock,
  sheetTitle,
}: TitleBlockSheetProps) {
  const margin = 20;
  const innerW = sheetWidth - margin * 2;
  const innerH = sheetHeight - margin * 2;

  // Title block box at bottom right
  const blockW = 340;
  const blockH = 90;
  const blockX = sheetWidth - margin - blockW;
  const blockY = sheetHeight - margin - blockH;

  const cols = [1, 2, 3, 4, 5, 6, 7, 8];
  const rows = ['A', 'B', 'C', 'D'];

  return (
    <g id="engineering_title_block_frame" className="select-none pointer-events-none">
      {/* Outer Border (Page border) */}
      <rect
        x={margin}
        y={margin}
        width={innerW}
        height={innerH}
        fill="none"
        stroke="#2E3748"
        strokeWidth="2"
      />

      {/* Inner Margin Border (Drawing Limit) */}
      <rect
        x={margin + 8}
        y={margin + 8}
        width={innerW - 16}
        height={innerH - 16}
        fill="none"
        stroke="#1E2533"
        strokeWidth="1"
      />

      {/* Coordinate Grid Labels (A-D, 1-8) Top/Bottom/Left/Right */}
      {cols.map((col, idx) => {
        const x = margin + 8 + (idx + 0.5) * ((innerW - 16) / cols.length);
        return (
          <React.Fragment key={`col_${col}`}>
            <text x={x} y={margin + 6} fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="middle">
              {col}
            </text>
            <text x={x} y={sheetHeight - margin + 6} fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="middle">
              {col}
            </text>
          </React.Fragment>
        );
      })}

      {rows.map((row, idx) => {
        const y = margin + 8 + (idx + 0.5) * ((innerH - 16) / rows.length);
        return (
          <React.Fragment key={`row_${row}`}>
            <text x={margin - 4} y={y + 3} fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="middle">
              {row}
            </text>
            <text x={sheetWidth - margin + 12} y={y + 3} fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="middle">
              {row}
            </text>
          </React.Fragment>
        );
      })}

      {/* TITLE BLOCK (SELO TÉCNICO ABNT / IEC) */}
      <g id="title_block" transform={`translate(${blockX}, ${blockY})`}>
        {/* Background */}
        <rect
          x="0"
          y="0"
          width={blockW}
          height={blockH}
          fill="#0D1017"
          stroke="#2E3748"
          strokeWidth="1.5"
        />

        {/* Header Strip with Project Title */}
        <rect x="0" y="0" width={blockW} height="24" fill="#161A22" />
        <text x="12" y="16" fill="#F8FAFC" fontSize="11" fontFamily="monospace" fontWeight="bold">
          {titleBlock.projectTitle}
        </text>
        <text x={blockW - 12} y="16" fill="#F59E0B" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="end">
          {titleBlock.sheetNumber} / {titleBlock.totalSheets}
        </text>

        {/* Divider 1 */}
        <line x1="0" y1="24" x2={blockW} y2="24" stroke="#2E3748" strokeWidth="1" />

        {/* Sheet Title */}
        <text x="12" y="40" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold">
          {sheetTitle}
        </text>
        <text x="12" y="52" fill="#94A3B8" fontSize="9" fontFamily="monospace">
          Cliente: {titleBlock.clientName}
        </text>

        {/* Divider 2 */}
        <line x1="0" y1="60" x2={blockW} y2="60" stroke="#2E3748" strokeWidth="1" />

        {/* Footer with Engineer, CREA, Revision, Date */}
        <text x="12" y="74" fill="#CBD5E1" fontSize="9" fontFamily="monospace">
          Resp: {titleBlock.engineerName} ({titleBlock.creaNumber})
        </text>
        <text x="12" y="85" fill="#64748B" fontSize="8" fontFamily="monospace">
          Normas: {titleBlock.standardReference}
        </text>

        {/* Date and Revision right-aligned */}
        <text x={blockW - 12} y="74" fill="#10B981" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="end">
          {titleBlock.revision}
        </text>
        <text x={blockW - 12} y="85" fill="#64748B" fontSize="8" fontFamily="monospace" textAnchor="end">
          {titleBlock.date} | {titleBlock.scale}
        </text>
      </g>
    </g>
  );
}
