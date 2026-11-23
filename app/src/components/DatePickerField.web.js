import { Ionicons } from '@expo/vector-icons';
import { addDays, format } from 'date-fns';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import SheetModal from './SheetModal';
import { colors, radius, type, weight } from '../theme/tokens';
import { formatTanggal } from '../lib/format';

export default function DatePickerField({
  label = 'Tanggal kembali',
  value,
  onChange,
  minDate,
  maxDate,
  error,
  style,
}) {
  const [open, setOpen] = useState(false);
  const options = useMemo(() => {
    if (!minDate || !maxDate) return [];
    const list = [];
    let date = minDate;
    while (date <= maxDate) {
      list.push(date);
      date = addDays(date, 1);
    }
    return list;
  }, [minDate, maxDate]);

  return (
    <View style={[styles.root, style]}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          error && { borderColor: colors.danger },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Ionicons name="calendar-outline" size={18} color={colors.muted} />
        <View style={styles.copy}>
          <Text style={styles.value}>{formatTanggal(value, 'EEEE, d MMMM yyyy')}</Text>
          <Text style={styles.hint}>Pilih 1–3 hari dari hari ini</Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={colors.faint} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <SheetModal
        visible={open}
        onClose={() => setOpen(false)}
        title="Pilih tanggal kembali"
        subtitle="Durasi peminjaman maksimal 3 hari."
      >
        <View style={styles.options}>
          {options.map((date) => {
            const iso = format(date, 'yyyy-MM-dd');
            const active = iso === value;
            return (
              <Pressable
                key={iso}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  onChange(iso);
                  setOpen(false);
                }}
                style={[styles.option, active && styles.optionActive]}
              >
                <View style={styles.optionCopy}>
                  <Text style={[styles.optionDay, active && styles.optionDayActive]}>
                    {formatTanggal(iso, 'EEEE')}
                  </Text>
                  <Text style={[styles.optionDate, active && styles.optionDateActive]}>
                    {formatTanggal(iso, 'd MMMM yyyy')}
                  </Text>
                </View>
                {active ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
      </SheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 7 },
  label: {
    fontSize: type.xxs,
    fontWeight: weight.bold,
    color: colors.muted,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  field: {
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copy: { flex: 1, gap: 1 },
  value: { fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  hint: { fontSize: type.xs, color: colors.muted },
  error: { fontSize: type.xs, color: colors.danger },
  options: { gap: 8 },
  option: {
    minHeight: 58,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accentSoft,
  },
  optionCopy: { flex: 1, gap: 1 },
  optionDay: { fontSize: type.xs, color: colors.muted },
  optionDayActive: { color: colors.primary },
  optionDate: { fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  optionDateActive: { color: colors.primary },
});
