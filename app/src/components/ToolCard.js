import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import StockBadge from './StockBadge';
import ToolPhoto from './ToolPhoto';
import { colors, radius, shadows, toneForCategory, weight } from '../theme/tokens';

export default function ToolCard({ tool, onPress, style }) {
  const tone = toneForCategory(tool.kategori?.slug);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${tool.nama}, ${tool.stok_tersedia} tersedia`}
      onPress={onPress}
      scaleTo={0.975}
      hoverStyle={{ borderColor: colors.borderStrong }}
      style={[styles.card, style]}
    >
      <View style={styles.photoWrap}>
        <ToolPhoto tool={tool} width="100%" height={118} rounded={0} />
        <View style={[styles.categoryIcon, { backgroundColor: tone.bg }]}>
          <Ionicons name={tool.kategori?.icon || 'cube-outline'} size={13} color={tone.fg} />
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.code} numberOfLines={1}>
          {tool.kode} · {tool.kategori?.nama || 'Alat'}
        </Text>
        <Text style={styles.name} numberOfLines={2}>{tool.nama}</Text>
        <View style={styles.footer}>
          <StockBadge stok={tool.stok_tersedia} compact />
          <View style={styles.arrow}>
            <Ionicons name="arrow-forward" size={13} color={colors.primary} />
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  photoWrap: { position: 'relative' },
  categoryIcon: {
    position: 'absolute',
    top: 9,
    left: 9,
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 12, gap: 5 },
  code: {
    fontSize: 9.5,
    fontWeight: weight.bold,
    color: colors.faint,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: weight.bold,
    color: colors.text,
    letterSpacing: -0.1,
    minHeight: 36,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 2,
  },
  arrow: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
