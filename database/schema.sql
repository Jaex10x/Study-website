-- Create table for storing study sets
CREATE TABLE IF NOT EXISTS study_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    set_name TEXT DEFAULT 'My Study Set',
    cards JSONB NOT NULL DEFAULT '[]'::jsonb,
    score INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_study_sets_user_id ON study_sets(user_id);

-- Enable Row Level Security
ALTER TABLE study_sets ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_sets' AND policyname = 'Users can view their own study sets') THEN
        CREATE POLICY "Users can view their own study sets" ON study_sets
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_sets' AND policyname = 'Users can insert their own study sets') THEN
        CREATE POLICY "Users can insert their own study sets" ON study_sets
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_sets' AND policyname = 'Users can update their own study sets') THEN
        CREATE POLICY "Users can update their own study sets" ON study_sets
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_sets' AND policyname = 'Users can delete their own study sets') THEN
        CREATE POLICY "Users can delete their own study sets" ON study_sets
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_study_sets_updated_at ON study_sets;
CREATE TRIGGER update_study_sets_updated_at
    BEFORE UPDATE ON study_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();