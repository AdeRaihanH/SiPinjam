import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows } from '../theme';
import ToolGlyph from './ToolGlyph';
import { Pill } from './Pill';

export default function ToolCard({ tool, onPress, style }) {
  const habis = Number(tool.stok_tersedia) <= 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${tool.nama}, ${habis ? 'stok habis' : `${tool.stok_tersedia} tersedia`}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      <ToolGlyph tool={tool} size={54} />
      <View style={styles.copy}>
        <Text style={styles.category} numberOfLines={1}>
          {tool.kategori_nama} · {tool.kode}
        </Text>
        <Text style={styles.title} numberOfLines={2}>{tool.nama}</Text>
        <View style={styles.metaRow}>
          <Pill
            label={habis ? 'Stok habis' : `${tool.stok_tersedia} tersedia`}
            tone={habis ? 'danger' : 'primary'}
            dot
          />
          {tool.kondisi !== 'baik' ? (
            <Pill label="Rusak ringan" tone="warn" />
          ) : null}
        </View>
      </View>
      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={17} color={colors.faint} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  copy: { flex: 1, gap: 4 },
  category: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 0.1,
  },
  title: {
    fontSize: 14.5,
    lineHeight: 19,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 1,
  },
  chevron: {
    width: 26,
    alignItems: 'flex-end',
  },
});
