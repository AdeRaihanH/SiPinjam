import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { isToday, isYesterday } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import PageHeader from '../components/PageHeader';
import Screen from '../components/Screen';
import { Skeleton } from '../components/Skeleton';
import { useNotifications } from '../context/NotificationContext';
import { useFocusReload, useResource } from '../hooks/useResource';
import { api } from '../services/api';
import { colors, radius, shadows, text } from '../theme';
import { formatTanggal, safeParse, waktuLalu } from '../utils/format';

const TIPE_META = {
  jatuh_tempo: {
    icon: 'alarm-outline',
    bg: colors.warnSoft,
    fg: colors.warn,
  },
  terlambat: {
    icon: 'alert-circle-outline',
    bg: colors.dangerSoft,
    fg: colors.danger,
  },
  pengembalian: {
    icon: 'checkmark-circle-outline',
    bg: colors.primarySoft,
    fg: colors.primaryDark,
  },
  sistem: {
    icon: 'information-circle-outline',
    bg: colors.blueSoft,
    fg: colors.blue,
  },
};

function bucketLabel(value) {
  const date = safeParse(value);
  if (!date) return 'Lebih lama';
  if (isToday(date)) return 'Hari ini';
  if (isYesterday(date)) return 'Kemarin';
  return formatTanggal(date, 'd MMMM yyyy');
}

function groupNotifications(items) {
  const groups = [];
  const index = new Map();

  items.forEach((item) => {
    const label = bucketLabel(item.show_at);
    if (!index.has(label)) {
      index.set(label, groups.length);
      groups.push({ label, items: [] });
    }
    groups[index.get(label)].items.push(item);
  });

  return groups;
}

function NotificationSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton width={42} height={42} radius={13} />
      <View style={styles.skeletonCopy}>
        <Skeleton width="58%" height={12} />
        <Skeleton width="90%" height={10} />
        <Skeleton width="35%" height={9} />
      </View>
    </View>
  );
}

export default function NotifikasiScreen({ navigation }) {
  const [filter, setFilter] = useState('semua');
  const { unread, refresh: refreshBadge, markAllRead, setUnread } = useNotifications();

  const loadNotifications = useCallback(
    () => api.getList('/notifications', { params: { limit: 50 } }),
    [],
  );
  const notifRes = useResource(loadNotifications);
  useFocusReload(notifRes.reload);

  const notifications = notifRes.data?.data || [];
  const total = notifRes.data?.meta?.total ?? notifications.length;
  const visible = filter === 'belum'
    ? notifications.filter((item) => !item.dibaca)
    : notifications;
  const groups = useMemo(() => groupNotifications(visible), [visible]);

  const onRefresh = () => {
    notifRes.reload('refresh');
    refreshBadge();
  };

  function markOneRead(item) {
    if (item.dibaca) return;
    setUnread?.((value) => Math.max(0, value - 1));
    notifRes.setData((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        data: previous.data.map((row) => (
          row.id === item.id ? { ...row, dibaca: true } : row
        )),
        meta: {
          ...previous.meta,
          belum_dibaca: Math.max(0, Number(previous.meta?.belum_dibaca || 0) - 1),
        },
      };
    });
    api.patch(`/notifications/${item.id}/read`).catch(() => {
      notifRes.reload('silent');
      refreshBadge();
    });
  }

  function openNotification(item) {
    markOneRead(item);
    if (item.ref_type === 'loan' && item.ref_id) {
      navigation.navigate('DetailPinjaman', { loanId: item.ref_id });
    } else if (item.ref_type === 'tool' && item.ref_id) {
      navigation.navigate('DetailAlat', { toolId: item.ref_id });
    }
  }

  async function handleMarkAll() {
    if (unread === 0) return;
    try {
      await markAllRead();
      notifRes.setData((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          data: previous.data.map((row) => ({ ...row, dibaca: true })),
          meta: { ...previous.meta, belum_dibaca: 0 },
        };
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {
      // Diamkan; pengguna bisa mencoba lagi lewat tarik-untuk-muat-ulang.
    }
  }

  return (
    <Screen
      scroll
      padded={false}
      contentContainerStyle={styles.content}
      refreshControl={(
        <RefreshControl
          refreshing={notifRes.refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      )}
    >
      <PageHeader
        eyebrow="Kotak masuk"
        title="Notifikasi"
        subtitle="Pengingat jatuh tempo dan kabar pengembalian."
        style={styles.header}
      />

      <View style={styles.toolbar}>
        <View style={styles.unreadPill}>
          <View style={styles.unreadDot} />
          <Text style={styles.unreadText}>{unread} belum dibaca</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tandai semua notifikasi dibaca"
          onPress={handleMarkAll}
          disabled={unread === 0}
          style={({ pressed }) => [
            styles.markAll,
            unread === 0 && styles.markAllDisabled,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="checkmark-done" size={15} color={colors.primaryDark} />
          <Text style={styles.markAllText}>Tandai semua</Text>
        </Pressable>
      </View>

      <View style={styles.filters}>
        <Chip
          label="Semua"
          count={total}
          selected={filter === 'semua'}
          onPress={() => setFilter('semua')}
        />
        <Chip
          label="Belum dibaca"
          count={unread}
          selected={filter === 'belum'}
          onPress={() => setFilter('belum')}
        />
      </View>

      {notifRes.loading && !notifRes.data ? (
        <View style={styles.list}>
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </View>
      ) : notifRes.error && !notifRes.data ? (
        <ErrorState error={notifRes.error} onRetry={() => notifRes.reload('refresh')} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title={filter === 'belum' ? 'Semua sudah dibaca' : 'Belum ada notifikasi'}
          message={
            filter === 'belum'
              ? 'Notifikasi baru akan muncul di sini saat ada pengingat atau kabar pinjaman.'
              : 'Setelah mengajukan pinjaman, pengingat jatuh tempo akan dikirim ke halaman ini.'
          }
          actionLabel={filter === 'belum' ? 'Lihat semua' : undefined}
          onAction={filter === 'belum' ? () => setFilter('semua') : undefined}
        />
      ) : (
        <View style={styles.groups}>
          {groups.map((group) => (
            <View key={group.label} style={styles.group}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.list}>
                {group.items.map((item) => {
                  const meta = TIPE_META[item.tipe] || TIPE_META.sistem;
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      onPress={() => openNotification(item)}
                      style={({ pressed }) => [
                        styles.card,
                        !item.dibaca && styles.cardUnread,
                        pressed && { opacity: 0.9 },
                      ]}
                    >
                      <View style={[styles.cardIcon, { backgroundColor: meta.bg }]}>
                        <Ionicons name={meta.icon} size={20} color={meta.fg} />
                      </View>
                      <View style={styles.cardCopy}>
                        <View style={styles.cardTitleRow}>
                          <Text style={styles.cardTitle} numberOfLines={1}>{item.judul}</Text>
                          {!item.dibaca ? <View style={styles.notifDot} /> : null}
                        </View>
                        <Text style={styles.cardMessage} numberOfLines={3}>{item.pesan}</Text>
                        <View style={styles.cardFooter}>
                          <Text style={styles.cardTime}>{waktuLalu(item.show_at)}</Text>
                          {item.ref_id ? (
                            <View style={styles.cardLink}>
                              <Text style={styles.cardLinkText}>Lihat</Text>
                              <Ionicons name="arrow-forward" size={11} color={colors.primary} />
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.footerNote}>
        Pengingat dibuat otomatis dari tanggal jatuh tempo pinjaman.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 26,
    gap: 14,
  },
  header: { marginTop: 6 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  unreadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 30,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  unreadText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  markAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 30,
    paddingHorizontal: 9,
  },
  markAllDisabled: { opacity: 0.35 },
  markAllText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  groups: { gap: 18 },
  group: { gap: 8 },
  groupLabel: {
    ...text.label,
    color: colors.muted,
    marginLeft: 2,
  },
  list: { gap: 9 },
  card: {
    flexDirection: 'row',
    gap: 11,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    ...shadows.soft,
  },
  cardUnread: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primarySoft,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: { flex: 1, gap: 3 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.ink,
  },
  notifDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  cardMessage: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.body,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  cardTime: {
    fontSize: 9.5,
    color: colors.faint,
  },
  cardLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardLinkText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.primary,
  },
  skeletonCard: {
    flexDirection: 'row',
    gap: 11,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  skeletonCopy: { flex: 1, gap: 7 },
  footerNote: {
    fontSize: 9.5,
    color: colors.faint,
    textAlign: 'center',
    marginTop: 2,
  },
});
