import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import WorkoutCard from '../../components/WorkoutCard';
import Button from '../../components/Button';
import { workoutPlans } from '../../utils/mockData';

const WorkoutScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<typeof workoutPlans[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleWorkoutPress = (workout: typeof workoutPlans[0]) => {
    setSelectedWorkout(workout);
    setModalVisible(true);
  };

  const handleStartWorkout = () => {
    setModalVisible(false);
    Alert.alert(
      'Workout Started',
      `You've started ${selectedWorkout?.title}. Good luck!`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Workouts</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Recommended</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoCardContent}>
            <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.infoCardText}>
              Workouts are tailored to your glucose levels and fitness goals.
            </Text>
          </View>
        </View>

        {workoutPlans.map((workout) => (
          <WorkoutCard
            key={workout.id}
            title={workout.title}
            description={workout.description}
            duration={workout.duration}
            intensity={workout.intensity}
            caloriesBurned={workout.caloriesBurned}
            exercises={workout.exercises}
            glucoseImpact={workout.glucoseImpact}
            onPress={() => handleWorkoutPress(workout)}
          />
        ))}

        <Button
          title="Create Custom Workout"
          variant="outline"
          icon="add-circle-outline"
          onPress={() => Alert.alert('Coming Soon', 'Custom workout creation will be available in the next update.')}
          style={styles.createButton}
        />
      </ScrollView>

      {/* Workout Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedWorkout?.title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.modalDescription}>{selectedWorkout?.description}</Text>
              
              <View style={styles.modalStats}>
                <View style={styles.modalStat}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <Text style={styles.modalStatText}>{selectedWorkout?.duration}</Text>
                </View>
                <View style={styles.modalStat}>
                  <Ionicons name="flame-outline" size={20} color={colors.primary} />
                  <Text style={styles.modalStatText}>{selectedWorkout?.caloriesBurned} cal</Text>
                </View>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Glucose Impact</Text>
                <Text style={styles.modalSectionText}>{selectedWorkout?.glucoseImpact}</Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Exercises</Text>
                {selectedWorkout?.exercises.map((exercise, index) => (
                  <View key={index} style={styles.exerciseItem}>
                    <View style={styles.exerciseHeader}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
                    </View>
                    <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Recommendations</Text>
                <Text style={styles.modalSectionText}>
                  • Check your glucose before starting
                  {'\n'}• Have a snack ready if needed
                  {'\n'}• Stay hydrated throughout
                </Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Start Workout"
                onPress={handleStartWorkout}
                style={styles.startButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: spacing.m,
  },
  title: {
    fontSize: typography.fontSizes.xxlarge,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
  },
  filterButton: {
    padding: spacing.s,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  tab: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    marginRight: spacing.s,
    borderRadius: borderRadius.medium,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
  },
  activeTabText: {
    color: colors.background,
    fontWeight: typography.fontWeights.medium as any,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  infoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCardText: {
    marginLeft: spacing.s,
    fontSize: typography.fontSizes.medium,
    color: colors.text,
    flex: 1,
  },
  createButton: {
    marginVertical: spacing.l,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.m,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  modalTitle: {
    fontSize: typography.fontSizes.xlarge,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
  },
  modalScrollView: {
    flex: 1,
  },
  modalDescription: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
    marginBottom: spacing.m,
  },
  modalStats: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  modalStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.l,
  },
  modalStatText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.medium,
    color: colors.text,
  },
  modalSection: {
    marginBottom: spacing.m,
  },
  modalSectionTitle: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
    marginBottom: spacing.s,
  },
  modalSectionText: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
    lineHeight: 22,
  },
  exerciseItem: {
    marginBottom: spacing.m,
    padding: spacing.s,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.small,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  exerciseName: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
  },
  exerciseDuration: {
    fontSize: typography.fontSizes.medium,
    color: colors.primary,
  },
  exerciseDescription: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
  },
  modalFooter: {
    marginTop: spacing.m,
  },
  startButton: {
    marginBottom: spacing.m,
  },
});

export default WorkoutScreen;
