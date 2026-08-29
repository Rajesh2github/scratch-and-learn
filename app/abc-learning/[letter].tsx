import React, { useState, useEffect, useMemo } from 'react';
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
import Animated, { FadeIn } from 'react-native-reanimated';
import { alphabetsQuestions } from '../../src/data/alphabets';
import { SoundManager } from '../../src/utils/audio';

export default function LetterDetailScreen() {
  const router = useRouter();
  const { letter } = useLocalSearchParams<{ letter: string }>();

  const [muted, setMuted] = useState(false);

  // Parse letters mapping
  const letterIndex = useMemo(() => {
    if (!letter) return 0;
    const idx = alphabetsQuestions.findIndex(
      (q) => q.answer.toLowerCase() === letter.toLowerCase()
    );
    return idx !== -1 ? idx : 0;
  }, [letter]);

  const currentItem = alphabetsQuestions[letterIndex];

  // Split emoji and word info safely at the top: e.g. "🍎 (A for Apple)"
  const displayEmoji = useMemo(() => currentItem.emoji.split(' (')[0], [currentItem]);
  const displayPhonics = useMemo(() => {
    return currentItem.emoji.split(' (')[1]?.replace(')', '') || `${currentItem.answer} for Apple`;
  }, [currentItem]);

  // Sound settings
  useEffect(() => {
    const loadSoundSetting = async () => {
      await SoundManager.init();
      setMuted(SoundManager.getMuted());
    };
    loadSoundSetting();
  }, []);

  // Trigger TTS pronunciation on page mount or item change
  useEffect(() => {
    let active = true;
    const speakPhonics = async () => {
      if (active && currentItem) {
        // Stop any active talk first
        await SoundManager.unloadAll();
        // Speak custom phonics pattern: e.g. "A for Apple"
        await SoundManager.playWord(displayPhonics);
      }
    };

    // Delay speech slightly to allow screen entrance transition to complete smoothly
    const timer = setTimeout(() => {
      speakPhonics();
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [currentItem, displayPhonics]);

  const toggleSound = async () => {
    const nextMute = !muted;
    await SoundManager.setMuted(nextMute);
    setMuted(nextMute);
  };

  const handleNext = () => {
    const nextIndex = (letterIndex + 1) % alphabetsQuestions.length;
    const nextLetter = alphabetsQuestions[nextIndex].answer.toLowerCase();
    router.replace(`/abc-learning/${nextLetter}`);
  };

  const handlePrev = () => {
    const prevIndex = (letterIndex - 1 + alphabetsQuestions.length) % alphabetsQuestions.length;
    const prevLetter = alphabetsQuestions[prevIndex].answer.toLowerCase();
    router.replace(`/abc-learning/${prevLetter}`);
  };

  // Assign sequence colors
  const colors = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#FF9F43', '#00D2D3', '#54a0ff', '#5f27cd'];
  const themeColor = colors[letterIndex % colors.length];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
      <View style={styles.container}>
        {/* 1. Header bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/abc-learning')}
            accessibilityRole="button"
            accessibilityLabel="Back to alphabet menu"
          >
            <Text style={styles.backButtonText}>◀</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColor }]}>
            Alphabet {currentItem.answer}
          </Text>
          <TouchableOpacity
            style={[styles.soundToggle, muted ? styles.soundMuted : styles.soundOn]}
            onPress={toggleSound}
            accessibilityRole="button"
            accessibilityLabel={muted ? "Turn sound on" : "Mute sound"}
          >
            <Text style={styles.soundToggleText}>{muted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Main Content Card */}
        <View style={styles.cardContainer}>
          <Animated.View
            key={currentItem.answer} // Key forces animation reset on letter switch
            entering={FadeIn.duration(400)}
            style={[styles.card, { borderColor: themeColor }]}
          >
            <Text style={[styles.letterText, { color: themeColor }]}>
              {currentItem.answer}
            </Text>
            
            <Text style={styles.emojiText}>{displayEmoji}</Text>
            
            <View style={[styles.wordBubble, { backgroundColor: themeColor }]}>
              <Text style={styles.wordText}>{displayPhonics}</Text>
            </View>

            <TouchableOpacity
              style={[styles.audioRepeatButton, { backgroundColor: themeColor + '15', borderColor: themeColor }]}
              onPress={() => SoundManager.playWord(displayPhonics)}
              accessibilityRole="button"
              accessibilityLabel="Listen again"
            >
              <Text style={[styles.audioRepeatText, { color: themeColor }]}>🔊 Repeat Phonics</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* 3. Navigation Controls */}
        <View style={styles.navBar}>
          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel="Previous letter"
            style={styles.navButton}
            onPress={handlePrev}
          >
            <Text style={styles.navButtonText}>◀ Prev</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel="Next letter"
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
          >
            <Text style={styles.navButtonText}>Next ▶</Text>
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
    paddingHorizontal: 20,
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
    fontWeight: '800',
    color: '#4B6584',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
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
  cardContainer: {
    flex: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  card: {
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
  letterText: {
    fontSize: 100,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 3,
  },
  emojiText: {
    fontSize: 110,
    marginVertical: 4,
  },
  wordBubble: {
    paddingHorizontal: 24,
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
  wordText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  audioRepeatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginTop: 8,
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
});
