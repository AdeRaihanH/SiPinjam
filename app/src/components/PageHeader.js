import { StyleSheet, Text, View } from 'react-native';

import { colors, text, type, weight } from '../theme/tokens';

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
  style,
  tone = 'dark',
  titleStyle,
}) {
  const light = tone === 'light';

  return (
    <View style={[styles.root, style]}>
      <View style={styles.copy}>
        {eyebrow ? (
          <View style={styles.eyebrowRow}>
            <View style={[styles.eyebrowDot, light && styles.eyebrowDotLight]} />
            <Text style={[styles.eyebrow, light && styles.eyebrowLight]}>{eyebrow}</Text>
          </View>
        ) : null}
        <Text style={[styles.title, light && styles.titleLight, titleStyle]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, light && styles.subtitleLight]}>{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  copy: { flex: 1, gap: 3 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  eyebrowDotLight: { backgroundColor: colors.gold },
  eyebrow: {
    fontSize: type.xxs,
    fontWeight: weight.bold,
    color: colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  eyebrowLight: { color: 'rgba(255,255,255,0.72)' },
  title: text.h1,
  titleLight: { color: colors.white },
  subtitle: { fontSize: type.xs, lineHeight: 17, color: colors.muted },
  subtitleLight: { color: 'rgba(255,255,255,0.66)' },
});
