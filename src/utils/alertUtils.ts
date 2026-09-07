import { Alert, Platform, AlertButton, AlertOptions } from 'react-native';

/**
 * Universal alert dialog that works across native iOS/Android and Web.
 * On Web, React Native Web's Alert.alert is an empty no-op; this helper
 * bridges to window.confirm / window.alert so buttons and callbacks work reliably.
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions
): void {
  if (Platform.OS === 'web') {
    const fullMessage = message ? `${title}\n\n${message}` : title;

    if (!buttons || buttons.length === 0) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(fullMessage);
      }
      return;
    }

    if (buttons.length === 1) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(fullMessage);
      }
      buttons[0]?.onPress?.();
      return;
    }

    // Two or more buttons (e.g., Cancel & Delete/OK)
    const cancelBtn = buttons.find((b) => b.style === 'cancel');
    const actionBtn = buttons.find((b) => b !== cancelBtn) || buttons[0];

    const confirmed =
      typeof window !== 'undefined' && window.confirm
        ? window.confirm(fullMessage)
        : true;

    if (confirmed) {
      actionBtn?.onPress?.();
    } else {
      cancelBtn?.onPress?.();
    }
    return;
  }

  Alert.alert(title, message, buttons, options);
}
