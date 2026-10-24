import { safeStorage } from './safeStorage';
import { Difficulty } from '../domain/types';

export interface AppPreferences {
  soundEnabled: boolean;
  speechEnabled: boolean;
  selectedDifficulty: Difficulty;
  progressSavingEnabled: boolean;
}

const PREFERENCES_STORAGE_KEY = '@scratch_learn_preferences_v1';

const DEFAULT_PREFERENCES: AppPreferences = {
  soundEnabled: true,
  speechEnabled: true,
  selectedDifficulty: 'easy',
  progressSavingEnabled: true,
};

export async function loadPreferences(): Promise<AppPreferences> {
  try {
    const raw = await safeStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
    };
  } catch (error) {
    console.warn('[preferences] Failed to load preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(
  updates: Partial<AppPreferences>
): Promise<AppPreferences> {
  try {
    const current = await loadPreferences();
    const updated = { ...current, ...updates };
    await safeStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('[preferences] Failed to save preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}
