import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeIn,
  FadeInDown,
  runOnJS,
} from 'react-native-reanimated';
import { fruitsQuestions } from '../../src/data/fruits';
import { animalsQuestions } from '../../src/data/animals';
import { vegetablesQuestions } from '../../src/data/vegetables';
import { vehiclesQuestions } from '../../src/data/vehicles';
import { SoundManager } from '../../src/utils/audio';
import { shuffleArray } from '../../src/utils/shuffle';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface ObjectItem {
  id: string;
  name: string;
  emoji: string;
}

const ObjectCard: React.FC<{
  item: ObjectItem;
  onPress: () => void;
  isCorrect: boolean;
  isWrong: boolean;
  disabled: boolean;
}> = ({ item, onPress, isCorrect, isWrong, disabled }) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);

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

  useEffect(() => {
    if (isCorrect) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 150 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );
    }
  }, [isCorrect, scale]);

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withTiming(0.92, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateX: translateX.value }],
    };
  });

  const getButtonStyle = () => {
    if (isCorrect) return styles.correctCard;
    if (isWrong) return styles.wrongCard;
    return styles.defaultCard;
  };

  return (
    <AnimatedTouchableOpacity
      accessible
      accessibilityRole="button"
      accessibilityLabel={item.name}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.objectCard, getButtonStyle(), animatedStyle]}
    >
      <Text style={styles.objectEmoji}>{item.emoji}</Text>
    </AnimatedTouchableOpacity>
  );
};

export default function FindObjectScreen() {
  const router = useRouter();

  // Load objects pool
  const objectPool = useMemo(() => {
    const rawList = [
      ...fruitsQuestions,
      ...animalsQuestions,
      ...vegetablesQuestions,
      ...vehiclesQuestions,
    ];
    return rawList.map((item) => ({
      id: item.id,
      name: item.answer,
      emoji: item.emoji,
    }));
  }, []);

  const [muted, setMuted] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState<ObjectItem | null>(null);
  const [options, setOptions] = useState<ObjectItem[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState<string[]>([]);
  const [isCorrectSelected, setIsCorrectSelected] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const feedbackScale = useSharedValue(0);

  // Generate new round
  const generateRound = useCallback(() => {
    if (objectPool.length < 6) return;

    // Pick a random target
    const targetIdx = Math.floor(Math.random() * objectPool.length);
    const roundTarget = objectPool[targetIdx];

    // Get 5 other unique random distractors
    const candidates = objectPool.filter((item) => item.id !== roundTarget.id);
    const distractors = shuffleArray(candidates).slice(0, 5);

    // Combine and shuffle
    const roundOptions = shuffleArray([roundTarget, ...distractors]);

    setTarget(roundTarget);
    setOptions(roundOptions);
    setWrongAttempts([]);
    setIsCorrectSelected(false);
    setFeedbackText('');
    feedbackScale.value = 0;
  }, [objectPool, feedbackScale]);

  // Init settings
  useEffect(() => {
    const loadSettings = async () => {
      await SoundManager.init();
      setMuted(SoundManager.getMuted());
      generateRound();
    };
    loadSettings();
  }, [generateRound]);

  // Speak find question upon target load
  useEffect(() => {
    if (target) {
      const speakTarget = async () => {
        await SoundManager.unloadAll();
        await SoundManager.playWord(`Find the ... ${target.name}!`);
      };
      const timer = setTimeout(speakTarget, 300);
      return () => clearTimeout(timer);
    }
  }, [target]);

  const toggleSound = async () => {
    const nextMute = !muted;
    await SoundManager.setMuted(nextMute);
    setMuted(nextMute);
  };

  const handleOptionPress = (item: ObjectItem) => {
    if (isCorrectSelected || !target) return;

    if (item.id === target.id) {
      setIsCorrectSelected(true);
      setScore((prev) => prev + 1);
      setFeedbackText('🎉 Great Job! ⭐');
      feedbackScale.value = withSpring(1);
      SoundManager.playSuccess();
      SoundManager.playWord(item.name);

      // Delay transition to next round
      setTimeout(() => {
        feedbackScale.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(setFeedbackText)('');
            if (round < 5) {
              runOnJS(setRound)(round + 1);
              runOnJS(generateRound)();
            } else {
              // Redirect to results
              runOnJS(router.replace)({
                pathname: '/result',
                params: {
                  score: (score + 1).toString(),
                  total: '5',
                  category: 'find-object',
                },
              } as any);
            }
          }
        });
      }, 1500);
    } else {
      setWrongAttempts((prev) => [...prev, item.id]);
      setFeedbackText('😊 Try Again!');
      feedbackScale.value = withSpring(1);
      SoundManager.playWrong();

      setTimeout(() => {
        feedbackScale.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(setFeedbackText)('');
          }
        });
      }, 1100);
    }
  };

  const feedbackAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: feedbackScale.value }],
    };
  });

  if (!target) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Game...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
      <View style={styles.container}>
        {/* 1. Header action bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/')}
            accessibilityRole="button"
            accessibilityLabel="Back to main menu"
          >
            <Text style={styles.backButtonText}>🏠</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Round {round} of 5</Text>
          <TouchableOpacity
            style={[styles.soundToggle, muted ? styles.soundMuted : styles.soundOn]}
            onPress={toggleSound}
            accessibilityRole="button"
            accessibilityLabel={muted ? "Turn sound on" : "Mute sound"}
          >
            <Text style={styles.soundToggleText}>{muted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Visual Prompt Area */}
        <View style={styles.promptSection}>
          <Text style={styles.promptLabel}>Can you find the...</Text>
          <Animated.View entering={FadeIn.duration(400)} style={styles.targetBubble}>
            <Text style={styles.targetText}>{target.name.toUpperCase()}</Text>
            <TouchableOpacity
              style={styles.soundRepeat}
              onPress={() => SoundManager.playWord(`Find ... ${target.name}`)}
              accessibilityRole="button"
              accessibilityLabel="Listen again"
            >
              <Text style={styles.soundRepeatText}>🔊 Listen</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* 3. Object Grid Area */}
        <View style={styles.gridSection}>
          <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.grid}>
            {options.map((item, idx) => {
              const isCorrect = isCorrectSelected && item.id === target.id;
              const isWrong = wrongAttempts.includes(item.id);

              return (
                <ObjectCard
                  key={item.id}
                  item={item}
                  onPress={() => handleOptionPress(item)}
                  isCorrect={isCorrect}
                  isWrong={isWrong}
                  disabled={isCorrectSelected}
                />
              );
            })}
          </Animated.View>
        </View>
      </View>

      {/* 4. Feedback Overlay */}
      {feedbackText !== '' && (
        <Animated.View style={[styles.feedbackOverlay, feedbackAnimatedStyle]} pointerEvents="none">
          <View
            style={[
              styles.feedbackBubble,
              feedbackText.includes('Great') ? styles.successBubble : styles.wrongBubble,
            ]}
          >
            <Text style={styles.feedbackText}>{feedbackText}</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#7F8C8D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    marginTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#4B6584',
    textAlign: 'center',
  },
  soundToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  soundOn: {
    backgroundColor: '#6BCB77',
  },
  soundMuted: {
    backgroundColor: '#A5B1C2',
  },
  soundToggleText: {
    fontSize: 18,
  },
  promptSection: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#7F8C8D',
    marginBottom: 8,
  },
  targetBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 5,
    borderColor: '#4D96FF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  targetText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#4D96FF',
    textShadowColor: 'rgba(0, 0, 0, 0.02)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  soundRepeat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#B3D7FF',
  },
  soundRepeatText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4D96FF',
  },
  gridSection: {
    flex: 4,
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  objectCard: {
    width: '28%',
    margin: '2.5%',
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  defaultCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  correctCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#6BCB77',
  },
  wrongCard: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF6B6B',
  },
  objectEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  feedbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  feedbackBubble: {
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 30,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  successBubble: {
    backgroundColor: '#6BCB77',
  },
  wrongBubble: {
    backgroundColor: '#FF6B6B',
  },
  feedbackText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
