// AKAI MPK mini MIDI Mapping
// Default keyboard: MIDI notes 48–72 (C3–C5, 25 keys)
// Drum pads:        MIDI notes 36–43 (channel 10)

export const MPK_MINI_KEYBOARD_BASE = 48; // C3
export const MPK_MINI_KEYBOARD_RANGE = 25; // 25 keys

export const MPK_MINI_PAD_NOTES: Record<number, string> = {
  36: 'Kick',
  37: 'Snare',
  38: 'Clap',
  39: 'HiHat Open',
  40: 'HiHat Closed',
  41: 'Tom High',
  42: 'Tom Low',
  43: 'Crash',
};

export const PAD_NOTE_NUMBERS = [36, 37, 38, 39, 40, 41, 42, 43];

// Piano key layout: true = white key, false = black key
// Offset within octave: C=0, C#=1, D=2, D#=3, E=4, F=5, F#=6, G=7, G#=8, A=9, A#=10, B=11
const OCTAVE_PATTERN: boolean[] = [
  true,  // C
  false, // C#
  true,  // D
  false, // D#
  true,  // E
  true,  // F
  false, // F#
  true,  // G
  false, // G#
  true,  // A
  false, // A#
  true,  // B
];

export function isWhiteKey(midiNote: number): boolean {
  return OCTAVE_PATTERN[midiNote % 12];
}

export function isBlackKey(midiNote: number): boolean {
  return !isWhiteKey(midiNote);
}

// Returns 0-based lane index for keyboard notes
// White keys fill the lanes in order; black keys share adjacent lanes (visual only)
export function getKeyboardLane(midiNote: number, baseNote: number = MPK_MINI_KEYBOARD_BASE): number {
  return midiNote - baseNote;
}

export function getPadLane(midiNote: number): number {
  return PAD_NOTE_NUMBERS.indexOf(midiNote);
}

// Determine source from MIDI channel and note
export function getNoteSource(
  midiNote: number,
  channel: number
): 'keyboard' | 'pad' | null {
  if (channel === 10 && PAD_NOTE_NUMBERS.includes(midiNote)) {
    return 'pad';
  }
  return 'keyboard';
}

// Note name helpers
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiNoteToName(note: number): string {
  const octave = Math.floor(note / 12) - 1;
  const name = NOTE_NAMES[note % 12];
  return `${name}${octave}`;
}

export function noteNameToMidi(name: string): number {
  const match = name.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) throw new Error(`Invalid note name: ${name}`);
  const noteIndex = NOTE_NAMES.indexOf(match[1]);
  const octave = parseInt(match[2]);
  return noteIndex + (octave + 1) * 12;
}

// Count white keys in range [baseNote, baseNote + count)
export function countWhiteKeys(baseNote: number, count: number): number {
  let white = 0;
  for (let i = baseNote; i < baseNote + count; i++) {
    if (isWhiteKey(i)) white++;
  }
  return white;
}

// Get x position (0–1) of a key within the keyboard visual
export function getKeyXPosition(
  midiNote: number,
  baseNote: number,
  totalWhiteKeys: number
): number {
  let whiteIndex = 0;
  for (let i = baseNote; i < midiNote; i++) {
    if (isWhiteKey(i)) whiteIndex++;
  }

  if (isWhiteKey(midiNote)) {
    return (whiteIndex + 0.5) / totalWhiteKeys;
  } else {
    // Black key: positioned between two white keys
    return (whiteIndex) / totalWhiteKeys + 0.5 / totalWhiteKeys;
  }
}

// Lane colors for the highway
export const LANE_COLORS = {
  white: '#00d4ff',
  black: '#c800ff',
  pad:   ['#ff6b00', '#ff8c00', '#ffb300', '#ffd700', '#e8ff00', '#b3ff00', '#00ff88', '#00ffc8'],
};

export function getLaneColor(midiNote: number, source: 'keyboard' | 'pad'): string {
  if (source === 'pad') {
    const lane = getPadLane(midiNote);
    return LANE_COLORS.pad[lane] ?? '#ff6b00';
  }
  return isWhiteKey(midiNote) ? LANE_COLORS.white : LANE_COLORS.black;
}
