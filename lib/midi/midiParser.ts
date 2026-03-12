import { Midi } from '@tonejs/midi';
import type { NoteEvent, MidiTrackInfo, MidiImportConfig, Song } from '@/types';
import { PAD_NOTE_NUMBERS } from './midiMapping';

export interface ParsedMidiFile {
  tracks: MidiTrackInfo[];
  bpm: number;
  duration: number;
  rawMidi: Midi;
}

export async function parseMidiFile(file: File): Promise<ParsedMidiFile> {
  const buffer = await file.arrayBuffer();
  const midi = new Midi(buffer);

  const tracks: MidiTrackInfo[] = midi.tracks
    .filter((t) => t.notes.length > 0)
    .map((track, idx) => {
      const notes = track.notes;
      const noteMidis = notes.map((n) => n.midi);
      return {
        trackIndex: idx,
        name: track.name || `Track ${idx + 1}`,
        instrument: track.instrument?.name ?? 'Unknown',
        noteCount: notes.length,
        noteRange: {
          min: Math.min(...noteMidis),
          max: Math.max(...noteMidis),
        },
        channel: track.channel ?? 0,
      };
    });

  const bpm = midi.header.tempos[0]?.bpm ?? 120;
  const duration = midi.duration;

  return { tracks, bpm, duration, rawMidi: midi };
}

export function buildSongFromMidi(
  parsed: ParsedMidiFile,
  config: MidiImportConfig,
  userId: string
): Omit<Song, 'id'> {
  const { rawMidi, bpm: detectedBpm } = parsed;
  const bpm = config.bpmOverride ?? detectedBpm;
  const speedFactor = bpm / detectedBpm;

  const notes: NoteEvent[] = [];

  // Keyboard track
  if (config.keyboardTrackIndex !== null) {
    const track = rawMidi.tracks[config.keyboardTrackIndex];
    if (track) {
      for (const note of track.notes) {
        let midiNote = note.midi + config.transpose;
        // Clamp to keyboard range 0–127
        while (midiNote < 21) midiNote += 12;
        while (midiNote > 108) midiNote -= 12;

        let time = note.time / speedFactor;
        let duration = note.duration / speedFactor;

        if (config.quantize !== 'none') {
          const beat = 60 / bpm;
          const grid = config.quantize === '16th' ? beat / 4 : beat / 2;
          time = Math.round(time / grid) * grid;
          duration = Math.max(grid, Math.round(duration / grid) * grid);
        }

        notes.push({
          time,
          note: midiNote,
          duration,
          velocity: note.velocity * 127,
          source: 'keyboard',
        });
      }
    }
  }

  // Pad track
  if (config.padTrackIndex !== null) {
    const track = rawMidi.tracks[config.padTrackIndex];
    if (track) {
      for (const note of track.notes) {
        // Map to valid pad notes
        const padNote = PAD_NOTE_NUMBERS[note.midi % PAD_NOTE_NUMBERS.length];
        const time = note.time / speedFactor;

        notes.push({
          time,
          note: padNote,
          duration: 0.1,
          velocity: note.velocity * 127,
          source: 'pad',
        });
      }
    }
  }

  // Sort by time
  notes.sort((a, b) => a.time - b.time);

  const duration = notes.length > 0
    ? notes[notes.length - 1].time + notes[notes.length - 1].duration
    : parsed.duration;

  const hasKeyboard = notes.some((n) => n.source === 'keyboard');
  const hasPads = notes.some((n) => n.source === 'pad');
  const mode = hasKeyboard && hasPads ? 'mixed' : hasPads ? 'pads' : 'keyboard';

  return {
    title: config.songTitle,
    artist: config.artist,
    difficulty: estimateDifficulty(notes, bpm),
    bpm,
    duration: Math.ceil(duration),
    keySignature: 'C',
    mode,
    notes,
    previewStart: 0,
    isBuiltin: false,
  };
}

function estimateDifficulty(notes: NoteEvent[], bpm: number): 'beginner' | 'intermediate' | 'advanced' {
  const notesPerSecond = notes.length / (notes[notes.length - 1]?.time ?? 60);
  if (notesPerSecond < 2 && bpm < 100) return 'beginner';
  if (notesPerSecond < 4 && bpm < 150) return 'intermediate';
  return 'advanced';
}
