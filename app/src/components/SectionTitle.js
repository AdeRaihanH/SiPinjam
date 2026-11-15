import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, type, weight } from '../theme/tokens';

export default function SectionTitle({ title, subtitle, actionLabel, onAction, style }) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={12} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  copy: { flex: 1, gap: 1 },
  title: { fontSize: type.md, fontWeight: weight.bold, color: colors.text },
  subtitle: { fontSize: type.xs, color: colors.muted },
  action: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  actionText: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.primary },
});
