// Mock data for glucose readings
export const glucoseReadings = [
  { time: '00:00', value: 120 },
  { time: '03:00', value: 115 },
  { time: '06:00', value: 130 },
  { time: '09:00', value: 145 },
  { time: '12:00', value: 110 },
  { time: '15:00', value: 125 },
  { time: '18:00', value: 140 },
  { time: '21:00', value: 135 },
];

// Mock data for weekly glucose averages
export const weeklyGlucoseAverages = [
  { day: 'Mon', value: 125 },
  { day: 'Tue', value: 130 },
  { day: 'Wed', value: 120 },
  { day: 'Thu', value: 135 },
  { day: 'Fri', value: 128 },
  { day: 'Sat', value: 122 },
  { day: 'Sun', value: 126 },
];

// Mock data for workout plans
export const workoutPlans = [
  {
    id: '1',
    title: 'Morning Cardio',
    description: 'A gentle cardio workout to start your day',
    duration: '20 min',
    intensity: 'Low',
    caloriesBurned: 150,
    exercises: [
      { name: 'Warm-up', duration: '5 min', description: 'Light stretching and jogging in place' },
      { name: 'Brisk Walking', duration: '10 min', description: 'Walk at a comfortable pace' },
      { name: 'Cool Down', duration: '5 min', description: 'Gentle stretching' },
    ],
    glucoseImpact: 'Minimal impact on blood sugar levels',
  },
  {
    id: '2',
    title: 'Strength Training',
    description: 'Build muscle and improve insulin sensitivity',
    duration: '30 min',
    intensity: 'Medium',
    caloriesBurned: 250,
    exercises: [
      { name: 'Warm-up', duration: '5 min', description: 'Dynamic stretching' },
      { name: 'Bodyweight Squats', duration: '5 min', description: '3 sets of 10 reps' },
      { name: 'Push-ups', duration: '5 min', description: '3 sets of 8 reps' },
      { name: 'Lunges', duration: '5 min', description: '3 sets of 10 reps per leg' },
      { name: 'Planks', duration: '5 min', description: '3 sets of 30 seconds' },
      { name: 'Cool Down', duration: '5 min', description: 'Static stretching' },
    ],
    glucoseImpact: 'May lower blood sugar for up to 24 hours after workout',
  },
  {
    id: '3',
    title: 'Evening Yoga',
    description: 'Reduce stress and improve flexibility',
    duration: '25 min',
    intensity: 'Low',
    caloriesBurned: 120,
    exercises: [
      { name: 'Breathing Exercise', duration: '5 min', description: 'Deep breathing and mindfulness' },
      { name: 'Sun Salutation', duration: '10 min', description: '5 repetitions' },
      { name: 'Standing Poses', duration: '5 min', description: 'Warrior I, II, and Triangle' },
      { name: 'Final Relaxation', duration: '5 min', description: 'Savasana' },
    ],
    glucoseImpact: 'Helps reduce stress hormones that can raise blood sugar',
  },
];

// Mock data for nutrition
export const nutritionItems = [
  {
    id: '1',
    name: 'Breakfast',
    time: '08:00',
    items: [
      { name: 'Oatmeal', carbs: 27, protein: 5, fat: 3, calories: 150 },
      { name: 'Blueberries', carbs: 21, protein: 1, fat: 0, calories: 85 },
      { name: 'Greek Yogurt', carbs: 6, protein: 15, fat: 0, calories: 100 },
    ],
    totalCarbs: 54,
    totalProtein: 21,
    totalFat: 3,
    totalCalories: 335,
    glucoseImpact: 'Medium rise, slow decline',
  },
  {
    id: '2',
    name: 'Lunch',
    time: '12:30',
    items: [
      { name: 'Grilled Chicken', carbs: 0, protein: 25, fat: 3, calories: 165 },
      { name: 'Brown Rice', carbs: 45, protein: 5, fat: 2, calories: 215 },
      { name: 'Steamed Broccoli', carbs: 6, protein: 2, fat: 0, calories: 55 },
    ],
    totalCarbs: 51,
    totalProtein: 32,
    totalFat: 5,
    totalCalories: 435,
    glucoseImpact: 'Moderate rise, steady decline',
  },
  {
    id: '3',
    name: 'Dinner',
    time: '18:00',
    items: [
      { name: 'Salmon', carbs: 0, protein: 22, fat: 13, calories: 206 },
      { name: 'Quinoa', carbs: 20, protein: 4, fat: 2, calories: 120 },
      { name: 'Roasted Vegetables', carbs: 15, protein: 2, fat: 5, calories: 120 },
    ],
    totalCarbs: 35,
    totalProtein: 28,
    totalFat: 20,
    totalCalories: 446,
    glucoseImpact: 'Minimal rise, steady levels',
  },
];

// Mock data for user profile
export const userProfile = {
  id: '1',
  name: 'John Doe',
  age: 45,
  weight: 180, // in lbs
  height: 70, // in inches
  diabetesType: 'Type 2',
  diagnosisYear: 2018,
  medications: [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
    { name: 'Glipizide', dosage: '5mg', frequency: 'Once daily' },
  ],
  a1c: 6.8,
  targetGlucoseRange: { min: 80, max: 140 },
  emergencyContact: {
    name: 'Jane Doe',
    relationship: 'Spouse',
    phone: '555-123-4567',
  },
};

// Mock data for achievements
export const achievements = [
  {
    id: '1',
    title: 'First Workout',
    description: 'Completed your first workout',
    date: '2023-01-15',
    icon: 'trophy',
  },
  {
    id: '2',
    title: 'Week Streak',
    description: 'Worked out for 7 consecutive days',
    date: '2023-01-22',
    icon: 'fire',
  },
  {
    id: '3',
    title: 'Glucose Master',
    description: 'Maintained glucose levels in target range for 5 days',
    date: '2023-01-25',
    icon: 'star',
  },
];
