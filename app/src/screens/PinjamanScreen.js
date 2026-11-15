import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoanRow from '../components/LoanRow';
import PageHeader from '../components/PageHeader';
import Screen from '../components/Screen';
import SegmentedControl from '../components/SegmentedControl';
import { ListSkeleton } from '../components/Skeleton';
import { useFocusRefetch } from '../hooks/useQuery';
import { useLoans } from '../hooks/useLoans';
import { useStats } from '../hooks/useStats';
import { colors, layout, type, weight } from '../theme/tokens';

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

export default function PinjamanScreen({ navigation }) {
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

  return (
    <Screen
      scroll
      padded={false}
      contentContainerStyle={styles.content}
      refreshControl={(
        <RefreshControl
          refreshing={loansQuery.refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      )}
    >
      <PageHeader
        eyebrow="Aktivitas"
        title="Pinjaman"
        subtitle="Pantau jadwal pengembalian dan denda."
        style={styles.header}
      />

      <View style={styles.summaryLine}>
        <Text style={styles.summaryText}>
          {loansQuery.meta.total} pinjaman {status === 'aktif' ? 'aktif' : status === 'selesai' ? 'selesai' : 'total'}
        </Text>
        {statsQuery.data?.terlambat > 0 ? (
          <Text style={styles.lateText}>{statsQuery.data.terlambat} terlambat</Text>
        ) : null}
      </View>

      <SegmentedControl options={OPTIONS} value={status} onChange={setStatus} />

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
          {loansQuery.data.map((loan) => (
            <LoanRow
              key={loan.id}
              loan={loan}
              onPress={() => navigation.navigate('DetailPinjaman', { loanId: loan.id })}
            />
          ))}
        </View>
      )}

      <Text style={styles.footer}>
        Denda Rp2.000 per hari dihitung saat alat dikembalikan.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 4,
    paddingBottom: 28,
    gap: 14,
  },
  header: { marginBottom: 2 },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryText: { fontSize: type.xs, color: colors.muted },
  lateText: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.danger },
  list: { gap: 10 },
  footer: {
    fontSize: type.xs,
    color: colors.faint,
    textAlign: 'center',
    marginTop: 2,
  },
});
