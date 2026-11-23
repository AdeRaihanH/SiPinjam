import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, shadows, type, weight } from '../theme/tokens';

const webTransition = Platform.OS === 'web'
  ? { transitionProperty: 'border-color, background-color', transitionDuration: '150ms' }
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
  const borderColor = error ? colors.danger : focused ? colors.accent : colors.border;

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
          { borderColor },
          focused && styles.fieldFocused,
          error && styles.fieldError,
          webTransition,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? colors.accent : colors.muted}
          />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.faint}
          style={[styles.input, multiline && styles.inputMultiline]}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={false}
          selectionColor={colors.accent}
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
  root: { gap: 7 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: type.xxs,
    fontWeight: weight.bold,
    color: colors.text,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  hint: { fontSize: type.xs, color: colors.faint },
  field: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  fieldFocused: {
    ...shadows.card,
    shadowColor: colors.accent,
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },
  fieldError: { backgroundColor: '#FFF9F9' },
  fieldMultiline: {
    minHeight: 104,
    alignItems: 'flex-start',
    paddingTop: 13,
  },
  input: {
    flex: 1,
    fontSize: type.sm,
    color: colors.text,
    paddingVertical: 0,
  },
  inputMultiline: { minHeight: 74, paddingTop: 0 },
  error: { fontSize: type.xs, color: colors.danger, lineHeight: 16 },
});
