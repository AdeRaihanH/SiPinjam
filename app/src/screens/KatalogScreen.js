import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Card from '../components/Card';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import HeroGlow from '../components/HeroGlow';
import InlineNotice from '../components/InlineNotice';
import PageHeader from '../components/PageHeader';
import PressableScale from '../components/PressableScale';
import Reveal from '../components/Reveal';
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
import { colors, gradients, layout, radius, type, weight } from '../theme/tokens';

function StatTile({ value, label, icon, gold = false }) {
  return (
    <View style={styles.statTile}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={13} color={gold ? colors.gold : colors.accent} />
      </View>
      <Text style={[styles.statValue, gold && styles.statValueGold]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function KatalogScreen({ navigation }) {
  const { member } = useAuth();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
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
      edges={[]}
      contentContainerStyle={styles.content}
      refreshControl={(
        <RefreshControl
          refreshing={toolsQuery.refreshing}
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
          eyebrow="Laboratorium Komputer"
          title={`Halo, ${namaDepan(member?.nama)}`}
          subtitle={formatTanggalPanjang(new Date())}
          right={(
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Buka profil"
              onPress={() => navigation.navigate('Profil')}
              scaleTo={0.92}
              style={styles.avatarRing}
            >
              <UserAvatar nama={member?.nama} size={42} inverted />
            </PressableScale>
          )}
        />

        <Reveal delay={90}>
          <View style={styles.statsRow}>
            <StatTile
              value={stats?.tersedia_unit ?? '—'}
              label="Tersedia"
              icon="checkmark-circle-outline"
            />
            <StatTile
              value={stats?.dipinjam_unit ?? '—'}
              label="Dipinjam"
              icon="swap-horizontal-outline"
            />
            <StatTile
              value={stats?.terlambat ?? '—'}
              label="Terlambat"
              icon="alarm-outline"
              gold
            />
          </View>
        </Reveal>
      </LinearGradient>

      <View style={styles.body}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari nama alat atau kode"
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

        {stats?.terlambat > 0 ? (
          <InlineNotice
            tone="danger"
            title={`${stats.terlambat} pinjaman terlambat`}
            message="Selesaikan pinjaman yang lewat tenggat sebelum mengajukan pinjaman baru."
            actionLabel="Lihat pinjaman"
            onAction={() => navigation.navigate('Pinjaman')}
          />
        ) : null}

        <View style={styles.listHead}>
          <View style={styles.listCopy}>
            <Text style={styles.listTitle}>Daftar alat</Text>
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
              <Reveal key={tool.id} delay={Math.min(index, 8) * 35}>
                <ToolRow
                  tool={tool}
                  last={index === tools.length - 1}
                  onPress={() => navigation.navigate('DetailAlat', { toolId: tool.id, tool })}
                />
              </Reveal>
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
          />
        ) : null}
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
  avatarRing: {
    padding: 2,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.32)',
  },
  statsRow: { flexDirection: 'row', gap: 8 },
  statTile: {
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
  chipsScroll: { marginHorizontal: -layout.screenPadding },
  chips: { paddingHorizontal: layout.screenPadding, gap: 8 },
  listHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  listCopy: { flex: 1, gap: 1 },
  listTitle: { fontSize: type.md, fontWeight: weight.bold, color: colors.text, letterSpacing: -0.2 },
  listSub: { fontSize: type.xs, color: colors.muted },
  reset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 28,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  resetText: { fontSize: type.xxs, fontWeight: weight.bold, color: colors.primary },
  available: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 32 },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  availableText: { fontSize: type.xs, color: colors.muted },
  availableTextOn: { color: colors.primary, fontWeight: weight.semibold },
  list: { overflow: 'hidden' },
});
