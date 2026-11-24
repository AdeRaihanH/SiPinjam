import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import HeroGlow from '../../../components/HeroGlow';
import PressableScale from '../../../components/PressableScale';
import { colors, gradients, layout, radius, shadows, type, weight } from '../../../theme/tokens';

function HeroStat({ value, label, alert = false }) {
  return (
    <View style={styles.heroStat}>
      <Text style={[styles.heroStatValue, alert && styles.heroStatAlert]}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

export default function CatalogHero({ stats, onScan }) {
  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <HeroGlow />
      <View style={styles.heroTop}>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Stok laboratorium</Text>
        </View>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Pindai QR"
          onPress={onScan}
          scaleTo={0.94}
          style={styles.scanPill}
        >
          <Ionicons name="scan-outline" size={15} color={colors.accent} />
          <Text style={styles.scanText}>Scan QR</Text>
        </PressableScale>
      </View>

      <View style={styles.heroMain}>
        <Text style={styles.heroNumber}>
          {stats?.tersedia_unit ?? '—'}
          <Text style={styles.heroUnit}> unit</Text>
        </Text>
        <Text style={styles.heroLabel}>siap dipinjam hari ini</Text>
      </View>

      <View style={styles.heroStats}>
        <HeroStat value={stats?.dipinjam_unit ?? '—'} label="Dipinjam" />
        <View style={styles.heroDivider} />
        <HeroStat
          value={stats?.terlambat ?? '—'}
          label="Terlambat"
          alert={Number(stats?.terlambat) > 0}
        />
        <View style={styles.heroDivider} />
        <HeroStat value={stats?.total_alat ?? '—'} label="Jenis alat" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: layout.screenPadding,
    borderRadius: radius.xl,
    padding: 20,
    paddingBottom: 46,
    overflow: 'hidden',
    gap: 16,
    ...shadows.lift,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 27,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  liveText: { fontSize: type.xxs, fontWeight: weight.semibold, color: 'rgba(255,255,255,0.8)' },
  scanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(200,241,105,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(200,241,105,0.22)',
  },
  scanText: { fontSize: type.xxs, fontWeight: weight.bold, color: colors.accent },
  heroMain: { gap: 0 },
  heroNumber: {
    fontSize: 48,
    lineHeight: 54,
    fontWeight: weight.heavy,
    color: colors.white,
    letterSpacing: -2,
  },
  heroUnit: { fontSize: 15, fontWeight: weight.semibold, color: colors.accent, letterSpacing: 0 },
  heroLabel: { fontSize: type.xs, color: 'rgba(255,255,255,0.58)', marginTop: 1 },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 14,
    marginTop: 2,
  },
  heroStat: { flex: 1, gap: 1 },
  heroDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' },
  heroStatValue: { fontSize: 17, fontWeight: weight.heavy, color: colors.white, letterSpacing: -0.3 },
  heroStatAlert: { color: '#E3A79E' },
  heroStatLabel: { fontSize: 9.5, fontWeight: weight.semibold, color: 'rgba(255,255,255,0.62)' },
});
