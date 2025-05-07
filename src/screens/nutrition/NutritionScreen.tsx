import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import MealCard from '../../components/MealCard';
import Button from '../../components/Button';
import { nutritionItems } from '../../utils/mockData';

const NutritionScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [meals, setMeals] = useState(nutritionItems);
  const [mealName, setMealName] = useState('');
  const [mealTime, setMealTime] = useState('');
  const [foodName, setFoodName] = useState('');
  const [carbs, setCarbs] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleAddMeal = () => {
    if (!mealName || !mealTime || !foodName || !carbs || !protein || !fat) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newMeal = {
      id: (meals.length + 1).toString(),
      name: mealName,
      time: mealTime,
      items: [
        {
          name: foodName,
          carbs: Number(carbs),
          protein: Number(protein),
          fat: Number(fat),
          calories: Number(carbs) * 4 + Number(protein) * 4 + Number(fat) * 9
        }
      ],
      totalCarbs: Number(carbs),
      totalProtein: Number(protein),
      totalFat: Number(fat),
      totalCalories: Number(carbs) * 4 + Number(protein) * 4 + Number(fat) * 9,
      glucoseImpact: 'Impact not yet analyzed'
    };

    // Add the new meal to the data
    const updatedMeals = [...meals, newMeal];
    setMeals(updatedMeals);
    
    // Close the modal and reset the inputs
    setModalVisible(false);
    setMealName('');
    setMealTime('');
    setFoodName('');
    setCarbs('');
    setProtein('');
    setFat('');

    Alert.alert('Success', 'Meal added successfully');
  };

  // Calculate daily nutrition totals
  const calculateDailyTotals = () => {
    return meals.reduce(
      (totals, meal) => {
        return {
          carbs: totals.carbs + meal.totalCarbs,
          protein: totals.protein + meal.totalProtein,
          fat: totals.fat + meal.totalFat,
          calories: totals.calories + meal.totalCalories
        };
      },
      { carbs: 0, protein: 0, fat: 0, calories: 0 }
    );
  };

  const dailyTotals = calculateDailyTotals();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Nutrition</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Daily Summary</Text>
          <View style={styles.macrosContainer}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{dailyTotals.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
              <View style={[styles.macroBar, { backgroundColor: colors.primary }]} />
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{dailyTotals.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
              <View style={[styles.macroBar, { backgroundColor: colors.secondary }]} />
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{dailyTotals.fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
              <View style={[styles.macroBar, { backgroundColor: colors.accent }]} />
            </View>
          </View>
          <View style={styles.calorieContainer}>
            <Text style={styles.calorieLabel}>Total Calories</Text>
            <Text style={styles.calorieValue}>{dailyTotals.calories}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            name={meal.name}
            time={meal.time}
            items={meal.items}
            totalCarbs={meal.totalCarbs}
            totalProtein={meal.totalProtein}
            totalFat={meal.totalFat}
            totalCalories={meal.totalCalories}
            glucoseImpact={meal.glucoseImpact}
            onPress={() => Alert.alert('Meal Details', `${meal.name} details coming soon`)}
          />
        ))}

        <View style={styles.infoCard}>
          <View style={styles.infoCardContent}>
            <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.infoCardText}>
              Tracking your meals helps understand how different foods affect your glucose levels.
            </Text>
          </View>
        </View>

        <Button
          title="View Recommended Meal Plans"
          variant="outline"
          icon="restaurant-outline"
          onPress={() => Alert.alert('Coming Soon', 'Meal plans will be available in the next update.')}
          style={styles.mealPlanButton}
        />
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Meal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.inputLabel}>Meal Name</Text>
              <TextInput
                style={styles.input}
                value={mealName}
                onChangeText={setMealName}
                placeholder="e.g., Breakfast, Lunch, Dinner"
              />

              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                style={styles.input}
                value={mealTime}
                onChangeText={setMealTime}
                placeholder="e.g., 08:00, 12:30"
              />

              <Text style={styles.inputLabel}>Food Name</Text>
              <TextInput
                style={styles.input}
                value={foodName}
                onChangeText={setFoodName}
                placeholder="e.g., Oatmeal, Chicken Salad"
              />

              <Text style={styles.inputLabel}>Carbs (g)</Text>
              <TextInput
                style={styles.input}
                value={carbs}
                onChangeText={setCarbs}
                placeholder="Enter carbs in grams"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Protein (g)</Text>
              <TextInput
                style={styles.input}
                value={protein}
                onChangeText={setProtein}
                placeholder="Enter protein in grams"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Fat (g)</Text>
              <TextInput
                style={styles.input}
                value={fat}
                onChangeText={setFat}
                placeholder="Enter fat in grams"
                keyboardType="numeric"
              />
            </ScrollView>

            <Button
              title="Add Meal"
              onPress={handleAddMeal}
              style={styles.addMealButton}
            />
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
  addButton: {
    padding: spacing.s,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.l,
    marginBottom: spacing.l,
  },
  summaryTitle: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
    marginBottom: spacing.m,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
  },
  macroLabel: {
    fontSize: typography.fontSizes.small,
    color: colors.text,
    marginVertical: spacing.xs,
  },
  macroBar: {
    height: 4,
    width: '80%',
    borderRadius: 2,
  },
  calorieContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.disabled,
    paddingTop: spacing.m,
  },
  calorieLabel: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
  },
  calorieValue: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginVertical: spacing.m,
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
  mealPlanButton: {
    marginVertical: spacing.m,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: spacing.m,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.l,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  modalTitle: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
  },
  modalScrollView: {
    marginBottom: spacing.m,
  },
  inputLabel: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.disabled,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    fontSize: typography.fontSizes.medium,
    marginBottom: spacing.m,
  },
  addMealButton: {
    marginTop: spacing.s,
  },
});

export default NutritionScreen;
