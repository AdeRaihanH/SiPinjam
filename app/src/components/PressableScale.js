import { useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet } from 'react-native';

import { tap } from '../lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const isWeb = Platform.OS === 'web';

export default function PressableScale({
  children,
  style,
  onPress,
  onPressIn,
  onPressOut,
  scaleTo = 0.97,
  disabled = false,
  haptic = true,
  hoverStyle,
  ...rest
}) {
  const [scale] = useState(() => new Animated.Value(1));
  const [hovered, setHovered] = useState(false);

  const animate = (toValue) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: Platform.OS !== 'web',
      speed: 45,
      bounciness: 0,
    }).start();
  };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onHoverIn={isWeb ? () => setHovered(true) : undefined}
      onHoverOut={isWeb ? () => setHovered(false) : undefined}
      onPressIn={(event) => {
        animate(scaleTo);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animate(1);
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (isWeb && typeof document !== 'undefined') {
          const active = document.activeElement;
          if (active && typeof active.blur === 'function') active.blur();
        }
        if (haptic) tap();
        onPress?.(event);
      }}
      style={[
        style,
        isWeb && styles.web,
        isWeb && { cursor: disabled ? 'default' : 'pointer' },
        { transform: [{ scale }] },
        isWeb && hovered && !disabled && styles.hover,
        isWeb && hovered && !disabled && hoverStyle,
        disabled && { opacity: 0.55 },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  web: {
    transitionProperty: 'opacity, background-color, border-color',
    transitionDuration: '150ms',
  },
  hover: { opacity: 0.95 },
});
