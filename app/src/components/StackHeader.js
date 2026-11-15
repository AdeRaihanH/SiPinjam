import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, type, weight } from '../theme/tokens';

export default function StackHeader({ title, subtitle, right, onBack, close = false, style }) {
  const navigation = useNavigation();

  return (
    <View style={[styles.root, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={close ? 'Tutup' : 'Kembali'}
        hitSlop={8}
        onPress={onBack || (() => navigation.goBack())}
        style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}
      >
        <Ionicons name={close ? 'close' : 'arrow-back'} size={19} color={colors.text} />
      </Pressable>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right || <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 10,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 1 },
  title: { fontSize: type.md, fontWeight: weight.semibold, color: colors.text },
  subtitle: { fontSize: type.xs, color: colors.muted },
  spacer: { width: 36, height: 36 },
});
