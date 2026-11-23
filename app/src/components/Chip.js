import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text } from 'react-native';

import PressableScale from './PressableScale';
import { colors, radius, shadows, type, weight } from '../theme/tokens';

export default function Chip({ label, icon, selected = false, onPress, style }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      scaleTo={0.95}
      hoverStyle={selected ? { opacity: 0.92 } : { borderColor: colors.primary, backgroundColor: colors.surfaceMuted }}
      style={[styles.chip, selected ? styles.selected : styles.idle, style]}
    >
      {icon ? (
        <Ionicons name={icon} size={14} color={selected ? colors.accent : colors.muted} />
      ) : null}
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 40,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    overflow: 'hidden',
  },
  idle: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.card,
    shadowOpacity: 0.12,
  },
  label: {
    fontSize: type.xs,
    fontWeight: weight.semibold,
    color: colors.muted,
  },
  labelSelected: { color: colors.white, fontWeight: weight.bold },
});
