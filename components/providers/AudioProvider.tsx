'use client';

import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import type { InstrumentType } from '@/types';
import {
  createInstrument,
  startAudioContext,
  playNote,
  stopNote,
  setMasterVolume,
  disposeInstrument,
} from '@/lib/audio/instruments';
import { initDrumKit, triggerDrum, disposeDrumKit } from '@/lib/audio/drumKit';

interface AudioContextValue {
  isReady: boolean;
  instrument: InstrumentType;
  volume: number;
  initAudio: () => Promise<void>;
  changeInstrument: (type: InstrumentType) => void;
  changeVolume: (vol: number) => void;
  playKeyboardNote: (note: number, velocity: number, duration: number) => void;
  playPadNote: (note: number, velocity: number) => void;
  stopKeyboardNote: (note: number) => void;
  playSound: (note: number, velocity: number, duration: number, source: 'keyboard' | 'pad') => void;
}

export const AudioContext = createContext<AudioContextValue>({
  isReady: false,
  instrument: 'piano',
  volume: 0.8,
  initAudio: async () => {},
  changeInstrument: () => {},
  changeVolume: () => {},
  playKeyboardNote: () => {},
  playPadNote: () => {},
  stopKeyboardNote: () => {},
  playSound: () => {},
});

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const isReadyRef = useRef(false);
  const [instrument, setInstrument] = useState<InstrumentType>('piano');
  const [volume, setVolume] = useState(0.8);

  const initAudio = useCallback(async () => {
    if (isReadyRef.current) return;
    await startAudioContext();
    createInstrument(instrument);
    initDrumKit();
    isReadyRef.current = true;
    setIsReady(true);
  }, [instrument]);

  const changeInstrument = useCallback((type: InstrumentType) => {
    setInstrument(type);
    if (isReady) {
      createInstrument(type);
    }
  }, [isReady]);

  const changeVolume = useCallback((vol: number) => {
    setVolume(vol);
    setMasterVolume(vol);
  }, []);

  const playKeyboardNote = useCallback((note: number, velocity: number, duration: number) => {
    if (!isReadyRef.current) return;
    playNote(note, velocity, duration);
  }, []);

  const playPadNote = useCallback((note: number, velocity: number) => {
    if (!isReadyRef.current) return;
    triggerDrum(note, velocity);
  }, []);

  const stopKeyboardNote = useCallback((note: number) => {
    if (!isReadyRef.current) return;
    stopNote(note);
  }, []);

  const playSound = useCallback((note: number, velocity: number, duration: number, source: 'keyboard' | 'pad') => {
    if (source === 'pad') {
      playPadNote(note, velocity);
    } else {
      playKeyboardNote(note, velocity, duration);
    }
  }, [playKeyboardNote, playPadNote]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disposeInstrument();
      disposeDrumKit();
    };
  }, []);

  return (
    <AudioContext.Provider value={{
      isReady,
      instrument,
      volume,
      initAudio,
      changeInstrument,
      changeVolume,
      playKeyboardNote,
      playPadNote,
      stopKeyboardNote,
      playSound,
    }}>
      {children}
    </AudioContext.Provider>
  );
}
