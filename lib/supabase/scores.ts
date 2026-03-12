import { createClient } from './client';
import type { ScoreEntry, GameScore, LeaderboardEntry } from '@/types';

export interface SubmitScoreParams {
  userId: string;
  songId: string;
  score: GameScore;
  instrument: string;
}

export async function submitScore(params: SubmitScoreParams): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('scores').insert({
    user_id: params.userId,
    song_id: params.songId,
    score: params.score.score,
    max_combo: params.score.maxCombo,
    accuracy: params.score.accuracy,
    grade: params.score.grade,
    perfect_count: params.score.perfectCount,
    great_count: params.score.greatCount,
    good_count: params.score.goodCount,
    miss_count: params.score.missCount,
    instrument: params.instrument,
  });
  if (error) throw error;
}

export async function getTopScores(
  songId: string,
  limit = 10
): Promise<LeaderboardEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('scores')
    .select('*, profiles(username, display_name)')
    .eq('song_id', songId)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data as ScoreEntry[]).map((entry, idx) => ({
    rank: idx + 1,
    userId: entry.user_id,
    username: entry.profiles?.username ?? 'Unknown',
    score: entry.score,
    accuracy: entry.accuracy,
    grade: entry.grade,
    instrument: entry.instrument,
    playedAt: entry.played_at,
  }));
}

export async function getUserBestScore(
  userId: string,
  songId: string
): Promise<ScoreEntry | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .eq('song_id', songId)
    .order('score', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as ScoreEntry;
}

export async function getUserRecentScores(
  userId: string,
  limit = 20
): Promise<ScoreEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data as ScoreEntry[];
}
