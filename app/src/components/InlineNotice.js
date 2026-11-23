import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import { colors, radius, type, weight } from '../theme/tokens';

const TONES = {
  info: { bg: colors.primarySoft, border: '#DDE3F5', fg: colors.primary },
  success: { bg: colors.successSoft, border: '#CFEFE2', fg: colors.success },
  warning: { bg: colors.warningSoft, border: '#F6E3C2', fg: colors.warning },
  danger: { bg: colors.dangerSoft, border: '#F7D6D6', fg: colors.danger },
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
      <View style={[styles.iconWrap, { backgroundColor: 'rgba(255,255,255,0.62)' }]}>
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
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 2, paddingTop: 1 },
  title: { fontSize: type.xs, fontWeight: weight.bold },
  message: { fontSize: type.xs, lineHeight: 17, color: colors.text },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, alignSelf: 'flex-start' },
  actionText: { fontSize: type.xs, fontWeight: weight.bold },
});
