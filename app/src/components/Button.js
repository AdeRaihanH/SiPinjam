import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, type, weight } from '../theme/tokens';

const VARIANTS = {
  primary: { bg: colors.primary, border: colors.primary, fg: colors.white },
  secondary: { bg: colors.surface, border: colors.borderStrong, fg: colors.text },
  soft: { bg: colors.primarySoft, border: colors.primarySoft, fg: colors.primary },
  accent: { bg: colors.accent, border: colors.accent, fg: colors.white },
  ghost: { bg: 'transparent', border: 'transparent', fg: colors.primary },
  danger: { bg: colors.danger, border: colors.danger, fg: colors.white },
  dangerSoft: { bg: colors.dangerSoft, border: colors.dangerSoft, fg: colors.danger },
};

export default function Button({
  title,
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  onPress,
  style,
  textStyle,
  fullWidth = true,
}) {
  const tone = VARIANTS[variant] || VARIANTS.primary;
  const blocked = disabled || loading;
  const height = size === 'sm' ? 40 : size === 'lg' ? 52 : 48;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
      onPress={blocked ? undefined : onPress}
      disabled={blocked}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          backgroundColor: tone.bg,
          borderColor: tone.border,
          opacity: blocked ? 0.55 : pressed ? 0.82 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tone.fg} />
      ) : icon ? (
        <Ionicons name={icon} size={size === 'sm' ? 16 : 18} color={tone.fg} />
      ) : null}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          { color: tone.fg, fontSize: size === 'sm' ? type.xs : type.sm },
          textStyle,
        ]}
      >
        {title || children}
      </Text>
      {iconRight && !loading ? (
        <Ionicons name={iconRight} size={size === 'sm' ? 15 : 17} color={tone.fg} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  label: {
    fontWeight: weight.semibold,
  },
});
