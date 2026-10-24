import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { SoundManager } from '../src/utils/audio';
import { loadProgress, resetProgress, LocalProgress } from '../src/storage/progress';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HubCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  badge?: string;
}

const learningCategories: HubCategory[] = [
  {
    id: 'math',
    name: 'Math Adventure',
    description: 'Counting, Addition & Subtraction',
    icon: '🔢',
    color: '#6BCB77',
    route: '/math',
    badge: 'NEW 2.0',
  },
  {
    id: 'logic',
    name: 'Logic & Puzzles',
    description: 'Matching, Odd One Out & Patterns',
    icon: '🧩',
    color: '#5f27cd',
    route: '/logic',
    badge: 'NEW 2.0',
  },
  {
    id: 'words',
    name: 'Word Lab',
    description: 'Listen, Speak & Learn Phonics',
    icon: '🗣️',
    color: '#FF9F43',
    route: '/words',
    badge: 'NEW 2.0',
  },
];

interface MiniGameInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  route: string;
  isComingSoon?: boolean;
}

const classicGames: MiniGameInfo[] = [
  {
    id: 'scratch',
    name: 'Scratch & Guess',
    icon: '✋🏼',
    color: '#FF6B6B',
    route: '/scratch',
  },
  {
    id: 'abc',
    name: 'ABC Phonics',
    icon: '🔤',
    color: '#4D96FF',
    route: '/abc-learning',
  },
  {
    id: 'numbers',
    name: 'Numbers Fun',
    icon: '🔟',
    color: '#10ac84',
    route: '/numbers',
  },
  {
    id: 'colors',
    name: 'Colors Fun',
    icon: '🎨',
    color: '#ee5253',
    route: '/colors',
  },
  {
    id: 'animals',
    name: 'Animal Sounds',
    icon: '🐶',
    color: '#feca57',
    route: '/animal-sounds',
  },
  {
    id: 'find-object',
    name: 'Find Object',
    icon: '🔍',
    color: '#00d2d3',
    route: '/find-object',
  },
  {
    id: 'memory',
    name: 'Memory Game',
    icon: '🧠',
    color: '#54a0ff',
    route: '/memory',
  },
  {
    id: 'puzzle',
    name: 'Picture Puzzle',
    icon: '🖼️',
    color: '#8395a7',
    route: '/puzzle',
  },
  {
    id: 'ride',
    name: 'Learn & Ride',
    icon: '🚗',
    color: '#ff9f43',
    route: '/ride',
  },
];

const CategoryHeroCard: React.FC<{
  category: HubCategory;
  onPress: () => void;
}> = ({ category, onPress }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${category.name}, ${category.description}`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.heroCard,
        { backgroundColor: category.color },
        animatedStyle,
      ]}
    >
      <View style={styles.heroCardBadge}>
        <Text style={styles.heroCardBadgeText}>{category.badge}</Text>
      </View>
      <Text style={styles.heroIcon}>{category.icon}</Text>
      <View style={styles.heroTextContainer}>
        <Text style={styles.heroTitle}>{category.name}</Text>
        <Text style={styles.heroSubtitle}>{category.description}</Text>
      </View>
      <View style={styles.heroArrow}>
        <Text style={styles.heroArrowText}>➔</Text>
      </View>
    </AnimatedPressable>
  );
};

const ClassicGameCard: React.FC<{
  game: MiniGameInfo;
  onPress: () => void;
}> = ({ game, onPress }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.94, { duration: 100 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={game.name}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.classicCard,
        { backgroundColor: game.color },
        animatedStyle,
      ]}
    >
      <Text style={styles.classicIcon}>{game.icon}</Text>
      <Text style={styles.classicTitle} numberOfLines={2}>
        {game.name}
      </Text>
    </AnimatedPressable>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState<LocalProgress | null>(null);

  // Parental Gate Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = useCallback(async () => {
    await SoundManager.init();
    setMuted(SoundManager.getMuted());
    const userProgress = await loadProgress();
    setProgress(userProgress);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSound = async () => {
    const nextMute = !muted;
    await SoundManager.setMuted(nextMute);
    setMuted(nextMute);
  };

  const openParentGate = () => {
    const n1 = Math.floor(Math.random() * 6) + 4;
    const n2 = Math.floor(Math.random() * 6) + 3;
    setNum1(n1);
    setNum2(n2);
    setUserAnswer('');
    setErrorMessage('');
    setIsUnlocked(false);
    setModalVisible(true);
  };

  const handleVerifyGate = () => {
    if (parseInt(userAnswer.trim(), 10) === num1 + num2) {
      setIsUnlocked(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Incorrect answer. Parents, please try again!');
    }
  };

  const handleOpenPrivacy = async () => {
    try {
      await WebBrowser.openBrowserAsync(
        'https://www.rajeshtiwari.com/privacy-policy/scratch-and-learn'
      );
    } catch (e) {
      console.warn('Error opening privacy link:', e);
    }
  };

  const handleResetData = async () => {
    await resetProgress();
    await loadData();
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.parentsButton}
            onPress={openParentGate}
            accessibilityRole="button"
            accessibilityLabel="Parents settings area"
          >
            <Text style={styles.parentsButtonText}>🔒 Parents</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.appTitle}>Scratch & Learn</Text>
            <Text style={styles.appBadge}>2.0 LEARNING HUB</Text>
          </View>

          <TouchableOpacity
            style={[styles.soundToggle, muted ? styles.soundMuted : styles.soundOn]}
            onPress={toggleSound}
            accessibilityRole="button"
            accessibilityLabel={muted ? 'Turn sound on' : 'Mute sound'}
          >
            <Text style={styles.soundToggleText}>{muted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Star Progress Pill & Sticker Book Button */}
          <View style={styles.topStatusRow}>
            {progress && progress.totalStarsEarned > 0 ? (
              <View style={styles.starsPill}>
                <Text style={styles.starsPillText}>
                  ⭐ {progress.totalStarsEarned} Stars
                </Text>
              </View>
            ) : <View />}

            <TouchableOpacity
              style={styles.stickerBookBadge}
              onPress={() => router.push('/rewards/sticker-book' as any)}
              accessibilityRole="button"
              accessibilityLabel="Open Sticker Book"
            >
              <Text style={styles.stickerBookBadgeText}>
                🎨 Sticker Book ({progress?.unlockedStickers?.length || 2})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section 1: 2.0 Core Learning Adventures */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 Learning Adventures</Text>
            <Text style={styles.sectionSubtitle}>
              Interactive early learning for ages 3–6
            </Text>
          </View>

          {learningCategories.map((category) => (
            <CategoryHeroCard
              key={category.id}
              category={category}
              onPress={() => router.push(category.route as any)}
            />
          ))}

          {/* Section 2: Classic Mini Games */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>🌟 Classic Mini-Games</Text>
            <Text style={styles.sectionSubtitle}>
              Scratch cards, memory, phonics & fun
            </Text>
          </View>

          <View style={styles.classicGrid}>
            {classicGames.map((game) => (
              <ClassicGameCard
                key={game.id}
                game={game}
                onPress={() => router.push(game.route as any)}
              />
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Rajesh Tiwari • rajeshtiwari.com
            </Text>
            <Text style={styles.footerSubText}>
              Offline-first & Privacy-first Early Learning
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Parental Gate & Settings Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {!isUnlocked ? (
              <>
                <Text style={styles.modalTitle}>Parents Only</Text>
                <Text style={styles.modalSubtitle}>
                  Please solve this math equation to access Parent Settings & Privacy:
                </Text>
                <Text style={styles.modalQuestion}>
                  {num1} + {num2} = ?
                </Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="number-pad"
                  maxLength={3}
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  placeholder="Your answer"
                  placeholderTextColor="#94A3B8"
                  autoFocus={true}
                />
                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={handleVerifyGate}
                  >
                    <Text style={styles.modalButtonText}>Enter</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Parent Settings</Text>
                <Text style={styles.modalSubtitle}>
                  Version 2.0 • Offline & Child-Safe
                </Text>

                <View style={styles.statsCard}>
                  <Text style={styles.statsText}>
                    ⭐ Total Stars Earned: {progress?.totalStarsEarned || 0}
                  </Text>
                  <Text style={styles.statsText}>
                    🎮 Games Completed: {progress?.gamesCompleted || 0}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.settingsActionButton}
                  onPress={handleOpenPrivacy}
                >
                  <Text style={styles.settingsActionText}>
                    📜 Read Privacy Policy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.settingsActionButton, styles.resetButton]}
                  onPress={handleResetData}
                >
                  <Text style={[styles.settingsActionText, styles.resetText]}>
                    🗑️ Reset Saved Progress
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.closeSettingsBtn]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1E6D0',
  },
  headerCenter: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  appBadge: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#4D96FF',
    marginTop: 2,
  },
  parentsButton: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  parentsButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  soundToggle: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  soundToggleText: {
    fontSize: 18,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  topStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  stickerBookBadge: {
    backgroundColor: '#FEF08A',
    borderWidth: 2,
    borderColor: '#EAB308',
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 14,
    elevation: 2,
  },
  stickerBookBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#854D0E',
  },
  starsPill: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  starsPillText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#92400E',
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2D3748',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#718096',
    marginTop: 2,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    marginBottom: 12,
    elevation: 4,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  heroCardBadge: {
    position: 'absolute',
    top: 8,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  heroCardBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroIcon: {
    fontSize: 42,
    marginRight: 14,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  heroArrow: {
    marginLeft: 8,
  },
  heroArrowText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  classicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  classicCard: {
    width: '48%',
    height: 110,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  classicIcon: {
    fontSize: 34,
    marginBottom: 4,
  },
  classicTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
  },
  footerSubText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFF9F0',
    borderRadius: 28,
    borderWidth: 5,
    borderColor: '#4D96FF',
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF6B6B',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 14,
  },
  modalQuestion: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2C3E50',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    width: '100%',
    height: 54,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    color: '#2C3E50',
    marginBottom: 12,
  },
  errorText: {
    color: '#FF6B6B',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  submitButton: {
    backgroundColor: '#6BCB77',
  },
  closeSettingsBtn: {
    backgroundColor: '#4D96FF',
    width: '100%',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    width: '100%',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginVertical: 2,
  },
  settingsActionButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingsActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  resetButton: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  resetText: {
    color: '#DC2626',
  },
});
