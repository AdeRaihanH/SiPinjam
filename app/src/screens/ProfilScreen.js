import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Card from '../components/Card';
import InlineNotice from '../components/InlineNotice';
import PageHeader from '../components/PageHeader';
import Screen from '../components/Screen';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../hooks/useAuth';
import { useFocusRefetch } from '../hooks/useQuery';
import { useStats } from '../hooks/useStats';
import { APP_VERSION } from '../lib/appInfo';
import { formatRupiah } from '../lib/format';
import { colors, layout, radius, type, weight } from '../theme/tokens';

function Metric({ label, value, tone = colors.text }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color: tone }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function MenuRow({ icon, label, description, onPress, danger = false, last = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        !last && styles.menuBorder,
        pressed && { backgroundColor: colors.surfaceMuted },
      ]}
    >
      <View style={[styles.menuIcon, danger && { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.primary} />
      </View>
      <View style={styles.menuCopy}>
        <Text style={[styles.menuLabel, danger && { color: colors.danger }]}>{label}</Text>
        {description ? <Text style={styles.menuDescription}>{description}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.faint} />
    </Pressable>
  );
}

export default function ProfilScreen({ navigation }) {
  const { member, logout } = useAuth();
  const statsQuery = useStats();
  const [loggingOut, setLoggingOut] = useState(false);
  const { refetch } = statsQuery;
  useFocusRefetch(refetch);

  const stats = statsQuery.data;

  const confirmLogout = useCallback(() => {
    Alert.alert(
      'Keluar dari akun?',
      'Kamu perlu masuk kembali untuk melihat pinjaman.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            await logout();
            setLoggingOut(false);
          },
        },
      ],
    );
  }, [logout]);

  const showPolicy = useCallback(() => {
    Alert.alert(
      'Kebijakan peminjaman',
      'Maksimal 3 jenis alat dan 3 hari per transaksi. Denda Rp2.000 per hari keterlambatan. Pinjaman yang terlambat harus diselesaikan sebelum mengajukan pinjaman baru.',
      [{ text: 'Mengerti' }],
    );
  }, []);

  return (
    <Screen
      scroll
      padded={false}
      contentContainerStyle={styles.content}
      refreshControl={(
        <RefreshControl
          refreshing={statsQuery.refreshing}
          onRefresh={() => refetch('refresh')}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      )}
    >
      <PageHeader
        eyebrow="Akun laboratorium"
        title="Profil"
        subtitle="Kelola akun dan lihat ringkasan aktivitas."
        style={styles.header}
      />

      <Card style={styles.identity} padded={false}>
        <View style={styles.identityTop}>
          <UserAvatar nama={member?.nama} size={56} inverted />
          <View style={styles.identityCopy}>
            <Text style={styles.name}>{member?.nama}</Text>
            <Text style={styles.nim}>{member?.nim}</Text>
          </View>
          <View style={styles.role}>
            <Text style={styles.roleText}>
              {member?.role === 'laboran' ? 'Laboran' : 'Praktikan'}
            </Text>
          </View>
        </View>
        <View style={styles.identityFooter}>
          <Ionicons name="mail-outline" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.email}>{member?.email || '-'}</Text>
        </View>
      </Card>

      <Card style={styles.stats}>
        <Metric label="Total pinjaman" value={stats?.total_pinjaman ?? '—'} />
        <Metric label="Aktif" value={stats?.aktif ?? '—'} />
        <Metric
          label="Terlambat"
          value={stats?.terlambat ?? '—'}
          tone={stats?.terlambat > 0 ? colors.danger : colors.text}
        />
        <Metric
          label="Denda berjalan"
          value={stats ? formatRupiah(stats.denda_berjalan) : '—'}
          tone={stats?.denda_berjalan > 0 ? colors.danger : colors.text}
        />
      </Card>

      {statsQuery.error ? (
        <InlineNotice
          tone="warning"
          title="Ringkasan gagal dimuat"
          message={statsQuery.error.message}
          actionLabel="Coba lagi"
          onAction={() => refetch('refresh')}
        />
      ) : null}

      <Card padded={false}>
        <MenuRow
          icon="document-text-outline"
          label="Kebijakan peminjaman"
          description="Durasi, jumlah alat, dan denda."
          onPress={showPolicy}
        />
        <MenuRow
          icon="information-circle-outline"
          label="Tentang aplikasi"
          description="Versi, API, kredit, dan lisensi."
          onPress={() => navigation.navigate('Tentang')}
        />
        <MenuRow
          icon="log-out-outline"
          label={loggingOut ? 'Keluar...' : 'Keluar'}
          description="Akhiri sesi di perangkat ini."
          onPress={confirmLogout}
          danger
          last
        />
      </Card>

      <Text style={styles.footer}>SiPinjam v{APP_VERSION}</Text>
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
  identity: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  identityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
  },
  identityCopy: { flex: 1, gap: 2 },
  name: { fontSize: type.md, fontWeight: weight.bold, color: colors.white },
  nim: { fontSize: type.xs, color: 'rgba(255,255,255,0.66)' },
  role: {
    height: 24,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.white },
  identityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  email: { fontSize: type.xs, color: 'rgba(255,255,255,0.72)' },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 6,
  },
  metric: { width: '50%', paddingVertical: 10, gap: 1 },
  metricValue: { fontSize: type.lg, fontWeight: weight.bold },
  metricLabel: { fontSize: type.xs, color: colors.muted },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  menuBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCopy: { flex: 1, gap: 2 },
  menuLabel: { fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  menuDescription: { fontSize: type.xs, color: colors.muted },
  footer: { fontSize: type.xs, color: colors.faint, textAlign: 'center', marginTop: 2 },
});
