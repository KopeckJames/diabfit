// This file is renamed to storage.ts to reflect its new purpose
// We'll use AsyncStorage for local data persistence

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  USER: 'user',
  GLUCOSE_READINGS: 'glucose_readings',
  USER_SETTINGS: 'user_settings',
  AUTH_TOKEN: 'auth_token',
  MEALS: 'meals',
  WORKOUTS: 'workouts',
  WORKOUT_LOGS: 'workout_logs'
};

// Helper function to store data
export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
  }
};

// Helper function to retrieve data
export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    return null;
  }
};

// Helper function to remove data
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
  }
};

// Helper function to clear all data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};
