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
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = height * 0.6;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw white keys first
    let whiteIdx = 0;
    for (let i = 0; i < MPK_MINI_KEYBOARD_RANGE; i++) {
      const note = baseNote + i;
      if (!isWhiteKey(note)) continue;

      const x = whiteIdx * whiteKeyWidth;
      const isActive = activeNotes.has(note);
      const isExpected = expectedNotes.has(note);

      // Key fill
      if (isActive) {
        ctx.fillStyle = LANE_COLORS.white;
        ctx.shadowBlur = 20;
        ctx.shadowColor = LANE_COLORS.white;
      } else if (isExpected) {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = LANE_COLORS.white;
      } else {
        ctx.fillStyle = '#1a1a2e';
        ctx.shadowBlur = 0;
      }

      ctx.fillRect(x + 1, 0, whiteKeyWidth - 2, height - 1);

      // Key border
      ctx.strokeStyle = '#2a2a4a';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.strokeRect(x + 1, 0, whiteKeyWidth - 2, height - 1);

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
        ctx.fillStyle = 'rgba(200, 0, 255, 0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = LANE_COLORS.black;
      } else {
        ctx.fillStyle = '#050510';
        ctx.shadowBlur = 0;
      }

      ctx.fillRect(x, 0, blackKeyWidth, blackKeyHeight);
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
