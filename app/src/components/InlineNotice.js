import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import { colors, radius, type, weight } from '../theme/tokens';

const TONES = {
  info: { bg: colors.primarySoft, fg: colors.primary },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
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
    <View style={[styles.root, { backgroundColor: palette.bg }, style]}>
      <View style={styles.iconWrap}>
        <Ionicons name={iconName} size={17} color={palette.fg} />
      </View>
      <View style={styles.copy}>
        {title ? <Text style={[styles.title, { color: palette.fg }]}>{title}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {actionLabel ? (
          <PressableScale
            accessibilityRole="button"
            onPress={onAction}
            scaleTo={0.95}
            style={styles.action}
          >
            <Text style={[styles.actionText, { color: palette.fg }]}>{actionLabel}</Text>
            <Ionicons name="arrow-forward" size={12} color={palette.fg} />
          </PressableScale>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.md,
    padding: 14,
    flexDirection: 'row',
    gap: 11,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.66)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 2, paddingTop: 1 },
  title: { fontSize: type.xs, fontWeight: weight.bold, lineHeight: 17 },
  message: { fontSize: type.xs, lineHeight: 18, color: colors.text },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5, alignSelf: 'flex-start' },
  actionText: { fontSize: type.xs, fontWeight: weight.bold },
});
