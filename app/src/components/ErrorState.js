import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import Button from './Button';
import { colors, type, weight } from '../theme/tokens';

export default function ErrorState({ error, onRetry, style }) {
  const network = error?.code === 'NETWORK_ERROR';

  return (
    <View style={[styles.root, style]}>
      <View style={styles.iconWrap}>
        <View style={styles.ring} />
        <View style={styles.icon}>
          <Ionicons
            name={network ? 'cloud-offline-outline' : 'alert-circle-outline'}
            size={26}
            color={colors.danger}
          />
        </View>
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
  root: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24, gap: 8 },
  iconWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  ring: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: '#F3D9D9',
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#F3D9D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: type.md, fontWeight: weight.bold, color: colors.text },
  message: { fontSize: type.xs, lineHeight: 18, color: colors.muted, textAlign: 'center', maxWidth: 290 },
  button: { marginTop: 8 },
});
