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
      <View style={styles.eyebrowRow}>
        <View style={styles.eyebrowDot} />
        <Text style={styles.eyebrow}>QR siap dipindai</Text>
      </View>
      <View style={styles.qrFrame}>
        <View style={styles.qrBox}>
          <QRCode
            value={value}
            size={size}
            color={colors.primaryDeep}
            backgroundColor={colors.white}
            quietZone={6}
          />
        </View>
      </View>
      {code ? <Text style={styles.code}>{code}</Text> : null}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 10,
    ...shadows.lift,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  eyebrowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  eyebrow: {
    fontSize: type.xxs,
    fontWeight: weight.bold,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  qrFrame: {
    padding: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
  },
  qrBox: {
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: radius.md,
  },
  code: {
    fontSize: 19,
    fontWeight: weight.heavy,
    color: colors.text,
    letterSpacing: 2,
    marginTop: 2,
  },
  label: {
    fontSize: type.xs,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
