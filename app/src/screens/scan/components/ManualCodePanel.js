import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radius, type, webInputReset, weight } from '../../../theme/tokens';

export default function ManualCodePanel({ value, onChange, onSubmit, bottomInset }) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.panel, { paddingBottom: Math.max(bottomInset, 12) + 84 }]}>
        <Text style={styles.title}>Input kode manual</Text>
        <View style={styles.row}>
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="ELK-001 atau PJM-..."
            placeholderTextColor={colors.faint}
            autoCapitalize="characters"
            autoCorrect={false}
            style={[styles.input, webInputReset]}
            selectionColor={colors.accent}
            returnKeyType="go"
            onSubmitEditing={onSubmit}
          />
          <Pressable
            accessibilityRole="button"
            onPress={onSubmit}
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.buttonText}>Buka</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>
          QR format: SIPINJAM:TOOL:ELK-001 · SIPINJAM:LOAN:PJM-...
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: 18,
    paddingTop: 18,
    gap: 10,
  },
  title: {
    fontSize: type.xxs,
    fontWeight: weight.bold,
    color: colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: type.sm,
    color: colors.text,
  },
  button: {
    width: 70,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: type.xs, fontWeight: weight.bold, color: colors.white },
  hint: { fontSize: type.xs, color: colors.faint },
});
