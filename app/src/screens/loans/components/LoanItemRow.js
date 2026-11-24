import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ToolPhoto from '../../../components/ToolPhoto';
import { colors, type, weight } from '../../../theme/tokens';

export default function LoanItemRow({ item, onPress, last }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && styles.rowBorder,
        pressed && { backgroundColor: colors.surfaceMuted },
      ]}
    >
      <ToolPhoto tool={item.tool} width={44} height={44} />
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={2}>{item.tool?.nama || 'Alat'}</Text>
        <Text style={styles.meta}>
          {item.tool?.kode} · {item.tool?.kategori?.nama}
        </Text>
      </View>
      <Text style={styles.qty}>{item.jumlah}×</Text>
      <Ionicons name="chevron-forward" size={15} color={colors.faint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  copy: { flex: 1, gap: 2 },
  name: { fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  meta: { fontSize: type.xs, color: colors.muted },
  qty: { fontSize: type.xs, fontWeight: weight.bold, color: colors.primary },
});
