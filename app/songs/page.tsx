'use client';

import React, { useState, useRef } from 'react';
import { SongCard } from '@/components/ui/SongCard';
import { DifficultySelector } from '@/components/ui/DifficultySelector';
import { BUILTIN_SONGS } from '@/lib/songs/builtinSongs';
import { parseMidiFile, buildSongFromMidi } from '@/lib/midi/midiParser';
import type { Difficulty, GameMode, Song } from '@/types';

type ModeFilter = 'all' | GameMode;

export default function SongsPage() {
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [importStep, setImportStep] = useState<'idle' | 'analyzing' | 'configure'>('idle');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredSongs = BUILTIN_SONGS.filter((song) => {
    if (difficultyFilter !== 'all' && song.difficulty !== difficultyFilter) return false;
    if (modeFilter !== 'all' && song.mode !== modeFilter) return false;
    return true;
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStep('analyzing');
    setImportError(null);
    try {
      const parsed = await parseMidiFile(file);
      // For now, just show a success message – full import flow on /import page
      alert(`Parsed MIDI: ${parsed.tracks.length} tracks, ${parsed.bpm.toFixed(0)} BPM. Full import UI coming soon.`);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to parse MIDI file');
    } finally {
      setImportStep('idle');
    }
  };

  return (
    <main className="min-h-[calc(100vh-60px)] p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-3xl font-black font-mono"
          style={{ color: '#00ffff', textShadow: '0 0 20px #00ffff44' }}
        >
          SONG SELECT
        </h1>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importStep !== 'idle'}
          className="px-4 py-2 border border-pink-500/50 text-pink-400 font-mono text-sm rounded hover:bg-pink-500/10 transition-colors disabled:opacity-50"
        >
          {importStep === 'analyzing' ? 'ANALYZING...' : '+ IMPORT MIDI'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".mid,.midi"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {importError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 font-mono text-sm">
          {importError}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-6 mb-6">
        <DifficultySelector
          value={difficultyFilter as Difficulty}
          onChange={(d) => setDifficultyFilter(d)}
        />
        <button
          onClick={() => setDifficultyFilter('all')}
          className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors ${
            difficultyFilter === 'all'
              ? 'border-white/50 text-white'
              : 'border-white/20 text-white/40'
          }`}
        >
          ALL
        </button>

        <div className="w-px h-6 bg-white/10" />

        {(['all', 'keyboard', 'pads', 'mixed'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setModeFilter(m)}
            className="text-xs font-mono tracking-wider transition-colors"
            style={{
              color: modeFilter === m ? '#00ffff' : 'rgba(255,255,255,0.3)',
            }}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Song Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filteredSongs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>

      {filteredSongs.length === 0 && (
        <div className="text-center py-20 text-white/30 font-mono">
          No songs match the current filters.
        </div>
      )}
    </main>
  );
}
