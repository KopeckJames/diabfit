import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
  HealthUnit,
  HealthValue,
  BloodGlucoseSample,
  HealthActivitySummary,
  HealthWorkoutSample,
  HealthStepSample,
  HealthHeartRateSample,
  HealthWeightSample,
  HealthBodyMassIndexSample,
  HealthBodyFatPercentageSample,
  HealthBodyTemperatureSample,
  HealthBloodPressureSample,
  HealthOxygenSaturationSample,
  HealthRespiratoryRateSample,
  HealthSleepSample,
  HealthWaterSample,
  HealthCarbsSample,
  HealthProteinSample,
  HealthFatSample,
  HealthFoodSample,
} from 'react-native-health';
import { Platform } from 'react-native';
import { storeData, getData, STORAGE_KEYS } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

// Define the permissions we need
const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.BloodGlucose,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.Weight,
      AppleHealthKit.Constants.Permissions.BodyMassIndex,
      AppleHealthKit.Constants.Permissions.BodyFatPercentage,
      AppleHealthKit.Constants.Permissions.Height,
      AppleHealthKit.Constants.Permissions.BodyTemperature,
      AppleHealthKit.Constants.Permissions.BloodPressureDiastolic,
      AppleHealthKit.Constants.Permissions.BloodPressureSystolic,
      AppleHealthKit.Constants.Permissions.OxygenSaturation,
      AppleHealthKit.Constants.Permissions.RespiratoryRate,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.WaterIntake,
      AppleHealthKit.Constants.Permissions.Carbohydrates,
      AppleHealthKit.Constants.Permissions.Protein,
      AppleHealthKit.Constants.Permissions.TotalFat,
      AppleHealthKit.Constants.Permissions.ActivitySummary,
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.AppleExerciseTime,
      AppleHealthKit.Constants.Permissions.AppleStandTime,
      AppleHealthKit.Constants.Permissions.BasalEnergyBurned,
      AppleHealthKit.Constants.Permissions.FlightsClimbed,
      AppleHealthKit.Constants.Permissions.MindfulSession,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.BloodGlucose,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.Weight,
      AppleHealthKit.Constants.Permissions.BodyMassIndex,
      AppleHealthKit.Constants.Permissions.BodyFatPercentage,
      AppleHealthKit.Constants.Permissions.Height,
      AppleHealthKit.Constants.Permissions.BodyTemperature,
      AppleHealthKit.Constants.Permissions.BloodPressureDiastolic,
      AppleHealthKit.Constants.Permissions.BloodPressureSystolic,
      AppleHealthKit.Constants.Permissions.OxygenSaturation,
      AppleHealthKit.Constants.Permissions.RespiratoryRate,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.WaterIntake,
      AppleHealthKit.Constants.Permissions.Carbohydrates,
      AppleHealthKit.Constants.Permissions.Protein,
      AppleHealthKit.Constants.Permissions.TotalFat,
      AppleHealthKit.Constants.Permissions.Workout,
    ],
  },
} as HealthKitPermissions;

// Initialize HealthKit
export const initHealthKit = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'ios') {
      console.error('HealthKit is only available on iOS');
      reject('HealthKit is only available on iOS');
      return;
    }

    console.log('Initializing HealthKit with permissions:', JSON.stringify(permissions));

    AppleHealthKit.isAvailable((error: string, available: boolean) => {
      if (error) {
        console.error('Error checking HealthKit availability:', error);
        reject(error);
        return;
      }

      if (!available) {
        console.error('HealthKit is not available on this device');
        reject('HealthKit is not available on this device');
        return;
      }

      console.log('HealthKit is available, requesting permissions...');

      AppleHealthKit.initHealthKit(permissions, (initError: string) => {
        if (initError) {
          console.error('Error initializing HealthKit:', initError);
          reject(initError);
          return;
        }

        console.log('HealthKit initialized successfully');

        // Check if we have permission for steps
        AppleHealthKit.getAuthStatus(
          { permissions: { read: [AppleHealthKit.Constants.Permissions.Steps] } },
          (authError: string, authResult: { [key: string]: boolean }) => {
            if (authError) {
              console.warn('Error checking step count permission:', authError);
            } else {
              console.log('Step count permission status:', JSON.stringify(authResult));
            }

            // Resolve regardless of auth status check
            resolve();
          }
        );
      });
    });
  });
};

// Get blood glucose readings
export const getBloodGlucose = (
  options: HealthInputOptions = { startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString() }
): Promise<BloodGlucoseSample[]> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'ios') {
      reject('HealthKit is only available on iOS');
      return;
    }

    AppleHealthKit.getBloodGlucoseSamples(options, (error: string, results: BloodGlucoseSample[]) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
};

// Save blood glucose reading
export const saveBloodGlucose = (
  value: number,
  date: Date = new Date(),
  unit: HealthUnit = 'mg/dL'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'ios') {
      reject('HealthKit is only available on iOS');
      return;
    }

    const options = {
      value,
      date: date.toISOString(),
      unit,
    };

    AppleHealthKit.saveBloodGlucose(options, (error: string) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

// Get step count
export const getStepCount = (
  options: HealthInputOptions = { startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString() }
): Promise<HealthStepSample[]> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'ios') {
      reject('HealthKit is only available on iOS');
      return;
    }

    console.log('Fetching step count data with options:', options);

    // Make sure we're getting today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const enhancedOptions = {
      startDate: today.toISOString(), // Start from beginning of today
      endDate: new Date().toISOString(), // End at current time
    };

    console.log('Enhanced options for step count:', enhancedOptions);

    // First try to get daily step count samples
    AppleHealthKit.getDailyStepCountSamples(enhancedOptions, (error: string, results: HealthStepSample[]) => {
      if (error) {
        console.error('Error fetching daily step count:', error);

        // If daily step count fails, try getting the step count directly
        console.log('Trying alternative step count method...');
        AppleHealthKit.getStepCount(enhancedOptions, (altError: string, altResult: HealthValue) => {
          if (altError) {
            console.error('Error fetching alternative step count:', altError);
            reject(altError);
            return;
          }

          console.log('Alternative step count result:', JSON.stringify(altResult));
          // Convert to the same format as getDailyStepCountSamples
          const formattedResult: HealthStepSample[] = [{
            startDate: today.toISOString(),
            endDate: new Date().toISOString(),
            value: altResult.value,
            id: 'step-count-' + Date.now()
          }];

          resolve(formattedResult);
        });
        return;
      }

      console.log('Daily step count results:', JSON.stringify(results));

      if (results.length === 0) {
        console.log('No daily step count results, trying alternative method...');
        // If no results, try getting the step count directly
        AppleHealthKit.getStepCount(enhancedOptions, (altError: string, altResult: HealthValue) => {
          if (altError) {
            console.error('Error fetching alternative step count:', altError);
            reject(altError);
            return;
          }

          console.log('Alternative step count result:', JSON.stringify(altResult));
          // Convert to the same format as getDailyStepCountSamples
          const formattedResult: HealthStepSample[] = [{
            startDate: today.toISOString(),
            endDate: new Date().toISOString(),
            value: altResult.value,
            id: 'step-count-' + Date.now()
          }];

          resolve(formattedResult);
        });
      } else {
        resolve(results);
      }
    });
  });
};

// Get activity summary
export const getActivitySummary = (
  options: HealthInputOptions = { startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString() }
): Promise<HealthActivitySummary[]> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'ios') {
      reject('HealthKit is only available on iOS');
      return;
    }

    AppleHealthKit.getActivitySummary(options, (error: string, results: HealthActivitySummary[]) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
};

// Get workouts
export const getWorkouts = (
  options: HealthInputOptions = { startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString() }
): Promise<HealthWorkoutSample[]> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'ios') {
      reject('HealthKit is only available on iOS');
      return;
    }

    AppleHealthKit.getWorkouts(options, (error: string, results: HealthWorkoutSample[]) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
};

// Save workout
export const saveWorkout = (
  type: string,
  startDate: Date,
  endDate: Date,
  energyBurned: number,
  distance: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'ios') {
      reject('HealthKit is only available on iOS');
      return;
    }

    const options = {
      type,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      energyBurned,
      distance,
    };

    AppleHealthKit.saveWorkout(options, (error: string) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

// Get heart rate
export const getHeartRate = (
  options: HealthInputOptions = { startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString() }
): Promise<HealthHeartRateSample[]> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'ios') {
      reject('HealthKit is only available on iOS');
      return;
    }

    AppleHealthKit.getHeartRateSamples(options, (error: string, results: HealthHeartRateSample[]) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
};

// Get weight
export const getWeight = (): Promise<HealthWeightSample> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'ios') {
      reject('HealthKit is only available on iOS');
      return;
    }

    AppleHealthKit.getLatestWeight({}, (error: string, results: HealthWeightSample) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
};

// Save weight
export const saveWeight = (
  value: number,
  date: Date = new Date(),
  unit: HealthUnit = 'pound'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'ios') {
      reject('HealthKit is only available on iOS');
      return;
    }

    const options = {
      value,
      date: date.toISOString(),
      unit,
    };

    AppleHealthKit.saveWeight(options, (error: string) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

// Get height
export const getHeight = (): Promise<HealthValue> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'ios') {
      reject('HealthKit is only available on iOS');
      return;
    }

    AppleHealthKit.getLatestHeight({}, (error: string, results: HealthValue) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
};

// Save height
export const saveHeight = (
  value: number,
  date: Date = new Date(),
  unit: HealthUnit = 'inch'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'ios') {
      reject('HealthKit is only available on iOS');
      return;
    }

    const options = {
      value,
      date: date.toISOString(),
      unit,
    };

    AppleHealthKit.saveHeight(options, (error: string) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};
