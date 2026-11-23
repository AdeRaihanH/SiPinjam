import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import Button from './Button';
import { colors, radius, type, weight } from '../theme/tokens';

export default function ErrorState({ error, onRetry, style }) {
  const network = error?.code === 'NETWORK_ERROR';

  return (
    <View style={[styles.root, style]}>
      <View style={styles.icon}>
        <Ionicons
          name={network ? 'cloud-offline-outline' : 'alert-circle-outline'}
          size={28}
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
  root: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24, gap: 9 },
  icon: {
    width: 74,
    height: 74,
    borderRadius: radius.xl,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: { fontSize: 17, fontWeight: weight.bold, color: colors.text },
  message: { fontSize: type.xs, lineHeight: 19, color: colors.muted, textAlign: 'center', maxWidth: 290 },
  button: { marginTop: 8 },
});
