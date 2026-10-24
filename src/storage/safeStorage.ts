// In-memory fallback if native storage is unavailable, null, or throws
const memoryFallback: Record<string, string> = {};

function getAsyncStorage() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-async-storage/async-storage');
    return mod?.default || mod;
  } catch (error) {
    console.warn('[safeStorage] Native AsyncStorage unavailable, running purely in-memory:', error);
    return null;
  }
}

export const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const storage = getAsyncStorage();
      if (storage && typeof storage.getItem === 'function') {
        const value = await storage.getItem(key);
        if (value !== null && value !== undefined) {
          memoryFallback[key] = value;
          return value;
        }
      }
    } catch (error) {
      console.warn(`[safeStorage] getItem failed for key "${key}", using memory fallback:`, error);
    }
    return memoryFallback[key] ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    memoryFallback[key] = value;
    try {
      const storage = getAsyncStorage();
      if (storage && typeof storage.setItem === 'function') {
        await storage.setItem(key, value);
      }
    } catch (error) {
      console.warn(`[safeStorage] setItem failed for key "${key}", saved in memory fallback:`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    delete memoryFallback[key];
    try {
      const storage = getAsyncStorage();
      if (storage && typeof storage.removeItem === 'function') {
        await storage.removeItem(key);
      }
    } catch (error) {
      console.warn(`[safeStorage] removeItem failed for key "${key}":`, error);
    }
  },

  async clear(): Promise<void> {
    Object.keys(memoryFallback).forEach((k) => delete memoryFallback[k]);
    try {
      const storage = getAsyncStorage();
      if (storage && typeof storage.clear === 'function') {
        await storage.clear();
      }
    } catch (error) {
      console.warn('[safeStorage] clear failed:', error);
    }
  },
};
