import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import HeroGlow from '../components/HeroGlow';
import LoanRow from '../components/LoanRow';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import Screen from '../components/Screen';
import SegmentedControl from '../components/SegmentedControl';
import { ListSkeleton } from '../components/Skeleton';
import { useFocusRefetch } from '../hooks/useQuery';
import { useLoans } from '../hooks/useLoans';
import { useStats } from '../hooks/useStats';
import { colors, gradients, layout, radius, shadows, type, weight } from '../theme/tokens';

const OPTIONS = [
  { key: 'aktif', label: 'Aktif' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'semua', label: 'Semua' },
];

const EMPTY = {
  aktif: {
    icon: 'leaf-outline',
    title: 'Tidak ada pinjaman aktif',
    message: 'Cari alat di katalog lalu ajukan pinjaman pertamamu.',
    actionLabel: 'Buka katalog',
  },
  selesai: {
    icon: 'time-outline',
    title: 'Belum ada riwayat',
    message: 'Pinjaman yang sudah dikembalikan akan muncul di sini.',
  },
  semua: {
    icon: 'document-text-outline',
    title: 'Belum ada pinjaman',
    message: 'Ajukan pinjaman alat dari tab Katalog.',
    actionLabel: 'Buka katalog',
  },
};

function Stat({ value, label, icon, gold = false }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={13} color={gold ? colors.gold : colors.accent} />
      </View>
      <Text style={[styles.statValue, gold && styles.statValueGold]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function PinjamanScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [status, setStatus] = useState('aktif');
  const loansQuery = useLoans(status);
  const statsQuery = useStats();

  const { refetch: refetchLoans } = loansQuery;
  const { refetch: refetchStats } = statsQuery;
  useFocusRefetch(refetchLoans);
  useFocusRefetch(refetchStats);

  const onRefresh = useCallback(() => {
    refetchLoans('refresh');
    refetchStats('silent');
  }, [refetchLoans, refetchStats]);

  const empty = EMPTY[status];
  const stats = statsQuery.data;

  return (
    <Screen
      scroll
      padded={false}
      edges={[]}
      contentContainerStyle={styles.content}
      refreshControl={(
        <RefreshControl
          refreshing={loansQuery.refreshing}
          onRefresh={onRefresh}
          tintColor={colors.white}
          colors={[colors.primary]}
          progressBackgroundColor={colors.surface}
        />
      )}
    >
      {isFocused ? <StatusBar style="light" /> : null}
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 4 }]}
      >
        <HeroGlow />
        <PageHeader
          tone="light"
          eyebrow="Aktivitas"
          title="Pinjaman"
          subtitle="Pantau jadwal pengembalian dan denda."
        />
        <View style={styles.statsRow}>
          <Stat value={stats?.total_pinjaman ?? '—'} label="Total" icon="layers-outline" />
          <Stat value={stats?.aktif ?? '—'} label="Aktif" icon="swap-horizontal-outline" />
          <Stat value={stats?.terlambat ?? '—'} label="Terlambat" icon="alarm-outline" gold />
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.toolbar}>
          <SegmentedControl options={OPTIONS} value={status} onChange={setStatus} />
        </View>

        <View style={styles.summaryLine}>
          <Text style={styles.summaryText}>
            {loansQuery.meta.total} pinjaman {status === 'aktif' ? 'aktif' : status === 'selesai' ? 'selesai' : 'total'}
          </Text>
          {stats?.terlambat > 0 ? (
            <View style={styles.latePill}>
              <Ionicons name="alert-circle" size={11} color={colors.danger} />
              <Text style={styles.lateText}>{stats.terlambat} terlambat</Text>
            </View>
          ) : null}
        </View>

        {loansQuery.loading && !loansQuery.data.length ? (
          <ListSkeleton count={3} />
        ) : loansQuery.error && !loansQuery.data.length ? (
          <ErrorState error={loansQuery.error} onRetry={() => refetchLoans('refresh')} />
        ) : loansQuery.data.length === 0 ? (
          <EmptyState
            icon={empty.icon}
            title={empty.title}
            message={empty.message}
            actionLabel={empty.actionLabel}
            onAction={empty.actionLabel ? () => navigation.navigate('Katalog') : undefined}
          />
        ) : (
          <View style={styles.list}>
            {loansQuery.data.map((loan, index) => (
              <Reveal key={loan.id} delay={Math.min(index, 6) * 35}>
                <LoanRow
                  loan={loan}
                  onPress={() => navigation.navigate('DetailPinjaman', { loanId: loan.id })}
                />
              </Reveal>
            ))}
          </View>
        )}

        <View style={styles.footerCard}>
          <Ionicons name="information-circle-outline" size={15} color={colors.muted} />
          <Text style={styles.footer}>
            Denda Rp2.000 per hari dihitung saat alat dikembalikan.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28 },
  hero: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    gap: 22,
  },
  statsRow: { flexDirection: 'row', gap: 8 },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    paddingHorizontal: 11,
    paddingVertical: 10,
    gap: 2,
  },
  statIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: type.lg,
    lineHeight: 27,
    fontWeight: weight.heavy,
    color: colors.white,
    letterSpacing: -0.5,
  },
  statValueGold: { color: colors.gold },
  statLabel: {
    fontSize: type.xxs,
    fontWeight: weight.semibold,
    color: 'rgba(255,255,255,0.62)',
  },
  body: {
    paddingHorizontal: layout.screenPadding,
    marginTop: -26,
    gap: 14,
  },
  toolbar: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 5,
    ...shadows.lift,
  },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  summaryText: { fontSize: type.xs, color: colors.muted },
  latePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerSoft,
  },
  lateText: { fontSize: type.xxs, fontWeight: weight.bold, color: colors.danger },
  list: { gap: 10 },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  footer: { fontSize: type.xxs, color: colors.faint },
});
