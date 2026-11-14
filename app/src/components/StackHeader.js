import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function StackHeader({
  title,
  subtitle,
  right,
  onBack,
  close = false,
  style,
}) {
  const navigation = useNavigation();

  return (
    <View style={[styles.root, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={close ? 'Tutup' : 'Kembali'}
        hitSlop={8}
        onPress={onBack || (() => navigation.goBack())}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Ionicons name={close ? 'close' : 'arrow-back'} size={20} color={colors.ink} />
      </Pressable>
      <View style={styles.titleWrap}>
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
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 12,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  titleWrap: { flex: 1, gap: 1 },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    color: colors.muted,
  },
  spacer: { width: 40, height: 40 },
});
