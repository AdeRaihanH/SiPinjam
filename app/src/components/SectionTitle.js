import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import { colors, type, weight } from '../theme/tokens';

export default function SectionTitle({ title, subtitle, actionLabel, onAction, style }) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.bar} />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? (
        <PressableScale
          accessibilityRole="button"
          onPress={onAction}
          scaleTo={0.94}
          style={styles.action}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <View style={styles.actionIcon}>
            <Ionicons name="arrow-forward" size={12} color={colors.primary} />
          </View>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  bar: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  copy: { flex: 1, gap: 1 },
  title: { fontSize: type.md, fontWeight: weight.bold, color: colors.text, letterSpacing: -0.2 },
  subtitle: { fontSize: type.xs, color: colors.muted },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.primary },
  actionIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
