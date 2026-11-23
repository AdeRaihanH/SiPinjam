import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, weight } from '../theme/tokens';

function toneFor(stok, total) {
  if (stok <= 0) return { bg: colors.dangerSoft, fg: colors.danger, label: 'Stok habis' };
  const low = stok <= 2 && (total == null || stok < total);
  if (low) return { bg: colors.warningSoft, fg: colors.warning, label: `${stok} tersisa` };
  return { bg: colors.successSoft, fg: colors.success, label: `${stok} tersedia` };
}

export default function StockBadge({ stok = 0, total, style, compact = false }) {
  const tone = toneFor(Number(stok), total);
  return (
    <View style={[styles.badge, compact && styles.compact, { backgroundColor: tone.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: tone.fg }]} />
      <Text style={[styles.label, { color: tone.fg }]}>
        {total != null ? `${stok}/${total} tersedia` : tone.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 25,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },
  compact: { height: 23 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  label: { fontSize: 11, fontWeight: weight.semibold },
});
