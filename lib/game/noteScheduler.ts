import type { NoteEvent, ActiveNote } from '@/types';
import {
  MPK_MINI_KEYBOARD_BASE,
  MPK_MINI_KEYBOARD_RANGE,
  getPadLane,
  getKeyboardLane,
  getLaneColor,
  isWhiteKey,
  countWhiteKeys,
} from '@/lib/midi/midiMapping';

export interface HighwayConfig {
  canvasWidth: number;
  canvasHeight: number;
  hitZoneY: number;        // y of the hit zone line
  keyboardAreaHeight: number;
  numKeyboardLanes: number;
  numPadLanes: number;
  scrollSpeed: number;     // px/s
  baseNote: number;        // MIDI note of leftmost keyboard key
}

let noteIdCounter = 0;

export function buildActiveNote(
  noteEvent: NoteEvent,
  config: HighwayConfig,
  songTimeS: number
): ActiveNote {
  const id = `note-${noteIdCounter++}`;
  const { canvasWidth, canvasHeight, hitZoneY, scrollSpeed, baseNote } = config;
  const totalWhiteKeys = countWhiteKeys(baseNote, MPK_MINI_KEYBOARD_RANGE);

  let lane: number;
  let x: number;
  let width: number;

  if (noteEvent.source === 'keyboard') {
    lane = getKeyboardLane(noteEvent.note, baseNote);
    const laneWidth = canvasWidth / config.numKeyboardLanes;
    x = lane * laneWidth;
    width = laneWidth;
  } else {
    lane = getPadLane(noteEvent.note);
    const padAreaWidth = canvasWidth * 0.4; // right 40% for pads
    const laneWidth = padAreaWidth / config.numPadLanes;
    x = canvasWidth * 0.6 + lane * laneWidth;
    width = laneWidth;
  }

  // Y: notes spawn above the canvas (negative y)
  // time until note should be at hitZoneY = noteEvent.time - songTimeS
  const timeUntilHit = noteEvent.time - songTimeS;
  const distanceFromHit = timeUntilHit * scrollSpeed;
  const y = hitZoneY - distanceFromHit;

  // Note height proportional to duration
  const minHeight = 12;
  const height = Math.max(minHeight, noteEvent.duration * scrollSpeed);

  return {
    id,
    noteEvent,
    lane,
    y,
    height,
    width: width - 2, // small gap between lanes
    x: x + 1,
    hit: false,
    missed: false,
    rating: 'none',
  };
}

export function updateNotePosition(
  note: ActiveNote,
  deltaSeconds: number,
  scrollSpeed: number
): ActiveNote {
  return { ...note, y: note.y + deltaSeconds * scrollSpeed };
}

export function isNoteVisible(note: ActiveNote, canvasHeight: number): boolean {
  return note.y - note.height < canvasHeight && note.y > -200;
}

export function hasNotePassed(note: ActiveNote, hitZoneY: number, goodWindowMs: number, scrollSpeed: number): boolean {
  // Note has passed if its top is more than "good window" below hitZoneY
  const passedDistance = (goodWindowMs / 1000) * scrollSpeed;
  return note.y - note.height > hitZoneY + passedDistance;
}

// Build lane x positions for keyboard visual at bottom
export function getKeyboardLanePositions(
  canvasWidth: number,
  numLanes: number
): { x: number; width: number; laneIndex: number }[] {
  const laneWidth = canvasWidth / numLanes;
  return Array.from({ length: numLanes }, (_, i) => ({
    x: i * laneWidth,
    width: laneWidth - 1,
    laneIndex: i,
  }));
}

export function getPadLanePositions(
  canvasWidth: number,
  numPadLanes: number
): { x: number; width: number; laneIndex: number }[] {
  const padAreaWidth = canvasWidth * 0.4;
  const laneWidth = padAreaWidth / numPadLanes;
  return Array.from({ length: numPadLanes }, (_, i) => ({
    x: canvasWidth * 0.6 + i * laneWidth,
    width: laneWidth - 1,
    laneIndex: i,
  }));
}
