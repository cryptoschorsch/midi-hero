'use client';

import { useContext, useEffect, useRef } from 'react';
import { MidiContext } from '@/components/providers/MidiProvider';
import type { MidiNoteEvent } from '@/types';

export function useMidi() {
  return useContext(MidiContext);
}

export function useMidiNote(onNote: (event: MidiNoteEvent) => void, active = true) {
  const { addListener, removeListener } = useContext(MidiContext);
  const onNoteRef = useRef(onNote);
  onNoteRef.current = onNote;

  useEffect(() => {
    if (!active) return;
    const handler = (event: MidiNoteEvent) => onNoteRef.current(event);
    addListener(handler);
    return () => removeListener(handler);
  }, [active, addListener, removeListener]);
}
