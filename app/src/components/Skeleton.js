import { useEffect, useMemo } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme/tokens';

export function Skeleton({ width = '100%', height = 12, style, radius: r = 6 }) {
  const opacity = useMemo(() => new Animated.Value(0.45), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(opacity, { toValue: 0.45, duration: 650, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: r, backgroundColor: colors.surfaceMuted, opacity },
        style,
      ]}
    />
  );
}

export function ListSkeleton({ count = 4 }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.row}>
          <Skeleton width={56} height={56} radius={12} />
          <View style={styles.lines}>
            <Skeleton width="42%" height={10} />
            <Skeleton width="80%" height={13} />
            <Skeleton width="28%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  lines: { flex: 1, gap: 7 },
});
