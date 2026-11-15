import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BrandMark from '../components/BrandMark';
import Button from '../components/Button';
import Card from '../components/Card';
import Screen from '../components/Screen';
import StackHeader from '../components/StackHeader';
import { API_BASE_URL } from '../api/client';
import { APP_VERSION, LICENSE, REPO_URL } from '../lib/appInfo';
import { colors, layout, text, type, weight } from '../theme/tokens';

function InfoRow({ label, value, last = false }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} selectable>{value}</Text>
    </View>
  );
}

export default function TentangScreen() {
  async function openRepo() {
    try {
      await Linking.openURL(REPO_URL);
    } catch {
      Alert.alert('Tidak dapat membuka tautan', REPO_URL);
    }
  }

  return (
    <Screen padded={false}>
      <StackHeader title="Tentang aplikasi" subtitle="Informasi & kredit" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <BrandMark size={64} tone="light" />
          <Text style={styles.name}>SiPinjam</Text>
          <Text style={styles.version}>Versi {APP_VERSION}</Text>
          <Text style={styles.tagline}>
            Aplikasi peminjaman alat laboratorium dengan katalog, QR Code,
            pengingat jatuh tempo, dan pencatatan denda.
          </Text>
        </View>

        <Card padded={false}>
          <InfoRow label="Base URL API" value={API_BASE_URL} />
          <InfoRow label="Platform" value="React Native · Expo" />
          <InfoRow label="Database" value="Supabase · PostgreSQL" />
          <InfoRow label="Versi aplikasi" value={APP_VERSION} last />
        </Card>

        <Card padded={false}>
          <InfoRow label="Pengembang" value="Ade Raihan" />
          <InfoRow label="NIM" value="2112012414011" />
          <InfoRow label="Mata kuliah" value="Praktikum Pemrograman Perangkat Bergerak" last />
        </Card>

        <Card style={styles.license}>
          <View style={styles.licenseHead}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            <Text style={styles.licenseTitle}>Lisensi {LICENSE}</Text>
          </View>
          <Text style={styles.licenseText}>
            Kode sumber boleh dipelajari dan dikembangkan untuk kebutuhan pembelajaran.
            Data contoh hanya untuk demonstrasi.
          </Text>
        </Card>

        <Button
          title="Buka repositori GitHub"
          icon="logo-github"
          variant="secondary"
          onPress={openRepo}
        />

        <Pressable onPress={openRepo} style={styles.link}>
          <Text style={styles.linkText}>{REPO_URL}</Text>
        </Pressable>
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
    alignItems: 'center',
    gap: 5,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  name: { ...text.h2, marginTop: 6 },
  version: { fontSize: type.xs, color: colors.muted },
  tagline: {
    marginTop: 6,
    fontSize: type.xs,
    lineHeight: 18,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 300,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
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
  license: { gap: 6 },
  licenseHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  licenseTitle: { fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  licenseText: { fontSize: type.xs, lineHeight: 17, color: colors.muted },
  link: { alignItems: 'center', paddingVertical: 4 },
  linkText: { fontSize: type.xs, color: colors.faint, textDecorationLine: 'underline' },
});
