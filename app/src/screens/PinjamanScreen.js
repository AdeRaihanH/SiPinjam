import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import InlineNotice from '../components/InlineNotice';
import LoanCard from '../components/LoanCard';
import PageHeader from '../components/PageHeader';
import Screen from '../components/Screen';
import { Pill } from '../components/Pill';
import { SkeletonList } from '../components/Skeleton';
import StatTile from '../components/StatTile';
import { useFocusReload, useResource } from '../hooks/useResource';
import { api } from '../services/api';
import { colors, radius, shadows, text } from '../theme';

const FILTERS = [
  { key: 'berjalan', label: 'Berjalan' },
  { key: 'terlambat', label: 'Terlambat' },
  { key: 'selesai', label: 'Selesai' },
];

export default function PinjamanScreen({ navigation }) {
  const [filter, setFilter] = useState('berjalan');

  const loadLoans = useCallback(
    () => api.getList('/loans', { params: { status: filter, limit: 50 } }),
    [filter],
  );
  const loansRes = useResource(loadLoans);

  const loadStats = useCallback(() => api.get('/stats/summary'), []);
  const statsRes = useResource(loadStats);

  useFocusReload(loansRes.reload);
  useFocusReload(statsRes.reload);

  const loans = loansRes.data?.data || [];
  const stats = statsRes.data;

  const onRefresh = () => {
    loansRes.reload('refresh');
    statsRes.reload('silent');
  };

  const emptyCopy = {
    berjalan: {
      icon: 'leaf-outline',
      title: 'Belum ada pinjaman berjalan',
      message: 'Cari alat di katalog lalu ajukan pinjaman pertamamu.',
      actionLabel: 'Buka katalog',
      onAction: () => navigation.navigate('Katalog'),
    },
    terlambat: {
      icon: 'checkmark-done-outline',
      title: 'Tidak ada keterlambatan',
      message: 'Semua pinjamanmu masih dalam jadwal pengembalian.',
    },
    selesai: {
      icon: 'time-outline',
      title: 'Belum ada riwayat',
      message: 'Pinjaman yang sudah dikembalikan akan muncul di sini.',
    },
  }[filter];

  return (
    <Screen
      scroll
      padded={false}
      contentContainerStyle={styles.content}
      refreshControl={(
        <RefreshControl
          refreshing={loansRes.refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      )}
    >
      <PageHeader
        eyebrow="Aktivitas laboratorium"
        title="Pinjaman saya"
        subtitle="Pantau jadwal kembali dan denda dalam satu tempat."
        right={<Pill label={`${stats?.total_pinjaman ?? 0} total`} tone="neutral" />}
        style={styles.header}
      />

      <View style={styles.statsCard}>
        <StatTile
          icon="layers-outline"
          value={stats?.aktif ?? '—'}
          label="Berjalan"
          tone="primary"
        />
        <View style={styles.statDivider} />
        <StatTile
          icon="alert-circle-outline"
          value={stats?.terlambat ?? '—'}
          label="Terlambat"
          tone={stats?.terlambat > 0 ? 'danger' : 'neutral'}
        />
        <View style={styles.statDivider} />
        <StatTile
          icon="checkmark-done-outline"
          value={stats?.selesai ?? '—'}
          label="Selesai"
          tone="neutral"
        />
      </View>

      {stats?.denda_berjalan > 0 ? (
        <InlineNotice
          tone="danger"
          icon="wallet-outline"
          title={`Denda berjalan ${formatDenda(stats.denda_berjalan)}`}
          message="Denda bertambah setiap hari sampai alat dikembalikan."
          style={styles.notice}
        />
      ) : null}

      <View style={styles.segment}>
        {FILTERS.map((item) => {
          const active = filter === item.key;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => setFilter(item.key)}
              style={[styles.segmentItem, active && styles.segmentItemActive]}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loansRes.loading && !loansRes.data ? (
        <SkeletonList count={3} />
      ) : loansRes.error && !loansRes.data ? (
        <ErrorState error={loansRes.error} onRetry={() => loansRes.reload('refresh')} />
      ) : loans.length === 0 ? (
        <EmptyState {...emptyCopy} />
      ) : (
        <View style={styles.list}>
          {loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onPress={() => navigation.navigate('DetailPinjaman', { loanId: loan.id })}
            />
          ))}
        </View>
      )}

      <View style={styles.footerNote}>
        <Ionicons name="information-circle-outline" size={14} color={colors.faint} />
        <Text style={styles.footerText}>
          Denda dihitung otomatis saat alat dikembalikan.
        </Text>
      </View>
    </Screen>
  );
}

function formatDenda(value) {
  return `Rp${Number(value || 0).toLocaleString('id-ID')}`;
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 26,
    gap: 14,
  },
  header: { marginTop: 6 },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 13,
    paddingHorizontal: 6,
    ...shadows.soft,
  },
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  notice: { marginTop: -2 },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    padding: 4,
    gap: 3,
  },
  segmentItem: {
    flex: 1,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  segmentText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.muted,
  },
  segmentTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  list: { gap: 10 },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 4,
  },
  footerText: {
    ...text.tiny,
    fontSize: 10,
    color: colors.faint,
  },
});
