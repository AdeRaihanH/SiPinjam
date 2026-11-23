import { Alert, Platform } from 'react-native';

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

export function showMessage(title, message) {
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
