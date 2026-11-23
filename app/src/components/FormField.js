import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, shadows, type, webInputReset, weight } from '../theme/tokens';

const webTransition = Platform.OS === 'web'
  ? { transitionProperty: 'border-color, background-color, box-shadow', transitionDuration: '160ms' }
  : null;

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  error,
  hint,
  secureTextEntry = false,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete,
  right,
  style,
  maxLength,
}) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.primary : 'transparent';

  return (
    <View style={[styles.root, style]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
      ) : null}
      <View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          { borderColor, backgroundColor: focused ? colors.surface : colors.surfaceMuted },
          focused && styles.fieldFocused,
          error && styles.fieldError,
          webTransition,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? colors.primary : colors.muted}
          />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.faint}
          style={[styles.input, multiline && styles.inputMultiline, webInputReset]}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={false}
          selectionColor={colors.primary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          textAlignVertical={multiline ? 'top' : 'center'}
          maxLength={maxLength}
        />
        {right}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 8 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: type.xxs,
    fontWeight: weight.bold,
    color: colors.muted,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  hint: { fontSize: type.xs, color: colors.faint },
  field: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldFocused: {
    ...shadows.card,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  fieldError: { backgroundColor: '#FFF8F8' },
  fieldMultiline: {
    minHeight: 112,
    alignItems: 'flex-start',
    paddingTop: 14,
  },
  input: {
    flex: 1,
    fontSize: type.sm,
    color: colors.text,
    paddingVertical: 0,
  },
  inputMultiline: { minHeight: 82, paddingTop: 0 },
  error: { fontSize: type.xs, color: colors.danger, lineHeight: 16 },
});
