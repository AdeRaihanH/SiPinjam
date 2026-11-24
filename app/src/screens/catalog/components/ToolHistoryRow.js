import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import StatusPill from '../../../components/StatusPill';
import { formatTanggal } from '../../../lib/format';
import { colors, type, weight } from '../../../theme/tokens';

export default function ToolHistoryRow({ item, last }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.icon}>
        <Ionicons name="swap-horizontal" size={14} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.code}>{item.kode}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.member_nama || 'Praktikan'} · {formatTanggal(item.tanggal_pinjam)}
        </Text>
      </View>
      <View style={styles.right}>
        <StatusPill status={item.status_efektif} />
        <Text style={styles.date}>
          {formatTanggal(item.tanggal_kembali_rencana)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 2 },
  code: { fontSize: type.xxs, fontWeight: weight.bold, color: colors.text, letterSpacing: 0.4 },
  meta: { fontSize: type.xs, color: colors.muted },
  right: { alignItems: 'flex-end', gap: 3 },
  date: { fontSize: type.xxs, color: colors.faint },
});
