import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, type, weight } from '../theme/tokens';
import StockBadge from './StockBadge';
import ToolPhoto from './ToolPhoto';

export default function ToolRow({ tool, onPress, last = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && styles.divider,
        pressed && { backgroundColor: colors.surfaceMuted },
      ]}
    >
      <ToolPhoto tool={tool} width={56} height={56} />
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={2}>{tool.nama}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {tool.kode} · {tool.kategori?.nama || 'Alat laboratorium'}
        </Text>
        <StockBadge stok={tool.stok_tersedia} compact style={styles.stock} />
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.faint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  copy: { flex: 1, gap: 3 },
  name: {
    fontSize: type.sm,
    lineHeight: 20,
    fontWeight: weight.semibold,
    color: colors.text,
  },
  meta: { fontSize: type.xs, color: colors.muted },
  stock: { marginTop: 1 },
});
