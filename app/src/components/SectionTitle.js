import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function SectionTitle({
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
}) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={13} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copy: { flex: 1, gap: 2 },
  title: {
    fontSize: 16.5,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.25,
  },
  subtitle: {
    fontSize: 11.5,
    color: colors.muted,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },
});
