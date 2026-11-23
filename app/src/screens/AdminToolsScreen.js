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

import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import InlineNotice from '../components/InlineNotice';
import PressableScale from '../components/PressableScale';
import Screen from '../components/Screen';
import SearchBar from '../components/SearchBar';
import { ListSkeleton } from '../components/Skeleton';
import StackHeader from '../components/StackHeader';
import StockBadge from '../components/StockBadge';
import ToolPhoto from '../components/ToolPhoto';
import { toolsApi } from '../api/tools';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useFocusRefetch } from '../hooks/useQuery';
import { useTools } from '../hooks/useTools';
import { confirmAction } from '../lib/dialog';
import { colors, layout, radius, type, weight } from '../theme/tokens';

function ToolAdminRow({ tool, onEdit, onQr, onDelete, last }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <ToolPhoto tool={tool} width={54} height={54} />
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={2}>{tool.nama}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {tool.kode} / {tool.kategori?.nama || 'Alat laboratorium'}
        </Text>
        <StockBadge stok={tool.stok_tersedia} total={tool.stok_total} compact />
      </View>
      <View style={styles.actions}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`QR ${tool.kode}`}
          hitSlop={6}
          onPress={() => onQr(tool)}
          scaleTo={0.9}
          style={styles.action}
        >
          <Ionicons name="qr-code-outline" size={17} color={colors.primary} />
        </PressableScale>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`Edit ${tool.kode}`}
          hitSlop={6}
          onPress={() => onEdit(tool)}
          scaleTo={0.9}
          style={styles.action}
        >
          <Ionicons name="create-outline" size={17} color={colors.primary} />
        </PressableScale>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`Hapus ${tool.kode}`}
          hitSlop={6}
          onPress={() => onDelete(tool)}
          scaleTo={0.9}
          style={[styles.action, styles.actionDanger]}
        >
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
        </PressableScale>
      </View>
    </View>
  );
}

export default function AdminToolsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);
  const [message, setMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const query = useTools({ search: debouncedSearch, limit: 50 });
  const { refetch } = query;
  useFocusRefetch(refetch);

  const onRefresh = useCallback(() => {
    refetch('refresh');
  }, [refetch]);

  const handleDelete = useCallback((tool) => {
    confirmAction({
      title: 'Hapus alat?',
      message: `${tool.kode} - ${tool.nama}. Riwayat pinjaman yang sudah ada akan mencegah penghapusan.`,
      confirmLabel: 'Hapus',
      destructive: true,
      onConfirm: async () => {
        setActionError(null);
        setMessage(null);
        try {
          await toolsApi.remove(tool.id);
          setMessage(`${tool.kode} berhasil dihapus.`);
          refetch('refresh');
        } catch (error) {
          setActionError(error.message);
        }
      },
    });
  }, [refetch]);

  return (
    <Screen padded={false}>
      <StatusBar style="dark" />
      <StackHeader title="Kelola alat" subtitle="Admin / inventaris" />
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
        <View style={styles.intro}>
          <View style={styles.introTop}>
            <View style={styles.kickerRow}>
              <View style={styles.kickerDot} />
              <Text style={styles.kicker}>Admin · Inventaris</Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countPillValue}>{query.meta.total}</Text>
              <Text style={styles.countPillLabel}>alat</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Tambah alat baru, ubah data, atau hapus alat yang belum pernah dipinjam.
          </Text>
        </View>

        <Button
          title="Tambah alat"
          icon="add"
          onPress={() => navigation.navigate('AdminToolForm')}
        />

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari alat untuk dikelola"
        />

        {message ? (
          <InlineNotice tone="success" title={message} />
        ) : null}
        {actionError ? (
          <InlineNotice tone="danger" title="Aksi gagal" message={actionError} />
        ) : null}

        <View style={styles.listHead}>
          <Text style={styles.listTitle}>Daftar alat</Text>
        </View>

        {query.loading && !query.data.length ? (
          <ListSkeleton count={4} />
        ) : query.error && !query.data.length ? (
          <ErrorState error={query.error} onRetry={() => refetch('refresh')} />
        ) : query.data.length === 0 ? (
          <EmptyState
            icon="construct-outline"
            title="Belum ada alat"
            message="Tambahkan alat pertama untuk mulai mengelola inventaris."
            actionLabel="Tambah alat"
            onAction={() => navigation.navigate('AdminToolForm')}
          />
        ) : (
          <Card padded={false} style={styles.list}>
            {query.data.map((tool, index) => (
              <ToolAdminRow
                key={tool.id}
                tool={tool}
                last={index === query.data.length - 1}
                onEdit={(item) => navigation.navigate('AdminToolForm', { tool: item })}
                onQr={(item) => navigation.navigate('AdminToolQr', { tool: item })}
                onDelete={handleDelete}
              />
            ))}
          </Card>
        )}

        <InlineNotice
          tone="info"
          icon="qr-code-outline"
          title="QR otomatis"
          message="Setiap alat yang dibuat otomatis punya QR. Gunakan tombol QR pada baris alat untuk menyimpan PNG atau mencetak label."
        />
      </ScrollView>
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
  intro: { gap: 6, paddingVertical: 8 },
  introTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kickerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  kicker: {
    fontSize: type.xxs,
    fontWeight: weight.bold,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  countPillValue: { fontSize: type.xs, fontWeight: weight.bold, color: colors.accentInk },
  countPillLabel: { fontSize: 9, color: colors.accentInk },
  subtitle: { fontSize: type.xs, lineHeight: 19, color: colors.muted },
  listHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  listTitle: { fontSize: type.md, fontWeight: weight.bold, color: colors.text },
  list: { overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  copy: { flex: 1, gap: 3 },
  name: { fontSize: type.sm, lineHeight: 19, fontWeight: weight.bold, color: colors.text },
  meta: { fontSize: type.xs, color: colors.muted },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  action: {
    width: 31,
    height: 31,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDanger: { backgroundColor: colors.dangerSoft },
});
