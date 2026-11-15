import { Pressable, StyleSheet, View } from 'react-native';
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
    <Pressable
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        ...base,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {children}
    </Pressable>
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
  padded: { padding: 16 },
  pressed: { opacity: 0.92 },
  disabled: { opacity: 0.65 },
});
