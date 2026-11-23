import { StyleSheet, View } from 'react-native';

import PressableScale from './PressableScale';
import { colors, radius, shadows } from '../theme/tokens';

export default function Card({
  children,
  style,
  padded = true,
  onPress,
  disabled = false,
}) {
  const base = [
    styles.card,
    padded && styles.padded,
    style,
  ];

  if (!onPress) return <View style={base}>{children}</View>;

  return (
    <PressableScale
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      scaleTo={0.985}
      style={base}
    >
      {children}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  padded: { padding: 18 },
});
