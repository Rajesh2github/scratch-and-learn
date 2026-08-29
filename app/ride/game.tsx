import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { fruitsQuestions } from '../../src/data/fruits';
import { alphabetsQuestions } from '../../src/data/alphabets';
import { numbersQuestions } from '../../src/data/numbers';
import { animalsQuestions } from '../../src/data/animals';
import { vegetablesQuestions } from '../../src/data/vegetables';
import { colorsQuestions } from '../../src/data/colors';
import { SoundManager } from '../../src/utils/audio';
import { shuffleArray } from '../../src/utils/shuffle';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ROAD_WIDTH = Math.min(SCREEN_WIDTH - 40, 320);
const LANE_WIDTH = ROAD_WIDTH / 3;

interface ScrollingObject {
  lane: 0 | 1 | 2;
  value: string; // The emoji or text rendered on the road
  answerText: string; // The correct answer text (e.g., 'Apple', 'A')
  isCorrect: boolean;
  isObstacle?: boolean;
}

export default function RideGameScreen() {
  const router = useRouter();
  const { vehicle, category } = useLocalSearchParams<{ vehicle: string; category: string }>();
  const vehicleEmoji = vehicle === 'bike' ? '🏍️' : '🚗';
  const gameCategory = category || 'fruits';

  const [muted, setMuted] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [targetName, setTargetName] = useState<string>('Apple');
  const [targetWord, setTargetPhonics] = useState<string>('Apple');
  const [activeLane, setActiveLane] = useState<0 | 1 | 2>(1); // starts in Center lane

  // Reanimated animation positions
  const playerX = useSharedValue(0); // Center lane offset
  const objectsY = useSharedValue(-50); // Scrolling elements Y coordinate

  const [scrollingItems, setScrollingItems] = useState<ScrollingObject[]>([]);
  const [feedbackText, setFeedbackText] = useState('');
  const feedbackScale = useSharedValue(0);

  // Mutable Refs to guarantee zero stale closures during asynchronous Reanimated callbacks!
  const activeLaneRef = useRef<0 | 1 | 2>(1);
  const scrollingItemsRef = useRef<ScrollingObject[]>([]);
  const scoreRef = useRef<number>(0);
  const roundRef = useRef<number>(1);
  const collisionTimeoutRef = useRef<any>(null);

  // Keep Refs in sync with active React state
  useEffect(() => {
    activeLaneRef.current = activeLane;
  }, [activeLane]);

  useEffect(() => {
    scrollingItemsRef.current = scrollingItems;
  }, [scrollingItems]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  // Cleanup on unmount to prevent background execution
  useEffect(() => {
    return () => {
      // 1. Clear active timeouts
      if (collisionTimeoutRef.current) {
        clearTimeout(collisionTimeoutRef.current);
      }
      // 2. Stop ongoing Reanimated animations instantly
      cancelAnimation(objectsY);
      cancelAnimation(feedbackScale);
      cancelAnimation(playerX);
      // 3. Unload sound manager speech synthesis
      SoundManager.unloadAll();
    };
  }, [objectsY, feedbackScale, playerX]);

  // Normalize current category dataset dynamically
  const lettersPool = useMemo(() => {
    let rawPool = fruitsQuestions;
    if (gameCategory === 'alphabets') rawPool = alphabetsQuestions;
    else if (gameCategory === 'numbers') rawPool = numbersQuestions;
    else if (gameCategory === 'animals') rawPool = animalsQuestions;
    else if (gameCategory === 'vegetables') rawPool = vegetablesQuestions;
    else if (gameCategory === 'colors') rawPool = colorsQuestions;

    return rawPool.map((q) => {
      let displayValue = q.emoji; // default to showing the emoji on road
      let displayPhonics = q.answer;

      if (gameCategory === 'alphabets') {
        displayValue = q.answer; // display uppercase letter (A, B) on road
        displayPhonics = q.emoji.split(' (')[1]?.replace(')', '') || `${q.answer} for Apple`;
      } else if (gameCategory === 'numbers') {
        displayValue = q.answer; // display digit on road
        const spellingMap: { [key: string]: string } = {
          '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five',
          '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine', '10': 'Ten'
        };
        // Build counting chain e.g. "Three! One, Two, Three!"
        let countingChain = '';
        const limit = parseInt(q.answer, 10);
        for (let i = 1; i <= limit; i++) {
          countingChain += `${i} ... `;
        }
        displayPhonics = `${spellingMap[q.answer] || q.answer} ... ${countingChain}`;
      } else if (gameCategory === 'colors') {
        displayValue = q.emoji.split('\n')[0]; // only take top circle emoji e.g. 🔴
      }

      return {
        id: q.id,
        answer: q.answer,
        displayValue,
        phonics: displayPhonics,
      };
    });
  }, [gameCategory]);

  // Generate new driving round
  const generateRound = useCallback(() => {
    if (lettersPool.length < 3) return;

    // Pick a random target
    const targetIdx = Math.floor(Math.random() * lettersPool.length);
    const roundTarget = lettersPool[targetIdx];

    // Get 2 unique random distractors
    const candidates = lettersPool.filter((item) => item.id !== roundTarget.id);
    const distractors = shuffleArray(candidates).slice(0, 2);

    // Form 3 lanes cards
    const lanesList: ScrollingObject[] = [
      { lane: 0, value: roundTarget.displayValue, answerText: roundTarget.answer, isCorrect: true },
      { lane: 0, value: distractors[0].displayValue, answerText: distractors[0].answer, isCorrect: false },
      { lane: 0, value: distractors[1].displayValue, answerText: distractors[1].answer, isCorrect: false },
    ];

    // Assign randomized lanes (0, 1, 2)
    const shuffledLanes = shuffleArray([0, 1, 2]);
    lanesList[0].lane = shuffledLanes[0] as 0 | 1 | 2;
    lanesList[1].lane = shuffledLanes[1] as 0 | 1 | 2;
    lanesList[2].lane = shuffledLanes[2] as 0 | 1 | 2;

    // Introduce a random obstacle barrier 🚧 in one of the incorrect lanes for added fun!
    if (Math.random() > 0.4) {
      const wrongLanes = lanesList.filter(l => !l.isCorrect).map(l => l.lane);
      const barrierLane = wrongLanes[Math.floor(Math.random() * wrongLanes.length)];
      lanesList.push({
        lane: barrierLane as 0 | 1 | 2,
        value: '🚧',
        answerText: 'Obstacle',
        isCorrect: false,
        isObstacle: true,
      });
    }

    setTargetName(roundTarget.answer);
    setTargetPhonics(roundTarget.phonics);
    setScrollingItems(lanesList);
    setFeedbackText('');
    feedbackScale.value = 0;

    // Slow and kid-friendly duration: 5.5 seconds (5500ms) to allow reading and swerving
    objectsY.value = -50;
    objectsY.value = withTiming(320, { duration: 5500 }, (finished) => {
      if (finished) {
        runOnJS(evaluateCollision)();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lettersPool, objectsY, feedbackScale]);

  // Init settings
  useEffect(() => {
    const loadSettings = async () => {
      await SoundManager.init();
      setMuted(SoundManager.getMuted());
      generateRound();
    };
    loadSettings();
  }, [generateRound]);

  // Play phonics prompt upon target letter load
  useEffect(() => {
    if (targetName) {
      const speakTarget = async () => {
        await SoundManager.unloadAll();
        await SoundManager.playWord(`Steer to ... ${targetName}!`);
      };
      const timer = setTimeout(speakTarget, 300);
      return () => clearTimeout(timer);
    }
  }, [targetName]);

  const toggleSound = async () => {
    const nextMute = !muted;
    await SoundManager.setMuted(nextMute);
    setMuted(nextMute);
  };

  // Evaluate Lane collision at the bottom
  const evaluateCollision = () => {
    // Read directly from mutable Refs to guarantee we use the absolute latest values (No React closures)
    const liveLane = activeLaneRef.current;
    const liveItems = scrollingItemsRef.current;
    const liveRound = roundRef.current;
    const liveScore = scoreRef.current;

    // Find item matching the player's active lane
    const hitItem = liveItems.find((item) => item.lane === liveLane);
    let scoreDelta = 0;

    if (hitItem) {
      if (hitItem.isCorrect) {
        // CORRECT SELECTION!
        scoreDelta = 10;
        setScore((prev) => prev + 10);
        setFeedbackText('🎉 Great Job! +10 ⭐');
        feedbackScale.value = withSpring(1);
        SoundManager.playSuccess();
        SoundManager.playWord(targetWord);
      } else if (hitItem.isObstacle) {
        // HIT OBSTACLE 🚧
        setFeedbackText('💥 Oops! Barrier! 🚧');
        feedbackScale.value = withSpring(1);
        SoundManager.playWrong();
      } else {
        // WRONG LETTER SELECTION!
        setFeedbackText('😊 Try Again!');
        feedbackScale.value = withSpring(1);
        SoundManager.playWrong();
      }
    } else {
      // EMPTY LANE HIT (MISS)
      setFeedbackText('💨 Steer into letters! 💨');
      feedbackScale.value = withSpring(1);
      SoundManager.playWrong();
    }

    // Progress to next question or redirect to results after celebration delay
    collisionTimeoutRef.current = setTimeout(() => {
      feedbackScale.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(setFeedbackText)('');
          if (liveRound < 10) {
            runOnJS(setRound)(liveRound + 1);
            runOnJS(generateRound)();
          } else {
            // Redirect to results
            runOnJS(router.replace)({
              pathname: '/result',
              params: {
                score: (liveScore + scoreDelta).toString(),
                total: '100',
                category: 'ride',
              },
            } as any);
          }
        }
      });
    }, 1800);
  };

  // Controls
  const steerLeft = () => {
    if (activeLane > 0) {
      const nextLane = (activeLane - 1) as 0 | 1 | 2;
      setActiveLane(nextLane);
      playerX.value = withSpring((nextLane - 1) * LANE_WIDTH, { damping: 12 });
      SoundManager.playWord('Left!');
    }
  };

  const steerRight = () => {
    if (activeLane < 2) {
      const nextLane = (activeLane + 1) as 0 | 1 | 2;
      setActiveLane(nextLane);
      playerX.value = withSpring((nextLane - 1) * LANE_WIDTH, { damping: 12 });
      SoundManager.playWord('Right!');
    }
  };

  // Animated styles
  const playerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playerX.value }],
  }));

  const objectsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: objectsY.value }],
  }));

  const feedbackAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: feedbackScale.value }],
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
      <View style={styles.container}>
        {/* 1. Header Board */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/ride')}
            accessibilityRole="button"
            accessibilityLabel="Back to selection menu"
          >
            <Text style={styles.backButtonText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Score: {score} ⭐</Text>
          <TouchableOpacity
            style={[styles.soundToggle, muted ? styles.soundMuted : styles.soundOn]}
            onPress={toggleSound}
            accessibilityRole="button"
            accessibilityLabel={muted ? "Turn sound on" : "Mute sound"}
          >
            <Text style={styles.soundToggleText}>{muted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Educational Target Question */}
        <View style={styles.targetSection}>
          <Text style={styles.roundText}>Question {round} / 10</Text>
          <View style={styles.targetBubble}>
            <Text style={styles.targetText}>FIND: {targetName}</Text>
          </View>
        </View>

        {/* 3. 3-Lane Road World */}
        <View style={styles.worldSection}>
          <View style={[styles.road, { width: ROAD_WIDTH }]}>
            {/* Lanes dash-lines */}
            <View style={[styles.laneLine, { left: LANE_WIDTH }]} />
            <View style={[styles.laneLine, { left: LANE_WIDTH * 2 }]} />

            {/* Downward Scrolling Objects (Letters / Obstacles) */}
            <Animated.View style={[styles.scrollingLayer, objectsAnimatedStyle]}>
              {scrollingItems.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.scrollingItem,
                    {
                      left: item.lane * LANE_WIDTH,
                      width: LANE_WIDTH,
                    },
                  ]}
                >
                  <Text style={[styles.itemText, item.isObstacle && styles.obstacleText]}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </Animated.View>

            {/* Steered Player Vehicle */}
            <Animated.View style={[styles.player, playerAnimatedStyle]}>
              <Text style={styles.playerEmoji}>{vehicleEmoji}</Text>
            </Animated.View>
          </View>
        </View>

        {/* 4. Swerve Controls Navigation Buttons */}
        <View style={styles.controlsSection}>
          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel="Steer Left"
            disabled={activeLane === 0}
            style={[styles.steerButton, activeLane === 0 && styles.steerButtonDisabled]}
            onPress={steerLeft}
          >
            <Text style={styles.steerButtonText}>◀ LEFT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel="Steer Right"
            disabled={activeLane === 2}
            style={[styles.steerButton, activeLane === 2 && styles.steerButtonDisabled]}
            onPress={steerRight}
          >
            <Text style={styles.steerButtonText}>RIGHT ▶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. Celebration / Error Feedback Bubble Overlay */}
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
    fontSize: 18,
    fontWeight: '800',
    color: '#4B6584',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFD93D',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
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
  targetSection: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#A5B1C2',
    marginBottom: 4,
  },
  targetBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#FF6B6B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  targetText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF6B6B',
  },
  worldSection: {
    flex: 5.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  road: {
    height: '100%',
    backgroundColor: '#57606F',
    borderRadius: 24,
    borderWidth: 6,
    borderColor: '#747D8C',
    position: 'relative',
    overflow: 'hidden',
  },
  laneLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#F1F2F6',
    opacity: 0.4,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  scrollingLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 60,
  },
  scrollingItem: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
  },
  itemText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    backgroundColor: '#FF9F43',
    width: 60,
    height: 60,
    borderRadius: 30,
    lineHeight: 52,
    textAlign: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  obstacleText: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowColor: 'transparent',
    borderWidth: 0,
    fontSize: 48,
  },
  player: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerEmoji: {
    fontSize: 54,
  },
  controlsSection: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 12 : 20,
  },
  steerButton: {
    width: '45%',
    height: 56,
    backgroundColor: '#4D96FF',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#3076D8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  steerButtonDisabled: {
    backgroundColor: '#DFE4EA',
    borderColor: '#DFE4EA',
    opacity: 0.5,
  },
  steerButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
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
