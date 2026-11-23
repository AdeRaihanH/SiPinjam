import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import { select } from '../lib/haptics';
import { colors, radius, shadows, type, weight } from '../theme/tokens';

export default function SegmentedControl({ options, value, onChange, style }) {
  const [width, setWidth] = useState(0);
  const [slide] = useState(() => new Animated.Value(0));
  const index = Math.max(0, options.findIndex((option) => option.key === value));
  const segment = width ? (width - 8) / options.length : 0;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: index,
      useNativeDriver: Platform.OS !== 'web',
      speed: 32,
      bounciness: 5,
    }).start();
  }, [index, slide]);

  return (
    <View
      style={[styles.root, style]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {segment > 0 ? (
        <Animated.View
          style={[
            styles.indicator,
            {
              width: Math.max(0, segment - 6),
              transform: [{ translateX: Animated.multiply(slide, segment) }],
            },
          ]}
        />
      ) : null}
      {options.map((option) => {
        const active = option.key === value;
        return (
          <PressableScale
            key={option.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (option.key !== value) select();
              onChange(option.key);
            }}
            scaleTo={0.96}
            haptic={false}
            style={styles.item}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 4,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.surface,
    ...shadows.card,
    shadowOpacity: 0.1,
  },
  item: {
    flex: 1,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: type.xs,
    fontWeight: weight.semibold,
    color: colors.muted,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: weight.bold,
  },
});
