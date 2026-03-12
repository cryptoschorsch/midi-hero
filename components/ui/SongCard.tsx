'use client';

import React from 'react';
import Link from 'next/link';
import type { Song } from '@/types';

interface SongCardProps {
  song: Song;
  bestScore?: number;
  bestGrade?: string;
}

const DIFFICULTY_COLORS = {
  beginner:     { border: '#00ff88', text: '#00ff88', glow: '#00ff8844' },
  intermediate: { border: '#ffff00', text: '#ffff00', glow: '#ffff0044' },
  advanced:     { border: '#ff00ff', text: '#ff00ff', glow: '#ff00ff44' },
};

const MODE_ICONS = {
  keyboard: '🎹',
  pads: '🥁',
  mixed: '🎛️',
};

export function SongCard({ song, bestScore, bestGrade }: SongCardProps) {
  const colors = DIFFICULTY_COLORS[song.difficulty];

  return (
    <Link href={`/play?songId=${song.id}`}>
      <div
        className="relative rounded-lg p-4 bg-black/60 border transition-all duration-200 hover:scale-105 cursor-pointer overflow-hidden group"
        style={{
          borderColor: colors.border + '44',
          boxShadow: `0 0 0 1px ${colors.border}22`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            `0 0 20px ${colors.glow}, 0 0 0 1px ${colors.border}66`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            `0 0 0 1px ${colors.border}22`;
        }}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${colors.border}, transparent)`,
          }}
        />

        {/* Mode icon */}
        <div className="absolute top-3 right-3 text-xl opacity-40">
          {MODE_ICONS[song.mode]}
        </div>

        {/* Title */}
        <h3 className="font-mono font-bold text-white mb-1 pr-8 text-sm leading-tight">
          {song.title}
        </h3>
        <p className="text-xs text-white/40 font-mono mb-3">{song.artist}</p>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono px-2 py-0.5 rounded border uppercase tracking-wider"
              style={{ borderColor: colors.border + '66', color: colors.text }}
            >
              {song.difficulty}
            </span>
            <span className="text-xs text-white/30 font-mono">{song.bpm} BPM</span>
          </div>

          {bestGrade && (
            <div className="flex items-center gap-1">
              <span
                className="text-lg font-mono font-black"
                style={{ color: gradeColor(bestGrade) }}
              >
                {bestGrade}
              </span>
              {bestScore && (
                <span className="text-xs text-white/30 font-mono">
                  {bestScore.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="mt-2 text-xs text-white/20 font-mono">
          {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')} min
        </div>
      </div>
    </Link>
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
