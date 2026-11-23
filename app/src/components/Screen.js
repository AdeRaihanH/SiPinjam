import { useEffect, useState } from 'react';
import { Animated, Platform, ScrollView, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout } from '../theme/tokens';

export default function Screen({
  children,
  scroll = false,
  padded = true,
  style,
  contentContainerStyle,
  refreshControl,
  edges = ['top'],
  background = colors.bg,
}) {
  const isFocused = useIsFocused();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!isFocused) return undefined;
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 260,
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start();
    return () => animation.stop();
  }, [isFocused, progress]);

  const content = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[padded && styles.padded, contentContainerStyle]}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : children;

  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: background }, style]}>
      <Animated.View
        style={[
          styles.animated,
          {
            opacity: progress,
            transform: [{
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            }],
          },
        ]}
      >
        {content}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  animated: { flex: 1 },
  padded: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 32,
  },
});
