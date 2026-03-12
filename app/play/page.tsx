'use client';

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GameCanvas } from '@/components/game/GameCanvas';
import { KeyboardVisual } from '@/components/game/KeyboardVisual';
import { PadVisual } from '@/components/game/PadVisual';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';
import { GameOverlay } from '@/components/game/GameOverlay';
import { DifficultySelector } from '@/components/ui/DifficultySelector';
import { InstrumentPicker } from '@/components/ui/InstrumentPicker';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useMidi, useMidiNote } from '@/hooks/useMidi';
import { useAudio } from '@/hooks/useAudio';
import { BUILTIN_SONGS, getSongById } from '@/lib/songs/builtinSongs';
import { MPK_MINI_KEYBOARD_BASE } from '@/lib/midi/midiMapping';
import { DIFFICULTY_PRESETS } from '@/lib/game/difficulty';
import type { Difficulty, Song, MidiNoteEvent, GameSettings } from '@/types';

const DEFAULT_SETTINGS: GameSettings = {
  audioLatencyOffset: 0,
  inputLatencyOffset: 0,
  scrollSpeed: 280,
  instrument: 'piano',
  masterVolume: 0.8,
  midiDeviceId: null,
  octaveOffset: 0,
  practiceMode: false,
  practiceSpeed: 1.0,
};

function PlayPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const songId = searchParams.get('songId');

  const [song, setSong] = useState<Song | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [containerWidth, setContainerWidth] = useState(1024);
  const [gameAreaHeight, setGameAreaHeight] = useState(500);
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  const [expectedKeys, setExpectedKeys] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const { initAudio, playSound, changeInstrument, instrument: currentInstrument } = useAudio();
  const midi = useMidi();

  const KEYBOARD_VISUAL_HEIGHT = 80;

  const {
    gameState,
    score,
    activeNotes,
    hitEffects,
    countdown,
    startGame,
    pauseGame,
    resumeGame,
    stopGame,
    handleMidiInput,
  } = useGameEngine({
    canvasWidth: containerWidth,
    canvasHeight: gameAreaHeight,
    difficulty,
    practiceSpeed: settings.practiceSpeed,
    settings,
    // Sound wird direkt im MIDI-Handler gespielt, nicht über die Engine
  });

  // Load song and initialise difficulty + scrollSpeed from song metadata
  useEffect(() => {
    const found = (songId ? getSongById(songId) : null) ?? BUILTIN_SONGS[0];
    setSong(found);
    const songDifficulty = found.difficulty as Difficulty;
    setDifficulty(songDifficulty);
    setSettings((s) => ({ ...s, scrollSpeed: DIFFICULTY_PRESETS[songDifficulty].scrollSpeed }));
  }, [songId]);

  // Container-Breite beobachten (für Keyboard-Visual-Breiten)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      setContainerWidth(Math.max(800, entries[0].contentRect.width));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Spielbereich-Höhe direkt vom Div beobachten → Canvas passt immer exakt
  useEffect(() => {
    const el = gameAreaRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      setGameAreaHeight(Math.max(300, entries[0].contentRect.height));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // MIDI input → sofort Sound + Game Engine + visuelles Feedback
  useMidiNote(
    useCallback((event: MidiNoteEvent) => {
      if (event.type === 'noteOn') {
        setActiveKeys((prev) => new Set([...prev, event.note]));
        // Sound immer direkt spielen (unabhängig von Hit-Detection)
        playSound(event.note, event.velocity, 0.3, event.source);
        if (gameState === 'playing') {
          handleMidiInput(event);
        }
      } else {
        setActiveKeys((prev) => {
          const next = new Set(prev);
          next.delete(event.note);
          return next;
        });
      }
    }, [gameState, handleMidiInput, playSound]),
    true
  );

  // Update expected keys from upcoming notes
  useEffect(() => {
    if (gameState !== 'playing') {
      setExpectedKeys(new Set());
      return;
    }
    const hitZoneNotes = activeNotes
      .filter((n) => !n.hit && !n.missed && n.y > gameAreaHeight * 0.7 && n.y < gameAreaHeight * 0.9)
      .map((n) => n.noteEvent.note);
    setExpectedKeys(new Set(hitZoneNotes));
  }, [activeNotes, gameState, gameAreaHeight]);

  const handleStart = async () => {
    if (!song) return;
    try {
      await initAudio();
    } catch (e) {
      console.warn('Audio init failed, starting without audio:', e);
    }
    startGame(song);
  };

  const handleExit = () => {
    stopGame();
    router.push('/songs');
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (gameState === 'playing') pauseGame();
      else if (gameState === 'paused') resumeGame();
    }
  }, [gameState, pauseGame, resumeGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const padActiveNotes = activeKeys.has(36) ? activeKeys : new Set<number>();
  const padExpected = new Set([...expectedKeys].filter(n => n < 48));
  const keyboardExpected = new Set([...expectedKeys].filter(n => n >= 48));

  if (!song) {
    return (
      <div className="flex items-center justify-center h-screen text-cyan-400 font-mono">
        LOADING...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] bg-[#080812] overflow-hidden" ref={containerRef}>
      {/* Score bar */}
      <ScoreDisplay score={score} />

      {/* Game area – flex-1 damit es genau den verbleibenden Platz füllt */}
      <div className="relative flex-1" ref={gameAreaRef}>
        <GameCanvas
          width={containerWidth}
          height={gameAreaHeight}
          activeNotes={activeNotes}
          hitEffects={hitEffects}
          mode={song.mode}
          baseNote={MPK_MINI_KEYBOARD_BASE + settings.octaveOffset}
          scrollSpeed={settings.scrollSpeed}
        />

        {/* Overlay (countdown / pause / results / menu) */}
        <GameOverlay
          gameState={gameState}
          countdown={countdown}
          score={score}
          song={song}
          onResume={resumeGame}
          onRestart={handleStart}
          onExit={handleExit}
        />

        {/* Pre-game setup (menu state) */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20">
            <div className="text-center space-y-6 max-w-lg w-full px-6">
              <h2
                className="text-2xl font-mono font-black"
                style={{ color: '#00ffff', textShadow: '0 0 20px #00ffff44' }}
              >
                {song.title}
              </h2>
              <p className="text-white/40 font-mono text-sm">{song.artist}</p>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-white/40 font-mono uppercase tracking-widest mb-2">Difficulty</div>
                  <DifficultySelector value={difficulty} onChange={(d) => {
                    setDifficulty(d);
                    setSettings((s) => ({ ...s, scrollSpeed: DIFFICULTY_PRESETS[d].scrollSpeed }));
                  }} />
                </div>
                <div>
                  <div className="text-xs text-white/40 font-mono uppercase tracking-widest mb-2">Instrument</div>
                  <InstrumentPicker
                    value={settings.instrument}
                    onChange={(inst) => {
                      setSettings((s) => ({ ...s, instrument: inst }));
                      changeInstrument(inst);
                    }}
                  />
                </div>
              </div>

              {/* MIDI status */}
              <div className="text-xs font-mono text-white/30">
                {!midi.isSupported
                  ? '⚠️ Web MIDI not supported. Use Chrome/Edge.'
                  : midi.isConnected
                  ? `🎹 MIDI Connected – ${midi.devices.length} device(s)`
                  : '⚠️ No MIDI device detected'}
              </div>

              <button
                onClick={handleStart}
                className="w-full py-4 font-mono font-bold text-xl tracking-widest border-2 rounded transition-all hover:scale-105"
                style={{
                  borderColor: '#00ffff',
                  color: '#00ffff',
                  backgroundColor: 'rgba(0,255,255,0.1)',
                  boxShadow: '0 0 20px rgba(0,255,255,0.3)',
                }}
              >
                START GAME
              </button>

              <button
                onClick={handleExit}
                className="text-white/30 font-mono text-sm hover:text-white/50 transition-colors"
              >
                ← Back to Song Select
              </button>
            </div>
          </div>
        )}

        {/* Pause button (during play) */}
        {gameState === 'playing' && (
          <button
            onClick={pauseGame}
            className="absolute top-3 right-3 z-10 px-3 py-1 text-xs font-mono text-white/40 border border-white/20 rounded hover:bg-white/10 transition-colors"
          >
            PAUSE [ESC]
          </button>
        )}
      </div>

      {/* Controller visualization */}
      <div className="flex" style={{ height: KEYBOARD_VISUAL_HEIGHT }}>
        {song.mode !== 'pads' && (
          <KeyboardVisual
            width={song.mode === 'mixed' ? containerWidth * 0.65 : containerWidth}
            height={KEYBOARD_VISUAL_HEIGHT}
            activeNotes={activeKeys}
            expectedNotes={keyboardExpected}
            baseNote={MPK_MINI_KEYBOARD_BASE + settings.octaveOffset}
          />
        )}
        {song.mode !== 'keyboard' && (
          <PadVisual
            width={song.mode === 'mixed' ? containerWidth * 0.35 : containerWidth}
            height={KEYBOARD_VISUAL_HEIGHT}
            activePads={activeKeys}
            expectedPads={padExpected}
          />
        )}
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen text-cyan-400 font-mono">
        LOADING...
      </div>
    }>
      <PlayPageInner />
    </Suspense>
  );
}
