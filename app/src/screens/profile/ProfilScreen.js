import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import Card from '../../components/Card';
import HeroGlow from '../../components/HeroGlow';
import InlineNotice from '../../components/InlineNotice';
import PageHeader from '../../components/PageHeader';
import PressableScale from '../../components/PressableScale';
import Screen from '../../components/Screen';
import UserAvatar from '../../components/UserAvatar';
import { useAuth } from '../../hooks/useAuth';
import { useFocusRefetch } from '../../hooks/useQuery';
import { useStats } from '../../hooks/useStats';
import { APP_VERSION } from '../../lib/appInfo';
import { confirmAction, showMessage } from '../../lib/dialog';
import { formatRupiah } from '../../lib/format';
import { LOAN_RULES_TEXT } from '../../lib/loanRules';
import { colors, gradients, layout, radius, shadows, type, weight } from '../../theme/tokens';

function Metric({ label, value, icon, tone = colors.text, small = false }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricHead}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Ionicons name={icon} size={14} color={colors.faint} />
      </View>
      <Text
        style={[styles.metricValue, small && styles.metricValueSmall, { color: tone }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
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
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
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
      `${LOAN_RULES_TEXT} Pinjaman yang terlambat harus diselesaikan sebelum mengajukan pinjaman baru.`,
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
      <StatusBar style="dark" />

      <View style={styles.header}>
        <PageHeader
          eyebrow="Akun laboratorium"
          title="Profil"
          subtitle="Kelola akun dan lihat ringkasan aktivitas."
        />
      </View>

      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.identity}
      >
        <HeroGlow />
        <View style={styles.identityTop}>
          <View style={styles.avatarRing}>
            <UserAvatar nama={member?.nama} size={60} inverted />
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.identityRole}>
              {member?.role === 'laboran' ? 'Laboran' : member?.role === 'admin' ? 'Admin' : 'Praktikan'}
            </Text>
            <Text style={styles.name} numberOfLines={1}>{member?.nama}</Text>
            <Text style={styles.nim}>{member?.nim}</Text>
          </View>
        </View>
        <View style={styles.identityFooter}>
          <Ionicons name="mail-outline" size={14} color="rgba(255,255,255,0.6)" />
          <Text style={styles.email}>{member?.email || '-'}</Text>
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Aktif</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsGrid}>
        <Metric icon="layers-outline" label="Total pinjaman" value={stats?.total_pinjaman ?? '—'} />
        <Metric icon="swap-horizontal-outline" label="Sedang aktif" value={stats?.aktif ?? '—'} />
        <Metric
          icon="alarm-outline"
          label="Terlambat"
          value={stats?.terlambat ?? '—'}
          tone={stats?.terlambat > 0 ? colors.danger : colors.text}
        />
        <Metric
          icon="wallet-outline"
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

      <Text style={styles.sectionLabel}>Pengaturan</Text>
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
          description={member?.role === 'admin' ? 'Versi, API, dan lisensi.' : 'Versi dan lisensi.'}
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
    paddingBottom: 120,
    gap: 14,
  },
  header: { marginBottom: 2 },
  identity: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.lift,
  },
  identityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 18,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(200,221,178,0.4)',
  },
  identityCopy: { flex: 1, gap: 1 },
  identityRole: {
    fontSize: 9,
    fontWeight: weight.bold,
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  name: { fontSize: 20, fontWeight: weight.heavy, color: colors.white, letterSpacing: -0.4 },
  nim: { fontSize: type.xs, color: 'rgba(255,255,255,0.56)' },
  identityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  email: { flex: 1, fontSize: type.xs, color: 'rgba(255,255,255,0.62)' },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    height: 21,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(185,205,154,0.12)',
  },
  activeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent },
  activeText: { fontSize: 9, fontWeight: weight.bold, color: colors.accent, letterSpacing: 0.3 },
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
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 6,
  },
  metricHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  metricLabel: {
    fontSize: 9,
    fontWeight: weight.bold,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricValue: {
    fontSize: 23,
    fontWeight: weight.heavy,
    color: colors.text,
    letterSpacing: -0.6,
  },
  metricValueSmall: { fontSize: type.md },
  sectionLabel: {
    fontSize: type.xxs,
    fontWeight: weight.bold,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
    marginLeft: 2,
  },
  menu: { overflow: 'hidden' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  menuBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: colors.dangerSoft },
  menuCopy: { flex: 1, gap: 2 },
  menuLabel: { fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  menuDescription: { fontSize: type.xs, color: colors.muted },
  menuChevron: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { fontSize: type.xxs, color: colors.faint, textAlign: 'center', marginTop: 2 },
});
