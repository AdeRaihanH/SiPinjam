import { StyleSheet, View } from 'react-native';

export default function HeroGlow({ tone = 'light' }) {
  const light = tone === 'light';

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.blob, styles.blobTop, {
        backgroundColor: light ? 'rgba(20,184,166,0.22)' : 'rgba(20,184,166,0.12)',
      }]}
      />
      <View style={[styles.blob, styles.blobBottom, {
        backgroundColor: light ? 'rgba(255,255,255,0.06)' : 'rgba(27,37,89,0.06)',
      }]}
      />
      <View style={[styles.ring, {
        borderColor: light ? 'rgba(255,255,255,0.12)' : 'rgba(27,37,89,0.08)',
      }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute', borderRadius: 999 },
  blobTop: { width: 220, height: 220, top: -90, right: -70 },
  blobBottom: { width: 260, height: 260, bottom: -130, left: -90 },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    top: 78,
    right: 28,
  },
});
