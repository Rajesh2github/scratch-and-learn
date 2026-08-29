import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withSequence,
  withTiming,
  SharedValue,
} from 'react-native-reanimated';
import { SoundManager } from '../src/utils/audio';

interface AnimatedStarProps {
  scaleSV: SharedValue<number>;
  isFilled: boolean;
}

const AnimatedStar: React.FC<AnimatedStarProps> = ({ scaleSV, isFilled }) => {
  const starStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleSV.value }],
      opacity: scaleSV.value === 0 ? 0 : 1,
    };
  });

  return (
    <Animated.Text
      style={[
        styles.starText,
        starStyle,
        !isFilled && styles.starEmpty,
      ]}
    >
      ⭐
    </Animated.Text>
  );
};

export default function ResultScreen() {
  const router = useRouter();
  const { score, total, category } = useLocalSearchParams<{
    score: string;
    total: string;
    category: string;
  }>();

  const numScore = parseInt(score || '0', 10);
  const numTotal = parseInt(total || '10', 10);

  const [muted, setMuted] = useState(false);

  useEffect(() => {
    // Load initial sound setting
    const loadSoundSetting = async () => {
      await SoundManager.init();
      setMuted(SoundManager.getMuted());
    };
    loadSoundSetting();
  }, []);

  const toggleSound = async () => {
    const nextMute = !muted;
    await SoundManager.setMuted(nextMute);
    setMuted(nextMute);
  };

  // Stable shared values for stars
  const starScale1 = useSharedValue(0);
  const starScale2 = useSharedValue(0);
  const starScale3 = useSharedValue(0);
  const starScale4 = useSharedValue(0);
  const starScale5 = useSharedValue(0);

  const starScales = useMemo(() => [
    starScale1,
    starScale2,
    starScale3,
    starScale4,
    starScale5,
  ], [starScale1, starScale2, starScale3, starScale4, starScale5]);

  const titleScale = useSharedValue(0);

  // Decide congratulation message based on score
  const congratulationInfo = useMemo(() => {
    if (numScore === 10) {
      return { title: '🎉 Perfect Score! 🎉', message: 'You are an absolute expert!', stars: 5 };
    } else if (numScore >= 8) {
      return { title: '🌟 Amazing Job! 🌟', message: 'Fantastic reading & searching!', stars: 5 };
    } else if (numScore >= 6) {
      return { title: '👍 Great Job! 👍', message: 'You are learning so fast!', stars: 4 };
    } else if (numScore >= 4) {
      return { title: '✨ Good Try! ✨', message: 'Keep practice and you will get them all!', stars: 3 };
    } else {
      return { title: '💖 Keep Learning! 💖', message: 'Every scratch makes you smarter!', stars: 2 };
    }
  }, [numScore]);

  useEffect(() => {
    // Pop title in with a spring bounce
    titleScale.value = withSpring(1, { damping: 8, stiffness: 90 });

    // Cascade animate stars one by one
    starScales.forEach((scaleSV, index) => {
      if (index < congratulationInfo.stars) {
        scaleSV.value = withDelay(
          300 + index * 150,
          withSequence(
            withTiming(1.3, { duration: 150 }),
            withSpring(1, { damping: 8 })
          )
        );
      }
    });
  }, [congratulationInfo.stars, starScales, titleScale]);

  const handlePlayAgain = () => {
    const gameId = category || 'fruits';

    switch (gameId) {
      case 'memory':
        router.replace('/memory');
        break;
      case 'puzzle':
        router.replace('/puzzle');
        break;
      case 'find-object':
        router.replace('/find-object');
        break;
      case 'animal-sounds':
        router.replace('/animal-sounds');
        break;
      case 'colors':
        router.replace('/colors');
        break;
      case 'numbers':
        router.replace('/numbers');
        break;
      case 'alphabets':
        router.replace('/abc-learning');
        break;
      case 'ride':
        router.replace('/ride');
        break;
      default:
        // Standard Scratch & Guess categories fallback
        router.replace(`/scratch/${gameId}`);
        break;
    }
  };

  const handleHome = () => {
    router.replace('/');
  };

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: titleScale.value }],
    };
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.soundToggle, muted ? styles.soundMuted : styles.soundOn]}
          onPress={toggleSound}
          accessibilityRole="button"
          accessibilityLabel={muted ? "Turn sound on" : "Mute sound"}
        >
          <Text style={styles.soundToggleText}>{muted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>

        {/* 1. Header Celebration Title */}
        <Animated.View style={[styles.header, titleAnimatedStyle]}>
          <Text style={styles.congratulationText}>{congratulationInfo.title}</Text>
        </Animated.View>

        {/* 2. Stars Reward Box */}
        <View style={styles.starsContainer}>
          {starScales.map((scaleSV, index) => {
            const isFilled = index < congratulationInfo.stars;
            return (
              <AnimatedStar
                key={index}
                scaleSV={scaleSV}
                isFilled={isFilled}
              />
            );
          })}
        </View>

        {/* 3. Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>YOUR SCORE</Text>
          <Text style={styles.scoreValue}>
            {numScore} <Text style={styles.scoreTotal}>/ {numTotal}</Text>
          </Text>
          <Text style={styles.messageText}>{congratulationInfo.message}</Text>
        </View>

        {/* 4. Action Controls */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel="Play Again"
            style={[styles.button, styles.primaryButton]}
            onPress={handlePlayAgain}
          >
            <Text style={styles.primaryButtonText}>Play Again 🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go to Home"
            style={[styles.button, styles.secondaryButton]}
            onPress={handleHome}
          >
            <Text style={styles.secondaryButtonText}>Home Screen 🏠</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  soundToggle: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  soundOn: {
    backgroundColor: '#6BCB77',
  },
  soundMuted: {
    backgroundColor: '#A5B1C2',
  },
  soundToggleText: {
    fontSize: 20,
  },
  header: {
    marginBottom: 16,
  },
  congratulationText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF6B6B',
    textAlign: 'center',
    lineHeight: 40,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
    marginBottom: 32,
  },
  starText: {
    fontSize: 48,
    marginHorizontal: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  starEmpty: {
    opacity: 0.2,
  },
  scoreCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#FFD93D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 40,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#A5B1C2',
    letterSpacing: 2,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#2D3748',
  },
  scoreTotal: {
    fontSize: 28,
    color: '#7F8C8D',
    fontWeight: '800',
  },
  messageText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4B6584',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '85%',
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#6BCB77',
    borderColor: '#4BAA57',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#4B6584',
    fontSize: 20,
    fontWeight: '800',
  },
});
