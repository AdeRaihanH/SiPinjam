import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, type, weight } from '../theme/tokens';

const TONES = {
  info: { bg: colors.primarySoft, border: colors.primarySoft, fg: colors.primary },
  success: { bg: colors.successSoft, border: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, border: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, border: colors.dangerSoft, fg: colors.danger },
};

export default function InlineNotice({
  tone = 'info',
  icon,
  title,
  message,
  actionLabel,
  onAction,
  style,
}) {
  const palette = TONES[tone] || TONES.info;
  const iconName = icon || (tone === 'danger' ? 'alert-circle' : tone === 'warning' ? 'warning' : 'information-circle');

  return (
    <View style={[styles.root, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>
      <Ionicons name={iconName} size={18} color={palette.fg} style={styles.icon} />
      <View style={styles.copy}>
        {title ? <Text style={[styles.title, { color: palette.fg }]}>{title}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {actionLabel ? (
          <Pressable onPress={onAction} hitSlop={6} style={styles.action}>
            <Text style={[styles.actionText, { color: palette.fg }]}>{actionLabel}</Text>
            <Ionicons name="arrow-forward" size={12} color={palette.fg} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
  },
  icon: { marginTop: 1 },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: type.xs, fontWeight: weight.bold },
  message: { fontSize: type.xs, lineHeight: 17, color: colors.text },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  actionText: { fontSize: type.xs, fontWeight: weight.bold },
});
