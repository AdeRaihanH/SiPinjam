import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows } from '../theme';
import ToolGlyph from './ToolGlyph';
import { StatusPill } from './Pill';
import { dueLabel, formatRupiah } from '../utils/format';

export default function LoanCard({ loan, onPress, style }) {
  const late = loan.status_efektif === 'terlambat';
  const selesai = loan.status === 'dikembalikan';
  const denda = selesai ? Number(loan.denda || 0) : Number(loan.denda_berjalan || 0);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      <View style={styles.top}>
        <ToolGlyph
          tool={{
            kategori_icon: loan.kategori_icon,
            kategori_slug: loan.kategori_slug,
          }}
          size={44}
        />
        <View style={styles.copy}>
          <Text style={styles.code}>{loan.kode}</Text>
          <Text style={styles.title} numberOfLines={2}>{loan.ringkasan_alat}</Text>
        </View>
        <StatusPill status={loan.status_efektif} />
      </View>

      <View style={styles.divider} />

      <View style={styles.bottom}>
        <View style={styles.meta}>
          <Ionicons
            name={late ? 'alert-circle-outline' : 'calendar-outline'}
            size={15}
            color={late ? colors.danger : colors.muted}
          />
          <Text style={[styles.metaText, late && styles.lateText]} numberOfLines={1}>
            {dueLabel(loan)}
          </Text>
          <View style={styles.dot} />
          <Text style={styles.metaText}>{loan.total_unit} unit</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.faint} />
      </View>

      {denda > 0 ? (
        <View style={[styles.fine, selesai && styles.fineMuted]}>
          <Ionicons
            name="wallet-outline"
            size={14}
            color={selesai ? colors.body : colors.danger}
          />
          <Text style={[styles.fineText, selesai && styles.fineTextMuted]}>
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
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 11,
    ...shadows.soft,
  },
  pressed: { opacity: 0.9 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  copy: { flex: 1, gap: 3 },
  code: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.8,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  metaText: {
    fontSize: 11.5,
    color: colors.muted,
    fontWeight: '600',
  },
  lateText: { color: colors.danger },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.faint,
  },
  fine: {
    marginTop: -2,
    marginHorizontal: -4,
    backgroundColor: colors.dangerSoft,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fineMuted: { backgroundColor: colors.surfaceMuted },
  fineText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.danger,
  },
  fineTextMuted: { color: colors.body },
});
