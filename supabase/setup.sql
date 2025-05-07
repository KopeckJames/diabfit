-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  diabetes_type TEXT NOT NULL,
  diagnosis_year INTEGER NOT NULL,
  age INTEGER NOT NULL,
  weight INTEGER NOT NULL,
  height INTEGER NOT NULL,
  a1c DECIMAL(3, 1),
  target_glucose_min INTEGER NOT NULL DEFAULT 80,
  target_glucose_max INTEGER NOT NULL DEFAULT 140,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create glucose_readings table
CREATE TABLE IF NOT EXISTS glucose_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  intensity TEXT NOT NULL,
  calories_burned INTEGER NOT NULL,
  glucose_impact TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_logs table
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- actual duration in minutes
  notes TEXT,
  glucose_before INTEGER,
  glucose_after INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  carbs INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  fat INTEGER NOT NULL,
  calories INTEGER NOT NULL,
  glucose_impact TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  data_sharing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  dark_mode_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE glucose_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users table policies
CREATE POLICY "Users can view their own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Glucose readings policies
CREATE POLICY "Users can view their own glucose readings" 
  ON glucose_readings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own glucose readings" 
  ON glucose_readings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own glucose readings" 
  ON glucose_readings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own glucose readings" 
  ON glucose_readings FOR DELETE 
  USING (auth.uid() = user_id);

-- Workouts policies
CREATE POLICY "Users can view their own workouts" 
  ON workouts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts" 
  ON workouts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" 
  ON workouts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" 
  ON workouts FOR DELETE 
  USING (auth.uid() = user_id);

-- Create sample data for testing
-- Insert a test user (you'll need to create this user in Auth first)
-- INSERT INTO users (id, email, name, diabetes_type, diagnosis_year, age, weight, height, target_glucose_min, target_glucose_max)
-- VALUES ('YOUR_USER_ID', 'test@example.com', 'Test User', 'Type 2', 2020, 45, 180, 70, 80, 140);

-- Insert sample glucose readings
-- INSERT INTO glucose_readings (user_id, value, timestamp)
-- VALUES 
--   ('YOUR_USER_ID', 120, NOW() - INTERVAL '1 hour'),
--   ('YOUR_USER_ID', 110, NOW() - INTERVAL '3 hours'),
--   ('YOUR_USER_ID', 130, NOW() - INTERVAL '6 hours'),
--   ('YOUR_USER_ID', 125, NOW() - INTERVAL '9 hours'),
--   ('YOUR_USER_ID', 115, NOW() - INTERVAL '12 hours');

-- Insert sample workouts
-- INSERT INTO workouts (user_id, title, description, duration, intensity, calories_burned, glucose_impact)
-- VALUES
--   ('YOUR_USER_ID', 'Morning Cardio', 'A gentle cardio workout to start your day', 20, 'Low', 150, 'Minimal impact on blood sugar levels'),
--   ('YOUR_USER_ID', 'Strength Training', 'Build muscle and improve insulin sensitivity', 30, 'Medium', 250, 'May lower blood sugar for up to 24 hours after workout'),
--   ('YOUR_USER_ID', 'Evening Yoga', 'Reduce stress and improve flexibility', 25, 'Low', 120, 'Helps reduce stress hormones that can raise blood sugar');

-- Insert sample meals
-- INSERT INTO meals (user_id, name, timestamp, carbs, protein, fat, calories, glucose_impact)
-- VALUES
--   ('YOUR_USER_ID', 'Breakfast', NOW() - INTERVAL '8 hours', 30, 20, 15, 350, 'Medium'),
--   ('YOUR_USER_ID', 'Lunch', NOW() - INTERVAL '4 hours', 45, 25, 20, 450, 'Medium'),
--   ('YOUR_USER_ID', 'Dinner', NOW() - INTERVAL '1 hour', 35, 30, 15, 400, 'Low');
