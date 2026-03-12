'use client';

import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  requestMidiAccess,
  getAvailableInputs,
  addMidiMessageListener,
  addDeviceChangeListener,
  connectToInput,
  findMpkMini,
} from '@/lib/midi/midiAccess';
import type { MidiNoteEvent } from '@/types';

interface MidiContextValue {
  isSupported: boolean;
  isConnected: boolean;
  devices: MIDIInput[];
  selectedDeviceId: string | null;
  selectDevice: (id: string | null) => void;
  addListener: (cb: (e: MidiNoteEvent) => void) => void;
  removeListener: (cb: (e: MidiNoteEvent) => void) => void;
  latencyOffset: number;
  setLatencyOffset: (ms: number) => void;
  lastNote: MidiNoteEvent | null;
}

export const MidiContext = createContext<MidiContextValue>({
  isSupported: false,
  isConnected: false,
  devices: [],
  selectedDeviceId: null,
  selectDevice: () => {},
  addListener: () => {},
  removeListener: () => {},
  latencyOffset: 0,
  setLatencyOffset: () => {},
  lastNote: null,
});

export function MidiProvider({ children }: { children: React.ReactNode }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [devices, setDevices] = useState<MIDIInput[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [latencyOffset, setLatencyOffsetState] = useState(0);
  const [lastNote, setLastNote] = useState<MidiNoteEvent | null>(null);
  const listeners = useRef<Set<(e: MidiNoteEvent) => void>>(new Set());

  const broadcastNote = useCallback((event: MidiNoteEvent) => {
    setLastNote(event);
    listeners.current.forEach((cb) => cb(event));
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);

    requestMidiAccess().then((access) => {
      if (!access) return;
      setIsConnected(true);

      const inputs = getAvailableInputs();
      setDevices(inputs);

      // Auto-detect MPK mini
      const mpk = findMpkMini(inputs);
      const deviceId = mpk?.id ?? null;
      setSelectedDeviceId(deviceId);
      connectToInput(deviceId, latencyOffset);

      const unsubMsg = addMidiMessageListener(broadcastNote);
      const unsubDev = addDeviceChangeListener((newDevices) => {
        setDevices(newDevices);
      });

      return () => {
        unsubMsg();
        unsubDev();
      };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectDevice = useCallback((id: string | null) => {
    setSelectedDeviceId(id);
    connectToInput(id, latencyOffset);
  }, [latencyOffset]);

  const setLatencyOffset = useCallback((ms: number) => {
    setLatencyOffsetState(ms);
    connectToInput(selectedDeviceId, ms);
  }, [selectedDeviceId]);

  const addListener = useCallback((cb: (e: MidiNoteEvent) => void) => {
    listeners.current.add(cb);
  }, []);

  const removeListener = useCallback((cb: (e: MidiNoteEvent) => void) => {
    listeners.current.delete(cb);
  }, []);

  return (
    <MidiContext.Provider value={{
      isSupported,
      isConnected,
      devices,
      selectedDeviceId,
      selectDevice,
      addListener,
      removeListener,
      latencyOffset,
      setLatencyOffset,
      lastNote,
    }}>
      {children}
    </MidiContext.Provider>
  );
}
