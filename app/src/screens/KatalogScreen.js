import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import InlineNotice from '../components/InlineNotice';
import PageHeader from '../components/PageHeader';
import Screen from '../components/Screen';
import SearchBar from '../components/SearchBar';
import { SkeletonList } from '../components/Skeleton';
import ToolCard from '../components/ToolCard';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useFocusReload, useResource } from '../hooks/useResource';
import { api } from '../services/api';
import { colors, radius, shadows, text } from '../theme';
import { formatTanggalPanjang, namaDepan } from '../utils/format';

export default function KatalogScreen({ navigation }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const [categoryId, setCategoryId] = useState(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const loadCategories = useCallback(() => api.get('/categories'), []);
  const categoriesRes = useResource(loadCategories);

  const loadStats = useCallback(() => api.get('/stats/summary'), []);
  const statsRes = useResource(loadStats);

  const loadTools = useCallback(() => {
    const params = { limit: 50 };
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (categoryId) params.category_id = categoryId;
    if (onlyAvailable) params.tersedia = 1;
    return api.getList('/tools', { params });
  }, [debouncedSearch, categoryId, onlyAvailable]);
  const toolsRes = useResource(loadTools);

  const { reload: reloadTools } = toolsRes;
  const { reload: reloadStats } = statsRes;
  const { reload: reloadCategories } = categoriesRes;

  useFocusReload(reloadTools);
  useFocusReload(reloadStats);

  const tools = toolsRes.data?.data || [];
  const stats = statsRes.data;
  const categories = categoriesRes.data || [];
  const total = toolsRes.data?.meta?.total ?? tools.length;
  const hasFilter = Boolean(search || categoryId || onlyAvailable);

  const onRefresh = useCallback(() => {
    reloadTools('refresh');
    reloadStats('silent');
    reloadCategories('silent');
  }, [reloadTools, reloadStats, reloadCategories]);

  const resetFilters = () => {
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
          refreshing={toolsRes.refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      )}
    >
      <PageHeader
        eyebrow="Laboratorium Komputer"
        title={`Halo, ${namaDepan(user?.nama)}`}
        subtitle={formatTanggalPanjang(new Date())}
        right={(
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buka profil"
            onPress={() => navigation.navigate('Profil')}
          >
            <UserAvatar nama={user?.nama} size={46} />
          </Pressable>
        )}
        style={styles.header}
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Lihat ringkasan pinjaman"
        onPress={() => navigation.navigate('Pinjaman')}
      >
        <LinearGradient
          colors={['#073F34', '#0D6B58']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summary}
        >
          <View style={styles.summaryRing} pointerEvents="none" />
          <View style={styles.summaryTop}>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryLabel}>RINGKASAN LABORATORIUM</Text>
              <Text style={styles.summaryValue}>
                {stats ? `${stats.alat.tersedia_unit} unit` : '—'}
                <Text style={styles.summaryValueSub}>  siap dipinjam</Text>
              </Text>
            </View>
            <View style={styles.summaryArrow}>
              <Ionicons name="arrow-forward" size={17} color={colors.white} />
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{stats?.aktif ?? '—'}</Text>
              <Text style={styles.summaryStatLabel}>Sedang dipinjam</Text>
            </View>
            <View style={styles.summaryStatLine} />
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryStatValue, stats?.terlambat > 0 && styles.summaryLate]}>
                {stats?.terlambat ?? '—'}
              </Text>
              <Text style={styles.summaryStatLabel}>Terlambat</Text>
            </View>
            <View style={styles.summaryStatLine} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{stats?.selesai ?? '—'}</Text>
              <Text style={styles.summaryStatLabel}>Selesai</Text>
            </View>
          </View>
        </LinearGradient>
      </Pressable>

      {stats?.terlambat > 0 ? (
        <InlineNotice
          tone="danger"
          icon="time"
          title={`${stats.terlambat} pinjaman terlambat`}
          message="Selesaikan pinjaman yang terlambat sebelum mengajukan pinjaman baru."
          actionLabel="Lihat pinjaman"
          onAction={() => navigation.navigate('Pinjaman')}
          style={styles.notice}
        />
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsScroll}
      >
        <Chip
          label="Semua"
          icon="apps-outline"
          selected={!categoryId}
          onPress={() => setCategoryId(null)}
        />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.nama}
            icon={category.icon}
            selected={categoryId === category.id}
            onPress={() => setCategoryId(category.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.catalogHead}>
        <View style={styles.catalogCopy}>
          <Text style={styles.catalogTitle}>Katalog alat</Text>
          <Text style={styles.catalogSub}>
            {total} alat ditemukan{categoryId ? ' di kategori ini' : ''}
          </Text>
        </View>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: onlyAvailable }}
          onPress={() => setOnlyAvailable((value) => !value)}
          style={[styles.availableToggle, onlyAvailable && styles.availableToggleOn]}
        >
          <View style={[styles.checkbox, onlyAvailable && styles.checkboxOn]}>
            {onlyAvailable ? (
              <Ionicons name="checkmark" size={11} color={colors.white} />
            ) : null}
          </View>
          <Text style={[styles.availableText, onlyAvailable && styles.availableTextOn]}>
            Tersedia
          </Text>
        </Pressable>
      </View>

      {toolsRes.loading && !toolsRes.data ? (
        <SkeletonList count={4} />
      ) : toolsRes.error && !toolsRes.data ? (
        <ErrorState error={toolsRes.error} onRetry={() => toolsRes.reload('refresh')} />
      ) : tools.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Alat tidak ditemukan"
          message={
            hasFilter
              ? 'Coba kata kunci lain atau hapus filter yang sedang aktif.'
              : 'Belum ada alat yang terdaftar di laboratorium.'
          }
          actionLabel={hasFilter ? 'Reset filter' : undefined}
          onAction={hasFilter ? resetFilters : undefined}
        />
      ) : (
        <View style={styles.list}>
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onPress={() => navigation.navigate('DetailAlat', { toolId: tool.id, tool })}
            />
          ))}
          {toolsRes.error ? (
            <InlineNotice
              tone="warn"
              title="Data mungkin belum terbaru"
              message={toolsRes.error.message}
              actionLabel="Muat ulang"
              onAction={() => toolsRes.reload('refresh')}
            />
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 26,
  },
  header: { marginTop: 6 },
  search: { marginTop: 18 },
  summary: {
    marginTop: 14,
    borderRadius: radius.xl,
    padding: 17,
    overflow: 'hidden',
    ...shadows.card,
  },
  summaryRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    right: -54,
    top: -58,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryCopy: { flex: 1, gap: 4 },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.55)',
  },
  summaryValue: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  summaryValueSub: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0,
  },
  summaryArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginVertical: 13,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStat: { flex: 1, gap: 1 },
  summaryStatValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.white,
  },
  summaryLate: { color: '#FFB4A8' },
  summaryStatLabel: {
    fontSize: 9.5,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
  },
  summaryStatLine: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginHorizontal: 10,
  },
  notice: { marginTop: 12 },
  chipsScroll: {
    marginTop: 18,
    marginHorizontal: -20,
  },
  chips: {
    paddingHorizontal: 20,
    gap: 8,
  },
  catalogHead: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catalogCopy: { flex: 1, gap: 2 },
  catalogTitle: {
    ...text.h3,
    fontSize: 17,
  },
  catalogSub: {
    fontSize: 11,
    color: colors.muted,
  },
  availableToggle: {
    height: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availableToggleOn: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primarySoft,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  availableText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.body,
  },
  availableTextOn: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  list: { gap: 10 },
});
