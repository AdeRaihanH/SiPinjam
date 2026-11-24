import { Ionicons } from '@expo/vector-icons';
import { Linking, StyleSheet, Text, View } from 'react-native';

import Button from '../../../components/Button';
import { colors, radius, type, weight } from '../../../theme/tokens';

export default function CameraPermissionPanel({
  isWeb,
  cameraError,
  permission,
  onRequest,
  onRetry,
}) {
  const title = isWeb
    ? 'Kamera tersedia di aplikasi'
    : cameraError
      ? 'Kamera tidak dapat dibuka'
      : 'Izin kamera diperlukan';

  const message = isWeb
    ? 'Gunakan input kode manual di bawah untuk mencoba alur pemindaian di browser.'
    : cameraError
      ? 'Tutup aplikasi lain yang memakai kamera, lalu coba lagi. Input kode manual tetap bisa dipakai.'
      : 'SiPinjam memakai kamera hanya untuk membaca QR alat dan pinjaman.';

  return (
    <View style={styles.panel}>
      <View style={styles.icon}>
        <Ionicons name="camera-outline" size={26} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {!isWeb && cameraError ? (
        <Button
          title="Coba kamera lagi"
          icon="refresh"
          size="sm"
          fullWidth={false}
          onPress={onRetry}
          style={styles.button}
        />
      ) : null}

      {!isWeb && !cameraError && permission?.canAskAgain !== false ? (
        <Button
          title="Izinkan kamera"
          size="sm"
          fullWidth={false}
          onPress={onRequest}
          style={styles.button}
        />
      ) : null}

      {!isWeb && !cameraError && permission?.canAskAgain === false ? (
        <Button
          title="Buka pengaturan"
          icon="settings-outline"
          size="sm"
          variant="secondary"
          fullWidth={false}
          onPress={() => Linking.openSettings()}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: 300,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: 22,
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: type.md,
    fontWeight: weight.semibold,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: type.xs,
    lineHeight: 17,
    color: colors.muted,
    textAlign: 'center',
  },
  button: { marginTop: 6 },
});
