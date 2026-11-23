import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import StatusPill from './StatusPill';
import { colors, radius, shadows, type, weight } from '../theme/tokens';
import { formatRupiah, formatTanggal } from '../lib/format';

export default function LoanRow({ loan, onPress, style }) {
  const late = loan.status_efektif === 'terlambat';
  const denda = loan.status === 'dikembalikan' ? loan.denda : loan.denda_berjalan;

  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      scaleTo={0.985}
      hoverStyle={{ borderColor: colors.primarySoft }}
      style={[styles.card, late && styles.cardLate, style]}
    >
      <View style={[styles.stripe, late && styles.stripeLate]} />
      <View style={styles.top}>
        <Text style={styles.code}>{loan.kode}</Text>
        <StatusPill status={loan.status_efektif} />
      </View>
      <Text style={styles.title} numberOfLines={2}>{loan.ringkasan_alat}</Text>
      <View style={styles.metaRow}>
        <Ionicons
          name={late ? 'alert-circle-outline' : 'calendar-outline'}
          size={14}
          color={late ? colors.danger : colors.muted}
        />
        <Text style={[styles.meta, late && styles.metaLate]} numberOfLines={1}>
          {loan.status === 'dikembalikan'
            ? `Dikembalikan ${formatTanggal(loan.tanggal_kembali_aktual)}`
            : `Jatuh tempo ${formatTanggal(loan.tanggal_kembali_rencana)}`}
        </Text>
        <View style={styles.metaDot} />
        <Text style={styles.meta}>{loan.total_unit} unit</Text>
        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </View>
      </View>
      {denda > 0 ? (
        <View style={[styles.fine, late && styles.fineLate]}>
          <Ionicons
            name="wallet-outline"
            size={13}
            color={late ? colors.danger : colors.muted}
          />
          <Text style={[styles.fineText, late && styles.fineTextLate]}>
            {late ? `Denda berjalan ${formatRupiah(denda)}` : `Denda ${formatRupiah(denda)}`}
          </Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    paddingLeft: 18,
    gap: 9,
    ...shadows.card,
  },
  cardLate: { borderColor: '#F5D2D2', backgroundColor: '#FFF9F9' },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 3,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: colors.accent,
  },
  stripeLate: { backgroundColor: colors.danger },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  code: {
    fontSize: type.xxs,
    fontWeight: weight.bold,
    color: colors.muted,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: type.sm + 1,
    lineHeight: 21,
    fontWeight: weight.bold,
    color: colors.text,
    letterSpacing: -0.2,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta: { fontSize: type.xs, color: colors.muted },
  metaLate: { color: colors.danger, fontWeight: weight.semibold },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.faint },
  chevron: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  fine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 9,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  fineLate: { backgroundColor: colors.dangerSoft },
  fineText: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.muted },
  fineTextLate: { color: colors.danger },
});
