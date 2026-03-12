import type { Song, NoteEvent } from '@/types';

// Helper: build NoteEvents from a pattern array
// pattern: [beat, midiNote, durationBeats?]  beat is in quarter-notes
function mkNotes(bpm: number, pattern: [number, number, number?][], source: 'keyboard' | 'pad' = 'keyboard'): NoteEvent[] {
  const beat = 60 / bpm;
  return pattern.map(([b, note, dur = 1]) => ({
    time: b * beat,
    note,
    duration: Math.max(0.05, dur * beat * 0.9),
    velocity: 90,
    source,
  }));
}

// MIDI notes
const C3=48, D3=50, E3=52, F3=53, G3=55, As3=58, A3=57, B3=59;
const C4=60, Cs4=61, D4=62, Ds4=63, E4=64, F4=65, Fs4=66, G4=67, Gs4=68, A4=69, As4=70, B4=71;
const C5=72, Cs5=73, D5=74, Ds5=75, E5=76, F5=77, Fs5=78, G5=79;
// Drum pad notes
const KICK=36, SNARE=37, CLAP=38, HH_OPEN=39, HH_CLOSED=40, TOM_H=41, TOM_L=42, CRASH=43;

// ─── 1. Twinkle Twinkle Little Star ──────────────────────────────────────────
const twinkleNotes = mkNotes(90, [
  [0,C4],[1,C4],[2,G4],[3,G4],[4,A4],[5,A4],[6,G4,2],
  [8,F4],[9,F4],[10,E4],[11,E4],[12,D4],[13,D4],[14,C4,2],
  [16,G4],[17,G4],[18,F4],[19,F4],[20,E4],[21,E4],[22,D4,2],
  [24,G4],[25,G4],[26,F4],[27,F4],[28,E4],[29,E4],[30,D4,2],
  [32,C4],[33,C4],[34,G4],[35,G4],[36,A4],[37,A4],[38,G4,2],
  [40,F4],[41,F4],[42,E4],[43,E4],[44,D4],[45,D4],[46,C4,4],
]);

// ─── 2. Ode an die Freude ─────────────────────────────────────────────────────
const odeNotes = mkNotes(100, [
  [0,E4],[1,E4],[2,F4],[3,G4],[4,G4],[5,F4],[6,E4],[7,D4],
  [8,C4],[9,C4],[10,D4],[11,E4],[12,E4,1.5],[13.5,D4,0.5],[14,D4,2],
  [16,E4],[17,E4],[18,F4],[19,G4],[20,G4],[21,F4],[22,E4],[23,D4],
  [24,C4],[25,C4],[26,D4],[27,E4],[28,D4,1.5],[29.5,C4,0.5],[30,C4,2],
  [32,D4],[33,D4],[34,E4],[35,C4],[36,D4],[37,E4,0.5],[37.5,F4,0.5],[38,E4],[39,C4],
  [40,D4],[41,E4,0.5],[41.5,F4,0.5],[42,E4],[43,D4],[44,C4],[45,D4],[46,G3,2],
  [48,E4],[49,E4],[50,F4],[51,G4],[52,G4],[53,F4],[54,E4],[55,D4],
  [56,C4],[57,C4],[58,D4],[59,E4],[60,D4,1.5],[61.5,C4,0.5],[62,C4,2],
]);

// ─── 3. Happy Birthday ───────────────────────────────────────────────────────
const happyBdayNotes = mkNotes(90, [
  [0,C4,0.5],[0.5,C4,0.5],[1,D4],[2,C4],[3,F4],[4,E4,2],
  [6,C4,0.5],[6.5,C4,0.5],[7,D4],[8,C4],[9,G4],[10,F4,2],
  [12,C4,0.5],[12.5,C4,0.5],[13,C5],[14,A4],[15,F4],[16,E4],[17,D4,2],
  [19,As4,0.5],[19.5,As4,0.5],[20,A4],[21,F4],[22,G4],[23,F4,4],
]);

// ─── 4. Für Elise ────────────────────────────────────────────────────────────
const furEliseNotes = mkNotes(130, [
  // Main theme repeated twice
  [0,E5,0.5],[0.5,Ds5,0.5],[1,E5,0.5],[1.5,Ds5,0.5],[2,E5,0.5],[2.5,B4,0.5],[3,D5,0.5],[3.5,C5,0.5],
  [4,A4,1],[5,C4,0.5],[5.5,E4,0.5],[6,A4,0.5],[6.5,B4,1],
  [7.5,E4,0.5],[8,Gs4,0.5],[8.5,B4,0.5],[9,C5,1],
  [10,E4,0.5],[10.5,E5,0.5],[11,Ds5,0.5],[11.5,E5,0.5],[12,Ds5,0.5],[12.5,E5,0.5],[13,B4,0.5],[13.5,D5,0.5],[14,C5,0.5],[14.5,A4,1],
  // Bridge
  [16,E5,0.5],[16.5,Ds5,0.5],[17,E5,0.5],[17.5,Ds5,0.5],[18,E5,0.5],[18.5,B4,0.5],[19,D5,0.5],[19.5,C5,0.5],
  [20,A4,1],[21,C4,0.5],[21.5,E4,0.5],[22,A4,0.5],[22.5,B4,1],
  [23.5,E4,0.5],[24,C5,0.5],[24.5,B4,0.5],[25,A4,2],
  // Repeat main theme
  [28,E5,0.5],[28.5,Ds5,0.5],[29,E5,0.5],[29.5,Ds5,0.5],[30,E5,0.5],[30.5,B4,0.5],[31,D5,0.5],[31.5,C5,0.5],
  [32,A4,1],[33,C4,0.5],[33.5,E4,0.5],[34,A4,0.5],[34.5,B4,1],
  [35.5,E4,0.5],[36,Gs4,0.5],[36.5,B4,0.5],[37,C5,1],
  [38,E4,0.5],[38.5,E5,0.5],[39,Ds5,0.5],[39.5,E5,0.5],[40,Ds5,0.5],[40.5,E5,0.5],[41,B4,0.5],[41.5,D5,0.5],[42,C5,0.5],[42.5,A4,2],
]);

// ─── 5. Comptine d'un autre été (Amélie Theme) ───────────────────────────────
const amelieNotes = mkNotes(85, [
  // Right hand melody
  [0,E4],[1,G4],[2,A4],[3,B4],[4,E4],[5,G4],[6,A4],[7,B4],
  [8,C5],[9,B4],[10,A4],[9,B4],[11,A4],[12,G4],[13,E4],[14,D4],[15,E4,1.5],
  [17,E4],[18,G4],[19,A4],[20,B4],[21,E4],[22,G4],[23,A4],[24,B4],
  [25,C5],[26,B4],[27,A4],[28,G4],[29,E4],[30,D4],[31,C4,2],
  [33,G3],[34,A3],[35,B3],[36,C4],[37,D4],[38,E4],[39,D4],[40,C4,2],
  [42,G3],[43,A3],[44,B3],[45,C4],[46,D4],[47,E4],[48,G4],[49,A4,2],
  [51,G4],[52,E4],[53,D4],[54,C4],[55,D4],[56,E4,2],[59,A3,4],
]);

// ─── 6. Lean On Me ───────────────────────────────────────────────────────────
const leanOnMeNotes = mkNotes(72, [
  [0,C4],[1,E4],[2,F4],[3,G4],[4,G4],[5,F4],[6,E4],[7,C4],
  [8,C4],[9,E4],[10,F4],[11,G4],[12,A4],[11,G4],[12,F4],[13,E4],[14,C4,2],
  [16,D4],[17,F4],[18,G4],[19,A4],[20,A4],[19,G4],[20,F4],[21,D4,2],
  [24,C4],[25,E4],[26,F4],[27,G4],[28,G4],[27,F4],[28,E4],[29,C4],
  [30,D4],[31,E4],[32,F4],[33,G4],[34,A4,2],[37,G4],[38,F4],[39,E4],[40,C4,4],
]);

// ─── 7. Bohemian Rhapsody (Intro) ────────────────────────────────────────────
// Bb = As4 (70), Eb = Ds4 (63), F4=65, G4=67, Ab = Gs4 (68)
const bohemianNotes = mkNotes(72, [
  // "Is this the real life?"
  [0,As4],[1,As4],[2,G4],[3,F4],[4,G4],[5,F4],[6,Ds4,2],
  [8,As3,1],[9,C4],[10,Ds4],[11,F4],[12,As4,2],
  [14,G4],[15,F4],[16,Ds4,2],[18,F4,2],[20,G4,4],
  // "Is this just fantasy?"
  [24,As4],[25,As4],[26,G4],[27,F4],[28,G4],[29,F4],[30,Ds4,2],
  [32,C4],[33,D4],[34,Ds4],[35,F4],[36,G4,2],[38,As4,2],[40,C5,4],
  // "Caught in a landslide..."
  [44,C5],[45,As4],[46,Gs4],[47,G4],[48,F4,2],[50,Ds4],[51,F4],[52,G4,2],
  [54,As4,1],[55,C5,1],[56,Ds5,2],[58,As4,2],[60,G4,4],
]);

// ─── 8. Clocks (Coldplay) Riff ───────────────────────────────────────────────
// Eb riff: Ds4=63, Gs4=68, Ds5=75 - transposed to playable range
const clocksNotes = mkNotes(130, [
  // Main riff repeated (3 notes pattern: E4-B4-G4 style, adapted)
  [0,E4,0.5],[0.5,B4,0.5],[1,G4,0.5],[1.5,E4,0.5],[2,B4,0.5],[2.5,G4,0.5],[3,E4,0.5],[3.5,B4,0.5],
  [4,E4,0.5],[4.5,B4,0.5],[5,G4,0.5],[5.5,E4,0.5],[6,B4,0.5],[6.5,G4,0.5],[7,E4,0.5],[7.5,B4,0.5],
  [8,F4,0.5],[8.5,C5,0.5],[9,A4,0.5],[9.5,F4,0.5],[10,C5,0.5],[10.5,A4,0.5],[11,F4,0.5],[11.5,C5,0.5],
  [12,F4,0.5],[12.5,C5,0.5],[13,A4,0.5],[13.5,F4,0.5],[14,C5,0.5],[14.5,A4,0.5],[15,F4,0.5],[15.5,C5,0.5],
  [16,D4,0.5],[16.5,A4,0.5],[17,F4,0.5],[17.5,D4,0.5],[18,A4,0.5],[18.5,F4,0.5],[19,D4,0.5],[19.5,A4,0.5],
  [20,D4,0.5],[20.5,A4,0.5],[21,F4,0.5],[21.5,D4,0.5],[22,A4,0.5],[22.5,F4,0.5],[23,D4,0.5],[23.5,A4,0.5],
  [24,E4,0.5],[24.5,B4,0.5],[25,G4,0.5],[25.5,E4,0.5],[26,B4,0.5],[26.5,G4,0.5],[27,E4,0.5],[27.5,B4,0.5],
  [28,E4,0.5],[28.5,B4,0.5],[29,G4,0.5],[29.5,E4,0.5],[30,B4,0.5],[30.5,G4,0.5],[31,E4,1],
]);

// ─── 9. Take On Me (Synth Riff) ──────────────────────────────────────────────
// A-Dur: A4=69, B4=71, Cs5=73, D5=74, E5=76 → transposed down: A3, B3, Cs4, D4, E4
const takeOnMeNotes = mkNotes(140, [
  [0,Fs4,0.5],[0.5,Fs4,0.5],[1,D4,0.5],[1.5,B3,0.5],[2,B3,0.5],[2.5,E4,0.5],[3,E4,0.5],[3.5,E4,0.5],
  [4,Gs4,0.5],[4.5,Gs4,0.5],[5,A4,0.5],[5.5,B4,0.5],[6,A4,0.5],[6.5,A4,0.5],[7,A4,0.5],[7.5,E4,0.5],
  [8,D4,0.5],[8.5,D4,0.5],[9,A4,0.5],[9.5,A4,0.5],[10,B4,0.5],[10.5,B4,0.5],[11,D4,0.5],[11.5,D4,0.5],
  [12,Fs4,0.5],[12.5,Fs4,0.5],[13,D4,0.5],[13.5,B3,0.5],[14,B3,0.5],[14.5,E4,0.5],[15,E4,0.5],[15.5,E4,0.5],
  [16,Gs4,0.5],[16.5,Gs4,0.5],[17,A4,0.5],[17.5,B4,0.5],[18,A4,0.5],[18.5,A4,0.5],[19,A4,0.5],[19.5,E4,0.5],
  [20,D4,0.5],[20.5,D4,0.5],[21,A4,0.5],[21.5,A4,0.5],[22,B4,0.5],[22.5,B4,0.5],[23,D4,2],
  [25,Fs4,0.5],[25.5,Fs4,0.5],[26,Fs4,0.5],[26.5,D4,0.5],[27,D4,0.5],[27.5,D4,0.5],[28,D4,0.5],[28.5,Fs4,0.5],
  [29,Fs4,0.5],[29.5,Fs4,0.5],[30,Fs4,0.5],[30.5,D4,0.5],[31,D4,2],
]);

// ─── 10. Axel F (Beverly Hills Cop Theme) ────────────────────────────────────
const axelFNotes = mkNotes(122, [
  [0,F4,0.5],[1,As4,0.5],[1.5,C5,0.5],[2,F4,0.5],[2.5,As4,0.5],[3,C5,0.5],[3.5,F4,0.5],
  [4,F4,0.5],[4.5,C5,0.5],[5,F4,0.5],[5.5,E4,0.5],
  [6,F4,0.5],[7,A4,0.5],[7.5,C5,0.5],[8,F4,0.5],[8.5,A4,0.5],[9,C5,0.5],[9.5,F4,0.5],
  [10,F4,0.5],[10.5,C5,0.5],[11,As4,0.5],[11.5,A4,0.5],
  [12,F4,0.5],[13,As4,0.5],[13.5,C5,0.5],[14,F4,0.5],[14.5,As4,0.5],[15,C5,0.5],[15.5,F5,0.5],
  [16,Ds5,0.5],[16.5,C5,0.5],[17,As4,0.5],[17.5,A4,0.5],[18,F4,0.5],[18.5,A4,0.5],[19,C5,0.5],[19.5,As4,0.5],
  [20,A4,0.5],[20.5,F4,0.5],[21,G4,0.5],[22,C5,0.5],[22.5,As4,0.5],[23,A4,0.5],[24,F4,4],
]);

// ─── 11. We Will Rock You (Pads) ─────────────────────────────────────────────
const weWillRockNotes: NoteEvent[] = (() => {
  const bpm = 82;
  const beat = 60 / bpm;
  const pattern: [number, number][] = [];
  // Boom Boom Clap pattern, 8 bars
  for (let bar = 0; bar < 8; bar++) {
    const b = bar * 4;
    pattern.push([b, KICK], [b + 1, KICK], [b + 2, SNARE]);
  }
  return pattern.map(([b, note]) => ({
    time: b * beat,
    note,
    duration: 0.1,
    velocity: note === SNARE ? 110 : 100,
    source: 'pad' as const,
  }));
})();

// ─── 12. Billie Jean Beat (Pads) ─────────────────────────────────────────────
const billieJeanNotes: NoteEvent[] = (() => {
  const bpm = 117;
  const beat = 60 / bpm;
  const eighth = 0.5;
  // Kick on 1, 3; Snare on 2, 4; HH on every 8th; cowbell on offbeats
  const pattern: [number, number, number][] = [];
  for (let bar = 0; bar < 8; bar++) {
    const b = bar * 4;
    // HiHats on every 8th
    for (let e = 0; e < 8; e++) {
      pattern.push([b + e * eighth, HH_CLOSED, 0.08]);
    }
    // Kicks
    pattern.push([b, KICK, 0.1]);
    pattern.push([b + 2, KICK, 0.1]);
    // Snares
    pattern.push([b + 1, SNARE, 0.1]);
    pattern.push([b + 3, SNARE, 0.1]);
    // Accent kick
    pattern.push([b + 0.5, KICK, 0.1]);
  }
  return pattern.map(([b, note, dur]) => ({
    time: b * beat,
    note,
    duration: dur,
    velocity: note === SNARE ? 110 : note === KICK ? 100 : 70,
    source: 'pad' as const,
  })).sort((a, b) => a.time - b.time);
})();

// ─── 13. Basic Rock Beat (Pads) ──────────────────────────────────────────────
const basicRockNotes: NoteEvent[] = (() => {
  const bpm = 90;
  const beat = 60 / bpm;
  const eighth = 0.5;
  const pattern: [number, number, number][] = [];
  for (let bar = 0; bar < 8; bar++) {
    const b = bar * 4;
    // HiHat every 8th
    for (let e = 0; e < 8; e++) {
      pattern.push([b + e * eighth, HH_CLOSED, 0.08]);
    }
    pattern.push([b, KICK, 0.1]);
    pattern.push([b + 2, KICK, 0.1]);
    pattern.push([b + 1, SNARE, 0.1]);
    pattern.push([b + 3, SNARE, 0.1]);
    // open HH on beat 4
    pattern.push([b + 3.5, HH_OPEN, 0.15]);
  }
  return pattern.map(([b, note, dur]) => ({
    time: b * beat,
    note,
    duration: dur,
    velocity: note === SNARE ? 100 : note === KICK ? 95 : 65,
    source: 'pad' as const,
  })).sort((a, b) => a.time - b.time);
})();

// ─── Song Catalog ─────────────────────────────────────────────────────────────

export const BUILTIN_SONGS: Song[] = [
  {
    id: 'builtin-01',
    title: 'Twinkle Twinkle Little Star',
    artist: 'Traditional',
    difficulty: 'beginner',
    bpm: 90,
    duration: 32,
    keySignature: 'C',
    mode: 'keyboard',
    notes: twinkleNotes,
    previewStart: 0,
    isBuiltin: true,
  },
  {
    id: 'builtin-02',
    title: 'Ode an die Freude',
    artist: 'L. v. Beethoven',
    difficulty: 'beginner',
    bpm: 100,
    duration: 38,
    keySignature: 'C',
    mode: 'keyboard',
    notes: odeNotes,
    previewStart: 0,
    isBuiltin: true,
  },
  {
    id: 'builtin-03',
    title: 'Happy Birthday',
    artist: 'Traditional',
    difficulty: 'beginner',
    bpm: 90,
    duration: 18,
    keySignature: 'C',
    mode: 'keyboard',
    notes: happyBdayNotes,
    previewStart: 0,
    isBuiltin: true,
  },
  {
    id: 'builtin-04',
    title: 'Für Elise',
    artist: 'L. v. Beethoven',
    difficulty: 'intermediate',
    bpm: 130,
    duration: 32,
    keySignature: 'Am',
    mode: 'keyboard',
    notes: furEliseNotes,
    previewStart: 0,
    isBuiltin: true,
  },
  {
    id: 'builtin-05',
    title: 'Comptine d\'un autre été',
    artist: 'Yann Tiersen',
    difficulty: 'intermediate',
    bpm: 85,
    duration: 44,
    keySignature: 'Em',
    mode: 'keyboard',
    notes: amelieNotes,
    previewStart: 0,
    isBuiltin: true,
  },
  {
    id: 'builtin-06',
    title: 'Lean On Me',
    artist: 'Bill Withers',
    difficulty: 'intermediate',
    bpm: 72,
    duration: 35,
    keySignature: 'C',
    mode: 'keyboard',
    notes: leanOnMeNotes,
    previewStart: 0,
    isBuiltin: true,
  },
  {
    id: 'builtin-07',
    title: 'Bohemian Rhapsody (Intro)',
    artist: 'Queen',
    difficulty: 'advanced',
    bpm: 72,
    duration: 42,
    keySignature: 'Bb',
    mode: 'keyboard',
    notes: bohemianNotes,
    previewStart: 0,
    isBuiltin: true,
  },
  {
    id: 'builtin-08',
    title: 'Clocks (Riff)',
    artist: 'Coldplay',
    difficulty: 'advanced',
    bpm: 130,
    duration: 30,
    keySignature: 'Eb',
    mode: 'keyboard',
    notes: clocksNotes,
    previewStart: 0,
    isBuiltin: true,
  },
  {
    id: 'builtin-09',
    title: 'Take On Me (Synth Riff)',
    artist: 'a-ha',
    difficulty: 'advanced',
    bpm: 140,
    duration: 28,
    keySignature: 'A',
    mode: 'keyboard',
    notes: takeOnMeNotes,
    previewStart: 0,
    isBuiltin: true,
  },
  {
    id: 'builtin-10',
    title: 'Axel F',
    artist: 'Harold Faltermeyer',
    difficulty: 'intermediate',
    bpm: 122,
    duration: 22,
    keySignature: 'F',
    mode: 'keyboard',
    notes: axelFNotes,
    previewStart: 0,
    isBuiltin: true,
  },
  {
    id: 'builtin-11',
    title: 'We Will Rock You',
    artist: 'Queen',
    difficulty: 'beginner',
    bpm: 82,
    duration: 24,
    keySignature: '',
    mode: 'pads',
    notes: weWillRockNotes,
    previewStart: 0,
    isBuiltin: true,
  },
  {
    id: 'builtin-12',
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    difficulty: 'intermediate',
    bpm: 117,
    duration: 22,
    keySignature: '',
    mode: 'pads',
    notes: billieJeanNotes,
    previewStart: 0,
    isBuiltin: true,
  },
  {
    id: 'builtin-13',
    title: 'Basic Rock Beat',
    artist: 'Drum Exercise',
    difficulty: 'beginner',
    bpm: 90,
    duration: 22,
    keySignature: '',
    mode: 'pads',
    notes: basicRockNotes,
    previewStart: 0,
    isBuiltin: true,
  },
];

export function getSongById(id: string): Song | undefined {
  return BUILTIN_SONGS.find((s) => s.id === id);
}
