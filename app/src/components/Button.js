import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import { colors, radius, shadows, type, weight } from '../theme/tokens';

const VARIANTS = {
  primary: {
    bg: colors.primary,
    fg: colors.white,
    border: 'transparent',
    shadow: shadows.card,
    iconBg: 'rgba(255,255,255,0.14)',
    iconFg: colors.white,
  },
  secondary: {
    bg: colors.surface,
    border: colors.borderStrong,
    fg: colors.text,
    iconBg: colors.surfaceMuted,
    iconFg: colors.primary,
  },
  soft: {
    bg: colors.accentSoft,
    border: 'transparent',
    fg: colors.accentInk,
    iconBg: 'rgba(76,107,50,0.09)',
    iconFg: colors.accentInk,
  },
  accent: {
    bg: colors.accentSoft,
    fg: colors.primary,
    border: 'transparent',
    iconBg: 'rgba(14,42,32,0.08)',
    iconFg: colors.primary,
  },
  ghost: {
    bg: 'transparent',
    border: 'transparent',
    fg: colors.primary,
    iconBg: colors.primarySoft,
    iconFg: colors.primary,
  },
  danger: {
    bg: colors.danger,
    fg: colors.white,
    border: 'transparent',
    shadow: shadows.card,
    iconBg: 'rgba(255,255,255,0.14)',
    iconFg: colors.white,
  },
  dangerSoft: {
    bg: colors.dangerSoft,
    border: 'transparent',
    fg: colors.danger,
    iconBg: 'rgba(181,74,67,0.09)',
    iconFg: colors.danger,
  },
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
  const height = size === 'sm' ? 44 : size === 'lg' ? 58 : 52;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
      onPress={blocked ? undefined : onPress}
      disabled={blocked}
      scaleTo={0.975}
      hoverStyle={{ opacity: 0.92 }}
      style={[
        styles.base,
        {
          height,
          backgroundColor: tone.bg,
          borderColor: tone.border,
          width: fullWidth ? '100%' : undefined,
        },
        tone.shadow,
        blocked && styles.blocked,
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
        <View style={[styles.iconRight, { backgroundColor: tone.iconBg }]}>
          <Ionicons name={iconRight} size={size === 'sm' ? 13 : 15} color={tone.iconFg} />
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 20,
  },
  blocked: { opacity: 0.5 },
  label: {
    fontWeight: weight.bold,
    letterSpacing: 0.1,
  },
  iconRight: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
