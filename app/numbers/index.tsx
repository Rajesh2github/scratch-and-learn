import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { numbersQuestions } from '../../src/data/numbers';
import { SoundManager } from '../../src/utils/audio';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const NumberCard: React.FC<{ value: string; word: string; index: number; onPress: () => void }> = ({
  value,
  word,
  index,
  onPress,
}) => {
  const scale = useSharedValue(1);

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

  const colors = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#FF9F43', '#00D2D3', '#54a0ff', '#5f27cd', '#FF6B6B', '#4D96FF'];
  const cardColor = colors[index % colors.length];

  return (
    <AnimatedPressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Number ${value}`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      entering={FadeInDown.delay(index * 40).duration(300)}
      style={[
        styles.card,
        { backgroundColor: cardColor },
        animatedStyle,
      ]}
    >
      <Text style={styles.cardText}>{value}</Text>
      <Text style={styles.cardSubText}>{word.toUpperCase()}</Text>
    </AnimatedPressable>
  );
};

export default function NumbersHomeScreen() {
  const router = useRouter();
  const [muted, setMuted] = useState(false);

  useEffect(() => {
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

  const handleNumberPress = (val: string) => {
    router.push(`/numbers/${val}`);
  };

  // Extract spelling and numerical value from questions
  const mappedNumbers = numbersQuestions.map((q) => {
    const spellingMap: { [key: string]: string } = {
      '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five',
      '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine', '10': 'Ten'
    };
    return {
      value: q.answer,
      word: spellingMap[q.answer] || 'One',
    };
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
      <View style={styles.container}>
        {/* Header Action Bar */}
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/')}
            accessibilityRole="button"
            accessibilityLabel="Back to main menu"
          >
            <Text style={styles.backButtonText}>🏠</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.soundToggle, muted ? styles.soundMuted : styles.soundOn]}
            onPress={toggleSound}
            accessibilityRole="button"
            accessibilityLabel={muted ? "Turn sound on" : "Mute sound"}
          >
            <Text style={styles.soundToggleText}>{muted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
        </View>

        {/* Text Header */}
        <View style={styles.header}>
          <Text style={styles.emojiTitle}>🔢 ✨ 🧸</Text>
          <Text style={styles.title}>Numbers Fun</Text>
          <Text style={styles.subtitle}>Tap a number to count together!</Text>
        </View>

        {/* Numbers grid */}
        <FlatList
          data={mappedNumbers}
          keyExtractor={(item) => item.value}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <NumberCard
              value={item.value}
              word={item.word}
              index={index}
              onPress={() => handleNumberPress(item.value)}
            />
          )}
        />
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
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
  header: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    width: '100%',
  },
  soundToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
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
  emojiTitle: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FF6B6B',
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7F8C8D',
    marginTop: 6,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    flex: 1,
    height: 120,
    margin: 8,
    borderRadius: 24,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  cardSubText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: 1,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
