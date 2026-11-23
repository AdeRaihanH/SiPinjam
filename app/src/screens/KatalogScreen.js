import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import HeroGlow from '../components/HeroGlow';
import InlineNotice from '../components/InlineNotice';
import PageHeader from '../components/PageHeader';
import PopularCard from '../components/PopularCard';
import PressableScale from '../components/PressableScale';
import Reveal from '../components/Reveal';
import Screen from '../components/Screen';
import SearchBar from '../components/SearchBar';
import SectionTitle from '../components/SectionTitle';
import { ListSkeleton } from '../components/Skeleton';
import ToolCard from '../components/ToolCard';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useLoans } from '../hooks/useLoans';
import { usePopularTools } from '../hooks/usePopularTools';
import { useFocusRefetch } from '../hooks/useQuery';
import { useStats } from '../hooks/useStats';
import { useTools } from '../hooks/useTools';
import { formatTanggal, formatTanggalPanjang, namaDepan } from '../lib/format';
import { colors, gradients, layout, radius, shadows, type, weight } from '../theme/tokens';

function HeroStat({ value, label, alert = false }) {
  return (
    <View style={styles.heroStat}>
      <Text style={[styles.heroStatValue, alert && styles.heroStatAlert]}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function CategoryTile({ label, icon, selected, onPress }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      scaleTo={0.94}
      haptic={false}
      style={[styles.categoryTile, selected && styles.categoryTileActive]}
    >
      <View style={[styles.categoryIcon, selected && styles.categoryIconActive]}>
        <Ionicons
          name={icon || 'cube-outline'}
          size={19}
          color={selected ? colors.accent : colors.primary}
        />
      </View>
      <Text
        style={[styles.categoryLabel, selected && styles.categoryLabelActive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

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
            onPress={() => navigation.navigate('Scan')}
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

      <View style={styles.body}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari nama alat atau kode"
          style={styles.search}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
          style={styles.categoriesRail}
        >
          <CategoryTile
            label="Semua"
            icon="apps-outline"
            selected={!categoryId}
            onPress={() => setCategoryId(null)}
          />
          {categoriesQuery.data.map((category) => (
            <CategoryTile
              key={category.id}
              label={category.nama}
              icon={category.icon}
              selected={categoryId === category.id}
              onPress={() => setCategoryId(category.id)}
            />
          ))}
        </ScrollView>

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
  body: {
    paddingHorizontal: layout.screenPadding,
    marginTop: -28,
    gap: 16,
  },
  search: { zIndex: 2 },
  categoriesRail: { marginHorizontal: -layout.screenPadding },
  categories: { paddingHorizontal: layout.screenPadding, gap: 8, paddingRight: 24 },
  categoryTile: {
    width: 78,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 7,
  },
  categoryTileActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconActive: { backgroundColor: 'rgba(200,241,105,0.16)' },
  categoryLabel: {
    fontSize: 9.5,
    fontWeight: weight.semibold,
    color: colors.muted,
    textAlign: 'center',
  },
  categoryLabelActive: { color: colors.white, fontWeight: weight.bold },
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
