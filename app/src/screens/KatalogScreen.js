import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Card from '../components/Card';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import InlineNotice from '../components/InlineNotice';
import PageHeader from '../components/PageHeader';
import Screen from '../components/Screen';
import SearchBar from '../components/SearchBar';
import { ListSkeleton } from '../components/Skeleton';
import ToolRow from '../components/ToolRow';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useFocusRefetch } from '../hooks/useQuery';
import { useStats } from '../hooks/useStats';
import { useTools } from '../hooks/useTools';
import { formatTanggalPanjang, namaDepan } from '../lib/format';
import { colors, layout, radius, type, weight } from '../theme/tokens';

function Metric({ value, label, tone = colors.text, last = false }) {
  return (
    <View style={[styles.metric, !last && styles.metricBorder]}>
      <Text style={[styles.metricValue, { color: tone }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export default function KatalogScreen({ navigation }) {
  const { member } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [categoryId, setCategoryId] = useState(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const categoriesQuery = useCategories();
  const statsQuery = useStats();
  const toolsQuery = useTools({
    search: debouncedSearch,
    categoryId,
    tersedia: onlyAvailable,
    limit: 20,
  });

  const { refetch: refetchTools } = toolsQuery;
  const { refetch: refetchStats } = statsQuery;
  const { refetch: refetchCategories } = categoriesQuery;

  useFocusRefetch(refetchTools);
  useFocusRefetch(refetchStats);

  const tools = toolsQuery.data;
  const stats = statsQuery.data;
  const hasFilter = Boolean(search || categoryId || onlyAvailable);

  const onRefresh = useCallback(() => {
    refetchTools('refresh');
    refetchStats('silent');
    refetchCategories('silent');
  }, [refetchTools, refetchStats, refetchCategories]);

  const resetFilter = () => {
    setSearch('');
    setCategoryId(null);
    setOnlyAvailable(false);
  };

  return (
    <Screen
      scroll
      padded={false}
      contentContainerStyle={styles.content}
      refreshControl={(
        <RefreshControl
          refreshing={toolsQuery.refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      )}
    >
      <PageHeader
        eyebrow="Laboratorium Komputer"
        title={`Halo, ${namaDepan(member?.nama)}`}
        subtitle={formatTanggalPanjang(new Date())}
        right={(
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buka profil"
            onPress={() => navigation.navigate('Profil')}
          >
            <UserAvatar nama={member?.nama} size={42} />
          </Pressable>
        )}
      />

      <Card
        style={styles.summary}
        onPress={() => navigation.navigate('Pinjaman')}
      >
        <View style={styles.summaryHead}>
          <Text style={styles.summaryTitle}>Ringkasan laboratorium</Text>
          <Ionicons name="chevron-forward" size={15} color={colors.faint} />
        </View>
        <View style={styles.summaryRow}>
          <Metric value={stats?.tersedia_unit ?? '—'} label="Tersedia" />
          <Metric value={stats?.dipinjam_unit ?? '—'} label="Dipinjam" />
          <Metric
            value={stats?.terlambat ?? '—'}
            label="Terlambat"
            tone={stats?.terlambat > 0 ? colors.danger : colors.text}
            last
          />
        </View>
      </Card>

      {stats?.terlambat > 0 ? (
        <InlineNotice
          tone="danger"
          title={`${stats.terlambat} pinjaman terlambat`}
          message="Selesaikan pinjaman yang lewat tenggat sebelum mengajukan pinjaman baru."
          actionLabel="Lihat pinjaman"
          onAction={() => navigation.navigate('Pinjaman')}
          style={styles.notice}
        />
      ) : null}

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Cari nama alat atau kode"
        style={styles.search}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsScroll}
      >
        <Chip label="Semua" selected={!categoryId} onPress={() => setCategoryId(null)} />
        {categoriesQuery.data.map((category) => (
          <Chip
            key={category.id}
            label={category.nama}
            icon={category.icon}
            selected={categoryId === category.id}
            onPress={() => setCategoryId(category.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.listHead}>
        <View style={styles.listCopy}>
          <Text style={styles.listTitle}>Daftar alat</Text>
          <Text style={styles.listSub}>{toolsQuery.meta.total} alat ditemukan</Text>
        </View>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: onlyAvailable }}
          onPress={() => setOnlyAvailable((value) => !value)}
          style={styles.available}
        >
          <View style={[styles.checkbox, onlyAvailable && styles.checkboxOn]}>
            {onlyAvailable ? <Ionicons name="checkmark" size={11} color={colors.white} /> : null}
          </View>
          <Text style={[styles.availableText, onlyAvailable && styles.availableTextOn]}>
            Tersedia
          </Text>
        </Pressable>
      </View>

      {toolsQuery.loading && !toolsQuery.data.length ? (
        <ListSkeleton count={5} />
      ) : toolsQuery.error && !toolsQuery.data.length ? (
        <ErrorState error={toolsQuery.error} onRetry={() => refetchTools('refresh')} />
      ) : tools.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Alat tidak ditemukan"
          message={hasFilter ? 'Coba kata kunci lain atau hapus filter yang aktif.' : 'Belum ada alat di laboratorium.'}
          actionLabel={hasFilter ? 'Reset filter' : undefined}
          onAction={hasFilter ? resetFilter : undefined}
        />
      ) : (
        <Card padded={false} style={styles.list}>
          {tools.map((tool, index) => (
            <ToolRow
              key={tool.id}
              tool={tool}
              last={index === tools.length - 1}
              onPress={() => navigation.navigate('DetailAlat', { toolId: tool.id, tool })}
            />
          ))}
        </Card>
      )}

      {toolsQuery.error && toolsQuery.data.length ? (
        <InlineNotice
          tone="warning"
          title="Data mungkin belum terbaru"
          message={toolsQuery.error.message}
          actionLabel="Muat ulang"
          onAction={() => refetchTools('refresh')}
          style={styles.notice}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 28,
    gap: 14,
    paddingTop: 4,
  },
  summary: { paddingVertical: 14 },
  summaryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryTitle: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.muted },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  metric: { flex: 1, gap: 1, paddingHorizontal: 2 },
  metricBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  metricValue: { fontSize: type.lg, fontWeight: weight.bold },
  metricLabel: { fontSize: type.xs, color: colors.muted },
  notice: { marginTop: -2 },
  search: { marginTop: 2 },
  chipsScroll: { marginHorizontal: -layout.screenPadding },
  chips: { paddingHorizontal: layout.screenPadding, gap: 8 },
  listHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  listCopy: { flex: 1, gap: 1 },
  listTitle: { fontSize: type.md, fontWeight: weight.bold, color: colors.text },
  listSub: { fontSize: type.xs, color: colors.muted },
  available: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 32 },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  availableText: { fontSize: type.xs, color: colors.muted },
  availableTextOn: { color: colors.primary, fontWeight: weight.semibold },
  list: { marginTop: -2 },
});
