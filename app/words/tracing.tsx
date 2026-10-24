import React, { useState, useEffect } from 'react';
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
import ConfettiCannon from 'react-native-confetti-cannon';
import { LETTER_CHARACTERS } from '../../src/features/tracing/tracingEngine';
import { TracingBoard } from '../../src/components/TracingBoard';
import { recordGameSession } from '../../src/storage/progress';
import { SoundManager } from '../../src/utils/audio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LetterTracingScreen() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentItem = LETTER_CHARACTERS[currentIndex];
  const total = LETTER_CHARACTERS.length;

  useEffect(() => {
    return () => {
      SoundManager.stop();
    };
  }, []);

  const handleBack = async () => {
    await SoundManager.stop();
    router.replace('/words');
  };

  if (!currentItem && !isComplete) {
    return null;
  }

  const handleNext = () => {
    SoundManager.playSuccess();
    if (currentIndex + 1 < total) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsComplete(true);
      recordGameSession({
        gameId: 'words-tracing',
        totalQuestions: total,
        correctAnswers: total,
        starsEarned: 3,
        durationMs: 40000,
      });
    }
  };

  const handlePlayAgain = () => {
    setCurrentIndex(0);
    setIsComplete(false);
  };

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
            accessibilityLabel="Back to Word Hub"
          >
            <Text style={styles.backBtnText}>⬅️</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerBadge}>ALPHABET TRACING</Text>
            <Text style={styles.headerTitle}>Write A to Z 🔤</Text>
          </View>

          <View style={styles.counterBadge}>
            <Text style={styles.counterBadgeText}>
              {currentIndex + 1} / {total}
            </Text>
          </View>
        </View>

        {!isComplete ? (
          <TracingBoard item={currentItem} onNext={handleNext} />
        ) : (
          <View style={styles.completeContainer}>
            <Text style={styles.celebrationEmoji}>🎉 🔤 🌟</Text>
            <Text style={styles.celebrationTitle}>Alphabet Master!</Text>
            <Text style={styles.celebrationSub}>
              You traced all the letters from A to Z!
            </Text>

            <View style={styles.starsRow}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.star}>⭐</Text>
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, styles.playAgainBtn]}
              onPress={handlePlayAgain}
            >
              <Text style={styles.actionBtnText}>Trace Again 🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.homeBtn]}
              onPress={() => router.replace('/words')}
            >
              <Text style={styles.homeBtnText}>Back to Word Hub 🏠</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  },
  headerBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FF9F43',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2D3748',
  },
  counterBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  counterBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
    textAlign: 'center',
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
