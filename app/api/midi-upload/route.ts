import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function createSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const songData = formData.get('songData') as string | null;

    if (!file || !songData) {
      return NextResponse.json({ error: 'Missing file or song data' }, { status: 400 });
    }

    const song = JSON.parse(songData);

    // Upload MIDI file to Supabase Storage
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('midi-files')
      .upload(filePath, fileBuffer, {
        contentType: 'audio/midi',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Save song metadata to DB
    const { data: savedSong, error: dbError } = await supabase
      .from('songs')
      .insert({
        title: song.title,
        artist: song.artist,
        difficulty: song.difficulty,
        bpm: song.bpm,
        duration: song.duration,
        key_signature: song.keySignature,
        mode: song.mode,
        is_builtin: false,
        uploaded_by: user.id,
        midi_file_path: filePath,
        note_data: song.notes,
        is_public: false,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, song: savedSong });
  } catch (err) {
    console.error('POST /api/midi-upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
