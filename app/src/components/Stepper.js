import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

export default function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  suffix = '',
  style,
}) {
  const decDisabled = value <= min;
  const incDisabled = value >= max;

  return (
    <View style={[styles.wrap, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kurangi jumlah"
        disabled={decDisabled}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={[styles.control, decDisabled && styles.disabled]}
      >
        <Ionicons name="remove" size={20} color={decDisabled ? colors.faint : colors.primaryDark} />
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
        style={[styles.control, incDisabled && styles.disabled]}
      >
        <Ionicons name="add" size={20} color={incDisabled ? colors.faint : colors.primaryDark} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  control: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: colors.surfaceMuted,
  },
  valueWrap: {
    minWidth: 64,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
  },
  suffix: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
});
