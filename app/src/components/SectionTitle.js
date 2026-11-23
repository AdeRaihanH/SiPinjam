import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import { colors, radius, type, weight } from '../theme/tokens';

export default function SectionTitle({ title, subtitle, actionLabel, onAction, style }) {
  return (
    <View style={[styles.root, style]}>
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
  root: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 17, fontWeight: weight.bold, color: colors.text, letterSpacing: -0.3 },
  subtitle: { fontSize: type.xs, lineHeight: 17, color: colors.muted },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.primary },
  actionIcon: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
