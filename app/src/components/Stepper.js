import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import { colors, radius, type, weight } from '../theme/tokens';

export default function Stepper({ value, onChange, min = 1, max = 99, suffix = '', style }) {
  const decDisabled = value <= min;
  const incDisabled = value >= max;

  return (
    <View style={[styles.root, style]}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Kurangi jumlah"
        disabled={decDisabled}
        onPress={() => onChange(Math.max(min, value - 1))}
        scaleTo={0.9}
        style={[styles.control, decDisabled && styles.controlDisabled]}
      >
        <Ionicons name="remove" size={20} color={decDisabled ? colors.faint : colors.text} />
      </PressableScale>
      <View style={styles.valueWrap}>
        <Text style={styles.value}>{value}</Text>
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Tambah jumlah"
        disabled={incDisabled}
        onPress={() => onChange(Math.min(max, value + 1))}
        scaleTo={0.9}
        style={[styles.control, styles.controlPlus, incDisabled && styles.controlDisabled]}
      >
        <Ionicons name="add" size={20} color={incDisabled ? colors.faint : colors.white} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  control: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlPlus: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  controlDisabled: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    opacity: 0.6,
  },
  valueWrap: {
    minWidth: 78,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  value: { fontSize: 26, fontWeight: weight.heavy, color: colors.text, letterSpacing: -0.8 },
  suffix: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.muted },
});
