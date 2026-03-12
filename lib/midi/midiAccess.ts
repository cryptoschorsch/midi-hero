import type { MidiNoteEvent } from '@/types';
import { getNoteSource } from './midiMapping';

export type MidiMessageCallback = (event: MidiNoteEvent) => void;
export type MidiDeviceChangeCallback = (devices: MIDIInput[]) => void;

let midiAccess: MIDIAccess | null = null;
const messageListeners: Set<MidiMessageCallback> = new Set();
const deviceChangeListeners: Set<MidiDeviceChangeCallback> = new Set();

function handleMidiMessage(
  event: MIDIMessageEvent,
  inputLatencyOffset: number = 0
): void {
  const data = event.data;
  if (!data || data.length < 2) return;

  const statusByte = data[0];
  const type = statusByte & 0xf0;
  const channel = (statusByte & 0x0f) + 1; // 1-indexed
  const note = data[1];
  const velocity = data.length > 2 ? data[2] : 0;

  // noteOn with velocity > 0
  if (type === 0x90 && velocity > 0) {
    const source = getNoteSource(note, channel);
    if (!source) return;

    const midiEvent: MidiNoteEvent = {
      type: 'noteOn',
      note,
      velocity,
      timestamp: performance.now() + inputLatencyOffset,
      channel,
      source,
    };
    messageListeners.forEach((cb) => cb(midiEvent));
  }

  // noteOff or noteOn with velocity 0
  if (type === 0x80 || (type === 0x90 && velocity === 0)) {
    const source = getNoteSource(note, channel);
    if (!source) return;

    const midiEvent: MidiNoteEvent = {
      type: 'noteOff',
      note,
      velocity: 0,
      timestamp: performance.now() + inputLatencyOffset,
      channel,
      source,
    };
    messageListeners.forEach((cb) => cb(midiEvent));
  }
}

function attachToInput(input: MIDIInput, latencyOffset: number): void {
  input.onmidimessage = (event: MIDIMessageEvent) =>
    handleMidiMessage(event, latencyOffset);
}

function notifyDeviceChange(): void {
  if (!midiAccess) return;
  const devices = Array.from(midiAccess.inputs.values());
  deviceChangeListeners.forEach((cb) => cb(devices));
}

export async function requestMidiAccess(): Promise<MIDIAccess | null> {
  if (!navigator.requestMIDIAccess) {
    console.warn('Web MIDI API not supported in this browser.');
    return null;
  }

  try {
    midiAccess = await navigator.requestMIDIAccess({ sysex: false });

    midiAccess.onstatechange = () => {
      notifyDeviceChange();
    };

    return midiAccess;
  } catch (err) {
    console.error('MIDI access denied:', err);
    return null;
  }
}

export function getAvailableInputs(): MIDIInput[] {
  if (!midiAccess) return [];
  return Array.from(midiAccess.inputs.values());
}

let activeInputId: string | null = null;
let currentLatencyOffset = 0;

export function connectToInput(inputId: string | null, latencyOffset = 0): void {
  if (!midiAccess) return;
  currentLatencyOffset = latencyOffset;

  // Detach from all
  midiAccess.inputs.forEach((input) => {
    input.onmidimessage = null;
  });

  if (inputId === null) {
    // Connect to all inputs
    midiAccess.inputs.forEach((input) => {
      attachToInput(input, latencyOffset);
    });
    activeInputId = 'all';
  } else {
    const input = midiAccess.inputs.get(inputId);
    if (input) {
      attachToInput(input, latencyOffset);
      activeInputId = inputId;
    }
  }
}

export function addMidiMessageListener(cb: MidiMessageCallback): () => void {
  messageListeners.add(cb);
  return () => messageListeners.delete(cb);
}

export function addDeviceChangeListener(cb: MidiDeviceChangeCallback): () => void {
  deviceChangeListeners.add(cb);
  return () => deviceChangeListeners.delete(cb);
}

export function updateLatencyOffset(offset: number): void {
  currentLatencyOffset = offset;
  if (midiAccess && activeInputId) {
    connectToInput(activeInputId === 'all' ? null : activeInputId, offset);
  }
}

// Detect AKAI MPK mini automatically
export function findMpkMini(inputs: MIDIInput[]): MIDIInput | null {
  return (
    inputs.find(
      (i) =>
        (i.name?.toLowerCase() ?? '').includes('mpk') ||
        (i.name?.toLowerCase() ?? '').includes('akai')
    ) ?? null
  );
}
