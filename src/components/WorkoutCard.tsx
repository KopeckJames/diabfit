import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../utils/theme';

interface Exercise {
  name: string;
  duration: string;
  description: string;
}

interface WorkoutCardProps {
  title: string;
  description: string;
  duration: string;
  intensity: string;
  caloriesBurned: number;
  exercises: Exercise[];
  glucoseImpact: string;
  onPress?: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  title,
  description,
  duration,
  intensity,
  caloriesBurned,
  exercises,
  glucoseImpact,
  onPress,
}) => {
  // Map intensity to color
  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'low':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'high':
        return colors.error;
      default:
        return colors.info;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.intensityBadge, { backgroundColor: getIntensityColor(intensity) }]}>
          <Text style={styles.intensityText}>{intensity}</Text>
        </View>
      </View>
      
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={20} color={colors.primary} />
          <Text style={styles.statText}>{duration}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="flame-outline" size={20} color={colors.primary} />
          <Text style={styles.statText}>{caloriesBurned} cal</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="fitness-outline" size={20} color={colors.primary} />
          <Text style={styles.statText}>{exercises.length} exercises</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.glucoseContainer}>
        <Ionicons name="pulse-outline" size={20} color={colors.primary} />
        <Text style={styles.glucoseText}>{glucoseImpact}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginVertical: spacing.m,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  title: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
    flex: 1,
  },
  intensityBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
  },
  intensityText: {
    color: 'white',
    fontSize: typography.fontSizes.small,
    fontWeight: typography.fontWeights.medium as any,
  },
  description: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
    marginBottom: spacing.m,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.medium,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.disabled,
    marginVertical: spacing.s,
  },
  glucoseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  glucoseText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.medium,
    color: colors.primary,
    flex: 1,
  },
});

export default WorkoutCard;
