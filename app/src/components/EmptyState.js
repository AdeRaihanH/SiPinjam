import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, type, weight } from '../theme/tokens';
import Button from './Button';

export default function EmptyState({ icon = 'file-tray-outline', title, message, actionLabel, onAction, style }) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={24} color={colors.primary} />
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
  root: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24, gap: 7 },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  title: { fontSize: type.md, fontWeight: weight.semibold, color: colors.text, textAlign: 'center' },
  message: { fontSize: type.xs, lineHeight: 17, color: colors.muted, textAlign: 'center', maxWidth: 280 },
  button: { marginTop: 8 },
});
