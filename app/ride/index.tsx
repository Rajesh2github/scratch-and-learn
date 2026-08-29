import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { SoundManager } from '../../src/utils/audio';
import { categories } from '../../src/data/categories';

export default function RideSelectionScreen() {
  const router = useRouter();
  const [muted, setMuted] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<'car' | 'bike'>('car');
  const [selectedCategory, setSelectedCategory] = useState<string>('fruits');

  // Filter out locked coming soon categories so only active ones are clickable in Ride
  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.id !== 'shapes' && c.id !== 'vehicles');
  }, []);

  // Sound settings
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

  const handleStartGame = () => {
    SoundManager.playWord(`Ready ... Set ... Go!`);
    router.push({
      pathname: '/ride/game',
      params: {
        vehicle: selectedVehicle,
        category: selectedCategory,
      },
    });
  };

  // Animated styles for vehicle options
  const carScale = useSharedValue(1);
  const bikeScale = useSharedValue(1);

  useEffect(() => {
    carScale.value = withSpring(selectedVehicle === 'car' ? 1.05 : 0.95);
    bikeScale.value = withSpring(selectedVehicle === 'bike' ? 1.05 : 0.95);
  }, [selectedVehicle, carScale, bikeScale]);

  const carStyle = useAnimatedStyle(() => ({
    transform: [{ scale: carScale.value }],
  }));

  const bikeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bikeScale.value }],
  }));

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
          <Text style={styles.headerTitle}>Learn & Ride</Text>
          <TouchableOpacity
            style={[styles.soundToggle, muted ? styles.soundMuted : styles.soundOn]}
            onPress={toggleSound}
            accessibilityRole="button"
            accessibilityLabel={muted ? "Turn sound on" : "Mute sound"}
          >
            <Text style={styles.soundToggleText}>{muted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Choose Category Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>1. Choose Learning World</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {activeCategories.map((item, index) => {
              const isSelected = selectedCategory === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setSelectedCategory(item.id);
                    SoundManager.playWord(`${item.name} World!`);
                  }}
                  style={[
                    styles.categoryCard,
                    { backgroundColor: item.color },
                    isSelected ? styles.activeCategoryCard : styles.inactiveCategoryCard,
                  ]}
                >
                  <Text style={styles.categoryIcon}>{item.icon}</Text>
                  <Text style={styles.categoryName}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. Vehicle Options */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>2. Choose Your Ride</Text>
          <View style={styles.optionsSection}>
            <Animated.View style={[styles.optionWrapper, carStyle]}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedVehicle('car');
                  SoundManager.playWord('Car!');
                }}
                style={[
                  styles.optionButton,
                  selectedVehicle === 'car' ? styles.activeOption : styles.inactiveOption,
                ]}
              >
                <Text style={styles.optionEmoji}>🚗</Text>
                <Text style={styles.optionText}>CAR</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[styles.optionWrapper, bikeStyle]}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedVehicle('bike');
                  SoundManager.playWord('Bike!');
                }}
                style={[
                  styles.optionButton,
                  selectedVehicle === 'bike' ? styles.activeOption : styles.inactiveOption,
                ]}
              >
                <Text style={styles.optionEmoji}>🏍️</Text>
                <Text style={styles.optionText}>BIKE</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* 4. Action Button */}
        <View style={styles.actionSection}>
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <TouchableOpacity
              accessible
              accessibilityRole="button"
              accessibilityLabel="Start Game"
              style={styles.startButton}
              onPress={handleStartGame}
            >
              <Text style={styles.startButtonText}>Start Riding! 🏁</Text>
            </TouchableOpacity>
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
    marginBottom: 8,
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
    color: '#FF6B6B',
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
  sectionContainer: {
    flex: 2.8,
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4B6584',
    marginBottom: 10,
    paddingLeft: 4,
  },
  categoryScroll: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  categoryCard: {
    width: 110,
    height: 120,
    marginRight: 12,
    borderRadius: 24,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  activeCategoryCard: {
    borderColor: '#FFFFFF',
    borderWidth: 5,
    shadowOpacity: 0.15,
  },
  inactiveCategoryCard: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
    opacity: 0.7,
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  optionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 4,
  },
  optionWrapper: {
    width: '45%',
    aspectRatio: 1.1,
  },
  optionButton: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  activeOption: {
    backgroundColor: '#FFFFFF',
    borderColor: '#6BCB77',
  },
  inactiveOption: {
    backgroundColor: '#F1F2F6',
    borderColor: '#DFE4EA',
    opacity: 0.75,
  },
  optionEmoji: {
    fontSize: 48,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#4B6584',
    marginTop: 6,
  },
  actionSection: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    paddingHorizontal: 40,
    height: 56,
    backgroundColor: '#6BCB77',
    borderColor: '#4BAA57',
    borderWidth: 4,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
