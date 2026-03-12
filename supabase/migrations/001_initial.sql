-- Users profile (extends Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    total_play_time INTEGER DEFAULT 0,
    total_notes_hit INTEGER DEFAULT 0,
    favorite_instrument TEXT DEFAULT 'piano'
);

-- Songs (built-in + imported)
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    artist TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    bpm INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    key_signature TEXT,
    mode TEXT NOT NULL CHECK (mode IN ('keyboard', 'pads', 'mixed')),
    is_builtin BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES profiles(id),
    midi_file_path TEXT,
    note_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_public BOOLEAN DEFAULT FALSE
);

-- Scores
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    max_combo INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    grade TEXT NOT NULL,
    perfect_count INTEGER NOT NULL,
    great_count INTEGER NOT NULL,
    good_count INTEGER NOT NULL,
    miss_count INTEGER NOT NULL,
    instrument TEXT NOT NULL,
    played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_scores_song_score ON scores(song_id, score DESC);
CREATE INDEX idx_scores_user ON scores(user_id, played_at DESC);
CREATE INDEX idx_songs_difficulty ON songs(difficulty);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Scores viewable by all" ON scores FOR SELECT USING (true);
CREATE POLICY "Users can insert own scores" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Builtin songs viewable" ON songs FOR SELECT USING (is_builtin = true OR uploaded_by = auth.uid() OR is_public = true);
CREATE POLICY "Users can insert songs" ON songs FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Storage bucket for MIDI files
INSERT INTO storage.buckets (id, name, public) VALUES ('midi-files', 'midi-files', false);
CREATE POLICY "Users can upload midi files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'midi-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can read own midi files" ON storage.objects FOR SELECT USING (bucket_id = 'midi-files' AND auth.uid()::text = (storage.foldername(name))[1]);
