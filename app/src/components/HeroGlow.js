import { StyleSheet, View } from 'react-native';

export default function HeroGlow({ tone = 'light' }) {
  const light = tone === 'light';

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.blob,
          styles.blobTop,
          { backgroundColor: light ? 'rgba(185,205,154,0.1)' : 'rgba(185,205,154,0.07)' },
        ]}
      />
      <View
        style={[
          styles.blob,
          styles.blobBottom,
          { backgroundColor: light ? 'rgba(255,255,255,0.05)' : 'rgba(12,43,33,0.05)' },
        ]}
      />
      <View
        style={[
          styles.ring,
          { borderColor: light ? 'rgba(255,255,255,0.07)' : 'rgba(12,43,33,0.05)' },
        ]}
      />
      <View
        style={[
          styles.ringSmall,
          { borderColor: light ? 'rgba(185,205,154,0.12)' : 'rgba(185,205,154,0.1)' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute', borderRadius: 999 },
  blobTop: { width: 240, height: 240, top: -108, right: -64 },
  blobBottom: { width: 280, height: 280, bottom: -160, left: -100 },
  ring: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1,
    top: 62,
    right: 24,
  },
  ringSmall: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    top: 92,
    right: 63,
  },
});
