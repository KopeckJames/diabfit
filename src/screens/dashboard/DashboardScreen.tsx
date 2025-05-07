import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import GlucoseChart from '../../components/GlucoseChart';
import { glucoseReadings, weeklyGlucoseAverages, workoutPlans, nutritionItems } from '../../utils/mockData';

const DashboardScreen: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [todayGlucose, setTodayGlucose] = useState(glucoseReadings);
  const [weeklyGlucose, setWeeklyGlucose] = useState(weeklyGlucoseAverages);
  const [nextWorkout, setNextWorkout] = useState(workoutPlans[0]);
  const [lastMeal, setLastMeal] = useState(nutritionItems[0]);

  useEffect(() => {
    // Load user data from AsyncStorage
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name);
        }
      } catch (error) {
        console.log('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Calculate time in range percentage
  const calculateTimeInRange = (readings: typeof glucoseReadings, min = 80, max = 140) => {
    const inRangeCount = readings.filter(
      reading => reading.value >= min && reading.value <= max
    ).length;
    return (inRangeCount / readings.length) * 100;
  };

  const timeInRange = calculateTimeInRange(todayGlucose);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {userName || 'User'}</Text>
            <Text style={styles.date}>{new Date().toDateString()}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{timeInRange.toFixed(0)}%</Text>
            <Text style={styles.summaryLabel}>Time in Range</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {todayGlucose[todayGlucose.length - 1].value}
            </Text>
            <Text style={styles.summaryLabel}>Current Glucose</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>2/3</Text>
            <Text style={styles.summaryLabel}>Workouts</Text>
          </View>
        </View>

        <GlucoseChart 
          data={todayGlucose} 
          title="Today's Glucose" 
          targetRange={{ min: 80, max: 140 }}
        />

        <GlucoseChart 
          data={weeklyGlucose.map(item => ({ time: item.day, value: item.value }))} 
          title="Weekly Average" 
          targetRange={{ min: 80, max: 140 }}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Next Workout</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.workoutCard}>
          <View style={styles.workoutHeader}>
            <Text style={styles.workoutTitle}>{nextWorkout.title}</Text>
            <View style={styles.workoutBadge}>
              <Text style={styles.workoutBadgeText}>{nextWorkout.intensity}</Text>
            </View>
          </View>
          <Text style={styles.workoutDescription}>{nextWorkout.description}</Text>
          <View style={styles.workoutDetails}>
            <View style={styles.workoutDetail}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={styles.workoutDetailText}>{nextWorkout.duration}</Text>
            </View>
            <View style={styles.workoutDetail}>
              <Ionicons name="flame-outline" size={16} color={colors.primary} />
              <Text style={styles.workoutDetailText}>{nextWorkout.caloriesBurned} cal</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Last Meal</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealTitle}>{lastMeal.name}</Text>
            <Text style={styles.mealTime}>{lastMeal.time}</Text>
          </View>
          <View style={styles.mealDetails}>
            <View style={styles.mealDetail}>
              <Text style={styles.mealDetailLabel}>Carbs</Text>
              <Text style={styles.mealDetailValue}>{lastMeal.totalCarbs}g</Text>
            </View>
            <View style={styles.mealDetail}>
              <Text style={styles.mealDetailLabel}>Protein</Text>
              <Text style={styles.mealDetailValue}>{lastMeal.totalProtein}g</Text>
            </View>
            <View style={styles.mealDetail}>
              <Text style={styles.mealDetailLabel}>Fat</Text>
              <Text style={styles.mealDetailValue}>{lastMeal.totalFat}g</Text>
            </View>
            <View style={styles.mealDetail}>
              <Text style={styles.mealDetailLabel}>Calories</Text>
              <Text style={styles.mealDetailValue}>{lastMeal.totalCalories}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    padding: spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  greeting: {
    fontSize: typography.fontSizes.xlarge,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
  },
  date: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
    opacity: 0.7,
  },
  notificationButton: {
    padding: spacing.s,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginHorizontal: spacing.xs,
  },
  summaryValue: {
    fontSize: typography.fontSizes.xlarge,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSizes.small,
    color: colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
  },
  seeAllText: {
    fontSize: typography.fontSizes.medium,
    color: colors.primary,
  },
  workoutCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  workoutTitle: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
  },
  workoutBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
  },
  workoutBadgeText: {
    color: colors.background,
    fontSize: typography.fontSizes.small,
    fontWeight: typography.fontWeights.medium as any,
  },
  workoutDescription: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
    marginBottom: spacing.m,
  },
  workoutDetails: {
    flexDirection: 'row',
  },
  workoutDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.l,
  },
  workoutDetailText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.medium,
    color: colors.text,
  },
  mealCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  mealTitle: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
  },
  mealTime: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
  },
  mealDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealDetail: {
    alignItems: 'center',
  },
  mealDetailLabel: {
    fontSize: typography.fontSizes.small,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  mealDetailValue: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.primary,
  },
});

export default DashboardScreen;
