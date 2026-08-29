import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface ProgressBarProps {
  current: number; // 1-indexed current question
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(current / total, {
      damping: 15,
      stiffness: 120,
    });
  }, [current, total, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.labelText}>
          Question {current} of {total}
        </Text>
        <Text style={styles.percentageText}>
          {Math.round((current / total) * 100)}%
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4B6584',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A5B1C2',
  },
  track: {
    height: 16,
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  fill: {
    height: '100%',
    backgroundColor: '#6BCB77',
    borderRadius: 6,
  },
});
