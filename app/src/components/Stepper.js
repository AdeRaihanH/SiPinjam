import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, type, weight } from '../theme/tokens';

export default function Stepper({ value, onChange, min = 1, max = 99, suffix = '', style }) {
  const decDisabled = value <= min;
  const incDisabled = value >= max;

  return (
    <View style={[styles.root, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kurangi jumlah"
        disabled={decDisabled}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={[styles.control, decDisabled && styles.controlDisabled]}
      >
        <Ionicons name="remove" size={18} color={decDisabled ? colors.faint : colors.primary} />
      </Pressable>
      <View style={styles.valueWrap}>
        <Text style={styles.value}>{value}</Text>
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tambah jumlah"
        disabled={incDisabled}
        onPress={() => onChange(Math.min(max, value + 1))}
        style={[styles.control, incDisabled && styles.controlDisabled]}
      >
        <Ionicons name="add" size={18} color={incDisabled ? colors.faint : colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  control: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDisabled: { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
  valueWrap: {
    minWidth: 64,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  value: { fontSize: type.md, fontWeight: weight.bold, color: colors.text },
  suffix: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.muted },
});
