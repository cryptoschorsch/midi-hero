// ─── MIDI Types ──────────────────────────────────────────────────────────────

export interface MidiNoteEvent {
  type: 'noteOn' | 'noteOff';
  note: number;
  velocity: number;
  timestamp: number;
  channel: number;
  source: 'keyboard' | 'pad';
}

// ─── Game Types ───────────────────────────────────────────────────────────────

export type GameState = 'menu' | 'loading' | 'countdown' | 'playing' | 'paused' | 'results';

export type HitRating = 'perfect' | 'great' | 'good' | 'miss' | 'none';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type GameMode = 'keyboard' | 'pads' | 'mixed';

export type InstrumentType = 'piano' | 'electric-piano' | 'organ' | 'synth-lead' | 'strings';

export interface GameScore {
  score: number;
  combo: number;
  maxCombo: number;
  multiplier: number;
  perfectCount: number;
  greatCount: number;
  goodCount: number;
  missCount: number;
  accuracy: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
}

export interface HitEffect {
  id: string;
  x: number;
  y: number;
  rating: HitRating;
  timestamp: number;
  lane: number;
}

export interface GameSettings {
  audioLatencyOffset: number;   // ms
  inputLatencyOffset: number;   // ms
  scrollSpeed: number;          // pixels per second (default: 300)
  instrument: InstrumentType;
  masterVolume: number;         // 0-1
  midiDeviceId: string | null;
  octaveOffset: number;         // semitone offset from default 48
  practiceMode: boolean;
  practiceSpeed: number;        // 0.5, 0.75, 1.0
}

// ─── Song Types ───────────────────────────────────────────────────────────────

export interface NoteEvent {
  time: number;       // seconds from song start
  note: number;       // MIDI note number
  duration: number;   // seconds
  velocity: number;   // 0-127
  source: 'keyboard' | 'pad';
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: Difficulty;
  bpm: number;
  duration: number;
  keySignature: string;
  mode: GameMode;
  notes: NoteEvent[];
  previewStart: number;
  isBuiltin: boolean;
}

// ─── Active Note (on highway) ─────────────────────────────────────────────────

export interface ActiveNote {
  id: string;
  noteEvent: NoteEvent;
  lane: number;           // visual lane index
  y: number;             // current y position on canvas
  height: number;        // note block height
  width: number;         // lane width
  x: number;             // x position
  hit: boolean;
  missed: boolean;
  rating: HitRating;
}

// ─── Supabase Types ───────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  total_play_time: number;
  total_notes_hit: number;
  favorite_instrument: string;
}

export interface ScoreEntry {
  id: string;
  user_id: string;
  song_id: string;
  score: number;
  max_combo: number;
  accuracy: number;
  grade: string;
  perfect_count: number;
  great_count: number;
  good_count: number;
  miss_count: number;
  instrument: string;
  played_at: string;
  profiles?: { username: string; display_name: string | null };
}

// ─── Leaderboard Types ────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  accuracy: number;
  grade: string;
  instrument: string;
  playedAt: string;
}

// ─── MIDI Import Types ────────────────────────────────────────────────────────

export interface MidiTrackInfo {
  trackIndex: number;
  name: string;
  instrument: string;
  noteCount: number;
  noteRange: { min: number; max: number };
  channel: number;
}

export interface MidiImportConfig {
  keyboardTrackIndex: number | null;
  padTrackIndex: number | null;
  bpmOverride: number | null;
  songTitle: string;
  artist: string;
  quantize: '16th' | '8th' | 'none';
  transpose: number;
}

// ─── Difficulty Presets ───────────────────────────────────────────────────────

export interface DifficultyPreset {
  name: Difficulty;
  timingWindows: {
    perfect: number;  // ms
    great: number;
    good: number;
  };
  scrollSpeed: number;
  noteOpacity: number;
}
