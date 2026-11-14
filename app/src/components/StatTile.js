import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

const TONES = {
  primary: { bg: colors.primarySoft, fg: colors.primaryDark },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  warn: { bg: colors.warnSoft, fg: colors.warn },
  neutral: { bg: colors.surfaceMuted, fg: colors.body },
};

export default function StatTile({
  label,
  value,
  icon,
  tone = 'primary',
  style,
  compact = false,
}) {
  const palette = TONES[tone] || TONES.primary;

  return (
    <View style={[styles.root, style]}>
      {icon ? (
        <View style={[styles.icon, { backgroundColor: palette.bg }]}>
          <Ionicons name={icon} size={15} color={palette.fg} />
        </View>
      ) : null}
      <Text style={[styles.value, compact && styles.valueCompact]}>{value}</Text>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 3,
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  value: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.4,
  },
  valueCompact: {
    fontSize: 18,
    lineHeight: 23,
  },
  label: {
    fontSize: 10.5,
    lineHeight: 14,
    color: colors.muted,
    fontWeight: '600',
  },
});
