import { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, radius, shadows } from '../theme';

export function Skeleton({ width = '100%', height = 14, style, radius: r = 7 }) {
  const opacity = useMemo(() => new Animated.Value(0.45), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
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

export function ToolCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={52} height={52} radius={16} />
      <View style={styles.lines}>
        <Skeleton width="42%" height={10} />
        <Skeleton width="82%" height={15} />
        <Skeleton width="30%" height={10} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <ToolCardSkeleton key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.soft,
  },
  lines: { flex: 1, gap: 8 },
});
