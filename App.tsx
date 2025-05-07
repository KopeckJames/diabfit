import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import auth screens
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';

// Import Storage and Polyfills
import './lib/storage';
import './lib/cryptoPolyfill';

// Define simple screens
const HomeScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DiabFit</Text>
      <Text style={styles.subtitle}>Diabetes Fitness App</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
};

const DashboardScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [glucoseReading, setGlucoseReading] = useState<number | null>(null);
  const [timeInRange, setTimeInRange] = useState<number | null>(null);
  const [workoutStats, setWorkoutStats] = useState<{ completed: number, total: number } | null>(null);
  const [lastMeal, setLastMeal] = useState<any>(null);
  const [nextWorkout, setNextWorkout] = useState<any>(null);
  const [glucoseReadings, setGlucoseReadings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch data directly from Firebase
  const fetchGlucoseReadings = async () => {
    try {
      const { getGlucoseReadings } = await import('./services/glucoseService');
      const readings = await getGlucoseReadings('day', 5);
      return readings;
    } catch (error) {
      console.error('Error fetching glucose readings:', error);
      setError('Failed to fetch glucose readings');
      return [];
    }
  };

  const fetchLatestGlucoseReading = async () => {
    try {
      const { getLatestGlucoseReading } = await import('./services/glucoseService');
      return await getLatestGlucoseReading();
    } catch (error) {
      console.error('Error fetching latest glucose reading:', error);
      return null;
    }
  };

  const fetchWorkouts = async () => {
    try {
      const { getWorkouts } = await import('./services/workoutService');
      return await getWorkouts();
    } catch (error) {
      console.error('Error fetching workouts:', error);
      return [];
    }
  };

  const fetchLatestMeal = async () => {
    try {
      const { getLatestMeal } = await import('./services/mealService');
      return await getLatestMeal();
    } catch (error) {
      console.error('Error fetching latest meal:', error);
      return null;
    }
  };

  const calculateTimeInRange = (readings: any[]) => {
    if (!readings || readings.length === 0) return null;

    const inRangeCount = readings.filter(reading =>
      reading.value >= 80 && reading.value <= 140
    ).length;

    return (inRangeCount / readings.length) * 100;
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch data directly from Supabase
        const readings = await fetchGlucoseReadings();
        setGlucoseReadings(readings);

        // Calculate time in range
        const timeInRangeValue = calculateTimeInRange(readings);
        setTimeInRange(timeInRangeValue);

        // Get latest glucose reading
        const latestReading = await fetchLatestGlucoseReading();
        if (latestReading) {
          setGlucoseReading(latestReading.value);
        }

        // Get workouts
        const workouts = await fetchWorkouts();
        if (workouts.length > 0) {
          setNextWorkout(workouts[0]);

          // Simple workout stats
          const completedWorkouts = workouts.length > 3 ? 3 : workouts.length;
          setWorkoutStats({
            completed: completedWorkouts,
            total: 5 // Target number of workouts
          });
        }

        // Get latest meal
        const meal = await fetchLatestMeal();
        if (meal) {
          const mealTime = new Date(meal.timestamp);
          setLastMeal({
            name: meal.name,
            time: mealTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            carbs: meal.carbs,
            impact: meal.glucoseImpact
          });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <Text style={{ marginTop: 10, color: '#F44336', fontSize: 16 }}>{error}</Text>
        <TouchableOpacity
          style={[styles.button, { marginTop: 20 }]}
          onPress={() => setError(null)}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'}</Text>
        <Text style={styles.date}>{new Date().toDateString()}</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{timeInRange !== null ? `${timeInRange.toFixed(0)}%` : '--'}</Text>
          <Text style={styles.summaryLabel}>Time in Range</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{glucoseReading !== null ? glucoseReading : '--'}</Text>
          <Text style={styles.summaryLabel}>Current Glucose</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {workoutStats ? `${workoutStats.completed}/${workoutStats.total}` : '--/--'}
          </Text>
          <Text style={styles.summaryLabel}>Workouts</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Glucose Trend</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        {glucoseReadings.length > 0 ? (
          <View style={styles.readingsContainer}>
            {glucoseReadings.map((reading, index) => {
              const readingTime = new Date(reading.timestamp);
              const timeString = readingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const status = reading.value > 140 ? 'high' : reading.value < 80 ? 'low' : 'normal';
              const statusColor = status === 'high' ? '#F44336' : status === 'low' ? '#FF9800' : '#4CAF50';

              return (
                <View key={index} style={styles.readingItem}>
                  <Text style={styles.readingTime}>{timeString}</Text>
                  <View style={styles.readingBar}>
                    <View
                      style={[
                        styles.readingBarFill,
                        {
                          width: `${(reading.value / 200) * 100}%`,
                          backgroundColor: statusColor
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.readingValue}>{reading.value}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.chartPlaceholder}>
            <Text>No glucose readings available</Text>
          </View>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Next Workout</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {nextWorkout ? (
        <TouchableOpacity style={styles.workoutCard} onPress={() => {}}>
          <View style={styles.workoutHeader}>
            <Text style={styles.workoutTitle}>{nextWorkout.title}</Text>
            <View style={styles.workoutBadge}>
              <Text style={styles.workoutBadgeText}>{nextWorkout.intensity}</Text>
            </View>
          </View>
          <Text style={styles.workoutDescription}>{nextWorkout.description}</Text>
          <View style={styles.workoutDetails}>
            <View style={styles.workoutDetail}>
              <Ionicons name="time-outline" size={16} color="#4CAF50" />
              <Text style={styles.workoutDetailText}>{nextWorkout.duration} min</Text>
            </View>
            <View style={styles.workoutDetail}>
              <Ionicons name="flame-outline" size={16} color="#4CAF50" />
              <Text style={styles.workoutDetailText}>{nextWorkout.calories_burned} cal</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No workouts available</Text>
          <TouchableOpacity style={styles.emptyStateButton} onPress={() => {}}>
            <Text style={styles.emptyStateButtonText}>Create Workout</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Last Meal</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {lastMeal ? (
        <TouchableOpacity style={styles.mealCard} onPress={() => {}}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealTitle}>{lastMeal.name}</Text>
            <Text style={styles.mealTime}>{lastMeal.time}</Text>
          </View>
          <View style={styles.mealDetails}>
            <View style={styles.mealDetail}>
              <Text style={styles.mealDetailLabel}>Carbs</Text>
              <Text style={styles.mealDetailValue}>{lastMeal.carbs}g</Text>
            </View>
            <View style={styles.mealDetail}>
              <Text style={styles.mealDetailLabel}>Impact</Text>
              <Text style={styles.mealDetailValue}>{lastMeal.impact}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No meals logged yet</Text>
          <TouchableOpacity style={styles.emptyStateButton} onPress={() => {}}>
            <Text style={styles.emptyStateButtonText}>Log Meal</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const WorkoutScreen = () => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('recommended');

  // Fetch workouts from Firebase
  const fetchWorkouts = async () => {
    try {
      setLoading(true);

      const { getWorkouts } = await import('./services/workoutService');
      const workoutsData = await getWorkouts();

      setWorkouts(workoutsData);
      return workoutsData;
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setError('Failed to fetch workouts');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load workouts when component mounts
  useEffect(() => {
    fetchWorkouts();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Loading workouts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <Text style={{ marginTop: 10, color: '#F44336', fontSize: 16 }}>{error}</Text>
        <TouchableOpacity
          style={[styles.button, { marginTop: 20 }]}
          onPress={() => {
            setError(null);
            fetchWorkouts();
          }}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Workouts</Text>
        <TouchableOpacity>
          <Ionicons name="options-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'recommended' && styles.activeTab]}
          onPress={() => setSelectedTab('recommended')}
        >
          <Text style={[styles.tabText, selectedTab === 'recommended' && styles.activeTabText]}>
            Recommended
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'favorites' && styles.activeTab]}
          onPress={() => setSelectedTab('favorites')}
        >
          <Text style={[styles.tabText, selectedTab === 'favorites' && styles.activeTabText]}>
            Favorites
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
          onPress={() => setSelectedTab('history')}
        >
          <Text style={[styles.tabText, selectedTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoCardContent}>
          <Ionicons name="information-circle-outline" size={24} color="#4CAF50" />
          <Text style={styles.infoCardText}>
            Workouts are tailored to your glucose levels and fitness goals.
          </Text>
        </View>
      </View>

      {workouts.length > 0 ? (
        workouts.map((workout) => (
          <TouchableOpacity key={workout.id} style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutTitle}>{workout.title}</Text>
              <View style={[
                styles.workoutBadge,
                workout.intensity === 'Low' ? styles.lowIntensity :
                workout.intensity === 'Medium' ? styles.mediumIntensity :
                styles.highIntensity
              ]}>
                <Text style={styles.workoutBadgeText}>{workout.intensity}</Text>
              </View>
            </View>
            <Text style={styles.workoutDescription}>{workout.description}</Text>
            <View style={styles.workoutDetails}>
              <View style={styles.workoutDetail}>
                <Ionicons name="time-outline" size={16} color="#4CAF50" />
                <Text style={styles.workoutDetailText}>{workout.duration} min</Text>
              </View>
              <View style={styles.workoutDetail}>
                <Ionicons name="flame-outline" size={16} color="#4CAF50" />
                <Text style={styles.workoutDetailText}>{workout.calories_burned} cal</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.glucoseContainer}>
              <Ionicons name="pulse-outline" size={16} color="#4CAF50" />
              <Text style={styles.glucoseText}>{workout.glucose_impact}</Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No workouts available</Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => {
              // In a real app, this would navigate to a workout creation screen
              alert('Create workout functionality will be implemented soon');
            }}
          >
            <Text style={styles.emptyStateButtonText}>Create Workout</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.createButton}
        onPress={async () => {
          try {
            // Example of creating a workout
            const { createWorkout } = await import('./services/workoutService');

            const newWorkout = await createWorkout({
              title: 'Sample Workout',
              description: 'This is a sample workout created from the app',
              duration: 30,
              intensity: 'Medium',
              caloriesBurned: 200,
              glucoseImpact: 'May lower blood sugar for up to 24 hours'
            });

            if (!newWorkout) throw new Error('Failed to create workout');

            alert('Sample workout created successfully');
            fetchWorkouts(); // Refresh the list
          } catch (error) {
            console.error('Error creating workout:', error);
            alert('Failed to create workout');
          }
        }}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.createButtonText}>Create Custom Workout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const GlucoseScreen = () => {
  const [currentReading, setCurrentReading] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month'>('day');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGlucoseValue, setNewGlucoseValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readings, setReadings] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    min: number;
    max: number;
    avg: number;
    timeInRange: number;
  } | null>(null);

  // Fetch glucose readings from Firebase
  const fetchGlucoseReadings = async (timeFrame: 'day' | 'week' | 'month') => {
    try {
      const { getGlucoseReadings } = await import('./services/glucoseService');
      return await getGlucoseReadings(timeFrame);
    } catch (error) {
      console.error('Error fetching glucose readings:', error);
      setError('Failed to fetch glucose readings');
      return [];
    }
  };

  // Calculate statistics
  const calculateStats = (readings: any[]) => {
    if (!readings || readings.length === 0) return null;

    const values = readings.map(item => item.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
    const inRange = values.filter((val: number) => val >= 80 && val <= 140).length;
    const timeInRange = (inRange / values.length) * 100;

    return { min, max, avg, timeInRange };
  };

  // Determine status based on glucose level
  const getStatus = (value: number) => {
    if (value > 140) return { label: 'High', color: '#F44336' };
    if (value < 80) return { label: 'Low', color: '#FF9800' };
    return { label: 'In Range', color: '#4CAF50' };
  };

  // Add a new glucose reading
  const handleAddReading = async () => {
    if (!newGlucoseValue || isNaN(Number(newGlucoseValue))) {
      alert('Please enter a valid glucose value');
      return;
    }

    try {
      const { addGlucoseReading } = await import('./services/glucoseService');

      const newReading = await addGlucoseReading(
        parseInt(newGlucoseValue),
        '' // Optional notes
      );

      if (!newReading) {
        throw new Error('Failed to add glucose reading');
      }

      alert('Glucose reading added successfully');
      setNewGlucoseValue('');
      setShowAddModal(false);

      // Refresh data
      loadGlucoseData();
    } catch (error) {
      console.error('Error adding glucose reading:', error);
      alert('Failed to add glucose reading');
    }
  };

  // Load glucose data
  const loadGlucoseData = async () => {
    setLoading(true);
    try {
      const readings = await fetchGlucoseReadings(timeFrame);
      setReadings(readings);

      // Calculate statistics
      const calculatedStats = calculateStats(readings);
      setStats(calculatedStats);

      // Set current reading and last updated
      if (readings.length > 0) {
        setCurrentReading(readings[0].value);
        const lastUpdatedDate = new Date(readings[0].timestamp);
        setLastUpdated(lastUpdatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (error) {
      console.error('Error loading glucose data:', error);
      setError('Failed to load glucose data');
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or timeFrame changes
  useEffect(() => {
    loadGlucoseData();
  }, [timeFrame]);

  const status = currentReading ? getStatus(currentReading) : { label: 'Unknown', color: '#999' };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Loading glucose data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <Text style={{ marginTop: 10, color: '#F44336', fontSize: 16 }}>{error}</Text>
        <TouchableOpacity
          style={[styles.button, { marginTop: 20 }]}
          onPress={() => {
            setError(null);
            loadGlucoseData();
          }}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Glucose Monitoring</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <View style={styles.currentReadingCard}>
        <Text style={styles.currentReadingLabel}>Current Reading</Text>
        <Text style={styles.currentReadingValue}>
          {currentReading !== null ? currentReading : '--'} <Text style={styles.unit}>mg/dL</Text>
        </Text>
        <Text style={styles.currentReadingTime}>
          Last updated: {lastUpdated || '--'}
        </Text>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={styles.statusText}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats ? stats.min : '--'}</Text>
          <Text style={styles.statLabel}>Min</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats ? stats.max : '--'}</Text>
          <Text style={styles.statLabel}>Max</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats ? stats.avg.toFixed(0) : '--'}</Text>
          <Text style={styles.statLabel}>Avg</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats ? `${stats.timeInRange.toFixed(0)}%` : '--'}</Text>
          <Text style={styles.statLabel}>In Range</Text>
        </View>
      </View>

      <View style={styles.timeFrameSelector}>
        <TouchableOpacity
          style={[styles.timeFrameButton, timeFrame === 'day' && styles.activeTimeFrame]}
          onPress={() => setTimeFrame('day')}
        >
          <Text style={[styles.timeFrameText, timeFrame === 'day' && styles.activeTimeFrameText]}>
            Day
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeFrameButton, timeFrame === 'week' && styles.activeTimeFrame]}
          onPress={() => setTimeFrame('week')}
        >
          <Text style={[styles.timeFrameText, timeFrame === 'week' && styles.activeTimeFrameText]}>
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeFrameButton, timeFrame === 'month' && styles.activeTimeFrame]}
          onPress={() => setTimeFrame('month')}
        >
          <Text style={[styles.timeFrameText, timeFrame === 'month' && styles.activeTimeFrameText]}>
            Month
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        {/* Visualization of readings */}
        {readings && readings.length > 0 ? (
          <View style={styles.readingsContainer}>
            {readings.map((reading, index) => {
              const readingTime = new Date(reading.timestamp);
              const timeString = readingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <View key={index} style={styles.readingItem}>
                  <Text style={styles.readingTime}>{timeString}</Text>
                  <View style={styles.readingBar}>
                    <View
                      style={[
                        styles.readingBarFill,
                        {
                          width: `${(reading.value / 200) * 100}%`,
                          backgroundColor: getStatus(reading.value).color
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.readingValue}>{reading.value}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.chartPlaceholder}>
            <Text>No glucose readings available</Text>
          </View>
        )}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoCardContent}>
          <Ionicons name="information-circle-outline" size={24} color="#4CAF50" />
          <Text style={styles.infoCardText}>
            Target range: 80-140 mg/dL. Consult your healthcare provider for personalized targets.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.connectButton}>
        <Ionicons name="bluetooth-outline" size={20} color="#4CAF50" />
        <Text style={styles.connectButtonText}>Connect Glucose Monitor</Text>
      </TouchableOpacity>

      {/* Add Reading Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Glucose Reading</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Glucose Value (mg/dL)</Text>
            <TextInput
              style={styles.modalInput}
              value={newGlucoseValue}
              onChangeText={setNewGlucoseValue}
              placeholder="Enter glucose value"
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleAddReading}
            >
              <Text style={styles.modalButtonText}>Add Reading</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const ProfileScreen = () => {
  const { user, signOut } = useAuth();

  // Default profile data with actual user information
  const profileData = {
    name: user?.name || 'User',
    email: user?.email || '',
    diabetesType: user?.diabetesType || 'Type 2',
    diagnosisYear: user?.diagnosisYear || new Date().getFullYear() - 1,
    age: user?.age || 35,
    weight: user?.weight || 170,
    height: user?.height || 68,
    a1c: user?.a1c || 7.0,
    targetGlucoseRange: {
      min: user?.targetGlucoseMin || 80,
      max: user?.targetGlucoseMax || 140
    },
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
      { name: 'Glipizide', dosage: '5mg', frequency: 'Once daily' },
    ],
    emergencyContact: {
      name: 'Emergency Contact',
      relationship: 'Relation',
      phone: '555-123-4567',
    },
  };

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Achievements
  const achievements = [
    {
      id: '1',
      title: 'First Workout',
      date: '2023-01-15',
      icon: 'trophy-outline',
    },
    {
      id: '2',
      title: 'Week Streak',
      date: '2023-01-22',
      icon: 'flame-outline',
    },
    {
      id: '3',
      title: 'Glucose Master',
      date: '2023-01-25',
      icon: 'star-outline',
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      alert('An error occurred during logout');
    }
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.profileImagePlaceholder}>
            {profileData.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <Text style={styles.profileName}>{profileData.name}</Text>
        <Text style={styles.profileInfo}>{profileData.diabetesType} • Diagnosed {profileData.diagnosisYear}</Text>
        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Health Information</Text>
      </View>

      <View style={styles.healthInfoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Age</Text>
          <Text style={styles.infoValue}>{profileData.age} years</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Weight</Text>
          <Text style={styles.infoValue}>{profileData.weight} lbs</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Height</Text>
          <Text style={styles.infoValue}>{Math.floor(profileData.height / 12)}'{profileData.height % 12}"</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Latest A1C</Text>
          <Text style={styles.infoValue}>{profileData.a1c}%</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Target Glucose Range</Text>
          <Text style={styles.infoValue}>{profileData.targetGlucoseRange.min}-{profileData.targetGlucoseRange.max} mg/dL</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Medications</Text>
      </View>

      <View style={styles.medicationsCard}>
        {profileData.medications.map((medication, index) => (
          <View key={index} style={styles.medicationItem}>
            <View style={styles.medicationIcon}>
              <Ionicons name="medical-outline" size={20} color="#4CAF50" />
            </View>
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>{medication.name}</Text>
              <Text style={styles.medicationDetails}>
                {medication.dosage} • {medication.frequency}
              </Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.addMedicationButton}>
          <Ionicons name="add" size={20} color="#4CAF50" />
          <Text style={styles.addMedicationText}>Add Medication</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Achievements</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsContainer}>
        {achievements.map((achievement) => (
          <View key={achievement.id} style={styles.achievementCard}>
            <View style={styles.achievementIconContainer}>
              <Ionicons name={achievement.icon as any} size={30} color="#4CAF50" />
            </View>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.achievementDate}>{achievement.date}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Settings</Text>
      </View>

      <View style={styles.settingsCard}>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <View style={styles.switchContainer}>
            <TouchableOpacity
              style={[styles.switchOption, notificationsEnabled ? styles.switchActive : null]}
              onPress={() => setNotificationsEnabled(true)}
            >
              <Text style={[styles.switchText, notificationsEnabled ? styles.switchActiveText : null]}>On</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.switchOption, !notificationsEnabled ? styles.switchActive : null]}
              onPress={() => setNotificationsEnabled(false)}
            >
              <Text style={[styles.switchText, !notificationsEnabled ? styles.switchActiveText : null]}>Off</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Share Data with Doctor</Text>
          <View style={styles.switchContainer}>
            <TouchableOpacity
              style={[styles.switchOption, dataSharing ? styles.switchActive : null]}
              onPress={() => setDataSharing(true)}
            >
              <Text style={[styles.switchText, dataSharing ? styles.switchActiveText : null]}>On</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.switchOption, !dataSharing ? styles.switchActive : null]}
              onPress={() => setDataSharing(false)}
            >
              <Text style={[styles.switchText, !dataSharing ? styles.switchActiveText : null]}>Off</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <View style={styles.switchContainer}>
            <TouchableOpacity
              style={[styles.switchOption, darkMode ? styles.switchActive : null]}
              onPress={() => setDarkMode(true)}
            >
              <Text style={[styles.switchText, darkMode ? styles.switchActiveText : null]}>On</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.switchOption, !darkMode ? styles.switchActive : null]}
              onPress={() => setDarkMode(false)}
            >
              <Text style={[styles.switchText, !darkMode ? styles.switchActiveText : null]}>Off</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.emergencyContactCard}>
        <Text style={styles.emergencyContactTitle}>Emergency Contact</Text>
        <View style={styles.emergencyContactInfo}>
          <Text style={styles.emergencyContactName}>{profileData.emergencyContact.name}</Text>
          <Text style={styles.emergencyContactRelation}>{profileData.emergencyContact.relationship}</Text>
          <Text style={styles.emergencyContactPhone}>{profileData.emergencyContact.phone}</Text>
        </View>
        <TouchableOpacity style={styles.editEmergencyContact}>
          <Text style={styles.editEmergencyContactText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#F44336" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>DiabFit v1.0.0</Text>
    </ScrollView>
  );
};

// Create tab navigator
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Workout') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Glucose') {
            iconName = focused ? 'pulse' : 'pulse-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="Glucose" component={GlucoseScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Create stack navigators
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// App Navigator
const AppNavigator = () => (
  <AppStack.Navigator>
    <AppStack.Screen
      name="Home"
      component={HomeScreen}
      options={{
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {}}
            style={{ marginRight: 15 }}
          >
            <Text style={{ color: '#4CAF50' }}>Profile</Text>
          </TouchableOpacity>
        ),
      }}
    />
    <AppStack.Screen
      name="Main"
      component={MainTabs}
      options={{ headerShown: false }}
    />
  </AppStack.Navigator>
);

// Root Navigator with Auth Check
const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartPlaceholder: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    borderStyle: 'dashed',
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  workoutBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  workoutDetails: {
    flexDirection: 'row',
    marginTop: 5,
  },
  workoutDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  workoutDetailText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
  },
  mealDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mealDetail: {
    alignItems: 'center',
  },
  mealDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  mealDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  // Workout screen styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 15,
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  infoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCardText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  lowIntensity: {
    backgroundColor: '#4CAF50',
  },
  mediumIntensity: {
    backgroundColor: '#FF9800',
  },
  highIntensity: {
    backgroundColor: '#F44336',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  glucoseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glucoseText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  // Glucose screen styles
  currentReadingCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentReadingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  currentReadingValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  unit: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  currentReadingTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  timeFrameSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 15,
    padding: 5,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTimeFrame: {
    backgroundColor: '#4CAF50',
  },
  timeFrameText: {
    fontSize: 14,
    color: '#666',
  },
  activeTimeFrameText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  readingsContainer: {
    marginTop: 15,
  },
  readingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  readingTime: {
    width: 70,
    fontSize: 14,
    color: '#666',
  },
  readingBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  readingBarFill: {
    height: 10,
    borderRadius: 5,
  },
  readingValue: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
  },
  connectButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#4CAF50',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Profile screen styles
  profileCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  editProfileButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  editProfileButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  healthInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  medicationsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  medicationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  medicationDetails: {
    fontSize: 14,
    color: '#666',
  },
  addMedicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  addMedicationText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#4CAF50',
  },
  achievementsContainer: {
    marginBottom: 20,
  },
  achievementCard: {
    width: 120,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  achievementDate: {
    fontSize: 12,
    color: '#666',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    padding: 2,
  },
  switchOption: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  switchActive: {
    backgroundColor: '#4CAF50',
  },
  switchText: {
    fontSize: 14,
    color: '#666',
  },
  switchActiveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emergencyContactCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emergencyContactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emergencyContactInfo: {
    marginBottom: 10,
  },
  emergencyContactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  emergencyContactRelation: {
    fontSize: 14,
    color: '#666',
  },
  emergencyContactPhone: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 5,
  },
  editEmergencyContact: {
    alignSelf: 'flex-end',
  },
  editEmergencyContactText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  logoutButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#F44336',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyStateContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  emptyStateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
