import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import PageHeader from '../components/PageHeader';
import Screen from '../components/Screen';
import SectionTitle from '../components/SectionTitle';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';
import { useFocusReload, useResource } from '../hooks/useResource';
import { api } from '../services/api';
import { colors, radius, shadows, text } from '../theme';
import { formatRupiah } from '../utils/format';

function ProfileStat({ icon, label, value, tone = colors.primaryDark, bg = colors.primarySoft }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={16} color={tone} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
        !last && styles.menuRowBorder,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? colors.danger : colors.primaryDark}
        />
      </View>
      <View style={styles.menuCopy}>
        <Text style={[styles.menuLabel, danger && { color: colors.danger }]}>{label}</Text>
        {description ? <Text style={styles.menuDescription}>{description}</Text> : null}
      </View>
      <Ionicons
        name={danger ? 'log-out-outline' : 'chevron-forward'}
        size={17}
        color={danger ? colors.danger : colors.faint}
      />
    </Pressable>
  );
}

export default function ProfilScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const loadStats = useCallback(() => api.get('/stats/summary'), []);
  const statsRes = useResource(loadStats);
  useFocusReload(statsRes.reload);

  const stats = statsRes.data;
  const totalDenda = Number(stats?.total_denda || 0) + Number(stats?.denda_berjalan || 0);

  function confirmLogout() {
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
  }

  function showFinePolicy() {
    Alert.alert(
      'Kebijakan denda',
      `Keterlambatan dikenakan denda Rp2.000 per hari per pinjaman. Denda dihitung otomatis saat alat dikembalikan. Pinjaman yang terlambat harus diselesaikan sebelum kamu bisa meminjam lagi.`,
      [{ text: 'Mengerti' }],
    );
  }

  return (
    <Screen
      scroll
      padded={false}
      contentContainerStyle={styles.content}
      refreshControl={(
        <RefreshControl
          refreshing={statsRes.refreshing}
          onRefresh={() => statsRes.reload('refresh')}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      )}
    >
      <PageHeader
        eyebrow="Akun laboratorium"
        title="Profil"
        subtitle="Kelola akun dan pahami aturan peminjaman."
        style={styles.header}
      />

      <LinearGradient
        colors={['#073F34', '#0E7C66']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.userCard}
      >
        <View style={styles.userRing} pointerEvents="none" />
        <View style={styles.userTop}>
          <UserAvatar nama={user?.nama} size={60} inverted />
          <View style={styles.userCopy}>
            <Text style={styles.userName}>{user?.nama}</Text>
            <Text style={styles.userNim}>{user?.nim}</Text>
          </View>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>
              {user?.role === 'admin' ? 'Admin' : 'Peminjam'}
            </Text>
          </View>
        </View>

        <View style={styles.userDivider} />

        <View style={styles.userMetaRow}>
          <Ionicons name="mail-outline" size={14} color="rgba(255,255,255,0.65)" />
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </LinearGradient>

      <View style={styles.grid}>
        <ProfileStat
          icon="albums-outline"
          label="Total pinjaman"
          value={stats?.total_pinjaman ?? '—'}
        />
        <ProfileStat
          icon="time-outline"
          label="Sedang berjalan"
          value={stats?.aktif ?? '—'}
        />
        <ProfileStat
          icon="alert-circle-outline"
          label="Terlambat"
          value={stats?.terlambat ?? '—'}
          tone={stats?.terlambat > 0 ? colors.danger : colors.body}
          bg={stats?.terlambat > 0 ? colors.dangerSoft : colors.surfaceMuted}
        />
        <ProfileStat
          icon="wallet-outline"
          label="Total denda"
          value={formatRupiah(totalDenda)}
          tone={totalDenda > 0 ? colors.danger : colors.body}
          bg={totalDenda > 0 ? colors.dangerSoft : colors.surfaceMuted}
        />
      </View>

      <View style={styles.availabilityCard}>
        <View style={styles.availabilityIcon}>
          <Ionicons name="cube-outline" size={18} color={colors.primaryDark} />
        </View>
        <View style={styles.availabilityCopy}>
          <Text style={styles.availabilityLabel}>Ketersediaan alat</Text>
          <Text style={styles.availabilityValue}>
            {stats ? `${stats.alat.tersedia_unit} dari ${stats.alat.total_unit} unit` : 'Memuat data...'}
          </Text>
        </View>
        <View style={styles.availabilityBadge}>
          <Text style={styles.availabilityBadgeText}>
            {stats?.alat?.total_judul ?? '—'} jenis
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle title="Pengaturan & bantuan" />
        <View style={styles.menuCard}>
          <MenuRow
            icon="information-circle-outline"
            label="Tentang aplikasi"
            description="Visi, fitur, teknologi, dan pembuat aplikasi."
            onPress={() => navigation.navigate('Tentang')}
          />
          <MenuRow
            icon="book-outline"
            label="Panduan & aturan"
            description="Cara meminjam, durasi, dan batas transaksi."
            onPress={() => navigation.navigate('Tentang', { section: 'panduan' })}
          />
          <MenuRow
            icon="wallet-outline"
            label="Kebijakan denda"
            description="Rp2.000 per hari keterlambatan."
            onPress={showFinePolicy}
          />
          <MenuRow
            icon="log-out-outline"
            label={loggingOut ? 'Keluar...' : 'Keluar dari akun'}
            description="Akhiri sesi di perangkat ini."
            onPress={confirmLogout}
            danger
            last
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerApp}>SiPinjam v1.0.0</Text>
        <Text style={styles.footerText}>
          Tugas Akhir Praktikum Pemrograman Perangkat Bergerak 2026
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 14,
  },
  header: { marginTop: 6 },
  userCard: {
    borderRadius: radius.xl,
    padding: 17,
    overflow: 'hidden',
    ...shadows.card,
  },
  userRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    right: -56,
    top: -70,
  },
  userTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userCopy: { flex: 1, gap: 2 },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.3,
  },
  userNim: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.62)',
    letterSpacing: 0.4,
  },
  rolePill: {
    height: 25,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.white,
  },
  userDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 13,
  },
  userMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userEmail: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  statCard: {
    width: '48.6%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
    gap: 2,
    ...shadows.soft,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 9.5,
    color: colors.muted,
    fontWeight: '600',
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: colors.primaryTint,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    padding: 13,
  },
  availabilityIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availabilityCopy: { flex: 1, gap: 1 },
  availabilityLabel: {
    fontSize: 9.5,
    color: colors.muted,
    fontWeight: '600',
  },
  availabilityValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  availabilityBadge: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availabilityBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  section: { gap: 8, marginTop: 4 },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.soft,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.82 },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: colors.dangerSoft },
  menuCopy: { flex: 1, gap: 2 },
  menuLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.ink,
  },
  menuDescription: {
    fontSize: 9.5,
    color: colors.muted,
    lineHeight: 14,
  },
  footer: {
    alignItems: 'center',
    gap: 2,
    marginTop: 10,
  },
  footerApp: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.muted,
  },
  footerText: {
    ...text.tiny,
    fontSize: 9,
    color: colors.faint,
    textAlign: 'center',
  },
});
