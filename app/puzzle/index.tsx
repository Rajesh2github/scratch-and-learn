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
} from 'react-native-reanimated';
import { SoundManager } from '../../src/utils/audio';
import { shuffleArray } from '../../src/utils/shuffle';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface PuzzlePiece {
  id: number; // Unique immutable piece index
  correctIndex: number; // The index this piece SHOULD be in
  emoji: string;
}

// 4 Animal groupings for various puzzles
const PUZZLE_SETS = [
  ['🦁', '🐯', '🐨', '🐼'],
  ['🍎', '🍌', '🍒', '🍉'],
  ['🚗', '🚂', '🚁', '🚀'],
  ['🥦', '🥕', '🌽', '🍅'],
];

const PuzzlePieceCard: React.FC<{
  piece: PuzzlePiece;
  onPress: () => void;
  isSelected: boolean;
  isMatched: boolean;
}> = ({ piece, onPress, isSelected, isMatched }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isMatched) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 150 }),
        withSpring(1, { damping: 8 })
      );
    }
  }, [isMatched, scale]);

  const handlePressIn = () => {
    scale.value = withTiming(0.92, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <AnimatedTouchableOpacity
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Puzzle piece showing ${piece.emoji}`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.piece,
        isSelected && styles.selectedPiece,
        isMatched && styles.matchedPiece,
        animatedStyle,
      ]}
    >
      <Text style={styles.pieceEmoji}>{piece.emoji}</Text>
      
      {/* Corner helper coordinates for kids */}
      <View style={styles.coordinateContainer}>
        <Text style={styles.coordinateText}>{piece.correctIndex + 1}</Text>
      </View>
    </AnimatedTouchableOpacity>
  );
};

export default function PuzzleGameScreen() {
  const router = useRouter();

  const [muted, setMuted] = useState(false);
  const [board, setBoard] = useState<PuzzlePiece[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [targetSet, setTargetSet] = useState<string[]>([]);

  // Initialize Puzzle
  const initPuzzle = useCallback(() => {
    // Pick random puzzle set
    const selectedSet = shuffleArray(PUZZLE_SETS)[0];
    setTargetSet(selectedSet);

    // Create 4 pieces
    const pieces: PuzzlePiece[] = selectedSet.map((emoji, idx) => ({
      id: idx,
      correctIndex: idx,
      emoji,
    }));

    // Shuffle board ensuring it's not already solved
    let shuffled = shuffleArray(pieces);
    while (isSolved(shuffled)) {
      shuffled = shuffleArray(pieces);
    }

    setBoard(shuffled);
    setSelectedIdx(null);
    setMoves(0);
    setIsWon(false);
  }, []);

  const isSolved = (currentBoard: PuzzlePiece[]) => {
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i].correctIndex !== i) return false;
    }
    return true;
  };

  // Init settings
  useEffect(() => {
    const loadSettings = async () => {
      await SoundManager.init();
      setMuted(SoundManager.getMuted());
      initPuzzle();
    };
    loadSettings();
  }, [initPuzzle]);

  const toggleSound = async () => {
    const nextMute = !muted;
    await SoundManager.setMuted(nextMute);
    setMuted(nextMute);
  };

  const handlePiecePress = (index: number) => {
    if (isWon) return;

    if (selectedIdx === null) {
      // First selection
      setSelectedIdx(index);
      SoundManager.playWord('Select!');
    } else {
      // Second selection -> SWAP!
      if (selectedIdx === index) {
        setSelectedIdx(null);
        return;
      }

      setMoves((prev) => prev + 1);
      const updatedBoard = [...board];
      const temp = updatedBoard[selectedIdx];
      updatedBoard[selectedIdx] = updatedBoard[index];
      updatedBoard[index] = temp;

      setBoard(updatedBoard);
      setSelectedIdx(null);

      // Check win status
      if (isSolved(updatedBoard)) {
        setIsWon(true);
        SoundManager.playSuccess();
        setTimeout(() => {
          router.replace({
            pathname: '/result',
            params: {
              score: '5',
              total: '5',
              category: 'puzzle',
            },
          } as any);
        }, 1500);
      } else {
        SoundManager.playSuccess(); // play standard swap chime
      }
    }
  };

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

        {/* 2. Target Goal Reference Box */}
        <View style={styles.promptSection}>
          <Text style={styles.promptLabel}>Swap the pieces to match the pattern!</Text>
          <View style={styles.targetCard}>
            <Text style={styles.targetLabel}>TARGET PATTERN:</Text>
            <View style={styles.targetGrid}>
              {targetSet.map((emoji, idx) => (
                <View key={idx} style={styles.targetPiece}>
                  <Text style={styles.targetPieceText}>{emoji}</Text>
                  <Text style={styles.targetPieceNumber}>{idx + 1}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 3. Sliding / Swapping Puzzle Grid (2x2) */}
        <View style={styles.boardSection}>
          <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.grid}>
            {board.map((piece, idx) => {
              const isSelected = selectedIdx === idx;
              const isMatched = piece.correctIndex === idx;

              return (
                <PuzzlePieceCard
                  key={piece.id}
                  piece={piece}
                  onPress={() => handlePiecePress(idx)}
                  isSelected={isSelected}
                  isMatched={isMatched}
                />
              );
            })}
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
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 12,
  },
  targetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFEAA7',
    padding: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFB300',
    letterSpacing: 1,
    marginBottom: 6,
  },
  targetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
  },
  targetPiece: {
    alignItems: 'center',
    backgroundColor: '#FFFDF0',
    borderWidth: 2,
    borderColor: '#FFEAA7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: '20%',
  },
  targetPieceText: {
    fontSize: 24,
  },
  targetPieceNumber: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B2BEC3',
    marginTop: 2,
  },
  boardSection: {
    flex: 4.5,
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderWidth: 6,
    borderColor: '#4D96FF',
    borderRadius: 28,
    backgroundColor: '#E8F4FF',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  piece: {
    width: '45%',
    height: '45%',
    margin: '2.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedPiece: {
    borderColor: '#FF8A3D',
    backgroundColor: '#FFF2E6',
    borderWidth: 5,
  },
  matchedPiece: {
    borderColor: '#6BCB77',
    backgroundColor: '#FFF',
    borderWidth: 4,
  },
  pieceEmoji: {
    fontSize: 54,
    textAlign: 'center',
  },
  coordinateContainer: {
    position: 'absolute',
    top: 4,
    left: 6,
    backgroundColor: '#F1F2F6',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderWidth: 1,
    borderColor: '#CED6E0',
  },
  coordinateText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#57606F',
  },
});
