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
  FadeIn,
  FadeInDown,
  runOnJS,
} from 'react-native-reanimated';
import { SoundManager } from '../../src/utils/audio';
import { shuffleArray } from '../../src/utils/shuffle';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface ColorItem {
  id: string;
  name: string;
  hex: string;
  exampleEmoji: string; // Dynamic quiz matching target object
}

const colorsList: ColorItem[] = [
  { id: 'red', name: 'Red', hex: '#FF6B6B', exampleEmoji: '🍎' },
  { id: 'blue', name: 'Blue', hex: '#4D96FF', exampleEmoji: '🐋' },
  { id: 'green', name: 'Green', hex: '#6BCB77', exampleEmoji: '🥦' },
  { id: 'yellow', name: 'Yellow', hex: '#FFD93D', exampleEmoji: '🍌' },
  { id: 'orange', name: 'Orange', hex: '#FF9F43', exampleEmoji: '🍊' },
  { id: 'purple', name: 'Purple', hex: '#5f27cd', exampleEmoji: '🍇' },
  { id: 'pink', name: 'Pink', hex: '#ff9ff3', exampleEmoji: '🌸' },
];

const QuizOptionCard: React.FC<{
  item: ColorItem;
  targetColor: ColorItem;
  quizIsCorrectSelected: boolean;
  quizWrongAttempts: string[];
  onPress: () => void;
}> = ({ item, targetColor, quizIsCorrectSelected, quizWrongAttempts, onPress }) => {
  const isCorrect = quizIsCorrectSelected && item.id === targetColor.id;
  const isWrong = quizWrongAttempts.includes(item.id);
  
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (isWrong) {
      translateX.value = withSequence(
        withTiming(-12, { duration: 50 }),
        withTiming(12, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [isWrong, translateX]);

  useEffect(() => {
    if (isCorrect) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 150 }),
        withSpring(1)
      );
    }
  }, [isCorrect, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateX: translateX.value }],
    };
  });

  const getQuizCardStyle = () => {
    if (isCorrect) return { backgroundColor: '#E8F5E9', borderColor: '#6BCB77' };
    if (isWrong) return { backgroundColor: '#FFEBEE', borderColor: '#FF6B6B' };
    return { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' };
  };

  return (
    <AnimatedTouchableOpacity
      disabled={quizIsCorrectSelected}
      onPress={onPress}
      style={[styles.quizCard, getQuizCardStyle(), animatedStyle]}
    >
      <Text style={styles.quizEmoji}>{item.exampleEmoji}</Text>
    </AnimatedTouchableOpacity>
  );
};

export default function ColorsScreen() {
  const router = useRouter();

  const [muted, setMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'learn' | 'play'>('learn');

  // --- LEARN MODE STATE ---
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const activeColor = colorsList[activeColorIdx];

  // --- PLAY MODE STATE ---
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [targetColor, setTargetColor] = useState<ColorItem | null>(null);
  const [quizOptions, setQuizOptions] = useState<ColorItem[]>([]);
  const [quizWrongAttempts, setQuizWrongAttempts] = useState<string[]>([]);
  const [quizIsCorrectSelected, setQuizIsCorrectSelected] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const feedbackScale = useSharedValue(0);

  // Init settings
  useEffect(() => {
    const loadSettings = async () => {
      await SoundManager.init();
      setMuted(SoundManager.getMuted());
    };
    loadSettings();
  }, []);

  // Speak color on Learn change
  useEffect(() => {
    if (activeTab === 'learn' && activeColor) {
      const speakColor = async () => {
        await SoundManager.unloadAll();
        await SoundManager.playWord(activeColor.name);
      };
      const timer = setTimeout(speakColor, 200);
      return () => clearTimeout(timer);
    }
  }, [activeColor, activeTab]);

  // Generate quiz round
  const generateQuizRound = useCallback(() => {
    // Pick random target color
    const targetIdx = Math.floor(Math.random() * colorsList.length);
    const roundTarget = colorsList[targetIdx];

    // Get 3 other unique random distractors
    const candidates = colorsList.filter((item) => item.id !== roundTarget.id);
    const distractors = shuffleArray(candidates).slice(0, 3);

    // Combine and shuffle options
    const roundOptions = shuffleArray([roundTarget, ...distractors]);

    setTargetColor(roundTarget);
    setQuizOptions(roundOptions);
    setQuizWrongAttempts([]);
    setQuizIsCorrectSelected(false);
    setFeedbackText('');
    feedbackScale.value = 0;
  }, [feedbackScale]);

  // Speak quiz target
  useEffect(() => {
    if (activeTab === 'play' && targetColor) {
      const speakQuizPrompt = async () => {
        await SoundManager.unloadAll();
        await SoundManager.playWord(`Find something ... ${targetColor.name}!`);
      };
      const timer = setTimeout(speakQuizPrompt, 300);
      return () => clearTimeout(timer);
    }
  }, [targetColor, activeTab]);

  // Handle Tab switch
  const handleTabSwitch = (tab: 'learn' | 'play') => {
    setActiveTab(tab);
    if (tab === 'play') {
      setRound(1);
      setScore(0);
      generateQuizRound();
    }
  };

  const handleNextLearn = () => {
    setActiveColorIdx((prev) => (prev + 1) % colorsList.length);
  };

  const handlePrevLearn = () => {
    setActiveColorIdx((prev) => (prev - 1 + colorsList.length) % colorsList.length);
  };

  const toggleSound = async () => {
    const nextMute = !muted;
    await SoundManager.setMuted(nextMute);
    setMuted(nextMute);
  };

  const handleQuizOptionPress = (item: ColorItem) => {
    if (quizIsCorrectSelected || !targetColor) return;

    if (item.id === targetColor.id) {
      setQuizIsCorrectSelected(true);
      setScore((prev) => prev + 1);
      setFeedbackText('🎉 Great Job! ⭐');
      feedbackScale.value = withSpring(1);
      SoundManager.playSuccess();
      SoundManager.playWord(item.exampleEmoji === '🍎' ? 'Apple' : item.name);

      // Delay transition to next round
      setTimeout(() => {
        feedbackScale.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(setFeedbackText)('');
            if (round < 5) {
              runOnJS(setRound)(round + 1);
              runOnJS(generateQuizRound)();
            } else {
              // Redirect to results
              runOnJS(router.replace)({
                pathname: '/result',
                params: {
                  score: (score + 1).toString(),
                  total: '5',
                  category: 'colors',
                },
              } as any);
            }
          }
        });
      }, 1500);
    } else {
      setQuizWrongAttempts((prev) => [...prev, item.id]);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
      <View style={styles.container}>
        {/* 1. Header Action Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/')}
            accessibilityRole="button"
            accessibilityLabel="Back to main menu"
          >
            <Text style={styles.backButtonText}>🏠</Text>
          </TouchableOpacity>

          {/* Segmented Modes Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'learn' && styles.activeTabButton]}
              onPress={() => handleTabSwitch('learn')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'learn' && styles.activeTabButtonText]}>📖 LEARN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'play' && styles.activeTabButton]}
              onPress={() => handleTabSwitch('play')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'play' && styles.activeTabButtonText]}>🎮 PLAY</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.soundToggle, muted ? styles.soundMuted : styles.soundOn]}
            onPress={toggleSound}
            accessibilityRole="button"
            accessibilityLabel={muted ? "Turn sound on" : "Mute sound"}
          >
            <Text style={styles.soundToggleText}>{muted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
        </View>

        {/* 2. MODE LAYOUTS */}
        {activeTab === 'learn' ? (
          // --- LEARN MODE COMPONENT ---
          <View style={styles.modeContainer}>
            <View style={styles.learnCardContainer}>
              <Animated.View
                key={activeColor.id} // forces trigger entry animations on card switch
                entering={FadeIn.duration(350)}
                style={[styles.learnCard, { borderColor: activeColor.hex }]}
              >
                {/* Large Color Circle */}
                <View style={[styles.colorCircle, { backgroundColor: activeColor.hex }]} />
                
                <View style={[styles.colorNameBubble, { backgroundColor: activeColor.hex }]}>
                  <Text style={styles.colorNameText}>{activeColor.name.toUpperCase()}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.audioRepeat, { backgroundColor: activeColor.hex + '15', borderColor: activeColor.hex }]}
                  onPress={() => SoundManager.playWord(activeColor.name)}
                >
                  <Text style={[styles.audioRepeatText, { color: activeColor.hex }]}>🔊 Pronounce Color</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Learn Navigation */}
            <View style={styles.navBar}>
              <TouchableOpacity style={styles.navButton} onPress={handlePrevLearn}>
                <Text style={styles.navButtonText}>◀ Prev</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={handleNextLearn}>
                <Text style={styles.navButtonText}>Next ▶</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // --- PLAY/QUIZ MODE COMPONENT ---
          <View style={styles.modeContainer}>
            {targetColor && (
              <>
                {/* Visual Prompt Section */}
                <View style={styles.playPromptSection}>
                  <Text style={styles.roundLabel}>Round {round} of 5</Text>
                  <Text style={styles.playPromptLabel}>Can you find something...</Text>
                  <View style={[styles.playTargetBubble, { borderColor: targetColor.hex }]}>
                    <Text style={[styles.playTargetText, { color: targetColor.hex }]}>
                      {targetColor.name.toUpperCase()}
                    </Text>
                    <TouchableOpacity
                      style={styles.quizRepeat}
                      onPress={() => SoundManager.playWord(`Find something ... ${targetColor.name}`)}
                    >
                      <Text style={[styles.quizRepeatText, { color: targetColor.hex }]}>🔊 Listen</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 4 Object options mapping */}
                <View style={styles.quizSection}>
                  <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.quizGrid}>
                    {quizOptions.map((item) => {
                      return (
                        <QuizOptionCard
                          key={item.id}
                          item={item}
                          targetColor={targetColor}
                          quizIsCorrectSelected={quizIsCorrectSelected}
                          quizWrongAttempts={quizWrongAttempts}
                          onPress={() => handleQuizOptionPress(item)}
                        />
                      );
                    })}
                  </Animated.View>
                </View>
              </>
            )}
          </View>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    padding: 4,
    width: '55%',
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#64748B',
  },
  activeTabButtonText: {
    color: '#FF6B6B',
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
  modeContainer: {
    flex: 1,
  },
  learnCardContainer: {
    flex: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  learnCard: {
    width: '100%',
    height: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 6,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  colorCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  colorNameBubble: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorNameText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 2,
  },
  audioRepeat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  audioRepeatText: {
    fontSize: 16,
    fontWeight: '800',
  },
  navBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 12 : 20,
  },
  navButton: {
    width: '45%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButton: {
    borderColor: '#6BCB77',
    backgroundColor: '#E8F5E9',
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#475569',
  },
  playPromptSection: {
    flex: 1.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#A5B1C2',
    letterSpacing: 1,
    marginBottom: 4,
  },
  playPromptLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7F8C8D',
    marginBottom: 8,
  },
  playTargetBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  playTargetText: {
    fontSize: 28,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.02)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    letterSpacing: 1,
  },
  quizRepeat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  quizRepeatText: {
    fontSize: 12,
    fontWeight: '800',
  },
  quizSection: {
    flex: 3.5,
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
  },
  quizGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quizCard: {
    width: '40%',
    margin: '3%',
    aspectRatio: 1,
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
  quizEmoji: {
    fontSize: 64,
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
