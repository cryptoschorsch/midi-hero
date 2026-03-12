'use client';

import { useContext, useEffect, useCallback } from 'react';
import { MidiContext } from '@/components/providers/MidiProvider';
import type { MidiNoteEvent } from '@/types';

export function useMidi() {
  return useContext(MidiContext);
}

export function useMidiNote(onNote: (event: MidiNoteEvent) => void, active = true) {
  const { addListener, removeListener } = useContext(MidiContext);

  const stableCallback = useCallback(onNote, []);

  useEffect(() => {
    if (!active) return;
    addListener(stableCallback);
    return () => removeListener(stableCallback);
  }, [active, addListener, removeListener, stableCallback]);
}
