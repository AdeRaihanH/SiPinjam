import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

export default function BrandMark({ size = 44, tone = 'light', style }) {
  const dark = tone === 'dark';
  const background = dark ? colors.primary : colors.white;
  const foreground = dark ? colors.white : colors.primary;
  const accent = colors.accent;
  const unit = size * 0.105;

  const finder = (position) => (
    <View
      style={[
        styles.finder,
        {
          width: size * 0.3,
          height: size * 0.3,
          borderWidth: Math.max(2, size * 0.055),
          borderColor: foreground,
          borderRadius: size * 0.045,
          ...position,
        },
      ]}
    >
      <View
        style={{
          width: size * 0.1,
          height: size * 0.1,
          backgroundColor: foreground,
          borderRadius: size * 0.018,
        }}
      />
    </View>
  );

  return (
    <View
      style={[
        styles.root,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: background,
          padding: size * 0.16,
        },
        style,
      ]}
    >
      <View style={styles.inner}>
        {finder({ top: 0, left: 0 })}
        {finder({ top: 0, right: 0 })}
        {finder({ bottom: 0, left: 0 })}
        <View style={styles.bottomRight}>
          <View style={[styles.dot, {
            width: unit,
            height: unit,
            backgroundColor: foreground,
            marginRight: unit * 0.45,
            marginBottom: unit * 0.45,
          }]}
          />
          <View style={[styles.dot, {
            width: unit,
            height: unit,
            backgroundColor: foreground,
            marginBottom: unit * 0.45,
          }]}
          />
          <View style={[styles.dot, {
            width: unit,
            height: unit,
            backgroundColor: accent,
          }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  inner: { flex: 1, alignSelf: 'stretch', width: '100%' },
  finder: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  bottomRight: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  dot: { borderRadius: 2 },
});
