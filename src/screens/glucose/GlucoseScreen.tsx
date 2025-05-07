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
import GlucoseChart from '../../components/GlucoseChart';
import Button from '../../components/Button';
import { glucoseReadings, weeklyGlucoseAverages } from '../../utils/mockData';

const GlucoseScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [glucoseValue, setGlucoseValue] = useState('');
  const [timeFrame, setTimeFrame] = useState('day');
  const [todayData, setTodayData] = useState(glucoseReadings);
  const [weeklyData, setWeeklyData] = useState(weeklyGlucoseAverages.map(item => ({ 
    time: item.day, 
    value: item.value 
  })));

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleAddReading = () => {
    if (!glucoseValue || isNaN(Number(glucoseValue))) {
      Alert.alert('Error', 'Please enter a valid glucose value');
      return;
    }

    const newReading = {
      time: new Date().getHours() + ':' + new Date().getMinutes(),
      value: Number(glucoseValue)
    };

    // Add the new reading to the data
    const updatedData = [...todayData, newReading];
    setTodayData(updatedData);
    
    // Close the modal and reset the input
    setModalVisible(false);
    setGlucoseValue('');

    Alert.alert('Success', 'Glucose reading added successfully');
  };

  // Calculate statistics
  const calculateStats = () => {
    const values = todayData.map(item => item.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const inRange = values.filter(val => val >= 80 && val <= 140).length;
    const timeInRange = (inRange / values.length) * 100;

    return { min, max, avg, timeInRange };
  };

  const stats = calculateStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Glucose Monitoring</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.currentReadingCard}>
          <Text style={styles.currentReadingLabel}>Current Reading</Text>
          <Text style={styles.currentReadingValue}>
            {todayData[todayData.length - 1].value} <Text style={styles.unit}>mg/dL</Text>
          </Text>
          <Text style={styles.currentReadingTime}>
            Last updated: {todayData[todayData.length - 1].time}
          </Text>
          <View style={styles.statusIndicator}>
            <View style={[
              styles.statusDot, 
              todayData[todayData.length - 1].value > 140 ? styles.highStatus :
              todayData[todayData.length - 1].value < 80 ? styles.lowStatus :
              styles.normalStatus
            ]} />
            <Text style={styles.statusText}>
              {todayData[todayData.length - 1].value > 140 ? 'High' :
               todayData[todayData.length - 1].value < 80 ? 'Low' :
               'In Range'}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.min}</Text>
            <Text style={styles.statLabel}>Min</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.max}</Text>
            <Text style={styles.statLabel}>Max</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.avg.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Avg</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.timeInRange.toFixed(0)}%</Text>
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

        {timeFrame === 'day' && (
          <GlucoseChart 
            data={todayData} 
            title="Today's Readings" 
            targetRange={{ min: 80, max: 140 }}
          />
        )}

        {timeFrame === 'week' && (
          <GlucoseChart 
            data={weeklyData} 
            title="Weekly Readings" 
            targetRange={{ min: 80, max: 140 }}
          />
        )}

        {timeFrame === 'month' && (
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonText}>Monthly view coming soon</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoCardContent}>
            <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.infoCardText}>
              Target range: 80-140 mg/dL. Consult your healthcare provider for personalized targets.
            </Text>
          </View>
        </View>

        <Button
          title="Connect Glucose Monitor"
          variant="outline"
          icon="bluetooth-outline"
          onPress={() => Alert.alert('Coming Soon', 'Device connection will be available in the next update.')}
          style={styles.connectButton}
        />
      </ScrollView>

      {/* Add Reading Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Glucose Reading</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Glucose Value (mg/dL)</Text>
            <TextInput
              style={styles.input}
              value={glucoseValue}
              onChangeText={setGlucoseValue}
              placeholder="Enter glucose value"
              keyboardType="numeric"
            />

            <Button
              title="Add Reading"
              onPress={handleAddReading}
              style={styles.addReadingButton}
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
  currentReadingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.l,
    marginBottom: spacing.m,
    alignItems: 'center',
  },
  currentReadingLabel: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
    marginBottom: spacing.s,
  },
  currentReadingValue: {
    fontSize: 48,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.primary,
  },
  unit: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.regular as any,
  },
  currentReadingTime: {
    fontSize: typography.fontSizes.small,
    color: colors.text,
    opacity: 0.7,
    marginTop: spacing.s,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.m,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  normalStatus: {
    backgroundColor: colors.success,
  },
  highStatus: {
    backgroundColor: colors.error,
  },
  lowStatus: {
    backgroundColor: colors.warning,
  },
  statusText: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSizes.small,
    color: colors.text,
  },
  timeFrameSelector: {
    flexDirection: 'row',
    marginBottom: spacing.m,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.xs,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: spacing.s,
    alignItems: 'center',
    borderRadius: borderRadius.small,
  },
  activeTimeFrame: {
    backgroundColor: colors.primary,
  },
  timeFrameText: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
  },
  activeTimeFrameText: {
    color: colors.background,
    fontWeight: typography.fontWeights.medium as any,
  },
  comingSoonContainer: {
    padding: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    marginVertical: spacing.m,
  },
  comingSoonText: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
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
  connectButton: {
    marginVertical: spacing.m,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: spacing.l,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.l,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  modalTitle: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
  },
  inputLabel: {
    fontSize: typography.fontSizes.medium,
    color: colors.text,
    marginBottom: spacing.s,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.disabled,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    fontSize: typography.fontSizes.medium,
    marginBottom: spacing.l,
  },
  addReadingButton: {
    marginBottom: spacing.s,
  },
});

export default GlucoseScreen;
