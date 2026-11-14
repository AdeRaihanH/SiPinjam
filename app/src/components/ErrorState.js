import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';
import Button from './Button';

export default function ErrorState({ error, onRetry, style }) {
  const isNetwork = error?.code === 'NETWORK_ERROR';
  const message = error?.message || 'Terjadi kesalahan saat memuat data.';

  return (
    <View style={[styles.root, style]}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={isNetwork ? 'cloud-offline-outline' : 'alert-circle-outline'}
          size={28}
          color={colors.danger}
        />
      </View>
      <Text style={styles.title}>{isNetwork ? 'Tidak terhubung' : 'Gagal memuat'}</Text>
      <Text style={styles.message}>{message}</Text>
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
  root: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 22,
    gap: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  message: {
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 290,
  },
  button: { marginTop: 8 },
});
