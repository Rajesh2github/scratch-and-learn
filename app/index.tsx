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
} from 'react-native-reanimated';
import { categories } from '../src/data/categories';
import { CategoryInfo } from '../src/types/game';
import { SoundManager } from '../src/utils/audio';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CategoryCard: React.FC<{ category: CategoryInfo; onPress: () => void }> = ({
  category,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (category.isComingSoon) return;
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    if (category.isComingSoon) return;
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
      accessibilityLabel={`${category.name}${category.isComingSoon ? ', Coming Soon' : ''}`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={category.isComingSoon}
      style={[
        styles.card,
        { backgroundColor: category.color },
        category.isComingSoon && styles.comingSoonCard,
        animatedStyle,
      ]}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardIcon}>{category.icon}</Text>
        <Text style={styles.cardName}>{category.name}</Text>
        {category.isComingSoon && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>COMING SOON</Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const [muted, setMuted] = useState(false);

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

  const handleCategoryPress = (category: CategoryInfo) => {
    if (category.isComingSoon) return;
    router.push(`/game/${category.id}`);
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
          <Text style={styles.emojiTitle}>🎨 ✨ 🍉</Text>
          <Text style={styles.title}>Scratch & Learn</Text>
          <Text style={styles.subtitle}>Choose a category to start playing!</Text>
        </View>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              onPress={() => handleCategoryPress(item)}
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
});
