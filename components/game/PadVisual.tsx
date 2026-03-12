'use client';

import React, { useEffect, useRef } from 'react';
import { PAD_NOTE_NUMBERS, LANE_COLORS, MPK_MINI_PAD_NOTES } from '@/lib/midi/midiMapping';

interface PadVisualProps {
  width: number;
  height: number;
  activePads: Set<number>;
  expectedPads: Set<number>;
}

export function PadVisual({ width, height, activePads, expectedPads }: PadVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);

    const cols = 4;
    const rows = 2;
    const padW = (width - 8) / cols;
    const padH = (height - 6) / rows;
    const gap = 2;

    PAD_NOTE_NUMBERS.forEach((note, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const x = col * (padW + gap) + gap;
      const y = row * (padH + gap) + gap;

      const isActive = activePads.has(note);
      const isExpected = expectedPads.has(note);
      const color = LANE_COLORS.pad[idx];

      // Pad body
      const radius = 6;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + padW - radius, y);
      ctx.arcTo(x + padW, y, x + padW, y + radius, radius);
      ctx.lineTo(x + padW, y + padH - radius);
      ctx.arcTo(x + padW, y + padH, x + padW - radius, y + padH, radius);
      ctx.lineTo(x + radius, y + padH);
      ctx.arcTo(x, y + padH, x, y + padH - radius, radius);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.closePath();

      if (isActive) {
        ctx.fillStyle = color;
        ctx.shadowBlur = 25;
        ctx.shadowColor = color;
      } else if (isExpected) {
        ctx.fillStyle = color + '55';
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
      } else {
        ctx.fillStyle = '#1a1a2e';
        ctx.shadowBlur = 0;
      }

      ctx.fill();
      ctx.shadowBlur = 0;

      // Border
      ctx.strokeStyle = color + '88';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = isActive ? '#000' : color + 'aa';
      ctx.font = `${Math.floor(padH * 0.22)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        MPK_MINI_PAD_NOTES[note]?.slice(0, 4) ?? `P${idx + 1}`,
        x + padW / 2,
        y + padH / 2
      );
    });
  }, [width, height, activePads, expectedPads]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block' }}
    />
  );
}
