import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import { HistoricalEvent } from '../types/historical';
import { INITIAL_HISTORICAL_EVENTS } from '../utils/sampleData';

const STORAGE_KEY = '@historical_events_v2';
const LOCAL_BACKUP_FILENAME = 'historical_events.json';

/**
 * Loads events directly from the local iOS device storage.
 * Default is empty (no events) on first launch.
 */
export async function loadEvents(): Promise<HistoricalEvent[]> {
  try {
    // Clean up legacy v1 storage if present
    try {
      await AsyncStorage.removeItem('@historical_events_v1');
    } catch (e) {
      // ignore
    }

    // 1. Try AsyncStorage (on-device local key-value database)
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed: HistoricalEvent[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // 2. First launch: initialize with empty list (app ships with no events by default)
    await saveEvents([]);
    return [];
  } catch (error) {
    console.error('Failed to load events from on-device storage:', error);
    return [];
  }
}

/**
 * Saves events entirely to the local iOS device.
 * Persists to both AsyncStorage and the device's Documents directory.
 */
export async function saveEvents(events: HistoricalEvent[]): Promise<void> {
  const jsonString = JSON.stringify(events, null, 2);

  try {
    // Save to on-device AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEY, jsonString);

    // Also persist directly into the iOS app Documents directory
    if (Platform.OS !== 'web') {
      try {
        const file = new File(Paths.document, LOCAL_BACKUP_FILENAME);
        if (file.exists) {
          file.delete();
        }
        file.create();
        file.write(jsonString);
      } catch (fileErr) {
        console.warn('Could not write to local Documents file:', fileErr);
      }
    }
  } catch (error) {
    console.error('Failed to save events to on-device storage:', error);
  }
}

/**
 * Clears all on-device historical events.
 */
export async function clearAllEvents(): Promise<HistoricalEvent[]> {
  try {
    await saveEvents([]);
    return [];
  } catch (error) {
    console.error('Failed to clear events:', error);
    return [];
  }
}
