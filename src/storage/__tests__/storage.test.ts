import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadPreferences, savePreferences } from '../preferences';
import {
  loadProgress,
  recordGameSession,
  resetProgress,
  unlockNewSticker,
} from '../progress';

const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] ?? null)),
    setItem: jest.fn((key: string, val: string) => {
      mockStorage[key] = val;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete mockStorage[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
      return Promise.resolve();
    }),
  },
}));

describe('Storage Services', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('loadPreferences returns defaults and saves updates', async () => {
    const prefs = await loadPreferences();
    expect(prefs.selectedDifficulty).toBe('easy');
    expect(prefs.soundEnabled).toBe(true);

    const updated = await savePreferences({ selectedDifficulty: 'hard' });
    expect(updated.selectedDifficulty).toBe('hard');

    const reloaded = await loadPreferences();
    expect(reloaded.selectedDifficulty).toBe('hard');
  });

  test('recordGameSession updates progress and star stats', async () => {
    const initial = await loadProgress();
    expect(initial.gamesCompleted).toBe(0);
    expect(initial.totalStarsEarned).toBe(0);

    const progress = await recordGameSession({
      gameId: 'math-counting',
      totalQuestions: 5,
      correctAnswers: 5,
      starsEarned: 3,
      durationMs: 12000,
    });

    expect(progress.gamesCompleted).toBe(1);
    expect(progress.totalStarsEarned).toBe(3);
    expect(progress.stickerTokens).toBe(1);
    expect(progress.gameStats['math-counting'].bestStars).toBe(3);
    expect(progress.gameStats['math-counting'].sessionsCompleted).toBe(1);

    await resetProgress();
    const afterReset = await loadProgress();
    expect(afterReset.gamesCompleted).toBe(0);
  });

  test('unlockNewSticker spends token and adds sticker to unlockedStickers', async () => {
    // 1. Award session to get token
    await recordGameSession({
      gameId: 'test-game',
      totalQuestions: 3,
      correctAnswers: 3,
      starsEarned: 3,
      durationMs: 5000,
    });

    const result = await unlockNewSticker();
    expect(result.success).toBe(true);
    expect(result.unlockedSticker).toBeDefined();
    expect(result.progress.stickerTokens).toBe(0);
  });
});
