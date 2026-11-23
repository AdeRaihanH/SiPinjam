import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PressableScale from './PressableScale';
import { colors, radius, shadows, type, weight } from '../theme/tokens';

export default function SheetModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  style,
}) {
  const insets = useSafeAreaInsets();
  const [slide] = useState(() => new Animated.Value(40));

  useEffect(() => {
    if (!visible) return undefined;
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const active = document.activeElement;
      if (active && typeof active.blur === 'function') active.blur();
    }
    slide.setValue(40);
    const animation = Animated.spring(slide, {
      toValue: 0,
      useNativeDriver: Platform.OS !== 'web',
      speed: 18,
      bounciness: 4,
    });
    animation.start();
    return () => animation.stop();
  }, [visible, slide]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root} pointerEvents="box-none">
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Tutup panel" />
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 16) },
            { transform: [{ translateY: slide }] },
            style,
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Tutup"
              hitSlop={8}
              onPress={onClose}
              scaleTo={0.9}
              haptic={false}
              hoverStyle={{ backgroundColor: colors.primarySoft }}
              style={styles.close}
            >
              <Ionicons name="close" size={18} color={colors.muted} />
            </PressableScale>
          </View>
          {children}
        </Animated.View>
      </View>
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
    ...(Platform.OS === 'web' ? { width: '100%', maxWidth: 520, alignSelf: 'center' } : {}),
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
