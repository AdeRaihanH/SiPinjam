import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import BrandMark from '../components/BrandMark';
import Button from '../components/Button';
import Screen from '../components/Screen';
import SectionTitle from '../components/SectionTitle';
import StackHeader from '../components/StackHeader';
import UserAvatar from '../components/UserAvatar';
import { colors, radius, shadows, text } from '../theme';

const FEATURES = [
  {
    icon: 'grid-outline',
    title: 'Katalog alat terpusat',
    text: 'Cari alat berdasarkan nama atau kategori, lengkap dengan stok yang dihitung dari pinjaman aktif.',
  },
  {
    icon: 'qr-code-outline',
    title: 'Peminjaman lewat QR',
    text: 'Pindai QR pada alat atau bukti pinjaman untuk membuka detail tanpa mengetik kode.',
  },
  {
    icon: 'alarm-outline',
    title: 'Pengingat & denda jelas',
    text: 'Notifikasi jatuh tempo muncul otomatis dan denda dihitung transparan per hari.',
  },
];

const STEPS = [
  'Masuk dengan akun laboratorium.',
  'Cari alat di tab Katalog atau pindai QR alat.',
  'Pilih jumlah unit dan durasi 1–3 hari.',
  'Tunjukkan QR pinjaman ke laboran saat mengambil alat.',
  'Kembalikan alat lewat detail pinjaman sebelum jatuh tempo.',
];

const RULES = [
  'Maksimal 3 jenis alat dalam satu transaksi.',
  'Durasi peminjaman 1–3 hari kalender.',
  'Denda Rp2.000 per hari untuk setiap keterlambatan.',
  'Alat yang sama tidak bisa dipinjam dua kali sebelum dikembalikan.',
  'Pinjaman terlambat harus diselesaikan sebelum mengajukan pinjaman baru.',
];

const TECH = ['React Native', 'Expo', 'Express', 'MySQL', 'JWT', 'QR Code'];

export default function TentangScreen({ navigation, route }) {
  const version = Constants.expoConfig?.version || '1.0.0';
  const scrollRef = useRef(null);
  const panduanY = useRef(0);
  const focusPanduan = route.params?.section === 'panduan';

  useEffect(() => {
    if (!focusPanduan) return undefined;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, panduanY.current - 16), animated: true });
    }, 420);
    return () => clearTimeout(timer);
  }, [focusPanduan]);

  async function openRepo() {
    try {
      await Linking.openURL('https://github.com/AdeRaihanH/SiPinjam');
    } catch {
      Alert.alert('Tidak dapat membuka tautan', 'Buka repositori secara manual: github.com/AdeRaihanH/SiPinjam');
    }
  }

  return (
    <Screen padded={false}>
      <StackHeader title="Tentang SiPinjam" subtitle="Informasi aplikasi & aturan" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View style={styles.heroRing} pointerEvents="none" />
          <BrandMark size={68} tone="light" />
          <Text style={styles.heroTitle}>SiPinjam</Text>
          <Text style={styles.heroTagline}>
            Peminjaman alat laboratorium yang cepat, jelas, dan tanpa antre.
          </Text>
          <View style={styles.versionPill}>
            <Text style={styles.versionText}>Versi {version}</Text>
          </View>
        </View>

        <Text style={styles.intro}>
          SiPinjam membantu praktikan meminjam alat laboratorium komputer langsung dari
          ponsel. Stok dihitung real-time dari pinjaman aktif, QR mempermudah pencarian
          alat, dan pengingat jatuh tempo mengurangi keterlambatan pengembalian.
        </Text>

        <View style={styles.section}>
          <SectionTitle title="Fitur utama" />
          <View style={styles.card}>
            {FEATURES.map((feature, index) => (
              <View
                key={feature.title}
                style={[styles.featureRow, index < FEATURES.length - 1 && styles.rowBorder]}
              >
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon} size={19} color={colors.primaryDark} />
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View
          style={styles.section}
          onLayout={(event) => {
            panduanY.current = event.nativeEvent.layout.y;
          }}
        >
          <SectionTitle title="Panduan meminjam" subtitle="Lima langkah dari katalog sampai kembali" />
          <View style={styles.card}>
            {STEPS.map((step, index) => (
              <View
                key={step}
                style={[styles.stepRow, index < STEPS.length - 1 && styles.rowBorder]}
              >
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Aturan peminjaman" subtitle="Berlaku untuk seluruh alat laboratorium" />
          <View style={styles.card}>
            {RULES.map((rule, index) => (
              <View
                key={rule}
                style={[styles.ruleRow, index < RULES.length - 1 && styles.rowBorder]}
              >
                <Ionicons name="checkmark-circle" size={17} color={colors.primary} />
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Teknologi" />
          <View style={styles.techWrap}>
            {TECH.map((tech) => (
              <View key={tech} style={styles.techPill}>
                <Text style={styles.techText}>{tech}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Pembuat" />
          <View style={styles.developerCard}>
            <UserAvatar nama="Ade Raihan" size={50} />
            <View style={styles.developerCopy}>
              <Text style={styles.developerName}>Ade Raihan</Text>
              <Text style={styles.developerNim}>NIM 2112012414011</Text>
              <Text style={styles.developerRole}>
                Tugas Akhir Praktikum Pemrograman Perangkat Bergerak
              </Text>
            </View>
          </View>
          <Button
            title="Buka repositori GitHub"
            icon="logo-github"
            variant="secondary"
            size="sm"
            onPress={openRepo}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 SiPinjam · Dibuat untuk pembelajaran, bukan layanan komersial.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 18,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    paddingVertical: 24,
    paddingHorizontal: 18,
    gap: 7,
    overflow: 'hidden',
  },
  heroRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(14,124,102,0.12)',
    right: -66,
    top: -76,
  },
  heroTitle: {
    ...text.h2,
    fontSize: 24,
    marginTop: 4,
  },
  heroTagline: {
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 270,
  },
  versionPill: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  versionText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  intro: {
    ...text.body,
    color: colors.body,
  },
  section: { gap: 8 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.soft,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 11,
    padding: 13,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: { flex: 1, gap: 2 },
  featureTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.ink,
  },
  featureText: {
    fontSize: 10.5,
    lineHeight: 16,
    color: colors.muted,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.white,
  },
  stepText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.body,
    paddingTop: 3,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    padding: 12,
  },
  ruleText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.body,
  },
  techWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  techPill: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  techText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.body,
  },
  developerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
    ...shadows.soft,
  },
  developerCopy: { flex: 1, gap: 1 },
  developerName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.ink,
  },
  developerNim: {
    fontSize: 10.5,
    color: colors.muted,
    fontWeight: '600',
  },
  developerRole: {
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.faint,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 4,
  },
  footerText: {
    fontSize: 9,
    color: colors.faint,
    textAlign: 'center',
    lineHeight: 14,
  },
});
