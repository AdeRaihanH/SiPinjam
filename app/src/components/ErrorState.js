import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, type, weight } from '../theme/tokens';
import Button from './Button';

export default function ErrorState({ error, onRetry, style }) {
  const network = error?.code === 'NETWORK_ERROR';
  return (
    <View style={[styles.root, style]}>
      <View style={styles.icon}>
        <Ionicons
          name={network ? 'cloud-offline-outline' : 'alert-circle-outline'}
          size={24}
          color={colors.danger}
        />
      </View>
      <Text style={styles.title}>{network ? 'Tidak terhubung' : 'Gagal memuat'}</Text>
      <Text style={styles.message}>{error?.message || 'Terjadi kesalahan saat memuat data.'}</Text>
      {onRetry ? (
        <Button
          title="Coba lagi"
          icon="refresh"
          onPress={onRetry}
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
  root: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 24, gap: 7 },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  title: { fontSize: type.md, fontWeight: weight.semibold, color: colors.text },
  message: { fontSize: type.xs, lineHeight: 17, color: colors.muted, textAlign: 'center', maxWidth: 290 },
  button: { marginTop: 8 },
});
