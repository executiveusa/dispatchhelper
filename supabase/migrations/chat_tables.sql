
-- Create a table for storing chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_processed BOOLEAN DEFAULT FALSE
);

-- Create an index for faster queries by user_id
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON chat_messages(user_id);

-- Set up Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_messages
CREATE POLICY "Users can view their own messages"
  ON chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a view for admins to see all messages
CREATE OR REPLACE VIEW admin_chat_messages AS
  SELECT cm.*, u.email
  FROM chat_messages cm
  LEFT JOIN auth.users u ON cm.user_id = u.id;

-- Create a table for storing voice data
CREATE TABLE IF NOT EXISTS voice_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT,
  transcription TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security for voice_transcriptions
ALTER TABLE voice_transcriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for voice_transcriptions
CREATE POLICY "Users can view their own voice transcriptions"
  ON voice_transcriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice transcriptions"
  ON voice_transcriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
