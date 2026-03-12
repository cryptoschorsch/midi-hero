'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { GameEngine, type EngineCallbacks, type HitEffect } from '@/lib/game/engine';
import type {
  Song, GameScore, GameState, ActiveNote, HitRating,
  Difficulty, MidiNoteEvent, GameSettings
} from '@/types';
import { initialScore } from '@/lib/game/scoring';
import type { HighwayConfig } from '@/lib/game/noteScheduler';
import { MPK_MINI_KEYBOARD_BASE, MPK_MINI_KEYBOARD_RANGE } from '@/lib/midi/midiMapping';

interface UseGameEngineOptions {
  canvasWidth: number;
  canvasHeight: number;
  difficulty: Difficulty;
  practiceSpeed?: number;
  settings: GameSettings;
  onPlaySound?: (note: number, velocity: number, duration: number, source: 'keyboard' | 'pad') => void;
}

export function useGameEngine({
  canvasWidth,
  canvasHeight,
  difficulty,
  practiceSpeed = 1.0,
  settings,
  onPlaySound,
}: UseGameEngineOptions) {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState<GameScore>(initialScore());
  const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([]);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  const [countdown, setCountdown] = useState(3);

  const engineRef = useRef<GameEngine | null>(null);
  const renderRafRef = useRef<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const onPlaySoundRef = useRef(onPlaySound);
  onPlaySoundRef.current = onPlaySound;

  const hitZoneY = canvasHeight - 24;

  const makeConfig = useCallback((): HighwayConfig => ({
    canvasWidth,
    canvasHeight,
    hitZoneY,
    keyboardAreaHeight: canvasHeight * 0.12,
    numKeyboardLanes: MPK_MINI_KEYBOARD_RANGE,
    numPadLanes: 8,
    scrollSpeed: settings.scrollSpeed,
    baseNote: MPK_MINI_KEYBOARD_BASE + settings.octaveOffset,
  }), [canvasWidth, canvasHeight, hitZoneY, settings.scrollSpeed, settings.octaveOffset]);

  const startRenderLoop = useCallback(() => {
    const loop = () => {
      if (!engineRef.current) return;
      const state = engineRef.current.getState();
      setActiveNotes(state.activeNotes);
      setScore(state.score);
      setHitEffects(state.hitEffects);
      renderRafRef.current = requestAnimationFrame(loop);
    };
    renderRafRef.current = requestAnimationFrame(loop);
  }, []);

  const stopRenderLoop = useCallback(() => {
    if (renderRafRef.current) {
      cancelAnimationFrame(renderRafRef.current);
      renderRafRef.current = null;
    }
  }, []);

  const loadSong = useCallback((song: Song) => {
    const callbacks: EngineCallbacks = {
      onHit: (_note: ActiveNote, _rating: HitRating) => {},
      onMiss: () => {},
      onSongEnd: (finalScore: GameScore) => {
        setScore(finalScore);
        setGameState('results');
        stopRenderLoop();
      },
      playSound: (note, velocity, duration, source) => onPlaySoundRef.current?.(note, velocity, duration, source),
    };

    const config = makeConfig();
    const baseNote = MPK_MINI_KEYBOARD_BASE + settings.octaveOffset;
    const engine = new GameEngine(config, difficulty, callbacks, practiceSpeed, baseNote);
    engine.loadSong(song.notes);
    engineRef.current = engine;
  }, [difficulty, practiceSpeed, makeConfig, onPlaySound, settings.octaveOffset, stopRenderLoop]);

  const startGame = useCallback((song: Song) => {
    loadSong(song);
    setGameState('countdown');
    setCountdown(3);

    let count = 3;
    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownRef.current!);
        engineRef.current?.start();
        setGameState('playing');
        startRenderLoop();
      }
    }, 1000);
  }, [loadSong, startRenderLoop]);

  const pauseGame = useCallback(() => {
    engineRef.current?.pause();
    stopRenderLoop();
    setGameState('paused');
  }, [stopRenderLoop]);

  const resumeGame = useCallback(() => {
    engineRef.current?.resume();
    startRenderLoop();
    setGameState('playing');
  }, [startRenderLoop]);

  const stopGame = useCallback(() => {
    engineRef.current?.pause();
    stopRenderLoop();
    if (countdownRef.current) clearInterval(countdownRef.current);
    setGameState('menu');
    setActiveNotes([]);
    setHitEffects([]);
    setScore(initialScore());
  }, [stopRenderLoop]);

  const handleMidiInput = useCallback((event: MidiNoteEvent) => {
    engineRef.current?.handleMidiInput(event);
  }, []);

  // Update engine config when canvas size changes
  useEffect(() => {
    engineRef.current?.updateConfig(makeConfig());
  }, [canvasWidth, canvasHeight, makeConfig]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRenderLoop();
      if (countdownRef.current) clearInterval(countdownRef.current);
      engineRef.current?.pause();
    };
  }, [stopRenderLoop]);

  return {
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
  };
}
