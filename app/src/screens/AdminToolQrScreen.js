import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import Card from '../components/Card';
import InlineNotice from '../components/InlineNotice';
import QRCodeCard from '../components/QRCodeCard';
import Screen from '../components/Screen';
import StackHeader from '../components/StackHeader';
import { printToolQr, saveToolQr } from '../lib/qrExport';
import { showMessage } from '../lib/dialog';
import { colors, layout, type, weight } from '../theme/tokens';

export default function AdminToolQrScreen({ navigation, route }) {
  const { tool, created = false } = route.params || {};
  const [busy, setBusy] = useState(null);

  if (!tool) {
    return (
      <Screen padded={false}>
        <StackHeader title="QR alat" />
        <View style={styles.empty}>
          <Text style={styles.subtitle}>Data alat tidak ditemukan.</Text>
          <Button title="Kembali ke kelola alat" onPress={() => navigation.navigate('AdminTools')} />
        </View>
      </Screen>
    );
  }

  async function handleSave() {
    if (busy) return;
    setBusy('save');
    try {
      await saveToolQr(tool);
      showMessage('QR disimpan', `${tool.kode}.png siap disimpan atau dibagikan.`);
    } catch (error) {
      showMessage('Gagal menyimpan QR', error.message);
    } finally {
      setBusy(null);
    }
  }

  async function handlePrint() {
    if (busy) return;
    setBusy('print');
    try {
      await printToolQr(tool);
    } catch (error) {
      showMessage('Gagal mencetak QR', error.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen padded={false}>
      <StatusBar style="dark" />
      <StackHeader title="QR alat" subtitle={tool.kode} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.intro}>
          <Text style={styles.kicker}>{created ? 'ALAT BERHASIL DIBUAT' : 'QR ALAT'}</Text>
          {created ? <Text style={styles.title}>QR otomatis siap</Text> : null}
          <Text style={styles.subtitle}>
            QR ini sudah terhubung dengan kode alat dan bisa langsung disimpan atau dicetak.
          </Text>
        </View>

        <QRCodeCard
          value={`SIPINJAM:TOOL:${tool.kode}`}
          code={tool.kode}
          label="Tempel atau tunjukkan QR ini saat alat digunakan"
          size={196}
        />

        <Card style={styles.info}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama alat</Text>
            <Text style={styles.infoValue} numberOfLines={2}>{tool.nama}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kategori</Text>
            <Text style={styles.infoValue}>{tool.kategori?.nama || '-'}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoLast]}>
            <Text style={styles.infoLabel}>Stok</Text>
            <Text style={styles.infoValue}>{tool.stok_total} unit</Text>
          </View>
        </Card>

        <InlineNotice
          tone="info"
          icon="qr-code-outline"
          title="QR otomatis"
          message="File PNG dibuat oleh server dari kode alat ini, jadi hasil cetak selalu sama dengan data di database."
        />

        <Button
          title={busy === 'save' ? 'Menyiapkan PNG...' : 'Simpan PNG'}
          icon="download-outline"
          loading={busy === 'save'}
          disabled={Boolean(busy)}
          onPress={handleSave}
        />
        <Button
          title={busy === 'print' ? 'Menyiapkan cetak...' : 'Cetak QR'}
          icon="print-outline"
          variant="secondary"
          loading={busy === 'print'}
          disabled={Boolean(busy)}
          onPress={handlePrint}
        />

        {created ? (
          <Button
            title="Tambah alat lagi"
            icon="add"
            variant="soft"
            onPress={() => navigation.replace('AdminToolForm')}
          />
        ) : null}

        <Button
          title="Kembali ke kelola alat"
          variant="ghost"
          onPress={() => navigation.navigate('AdminTools')}
        />
      </ScrollView>
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
  intro: { gap: 4, paddingVertical: 8 },
  kicker: {
    fontSize: type.xxs,
    fontWeight: weight.bold,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: { fontSize: 28, lineHeight: 35, fontWeight: weight.heavy, color: colors.text, letterSpacing: -0.8 },
  subtitle: { fontSize: type.sm, lineHeight: 21, color: colors.muted },
  info: { paddingVertical: 6 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  infoLast: { borderBottomWidth: 0 },
  infoLabel: { fontSize: type.xs, color: colors.muted },
  infoValue: { flex: 1, textAlign: 'right', fontSize: type.xs, fontWeight: weight.semibold, color: colors.text },
  empty: { padding: 24, gap: 14 },
});
