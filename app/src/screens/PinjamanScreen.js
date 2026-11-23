import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

function SummaryStat({ value, label, alert = false }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={[styles.summaryValue, alert && styles.summaryAlert]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

export default function PinjamanScreen({ navigation }) {
  const insets = useSafeAreaInsets();
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
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.surface}
        />
      )}
    >
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <PageHeader
          eyebrow="Aktivitas"
          title="Pinjaman"
          subtitle="Pantau jadwal pengembalian dan denda."
        />
      </View>

      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.summaryCard}
      >
        <HeroGlow />
        <View style={styles.summaryHead}>
          <Text style={styles.summaryEyebrow}>Ringkasan pinjaman</Text>
          <View style={styles.summaryPill}>
            <Ionicons name="shield-checkmark-outline" size={12} color={colors.accent} />
            <Text style={styles.summaryPillText}>Tercatat</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <SummaryStat value={stats?.total_pinjaman ?? '—'} label="Total" />
          <View style={styles.summaryDivider} />
          <SummaryStat value={stats?.aktif ?? '—'} label="Aktif" />
          <View style={styles.summaryDivider} />
          <SummaryStat
            value={stats?.terlambat ?? '—'}
            label="Terlambat"
            alert={Number(stats?.terlambat) > 0}
          />
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <SegmentedControl options={OPTIONS} value={status} onChange={setStatus} />

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
              <Reveal key={loan.id} delay={Math.min(index, 6) * 30}>
                <LoanRow
                  loan={loan}
                  onPress={() => navigation.navigate('DetailPinjaman', { loanId: loan.id })}
                />
              </Reveal>
            ))}
          </View>
        )}

        <View style={styles.footerCard}>
          <View style={styles.footerIcon}>
            <Ionicons name="information-circle-outline" size={16} color={colors.accentInk} />
          </View>
          <Text style={styles.footer}>
            Denda Rp2.000 per hari dihitung saat alat dikembalikan.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 120 },
  header: { paddingHorizontal: layout.screenPadding, paddingBottom: 16 },
  summaryCard: {
    marginHorizontal: layout.screenPadding,
    borderRadius: radius.xl,
    padding: 20,
    gap: 18,
    overflow: 'hidden',
    ...shadows.lift,
  },
  summaryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryEyebrow: {
    fontSize: type.xxs,
    fontWeight: weight.bold,
    color: 'rgba(255,255,255,0.56)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    height: 25,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(200,241,105,0.1)',
  },
  summaryPillText: { fontSize: 9.5, fontWeight: weight.bold, color: colors.accent },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryStat: { flex: 1, gap: 1 },
  summaryDivider: { width: 1, height: 34, backgroundColor: 'rgba(255,255,255,0.1)' },
  summaryValue: { fontSize: 28, fontWeight: weight.heavy, color: colors.white, letterSpacing: -1 },
  summaryAlert: { color: '#E3A79E' },
  summaryLabel: { fontSize: 10, fontWeight: weight.semibold, color: 'rgba(255,255,255,0.6)' },
  body: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 16,
    gap: 14,
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
    paddingHorizontal: 9,
    height: 25,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerSoft,
  },
  lateText: { fontSize: type.xxs, fontWeight: weight.bold, color: colors.danger },
  list: { gap: 12 },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 2,
  },
  footerIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { flex: 1, fontSize: type.xxs, lineHeight: 16, color: colors.accentInk },
});
