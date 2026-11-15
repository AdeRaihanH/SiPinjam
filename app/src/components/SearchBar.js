import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, radius, type } from '../theme/tokens';

export default function SearchBar({ value, onChangeText, placeholder = 'Cari alat atau kode', style }) {
  return (
    <View style={[styles.root, style]}>
      <Ionicons name="search-outline" size={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        style={styles.input}
        selectionColor={colors.accent}
        returnKeyType="search"
        autoCorrect={false}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Hapus pencarian"
          hitSlop={8}
          onPress={() => onChangeText('')}
        >
          <Ionicons name="close-circle" size={18} color={colors.faint} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: type.sm,
    color: colors.text,
    paddingVertical: 0,
  },
});
