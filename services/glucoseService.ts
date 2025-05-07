import { storeData, getData, STORAGE_KEYS } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

export interface GlucoseReading {
  id: string;
  userId: string;
  value: number;
  timestamp: Date;
  notes?: string;
  createdAt: Date;
}

export const getGlucoseReadings = async (
  timeFrame: 'day' | 'week' | 'month' = 'day',
  limitCount: number = 100
): Promise<GlucoseReading[]> => {
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
    // Get readings from storage
    const allReadings = await getData<GlucoseReading[]>(STORAGE_KEYS.GLUCOSE_READINGS) || [];

    // Filter readings by user ID and time frame
    const userReadings = allReadings.filter(reading =>
      reading.userId === authToken.userId &&
      new Date(reading.timestamp) >= startDate
    );

    // Sort by timestamp in descending order
    userReadings.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Limit the number of readings
    return userReadings.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching glucose readings:', error);
    return [];
  }
};

export const getLatestGlucoseReading = async (): Promise<GlucoseReading | null> => {
  // Get current auth token
  const authToken = await getData(STORAGE_KEYS.AUTH_TOKEN);

  if (!authToken) return null;

  try {
    // Get all readings
    const allReadings = await getData<GlucoseReading[]>(STORAGE_KEYS.GLUCOSE_READINGS) || [];

    // Filter readings by user ID
    const userReadings = allReadings.filter(reading => reading.userId === authToken.userId);

    if (userReadings.length === 0) {
      return null;
    }

    // Sort by timestamp in descending order
    userReadings.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Return the most recent reading
    return userReadings[0];
  } catch (error) {
    console.error('Error fetching latest glucose reading:', error);
    return null;
  }
};

export const addGlucoseReading = async (
  value: number,
  notes?: string
): Promise<GlucoseReading | null> => {
  // Get current auth token
  const authToken = await getData(STORAGE_KEYS.AUTH_TOKEN);

  if (!authToken) return null;

  try {
    const now = new Date();

    // Create a new reading
    const newReading: GlucoseReading = {
      id: uuidv4(),
      userId: authToken.userId,
      value,
      timestamp: now,
      notes: notes || '',
      createdAt: now
    };

    // Get existing readings
    const existingReadings = await getData<GlucoseReading[]>(STORAGE_KEYS.GLUCOSE_READINGS) || [];

    // Add new reading
    await storeData(STORAGE_KEYS.GLUCOSE_READINGS, [...existingReadings, newReading]);

    return newReading;
  } catch (error) {
    console.error('Error adding glucose reading:', error);
    return null;
  }
};

export const getGlucoseStatistics = async (
  timeFrame: 'day' | 'week' | 'month' = 'day'
): Promise<{
  min: number;
  max: number;
  avg: number;
  timeInRange: number;
  count: number;
} | null> => {
  const readings = await getGlucoseReadings(timeFrame);

  if (readings.length === 0) {
    return null;
  }

  const values = readings.map(reading => reading.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

  // Get user's target range from storage
  const authToken = await getData(STORAGE_KEYS.AUTH_TOKEN);
  let targetMin = 80;
  let targetMax = 140;

  if (authToken) {
    const users = await getData<any[]>(STORAGE_KEYS.USER) || [];
    const currentUser = users.find(user => user.id === authToken.userId);

    if (currentUser) {
      targetMin = currentUser.targetGlucoseMin || targetMin;
      targetMax = currentUser.targetGlucoseMax || targetMax;
    }
  }

  const inRange = values.filter(val => val >= targetMin && val <= targetMax).length;
  const timeInRange = (inRange / values.length) * 100;

  return {
    min,
    max,
    avg,
    timeInRange,
    count: values.length
  };
};
