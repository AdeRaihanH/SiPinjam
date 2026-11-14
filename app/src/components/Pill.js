import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, statusTone } from '../theme';

const TONES = {
  primary: { bg: colors.primarySoft, fg: colors.primaryDark },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  warn: { bg: colors.warnSoft, fg: colors.warn },
  neutral: { bg: colors.surfaceMuted, fg: colors.body },
  blue: { bg: colors.blueSoft, fg: colors.blue },
  purple: { bg: colors.purpleSoft, fg: colors.purple },
};

export function Pill({ label, tone = 'neutral', icon, dot = false, style, textStyle }) {
  const palette = TONES[tone] || TONES.neutral;
  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }, style]}>
      {dot ? <View style={[styles.dot, { backgroundColor: palette.fg }]} /> : null}
      {icon ? <Ionicons name={icon} size={12} color={palette.fg} /> : null}
      <Text style={[styles.label, { color: palette.fg }, textStyle]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function StatusPill({ status, style }) {
  const tone = statusTone[status] || statusTone.dikembalikan;
  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: tone.dot }]} />
      <Text style={[styles.label, { color: tone.fg }]}>{tone.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 26,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
