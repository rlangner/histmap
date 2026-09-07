import { Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { HistoricalEvent } from '../types/historical';
import { showAlert } from './alertUtils';

export interface HistMapExportPackage {
  version: '1.0';
  app: 'HistMap';
  exportedAt: number;
  events: HistoricalEvent[];
}

/**
 * Sanitizes a title string to be safe as a filename across operating systems.
 */
function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40);
}

/**
 * Shares a single event via native iOS Share Sheet (AirDrop, Messages text attachment, Mail, etc.)
 */
export async function shareSingleEvent(event: HistoricalEvent): Promise<void> {
  const exportData: HistMapExportPackage = {
    version: '1.0',
    app: 'HistMap',
    exportedAt: Date.now(),
    events: [event],
  };

  const filename = `${sanitizeFilename(event.title || 'event')}.histmap.json`;
  await shareExportData(exportData, filename, `Share "${event.title}"`);
}

/**
 * Shares all events (entire historical map collection) via native iOS Share Sheet.
 */
export async function shareAllEvents(events: HistoricalEvent[]): Promise<void> {
  const exportData: HistMapExportPackage = {
    version: '1.0',
    app: 'HistMap',
    exportedAt: Date.now(),
    events,
  };

  const filename = `histmap_collection_${new Date().toISOString().slice(0, 10)}.histmap.json`;
  await shareExportData(exportData, filename, 'Share Historical Collection');
}

/**
 * Internal helper to write the JSON file to local cache and trigger the native share dialog.
 */
async function shareExportData(
  data: HistMapExportPackage,
  filename: string,
  dialogTitle: string
): Promise<void> {
  const jsonString = JSON.stringify(data, null, 2);

  if (Platform.OS === 'web') {
    // On web browsers: trigger standard file download
    try {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download on web', err);
      showAlert('Export Error', 'Unable to download file on web.');
    }
    return;
  }

  // On Native iOS & Android:
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      showAlert(
        'Sharing Unavailable',
        'Direct file sharing is not supported on this specific device configuration.'
      );
      return;
    }

    // Write file to device local cache directory using Expo SDK 57 FileSystem API
    const file = new File(Paths.cache, filename);
    if (file.exists) {
      file.delete();
    }
    file.create();
    file.write(jsonString);

    // Trigger native iOS UIActivityViewController (AirDrop, Messages, etc.)
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle,
      UTI: 'public.json', // iOS Uniform Type Identifier
    });
  } catch (error) {
    console.error('Error sharing event:', error);
    showAlert('Sharing Error', 'Failed to prepare the event file for sharing.');
  }
}

/**
 * Prompts the user to pick a .histmap.json or .json file to import events from another device.
 */
export async function importEventsFromFile(): Promise<HistoricalEvent[] | null> {
  try {
    if (Platform.OS === 'web') {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.histmap.json';
        input.onchange = async (e: any) => {
          const file = e.target?.files?.[0];
          if (!file) {
            resolve(null);
            return;
          }
          const text = await file.text();
          const parsed = parseImportedJson(text);
          resolve(parsed);
        };
        input.click();
      });
    }

    // Native iOS & Android document picker
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'public.json', '*/*'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const file = new File(asset.uri);
    const text = await file.text();
    return parseImportedJson(text);
  } catch (error) {
    console.error('Error importing events file:', error);
    showAlert('Import Error', 'Could not open or read the selected file.');
    return null;
  }
}

/**
 * Validates and extracts HistoricalEvent items from parsed JSON text.
 */
function parseImportedJson(text: string): HistoricalEvent[] | null {
  try {
    const data = JSON.parse(text);

    // If it's a HistMapExportPackage
    if (data && data.app === 'HistMap' && Array.isArray(data.events)) {
      return data.events;
    }

    // If it's a raw array of events
    if (Array.isArray(data)) {
      return data;
    }

    // If it's a single event object
    if (data && data.title && data.geometry) {
      return [data];
    }

    showAlert(
      'Invalid Format',
      'The selected file does not contain valid HistMap event data.'
    );
    return null;
  } catch (err) {
    showAlert('Invalid File', 'Could not parse JSON from the selected file.');
    return null;
  }
}
