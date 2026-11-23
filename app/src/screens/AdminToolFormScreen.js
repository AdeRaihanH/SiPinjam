import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

import Button from '../components/Button';
import Card from '../components/Card';
import Chip from '../components/Chip';
import FormField from '../components/FormField';
import InlineNotice from '../components/InlineNotice';
import Screen from '../components/Screen';
import StackHeader from '../components/StackHeader';
import Stepper from '../components/Stepper';
import { toolsApi } from '../api/tools';
import { useCategories } from '../hooks/useCategories';
import { colors, layout, type, weight } from '../theme/tokens';

const KONDISI = [
  { key: 'baik', label: 'Baik' },
  { key: 'rusak_ringan', label: 'Rusak ringan' },
  { key: 'rusak_berat', label: 'Rusak berat' },
];

export default function AdminToolFormScreen({ navigation, route }) {
  const tool = route.params?.tool || null;
  const insets = useSafeAreaInsets();
  const categoriesQuery = useCategories();
  const [nama, setNama] = useState(tool?.nama || '');
  const [kode, setKode] = useState(tool?.kode || '');
  const [categoryId, setCategoryId] = useState(tool?.kategori?.id || null);
  const [stok, setStok] = useState(Number(tool?.stok_total ?? 0));
  const [kondisi, setKondisi] = useState(tool?.kondisi || 'baik');
  const [deskripsi, setDeskripsi] = useState(tool?.deskripsi || '');
  const [fotoUrl, setFotoUrl] = useState(tool?.foto_url || '');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setError(null);
    if (!nama.trim()) {
      setError({ message: 'Nama alat wajib diisi.' });
      return;
    }
    if (!categoryId) {
      setError({ message: 'Pilih kategori alat terlebih dahulu.' });
      return;
    }

    const payload = {
      nama: nama.trim(),
      category_id: categoryId,
      stok_total: stok,
      kondisi,
      deskripsi: deskripsi.trim() || null,
      foto_url: fotoUrl.trim() || null,
    };
    if (kode.trim()) payload.kode = kode.trim().toUpperCase();

    setSubmitting(true);
    try {
      if (tool) {
        await toolsApi.update(tool.id, payload);
        navigation.goBack();
      } else {
        const created = await toolsApi.create(payload);
        navigation.replace('AdminToolQr', { tool: created, created: true });
      }
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen padded={false}>
      <StackHeader
        title={tool ? 'Edit alat' : 'Tambah alat'}
        subtitle={tool ? tool.kode : 'Admin / inventaris'}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <Text style={styles.kicker}>DATA ALAT</Text>
            <Text style={styles.title}>{tool ? 'Ubah data alat' : 'Alat baru'}</Text>
            <Text style={styles.subtitle}>
              {tool
                ? 'Perubahan langsung tersimpan ke database Neon.'
                : 'Kode kosong akan dibuat otomatis sesuai kategori.'}
            </Text>
          </View>

          {error ? (
            <InlineNotice tone="danger" title="Gagal menyimpan" message={error.message} />
          ) : null}

          <FormField
            label="Nama alat"
            value={nama}
            onChangeText={setNama}
            placeholder="Contoh: Osiloskop Digital"
            maxLength={120}
          />

          <View style={styles.section}>
            <Text style={styles.label}>Kategori</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {categoriesQuery.data.map((category) => (
                <Chip
                  key={category.id}
                  label={category.nama}
                  icon={category.icon}
                  selected={categoryId === category.id}
                  onPress={() => setCategoryId(category.id)}
                />
              ))}
            </ScrollView>
            {categoriesQuery.error ? (
              <Text style={styles.helperDanger}>Kategori gagal dimuat. Coba kembali.</Text>
            ) : null}
          </View>

          <FormField
            label="Kode alat"
            hint="Opsional"
            value={kode}
            onChangeText={setKode}
            placeholder="Otomatis, mis. ELK-005"
            autoCapitalize="characters"
            maxLength={10}
          />

          <Card style={styles.stockCard}>
            <View style={styles.stockHead}>
              <View style={styles.stockCopy}>
                <Text style={styles.label}>Stok total</Text>
                <Text style={styles.helper}>Jumlah unit fisik yang dimiliki laboratorium.</Text>
              </View>
              <Stepper
                value={stok}
                onChange={setStok}
                min={0}
                max={999}
                suffix="unit"
              />
            </View>
          </Card>

          <View style={styles.section}>
            <Text style={styles.label}>Kondisi</Text>
            <View style={styles.wrap}>
              {KONDISI.map((option) => (
                <Chip
                  key={option.key}
                  label={option.label}
                  selected={kondisi === option.key}
                  onPress={() => setKondisi(option.key)}
                />
              ))}
            </View>
          </View>

          <FormField
            label="Deskripsi"
            hint="Opsional"
            value={deskripsi}
            onChangeText={setDeskripsi}
            placeholder="Fungsi alat, kelengkapan, atau catatan praktikum"
            multiline
            maxLength={1000}
          />

          <FormField
            label="URL foto"
            hint="Opsional"
            value={fotoUrl}
            onChangeText={setFotoUrl}
            placeholder="https://..."
            keyboardType="url"
            autoCapitalize="none"
          />

          <InlineNotice
            tone="info"
            icon="qr-code-outline"
            title="QR otomatis"
            message="Setelah alat disimpan, QR langsung dibuat dan bisa disimpan sebagai PNG atau dicetak."
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Button
            title={tool ? 'Simpan perubahan' : 'Simpan & buat QR'}
            icon={tool ? 'save-outline' : 'qr-code-outline'}
            loading={submitting}
            onPress={submit}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 4,
    paddingBottom: 24,
    gap: 15,
  },
  intro: { gap: 3, paddingVertical: 6 },
  kicker: {
    fontSize: type.xxs,
    fontWeight: weight.bold,
    color: colors.primary,
    letterSpacing: 1,
  },
  title: { fontSize: 28, lineHeight: 34, fontWeight: weight.heavy, color: colors.text, letterSpacing: -0.8 },
  subtitle: { fontSize: type.xs, lineHeight: 18, color: colors.muted },
  section: { gap: 8 },
  label: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.text },
  helper: { fontSize: type.xs, lineHeight: 17, color: colors.muted },
  helperDanger: { fontSize: type.xs, color: colors.danger },
  chips: { gap: 8 },
  stockCard: { paddingVertical: 13 },
  stockHead: { gap: 12 },
  stockCopy: { gap: 2 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
