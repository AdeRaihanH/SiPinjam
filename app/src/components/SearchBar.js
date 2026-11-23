import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import PressableScale from './PressableScale';
import { colors, radius, shadows, type, webInputReset } from '../theme/tokens';

const webTransition = Platform.OS === 'web'
  ? { transitionProperty: 'border-color, background-color, box-shadow', transitionDuration: '160ms' }
  : null;

export default function SearchBar({ value, onChangeText, placeholder = 'Cari alat atau kode', style }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.root, focused && styles.rootFocused, webTransition, style]}>
      <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
        <Ionicons
          name="search-outline"
          size={17}
          color={focused ? colors.primary : colors.muted}
        />
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        style={[styles.input, webInputReset]}
        selectionColor={colors.primary}
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
          <Ionicons name="close" size={13} color={colors.white} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    ...shadows.lift,
    shadowOpacity: 0.06,
  },
  rootFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.14,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapFocused: { backgroundColor: colors.accentSoft },
  input: {
    flex: 1,
    fontSize: type.sm,
    color: colors.text,
    paddingVertical: 0,
  },
  clear: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
