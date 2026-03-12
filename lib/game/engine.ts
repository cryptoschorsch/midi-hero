import type { NoteEvent, ActiveNote, GameScore, HitRating, MidiNoteEvent, GameSettings } from '@/types';
import { buildActiveNote, updateNotePosition, isNoteVisible, hasNotePassed, type HighwayConfig } from './noteScheduler';
import { getRating, updateScore, initialScore, finalizeScore } from './scoring';
import { DIFFICULTY_PRESETS } from './difficulty';
import type { DifficultyPreset, Difficulty } from '@/types';
import {
  getPadLane,
  getKeyboardLane,
  MPK_MINI_KEYBOARD_BASE,
  MPK_MINI_KEYBOARD_RANGE,
} from '@/lib/midi/midiMapping';

export interface GameEngineState {
  activeNotes: ActiveNote[];
  score: GameScore;
  songTimeS: number;
  isPlaying: boolean;
  hitEffects: HitEffect[];
}

export interface HitEffect {
  id: string;
  x: number;
  y: number;
  rating: HitRating;
  timestamp: number;
  lane: number;
  color: string;
}

export interface EngineCallbacks {
  onHit?: (note: ActiveNote, rating: HitRating) => void;
  onMiss?: (note: ActiveNote) => void;
  onSongEnd?: (score: GameScore) => void;
  playSound?: (note: number, velocity: number, duration: number, source: 'keyboard' | 'pad') => void;
}

export class GameEngine {
  private rafId: number | null = null;
  private lastTimestamp: number | null = null;
  private songTimeS = 0;
  private allNotes: NoteEvent[] = [];
  private scheduledIndex = 0;
  private activeNotes: ActiveNote[] = [];
  private score: GameScore = initialScore();
  private hitEffects: HitEffect[] = [];
  private config: HighwayConfig;
  private preset: DifficultyPreset;
  private callbacks: EngineCallbacks;
  private practiceSpeed: number;
  private isRunning = false;
  private pendingMidiEvents: MidiNoteEvent[] = [];
  private baseNote: number;

  constructor(
    config: HighwayConfig,
    difficulty: Difficulty,
    callbacks: EngineCallbacks,
    practiceSpeed = 1.0,
    baseNote = MPK_MINI_KEYBOARD_BASE
  ) {
    this.config = config;
    this.preset = DIFFICULTY_PRESETS[difficulty];
    this.callbacks = callbacks;
    this.practiceSpeed = practiceSpeed;
    this.baseNote = baseNote;
  }

  loadSong(notes: NoteEvent[]): void {
    this.allNotes = [...notes].sort((a, b) => a.time - b.time);
    this.scheduledIndex = 0;
    this.activeNotes = [];
    this.score = initialScore();
    this.hitEffects = [];
    this.songTimeS = 0;
  }

  start(): void {
    this.isRunning = true;
    this.lastTimestamp = null;
    this.rafId = requestAnimationFrame(this.tick.bind(this));
  }

  pause(): void {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTimestamp = null;
      this.rafId = requestAnimationFrame(this.tick.bind(this));
    }
  }

  stop(): void {
    this.pause();
    const final = finalizeScore(this.score);
    this.callbacks.onSongEnd?.(final);
  }

  handleMidiInput(event: MidiNoteEvent): void {
    if (event.type === 'noteOn') {
      this.pendingMidiEvents.push(event);
    }
  }

  getState(): GameEngineState {
    return {
      activeNotes: [...this.activeNotes],
      score: { ...this.score },
      songTimeS: this.songTimeS,
      isPlaying: this.isRunning,
      hitEffects: [...this.hitEffects],
    };
  }

  updateConfig(config: Partial<HighwayConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private tick(timestamp: number): void {
    if (!this.isRunning) return;

    const delta = this.lastTimestamp ? (timestamp - this.lastTimestamp) / 1000 : 0;
    this.lastTimestamp = timestamp;

    const adjustedDelta = delta * this.practiceSpeed;
    this.songTimeS += adjustedDelta;

    // Schedule new notes that should enter the visible area
    // Look-ahead: notes that will reach the hit zone within (canvasHeight / scrollSpeed) + buffer
    const lookAhead = this.config.canvasHeight / this.config.scrollSpeed + 2;
    while (
      this.scheduledIndex < this.allNotes.length &&
      this.allNotes[this.scheduledIndex].time <= this.songTimeS + lookAhead
    ) {
      const note = this.allNotes[this.scheduledIndex];
      const active = buildActiveNote(note, this.config, this.songTimeS);
      this.activeNotes.push(active);
      this.scheduledIndex++;
    }

    // Process MIDI events (hit detection)
    const midiEvents = [...this.pendingMidiEvents];
    this.pendingMidiEvents = [];
    for (const midiEvent of midiEvents) {
      this.processMidiHit(midiEvent);
    }

    // Update note positions
    this.activeNotes = this.activeNotes.map((note) =>
      updateNotePosition(note, adjustedDelta, this.config.scrollSpeed)
    );

    // Check for missed notes
    const goodWindow = this.preset.timingWindows.good;
    for (const note of this.activeNotes) {
      if (!note.hit && !note.missed && hasNotePassed(note, this.config.hitZoneY, goodWindow, this.config.scrollSpeed)) {
        note.missed = true;
        note.rating = 'miss';
        this.score = updateScore(this.score, 'miss');
        this.callbacks.onMiss?.(note);
      }
    }

    // Remove notes that are fully off-screen below
    this.activeNotes = this.activeNotes.filter(
      (n) => n.y < this.config.canvasHeight + 50
    );

    // Remove old hit effects
    const now = performance.now();
    this.hitEffects = this.hitEffects.filter((e) => now - e.timestamp < 600);

    // Check song end
    if (this.scheduledIndex >= this.allNotes.length && this.activeNotes.length === 0) {
      this.stop();
      return;
    }

    this.rafId = requestAnimationFrame(this.tick.bind(this));
  }

  private processMidiHit(midiEvent: MidiNoteEvent): void {
    const { note, velocity, source, timestamp } = midiEvent;

    // Find the closest pending note for this lane
    const matchingNotes = this.activeNotes.filter(
      (n) =>
        !n.hit &&
        !n.missed &&
        n.noteEvent.note === note &&
        n.noteEvent.source === source
    );

    if (matchingNotes.length === 0) {
      // Wrong note or no note expected – play muted feedback
      return;
    }

    // Find the note closest to the hit zone
    const hitZoneY = this.config.hitZoneY;
    const closest = matchingNotes.reduce((best, n) => {
      const distCur = Math.abs(n.y - hitZoneY);
      const distBest = Math.abs(best.y - hitZoneY);
      return distCur < distBest ? n : best;
    });

    // Calculate timing delta
    const expectedTimeS = closest.noteEvent.time;
    const actualTimeS = this.songTimeS;
    const deltaMs = (actualTimeS - expectedTimeS) * 1000;

    const rating = getRating(deltaMs, this.preset);

    if (rating === 'miss') return; // Too early, wait

    closest.hit = true;
    closest.rating = rating;
    this.score = updateScore(this.score, rating);

    // Play sound
    this.callbacks.playSound?.(note, velocity, closest.noteEvent.duration, source);

    // Hit effect
    this.hitEffects.push({
      id: `effect-${Date.now()}-${Math.random()}`,
      x: closest.x + closest.width / 2,
      y: this.config.hitZoneY,
      rating,
      timestamp: performance.now(),
      lane: closest.lane,
      color: getRatingColor(rating),
    });

    this.callbacks.onHit?.(closest, rating);
  }
}

export function getRatingColor(rating: HitRating): string {
  switch (rating) {
    case 'perfect': return '#00ffff';
    case 'great':   return '#00ff88';
    case 'good':    return '#ffff00';
    case 'miss':    return '#ff3333';
    default:        return '#ffffff';
  }
}
