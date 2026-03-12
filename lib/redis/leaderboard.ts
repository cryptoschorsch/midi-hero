import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export function songLeaderboardKey(songId: string): string {
  return `leaderboard:${songId}`;
}

export function globalLeaderboardKey(): string {
  return 'leaderboard:global';
}

export function dailyLeaderboardKey(): string {
  const date = new Date().toISOString().split('T')[0];
  return `leaderboard:daily:${date}`;
}

export async function updateLeaderboard(
  songId: string,
  userId: string,
  score: number,
  totalScore: number
): Promise<void> {
  const member = `${userId}:${Date.now()}`;

  // Song leaderboard – only keep best score per user
  const existing = await redis.zscore(songLeaderboardKey(songId), userId);
  if (!existing || Number(existing) < score) {
    // Remove old entry (if any) and add new
    await redis.zrem(songLeaderboardKey(songId), userId);
    await redis.zadd(songLeaderboardKey(songId), { score, member: userId });
  }

  // Global leaderboard
  const globalExisting = await redis.zscore(globalLeaderboardKey(), userId);
  const newGlobal = (Number(globalExisting) || 0) + score;
  await redis.zadd(globalLeaderboardKey(), { score: newGlobal, member: userId });

  // Daily leaderboard (TTL 48h)
  await redis.zadd(dailyLeaderboardKey(), { score, member });
  await redis.expire(dailyLeaderboardKey(), 48 * 60 * 60);
}

export async function getSongTopScores(
  songId: string,
  limit = 10
): Promise<Array<{ userId: string; score: number; rank: number }>> {
  const results = await redis.zrange(
    songLeaderboardKey(songId),
    0,
    limit - 1,
    { rev: true, withScores: true }
  );

  const entries: Array<{ userId: string; score: number; rank: number }> = [];
  for (let i = 0; i < results.length; i += 2) {
    entries.push({
      userId: results[i] as string,
      score: Number(results[i + 1]),
      rank: Math.floor(i / 2) + 1,
    });
  }
  return entries;
}

export async function getGlobalTopScores(
  limit = 10
): Promise<Array<{ userId: string; score: number; rank: number }>> {
  const results = await redis.zrange(
    globalLeaderboardKey(),
    0,
    limit - 1,
    { rev: true, withScores: true }
  );

  const entries: Array<{ userId: string; score: number; rank: number }> = [];
  for (let i = 0; i < results.length; i += 2) {
    entries.push({
      userId: results[i] as string,
      score: Number(results[i + 1]),
      rank: Math.floor(i / 2) + 1,
    });
  }
  return entries;
}
