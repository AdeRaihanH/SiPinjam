import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

function run(action) {
  if (!supported) return;
  action().catch(() => {});
}

export function tap() {
  run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function select() {
  run(() => Haptics.selectionAsync());
}

export function success() {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function warning() {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}
