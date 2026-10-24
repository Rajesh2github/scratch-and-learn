import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import {
  Question,
  SessionResult,
  AnswerOption as AnswerOptionType,
  Difficulty,
} from '../domain/types';
import {
  evaluateAnswer,
  calculateStars,
  getNextDifficulty,
  getDifficultyLabel,
} from '../domain/evaluator';
import { SoundManager } from '../utils/audio';
import { AnswerOption } from './AnswerOption';
import { ProgressBar } from './ProgressBar';
import { ScratchCard } from './ScratchCard';

export interface GameShellProps {
  title: string;
  categoryName?: string;
  themeColor?: string;
  initialDifficulty?: Difficulty;
  coverWithScratchCard?: boolean;
  questions?: Question[];
  getQuestions?: (difficulty: Difficulty) => Question[];
  onComplete?: (result: SessionResult) => void;
  onExit?: () => void;
  renderVisualArea?: (question: Question) => React.ReactNode;
}

const ALL_LEVELS: Difficulty[] = ['easy', 'medium', 'hard'];

export const GameShell: React.FC<GameShellProps> = ({
  title,
  categoryName = 'Learning',
  themeColor = '#4D96FF',
  initialDifficulty = 'easy',
  coverWithScratchCard = false,
  questions: initialQuestionsList,
  getQuestions,
  onComplete,
  onExit,
  renderVisualArea,
}) => {
  const router = useRouter();

  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>(() => {
    if (getQuestions) {
      return getQuestions(initialDifficulty);
    }
    return initialQuestionsList || [];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnsweredCorrectly, setIsAnsweredCorrectly] = useState(false);
  const [wrongOptionIds, setWrongOptionIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [muted, setMuted] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [isScratched, setIsScratched] = useState(!coverWithScratchCard);

  const currentQuestion = sessionQuestions[currentIndex];
  const total = sessionQuestions.length;

  // Initialize sound settings
  useEffect(() => {
    const initSound = async () => {
      await SoundManager.init();
      setMuted(SoundManager.getMuted());
    };
    initSound();
  }, []);

  // Reset scratch state on question change
  useEffect(() => {
    setIsScratched(!coverWithScratchCard);
  }, [currentIndex, coverWithScratchCard]);

  // Speak prompt gently on question load (only if scratched or not required)
  useEffect(() => {
    if (currentQuestion && !isComplete && isScratched) {
      const timer = setTimeout(() => {
        SoundManager.playWord(currentQuestion.prompt);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentQuestion, isComplete, isScratched]);

  // Clean up sounds on unmount
  useEffect(() => {
    return () => {
      SoundManager.stop();
    };
  }, []);

  const toggleSound = async () => {
    const nextMute = !muted;
    await SoundManager.setMuted(nextMute);
    setMuted(nextMute);
  };

  const handleSpeechReplay = () => {
    if (currentQuestion) {
      SoundManager.playWord(currentQuestion.prompt);
    }
  };

  const handleExitPress = () => {
    if (onExit) {
      onExit();
    } else {
      setExitModalVisible(true);
    }
  };

  const confirmExit = async () => {
    await SoundManager.stop();
    setExitModalVisible(false);
    router.replace('/');
  };

  // Switches level immediately with brand new questions
  const switchLevel = useCallback(
    (newDiff: Difficulty) => {
      setDifficulty(newDiff);
      const newQuestions = getQuestions
        ? getQuestions(newDiff)
        : initialQuestionsList || [];
      setSessionQuestions(newQuestions);
      setCurrentIndex(0);
      setSelectedOptionId(null);
      setIsAnsweredCorrectly(false);
      setWrongOptionIds([]);
      setScore(0);
      setIsComplete(false);
      setStartTime(Date.now());
    },
    [getQuestions, initialQuestionsList]
  );

  const handleOptionPress = useCallback(
    (option: AnswerOptionType) => {
      if (isAnsweredCorrectly || !currentQuestion) return;

      const isCorrect = evaluateAnswer(currentQuestion, option.id);
      setSelectedOptionId(option.id);

      if (isCorrect) {
        setIsAnsweredCorrectly(true);
        SoundManager.playSuccess();
        const newScore = score + 1;
        setScore(newScore);

        setTimeout(() => {
          if (currentIndex + 1 < total) {
            setCurrentIndex((prev) => prev + 1);
            setSelectedOptionId(null);
            setIsAnsweredCorrectly(false);
            setWrongOptionIds([]);
          } else {
            setIsComplete(true);
            const durationMs = Date.now() - startTime;
            const stars = calculateStars(newScore, total);
            if (onComplete) {
              onComplete({
                gameId: currentQuestion.gameId,
                totalQuestions: total,
                correctAnswers: newScore,
                starsEarned: stars,
                durationMs,
              });
            }
          }
        }, 1100);
      } else {
        SoundManager.playWrong();
        setWrongOptionIds((prev) => [...prev, option.id]);
      }
    },
    [
      isAnsweredCorrectly,
      currentQuestion,
      score,
      currentIndex,
      total,
      startTime,
      onComplete,
    ]
  );

  // Play again on the SAME level with completely NEW randomized questions
  const handlePlayAgain = () => {
    const newQuestions = getQuestions
      ? getQuestions(difficulty)
      : initialQuestionsList || [];
    setSessionQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnsweredCorrectly(false);
    setWrongOptionIds([]);
    setScore(0);
    setIsComplete(false);
    setStartTime(Date.now());
  };

  // Advance to next level
  const handleNextLevel = () => {
    const nextDiff = getNextDifficulty(difficulty);
    if (nextDiff) {
      switchLevel(nextDiff);
    } else {
      handlePlayAgain();
    }
  };

  const nextDifficultyAvailable = getNextDifficulty(difficulty);

  // Render default visual presentation if not customized
  const defaultVisualArea = useMemo(() => {
    if (!currentQuestion) return null;
    const { visualData } = currentQuestion;

    if (!visualData) {
      if (currentQuestion.emoji) {
        return (
          <View style={styles.defaultVisualBox}>
            <Text style={styles.largeEmoji}>{currentQuestion.emoji}</Text>
          </View>
        );
      }
      return null;
    }

    switch (visualData.type) {
      case 'counter':
        return (
          <View style={styles.counterGrid}>
            {(visualData.items || []).map((emoji, idx) => (
              <View key={idx} style={styles.counterItem}>
                <Text style={styles.itemEmoji}>{emoji}</Text>
              </View>
            ))}
          </View>
        );
      case 'addition':
      case 'subtraction':
        return (
          <View style={styles.mathEquationBox}>
            <View style={styles.groupCard}>
              {(visualData.group1 || []).map((e, idx) => (
                <Text key={`g1-${idx}`} style={styles.itemEmojiSm}>
                  {e}
                </Text>
              ))}
            </View>
            <Text style={styles.operatorText}>{visualData.operator || '+'}</Text>
            <View style={styles.groupCard}>
              {(visualData.group2 || []).map((e, idx) => (
                <Text key={`g2-${idx}`} style={styles.itemEmojiSm}>
                  {e}
                </Text>
              ))}
            </View>
            <Text style={styles.operatorText}>=</Text>
            <View style={styles.questionPlaceholder}>
              <Text style={styles.placeholderQuestionMark}>?</Text>
            </View>
          </View>
        );
      case 'pattern':
        return (
          <View style={styles.patternBox}>
            {(visualData.patternSequence || []).map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.patternItem,
                  item === null && styles.patternSlotEmpty,
                ]}
              >
                <Text style={styles.patternItemText}>{item ?? '?'}</Text>
              </View>
            ))}
          </View>
        );
      case 'odd-one-out':
        return (
          <View style={styles.counterGrid}>
            {(visualData.items || []).map((emoji, idx) => (
              <View key={idx} style={styles.oddOneOutCard}>
                <Text style={styles.largeEmoji}>{emoji}</Text>
              </View>
            ))}
          </View>
        );
      case 'word':
        return (
          <View style={styles.wordVisualBox}>
            <Text style={styles.wordLargeEmoji}>{currentQuestion.emoji || '🗣️'}</Text>
            {visualData.targetWord ? (
              <Text style={styles.wordTargetLabel}>{visualData.targetWord}</Text>
            ) : null}
          </View>
        );
      default:
        return currentQuestion.emoji ? (
          <View style={styles.defaultVisualBox}>
            <Text style={styles.largeEmoji}>{currentQuestion.emoji}</Text>
          </View>
        ) : null;
    }
  }, [currentQuestion]);

  if (!currentQuestion && !isComplete) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading activities...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Completion View
  if (isComplete) {
    const earnedStars = calculateStars(score, total);
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
        <View style={styles.completionContainer}>
          <Text style={styles.celebrationEmoji}>🎉 🌟 🎈</Text>
          <Text style={styles.celebrationTitle}>Awesome Job!</Text>
          <Text style={styles.celebrationSub}>
            Completed {getDifficultyLabel(difficulty)}!
          </Text>

          <View style={styles.starsRow}>
            {[1, 2, 3].map((starIndex) => (
              <Text
                key={starIndex}
                style={[
                  styles.completionStar,
                  starIndex <= earnedStars ? styles.starFilled : styles.starDimmed,
                ]}
              >
                ⭐
              </Text>
            ))}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryScoreLabel}>SCORE</Text>
            <Text style={styles.summaryScoreValue}>
              {score} <Text style={styles.summaryTotal}>/ {total}</Text>
            </Text>
          </View>

          {/* Action Buttons: Next Level, Play Again, Home */}
          {nextDifficultyAvailable ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.nextLevelBtn]}
              onPress={handleNextLevel}
              accessibilityRole="button"
              accessibilityLabel="Next Level"
            >
              <Text style={styles.actionBtnText}>Next Level 🚀</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.actionBtn, styles.playAgainBtn]}
            onPress={handlePlayAgain}
            accessibilityRole="button"
            accessibilityLabel="Play Again with New Questions"
          >
            <Text style={styles.actionBtnText}>Play Again 🔄 (New)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.stickerBtn]}
            onPress={() => router.push('/rewards/sticker-book' as any)}
            accessibilityRole="button"
            accessibilityLabel="Visit Sticker Book"
          >
            <Text style={styles.actionBtnText}>Visit Sticker Book 🎨</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.homeBtn]}
            onPress={() => router.replace('/')}
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
          >
            <Text style={styles.homeBtnText}>Back to Home 🏠</Text>
          </TouchableOpacity>

          <ConfettiCannon
            count={earnedStars === 3 ? 120 : 60}
            origin={{ x: Dimensions.get('window').width / 2, y: -20 }}
            fallSpeed={2500}
            fadeOut={true}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.exitBtn}
            onPress={handleExitPress}
            accessibilityRole="button"
            accessibilityLabel="Exit game"
          >
            <Text style={styles.exitBtnText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.categoryBadge}>{categoryName.toUpperCase()}</Text>
            <Text style={styles.gameTitle} numberOfLines={1}>
              {title}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.soundBtn, muted ? styles.soundMuted : styles.soundOn]}
            onPress={toggleSound}
            accessibilityRole="button"
            accessibilityLabel={muted ? 'Turn sound on' : 'Mute sound'}
          >
            <Text style={styles.soundBtnText}>{muted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
        </View>

        {/* Level Switcher Chips */}
        <View style={styles.levelSelectorRow}>
          {ALL_LEVELS.map((lvl) => {
            const isSelected = difficulty === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.levelChip,
                  isSelected && {
                    backgroundColor: themeColor,
                    borderColor: themeColor,
                  },
                ]}
                onPress={() => switchLevel(lvl)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${getDifficultyLabel(lvl)}`}
              >
                <Text
                  style={[
                    styles.levelChipText,
                    isSelected && styles.levelChipTextSelected,
                  ]}
                >
                  {getDifficultyLabel(lvl)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Progress bar */}
        <ProgressBar current={currentIndex + 1} total={total} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Prompt card with speech button */}
          <View style={styles.promptCard}>
            <Text style={styles.promptText}>
              {!isScratched ? '✨ Scratch to reveal the puzzle! ✨' : currentQuestion.prompt}
            </Text>
            {isScratched && (
              <TouchableOpacity
                style={styles.speechBtn}
                onPress={handleSpeechReplay}
                accessibilityRole="button"
                accessibilityLabel="Listen again"
              >
                <Text style={styles.speechBtnText}>📢 Listen</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Visual Presentation Area */}
          <View style={[styles.visualContainer, coverWithScratchCard && styles.scratchVisualBox]}>
            {coverWithScratchCard ? (
              <ScratchCard
                key={currentQuestion.id}
                isComplete={isScratched}
                onComplete={() => setIsScratched(true)}
              >
                {renderVisualArea
                  ? renderVisualArea(currentQuestion)
                  : defaultVisualArea}
              </ScratchCard>
            ) : renderVisualArea ? (
              renderVisualArea(currentQuestion)
            ) : (
              defaultVisualArea
            )}
          </View>

          {/* Gentle Hint when an answer is wrong */}
          {wrongOptionIds.length > 0 && !isAnsweredCorrectly && isScratched && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>
                {currentQuestion.hint || 'Almost! Take another close look! 🧐'}
              </Text>
            </View>
          )}

          {/* Options Grid */}
          <View style={styles.optionsGrid}>
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const isWrong = wrongOptionIds.includes(option.id);
              const isCorrect = isAnsweredCorrectly && isSelected;
              const isDisabled = !isScratched || isAnsweredCorrectly || isWrong;

              return (
                <AnswerOption
                  key={option.id}
                  text={option.label}
                  isSelected={isSelected}
                  isCorrect={isCorrect}
                  isWrong={isWrong}
                  disabled={isDisabled}
                  onPress={() => handleOptionPress(option)}
                />
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Exit Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={exitModalVisible}
        onRequestClose={() => setExitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Leave Game?</Text>
            <Text style={styles.modalMessage}>
              Do you want to save your fun and return to the main hub?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.stayBtn]}
                onPress={() => setExitModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Keep Playing 🎮</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.leaveBtn]}
                onPress={confirmExit}
              >
                <Text style={styles.modalBtnText}>Exit 🏠</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7F8C8D',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  exitBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  exitBtnText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#64748B',
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#4D96FF',
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2D3748',
  },
  soundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 2,
  },
  soundOn: {
    backgroundColor: '#6BCB77',
  },
  soundMuted: {
    backgroundColor: '#A5B1C2',
  },
  soundBtnText: {
    fontSize: 18,
  },
  levelSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  levelChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  levelChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  levelChipTextSelected: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  promptCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 4,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  promptText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  speechBtn: {
    backgroundColor: '#E6F4FE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#4D96FF',
  },
  speechBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0066CC',
  },
  visualContainer: {
    width: '100%',
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  scratchVisualBox: {
    height: 180,
    width: 280,
    alignSelf: 'center',
  },
  defaultVisualBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 4,
    borderColor: '#FFD93D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeEmoji: {
    fontSize: 64,
  },
  counterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#6BCB77',
  },
  counterItem: {
    margin: 6,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 36,
  },
  mathEquationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 4,
    borderColor: '#4D96FF',
    elevation: 2,
  },
  groupCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmojiSm: {
    fontSize: 24,
    margin: 2,
  },
  operatorText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF6B6B',
    marginHorizontal: 10,
  },
  questionPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF9F0',
    borderWidth: 3,
    borderColor: '#FFD93D',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderQuestionMark: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FF9F43',
  },
  patternBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#A55EEA',
  },
  patternItem: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  patternSlotEmpty: {
    backgroundColor: '#FFF9F0',
    borderColor: '#FF9F43',
    borderStyle: 'dashed',
    borderWidth: 3,
  },
  patternItemText: {
    fontSize: 32,
  },
  oddOneOutCard: {
    margin: 8,
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordVisualBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FF9F43',
  },
  wordLargeEmoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  wordTargetLabel: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2D3748',
    letterSpacing: 1,
  },
  hintContainer: {
    backgroundColor: '#FFF2F2',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  hintText: {
    color: '#D63031',
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFF9F0',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#4D96FF',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2D3748',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  stayBtn: {
    backgroundColor: '#6BCB77',
  },
  leaveBtn: {
    backgroundColor: '#FF6B6B',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  celebrationTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  celebrationSub: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7F8C8D',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  completionStar: {
    fontSize: 54,
    marginHorizontal: 8,
  },
  starFilled: {
    opacity: 1,
  },
  starDimmed: {
    opacity: 0.2,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#FFD93D',
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
  },
  summaryScoreLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#A5B1C2',
    letterSpacing: 1.5,
  },
  summaryScoreValue: {
    fontSize: 44,
    fontWeight: '900',
    color: '#2D3748',
  },
  summaryTotal: {
    fontSize: 24,
    color: '#7F8C8D',
  },
  actionBtn: {
    width: '88%',
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  nextLevelBtn: {
    backgroundColor: '#FF9F43',
    borderWidth: 3,
    borderColor: '#F39C12',
  },
  playAgainBtn: {
    backgroundColor: '#6BCB77',
    borderWidth: 3,
    borderColor: '#4BAA57',
  },
  stickerBtn: {
    backgroundColor: '#A855F7',
    borderWidth: 3,
    borderColor: '#9333EA',
  },
  homeBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#CBD5E1',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },
  homeBtnText: {
    color: '#4B6584',
    fontSize: 17,
    fontWeight: '800',
  },
});
