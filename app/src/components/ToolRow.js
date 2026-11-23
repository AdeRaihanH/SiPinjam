import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import StockBadge from './StockBadge';
import ToolPhoto from './ToolPhoto';
import { colors, radius, toneForCategory, type, weight } from '../theme/tokens';

export default function ToolRow({ tool, onPress, last = false }) {
  const tone = toneForCategory(tool.kategori?.slug);

  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      scaleTo={0.985}
      hoverStyle={{ backgroundColor: colors.surfaceMuted }}
      style={[styles.row, !last && styles.divider]}
    >
      <ToolPhoto tool={tool} width={62} height={62} rounded={radius.md} />
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={2}>{tool.nama}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.categoryDot, { backgroundColor: tone.fg }]} />
          <Text style={styles.meta} numberOfLines={1}>
            {tool.kode} • {tool.kategori?.nama || 'Alat laboratorium'}
          </Text>
        </View>
        <StockBadge stok={tool.stok_tersedia} compact style={styles.stock} />
      </View>
      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={15} color={colors.primary} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  copy: { flex: 1, gap: 4 },
  name: {
    fontSize: type.sm,
    lineHeight: 20,
    fontWeight: weight.bold,
    color: colors.text,
    letterSpacing: -0.1,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  categoryDot: { width: 5, height: 5, borderRadius: 3 },
  meta: { flex: 1, fontSize: type.xs, color: colors.muted },
  stock: { marginTop: 1 },
  chevron: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
