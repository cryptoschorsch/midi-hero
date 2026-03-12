'use client';

import React, { useEffect, useRef } from 'react';
import {
  MPK_MINI_KEYBOARD_BASE,
  MPK_MINI_KEYBOARD_RANGE,
  isWhiteKey,
  isBlackKey,
  countWhiteKeys,
  LANE_COLORS,
} from '@/lib/midi/midiMapping';

interface KeyboardVisualProps {
  width: number;
  height: number;
  activeNotes: Set<number>;    // notes currently pressed (glowing)
  expectedNotes: Set<number>;  // notes that should be pressed now (hit zone hint)
  baseNote: number;
}

export function KeyboardVisual({
  width,
  height,
  activeNotes,
  expectedNotes,
  baseNote,
}: KeyboardVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const totalWhiteKeys = countWhiteKeys(baseNote, MPK_MINI_KEYBOARD_RANGE);
    const whiteKeyWidth = width / totalWhiteKeys;
    const blackKeyWidth = whiteKeyWidth * 0.58;
    const blackKeyHeight = height * 0.62;
    const gap = 2;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#06060f';
    ctx.fillRect(0, 0, width, height);

    // Draw white keys
    let whiteIdx = 0;
    for (let i = 0; i < MPK_MINI_KEYBOARD_RANGE; i++) {
      const note = baseNote + i;
      if (!isWhiteKey(note)) continue;

      const x = whiteIdx * whiteKeyWidth;
      const isActive = activeNotes.has(note);
      const isExpected = expectedNotes.has(note);
      const kx = x + gap / 2;
      const kw = whiteKeyWidth - gap;

      if (isActive) {
        ctx.fillStyle = LANE_COLORS.white;
        ctx.shadowBlur = 20;
        ctx.shadowColor = LANE_COLORS.white;
      } else if (isExpected) {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.35)';
        ctx.shadowBlur = 12;
        ctx.shadowColor = LANE_COLORS.white;
      } else {
        ctx.fillStyle = '#1c1c30';
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(kx, 0, kw, height);

      // Top highlight gradient
      ctx.shadowBlur = 0;
      if (!isActive) {
        const grad = ctx.createLinearGradient(kx, 0, kx, 14);
        grad.addColorStop(0, 'rgba(255,255,255,0.10)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(kx, 0, kw, 14);
      }

      ctx.strokeStyle = '#0d0d20';
      ctx.lineWidth = 1;
      ctx.strokeRect(kx + 0.5, 0.5, kw - 1, height - 1);

      whiteIdx++;
    }

    // Draw black keys on top
    whiteIdx = 0;
    for (let i = 0; i < MPK_MINI_KEYBOARD_RANGE; i++) {
      const note = baseNote + i;
      if (isWhiteKey(note)) {
        whiteIdx++;
        continue;
      }

      const x = whiteIdx * whiteKeyWidth - blackKeyWidth / 2;
      const isActive = activeNotes.has(note);
      const isExpected = expectedNotes.has(note);

      if (isActive) {
        ctx.fillStyle = LANE_COLORS.black;
        ctx.shadowBlur = 20;
        ctx.shadowColor = LANE_COLORS.black;
      } else if (isExpected) {
        ctx.fillStyle = 'rgba(200, 0, 255, 0.55)';
        ctx.shadowBlur = 12;
        ctx.shadowColor = LANE_COLORS.black;
      } else {
        ctx.fillStyle = '#03030a';
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(x, 0, blackKeyWidth, blackKeyHeight);

      // Top highlight
      ctx.shadowBlur = 0;
      if (!isActive) {
        const grad = ctx.createLinearGradient(x, 0, x, 8);
        grad.addColorStop(0, 'rgba(255,255,255,0.14)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, 0, blackKeyWidth, 8);
      }
      ctx.shadowBlur = 0;
    }
  }, [width, height, activeNotes, expectedNotes, baseNote]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block' }}
    />
  );
}
