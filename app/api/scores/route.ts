import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { updateLeaderboard, getSongTopScores } from '@/lib/redis/leaderboard';
import type { LeaderboardEntry } from '@/types';

async function createSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );
}

// GET /api/scores?songId=xxx&limit=10
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const songId = searchParams.get('songId');
  const limit = Math.min(Number(searchParams.get('limit') ?? 10), 100);

  if (!songId) {
    return NextResponse.json({ error: 'songId required' }, { status: 400 });
  }

  try {
    // Try Redis first
    const redisEntries = await getSongTopScores(songId, limit);

    if (redisEntries.length > 0) {
      // Enrich with usernames from Supabase
      const supabase = await createSupabase();
      const userIds = redisEntries.map((e) => e.userId);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .in('id', userIds);

      const profileMap = new Map(
        (profiles ?? []).map((p: { id: string; username: string; display_name: string | null }) => [p.id, p])
      );

      const enriched: LeaderboardEntry[] = redisEntries.map((e) => {
        const profile = profileMap.get(e.userId);
        return {
          rank: e.rank,
          userId: e.userId,
          username: profile?.username ?? 'Unknown',
          score: e.score,
          accuracy: 0,
          grade: '?',
          instrument: '',
          playedAt: '',
        };
      });
      return NextResponse.json(enriched);
    }

    // Fallback: Supabase
    const supabase = await createSupabase();
    const { data, error } = await supabase
      .from('scores')
      .select('*, profiles(username, display_name)')
      .eq('song_id', songId)
      .order('score', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const entries: LeaderboardEntry[] = (data ?? []).map((row: Record<string, unknown>, idx: number) => ({
      rank: idx + 1,
      userId: row.user_id as string,
      username: (row.profiles as { username: string } | null)?.username ?? 'Unknown',
      score: row.score as number,
      accuracy: row.accuracy as number,
      grade: row.grade as string,
      instrument: row.instrument as string,
      playedAt: row.played_at as string,
    }));

    return NextResponse.json(entries);
  } catch (err) {
    console.error('GET /api/scores error:', err);
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/scores
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { songId, score, maxCombo, accuracy, grade, perfectCount, greatCount, goodCount, missCount, instrument } = body;

    const supabase = await createSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Save to Supabase
    const { error } = await supabase.from('scores').insert({
      user_id: user.id,
      song_id: songId,
      score,
      max_combo: maxCombo,
      accuracy,
      grade,
      perfect_count: perfectCount,
      great_count: greatCount,
      good_count: goodCount,
      miss_count: missCount,
      instrument,
    });

    if (error) throw error;

    // Update Redis leaderboard
    await updateLeaderboard(songId, user.id, score, score);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/scores error:', err);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }
}
