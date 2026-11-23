import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import {
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import PageHeader from '../components/PageHeader';
import PressableScale from '../components/PressableScale';
import Screen from '../components/Screen';
import { Skeleton } from '../components/Skeleton';
import { notificationsApi } from '../api/notifications';
import { useNotificationBadge } from '../context/NotificationContext';
import { useNotifications } from '../hooks/useNotifications';
import { useFocusRefetch } from '../hooks/useQuery';
import { waktuLalu } from '../lib/format';
import { colors, layout, radius, type, weight } from '../theme/tokens';

const TIPE = {
  jatuh_tempo: { icon: 'alarm-outline', bg: colors.warningSoft, fg: colors.warning },
  terlambat: { icon: 'alert-circle-outline', bg: colors.dangerSoft, fg: colors.danger },
  pengembalian: { icon: 'checkmark-circle-outline', bg: colors.successSoft, fg: colors.success },
  sistem: { icon: 'information-circle-outline', bg: colors.primarySoft, fg: colors.primary },
};

function NotificationSkeleton() {
  return (
    <View style={styles.notif}>
      <Skeleton width={36} height={36} radius={12} />
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
      <PageHeader
        eyebrow="Kotak masuk"
        title="Notifikasi"
        subtitle="Pengingat jatuh tempo dan kabar pengembalian."
        style={styles.header}
      />

      <View style={styles.toolbar}>
        <Text style={styles.unread}>
          {query.meta.belum_dibaca || 0} belum dibaca
        </Text>
        <PressableScale
          accessibilityRole="button"
          onPress={markAllRead}
          disabled={unread === 0}
          scaleTo={0.94}
          style={styles.markAllButton}
        >
          <Text style={[styles.markAll, unread === 0 && { color: colors.faint }]}>
            Tandai semua
          </Text>
        </PressableScale>
      </View>

      {query.loading && !query.data.length ? (
        <Card padded={false}>
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </Card>
      ) : query.error && !query.data.length ? (
        <ErrorState error={query.error} onRetry={() => refetch('refresh')} />
      ) : query.data.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title="Belum ada notifikasi"
          message="Pengingat jatuh tempo akan muncul setelah kamu mengajukan pinjaman."
        />
      ) : (
        <Card padded={false}>
          {query.data.map((item, index) => {
            const meta = TIPE[item.tipe] || TIPE.sistem;
            return (
              <PressableScale
                key={item.id}
                accessibilityRole="button"
                onPress={() => openItem(item)}
                scaleTo={0.99}
                style={[
                  styles.notif,
                  !item.dibaca && styles.notifUnread,
                  index < query.data.length - 1 && styles.notifBorder,
                ]}
              >
                <View style={[styles.icon, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon} size={18} color={meta.fg} />
                </View>
                <View style={styles.notifCopy}>
                  <View style={styles.notifTitleRow}>
                    <Text style={styles.notifTitle} numberOfLines={1}>{item.judul}</Text>
                    {!item.dibaca ? <View style={styles.dot} /> : null}
                  </View>
                  <Text style={styles.notifMessage} numberOfLines={2}>{item.pesan}</Text>
                  <Text style={styles.notifTime}>{waktuLalu(item.show_at)}</Text>
                </View>
                {item.ref_id ? <Ionicons name="chevron-forward" size={15} color={colors.faint} /> : null}
              </PressableScale>
            );
          })}
        </Card>
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
    paddingBottom: 28,
    gap: 14,
  },
  header: { marginBottom: 2 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unread: { fontSize: type.xs, color: colors.muted },
  markAllButton: { paddingVertical: 4, paddingLeft: 8 },
  markAll: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.primary },
  notif: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
  },
  notifUnread: { backgroundColor: colors.primarySoft },
  notifBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCopy: { flex: 1, gap: 3 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifTitle: { flex: 1, fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  notifMessage: { fontSize: type.xs, lineHeight: 17, color: colors.text },
  notifTime: { fontSize: type.xs, color: colors.faint },
  footer: { fontSize: type.xs, color: colors.faint, textAlign: 'center', marginTop: 2 },
});
