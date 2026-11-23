import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Card from '../components/Card';
import HeroGlow from '../components/HeroGlow';
import InlineNotice from '../components/InlineNotice';
import PageHeader from '../components/PageHeader';
import PressableScale from '../components/PressableScale';
import Screen from '../components/Screen';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../hooks/useAuth';
import { useFocusRefetch } from '../hooks/useQuery';
import { useStats } from '../hooks/useStats';
import { APP_VERSION } from '../lib/appInfo';
import { confirmAction, showMessage } from '../lib/dialog';
import { formatRupiah } from '../lib/format';
import { colors, gradients, layout, radius, type, weight } from '../theme/tokens';

function Metric({ label, value, tone = colors.text, small = false }) {
  return (
    <View style={styles.metric}>
      <Text
        style={[styles.metricValue, small && styles.metricValueSmall, { color: tone }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function MenuRow({ icon, label, description, onPress, danger = false, last = false }) {
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      scaleTo={0.99}
      style={[styles.menuRow, !last && styles.menuBorder]}
    >
      <View style={[styles.menuIcon, danger && { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.primary} />
      </View>
      <View style={styles.menuCopy}>
        <Text style={[styles.menuLabel, danger && { color: colors.danger }]}>{label}</Text>
        {description ? <Text style={styles.menuDescription}>{description}</Text> : null}
      </View>
      <View style={styles.menuChevron}>
        <Ionicons name="chevron-forward" size={14} color={colors.muted} />
      </View>
    </PressableScale>
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
    confirmAction({
      title: 'Keluar dari akun?',
      message: 'Kamu perlu masuk kembali untuk melihat pinjaman.',
      confirmLabel: 'Keluar',
      destructive: true,
      onConfirm: async () => {
        setLoggingOut(true);
        await logout();
        setLoggingOut(false);
      },
    });
  }, [logout]);

  const showPolicy = useCallback(() => {
    showMessage(
      'Kebijakan peminjaman',
      'Maksimal 3 jenis alat dan 3 hari per transaksi. Denda Rp2.000 per hari keterlambatan. Pinjaman yang terlambat harus diselesaikan sebelum mengajukan pinjaman baru.',
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

      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.identity}
      >
        <HeroGlow />
        <View style={styles.identityTop}>
          <View style={styles.avatarRing}>
            <UserAvatar nama={member?.nama} size={58} inverted />
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.name} numberOfLines={1}>{member?.nama}</Text>
            <Text style={styles.nim}>{member?.nim}</Text>
          </View>
          <View style={styles.role}>
            <Text style={styles.roleText}>
              {member?.role === 'laboran' ? 'Laboran' : member?.role === 'admin' ? 'Admin' : 'Praktikan'}
            </Text>
          </View>
        </View>
        <View style={styles.identityFooter}>
          <Ionicons name="mail-outline" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.email}>{member?.email || '-'}</Text>
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Aktif</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsGrid}>
        <Metric label="Total pinjaman" value={stats?.total_pinjaman ?? '—'} />
        <Metric label="Sedang aktif" value={stats?.aktif ?? '—'} />
        <Metric
          label="Terlambat"
          value={stats?.terlambat ?? '—'}
          tone={stats?.terlambat > 0 ? colors.danger : colors.text}
        />
        <Metric
          label="Denda berjalan"
          value={stats ? formatRupiah(stats.denda_berjalan) : '—'}
          tone={stats?.denda_berjalan > 0 ? colors.danger : colors.text}
          small
        />
      </View>

      {statsQuery.error ? (
        <InlineNotice
          tone="warning"
          title="Ringkasan gagal dimuat"
          message={statsQuery.error.message}
          actionLabel="Coba lagi"
          onAction={() => refetch('refresh')}
        />
      ) : null}

      <Card padded={false} style={styles.menu}>
        {member?.role === 'admin' ? (
          <MenuRow
            icon="construct-outline"
            label="Kelola alat"
            description="Tambah, edit, hapus alat dan QR."
            onPress={() => navigation.navigate('AdminTools')}
          />
        ) : null}
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
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  identityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 18,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.34)',
  },
  identityCopy: { flex: 1, gap: 2 },
  name: { fontSize: type.lg - 2, fontWeight: weight.heavy, color: colors.white, letterSpacing: -0.4 },
  nim: { fontSize: type.xs, color: 'rgba(255,255,255,0.66)' },
  role: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: { fontSize: type.xxs, fontWeight: weight.bold, color: colors.white, letterSpacing: 0.4 },
  identityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  email: { flex: 1, fontSize: type.xs, color: 'rgba(255,255,255,0.72)' },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(20,184,166,0.2)',
  },
  activeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent },
  activeText: { fontSize: 9, fontWeight: weight.bold, color: '#8FF0E3', letterSpacing: 0.4 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 13,
    paddingVertical: 12,
    gap: 3,
  },
  metricValue: {
    fontSize: type.lg - 2,
    fontWeight: weight.heavy,
    color: colors.text,
    letterSpacing: -0.4,
  },
  metricValueSmall: { fontSize: type.md },
  metricLabel: {
    fontSize: type.xxs,
    fontWeight: weight.semibold,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  menu: { overflow: 'hidden' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  menuBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCopy: { flex: 1, gap: 2 },
  menuLabel: { fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  menuDescription: { fontSize: type.xs, color: colors.muted },
  menuChevron: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { fontSize: type.xxs, color: colors.faint, textAlign: 'center', marginTop: 2 },
});
