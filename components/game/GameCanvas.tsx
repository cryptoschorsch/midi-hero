'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import type { ActiveNote, GameMode } from '@/types';
import type { HitEffect } from '@/lib/game/engine';
import {
  MPK_MINI_KEYBOARD_BASE,
  MPK_MINI_KEYBOARD_RANGE,
  getLaneColor,
  isWhiteKey,
  countWhiteKeys,
  LANE_COLORS,
} from '@/lib/midi/midiMapping';
import { getRatingColor } from '@/lib/game/engine';

interface GameCanvasProps {
  width: number;
  height: number;
  activeNotes: ActiveNote[];
  hitEffects: HitEffect[];
  mode: GameMode;
  baseNote?: number;
  scrollSpeed?: number;
}

const HIT_ZONE_Y_RATIO = 0.8;
const PERSPECTIVE_FACTOR = 0.6;

export function GameCanvas({
  width,
  height,
  activeNotes,
  hitEffects,
  mode,
  baseNote = MPK_MINI_KEYBOARD_BASE,
  scrollSpeed = 300,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hitZoneY = height * HIT_ZONE_Y_RATIO;
    const numKeyLanes = mode !== 'pads' ? MPK_MINI_KEYBOARD_RANGE : 0;
    const numPadLanes = mode !== 'keyboard' ? 8 : 0;

    // Split canvas area
    const keyAreaWidth = mode === 'mixed' ? width * 0.65 : mode === 'keyboard' ? width : 0;
    const padAreaWidth = mode === 'mixed' ? width * 0.35 : mode === 'pads' ? width : 0;
    const padStartX = keyAreaWidth;

    // ── Background ──────────────────────────────────────────────────────────
    ctx.fillStyle = '#080812';
    ctx.fillRect(0, 0, width, height);

    // ── Retro grid (perspective) ─────────────────────────────────────────────
    drawGrid(ctx, width, height, hitZoneY, mode, keyAreaWidth, padAreaWidth, padStartX);

    // ── Lane dividers ────────────────────────────────────────────────────────
    if (numKeyLanes > 0) {
      drawKeyLanes(ctx, keyAreaWidth, height, hitZoneY, numKeyLanes, baseNote);
    }
    if (numPadLanes > 0) {
      drawPadLanes(ctx, padStartX, padAreaWidth, height, hitZoneY, numPadLanes);
    }

    // ── Notes ────────────────────────────────────────────────────────────────
    for (const note of activeNotes) {
      drawNote(ctx, note, hitZoneY, height);
    }

    // ── Hit Zone ─────────────────────────────────────────────────────────────
    drawHitZone(ctx, width, hitZoneY);

    // ── Hit Effects ──────────────────────────────────────────────────────────
    const now = performance.now();
    for (const effect of hitEffects) {
      const age = now - effect.timestamp;
      drawHitEffect(ctx, effect, age);
    }

    // ── Scanlines overlay ────────────────────────────────────────────────────
    drawScanlines(ctx, width, height);
  }, [width, height, activeNotes, hitEffects, mode, baseNote]);

  useEffect(() => {
    const loop = () => {
      drawFrame();
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  );
}

// ─── Drawing helpers ───────────────────────────────────────────────────────────

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  hitZoneY: number,
  mode: GameMode,
  keyAreaWidth: number,
  padAreaWidth: number,
  padStartX: number
) {
  ctx.save();
  ctx.globalAlpha = 0.15;

  // Horizontal grid lines (perspective)
  const numHLines = 20;
  for (let i = 0; i <= numHLines; i++) {
    const progress = i / numHLines;
    const y = progress * hitZoneY;
    const perspective = 0.3 + progress * 0.7;

    // Line gets more opaque near the hit zone
    ctx.globalAlpha = 0.05 + progress * 0.2;
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Vertical perspective lines
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 0.5;
  const vanishX = width / 2;
  const numVLines = 10;
  for (let i = 0; i <= numVLines; i++) {
    const t = i / numVLines;
    const bottomX = t * width;
    const topX = vanishX + (bottomX - vanishX) * 0.3;
    ctx.beginPath();
    ctx.moveTo(topX, 0);
    ctx.lineTo(bottomX, hitZoneY);
    ctx.stroke();
  }

  ctx.restore();
}

function drawKeyLanes(
  ctx: CanvasRenderingContext2D,
  areaWidth: number,
  height: number,
  hitZoneY: number,
  numLanes: number,
  baseNote: number
) {
  const laneW = areaWidth / numLanes;

  for (let i = 0; i < numLanes; i++) {
    const note = baseNote + i;
    const x = i * laneW;

    // Subtle lane background
    const isWhite = isWhiteKey(note);
    ctx.fillStyle = isWhite ? 'rgba(0, 212, 255, 0.03)' : 'rgba(200, 0, 255, 0.03)';
    ctx.fillRect(x, 0, laneW, hitZoneY);

    // Lane separator
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, hitZoneY);
    ctx.stroke();
  }
}

function drawPadLanes(
  ctx: CanvasRenderingContext2D,
  startX: number,
  areaWidth: number,
  height: number,
  hitZoneY: number,
  numLanes: number
) {
  const laneW = areaWidth / numLanes;

  for (let i = 0; i < numLanes; i++) {
    const x = startX + i * laneW;
    const color = LANE_COLORS.pad[i] ?? '#ff8800';

    ctx.fillStyle = `${color}08`;
    ctx.fillRect(x, 0, laneW, hitZoneY);

    ctx.strokeStyle = `${color}20`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, hitZoneY);
    ctx.stroke();
  }
}

function drawNote(
  ctx: CanvasRenderingContext2D,
  note: ActiveNote,
  hitZoneY: number,
  canvasHeight: number
) {
  const { x, y, width, height, noteEvent, hit, missed } = note;

  // Don't draw if far above or below
  if (y + height < -50 || y > canvasHeight + 50) return;

  const color = getLaneColor(noteEvent.note, noteEvent.source);

  // 3D perspective: notes get bigger as they approach hit zone
  const progress = Math.max(0, Math.min(1, y / hitZoneY));
  const scale = 0.6 + progress * 0.4;
  const scaledWidth = width * scale;
  const offsetX = x + (width - scaledWidth) / 2;

  const radius = Math.min(6, scaledWidth / 4);

  ctx.save();

  if (hit) {
    ctx.globalAlpha = 0;
    ctx.restore();
    return;
  }

  if (missed) {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ff3333';
    ctx.shadowBlur = 0;
  } else {
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.shadowBlur = 12 + progress * 8;
    ctx.shadowColor = color;
  }

  // Rounded rectangle
  roundRect(ctx, offsetX, y - height, scaledWidth, height, radius);
  ctx.fill();

  // Highlight stripe at top
  if (!missed) {
    ctx.shadowBlur = 0;
    const grad = ctx.createLinearGradient(offsetX, y - height, offsetX, y - height + 8);
    grad.addColorStop(0, 'rgba(255,255,255,0.4)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    roundRect(ctx, offsetX, y - height, scaledWidth, 8, radius);
    ctx.fill();
  }

  ctx.restore();
}

function drawHitZone(ctx: CanvasRenderingContext2D, width: number, y: number) {
  const now = Date.now();
  const pulse = 0.6 + 0.4 * Math.sin(now * 0.003);

  ctx.save();

  // Glow line
  ctx.shadowBlur = 20 * pulse;
  ctx.shadowColor = '#00ffff';
  ctx.strokeStyle = `rgba(0, 255, 255, ${0.8 * pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();

  // Additional thick glow
  ctx.shadowBlur = 40 * pulse;
  ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 * pulse})`;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();

  ctx.restore();
}

function drawHitEffect(
  ctx: CanvasRenderingContext2D,
  effect: HitEffect,
  age: number
) {
  const duration = 500;
  if (age > duration) return;

  const progress = age / duration;
  const opacity = 1 - progress;
  const radius = 30 + progress * 60;

  ctx.save();
  ctx.globalAlpha = opacity;

  // Burst circle
  ctx.beginPath();
  ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = effect.color + '22';
  ctx.fill();

  ctx.strokeStyle = effect.color;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 20;
  ctx.shadowColor = effect.color;
  ctx.stroke();

  // Rating text
  ctx.shadowBlur = 15;
  ctx.shadowColor = effect.color;
  ctx.fillStyle = effect.color;
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    effect.rating.toUpperCase(),
    effect.x,
    effect.y - 30 - progress * 20
  );

  ctx.restore();
}

function drawScanlines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.fillStyle = '#000';
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 2);
  }
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
