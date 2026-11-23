import { useEffect, useState } from 'react';
import { Animated, Platform } from 'react-native';

export default function Reveal({ children, delay = 0, distance = 12, style }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      delay,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [delay, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [{
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [distance, 0],
            }),
          }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
