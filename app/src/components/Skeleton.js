import { useEffect, useMemo } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme/tokens';

export function Skeleton({ width = '100%', height = 12, style, radius: r = 8 }) {
  const opacity = useMemo(() => new Animated.Value(0.45), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: r, backgroundColor: colors.surfaceStrong, opacity },
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
          <Skeleton width={60} height={60} radius={18} />
          <View style={styles.lines}>
            <Skeleton width="38%" height={9} />
            <Skeleton width="82%" height={14} />
            <Skeleton width="32%" height={9} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lines: { flex: 1, gap: 8 },
});
