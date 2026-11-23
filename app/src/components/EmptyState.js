import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import Button from './Button';
import { colors, radius, type, weight } from '../theme/tokens';

export default function EmptyState({ icon = 'file-tray-outline', title, message, actionLabel, onAction, style }) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={28} color={colors.primary} />
        <View style={styles.spark} />
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
  root: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24, gap: 9 },
  icon: {
    width: 74,
    height: 74,
    borderRadius: radius.xl,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    transform: [{ rotate: '-4deg' }],
  },
  spark: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    top: 10,
    right: 12,
  },
  title: { fontSize: 17, fontWeight: weight.bold, color: colors.text, textAlign: 'center' },
  message: { fontSize: type.xs, lineHeight: 19, color: colors.muted, textAlign: 'center', maxWidth: 280 },
  button: { marginTop: 8 },
});
