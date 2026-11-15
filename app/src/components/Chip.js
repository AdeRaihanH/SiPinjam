import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, type, weight } from '../theme/tokens';

export default function Chip({ label, icon, selected = false, onPress, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.idle,
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={14} color={selected ? colors.white : colors.muted} />
      ) : null}
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  },
  label: {
    fontSize: type.xs,
    fontWeight: weight.semibold,
    color: colors.muted,
  },
  labelSelected: { color: colors.white },
});
