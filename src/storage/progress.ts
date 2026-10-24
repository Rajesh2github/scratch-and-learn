import { safeStorage } from './safeStorage';
import { SessionResult } from '../domain/types';

export interface GameStat {
  sessionsCompleted: number;
  bestStars: number;
  lastPlayedAt: number;
}

export interface PlacedSticker {
  id: string;
  stickerEmoji: string;
  x: number;
  y: number;
}

export interface LocalProgress {
  schemaVersion: number;
  gamesCompleted: number;
  totalStarsEarned: number;
  stickerTokens: number;
  unlockedStickers: string[];
  placedStickers: PlacedSticker[];
  gameStats: Record<string, GameStat>;
}

export const ALL_STICKERS: string[] = [
  '🦄', '🦖', '🚀', '🌈', '🍦', '🐶', '🐱', '🐼',
  '🦁', '⭐', '🎈', '🎨', '🍕', '🚗', '👑', '🍓',
  '🐬', '🦋', '⚽', '🧁',
];

export const STICKER_NAMES: Record<string, string> = {
  '🦄': 'Unicorn',
  '🦖': 'Dinosaur',
  '🚀': 'Rocket',
  '🌈': 'Rainbow',
  '🍦': 'Ice Cream',
  '🐶': 'Puppy',
  '🐱': 'Kitty',
  '🐼': 'Panda',
  '🦁': 'Lion',
  '⭐': 'Star',
  '🎈': 'Balloon',
  '🎨': 'Art',
  '🍕': 'Pizza',
  '🚗': 'Car',
  '👑': 'Crown',
  '🍓': 'Strawberry',
  '🐬': 'Dolphin',
  '🦋': 'Butterfly',
  '⚽': 'Soccer Ball',
  '🧁': 'Cupcake',
};

const PROGRESS_STORAGE_KEY = '@scratch_learn_progress_v1';

const DEFAULT_PROGRESS: LocalProgress = {
  schemaVersion: 1,
  gamesCompleted: 0,
  totalStarsEarned: 0,
  stickerTokens: 0,
  unlockedStickers: ['⭐', '🎈'], // 2 starting stickers
  placedStickers: [],
  gameStats: {},
};

export async function loadProgress(): Promise<LocalProgress> {
  try {
    const raw = await safeStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      unlockedStickers: parsed.unlockedStickers || DEFAULT_PROGRESS.unlockedStickers,
      placedStickers: parsed.placedStickers || [],
      gameStats: parsed.gameStats || {},
    };
  } catch (error) {
    console.warn('[progress] Failed to load progress:', error);
    return DEFAULT_PROGRESS;
  }
}

export async function recordGameSession(
  result: SessionResult
): Promise<LocalProgress> {
  try {
    const current = await loadProgress();
    const existingStat = current.gameStats[result.gameId] || {
      sessionsCompleted: 0,
      bestStars: 0,
      lastPlayedAt: 0,
    };

    const newBestStars = Math.max(existingStat.bestStars, result.starsEarned);
    const updatedStats: Record<string, GameStat> = {
      ...current.gameStats,
      [result.gameId]: {
        sessionsCompleted: existingStat.sessionsCompleted + 1,
        bestStars: newBestStars,
        lastPlayedAt: Date.now(),
      },
    };

    // Award 1 sticker token for every session completed!
    const updated: LocalProgress = {
      ...current,
      gamesCompleted: current.gamesCompleted + 1,
      totalStarsEarned: current.totalStarsEarned + result.starsEarned,
      stickerTokens: current.stickerTokens + 1,
      gameStats: updatedStats,
    };

    await safeStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('[progress] Failed to record session:', error);
    return DEFAULT_PROGRESS;
  }
}

export async function unlockNewSticker(): Promise<{
  success: boolean;
  unlockedSticker?: string;
  progress: LocalProgress;
}> {
  try {
    const current = await loadProgress();
    if (current.stickerTokens < 1) {
      return { success: false, progress: current };
    }

    // Find remaining locked stickers
    const remaining = ALL_STICKERS.filter((s) => !current.unlockedStickers.includes(s));
    const newSticker =
      remaining.length > 0
        ? remaining[Math.floor(Math.random() * remaining.length)]
        : ALL_STICKERS[Math.floor(Math.random() * ALL_STICKERS.length)];

    const updated: LocalProgress = {
      ...current,
      stickerTokens: current.stickerTokens - 1,
      unlockedStickers: current.unlockedStickers.includes(newSticker)
        ? current.unlockedStickers
        : [...current.unlockedStickers, newSticker],
    };

    await safeStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, unlockedSticker: newSticker, progress: updated };
  } catch (error) {
    console.warn('[progress] Failed to unlock sticker:', error);
    const current = await loadProgress();
    return { success: false, progress: current };
  }
}

export async function savePlacedStickers(
  placed: PlacedSticker[]
): Promise<LocalProgress> {
  try {
    const current = await loadProgress();
    const updated: LocalProgress = {
      ...current,
      placedStickers: placed,
    };
    await safeStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('[progress] Failed to save placed stickers:', error);
    return await loadProgress();
  }
}

export async function resetProgress(): Promise<void> {
  try {
    await safeStorage.removeItem(PROGRESS_STORAGE_KEY);
  } catch (error) {
    console.warn('[progress] Failed to reset progress:', error);
  }
}
