export interface User {
  id: string;
  email: string;
  name: string;
  diabetesType: 'Type 1' | 'Type 2' | 'Gestational' | 'Other';
  diagnosisYear: number;
  age: number;
  weight: number; // in lbs
  height: number; // in inches
  a1c?: number;
  targetGlucoseMin: number;
  targetGlucoseMax: number;
  created_at: string;
  updated_at: string;
}

export interface GlucoseReading {
  id: string;
  user_id: string;
  value: number; // in mg/dL
  timestamp: string;
  notes?: string;
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  intensity: 'Low' | 'Medium' | 'High';
  caloriesBurned: number;
  glucoseImpact: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_id: string;
  completed_at: string;
  duration: number; // actual duration in minutes
  notes?: string;
  glucose_before?: number;
  glucose_after?: number;
  created_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  timestamp: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
  glucose_impact: 'Low' | 'Medium' | 'High';
  notes?: string;
  created_at: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  notifications_enabled: boolean;
  data_sharing_enabled: boolean;
  dark_mode_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  icon: string;
  achieved_at: string;
  created_at: string;
}
