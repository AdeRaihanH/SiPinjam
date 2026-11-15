import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows, type, weight } from '../theme/tokens';

export default function SegmentedControl({ options, value, onChange, style }) {
  return (
    <View style={[styles.root, style]}>
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.key)}
            style={[styles.item, active && styles.itemActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  item: {
    flex: 1,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemActive: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  label: {
    fontSize: type.xs,
    fontWeight: weight.semibold,
    color: colors.muted,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: weight.bold,
  },
});
