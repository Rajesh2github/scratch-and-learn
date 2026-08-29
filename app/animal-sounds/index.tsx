import React, { useState, useEffect, useCallback } from 'react';
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
  FadeInDown,
  runOnJS,
} from 'react-native-reanimated';
import { SoundManager } from '../../src/utils/audio';
import { shuffleArray } from '../../src/utils/shuffle';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimalItem {
  id: string;
  name: string;
  emoji: string;
  soundPhrase: string; // Phonetic noise spelling for TTS synthesis
}

const animalsList: AnimalItem[] = [
  { id: 'dog', name: 'Dog', emoji: '🐶', soundPhrase: 'Woof! Woof! ... Woof!' },
  { id: 'cat', name: 'Cat', emoji: '🐱', soundPhrase: 'Meow! Meow! ... Meow!' },
  { id: 'cow', name: 'Cow', emoji: '🐄', soundPhrase: 'Moooo! Moooo!' },
  { id: 'lion', name: 'Lion', emoji: '🦁', soundPhrase: 'Roar! Roar! ... Roar!' },
  { id: 'elephant', name: 'Elephant', emoji: '🐘', soundPhrase: 'Pawooo! Pawooo!' },
  { id: 'horse', name: 'Horse', emoji: '🐎', soundPhrase: 'Neigh! Neigh!' },
  { id: 'sheep', name: 'Sheep', emoji: '🐑', soundPhrase: 'Baaa! Baaa! ... Baaa!' },
  { id: 'duck', name: 'Duck', emoji: '🦆', soundPhrase: 'Quack! Quack! ... Quack!' },
];

const AnimalCard: React.FC<{
  item: AnimalItem;
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
      style={[styles.animalCard, getButtonStyle(), animatedStyle]}
    >
      <Text style={styles.animalEmoji}>{item.emoji}</Text>
      <Text style={styles.animalName}>{item.name}</Text>
    </AnimatedTouchableOpacity>
  );
};

export default function AnimalSoundsScreen() {
  const router = useRouter();

  const [muted, setMuted] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState<AnimalItem | null>(null);
  const [options, setOptions] = useState<AnimalItem[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState<string[]>([]);
  const [isCorrectSelected, setIsCorrectSelected] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const feedbackScale = useSharedValue(0);
  const waveScale = useSharedValue(1);

  // Generate new round
  const generateRound = useCallback(() => {
    // Pick random target
    const targetIdx = Math.floor(Math.random() * animalsList.length);
    const roundTarget = animalsList[targetIdx];

    // Get 3 other unique random distractors
    const candidates = animalsList.filter((item) => item.id !== roundTarget.id);
    const distractors = shuffleArray(candidates).slice(0, 3);

    // Combine and shuffle
    const roundOptions = shuffleArray([roundTarget, ...distractors]);

    setTarget(roundTarget);
    setOptions(roundOptions);
    setWrongAttempts([]);
    setIsCorrectSelected(false);
    setFeedbackText('');
    feedbackScale.value = 0;
  }, [feedbackScale]);

  // Init settings
  useEffect(() => {
    const loadSettings = async () => {
      await SoundManager.init();
      setMuted(SoundManager.getMuted());
      generateRound();
    };
    loadSettings();
  }, [generateRound]);

  // Animate sound wave button pulsing
  const animateWave = useCallback(() => {
    waveScale.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withTiming(1.0, { duration: 150 }),
      withTiming(1.15, { duration: 100 }),
      withTiming(1.0, { duration: 100 })
    );
  }, [waveScale]);

  // Trigger sound play
  const playAnimalSound = useCallback(async () => {
    if (!target) return;
    animateWave();
    await SoundManager.unloadAll();
    await SoundManager.playWord(target.soundPhrase);
  }, [target, animateWave]);

  // Play animal sound upon target load
  useEffect(() => {
    if (target) {
      const timer = setTimeout(() => {
        playAnimalSound();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [target, playAnimalSound]);

  const toggleSound = async () => {
    const nextMute = !muted;
    await SoundManager.setMuted(nextMute);
    setMuted(nextMute);
  };

  const handleOptionPress = (item: AnimalItem) => {
    if (isCorrectSelected || !target) return;

    if (item.id === target.id) {
      setIsCorrectSelected(true);
      setScore((prev) => prev + 1);
      setFeedbackText('🎉 Great Job! ⭐');
      feedbackScale.value = withSpring(1);
      SoundManager.playSuccess();
      SoundManager.playWord(`Yes! It is a ... ${item.name}!`);

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
                  category: 'animal-sounds',
                },
              } as any);
            }
          }
        });
      }, 1600);
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

  const waveAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: waveScale.value }],
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

        {/* 2. Visual / Audio Prompt Area */}
        <View style={styles.promptSection}>
          <Text style={styles.promptLabel}>Which animal says this?</Text>
          
          <AnimatedTouchableOpacity
            onPress={playAnimalSound}
            style={[styles.waveButton, waveAnimatedStyle]}
            accessibilityRole="button"
            accessibilityLabel="Play animal sound"
          >
            <Text style={styles.waveEmoji}>🔊</Text>
            <View style={styles.pulseIndicator}>
              <Text style={styles.pulseText}>TAP TO LISTEN</Text>
            </View>
          </AnimatedTouchableOpacity>
        </View>

        {/* 3. Animals Grid Area */}
        <View style={styles.gridSection}>
          <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.grid}>
            {options.map((item) => {
              const isCorrect = isCorrectSelected && item.id === target.id;
              const isWrong = wrongAttempts.includes(item.id);

              return (
                <AnimalCard
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
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#7F8C8D',
    marginBottom: 16,
  },
  waveButton: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FF8A3D',
    borderWidth: 6,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  waveEmoji: {
    fontSize: 48,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  pulseIndicator: {
    position: 'absolute',
    bottom: -16,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pulseText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  gridSection: {
    flex: 3.5,
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  animalCard: {
    width: '44%',
    margin: '3%',
    height: 100,
    borderRadius: 24,
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
  animalEmoji: {
    fontSize: 40,
    textAlign: 'center',
  },
  animalName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4B6584',
    marginTop: 4,
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
