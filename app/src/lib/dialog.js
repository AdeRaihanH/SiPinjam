import { Alert, Platform } from 'react-native';

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

let handler = null;

/**
 * Dipasang sekali oleh DialogProvider. Semua pemanggil tetap memakai
 * showMessage/confirmAction supaya layar tidak perlu tahu soal modal.
 */
export function registerDialogHandler(next) {
  handler = next;
  return () => {
    if (handler === next) handler = null;
  };
}

export function showMessage(title, message) {
  if (handler) {
    handler({ mode: 'alert', title, message });
    return;
  }

  // Fallback hanya jika provider belum terpasang.
  if (isWeb) {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message, [{ text: 'Mengerti' }]);
}

export function confirmAction({
  title,
  message,
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  destructive = false,
  onConfirm,
}) {
  if (handler) {
    handler({
      mode: 'confirm',
      title,
      message,
      confirmLabel,
      cancelLabel,
      destructive,
      onConfirm,
    });
    return;
  }

  // Fallback hanya jika provider belum terpasang.
  if (isWeb) {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm?.();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    {
      text: confirmLabel,
      style: destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
}
