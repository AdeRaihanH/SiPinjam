import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, type, weight } from '../../../theme/tokens';

export default function ToolInfoTile({ icon, label, value, last = false }) {
  return (
    <View style={[styles.tile, !last && styles.divider]}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={15} color={colors.primary} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, alignItems: 'center', gap: 3, paddingHorizontal: 6 },
  divider: { borderRightWidth: 1, borderRightColor: colors.border },
  icon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: weight.bold,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  value: {
    fontSize: type.xs,
    fontWeight: weight.bold,
    color: colors.text,
    textAlign: 'center',
  },
});
