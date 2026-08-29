import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@scratch_learn_sound_muted';
let successSound: Audio.Sound | null = null;
let errorSound: Audio.Sound | null = null;
let isMuted = false;
let isInitialized = false;

/**
 * Initializes and plays game sound effects safely with persistent mute preference.
 */
export class SoundManager {
  static async init() {
    if (isInitialized) return;
    try {
      const storedMuted = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedMuted !== null) {
        isMuted = storedMuted === 'true';
      }
      isInitialized = true;
    } catch (e) {
      console.warn('SoundManager init error:', e);
    }
  }

  static getMuted() {
    return isMuted;
  }

  static async setMuted(muted: boolean) {
    isMuted = muted;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, muted ? 'true' : 'false');
      if (muted) {
        await Speech.stop();
      }
    } catch (e) {
      console.warn('SoundManager setMuted error:', e);
    }
  }

  static async playSuccess() {
    await this.init();
    if (isMuted) return;

    try {
      if (successSound) {
        await successSound.replayAsync();
      } else {
        await Speech.speak('Yay! Great job!', {
          language: 'en',
          pitch: 1.25, // High pitch for kid-friendly energy
          rate: 1.0,
        });
      }
    } catch (e) {
      console.warn('Sound playSuccess error:', e);
    }
  }

  static async playWrong() {
    await this.init();
    if (isMuted) return;

    try {
      if (errorSound) {
        await errorSound.replayAsync();
      } else {
        await Speech.speak('Oops! Try again!', {
          language: 'en',
          pitch: 1.1,
          rate: 1.0,
        });
      }
    } catch (e) {
      console.warn('Sound playWrong error:', e);
    }
  }

  static async playWord(word: string) {
    await this.init();
    if (isMuted) return;

    try {
      await Speech.speak(word, {
        language: 'en',
        pitch: 1.15, // Playful tone
        rate: 0.85,  // Slow and extremely clear for young learners
      });
    } catch (e) {
      console.warn('Sound playWord error:', e);
    }
  }

  static async unloadAll() {
    try {
      if (successSound) {
        await successSound.unloadAsync();
        successSound = null;
      }
      if (errorSound) {
        await errorSound.unloadAsync();
        errorSound = null;
      }
      // Stop any running speech synthesis immediately
      await Speech.stop();
    } catch (e) {
      console.warn('Sound unloadAll error:', e);
    }
  }
}
