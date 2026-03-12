'use client';

import React from 'react';
import type { GameScore } from '@/types';

interface ScoreDisplayProps {
  score: GameScore;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <div className="flex items-center justify-between px-6 py-2 bg-black/60 border-b border-cyan-500/20">
      {/* Score */}
      <div className="text-center">
        <div className="text-xs text-cyan-400/60 uppercase tracking-widest">Score</div>
        <div className="text-2xl font-mono font-bold text-cyan-400 tabular-nums">
          {score.score.toLocaleString()}
        </div>
      </div>

      {/* Combo */}
      <div className="text-center">
        <div className="text-xs text-pink-400/60 uppercase tracking-widest">Combo</div>
        <div
          className="text-2xl font-mono font-bold tabular-nums transition-colors"
          style={{ color: score.combo > 0 ? '#ff00ff' : '#ffffff44' }}
        >
          {score.combo}x
        </div>
      </div>

      {/* Multiplier */}
      <div className="text-center">
        <div className="text-xs text-yellow-400/60 uppercase tracking-widest">Multi</div>
        <div
          className="text-2xl font-mono font-bold text-yellow-400 tabular-nums"
          style={{
            textShadow: score.multiplier >= 4 ? '0 0 20px #ffff00' : undefined,
          }}
        >
          ×{score.multiplier}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm font-mono">
        <span className="text-cyan-400">{score.perfectCount} <span className="text-cyan-400/40">P</span></span>
        <span className="text-green-400">{score.greatCount} <span className="text-green-400/40">G</span></span>
        <span className="text-yellow-400">{score.goodCount} <span className="text-yellow-400/40">OK</span></span>
        <span className="text-red-400">{score.missCount} <span className="text-red-400/40">M</span></span>
      </div>

      {/* Accuracy */}
      <div className="text-center">
        <div className="text-xs text-white/40 uppercase tracking-widest">Accuracy</div>
        <div className="text-xl font-mono font-bold text-white">
          {score.accuracy.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
