import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import PageHeader from '../components/PageHeader';
import PressableScale from '../components/PressableScale';
import Screen from '../components/Screen';
import SegmentedControl from '../components/SegmentedControl';
import { Skeleton } from '../components/Skeleton';
import { notificationsApi } from '../api/notifications';
import { useNotificationBadge } from '../context/NotificationContext';
import { useNotifications } from '../hooks/useNotifications';
import { useFocusRefetch } from '../hooks/useQuery';
import { waktuLalu } from '../lib/format';
import { colors, layout, radius, shadows, type, weight } from '../theme/tokens';

const TIPE = {
  jatuh_tempo: { icon: 'alarm-outline', bg: colors.warningSoft, fg: colors.warning },
  terlambat: { icon: 'alert-circle-outline', bg: colors.dangerSoft, fg: colors.danger },
  pengembalian: { icon: 'checkmark-circle-outline', bg: colors.successSoft, fg: colors.success },
  sistem: { icon: 'information-circle-outline', bg: colors.primarySoft, fg: colors.primary },
};

const FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: 'belum', label: 'Belum dibaca' },
];

function NotificationSkeleton() {
  return (
    <View style={styles.notif}>
      <Skeleton width={40} height={40} radius={13} />
      <View style={styles.notifCopy}>
        <Skeleton width="52%" height={12} />
        <Skeleton width="90%" height={10} />
        <Skeleton width="30%" height={9} />
      </View>
    </View>
  );
}

export default function NotifikasiScreen({ navigation }) {
  const query = useNotifications(30);
  const { unread, refresh: refreshBadge, markAll } = useNotificationBadge();
  const { refetch } = query;
  const [filter, setFilter] = useState('semua');
  useFocusRefetch(refetch);

  const onRefresh = useCallback(() => {
    refetch('refresh');
    refreshBadge();
  }, [refetch, refreshBadge]);

  async function markAllRead() {
    if (unread === 0) return;
    try {
      await markAll();
      refetch('silent');
    } catch {
      // Biarkan pengguna mencoba lagi dengan pull-to-refresh.
    }
  }

  function openItem(item) {
    if (!item.dibaca) {
      notificationsApi.markRead(item.id)
        .then(() => {
          refetch('silent');
          refreshBadge();
        })
        .catch(() => {});
    }

    if (item.ref_type === 'loan' && item.ref_id) {
      navigation.navigate('DetailPinjaman', { loanId: item.ref_id });
    } else if (item.ref_type === 'tool' && item.ref_id) {
      navigation.navigate('DetailAlat', { toolId: item.ref_id });
    }
  }

  const visible = filter === 'belum'
    ? query.data.filter((item) => !item.dibaca)
    : query.data;

  return (
    <Screen
      scroll
      padded={false}
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
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: 6 }]}>
        <PageHeader
          eyebrow="Kotak masuk"
          title="Notifikasi"
          subtitle="Pengingat jatuh tempo dan kabar pengembalian."
        />
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.unread}>
          {unread > 0 ? `${unread} belum dibaca` : 'Semua sudah dibaca'}
        </Text>
        <PressableScale
          accessibilityRole="button"
          onPress={markAllRead}
          disabled={unread === 0}
          scaleTo={0.94}
          style={[styles.markAllButton, unread === 0 && styles.markAllDisabled]}
        >
          <Ionicons name="checkmark-done" size={13} color={unread === 0 ? colors.faint : colors.primary} />
          <Text style={[styles.markAll, unread === 0 && { color: colors.faint }]}>
            Tandai semua
          </Text>
        </PressableScale>
      </View>

      <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} />

      {query.loading && !query.data.length ? (
        <View style={styles.list}>
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </View>
      ) : query.error && !query.data.length ? (
        <ErrorState error={query.error} onRetry={() => refetch('refresh')} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={filter === 'belum' ? 'checkmark-done-outline' : 'notifications-off-outline'}
          title={filter === 'belum' ? 'Tidak ada yang belum dibaca' : 'Belum ada notifikasi'}
          message={
            filter === 'belum'
              ? 'Semua pengingat sudah kamu baca. Kerja bagus.'
              : 'Pengingat jatuh tempo akan muncul setelah kamu mengajukan pinjaman.'
          }
        />
      ) : (
        <View style={styles.list}>
          {visible.map((item) => {
            const meta = TIPE[item.tipe] || TIPE.sistem;
            return (
              <PressableScale
                key={item.id}
                accessibilityRole="button"
                onPress={() => openItem(item)}
                scaleTo={0.99}
                style={[styles.notif, !item.dibaca && styles.notifUnread]}
              >
                {!item.dibaca ? <View style={styles.unreadRail} /> : null}
                <View style={[styles.icon, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon} size={18} color={meta.fg} />
                </View>
                <View style={styles.notifCopy}>
                  <View style={styles.notifTitleRow}>
                    <Text style={[styles.notifTitle, !item.dibaca && styles.notifTitleUnread]} numberOfLines={1}>
                      {item.judul}
                    </Text>
                    {!item.dibaca ? <View style={styles.dot} /> : null}
                  </View>
                  <Text style={styles.notifMessage} numberOfLines={2}>{item.pesan}</Text>
                  <Text style={styles.notifTime}>{waktuLalu(item.show_at)}</Text>
                </View>
                {item.ref_id ? <Ionicons name="chevron-forward" size={15} color={colors.faint} /> : null}
              </PressableScale>
            );
          })}
        </View>
      )}

      <Text style={styles.footer}>
        Notifikasi hanya menampilkan pesan yang sudah waktunya tampil.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 4,
    paddingBottom: 120,
    gap: 14,
  },
  header: { marginBottom: 2 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unread: { fontSize: type.xs, color: colors.muted },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  markAllDisabled: { backgroundColor: colors.surfaceMuted, borderColor: 'transparent' },
  markAll: { fontSize: type.xxs, fontWeight: weight.semibold, color: colors.primary },
  list: { gap: 10 },
  notif: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    padding: 15,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  notifUnread: { borderColor: '#D8E2CF' },
  unreadRail: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.accentInk,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCopy: { flex: 1, gap: 3 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifTitle: { flex: 1, fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  notifTitleUnread: { fontWeight: weight.bold },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accentInk },
  notifMessage: { fontSize: type.xs, lineHeight: 18, color: colors.muted },
  notifTime: { fontSize: type.xxs, color: colors.faint },
  footer: { fontSize: type.xxs, color: colors.faint, textAlign: 'center', marginTop: 2 },
});
