import { storeData, getData, STORAGE_KEYS } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

// Workout interface
export interface Workout {
  id: string;
  userId: string;
  title: string;
  description: string;
  duration: number; // in minutes
  intensity: string;
  caloriesBurned: number;
  glucoseImpact: string;
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
}

// Workout Log interface
export interface WorkoutLog {
  id: string;
  userId: string;
  workoutId: string;
  workout?: Workout;
  completedAt: Date;
  duration: number;
  glucoseBefore?: number;
  glucoseAfter?: number;
  notes?: string;
  createdAt: Date;
}

// Workout functions
export const getWorkouts = async (
  type: 'all' | 'recommended' | 'favorites' = 'all'
): Promise<Workout[]> => {
  // Get current auth token
  const authToken = await getData(STORAGE_KEYS.AUTH_TOKEN);

  if (!authToken) return [];

  try {
    // Get workouts from storage
    const allWorkouts = await getData<Workout[]>(STORAGE_KEYS.WORKOUTS) || [];

    // Filter workouts by user ID
    let userWorkouts = allWorkouts.filter(workout => workout.userId === authToken.userId);

    // Filter by type if needed
    if (type === 'favorites') {
      userWorkouts = userWorkouts.filter(workout => workout.isFavorite);
    }

    // Sort by createdAt in descending order
    userWorkouts.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return userWorkouts;
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return [];
  }
};

export const getWorkout = async (id: string): Promise<Workout | null> => {
  try {
    // Get workouts from storage
    const allWorkouts = await getData<Workout[]>(STORAGE_KEYS.WORKOUTS) || [];

    // Find the workout with the given ID
    const workout = allWorkouts.find(workout => workout.id === id);

    return workout || null;
  } catch (error) {
    console.error('Error fetching workout:', error);
    return null;
  }
};

export const createWorkout = async (workoutData: Partial<Workout>): Promise<Workout | null> => {
  // Get current auth token
  const authToken = await getData(STORAGE_KEYS.AUTH_TOKEN);

  if (!authToken) return null;

  try {
    const now = new Date();

    // Create a new workout
    const newWorkout: Workout = {
      id: uuidv4(),
      userId: authToken.userId,
      title: workoutData.title || '',
      description: workoutData.description || '',
      duration: workoutData.duration || 0,
      intensity: workoutData.intensity || 'Medium',
      caloriesBurned: workoutData.caloriesBurned || 0,
      glucoseImpact: workoutData.glucoseImpact || '',
      isFavorite: workoutData.isFavorite || false,
      createdAt: now,
      updatedAt: now
    };

    // Get existing workouts
    const existingWorkouts = await getData<Workout[]>(STORAGE_KEYS.WORKOUTS) || [];

    // Add new workout
    await storeData(STORAGE_KEYS.WORKOUTS, [...existingWorkouts, newWorkout]);

    return newWorkout;
  } catch (error) {
    console.error('Error creating workout:', error);
    return null;
  }
};

export const updateWorkout = async (id: string, workoutData: Partial<Workout>): Promise<Workout | null> => {
  try {
    // Get all workouts
    const allWorkouts = await getData<Workout[]>(STORAGE_KEYS.WORKOUTS) || [];

    // Find the workout to update
    const workoutIndex = allWorkouts.findIndex(workout => workout.id === id);

    if (workoutIndex === -1) {
      return null;
    }

    // Get the existing workout
    const existingWorkout = allWorkouts[workoutIndex];

    // Remove id and userId from the update data
    const { id: _, userId: __, ...updateData } = workoutData;

    // Create the updated workout
    const updatedWorkout: Workout = {
      ...existingWorkout,
      ...updateData,
      updatedAt: new Date()
    };

    // Update the workout in the array
    allWorkouts[workoutIndex] = updatedWorkout;

    // Store the updated workouts
    await storeData(STORAGE_KEYS.WORKOUTS, allWorkouts);

    return updatedWorkout;
  } catch (error) {
    console.error('Error updating workout:', error);
    return null;
  }
};

export const deleteWorkout = async (id: string): Promise<boolean> => {
  try {
    // Get all workouts
    const allWorkouts = await getData<Workout[]>(STORAGE_KEYS.WORKOUTS) || [];

    // Filter out the workout to delete
    const updatedWorkouts = allWorkouts.filter(workout => workout.id !== id);

    // If the length is the same, the workout wasn't found
    if (updatedWorkouts.length === allWorkouts.length) {
      return false;
    }

    // Store the updated workouts
    await storeData(STORAGE_KEYS.WORKOUTS, updatedWorkouts);

    return true;
  } catch (error) {
    console.error('Error deleting workout:', error);
    return false;
  }
};

// Workout Log functions
export const getWorkoutLogs = async (limitCount: number = 10): Promise<WorkoutLog[]> => {
  // Get current auth token
  const authToken = await getData(STORAGE_KEYS.AUTH_TOKEN);

  if (!authToken) return [];

  try {
    // Get workout logs from storage
    const allLogs = await getData<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS) || [];

    // Filter logs by user ID
    const userLogs = allLogs.filter(log => log.userId === authToken.userId);

    // Sort by completedAt in descending order
    userLogs.sort((a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    // Get associated workouts
    for (const log of userLogs) {
      if (log.workoutId) {
        const workout = await getWorkout(log.workoutId);
        log.workout = workout || undefined;
      }
    }

    // Limit the number of logs
    return userLogs.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    return [];
  }
};

export const logWorkout = async (
  workoutId: string,
  duration: number,
  glucoseBefore?: number,
  glucoseAfter?: number,
  notes?: string
): Promise<WorkoutLog | null> => {
  // Get current auth token
  const authToken = await getData(STORAGE_KEYS.AUTH_TOKEN);

  if (!authToken) return null;

  try {
    const now = new Date();

    // Get the workout
    const workout = workoutId ? await getWorkout(workoutId) : null;

    // Create a new workout log
    const newLog: WorkoutLog = {
      id: uuidv4(),
      userId: authToken.userId,
      workoutId,
      workout: workout || undefined,
      completedAt: now,
      duration,
      glucoseBefore,
      glucoseAfter,
      notes,
      createdAt: now
    };

    // Get existing workout logs
    const existingLogs = await getData<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS) || [];

    // Add new workout log
    await storeData(STORAGE_KEYS.WORKOUT_LOGS, [...existingLogs, newLog]);

    return newLog;
  } catch (error) {
    console.error('Error logging workout:', error);
    return null;
  }
};

export const getWorkoutStats = async (): Promise<{
  totalWorkouts: number;
  totalDuration: number;
  averageDuration: number;
  completedThisWeek: number;
} | null> => {
  // Get current auth token
  const authToken = await getData(STORAGE_KEYS.AUTH_TOKEN);

  if (!authToken) return null;

  try {
    // Get all workout logs
    const allLogs = await getData<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS) || [];

    // Filter logs by user ID
    const userLogs = allLogs.filter(log => log.userId === authToken.userId);

    if (userLogs.length === 0) {
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        averageDuration: 0,
        completedThisWeek: 0
      };
    }

    // Calculate stats
    const totalWorkouts = userLogs.length;
    const totalDuration = userLogs.reduce((sum, log) => sum + log.duration, 0);
    const averageDuration = totalDuration / totalWorkouts;

    // Calculate workouts completed this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const completedThisWeek = userLogs.filter(log =>
      new Date(log.completedAt) >= startOfWeek
    ).length;

    return {
      totalWorkouts,
      totalDuration,
      averageDuration,
      completedThisWeek
    };
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    return null;
  }
};
