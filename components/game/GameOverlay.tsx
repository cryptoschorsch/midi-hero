'use client';

import React from 'react';
import type { GameState, GameScore, Song } from '@/types';

interface GameOverlayProps {
  gameState: GameState;
  countdown: number;
  score: GameScore;
  song: Song | null;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export function GameOverlay({
  gameState,
  countdown,
  score,
  song,
  onResume,
  onRestart,
  onExit,
}: GameOverlayProps) {
  if (gameState === 'playing' || gameState === 'menu') return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/70 backdrop-blur-sm">
      {gameState === 'countdown' && (
        <div className="text-center">
          <div
            className="text-9xl font-mono font-black"
            style={{
              color: '#00ffff',
              textShadow: '0 0 60px #00ffff, 0 0 120px #00ffff',
              animation: 'pulse 0.8s ease-in-out',
            }}
          >
            {countdown > 0 ? countdown : 'GO!'}
          </div>
          {song && (
            <div className="mt-6 text-white/60 text-xl">{song.title}</div>
          )}
        </div>
      )}

      {gameState === 'paused' && (
        <div className="text-center space-y-6">
          <h2
            className="text-5xl font-mono font-black"
            style={{ color: '#ff00ff', textShadow: '0 0 40px #ff00ff' }}
          >
            PAUSED
          </h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={onResume}
              className="px-8 py-3 bg-cyan-500/20 border border-cyan-500 text-cyan-400 font-mono hover:bg-cyan-500/40 transition-colors rounded"
            >
              RESUME
            </button>
            <button
              onClick={onRestart}
              className="px-8 py-3 bg-pink-500/20 border border-pink-500 text-pink-400 font-mono hover:bg-pink-500/40 transition-colors rounded"
            >
              RESTART
            </button>
            <button
              onClick={onExit}
              className="px-8 py-3 bg-white/10 border border-white/30 text-white/60 font-mono hover:bg-white/20 transition-colors rounded"
            >
              EXIT
            </button>
          </div>
        </div>
      )}

      {gameState === 'results' && (
        <div className="text-center space-y-6 max-w-md w-full">
          <h2
            className="text-5xl font-mono font-black"
            style={{ color: '#00ff88', textShadow: '0 0 40px #00ff88' }}
          >
            RESULTS
          </h2>

          {/* Grade */}
          <div
            className="text-8xl font-mono font-black"
            style={{
              color: gradeColor(score.grade),
              textShadow: `0 0 60px ${gradeColor(score.grade)}`,
            }}
          >
            {score.grade}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-left font-mono">
            <StatRow label="Score" value={score.score.toLocaleString()} color="text-cyan-400" />
            <StatRow label="Max Combo" value={`${score.maxCombo}x`} color="text-pink-400" />
            <StatRow label="Accuracy" value={`${score.accuracy.toFixed(1)}%`} color="text-white" />
            <StatRow label="Perfect" value={String(score.perfectCount)} color="text-cyan-400" />
            <StatRow label="Great" value={String(score.greatCount)} color="text-green-400" />
            <StatRow label="Good" value={String(score.goodCount)} color="text-yellow-400" />
            <StatRow label="Miss" value={String(score.missCount)} color="text-red-400" />
          </div>

          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={onRestart}
              className="px-8 py-3 bg-cyan-500/20 border border-cyan-500 text-cyan-400 font-mono hover:bg-cyan-500/40 transition-colors rounded"
            >
              PLAY AGAIN
            </button>
            <button
              onClick={onExit}
              className="px-8 py-3 bg-white/10 border border-white/30 text-white/60 font-mono hover:bg-white/20 transition-colors rounded"
            >
              EXIT
            </button>
          </div>
        </div>
      )}

      {gameState === 'loading' && (
        <div className="text-center">
          <div className="text-2xl font-mono text-cyan-400 animate-pulse">LOADING...</div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white/5 rounded p-3">
      <div className="text-xs text-white/40 uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function gradeColor(grade: string): string {
  switch (grade) {
    case 'S': return '#00ffff';
    case 'A': return '#00ff88';
    case 'B': return '#ffff00';
    case 'C': return '#ff8800';
    case 'D': return '#ff3333';
    default:  return '#ffffff';
  }
}
