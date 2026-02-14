CREATE TABLE study_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  cards JSONB NOT NULL, 
  created_at TIMESTAMP DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false
);

CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  study_set_id UUID REFERENCES study_sets(id),
  progress JSONB NOT NULL,  
  updated_at TIMESTAMP DEFAULT NOW()
);