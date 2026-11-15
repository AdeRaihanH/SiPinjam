import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, type, weight } from '../theme/tokens';

function toneFor(stok) {
  if (stok <= 0) return { bg: colors.dangerSoft, fg: colors.danger, label: 'Stok habis' };
  if (stok <= 2) return { bg: colors.warningSoft, fg: colors.warning, label: `${stok} tersisa` };
  return { bg: colors.successSoft, fg: colors.success, label: `${stok} tersedia` };
}

export default function StockBadge({ stok = 0, total, style, compact = false }) {
  const tone = toneFor(Number(stok));
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
    height: 24,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },
  compact: { height: 22 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  label: { fontSize: type.xs, fontWeight: weight.semibold },
});
