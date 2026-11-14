import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { colors, radius } from '../theme';

const VARIANTS = {
  primary: {
    background: colors.primary,
    border: colors.primary,
    foreground: colors.white,
  },
  dark: {
    background: colors.primaryDeep,
    border: colors.primaryDeep,
    foreground: colors.white,
  },
  secondary: {
    background: colors.surface,
    border: colors.borderStrong,
    foreground: colors.ink,
  },
  soft: {
    background: colors.primarySoft,
    border: colors.primarySoft,
    foreground: colors.primaryDark,
  },
  ghost: {
    background: 'transparent',
    border: 'transparent',
    foreground: colors.primary,
  },
  danger: {
    background: colors.danger,
    border: colors.danger,
    foreground: colors.white,
  },
  dangerSoft: {
    background: colors.dangerSoft,
    border: colors.dangerSoft,
    foreground: colors.danger,
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
  const height = size === 'sm' ? 42 : size === 'lg' ? 56 : 52;
  const iconSize = size === 'sm' ? 16 : 19;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
      onPress={blocked ? undefined : onPress}
      android_ripple={blocked ? undefined : { color: 'rgba(255,255,255,0.18)' }}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          backgroundColor: tone.background,
          borderColor: tone.border,
          opacity: blocked ? 0.55 : 1,
          width: fullWidth ? '100%' : undefined,
          transform: [{ scale: pressed && !blocked ? 0.99 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tone.foreground} />
      ) : icon ? (
        <Ionicons name={icon} size={iconSize} color={tone.foreground} />
      ) : null}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          { color: tone.foreground, fontSize: size === 'sm' ? 13.5 : 15 },
          textStyle,
        ]}
      >
        {title || children}
      </Text>
      {iconRight && !loading ? (
        <Ionicons name={iconRight} size={iconSize} color={tone.foreground} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  label: {
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
