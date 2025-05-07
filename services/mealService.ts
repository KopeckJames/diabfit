// No need for Firebase imports
import { storeData, getData, STORAGE_KEYS } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

// Meal interface
export interface Meal {
  id: string;
  userId: string;
  name: string;
  timestamp: Date;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
  glucoseImpact: string;
  notes?: string;
  createdAt: Date;
}

export const getMeals = async (
  limitCount: number = 10,
  timeFrame: 'day' | 'week' | 'month' = 'day'
): Promise<Meal[]> => {
  // Get current auth token
  const authToken = await getData(STORAGE_KEYS.AUTH_TOKEN);

  if (!authToken) return [];

  // Calculate the start date based on the time frame
  const now = new Date();
  let startDate = new Date();

  if (timeFrame === 'day') {
    startDate.setDate(now.getDate() - 1);
  } else if (timeFrame === 'week') {
    startDate.setDate(now.getDate() - 7);
  } else if (timeFrame === 'month') {
    startDate.setMonth(now.getMonth() - 1);
  }

  try {
    // Get meals from storage
    const allMeals = await getData<Meal[]>(STORAGE_KEYS.MEALS) || [];

    // Filter meals by user ID and time frame
    const userMeals = allMeals.filter(meal =>
      meal.userId === authToken.userId &&
      new Date(meal.timestamp) >= startDate
    );

    // Sort by timestamp in descending order
    userMeals.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Limit the number of meals
    return userMeals.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching meals:', error);
    return [];
  }
};

export const getLatestMeal = async (): Promise<Meal | null> => {
  // Get current auth token
  const authToken = await getData(STORAGE_KEYS.AUTH_TOKEN);

  if (!authToken) return null;

  try {
    // Get all meals
    const allMeals = await getData<Meal[]>(STORAGE_KEYS.MEALS) || [];

    // Filter meals by user ID
    const userMeals = allMeals.filter(meal => meal.userId === authToken.userId);

    if (userMeals.length === 0) {
      return null;
    }

    // Sort by timestamp in descending order
    userMeals.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Return the most recent meal
    return userMeals[0];
  } catch (error) {
    console.error('Error fetching latest meal:', error);
    return null;
  }
};

export const addMeal = async (mealData: Partial<Meal>): Promise<Meal | null> => {
  // Get current auth token
  const authToken = await getData(STORAGE_KEYS.AUTH_TOKEN);

  if (!authToken) return null;

  try {
    const now = new Date();

    // Create a new meal
    const newMeal: Meal = {
      id: uuidv4(),
      userId: authToken.userId,
      name: mealData.name || '',
      timestamp: mealData.timestamp || now,
      carbs: mealData.carbs || 0,
      protein: mealData.protein || 0,
      fat: mealData.fat || 0,
      calories: mealData.calories || 0,
      glucoseImpact: mealData.glucoseImpact || 'Medium',
      notes: mealData.notes || '',
      createdAt: now
    };

    // Get existing meals
    const existingMeals = await getData<Meal[]>(STORAGE_KEYS.MEALS) || [];

    // Add new meal
    await storeData(STORAGE_KEYS.MEALS, [...existingMeals, newMeal]);

    return newMeal;
  } catch (error) {
    console.error('Error adding meal:', error);
    return null;
  }
};

export const updateMeal = async (id: string, mealData: Partial<Meal>): Promise<Meal | null> => {
  try {
    // Get all meals
    const allMeals = await getData<Meal[]>(STORAGE_KEYS.MEALS) || [];

    // Find the meal to update
    const mealIndex = allMeals.findIndex(meal => meal.id === id);

    if (mealIndex === -1) {
      return null;
    }

    // Get the existing meal
    const existingMeal = allMeals[mealIndex];

    // Remove id, userId, and createdAt from the update data
    const { id: _, userId: __, createdAt: ___, ...updateData } = mealData;

    // Create the updated meal
    const updatedMeal: Meal = {
      ...existingMeal,
      ...updateData,
      updatedAt: new Date()
    };

    // Update the meal in the array
    allMeals[mealIndex] = updatedMeal;

    // Store the updated meals
    await storeData(STORAGE_KEYS.MEALS, allMeals);

    return updatedMeal;
  } catch (error) {
    console.error('Error updating meal:', error);
    return null;
  }
};

export const deleteMeal = async (id: string): Promise<boolean> => {
  try {
    // Get all meals
    const allMeals = await getData<Meal[]>(STORAGE_KEYS.MEALS) || [];

    // Filter out the meal to delete
    const updatedMeals = allMeals.filter(meal => meal.id !== id);

    // If the length is the same, the meal wasn't found
    if (updatedMeals.length === allMeals.length) {
      return false;
    }

    // Store the updated meals
    await storeData(STORAGE_KEYS.MEALS, updatedMeals);

    return true;
  } catch (error) {
    console.error('Error deleting meal:', error);
    return false;
  }
};

export const getMealStats = async (
  timeFrame: 'day' | 'week' | 'month' = 'day'
): Promise<{
  totalMeals: number;
  averageCarbs: number;
  averageCalories: number;
  highImpactMeals: number;
} | null> => {
  const meals = await getMeals(100, timeFrame);

  if (meals.length === 0) {
    return {
      totalMeals: 0,
      averageCarbs: 0,
      averageCalories: 0,
      highImpactMeals: 0
    };
  }

  const totalMeals = meals.length;
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const highImpactMeals = meals.filter(meal => meal.glucoseImpact === 'High').length;

  return {
    totalMeals,
    averageCarbs: totalCarbs / totalMeals,
    averageCalories: totalCalories / totalMeals,
    highImpactMeals
  };
};
