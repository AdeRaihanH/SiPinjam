import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import ToolPhoto from './ToolPhoto';
import { colors, radius, shadows, toneForCategory, type, weight } from '../theme/tokens';

export default function PopularCard({ tool, onPress }) {
  const tone = toneForCategory(tool.kategori?.slug);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${tool.nama}, ${tool.total_dipinjam} kali dipinjam`}
      onPress={onPress}
      scaleTo={0.975}
      hoverStyle={{ borderColor: colors.borderStrong }}
      style={styles.card}
    >
      <ToolPhoto tool={tool} width="100%" height={88} rounded={0} />
      <View style={styles.body}>
        <Text style={[styles.category, { color: tone.fg }]} numberOfLines={1}>
          {tool.kategori?.nama || 'Alat'}
        </Text>
        <Text style={styles.name} numberOfLines={2}>{tool.nama}</Text>
        <View style={styles.count}>
          <Ionicons name="trending-up" size={11} color={colors.accentInk} />
          <Text style={styles.countText}>{tool.total_dipinjam}× dipinjam</Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 158,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  body: { padding: 11, gap: 4 },
  category: {
    fontSize: 9,
    fontWeight: weight.bold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: type.xs,
    lineHeight: 17,
    fontWeight: weight.bold,
    color: colors.text,
    minHeight: 34,
  },
  count: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    height: 22,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  countText: { fontSize: 9.5, fontWeight: weight.bold, color: colors.accentInk },
});
