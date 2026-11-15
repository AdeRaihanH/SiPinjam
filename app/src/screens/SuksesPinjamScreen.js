import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Card from '../components/Card';
import InlineNotice from '../components/InlineNotice';
import QRCodeCard from '../components/QRCodeCard';
import Screen from '../components/Screen';
import { formatRupiah, formatTanggalPanjang } from '../lib/format';
import { toLoanQr } from '../lib/scan';
import { colors, layout, text, type, weight } from '../theme/tokens';

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
    <Screen padded={false}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tutup"
          onPress={goHome}
          style={styles.close}
        >
          <Ionicons name="close" size={19} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Pinjaman dibuat</Text>
        <View style={styles.closeSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
      >
        <View style={styles.hero}>
          <View style={styles.check}>
            <Ionicons name="checkmark" size={30} color={colors.success} />
          </View>
          <Text style={styles.title}>Pinjaman berhasil diajukan</Text>
          <Text style={styles.subtitle}>
            Tunjukkan QR di bawah ke laboran saat mengambil alat.
          </Text>
        </View>

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
          icon="arrow-forward"
          onPress={() => navigation.replace('DetailPinjaman', { loanId: loan.id })}
        />
        <Button
          title="Kembali ke katalog"
          variant="secondary"
          onPress={goHome}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: 4,
    paddingBottom: 4,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeSpacer: { width: 36 },
  topTitle: { fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12,
    gap: 16,
  },
  hero: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  check: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: { ...text.h2, textAlign: 'center' },
  subtitle: { fontSize: type.xs, lineHeight: 17, color: colors.muted, textAlign: 'center', maxWidth: 300 },
  detailCard: { paddingVertical: 6 },
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
  fallback: { ...text.body, marginBottom: 16 },
});
