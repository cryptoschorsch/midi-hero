import type { DifficultyPreset, Difficulty } from '@/types';

export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultyPreset> = {
  beginner: {
    name: 'beginner',
    timingWindows: {
      perfect: 100,  // ms – sehr grosszügig für Einsteiger
      great: 200,
      good: 350,
    },
    scrollSpeed: 150,  // deutlich langsamer
    noteOpacity: 1.0,
  },
  intermediate: {
    name: 'intermediate',
    timingWindows: {
      perfect: 40,
      great: 80,
      good: 130,
    },
    scrollSpeed: 280,
    noteOpacity: 1.0,
  },
  advanced: {
    name: 'advanced',
    timingWindows: {
      perfect: 30,
      great: 60,
      good: 100,
    },
    scrollSpeed: 360,
    noteOpacity: 1.0,
  },
};

export function getPreset(difficulty: Difficulty): DifficultyPreset {
  return DIFFICULTY_PRESETS[difficulty];
}

export const SCORE_VALUES = {
  perfect: 300,
  great: 200,
  good: 100,
  miss: 0,
} as const;

export const COMBO_MULTIPLIER_THRESHOLDS = [
  { combo: 50, multiplier: 4 },
  { combo: 25, multiplier: 3 },
  { combo: 10, multiplier: 2 },
  { combo: 0,  multiplier: 1 },
];

export function getMultiplier(combo: number): number {
  for (const { combo: threshold, multiplier } of COMBO_MULTIPLIER_THRESHOLDS) {
    if (combo >= threshold) return multiplier;
  }
  return 1;
}
