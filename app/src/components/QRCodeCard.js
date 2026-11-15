import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors, radius, shadows, type, weight } from '../theme/tokens';

export default function QRCodeCard({
  value,
  code,
  label = 'Tunjukkan QR ini ke laboran',
  size = 176,
  style,
}) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.qrBox}>
        <QRCode
          value={value}
          size={size}
          color={colors.text}
          backgroundColor={colors.white}
          quietZone={6}
        />
      </View>
      {code ? <Text style={styles.code}>{code}</Text> : null}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
    ...shadows.card,
  },
  qrBox: {
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: radius.md,
    marginBottom: 2,
  },
  code: {
    fontSize: type.md,
    fontWeight: weight.bold,
    color: colors.text,
    letterSpacing: 0.6,
  },
  label: {
    fontSize: type.xs,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 17,
  },
});
