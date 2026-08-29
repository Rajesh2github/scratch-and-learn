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
  withTiming,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { SoundManager } from '../../src/utils/audio';
import { shuffleArray } from '../../src/utils/shuffle';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface CardItem {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MEMORY_EMOJIS = ['🦁', '🐯', '🐘', '🐵', '🐼', '🐰', '🍎', '🍌', '🍒', '🍉', '🚗', '🚂', '🥦', '🥕'];

const MemoryCard: React.FC<{
  card: CardItem;
  onPress: () => void;
  disabled: boolean;
}> = ({ card, onPress, disabled }) => {
  const scale = useSharedValue(1);
  const rotateY = useSharedValue(0);

  // Sync card state changes to the Reanimated shared value safely on the JS thread
  useEffect(() => {
    rotateY.value = withTiming(card.isFlipped || card.isMatched ? 180 : 0, { duration: 250 });
  }, [card.isFlipped, card.isMatched, rotateY]);

  // Smooth Reanimated card flip style
  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotateY: `${rotateY.value}deg` },
      ],
    };
  });

  const handlePressIn = () => {
    if (disabled || card.isFlipped || card.isMatched) return;
    scale.value = withTiming(0.92, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedTouchableOpacity
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Card ${card.isFlipped || card.isMatched ? card.emoji : 'hidden'}`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || card.isFlipped || card.isMatched}
      style={[
        styles.card,
        card.isMatched ? styles.matchedCard : card.isFlipped ? styles.flippedCard : styles.hiddenCard,
        cardStyle,
      ]}
    >
      {/* Reverse the rotation of the text so the emoji is not mirrored when card rotates 180deg! */}
      {(card.isFlipped || card.isMatched) ? (
        <Text style={[styles.cardEmoji, { transform: [{ rotateY: '180deg' }] }]}>
          {card.emoji}
        </Text>
      ) : (
        <Text style={styles.cardCoverText}>❓</Text>
      )}
    </AnimatedTouchableOpacity>
  );
};

export default function MemoryGameScreen() {
  const router = useRouter();

  const [muted, setMuted] = useState(false);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [pairsFound, setPairsFound] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);

  // Init memory board
  const initBoard = useCallback(() => {
    // Pick 6 random unique emojis from pool
    const selectedEmojis = shuffleArray(MEMORY_EMOJIS).slice(0, 6);
    // Duplicate to form 12 cards (6 pairs)
    const boardList = [...selectedEmojis, ...selectedEmojis].map((emoji, idx) => ({
      id: idx,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(shuffleArray(boardList));
    setFlippedIndices([]);
    setMoves(0);
    setPairsFound(0);
    setLockBoard(false);
  }, []);

  // Init settings
  useEffect(() => {
    const loadSettings = async () => {
      await SoundManager.init();
      setMuted(SoundManager.getMuted());
      initBoard();
    };
    loadSettings();
  }, [initBoard]);

  const toggleSound = async () => {
    const nextMute = !muted;
    await SoundManager.setMuted(nextMute);
    setMuted(nextMute);
  };

  const handleCardPress = (index: number) => {
    if (lockBoard || cards[index].isFlipped || cards[index].isMatched) return;

    // Flip the tapped card
    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setLockBoard(true);
      setMoves((prev) => prev + 1);

      const firstCardIdx = nextFlipped[0];
      const secondCardIdx = nextFlipped[1];

      // Compare
      if (cards[firstCardIdx].emoji === cards[secondCardIdx].emoji) {
        // MATCH FOUND!
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstCardIdx].isMatched = true;
          matchedCards[secondCardIdx].isMatched = true;
          
          setCards(matchedCards);
          setFlippedIndices([]);
          setPairsFound((prev) => {
            const nextPairs = prev + 1;
            if (nextPairs === 6) {
              // Game Won!
              SoundManager.playSuccess();
              setTimeout(() => {
                router.replace({
                  pathname: '/result',
                  params: {
                    score: '5', // standard congrats star mapping
                    total: '5',
                    category: 'memory',
                  },
                } as any);
              }, 1200);
            }
            return nextPairs;
          });
          setLockBoard(false);
          SoundManager.playSuccess();
        }, 300);
      } else {
        // MATCH FAILED! Flip back down after 1s
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstCardIdx].isFlipped = false;
          resetCards[secondCardIdx].isFlipped = false;
          
          setCards(resetCards);
          setFlippedIndices([]);
          setLockBoard(false);
          SoundManager.playWrong();
        }, 1100);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
      <View style={styles.container}>
        {/* 1. Header Area */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/')}
            accessibilityRole="button"
            accessibilityLabel="Back to main menu"
          >
            <Text style={styles.backButtonText}>🏠</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Moves: {moves}</Text>
          <TouchableOpacity
            style={[styles.soundToggle, muted ? styles.soundMuted : styles.soundOn]}
            onPress={toggleSound}
            accessibilityRole="button"
            accessibilityLabel={muted ? "Turn sound on" : "Mute sound"}
          >
            <Text style={styles.soundToggleText}>{muted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Prompt Instruction Label */}
        <View style={styles.promptSection}>
          <Text style={styles.promptLabel}>Find all the matching cards!</Text>
          <View style={styles.statsBubble}>
            <Text style={styles.statsText}>Pairs: {pairsFound} of 6</Text>
          </View>
        </View>

        {/* 3. Cards Board Grid Area (4x3) */}
        <View style={styles.boardSection}>
          <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.grid}>
            {cards.map((card, idx) => (
              <MemoryCard
                key={card.id}
                card={card}
                onPress={() => handleCardPress(idx)}
                disabled={lockBoard}
              />
            ))}
          </Animated.View>
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
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#7F8C8D',
    marginBottom: 6,
  },
  statsBubble: {
    backgroundColor: '#FFECD9',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD19B',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#D35400',
  },
  boardSection: {
    flex: 5,
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  card: {
    width: '28%',
    margin: '2.5%',
    aspectRatio: 0.85,
    borderRadius: 18,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  hiddenCard: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FFFFFF',
  },
  flippedCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#4D96FF',
  },
  matchedCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#6BCB77',
    opacity: 0.85,
  },
  cardEmoji: {
    fontSize: 42,
    textAlign: 'center',
  },
  cardCoverText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
