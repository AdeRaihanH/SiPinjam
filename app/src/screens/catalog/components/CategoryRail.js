import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import PressableScale from '../../../components/PressableScale';
import { colors, layout, radius, weight } from '../../../theme/tokens';

function CategoryTile({ label, icon, selected, onPress }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      scaleTo={0.94}
      haptic={false}
      style={[styles.tile, selected && styles.tileActive]}
    >
      <View style={[styles.icon, selected && styles.iconActive]}>
        <Ionicons
          name={icon || 'cube-outline'}
          size={19}
          color={selected ? colors.accent : colors.primary}
        />
      </View>
      <Text
        style={[styles.label, selected && styles.labelActive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

export default function CategoryRail({ categories, selectedId, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.rail}
    >
      <CategoryTile
        label="Semua"
        icon="apps-outline"
        selected={!selectedId}
        onPress={() => onSelect(null)}
      />
      {categories.map((category) => (
        <CategoryTile
          key={category.id}
          label={category.nama}
          icon={category.icon}
          selected={selectedId === category.id}
          onPress={() => onSelect(category.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: { marginHorizontal: -layout.screenPadding },
  content: { paddingHorizontal: layout.screenPadding, gap: 8, paddingRight: 24 },
  tile: {
    width: 78,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 7,
  },
  tileActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: { backgroundColor: 'rgba(200,241,105,0.16)' },
  label: {
    fontSize: 9.5,
    fontWeight: weight.semibold,
    color: colors.muted,
    textAlign: 'center',
  },
  labelActive: { color: colors.white, fontWeight: weight.bold },
});
