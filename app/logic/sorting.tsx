import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import {
  generateSortingRound,
  SortingRound,
  SortableItem,
  SortingBucket,
} from '../../src/features/logic/logicEngine';
import { recordGameSession } from '../../src/storage/progress';
import { SoundManager } from '../../src/utils/audio';
import { Difficulty } from '../../src/domain/types';
import { getDifficultyLabel, getNextDifficulty } from '../../src/domain/evaluator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SortingScreen() {
  const router = useRouter();

  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [round, setRound] = useState<SortingRound>(() => generateSortingRound('easy'));
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [bucketItems, setBucketItems] = useState<{ [bucketId: string]: SortableItem[] }>({});
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);

  const itemShake = useSharedValue(0);
  const itemScale = useSharedValue(1);

  const currentItem = round.items[currentItemIndex];
  const total = round.items.length;

  useEffect(() => {
    if (currentItem && !isComplete) {
      SoundManager.playWord(currentItem.name);
    }
  }, [currentItem, isComplete]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      SoundManager.stop();
    };
  }, []);

  const handleBack = async () => {
    await SoundManager.stop();
    router.replace('/logic');
  };

  const startNewGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    const newRound = generateSortingRound(diff);
    setRound(newRound);
    setCurrentItemIndex(0);
    setBucketItems({
      [newRound.buckets[0].id]: [],
      [newRound.buckets[1].id]: [],
    });
    setIsComplete(false);
    setScore(0);
    itemScale.value = 1;
  }, [itemScale]);

  const handleBucketPress = (bucket: SortingBucket) => {
    if (!currentItem || isComplete) return;

    if (currentItem.bucketId === bucket.id) {
      // Correct!
      SoundManager.playSuccess();
      const newScore = score + 1;
      setScore(newScore);

      setBucketItems((prev) => ({
        ...prev,
        [bucket.id]: [...(prev[bucket.id] || []), currentItem],
      }));

      itemScale.value = withSequence(
        withTiming(1.2, { duration: 120 }),
        withSpring(1)
      );

      setTimeout(() => {
        if (currentItemIndex + 1 < total) {
          setCurrentItemIndex((prev) => prev + 1);
        } else {
          setIsComplete(true);
          recordGameSession({
            gameId: 'logic-sorting',
            totalQuestions: total,
            correctAnswers: newScore,
            starsEarned: 3,
            durationMs: 15000,
          });
        }
      }, 500);
    } else {
      // Wrong!
      SoundManager.playWrong();
      itemShake.value = withSequence(
        withTiming(-12, { duration: 50 }),
        withTiming(12, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  };

  const animatedItemStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: itemShake.value }, { scale: itemScale.value }],
  }));

  const nextDiff = getNextDifficulty(difficulty);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Back to Logic Hub"
          >
            <Text style={styles.backBtnText}>⬅️</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerBadge}>SORTING GAME</Text>
            <Text style={styles.headerTitle}>{round.title}</Text>
          </View>

          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{getDifficultyLabel(difficulty)}</Text>
          </View>
        </View>

        {!isComplete ? (
          <>
            {/* Progress counter */}
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>
                Item {currentItemIndex + 1} of {total}
              </Text>
            </View>

            {/* Current Item Card */}
            <View style={styles.itemStage}>
              <Text style={styles.stagePrompt}>Where does this go?</Text>
              <Animated.View style={[styles.itemCard, animatedItemStyle]}>
                <Text style={styles.itemEmoji}>{currentItem?.emoji}</Text>
                <Text style={styles.itemName}>{currentItem?.name}</Text>
              </Animated.View>
              <Text style={styles.tapInstruction}>
                👇 Tap the matching crate below!
              </Text>
            </View>

            {/* Target Buckets / Crates */}
            <View style={styles.bucketsContainer}>
              {round.buckets.map((bucket) => {
                const count = (bucketItems[bucket.id] || []).length;
                return (
                  <TouchableOpacity
                    key={bucket.id}
                    style={[
                      styles.bucketCard,
                      { backgroundColor: bucket.color, borderColor: '#FFFFFF' },
                    ]}
                    onPress={() => handleBucketPress(bucket)}
                    accessibilityRole="button"
                    accessibilityLabel={`Put in ${bucket.name}`}
                  >
                    <Text style={styles.bucketEmoji}>{bucket.emoji}</Text>
                    <Text style={styles.bucketTitle}>{bucket.name}</Text>
                    <View style={styles.bucketCountBadge}>
                      <Text style={styles.bucketCountText}>
                        {count} collected
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          /* Completion Celebration */
          <View style={styles.completeContainer}>
            <Text style={styles.celebrationEmoji}>🎉 🧺 🌟</Text>
            <Text style={styles.celebrationTitle}>Sorted Perfectly!</Text>
            <Text style={styles.celebrationSub}>
              You organized all the items!
            </Text>

            <View style={styles.starsRow}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.star}>⭐</Text>
            </View>

            {nextDiff && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.nextBtn]}
                onPress={() => startNewGame(nextDiff)}
              >
                <Text style={styles.actionBtnText}>Next Level 🚀</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, styles.playAgainBtn]}
              onPress={() => startNewGame(difficulty)}
            >
              <Text style={styles.actionBtnText}>Play Again 🔄 (New)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.homeBtn]}
              onPress={() => router.replace('/logic')}
            >
              <Text style={styles.homeBtnText}>Back to Logic Hub 🏠</Text>
            </TouchableOpacity>

            <ConfettiCannon
              count={100}
              origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
              fallSpeed={2500}
              fadeOut={true}
            />
          </View>
        )}
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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backBtn: {
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
  backBtnText: {
    fontSize: 20,
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00D2D3',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2D3748',
  },
  levelBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  progressRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#718096',
  },
  itemStage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stagePrompt: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4B6584',
    marginBottom: 12,
  },
  itemCard: {
    width: 150,
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 5,
    borderColor: '#FED7AA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  itemEmoji: {
    fontSize: 64,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2D3748',
    marginTop: 4,
  },
  tapInstruction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 16,
  },
  bucketsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  bucketCard: {
    width: '48%',
    height: 160,
    borderRadius: 24,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  bucketEmoji: {
    fontSize: 44,
  },
  bucketTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
    textAlign: 'center',
  },
  bucketCountBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  bucketCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: 54,
    marginBottom: 8,
  },
  celebrationTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF6B6B',
  },
  celebrationSub: {
    fontSize: 16,
    fontWeight: '700',
    color: '#718096',
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  star: {
    fontSize: 48,
    marginHorizontal: 6,
  },
  actionBtn: {
    width: '85%',
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
  },
  nextBtn: {
    backgroundColor: '#FF9F43',
    borderWidth: 3,
    borderColor: '#F39C12',
  },
  playAgainBtn: {
    backgroundColor: '#6BCB77',
    borderWidth: 3,
    borderColor: '#4BAA57',
  },
  homeBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#CBD5E1',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  homeBtnText: {
    color: '#4B6584',
    fontSize: 16,
    fontWeight: '800',
  },
});
