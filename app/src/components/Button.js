import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import { colors, gradients, radius, shadows, type, weight } from '../theme/tokens';

const VARIANTS = {
  primary: {
    gradient: gradients.primary,
    fg: colors.white,
    border: 'transparent',
    shadow: shadows.floating,
  },
  secondary: {
    bg: colors.surface,
    border: colors.borderStrong,
    fg: colors.text,
  },
  soft: {
    bg: colors.primarySoft,
    border: 'transparent',
    fg: colors.primary,
  },
  accent: {
    gradient: gradients.accent,
    fg: colors.white,
    border: 'transparent',
    shadow: shadows.glowAccent,
  },
  ghost: {
    bg: 'transparent',
    border: 'transparent',
    fg: colors.primary,
  },
  danger: {
    gradient: gradients.danger,
    fg: colors.white,
    border: 'transparent',
    shadow: shadows.floating,
  },
  dangerSoft: {
    bg: colors.dangerSoft,
    border: 'transparent',
    fg: colors.danger,
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
  const height = size === 'sm' ? 42 : size === 'lg' ? 56 : 50;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
      onPress={blocked ? undefined : onPress}
      disabled={blocked}
      scaleTo={0.975}
      hoverStyle={{ opacity: 0.9 }}
      style={[
        styles.base,
        {
          height,
          backgroundColor: tone.gradient ? 'transparent' : tone.bg,
          borderColor: tone.border,
          width: fullWidth ? '100%' : undefined,
        },
        tone.shadow,
        blocked && styles.blocked,
        style,
      ]}
    >
      {tone.gradient ? (
        <LinearGradient
          colors={tone.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.fill]}
        />
      ) : null}
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
        <View style={styles.iconRight}>
          <Ionicons name={iconRight} size={size === 'sm' ? 15 : 17} color={tone.fg} />
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
    gap: 8,
    paddingHorizontal: 18,
  },
  fill: { borderRadius: radius.md },
  blocked: { opacity: 0.55 },
  label: {
    fontWeight: weight.bold,
    letterSpacing: 0.1,
  },
  iconRight: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
