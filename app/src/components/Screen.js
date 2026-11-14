import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout } from '../theme';

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
  const content = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        padded && styles.padded,
        contentContainerStyle,
      ]}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : children;

  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: background }, style]}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  padded: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 36,
  },
});
