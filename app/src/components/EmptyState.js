import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import Button from './Button';
import { colors, type, weight } from '../theme/tokens';

export default function EmptyState({ icon = 'file-tray-outline', title, message, actionLabel, onAction, style }) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.iconWrap}>
        <View style={styles.ring} />
        <View style={styles.icon}>
          <Ionicons name={icon} size={26} color={colors.primary} />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="soft"
          size="sm"
          fullWidth={false}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', paddingVertical: 38, paddingHorizontal: 24, gap: 8 },
  iconWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  ring: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: type.md, fontWeight: weight.bold, color: colors.text, textAlign: 'center' },
  message: { fontSize: type.xs, lineHeight: 18, color: colors.muted, textAlign: 'center', maxWidth: 280 },
  button: { marginTop: 8 },
});
