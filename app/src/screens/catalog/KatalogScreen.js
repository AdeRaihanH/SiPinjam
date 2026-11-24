import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import InlineNotice from '../../components/InlineNotice';
import PageHeader from '../../components/PageHeader';
import PressableScale from '../../components/PressableScale';
import Reveal from '../../components/Reveal';
import Screen from '../../components/Screen';
import SearchBar from '../../components/SearchBar';
import SectionTitle from '../../components/SectionTitle';
import { ListSkeleton } from '../../components/Skeleton';
import UserAvatar from '../../components/UserAvatar';
import { useAuth } from '../../hooks/useAuth';
import { useCategories } from '../../hooks/useCategories';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useLoans } from '../../hooks/useLoans';
import { usePopularTools } from '../../hooks/usePopularTools';
import { useFocusRefetch } from '../../hooks/useQuery';
import { useStats } from '../../hooks/useStats';
import { useTools } from '../../hooks/useTools';
import { formatTanggal, formatTanggalPanjang, namaDepan } from '../../lib/format';
import { colors, layout, radius, shadows, type, weight } from '../../theme/tokens';
import CatalogHero from './components/CatalogHero';
import CategoryRail from './components/CategoryRail';
import PopularCard from './components/PopularCard';
import ToolCard from './components/ToolCard';

export default function KatalogScreen({ navigation }) {
  const { member } = useAuth();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [categoryId, setCategoryId] = useState(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const categoriesQuery = useCategories();
  const statsQuery = useStats();
  const popularQuery = usePopularTools(5);
  const activeLoansQuery = useLoans('aktif', 3);
  const toolsQuery = useTools({
    search: debouncedSearch,
    categoryId,
    tersedia: onlyAvailable,
    limit: 20,
  });

  const { refetch: refetchTools } = toolsQuery;
  const { refetch: refetchStats } = statsQuery;
  const { refetch: refetchCategories } = categoriesQuery;
  const { refetch: refetchPopular } = popularQuery;
  const { refetch: refetchLoans } = activeLoansQuery;

  useFocusRefetch(refetchTools);
  useFocusRefetch(refetchStats);
  useFocusRefetch(refetchPopular);
  useFocusRefetch(refetchLoans);

  const tools = toolsQuery.data;
  const stats = statsQuery.data;
  const activeLoan = activeLoansQuery.data[0];
  const isAdmin = member?.role === 'admin';
  const hasFilter = Boolean(search || categoryId || onlyAvailable);

  const onRefresh = useCallback(() => {
    refetchTools('refresh');
    refetchStats('silent');
    refetchCategories('silent');
    refetchPopular('silent');
    refetchLoans('silent');
  }, [refetchTools, refetchStats, refetchCategories, refetchPopular, refetchLoans]);

  const resetFilter = () => {
    setSearch('');
    setCategoryId(null);
    setOnlyAvailable(false);
  };

  const lateLoan = activeLoan?.status_efektif === 'terlambat';

  return (
    <Screen
      scroll
      padded={false}
      edges={[]}
      contentContainerStyle={styles.content}
      refreshControl={(
        <RefreshControl
          refreshing={toolsQuery.refreshing}
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
          eyebrow="SiPinjam · Laboratorium Komputer"
          title={`Halo, ${namaDepan(member?.nama)}`}
          subtitle={formatTanggalPanjang(new Date())}
          right={(
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Buka profil"
              onPress={() => navigation.navigate('Profil')}
              scaleTo={0.92}
              style={styles.avatarWrap}
            >
              <UserAvatar nama={member?.nama} size={44} />
              <View style={styles.avatarDot} />
            </PressableScale>
          )}
        />
      </View>

      <CatalogHero stats={stats} onScan={() => navigation.navigate('Scan')} />

      <View style={styles.body}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari nama alat atau kode"
          style={styles.search}
        />

        <CategoryRail
          categories={categoriesQuery.data}
          selectedId={categoryId}
          onSelect={setCategoryId}
        />

        {stats?.terlambat > 0 ? (
          <InlineNotice
            tone="danger"
            title={`${stats.terlambat} pinjaman terlambat`}
            message="Selesaikan pinjaman lewat tenggat sebelum mengajukan pinjaman baru."
            actionLabel="Lihat pinjaman"
            onAction={() => navigation.navigate('Pinjaman')}
          />
        ) : null}

        {activeLoan ? (
          <PressableScale
            accessibilityRole="button"
            onPress={() => navigation.navigate('DetailPinjaman', { loanId: activeLoan.id })}
            scaleTo={0.985}
            style={[styles.activeCard, lateLoan && styles.activeCardLate]}
          >
            <View style={[styles.activeIcon, lateLoan && styles.activeIconLate]}>
              <Ionicons
                name={lateLoan ? 'alarm-outline' : 'swap-horizontal-outline'}
                size={19}
                color={lateLoan ? colors.danger : colors.primary}
              />
            </View>
            <View style={styles.activeCopy}>
              <Text style={[styles.activeEyebrow, lateLoan && styles.activeEyebrowLate]}>
                {lateLoan ? 'Perlu dikembalikan' : 'Pinjaman aktif'}
              </Text>
              <Text style={styles.activeTitle} numberOfLines={1}>{activeLoan.ringkasan_alat}</Text>
              <Text style={[styles.activeMeta, lateLoan && styles.activeMetaLate]}>
                Jatuh tempo {formatTanggal(activeLoan.tanggal_kembali_rencana)}
              </Text>
              {isAdmin && activeLoan.member ? (
                <Text style={styles.activeBorrower} numberOfLines={1}>
                  Peminjam: {activeLoan.member.nama} · {activeLoan.member.nim}
                </Text>
              ) : null}
            </View>
            <View style={[styles.activeArrow, lateLoan && styles.activeArrowLate]}>
              <Ionicons name="arrow-forward" size={15} color={lateLoan ? colors.danger : colors.primary} />
            </View>
          </PressableScale>
        ) : null}

        {!hasFilter && popularQuery.data.length > 0 ? (
          <View style={styles.section}>
            <SectionTitle
              title="Sering dipinjam"
              subtitle="Alat yang paling banyak dipakai praktikan"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularRail}
              style={styles.popularScroll}
            >
              {popularQuery.data.map((tool) => (
                <PopularCard
                  key={tool.id}
                  tool={tool}
                  onPress={() => navigation.navigate('DetailAlat', { toolId: tool.id, tool })}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.listHead}>
          <View style={styles.listCopy}>
            <Text style={styles.listTitle}>Katalog alat</Text>
            <Text style={styles.listSub}>{toolsQuery.meta.total} alat ditemukan</Text>
          </View>
          {hasFilter ? (
            <PressableScale
              accessibilityRole="button"
              onPress={resetFilter}
              scaleTo={0.94}
              style={styles.reset}
            >
              <Ionicons name="refresh" size={12} color={colors.primary} />
              <Text style={styles.resetText}>Reset</Text>
            </PressableScale>
          ) : null}
          <PressableScale
            accessibilityRole="checkbox"
            accessibilityState={{ checked: onlyAvailable }}
            onPress={() => setOnlyAvailable((value) => !value)}
            scaleTo={0.95}
            style={[styles.available, onlyAvailable && styles.availableOn]}
          >
            <Ionicons
              name={onlyAvailable ? 'checkmark-circle' : 'ellipse-outline'}
              size={15}
              color={onlyAvailable ? colors.accentInk : colors.muted}
            />
            <Text style={[styles.availableText, onlyAvailable && styles.availableTextOn]}>
              Tersedia
            </Text>
          </PressableScale>
        </View>

        {toolsQuery.loading && !toolsQuery.data.length ? (
          <ListSkeleton count={4} />
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
          <View style={styles.grid}>
            {tools.map((tool, index) => (
              <Reveal key={tool.id} delay={Math.min(index, 8) * 30} style={styles.gridCell}>
                <ToolCard
                  tool={tool}
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('DetailAlat', { toolId: tool.id, tool })}
                />
              </Reveal>
            ))}
          </View>
        )}

        {toolsQuery.error && toolsQuery.data.length ? (
          <InlineNotice
            tone="warning"
            title="Data mungkin belum terbaru"
            message={toolsQuery.error.message}
            actionLabel="Muat ulang"
            onAction={() => refetchTools('refresh')}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 120 },
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 16,
  },
  avatarWrap: { position: 'relative' },
  avatarDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  body: {
    paddingHorizontal: layout.screenPadding,
    marginTop: -28,
    gap: 16,
  },
  search: { zIndex: 2 },
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    ...shadows.card,
  },
  activeCardLate: { borderColor: '#F1C9C7', backgroundColor: '#FFF9F8' },
  activeIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconLate: { backgroundColor: colors.dangerSoft },
  activeCopy: { flex: 1, gap: 2 },
  activeEyebrow: {
    fontSize: 9,
    fontWeight: weight.bold,
    color: colors.accentInk,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  activeEyebrowLate: { color: colors.danger },
  activeTitle: { fontSize: type.sm, fontWeight: weight.bold, color: colors.text },
  activeMeta: { fontSize: type.xxs, color: colors.muted },
  activeMetaLate: { color: colors.danger, fontWeight: weight.semibold },
  activeBorrower: { fontSize: 9.5, color: colors.faint, marginTop: 1 },
  activeArrow: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeArrowLate: { backgroundColor: colors.dangerSoft },
  section: { gap: 12 },
  popularScroll: { marginHorizontal: -layout.screenPadding },
  popularRail: { paddingHorizontal: layout.screenPadding, gap: 10, paddingRight: 24 },
  listHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  listCopy: { flex: 1, gap: 1 },
  listTitle: { fontSize: 17, fontWeight: weight.bold, color: colors.text, letterSpacing: -0.3 },
  listSub: { fontSize: type.xs, color: colors.muted },
  reset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  resetText: { fontSize: 10, fontWeight: weight.bold, color: colors.primary },
  available: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  availableOn: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  availableText: { fontSize: 10.5, color: colors.muted, fontWeight: weight.semibold },
  availableTextOn: { color: colors.accentInk, fontWeight: weight.bold },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCell: { width: '48%' },
  gridCard: { width: '100%' },
});
