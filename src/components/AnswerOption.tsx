import React, { useEffect } from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnswerOptionProps {
  text: string;
  onPress: () => void;
  isSelected: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  disabled: boolean;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  text,
  onPress,
  isSelected,
  isCorrect,
  isWrong,
  disabled,
}) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);

  // Animate wrong selection with a friendly horizontal shake
  useEffect(() => {
    if (isWrong) {
      translateX.value = withSequence(
        withTiming(-12, { duration: 50 }),
        withTiming(12, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [isWrong, translateX]);

  // Animate correct selection with a playful bounce scale up
  useEffect(() => {
    if (isCorrect && isSelected) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 150 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );
    }
  }, [isCorrect, isSelected, scale]);

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateX: translateX.value }],
    };
  });

  // Determine button styles based on states
  const getButtonStyle = () => {
    if (isCorrect) return styles.correctButton;
    if (isWrong) return styles.wrongButton;
    if (isSelected) return styles.selectedButton;
    return styles.defaultButton;
  };

  const getTextStyle = () => {
    if (isCorrect || isWrong || isSelected) return styles.selectedText;
    return styles.defaultText;
  };

  return (
    <AnimatedPressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityState={{ disabled }}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.button, getButtonStyle(), animatedStyle]}
    >
      <Text style={[styles.text, getTextStyle()]}>{text}</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '46%',
    margin: '2%',
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  defaultButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  selectedButton: {
    backgroundColor: '#4D96FF',
    borderColor: '#3076D8',
  },
  correctButton: {
    backgroundColor: '#6BCB77',
    borderColor: '#4BAA57',
  },
  wrongButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#E04A4A',
  },
  text: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  defaultText: {
    color: '#2D3748',
  },
  selectedText: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
