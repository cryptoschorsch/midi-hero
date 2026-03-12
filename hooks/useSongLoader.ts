'use client';

import { useState, useCallback } from 'react';
import type { Song } from '@/types';
import { BUILTIN_SONGS } from '@/lib/songs/builtinSongs';
import { createClient } from '@/lib/supabase/client';

export function useSongLoader() {
  const [songs, setSongs] = useState<Song[]>(BUILTIN_SONGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserSongs = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: dbError } = await supabase
        .from('songs')
        .select('*')
        .eq('uploaded_by', userId)
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      const userSongs: Song[] = (data ?? []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        title: row.title as string,
        artist: (row.artist as string) ?? '',
        difficulty: row.difficulty as Song['difficulty'],
        bpm: row.bpm as number,
        duration: row.duration as number,
        keySignature: (row.key_signature as string) ?? 'C',
        mode: row.mode as Song['mode'],
        notes: row.note_data as Song['notes'],
        previewStart: 0,
        isBuiltin: false,
      }));

      setSongs([...BUILTIN_SONGS, ...userSongs]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load songs');
    } finally {
      setLoading(false);
    }
  }, []);

  const getSongById = useCallback(
    (id: string) => songs.find((s) => s.id === id),
    [songs]
  );

  return { songs, loading, error, loadUserSongs, getSongById };
}
