import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BrandMark from '../../components/BrandMark';
import Button from '../../components/Button';
import Card from '../../components/Card';
import HeroGlow from '../../components/HeroGlow';
import Screen from '../../components/Screen';
import StackHeader from '../../components/StackHeader';
import { API_BASE_URL } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { APP_VERSION, LICENSE, REPO_URL } from '../../lib/appInfo';
import { showMessage } from '../../lib/dialog';
import { colors, gradients, layout, radius, shadows, type, weight } from '../../theme/tokens';

function InfoRow({ label, value, last = false }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} selectable>{value}</Text>
    </View>
  );
}

export default function TentangScreen() {
  const { member } = useAuth();
  const lengkap = member?.role === 'admin';

  async function openRepo() {
    try {
      await Linking.openURL(REPO_URL);
    } catch {
      showMessage('Tidak dapat membuka tautan', REPO_URL);
    }
  }

  return (
    <Screen padded={false}>
      <StatusBar style="dark" />
      <StackHeader title="Tentang aplikasi" subtitle="Informasi & kredit" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <HeroGlow />
          <BrandMark size={58} tone="light" />
          <Text style={styles.name}>SiPinjam</Text>
          <View style={styles.versionPill}>
            <View style={styles.versionDot} />
            <Text style={styles.version}>Versi {APP_VERSION}</Text>
          </View>
          <Text style={styles.tagline}>
            Katalog alat, peminjaman QR, pengingat jatuh tempo, dan pencatatan denda
            dalam satu aplikasi laboratorium.
          </Text>
        </LinearGradient>

        <Card style={styles.license}>
          <View style={styles.licenseHead}>
            <View style={styles.licenseIcon}>
              <Ionicons name="bulb-outline" size={17} color={colors.primary} />
            </View>
            <Text style={styles.licenseTitle}>Latar belakang</Text>
          </View>
          <Text style={styles.licenseText}>
            SiPinjam dibuat untuk menertibkan peminjaman alat di Laboratorium
            Komputer. Pencatatan manual rentan menimbulkan antrean, stok yang
            tidak terpantau, dan keterlambatan pengembalian. Melalui katalog
            real-time, QR Code, pengingat jatuh tempo, dan denda yang transparan,
            praktikan dan laboran memakai data peminjaman yang sama dan dapat
            dipertanggungjawabkan.
          </Text>
        </Card>

        {lengkap ? (
          <Card padded={false}>
            <InfoRow label="Base URL API" value={API_BASE_URL} />
            <InfoRow label="Platform" value="React Native · Expo" />
            <InfoRow label="Database" value="Neon PostgreSQL" />
            <InfoRow label="Versi aplikasi" value={APP_VERSION} last />
          </Card>
        ) : null}

        {lengkap ? (
          <Card padded={false}>
            <InfoRow label="Pengembang" value="Ade Raihan Hanafi" />
            <InfoRow label="NIM" value="21120124140118" />
            <InfoRow label="Mata kuliah" value="Praktikum Pemrograman Perangkat Bergerak" last />
          </Card>
        ) : null}

        <Card style={styles.license}>
          <View style={styles.licenseHead}>
            <View style={styles.licenseIcon}>
              <Ionicons name="shield-checkmark-outline" size={17} color={colors.primary} />
            </View>
            <Text style={styles.licenseTitle}>Lisensi {LICENSE}</Text>
          </View>
          <Text style={styles.licenseText}>
            Kode sumber boleh dipelajari dan dikembangkan untuk kebutuhan pembelajaran.
            Data laboratorium dikelola melalui aplikasi.
          </Text>
        </Card>

        {lengkap ? (
          <Button
            title="Buka repositori GitHub"
            icon="logo-github"
            variant="secondary"
            onPress={openRepo}
          />
        ) : null}

        {lengkap ? (
          <Pressable onPress={openRepo} style={styles.link}>
            <Text style={styles.linkText}>{REPO_URL}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 28,
    gap: 14,
  },
  hero: {
    borderRadius: radius.xl,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    gap: 7,
    overflow: 'hidden',
    ...shadows.lift,
  },
  name: { fontSize: 24, fontWeight: weight.heavy, color: colors.white, letterSpacing: -0.6, marginTop: 6 },
  versionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(185,205,154,0.13)',
  },
  versionDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent },
  version: { fontSize: type.xxs, fontWeight: weight.semibold, color: colors.accent },
  tagline: {
    marginTop: 6,
    fontSize: type.xs,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    maxWidth: 300,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: { fontSize: type.xs, color: colors.muted },
  value: {
    flex: 1,
    textAlign: 'right',
    fontSize: type.xs,
    fontWeight: weight.semibold,
    color: colors.text,
  },
  license: { gap: 8 },
  licenseHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  licenseIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  licenseTitle: { fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  licenseText: { fontSize: type.xs, lineHeight: 19, color: colors.muted },
  link: { alignItems: 'center', paddingVertical: 4 },
  linkText: { fontSize: type.xs, color: colors.faint, textDecorationLine: 'underline' },
});
