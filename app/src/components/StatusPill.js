import { StyleSheet, Text, View } from 'react-native';
import { radius, statusTone, type, weight } from '../theme/tokens';

export default function StatusPill({ status, style }) {
  const tone = statusTone[status] || statusTone.dikembalikan;
  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: tone.dot }]} />
      <Text style={[styles.text, { color: tone.fg }]}>{tone.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: type.xs, fontWeight: weight.semibold },
});
