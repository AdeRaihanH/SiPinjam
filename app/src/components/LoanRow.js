import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows, type, weight } from '../theme/tokens';
import { formatRupiah, formatTanggal } from '../lib/format';
import StatusPill from './StatusPill';

export default function LoanRow({ loan, onPress, style }) {
  const late = loan.status_efektif === 'terlambat';
  const denda = loan.status === 'dikembalikan' ? loan.denda : loan.denda_berjalan;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }, style]}
    >
      <View style={styles.top}>
        <Text style={styles.code}>{loan.kode}</Text>
        <StatusPill status={loan.status_efektif} />
      </View>
      <Text style={styles.title} numberOfLines={2}>{loan.ringkasan_alat}</Text>
      <View style={styles.metaRow}>
        <Ionicons
          name={late ? 'alert-circle-outline' : 'calendar-outline'}
          size={15}
          color={late ? colors.danger : colors.muted}
        />
        <Text style={[styles.meta, late && styles.metaLate]}>
          {loan.status === 'dikembalikan'
            ? `Dikembalikan ${formatTanggal(loan.tanggal_kembali_aktual)}`
            : `Jatuh tempo ${formatTanggal(loan.tanggal_kembali_rencana)}`}
        </Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.meta}>{loan.total_unit} unit</Text>
        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={15} color={colors.faint} />
        </View>
      </View>
      {denda > 0 ? (
        <View style={[styles.fine, late && styles.fineLate]}>
          <Text style={[styles.fineText, late && styles.fineTextLate]}>
            {late ? `Denda berjalan ${formatRupiah(denda)}` : `Denda ${formatRupiah(denda)}`}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
    gap: 8,
    ...shadows.card,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  code: {
    fontSize: type.xs,
    fontWeight: weight.semibold,
    color: colors.muted,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: type.sm,
    lineHeight: 20,
    fontWeight: weight.semibold,
    color: colors.text,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta: { fontSize: type.xs, color: colors.muted },
  metaLate: { color: colors.danger, fontWeight: weight.semibold },
  dot: { color: colors.faint, fontSize: type.xs },
  chevron: { flex: 1, alignItems: 'flex-end' },
  fine: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  fineLate: { backgroundColor: colors.dangerSoft },
  fineText: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.muted },
  fineTextLate: { color: colors.danger },
});
