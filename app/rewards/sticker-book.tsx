import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import {
  loadProgress,
  unlockNewSticker,
  savePlacedStickers,
  PlacedSticker,
  LocalProgress,
  STICKER_NAMES,
} from '../../src/storage/progress';
import { SoundManager } from '../../src/utils/audio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StickerBookScreen() {
  const router = useRouter();

  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [placed, setPlaced] = useState<PlacedSticker[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const data = await loadProgress();
    setProgress(data);
    setPlaced(data.placedStickers || []);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Immediately stop any playing audio/speech when leaving the Sticker Book
  useEffect(() => {
    return () => {
      SoundManager.stop();
    };
  }, []);

  const handleBack = async () => {
    await SoundManager.stop();
    router.replace('/');
  };

  const handleUnlockPress = async () => {
    if (!progress || progress.stickerTokens < 1) {
      Alert.alert(
        'Need More Tokens! 🪙',
        'Play any game to earn tokens and unlock surprise stickers!'
      );
      return;
    }

    const result = await unlockNewSticker();
    if (result.success && result.unlockedSticker) {
      SoundManager.playSuccess();
      setNewlyUnlocked(result.unlockedSticker);
      setProgress(result.progress);
      const stickerName = STICKER_NAMES[result.unlockedSticker] || 'New sticker';
      SoundManager.playWord(stickerName);
    }
  };

  const handleCanvasTap = (e: any) => {
    // If user tapped on canvas without a selected sticker, do nothing
  };

  const handlePlaceSticker = async (stickerEmoji: string) => {
    // Place near random spot on canvas
    const x = Math.floor(Math.random() * (SCREEN_WIDTH - 100)) + 20;
    const y = Math.floor(Math.random() * 220) + 40;

    const newPlaced: PlacedSticker = {
      id: `placed_${Date.now()}_${Math.random()}`,
      stickerEmoji,
      x,
      y,
    };

    const updated = [...placed, newPlaced];
    setPlaced(updated);
    // Speak friendly English word name (e.g. "Unicorn") instead of raw emoji Unicode description
    const friendlyName = STICKER_NAMES[stickerEmoji] || 'Sticker';
    SoundManager.playWord(friendlyName);
    await savePlacedStickers(updated);
  };

  const handleClearCanvas = async () => {
    setPlaced([]);
    await savePlacedStickers([]);
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
            accessibilityLabel="Back to Home"
          >
            <Text style={styles.backBtnText}>⬅️</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerBadge}>REWARDS & FUN</Text>
            <Text style={styles.headerTitle}>Sticker Book 🎨</Text>
          </View>

          <View style={styles.tokenPill}>
            <Text style={styles.tokenPillText}>🪙 {progress?.stickerTokens || 0}</Text>
          </View>
        </View>

        {/* Action Row: Unlock surprise sticker & Clear canvas */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.unlockBtn,
              (progress?.stickerTokens || 0) < 1 && styles.unlockBtnDisabled,
            ]}
            onPress={handleUnlockPress}
            accessibilityRole="button"
            accessibilityLabel="Open Mystery Sticker Gift"
          >
            <Text style={styles.unlockBtnText}>🎁 Get New Sticker (1 🪙)</Text>
          </TouchableOpacity>

          {placed.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClearCanvas}
              accessibilityRole="button"
              accessibilityLabel="Clear Canvas"
            >
              <Text style={styles.clearBtnText}>🧹 Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Digital Sticker Canvas Landscape */}
        <View style={styles.canvasContainer} onTouchEnd={handleCanvasTap}>
          {/* Nature Background Decor */}
          <View style={styles.skyDecor}>
            <Text style={styles.cloudText}>☁️</Text>
            <Text style={styles.sunText}>☀️</Text>
            <Text style={styles.cloudText2}>☁️</Text>
          </View>
          <View style={styles.groundDecor}>
            <Text style={styles.grassText}>🌱 🌸 🌻 🍄 🌱</Text>
          </View>

          {/* Placed Stickers */}
          {placed.map((item) => (
            <View
              key={item.id}
              style={[
                styles.placedStickerWrapper,
                { left: item.x, top: item.y },
              ]}
            >
              <Text style={styles.placedStickerEmoji}>{item.stickerEmoji}</Text>
            </View>
          ))}

          {placed.length === 0 && (
            <View style={styles.emptyPromptBox} pointerEvents="none">
              <Text style={styles.emptyPromptTitle}>Tap any sticker below!</Text>
              <Text style={styles.emptyPromptSub}>
                Stick them on your world 🎨
              </Text>
            </View>
          )}
        </View>

        {/* Sticker Tray Drawer */}
        <View style={styles.trayContainer}>
          <Text style={styles.trayTitle}>
            YOUR STICKERS ({progress?.unlockedStickers.length || 0})
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trayScroll}
          >
            {(progress?.unlockedStickers || []).map((emoji, index) => (
              <TouchableOpacity
                key={`${emoji}-${index}`}
                style={styles.trayStickerCard}
                onPress={() => handlePlaceSticker(emoji)}
                accessibilityRole="button"
                accessibilityLabel={`Place sticker ${emoji}`}
              >
                <Text style={styles.trayStickerEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Unlock Celebration Confetti */}
        {newlyUnlocked && (
          <ConfettiCannon
            count={80}
            origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
            fallSpeed={2500}
            fadeOut={true}
            onAnimationEnd={() => setNewlyUnlocked(null)}
          />
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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 22,
    fontWeight: '900',
    color: '#2D3748',
  },
  tokenPill: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tokenPillText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#92400E',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  unlockBtn: {
    flex: 1,
    backgroundColor: '#6BCB77',
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#4BAA57',
    alignItems: 'center',
    marginRight: 8,
    elevation: 2,
  },
  unlockBtnDisabled: {
    backgroundColor: '#CBD5E1',
    borderColor: '#94A3B8',
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  clearBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  clearBtnText: {
    color: '#64748B',
    fontWeight: '800',
    fontSize: 14,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#38BDF8',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  skyDecor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sunText: {
    fontSize: 32,
  },
  cloudText: {
    fontSize: 28,
    opacity: 0.8,
  },
  cloudText2: {
    fontSize: 24,
    opacity: 0.7,
  },
  groundDecor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#86EFAC',
    borderTopWidth: 3,
    borderTopColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  grassText: {
    fontSize: 18,
  },
  placedStickerWrapper: {
    position: 'absolute',
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placedStickerEmoji: {
    fontSize: 48,
  },
  emptyPromptBox: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPromptTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0369A1',
  },
  emptyPromptSub: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: 4,
  },
  trayContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  trayTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  trayScroll: {
    paddingVertical: 4,
  },
  trayStickerCard: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FFF9F0',
    borderWidth: 2,
    borderColor: '#FED7AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    elevation: 2,
  },
  trayStickerEmoji: {
    fontSize: 34,
  },
});
