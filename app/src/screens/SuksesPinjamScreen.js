import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../components/Button';
import InlineNotice from '../components/InlineNotice';
import QRCodeCard from '../components/QRCodeCard';
import Screen from '../components/Screen';
import { colors, radius, shadows, text } from '../theme';
import { formatRupiah, formatTanggalPanjang } from '../utils/format';
import { toLoanQr } from '../utils/scan';

function DetailRow({ icon, label, value, last = false }) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={16} color={colors.primaryDark} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

export default function SuksesPinjamScreen({ navigation, route }) {
  const { loan } = route.params || {};
  const insets = useSafeAreaInsets();
  const scale = useMemo(() => new Animated.Value(0.65), []);
  const opacity = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

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
          <Ionicons name="close" size={20} color={colors.ink} />
        </Pressable>
        <View style={styles.stepPill}>
          <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
          <Text style={styles.stepText}>Langkah 3 dari 3</Text>
        </View>
        <View style={styles.closeSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 24) + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.hero, { opacity, transform: [{ scale }] }]}>
          <View style={styles.checkOuter}>
            <View style={styles.checkInner}>
              <Ionicons name="checkmark" size={38} color={colors.white} />
            </View>
          </View>
          <Text style={styles.title}>Pinjaman diajukan!</Text>
          <Text style={styles.subtitle}>
            Tunjukkan QR di bawah ke laboran saat mengambil alat.
          </Text>
        </Animated.View>

        <QRCodeCard
          value={toLoanQr(loan.kode)}
          code={loan.kode}
          label="Simpan tangkapan layar ini sebagai bukti pinjam"
          size={184}
        />

        <View style={styles.detailCard}>
          <DetailRow
            icon="cube-outline"
            label="Alat yang dipinjam"
            value={loan.ringkasan_alat}
          />
          <DetailRow
            icon="calendar-outline"
            label="Jatuh tempo"
            value={formatTanggalPanjang(loan.tanggal_kembali_rencana)}
          />
          <DetailRow
            icon="time-outline"
            label="Durasi"
            value={`${Math.max(
              1,
              Math.round(
                (new Date(loan.tanggal_kembali_rencana) - new Date(loan.tanggal_pinjam))
                  / 86400000,
              ),
            )} hari · ${loan.total_unit} unit`}
          />
          <DetailRow
            icon="cash-outline"
            label="Biaya pinjam"
            value="Rp0 · denda Rp2.000/hari jika terlambat"
            last
          />
        </View>

        <InlineNotice
          tone="warn"
          icon="alarm-outline"
          title="Jangan lupa jatuh tempo"
          message={`Kembalikan paling lambat ${formatTanggalPanjang(loan.tanggal_kembali_rencana)}. Denda ${formatRupiah(2000)} per hari keterlambatan.`}
        />

        <View style={styles.actions}>
          <Button
            title="Lihat detail pinjaman"
            icon="document-text-outline"
            onPress={() => navigation.replace('DetailPinjaman', { loanId: loan.id })}
          />
          <Button
            title="Kembali ke katalog"
            variant="secondary"
            icon="grid-outline"
            onPress={goHome}
          />
        </View>

        <Text style={styles.note}>
          Notifikasi pengingat akan muncul satu hari sebelum jatuh tempo.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 4,
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeSpacer: { width: 40 },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 27,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  stepText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
  },
  fallback: {
    ...text.body,
    marginBottom: 16,
  },
  hero: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  checkOuter: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  checkInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  },
  title: {
    ...text.h1,
    fontSize: 27,
  },
  subtitle: {
    ...text.small,
    textAlign: 'center',
    maxWidth: 280,
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.soft,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCopy: { flex: 1, gap: 2 },
  detailLabel: {
    fontSize: 9.5,
    color: colors.muted,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  actions: { gap: 9, marginTop: 2 },
  note: {
    fontSize: 10,
    color: colors.faint,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
