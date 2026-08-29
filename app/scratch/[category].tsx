import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
  runOnJS,
} from 'react-native-reanimated';
import { useGame } from '../../src/hooks/useGame';
import { categories } from '../../src/data/categories';
import { ScratchCard } from '../../src/components/ScratchCard';
import { AnswerOption } from '../../src/components/AnswerOption';
import { ProgressBar } from '../../src/components/ProgressBar';
import { SoundManager } from '../../src/utils/audio';

export default function GameScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();

  // Resolve category info
  const categoryInfo = categories.find((c) => itemEqualsId(c.id, category)) || categories[0];
  const categoryId = categoryInfo.id;

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    score,
    isComplete,
    selectedAnswer,
    wrongAttempts,
    isCorrectSelected,
    hasScratchedEnough,
    setHasScratchedEnough,
    selectAnswer,
    nextQuestion,
  } = useGame(categoryId);

  const [feedbackText, setFeedbackText] = useState('');
  const feedbackScale = useSharedValue(0);
  const [muted, setMuted] = useState(false);
  const transitionTimeoutRef = useRef<any>(null);

  useEffect(() => {
    // Load initial sound settings
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

  // Helper helper to avoid TypeScript/string casing issues
  function itemEqualsId(id: string, query: string | undefined): boolean {
    if (!query) return false;
    return id.toLowerCase() === query.toLowerCase();
  }

  const getQuestionPrompt = () => {
    switch (categoryId) {
      case 'alphabets':
        return 'What letter is this?';
      case 'numbers':
        return 'How many items?';
      case 'animals':
        return 'What animal is this?';
      case 'vegetables':
        return 'What vegetable is this?';
      case 'vehicles':
        return 'What vehicle is this?';
      case 'colors':
        return 'What color is this?';
      case 'shapes':
        return 'What shape is this?';
      default:
        return 'What fruit is this?';
    }
  };

  // Handle completion navigation
  useEffect(() => {
    if (isComplete) {
      router.replace({
        pathname: '/result',
        params: {
          score: score.toString(),
          total: totalQuestions.toString(),
          category: categoryId,
        },
      });
    }
  }, [isComplete, score, totalQuestions, categoryId, router]);

  // Clean up sounds and timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      SoundManager.unloadAll();
    };
  }, []);

  // Handle option press
  const handleOptionPress = (option: string) => {
    if (isCorrectSelected || !hasScratchedEnough) return;

    selectAnswer(option);

    if (currentQuestion && option === currentQuestion.answer) {
      setFeedbackText('🎉 Great Job! ⭐');
      feedbackScale.value = withSpring(1);
      SoundManager.playSuccess();
      SoundManager.playWord(currentQuestion.answer);

      // Auto progression after celebration delay
      transitionTimeoutRef.current = setTimeout(() => {
        feedbackScale.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(setFeedbackText)('');
            runOnJS(nextQuestion)();
          }
        });
      }, 1500);
    } else {
      setFeedbackText('😊 Try Again!');
      feedbackScale.value = withSpring(1);
      SoundManager.playWrong();

      // Hide negative feedback automatically after a short delay
      transitionTimeoutRef.current = setTimeout(() => {
        feedbackScale.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(setFeedbackText)('');
          }
        });
      }, 1200);
    }
  };

  const handleScratchComplete = () => {
    setHasScratchedEnough(true);
    // Play pronunciation of the word when revealed!
    if (currentQuestion) {
      SoundManager.playWord(currentQuestion.answer);
    }
  };

  const feedbackAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: feedbackScale.value }],
    };
  });

  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Game...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FFF9F0' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />

      {/* 1. Header Area */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/scratch')}
          accessibilityRole="button"
          accessibilityLabel="Back to categories"
        >
          <Text style={styles.backButtonText}>🏠</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: categoryInfo.color }]}>
          {categoryInfo.icon} {categoryInfo.name}
        </Text>
        <TouchableOpacity
          style={[styles.soundToggleHeader, muted ? styles.soundMutedHeader : styles.soundOnHeader]}
          onPress={toggleSound}
          accessibilityRole="button"
          accessibilityLabel={muted ? "Turn sound on" : "Mute sound"}
        >
          <Text style={styles.soundToggleHeaderText}>{muted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Progress Tracker */}
      <ProgressBar current={currentIndex + 1} total={totalQuestions} />

      {/* 3. Center Scratch Card Area */}
      <View style={styles.scratchSection}>
        <View style={styles.cardSizer}>
          <ScratchCard
            key={currentQuestion.id} // Re-mounts the scratch card for each question to reset all state
            emoji={currentQuestion.emoji}
            image={currentQuestion.image}
            onComplete={handleScratchComplete}
            isComplete={hasScratchedEnough}
          />
        </View>
      </View>

      {/* 4. Question & State prompt */}
      <View style={styles.promptSection}>
        {hasScratchedEnough ? (
          <Animated.View entering={FadeIn} style={styles.questionContainer}>
            <Text style={styles.questionText}>{getQuestionPrompt()}</Text>
          </Animated.View>
        ) : (
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Scratch the grey box with your finger to reveal! 👆🏼
            </Text>
          </View>
        )}
      </View>

      {/* 5. Choice Grid Area */}
      <View style={styles.choicesSection}>
        {hasScratchedEnough ? (
          <Animated.View
            entering={FadeInDown.duration(400).springify().damping(12)}
            style={styles.optionsGrid}
          >
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = isCorrectSelected && currentQuestion.answer === option;
              const isWrong = wrongAttempts.includes(option);

              return (
                <AnswerOption
                  key={option}
                  text={option}
                  onPress={() => handleOptionPress(option)}
                  isSelected={isSelected}
                  isCorrect={isCorrect}
                  isWrong={isWrong}
                  disabled={isCorrectSelected}
                />
              );
            })}
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.unlockCard}
          >
            <Text style={styles.unlockEmoji}>🎁 🔑 ✨</Text>
            <Text style={styles.unlockTitle}>Secret Answers Locked!</Text>
            <Text style={styles.unlockSub}>
              Scratch the box above with your finger to reveal the secret fruit and unlock options!
            </Text>
          </Animated.View>
        )}
      </View>

      {/* 6. Friendly Celebration Overlay */}
      {feedbackText !== '' && (
        <Animated.View
          style={[styles.feedbackOverlay, feedbackAnimatedStyle]}
          pointerEvents="none"
        >
          <View
            style={[
              styles.feedbackBubble,
              feedbackText.includes('Great')
                ? styles.successBubble
                : styles.wrongBubble,
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    paddingHorizontal: 20,
    height: 60,
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
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  soundToggleHeader: {
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
  soundOnHeader: {
    backgroundColor: '#6BCB77',
  },
  soundMutedHeader: {
    backgroundColor: '#A5B1C2',
  },
  soundToggleHeaderText: {
    fontSize: 18,
  },
  scratchSection: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  cardSizer: {
    width: 280,
    height: 280,
    maxWidth: '85%',
    maxHeight: '85%',
  },
  promptSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  questionContainer: {
    alignItems: 'center',
  },
  questionText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2D3748',
    textAlign: 'center',
  },
  instructionContainer: {
    backgroundColor: '#FFECD9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFD19B',
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D35400',
    textAlign: 'center',
    lineHeight: 22,
  },
  choicesSection: {
    flex: 3,
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  unlockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  unlockEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  unlockTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#4B6584',
    textAlign: 'center',
    marginBottom: 6,
  },
  unlockSub: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A5B1C2',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
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
