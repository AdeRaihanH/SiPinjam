import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import PressableScale from './PressableScale';
import { colors, radius, shadows, type } from '../theme/tokens';

const webTransition = Platform.OS === 'web'
  ? { transitionProperty: 'border-color, background-color', transitionDuration: '150ms' }
  : null;

export default function SearchBar({ value, onChangeText, placeholder = 'Cari alat atau kode', style }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.root, focused && styles.rootFocused, webTransition, style]}>
      <Ionicons
        name="search-outline"
        size={19}
        color={focused ? colors.accent : colors.muted}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        style={styles.input}
        selectionColor={colors.accent}
        returnKeyType="search"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {value ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Hapus pencarian"
          hitSlop={8}
          scaleTo={0.85}
          onPress={() => onChangeText('')}
          style={styles.clear}
        >
          <Ionicons name="close" size={13} color={colors.muted} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...shadows.card,
  },
  rootFocused: {
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: type.sm,
    color: colors.text,
    paddingVertical: 0,
  },
  clear: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
