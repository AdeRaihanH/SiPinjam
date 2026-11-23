import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text } from 'react-native';

import PressableScale from './PressableScale';
import { colors, gradients, radius, shadows, type, weight } from '../theme/tokens';

export default function Chip({ label, icon, selected = false, onPress, style }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      scaleTo={0.95}
      hoverStyle={selected ? { opacity: 0.9 } : { borderColor: colors.primary }}
      style={[styles.chip, selected ? styles.selected : styles.idle, style]}
    >
      {selected ? (
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.fill]}
        />
      ) : null}
      {icon ? (
        <Ionicons name={icon} size={14} color={selected ? colors.white : colors.muted} />
      ) : null}
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 38,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  fill: { borderRadius: radius.pill },
  idle: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: {
    borderWidth: 1,
    borderColor: 'transparent',
    ...shadows.floating,
    shadowOpacity: 0.16,
  },
  label: {
    fontSize: type.xs,
    fontWeight: weight.semibold,
    color: colors.muted,
  },
  labelSelected: { color: colors.white, fontWeight: weight.bold },
});
