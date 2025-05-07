import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../utils/theme';

interface FoodItem {
  name: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
}

interface MealCardProps {
  name: string;
  time: string;
  items: FoodItem[];
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  totalCalories: number;
  glucoseImpact: string;
  onPress?: () => void;
}

const MealCard: React.FC<MealCardProps> = ({
  name,
  time,
  items,
  totalCarbs,
  totalProtein,
  totalFat,
  totalCalories,
  glucoseImpact,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      
      <View style={styles.foodList}>
        {items.map((item, index) => (
          <View key={index} style={styles.foodItem}>
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodCarbs}>{item.carbs}g carbs</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.macrosContainer}>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Carbs</Text>
          <Text style={[styles.macroValue, { color: colors.primary }]}>{totalCarbs}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Protein</Text>
          <Text style={[styles.macroValue, { color: colors.secondary }]}>{totalProtein}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Fat</Text>
          <Text style={[styles.macroValue, { color: colors.accent }]}>{totalFat}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Calories</Text>
          <Text style={styles.macroValue}>{totalCalories}</Text>
        </View>
      </View>
      
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
    marginBottom: spacing.m,
  },
  title: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
  },
  time: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
  },
  foodList: {
    marginBottom: spacing.m,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  foodName: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
  },
  foodCarbs: {
    fontSize: typography.fontSizes.medium,
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.disabled,
    marginVertical: spacing.s,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: typography.fontSizes.small,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  macroValue: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as any,
  },
  glucoseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glucoseText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.medium,
    color: colors.primary,
  },
});

export default MealCard;
