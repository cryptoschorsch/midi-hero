'use client';

import React, { useState, useEffect } from 'react';
import { BUILTIN_SONGS } from '@/lib/songs/builtinSongs';
import type { LeaderboardEntry } from '@/types';

export default function LeaderboardPage() {
  const [selectedSongId, setSelectedSongId] = useState<string>(BUILTIN_SONGS[0].id);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/scores?songId=${selectedSongId}&limit=20`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [selectedSongId]);

  const selectedSong = BUILTIN_SONGS.find((s) => s.id === selectedSongId);

  return (
    <main className="min-h-[calc(100vh-60px)] p-6 max-w-4xl mx-auto">
      <h1
        className="text-3xl font-black font-mono mb-6"
        style={{ color: '#ff00ff', textShadow: '0 0 20px #ff00ff44' }}
      >
        LEADERBOARD
      </h1>

      {/* Song selector */}
      <div className="flex gap-2 flex-wrap mb-6">
        {BUILTIN_SONGS.map((song) => (
          <button
            key={song.id}
            onClick={() => setSelectedSongId(song.id)}
            className="px-3 py-1.5 text-xs font-mono rounded border transition-colors"
            style={{
              borderColor: selectedSongId === song.id ? '#ff00ff' : 'rgba(255,255,255,0.1)',
              color: selectedSongId === song.id ? '#ff00ff' : 'rgba(255,255,255,0.4)',
              backgroundColor: selectedSongId === song.id ? 'rgba(255,0,255,0.1)' : 'transparent',
            }}
          >
            {song.title}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-black/40 border border-white/10 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-mono text-white font-bold">{selectedSong?.title}</h2>
          <span className="text-xs text-white/30 font-mono">TOP 20</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-cyan-400/60 font-mono animate-pulse">LOADING...</div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-white/20 font-mono">
            No scores yet. Be the first to play!
          </div>
        ) : (
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="text-white/30 text-xs uppercase tracking-widest">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Player</th>
                <th className="px-4 py-2 text-right">Score</th>
                <th className="px-4 py-2 text-right">Accuracy</th>
                <th className="px-4 py-2 text-right">Grade</th>
                <th className="px-4 py-2 text-right">Instrument</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr
                  key={`${entry.userId}-${idx}`}
                  className="border-t border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 text-white/30">
                    {idx === 0 && <span style={{ color: '#ffd700' }}>🥇</span>}
                    {idx === 1 && <span style={{ color: '#c0c0c0' }}>🥈</span>}
                    {idx === 2 && <span style={{ color: '#cd7f32' }}>🥉</span>}
                    {idx > 2 && <span className="text-white/30">{idx + 1}</span>}
                  </td>
                  <td className="px-4 py-3 text-white">{entry.username}</td>
                  <td className="px-4 py-3 text-right text-cyan-400">{entry.score.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-white/60">{entry.accuracy.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="font-black text-lg"
                      style={{ color: gradeColor(entry.grade) }}
                    >
                      {entry.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white/40 text-xs capitalize">{entry.instrument}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

function gradeColor(grade: string): string {
  switch (grade) {
    case 'S': return '#00ffff';
    case 'A': return '#00ff88';
    case 'B': return '#ffff00';
    case 'C': return '#ff8800';
    default:  return '#ff3333';
  }
}
