import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const [show, setShow] = useState(false);
  const selected = value ? parseISO(value) : (minDate || new Date());

  function handleChange(event, date) {
    if (Platform.OS === 'android') setShow(false);
    if (event.type === 'set' && date) {
      onChange(format(date, 'yyyy-MM-dd'));
    }
  }

  return (
    <View style={[styles.root, style]}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setShow(true)}
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

      {show ? (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={selected}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={minDate}
            maximumDate={maxDate}
            onChange={handleChange}
          />
          {Platform.OS === 'ios' ? (
            <Pressable onPress={() => setShow(false)} style={styles.done}>
              <Text style={styles.doneText}>Selesai</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 6 },
  label: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.text },
  field: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copy: { flex: 1, gap: 1 },
  value: { fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  hint: { fontSize: type.xs, color: colors.muted },
  error: { fontSize: type.xs, color: colors.danger },
  pickerWrap: {
    marginTop: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  done: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  doneText: { fontSize: type.sm, fontWeight: weight.semibold, color: colors.primary },
});
