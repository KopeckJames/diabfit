import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as HealthKitService from '../services/healthKitService';
import { BloodGlucoseSample, HealthActivitySummary, HealthWorkoutSample, HealthStepSample, HealthHeartRateSample } from 'react-native-health';

interface HealthData {
  bloodGlucose: BloodGlucoseSample[];
  steps: HealthStepSample[];
  activity: HealthActivitySummary[];
  workouts: HealthWorkoutSample[];
  heartRate: HealthHeartRateSample[];
  weight: number | null;
  height: number | null;
}

interface HealthKitHook {
  isAvailable: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  healthData: HealthData;
  initHealthKit: () => Promise<void>;
  refreshHealthData: () => Promise<void>;
  saveBloodGlucose: (value: number, date?: Date) => Promise<void>;
  saveWorkout: (type: string, startDate: Date, endDate: Date, energyBurned: number, distance: number) => Promise<void>;
  saveWeight: (value: number, date?: Date) => Promise<void>;
  saveHeight: (value: number, date?: Date) => Promise<void>;
}

export const useHealthKit = (): HealthKitHook => {
  const [isAvailable] = useState(Platform.OS === 'ios');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<HealthData>({
    bloodGlucose: [],
    steps: [],
    activity: [],
    workouts: [],
    heartRate: [],
    weight: null,
    height: null,
  });

  const initHealthKit = async (): Promise<void> => {
    if (!isAvailable) {
      setError('HealthKit is only available on iOS');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await HealthKitService.initHealthKit();
      setIsInitialized(true);
      await refreshHealthData();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshHealthData = async (): Promise<void> => {
    if (!isAvailable || !isInitialized) {
      console.log('HealthKit not available or not initialized');
      return;
    }

    console.log('Refreshing health data...');
    setIsLoading(true);
    setError(null);

    try {
      // Fetch step count first to ensure it's properly loaded
      console.log('Fetching step count...');
      const steps = await HealthKitService.getStepCount();
      console.log(`Fetched ${steps.length} step records`);

      // Fetch other health data in parallel
      const [
        bloodGlucose,
        activity,
        workouts,
        heartRate,
        weightData,
        heightData,
      ] = await Promise.all([
        HealthKitService.getBloodGlucose(),
        HealthKitService.getActivitySummary(),
        HealthKitService.getWorkouts(),
        HealthKitService.getHeartRate(),
        HealthKitService.getWeight().catch(() => ({ value: null })),
        HealthKitService.getHeight().catch(() => ({ value: null })),
      ]);

      console.log('All health data fetched successfully');

      setHealthData({
        bloodGlucose,
        steps,
        activity,
        workouts,
        heartRate,
        weight: weightData.value,
        height: heightData.value,
      });
    } catch (err) {
      console.error('Error refreshing health data:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const saveBloodGlucose = async (value: number, date: Date = new Date()): Promise<void> => {
    if (!isAvailable || !isInitialized) {
      setError('HealthKit is not initialized');
      return;
    }

    setError(null);

    try {
      await HealthKitService.saveBloodGlucose(value, date);
      // Refresh blood glucose data
      const bloodGlucose = await HealthKitService.getBloodGlucose();
      setHealthData(prev => ({ ...prev, bloodGlucose }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    }
  };

  const saveWorkout = async (
    type: string,
    startDate: Date,
    endDate: Date,
    energyBurned: number,
    distance: number
  ): Promise<void> => {
    if (!isAvailable || !isInitialized) {
      setError('HealthKit is not initialized');
      return;
    }

    setError(null);

    try {
      await HealthKitService.saveWorkout(type, startDate, endDate, energyBurned, distance);
      // Refresh workout data
      const workouts = await HealthKitService.getWorkouts();
      setHealthData(prev => ({ ...prev, workouts }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    }
  };

  const saveWeight = async (value: number, date: Date = new Date()): Promise<void> => {
    if (!isAvailable || !isInitialized) {
      setError('HealthKit is not initialized');
      return;
    }

    setError(null);

    try {
      await HealthKitService.saveWeight(value, date);
      // Refresh weight data
      const weightData = await HealthKitService.getWeight();
      setHealthData(prev => ({ ...prev, weight: weightData.value }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    }
  };

  const saveHeight = async (value: number, date: Date = new Date()): Promise<void> => {
    if (!isAvailable || !isInitialized) {
      setError('HealthKit is not initialized');
      return;
    }

    setError(null);

    try {
      await HealthKitService.saveHeight(value, date);
      // Refresh height data
      const heightData = await HealthKitService.getHeight();
      setHealthData(prev => ({ ...prev, height: heightData.value }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    }
  };

  return {
    isAvailable,
    isInitialized,
    isLoading,
    error,
    healthData,
    initHealthKit,
    refreshHealthData,
    saveBloodGlucose,
    saveWorkout,
    saveWeight,
    saveHeight,
  };
};
