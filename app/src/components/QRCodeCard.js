import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { colors, gradients, radius, shadows, type, weight } from '../theme/tokens';

export default function QRCodeCard({
  value,
  code,
  label = 'Tunjukkan QR ini ke laboran',
  size = 176,
  style,
}) {
  return (
    <View style={[styles.card, style]}>
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.borderRing}
      >
        <View style={styles.qrBox}>
          <QRCode
            value={value}
            size={size}
            color={colors.text}
            backgroundColor={colors.white}
            quietZone={6}
          />
        </View>
      </LinearGradient>
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
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 9,
    ...shadows.lift,
  },
  borderRing: {
    padding: 2,
    borderRadius: radius.lg,
    marginBottom: 2,
  },
  qrBox: {
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: radius.lg - 2,
  },
  code: {
    fontSize: type.md,
    fontWeight: weight.heavy,
    color: colors.text,
    letterSpacing: 1,
  },
  label: {
    fontSize: type.xs,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
