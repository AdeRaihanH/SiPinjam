import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Card from '../components/Card';
import ErrorState from '../components/ErrorState';
import InlineNotice from '../components/InlineNotice';
import Screen from '../components/Screen';
import SectionTitle from '../components/SectionTitle';
import { Skeleton } from '../components/Skeleton';
import StackHeader from '../components/StackHeader';
import StatusPill from '../components/StatusPill';
import StockBadge from '../components/StockBadge';
import ToolPhoto from '../components/ToolPhoto';
import { useToolDetail } from '../hooks/useToolDetail';
import { formatRupiah, formatTanggal, labelKondisi } from '../lib/format';
import { colors, layout, radius, shadows, text, type, weight } from '../theme/tokens';

function HistoryRow({ item, last }) {
  return (
    <View style={[styles.historyRow, !last && styles.rowBorder]}>
      <View style={styles.historyIcon}>
        <Ionicons name="swap-horizontal" size={14} color={colors.primary} />
      </View>
      <View style={styles.historyCopy}>
        <Text style={styles.historyCode}>{item.kode}</Text>
        <Text style={styles.historyMeta} numberOfLines={1}>
          {item.member_nama || 'Praktikan'} · {formatTanggal(item.tanggal_pinjam)}
        </Text>
      </View>
      <View style={styles.historyRight}>
        <StatusPill status={item.status_efektif} />
        <Text style={styles.historyDate}>
          {formatTanggal(item.tanggal_kembali_rencana)}
        </Text>
      </View>
    </View>
  );
}

function InfoTile({ icon, label, value, last = false }) {
  return (
    <View style={[styles.infoTile, !last && styles.infoDivider]}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={15} color={colors.primary} />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

export default function DetailAlatScreen({ navigation, route }) {
  const { toolId, tool: initialTool } = route.params || {};
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const query = useToolDetail(toolId, initialTool || null);
  const { refetch } = query;
  const tool = query.data;
  const stok = Number(tool?.stok_tersedia ?? 0);
  const habis = stok <= 0;

  const onRefresh = useCallback(() => refetch('refresh'), [refetch]);

  if (query.loading && !tool) {
    return (
      <Screen padded={false}>
        <StackHeader title="Detail alat" subtitle="Memuat..." />
        <View style={styles.loading}>
          <Skeleton height={260} radius={20} />
          <Skeleton height={26} width="72%" />
          <Skeleton height={16} width="48%" />
          <Skeleton height={104} radius={20} />
        </View>
      </Screen>
    );
  }

  if (query.error && !tool) {
    return (
      <Screen padded={false}>
        <StackHeader title="Detail alat" />
        <ErrorState error={query.error} onRetry={() => query.refetch('refresh')} />
      </Screen>
    );
  }

  if (!tool) return null;

  return (
    <Screen padded={false} edges={[]}>
      {isFocused ? <StatusBar style="light" /> : null}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={(
          <RefreshControl
            refreshing={query.refreshing}
            onRefresh={onRefresh}
            tintColor={colors.white}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        )}
      >
        <View style={styles.hero}>
          <ToolPhoto tool={tool} width="100%" height={320} rounded={0} />
          <LinearGradient
            colors={['rgba(7,23,16,0.7)', 'rgba(7,23,16,0.02)', 'rgba(7,23,16,0.82)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={['top']} style={styles.heroHeader}>
            <StackHeader
              tone="light"
              title="Detail alat"
              subtitle={tool.kode}
              onBack={() => navigation.goBack()}
            />
          </SafeAreaView>
          <View style={styles.heroBadges}>
            <StockBadge stok={stok} total={tool.stok_total} />
            <View style={styles.conditionPill}>
              <Ionicons name="shield-checkmark-outline" size={12} color={colors.white} />
              <Text style={styles.conditionText}>{labelKondisi(tool.kondisi)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sheet}>
          <View style={styles.heading}>
            <Text style={styles.title}>{tool.nama}</Text>
            <Text style={styles.meta}>
              {tool.kode} · {tool.kategori?.nama || 'Alat laboratorium'}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <InfoTile
              icon="cube-outline"
              label="Tersedia"
              value={`${stok}/${tool.stok_total}`}
            />
            <InfoTile
              icon="shield-checkmark-outline"
              label="Kondisi"
              value={labelKondisi(tool.kondisi)}
            />
            <InfoTile
              icon="pricetag-outline"
              label="Kategori"
              value={tool.kategori?.nama || '-'}
              last
            />
          </View>

          <View style={styles.section}>
            <SectionTitle title="Deskripsi" />
            <Text style={styles.description}>
              {tool.deskripsi || 'Belum ada deskripsi untuk alat ini.'}
            </Text>
          </View>

          <View style={styles.section}>
            <SectionTitle
              title="Riwayat peminjaman"
              subtitle="Lima peminjaman terakhir"
            />
            <Card padded={false}>
              {tool.riwayat?.length ? (
                tool.riwayat.map((item, index) => (
                  <HistoryRow
                    key={item.kode}
                    item={item}
                    last={index === tool.riwayat.length - 1}
                  />
                ))
              ) : (
                <Text style={styles.emptyHistory}>Belum pernah dipinjam.</Text>
              )}
            </Card>
          </View>

          <InlineNotice
            tone="info"
            icon="information-circle"
            title="Ketentuan peminjaman"
            message={`Maksimal 3 hari dan 3 jenis alat per transaksi. Denda ${formatRupiah(2000)} per hari keterlambatan.`}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.footerCopy}>
          <Text style={styles.footerLabel}>Ketersediaan</Text>
          <Text style={[styles.footerValue, habis && { color: colors.danger }]}>
            {habis ? 'Stok habis' : `${stok} unit`}
          </Text>
        </View>
        <Button
          title={habis ? 'Stok habis' : 'Pinjam alat'}
          iconRight={habis ? undefined : 'arrow-forward'}
          disabled={habis}
          onPress={() => navigation.navigate('FormPinjam', { tool })}
          style={styles.footerButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingHorizontal: layout.screenPadding,
    gap: 12,
  },
  content: { paddingBottom: 24 },
  hero: { height: 320, backgroundColor: colors.primaryDeep },
  heroHeader: { position: 'absolute', top: 0, left: 0, right: 0 },
  heroBadges: {
    position: 'absolute',
    left: layout.screenPadding,
    right: layout.screenPadding,
    bottom: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conditionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 25,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  conditionText: { fontSize: type.xxs, fontWeight: weight.semibold, color: colors.white },
  sheet: {
    marginTop: -28,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 24,
    paddingBottom: 26,
    gap: 20,
  },
  heading: { gap: 4 },
  title: { ...text.h2, fontSize: 24, lineHeight: 31, letterSpacing: -0.6 },
  meta: { fontSize: type.xs, color: colors.muted },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    ...shadows.card,
  },
  infoTile: { flex: 1, alignItems: 'center', gap: 3, paddingHorizontal: 6 },
  infoDivider: { borderRightWidth: 1, borderRightColor: colors.border },
  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: weight.bold,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: type.xs,
    fontWeight: weight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  section: { gap: 10 },
  description: { fontSize: type.sm, lineHeight: 22, color: colors.muted },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCopy: { flex: 1, gap: 2 },
  historyCode: { fontSize: type.xxs, fontWeight: weight.bold, color: colors.text, letterSpacing: 0.4 },
  historyMeta: { fontSize: type.xs, color: colors.muted },
  historyRight: { alignItems: 'flex-end', gap: 3 },
  historyDate: { fontSize: type.xxs, color: colors.faint },
  emptyHistory: {
    padding: 16,
    fontSize: type.xs,
    color: colors.muted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.sheet,
    shadowOpacity: 0.04,
  },
  footerCopy: { width: 92, gap: 1 },
  footerLabel: { fontSize: type.xxs, color: colors.muted },
  footerValue: { fontSize: type.md, fontWeight: weight.heavy, color: colors.text },
  footerButton: { flex: 1 },
});
