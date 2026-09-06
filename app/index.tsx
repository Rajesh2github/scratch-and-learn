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
  Modal,
  TextInput,
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MiniGameInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  route: string;
  isComingSoon?: boolean;
}

const miniGames: MiniGameInfo[] = [
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
    icon: '🔢',
    color: '#6BCB77',
    route: '/numbers',
  },
  {
    id: 'colors',
    name: 'Colors Fun',
    icon: '🎨',
    color: '#FF9F43',
    route: '/colors',
  },
  {
    id: 'animals',
    name: 'Animal Sounds',
    icon: '🐶',
    color: '#FFD93D',
    route: '/animal-sounds',
  },
  {
    id: 'find-object',
    name: 'Find Object',
    icon: '🔍',
    color: '#00D2D3',
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
    icon: '🧩',
    color: '#5f27cd',
    route: '/puzzle',
  },
  {
    id: 'ride',
    name: 'Learn & Ride',
    icon: '🚗',
    color: '#FF8A3D',
    route: '/ride',
  },
];

const GameCard: React.FC<{ game: MiniGameInfo; onPress: () => void }> = ({
  game,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (game.isComingSoon) return;
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    if (game.isComingSoon) return;
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <AnimatedPressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${game.name}${game.isComingSoon ? ', Coming Soon' : ''}`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={game.isComingSoon}
      style={[
        styles.card,
        { backgroundColor: game.color },
        game.isComingSoon && styles.comingSoonCard,
        animatedStyle,
      ]}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardIcon}>{game.icon}</Text>
        <Text style={styles.cardName}>{game.name}</Text>
        {game.isComingSoon && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>COMING SOON</Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
};

interface ListFooterProps {
  onPrivacyPress: () => void;
}

const ListFooter: React.FC<ListFooterProps> = ({ onPrivacyPress }) => {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        © {new Date().getFullYear()} Rajesh Tiwari • rajeshtiwari.com
      </Text>
      <TouchableOpacity
        onPress={onPrivacyPress}
        style={styles.privacyButton}
        accessibilityRole="button"
        accessibilityLabel="Privacy Policy"
      >
        <Text style={styles.privacyText}>🔒 Parents Area: Privacy Policy</Text>
      </TouchableOpacity>
      <Text style={styles.footerSubText}>
        Designed & Developed with 💖 for Kids Learning
      </Text>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const [muted, setMuted] = useState(false);

  // Parental Gate Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Load initial mute setting
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

  const handleGamePress = (game: MiniGameInfo) => {
    if (game.isComingSoon) return;
    router.push(game.route as any);
  };

  // Open Parental Gate with a new math question
  const handlePrivacyPress = () => {
    const n1 = Math.floor(Math.random() * 7) + 3; // 3 to 9
    const n2 = Math.floor(Math.random() * 7) + 3; // 3 to 9
    setNum1(n1);
    setNum2(n2);
    setUserAnswer('');
    setErrorMessage('');
    setModalVisible(true);
  };

  const handleVerify = async () => {
    const correctAnswer = num1 + num2;
    if (parseInt(userAnswer.trim(), 10) === correctAnswer) {
      setModalVisible(false);
      try {
        await WebBrowser.openBrowserAsync('https://www.rajeshtiwari.com/privacy-policy/scratch-and-learn');
      } catch (error) {
        console.error('Error opening browser:', error);
      }
    } else {
      setErrorMessage('Incorrect answer. Parents, please try again!');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.soundToggle, muted ? styles.soundMuted : styles.soundOn]}
            onPress={toggleSound}
            accessibilityRole="button"
            accessibilityLabel={muted ? "Turn sound on" : "Mute sound"}
          >
            <Text style={styles.soundToggleText}>{muted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
          <Text style={emojiTitleClass(styles.emojiTitle)}>🎓 🧸 ✨</Text>
          <Text style={styles.title}>Learn & Play</Text>
          <Text style={styles.subtitle}>Choose a mini-game to start playing!</Text>
        </View>

        <FlatList
          data={miniGames}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => <ListFooter onPrivacyPress={handlePrivacyPress} />}
          renderItem={({ item }) => (
            <GameCard
              game={item}
              onPress={() => handleGamePress(item)}
            />
          )}
        />
      </View>

      {/* Parental Gate Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Parents Only Area</Text>
            <Text style={styles.modalSubtitle}>
              Please solve this simple math problem to view the Privacy Policy.
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

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleVerify}
              >
                <Text style={styles.modalButtonText}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helper to avoid re-declaring types for style items if needed
const emojiTitleClass = (style: any) => style;

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
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    position: 'relative',
    width: '100%',
  },
  soundToggle: {
    position: 'absolute',
    top: 0,
    right: 8,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  soundOn: {
    backgroundColor: '#6BCB77',
  },
  soundMuted: {
    backgroundColor: '#A5B1C2',
  },
  soundToggleText: {
    fontSize: 20,
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
    height: 160,
    margin: 8,
    borderRadius: 24,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  comingSoonCard: {
    backgroundColor: '#BDC3C7',
    opacity: 0.7,
    borderColor: '#E2E8F0',
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  cardName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  comingSoonBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  comingSoonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    marginTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#E2E8F0',
    width: '90%',
    alignSelf: 'center',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    textAlign: 'center',
  },
  footerSubText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
    marginTop: 4,
    textAlign: 'center',
  },
  privacyButton: {
    marginVertical: 12,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  privacyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
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
    borderRadius: 32,
    borderWidth: 6,
    borderColor: '#4D96FF',
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalQuestion: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2C3E50',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    width: '100%',
    height: 60,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    color: '#2C3E50',
    marginBottom: 12,
  },
  errorText: {
    color: '#FF6B6B',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  submitButton: {
    backgroundColor: '#6BCB77',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
