import type { HitRating, GameScore } from '@/types';
import { SCORE_VALUES, getMultiplier } from './difficulty';
import type { DifficultyPreset } from '@/types';

export function getRating(
  deltaMs: number,
  preset: DifficultyPreset
): HitRating {
  const abs = Math.abs(deltaMs);
  if (abs <= preset.timingWindows.perfect) return 'perfect';
  if (abs <= preset.timingWindows.great)   return 'great';
  if (abs <= preset.timingWindows.good)    return 'good';
  return 'miss';
}

export function updateScore(
  current: GameScore,
  rating: HitRating
): GameScore {
  const next = { ...current };

  if (rating === 'miss' || rating === 'none') {
    if (rating === 'miss') {
      next.combo = 0;
      next.missCount++;
    }
  } else {
    next.combo++;
    next.maxCombo = Math.max(next.maxCombo, next.combo);
    next.multiplier = getMultiplier(next.combo);

    const base = (SCORE_VALUES as Record<string, number>)[rating] ?? 0;
    next.score += base * next.multiplier;

    if (rating === 'perfect') next.perfectCount++;
    else if (rating === 'great') next.greatCount++;
    else if (rating === 'good') next.goodCount++;
  }

  return next;
}

export function calculateAccuracy(score: GameScore): number {
  const total = score.perfectCount + score.greatCount + score.goodCount + score.missCount;
  if (total === 0) return 100;

  const weighted =
    score.perfectCount * 1.0 +
    score.greatCount   * 0.8 +
    score.goodCount    * 0.5 +
    score.missCount    * 0.0;

  return (weighted / total) * 100;
}

export function calculateGrade(accuracy: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (accuracy >= 95) return 'S';
  if (accuracy >= 90) return 'A';
  if (accuracy >= 80) return 'B';
  if (accuracy >= 70) return 'C';
  return 'D';
}

export function initialScore(): GameScore {
  return {
    score: 0,
    combo: 0,
    maxCombo: 0,
    multiplier: 1,
    perfectCount: 0,
    greatCount: 0,
    goodCount: 0,
    missCount: 0,
    accuracy: 100,
    grade: 'S',
  };
}

export function finalizeScore(score: GameScore): GameScore {
  const accuracy = calculateAccuracy(score);
  const grade = calculateGrade(accuracy);
  return { ...score, accuracy, grade };
}
