import { Ionicons } from '@expo/vector-icons';
import { differenceInCalendarDays } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import StatusPill from './StatusPill';
import { colors, radius, shadows, type, weight } from '../theme/tokens';
import { formatRupiah, formatTanggal, safeParse } from '../lib/format';

function dueMeta(loan) {
  if (loan.status === 'dikembalikan') {
    return {
      icon: 'checkmark-circle-outline',
      label: `Dikembalikan ${formatTanggal(loan.tanggal_kembali_aktual)}`,
      hint: 'Selesai',
      danger: false,
    };
  }

  const due = safeParse(loan.tanggal_kembali_rencana);
  const days = due ? differenceInCalendarDays(due, new Date()) : null;

  if (loan.status_efektif === 'terlambat') {
    return {
      icon: 'alert-circle-outline',
      label: `Jatuh tempo ${formatTanggal(loan.tanggal_kembali_rencana)}`,
      hint: `Terlambat ${loan.hari_terlambat || Math.abs(days || 0)} hari`,
      danger: true,
    };
  }

  return {
    icon: 'calendar-outline',
    label: `Jatuh tempo ${formatTanggal(loan.tanggal_kembali_rencana)}`,
    hint: days === 0 ? 'Hari ini' : days === 1 ? 'Besok' : `${days} hari lagi`,
    danger: false,
  };
}

export default function LoanRow({ loan, onPress, style }) {
  const late = loan.status_efektif === 'terlambat';
  const returned = loan.status === 'dikembalikan';
  const meta = dueMeta(loan);
  const denda = returned ? loan.denda : loan.denda_berjalan;

  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      scaleTo={0.985}
      hoverStyle={{ borderColor: colors.primarySoft }}
      style={[styles.card, late && styles.cardLate, style]}
    >
      <View style={styles.top}>
        <View style={styles.codeRow}>
          <View style={[styles.codeDot, late && styles.codeDotLate, returned && styles.codeDotDone]} />
          <Text style={styles.code}>{loan.kode}</Text>
        </View>
        <StatusPill status={loan.status_efektif} />
      </View>

      <Text style={styles.title} numberOfLines={2}>{loan.ringkasan_alat}</Text>

      <View style={styles.bottom}>
        <View style={styles.due}>
          <Ionicons
            name={meta.icon}
            size={15}
            color={meta.danger ? colors.danger : colors.muted}
          />
          <View style={styles.dueCopy}>
            <Text style={[styles.dueLabel, meta.danger && styles.dueDanger]} numberOfLines={1}>
              {meta.label}
            </Text>
            <Text style={[styles.dueHint, meta.danger && styles.dueDanger]}>
              {meta.hint} · {loan.total_unit} unit
            </Text>
          </View>
        </View>
        <View style={[styles.chevron, late && styles.chevronLate]}>
          <Ionicons name="arrow-forward" size={15} color={late ? colors.danger : colors.primary} />
        </View>
      </View>

      {denda > 0 ? (
        <View style={styles.fine}>
          <Ionicons name="wallet-outline" size={13} color={colors.danger} />
          <Text style={styles.fineText}>
            {returned ? `Denda tercatat ${formatRupiah(denda)}` : `Denda berjalan ${formatRupiah(denda)}`}
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
    padding: 18,
    gap: 10,
    ...shadows.card,
  },
  cardLate: { borderColor: '#F1C9C7', backgroundColor: '#FFF9F8' },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  codeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accentInk },
  codeDotLate: { backgroundColor: colors.danger },
  codeDotDone: { backgroundColor: colors.faint },
  code: {
    fontSize: type.xxs,
    fontWeight: weight.bold,
    color: colors.muted,
    letterSpacing: 0.9,
  },
  title: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: weight.bold,
    color: colors.text,
    letterSpacing: -0.2,
  },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  due: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dueCopy: { flex: 1, gap: 1 },
  dueLabel: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.text },
  dueHint: { fontSize: type.xxs, color: colors.muted },
  dueDanger: { color: colors.danger },
  chevron: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronLate: { backgroundColor: colors.dangerSoft },
  fine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  fineText: { fontSize: type.xxs, fontWeight: weight.semibold, color: colors.danger },
});
