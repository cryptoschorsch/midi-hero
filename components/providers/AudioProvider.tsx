'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
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
  const [instrument, setInstrument] = useState<InstrumentType>('piano');
  const [volume, setVolume] = useState(0.8);

  const initAudio = useCallback(async () => {
    if (isReady) return;
    await startAudioContext();
    createInstrument(instrument);
    initDrumKit();
    setIsReady(true);
  }, [isReady, instrument]);

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
    if (!isReady) return;
    playNote(note, velocity, duration);
  }, [isReady]);

  const playPadNote = useCallback((note: number, velocity: number) => {
    if (!isReady) return;
    triggerDrum(note, velocity);
  }, [isReady]);

  const stopKeyboardNote = useCallback((note: number) => {
    if (!isReady) return;
    stopNote(note);
  }, [isReady]);

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
