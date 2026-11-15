import { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function DetailAlatScreen({ navigation, route }) {
  const { toolId, tool: initialTool } = route.params || {};
  const insets = useSafeAreaInsets();
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
          <Skeleton height={210} radius={16} />
          <Skeleton height={26} width="72%" />
          <Skeleton height={16} width="48%" />
          <Skeleton height={100} radius={16} />
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
    <Screen padded={false}>
      <StackHeader title="Detail alat" subtitle={tool.kode} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={(
          <RefreshControl
            refreshing={query.refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        )}
      >
        <ToolPhoto
          tool={tool}
          width="100%"
          height={210}
          rounded={radius.lg}
          style={styles.photo}
        />

        <View style={styles.heading}>
          <Text style={styles.title}>{tool.nama}</Text>
          <Text style={styles.meta}>
            {tool.kode} · {tool.kategori?.nama || 'Alat laboratorium'}
          </Text>
          <View style={styles.badges}>
            <StockBadge stok={stok} total={tool.stok_total} />
            <Text style={styles.condition}>{labelKondisi(tool.kondisi)}</Text>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stok</Text>
            <Text style={styles.infoValue}>{stok} dari {tool.stok_total} unit</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kondisi</Text>
            <Text style={styles.infoValue}>{labelKondisi(tool.kondisi)}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Kategori</Text>
            <Text style={styles.infoValue}>{tool.kategori?.nama || '-'}</Text>
          </View>
        </Card>

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
          icon={habis ? undefined : 'arrow-forward'}
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
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 24,
    gap: 18,
  },
  photo: { width: '100%', height: 210 },
  heading: { gap: 4 },
  title: { ...text.h2 },
  meta: { fontSize: type.xs, color: colors.muted },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  condition: { fontSize: type.xs, color: colors.muted },
  infoCard: { paddingVertical: 8 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { fontSize: type.sm, color: colors.muted },
  infoValue: { fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  section: { gap: 8 },
  description: { fontSize: type.sm, lineHeight: 21, color: colors.text },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  historyCopy: { flex: 1, gap: 2 },
  historyCode: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.text },
  historyMeta: { fontSize: type.xs, color: colors.muted },
  historyRight: { alignItems: 'flex-end', gap: 3 },
  historyDate: { fontSize: type.xs, color: colors.faint },
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
  footerLabel: { fontSize: type.xs, color: colors.muted },
  footerValue: { fontSize: type.md, fontWeight: weight.bold, color: colors.text },
  footerButton: { flex: 1 },
});
