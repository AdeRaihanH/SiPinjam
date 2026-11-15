import { Ionicons } from '@expo/vector-icons';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows, type, weight } from '../theme/tokens';

export default function SheetModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  keyboard = false,
  style,
}) {
  const insets = useSafeAreaInsets();

  const panel = (
    <View style={styles.root} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Tutup panel" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }, style]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tutup"
            hitSlop={8}
            onPress={onClose}
            style={styles.close}
          >
            <Ionicons name="close" size={18} color={colors.muted} />
          </Pressable>
        </View>
        {children}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {keyboard ? (
        <KeyboardAvoidingView
          style={styles.root}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {panel}
        </KeyboardAvoidingView>
      ) : panel}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '90%',
    ...shadows.sheet,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  titleWrap: { flex: 1, gap: 2 },
  title: { fontSize: type.md, fontWeight: weight.bold, color: colors.text },
  subtitle: { fontSize: type.xs, lineHeight: 17, color: colors.muted },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
