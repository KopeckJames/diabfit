import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, typography, spacing } from '../utils/theme';

interface GlucoseChartProps {
  data: Array<{ time: string; value: number }>;
  title?: string;
  targetRange?: { min: number; max: number };
}

const GlucoseChart: React.FC<GlucoseChartProps> = ({
  data,
  title = 'Glucose Readings',
  targetRange = { min: 80, max: 140 }
}) => {
  const screenWidth = Dimensions.get('window').width - spacing.m * 2;

  const chartData = {
    labels: data.map(item => item.time),
    datasets: [
      {
        data: data.map(item => item.value),
        color: (opacity = 1) => colors.primary,
        strokeWidth: 2,
      },
      {
        data: Array(data.length).fill(targetRange.max),
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
        strokeWidth: 1,
        withDots: false,
      },
      {
        data: Array(data.length).fill(targetRange.min),
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
        strokeWidth: 1,
        withDots: false,
      },
    ],
    legend: ['Glucose', 'Max Target', 'Min Target'],
  };

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  // Calculate average glucose
  const average = data.reduce((sum, item) => sum + item.value, 0) / data.length;

  // Calculate time in range percentage
  const inRangeCount = data.filter(
    item => item.value >= targetRange.min && item.value <= targetRange.max
  ).length;
  const timeInRangePercentage = (inRangeCount / data.length) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={styles.statValue}>{average.toFixed(0)} mg/dL</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Time in Range</Text>
          <Text style={styles.statValue}>{timeInRangePercentage.toFixed(0)}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
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
  title: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as any,
    marginBottom: spacing.m,
    color: colors.text,
  },
  chart: {
    marginVertical: spacing.m,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.m,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.fontSizes.small,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.primary,
  },

});

export default GlucoseChart;
