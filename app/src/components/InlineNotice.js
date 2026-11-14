import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

const TONES = {
  info: { bg: colors.primaryTint, border: colors.primarySoft, fg: colors.primaryDark },
  warn: { bg: colors.warnSoft, border: colors.warnBorder, fg: colors.warn },
  danger: { bg: colors.dangerSoft, border: colors.dangerBorder, fg: colors.danger },
  success: { bg: colors.primarySoft, border: colors.primarySoft, fg: colors.primaryDark },
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
  const iconName = icon || (tone === 'danger' ? 'alert-circle' : tone === 'warn' ? 'warning' : 'information-circle');

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: palette.bg, borderColor: palette.border },
        style,
      ]}
    >
      <Ionicons name={iconName} size={19} color={palette.fg} style={styles.icon} />
      <View style={styles.copy}>
        {title ? <Text style={[styles.title, { color: palette.fg }]}>{title}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {actionLabel ? (
          <Pressable onPress={onAction} hitSlop={6} style={styles.action}>
            <Text style={[styles.actionText, { color: palette.fg }]}>{actionLabel}</Text>
            <Ionicons name="arrow-forward" size={13} color={palette.fg} />
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
    gap: 10,
  },
  icon: { marginTop: 1 },
  copy: { flex: 1, gap: 3 },
  title: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  message: {
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.body,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  actionText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
});
