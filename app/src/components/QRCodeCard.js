import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors, radius } from '../theme';

function Corner({ style }) {
  return <View style={[styles.corner, style]} />;
}

export default function QRCodeCard({
  value,
  code,
  label = 'Tunjukkan QR ini ke laboran',
  size = 184,
  style,
}) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.qrBox, { width: size + 24, height: size + 24 }]}>
        <Corner style={styles.tl} />
        <Corner style={styles.tr} />
        <Corner style={styles.bl} />
        <Corner style={styles.br} />
        <QRCode
          value={value}
          size={size}
          color={colors.ink}
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
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 8,
  },
  qrBox: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginBottom: 4,
  },
  corner: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: colors.primary,
  },
  tl: {
    top: 0,
    left: 0,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopLeftRadius: 8,
  },
  tr: {
    top: 0,
    right: 0,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderTopRightRadius: 8,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderBottomLeftRadius: 8,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomRightRadius: 8,
  },
  code: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.8,
  },
  label: {
    fontSize: 11.5,
    color: colors.muted,
    textAlign: 'center',
  },
});
