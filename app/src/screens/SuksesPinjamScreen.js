import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Card from '../components/Card';
import HeroGlow from '../components/HeroGlow';
import InlineNotice from '../components/InlineNotice';
import PressableScale from '../components/PressableScale';
import QRCodeCard from '../components/QRCodeCard';
import Screen from '../components/Screen';
import { formatRupiah, formatTanggalPanjang } from '../lib/format';
import { toLoanQr } from '../lib/scan';
import { colors, gradients, layout, shadows, type, weight } from '../theme/tokens';

export default function SuksesPinjamScreen({ navigation, route }) {
  const { loan } = route.params || {};
  const insets = useSafeAreaInsets();

  const goHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Katalog' } }],
    });
  };

  if (!loan) {
    return (
      <Screen padded>
        <Text style={styles.fallback}>Data pinjaman tidak ditemukan.</Text>
        <Button title="Kembali ke katalog" onPress={goHome} />
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={[]}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <HeroGlow />
          <SafeAreaView edges={['top']}>
            <View style={styles.topBar}>
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Tutup"
                onPress={goHome}
                scaleTo={0.9}
                style={styles.close}
              >
                <Ionicons name="close" size={19} color={colors.white} />
              </PressableScale>
              <Text style={styles.topTitle}>Pinjaman dibuat</Text>
              <View style={styles.closeSpacer} />
            </View>
          </SafeAreaView>

          <View style={styles.heroBody}>
            <View style={styles.checkRingOuter}>
              <View style={styles.checkRing}>
                <View style={styles.check}>
                  <Ionicons name="checkmark" size={30} color={colors.primary} />
                </View>
              </View>
            </View>
            <Text style={styles.title}>Berhasil diajukan</Text>
            <Text style={styles.subtitle}>
              Tunjukkan QR di bawah ke laboran saat mengambil alat.
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.sheet}>
          <QRCodeCard
            value={toLoanQr(loan.kode)}
            code={loan.kode}
            label="Simpan QR ini sampai alat dikembalikan"
            size={176}
          />

          <Card style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Alat</Text>
              <Text style={styles.detailValue} numberOfLines={2}>{loan.ringkasan_alat}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Jatuh tempo</Text>
              <Text style={styles.detailValue}>{formatTanggalPanjang(loan.tanggal_kembali_rencana)}</Text>
            </View>
            <View style={[styles.detailRow, styles.detailRowLast]}>
              <Text style={styles.detailLabel}>Jumlah</Text>
              <Text style={styles.detailValue}>{loan.total_unit} unit</Text>
            </View>
          </Card>

          <InlineNotice
            tone="warning"
            icon="alarm-outline"
            title="Perhatikan jatuh tempo"
            message={`Kembalikan paling lambat ${formatTanggalPanjang(loan.tanggal_kembali_rencana)}. Denda ${formatRupiah(2000)} per hari keterlambatan.`}
          />

          <Button
            title="Lihat detail pinjaman"
            iconRight="arrow-forward"
            onPress={() => navigation.replace('DetailPinjaman', { loanId: loan.id })}
          />
          <Button
            title="Kembali ke katalog"
            variant="secondary"
            onPress={goHome}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingBottom: 58,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: 4,
    paddingBottom: 4,
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeSpacer: { width: 40 },
  topTitle: { fontSize: type.sm, fontWeight: weight.semibold, color: 'rgba(255,255,255,0.8)' },
  heroBody: { alignItems: 'center', gap: 7, paddingTop: 18, paddingHorizontal: 24 },
  checkRingOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  checkRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: type.lg,
    fontWeight: weight.heavy,
    color: colors.white,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: type.xs,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    maxWidth: 290,
  },
  sheet: {
    marginTop: -38,
    marginHorizontal: layout.screenPadding,
    gap: 16,
  },
  detailCard: { paddingVertical: 6, ...shadows.card },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { fontSize: type.xs, color: colors.muted },
  detailValue: { flex: 1, textAlign: 'right', fontSize: type.xs, fontWeight: weight.semibold, color: colors.text },
  fallback: { fontSize: type.sm, marginBottom: 16 },
});
