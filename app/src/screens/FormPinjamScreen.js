import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { addDays } from 'date-fns';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../components/Button';
import FormField from '../components/FormField';
import InlineNotice from '../components/InlineNotice';
import { Pill } from '../components/Pill';
import Screen from '../components/Screen';
import SectionTitle from '../components/SectionTitle';
import StackHeader from '../components/StackHeader';
import Stepper from '../components/Stepper';
import ToolGlyph from '../components/ToolGlyph';
import { useNotifications } from '../context/NotificationContext';
import { useResource } from '../hooks/useResource';
import { api } from '../services/api';
import { colors, radius, shadows } from '../theme';
import {
  formatRupiah,
  formatTanggal,
  formatTanggalPanjang,
  labelKondisi,
} from '../utils/format';

const DURASI = [1, 2, 3];

export default function FormPinjamScreen({ navigation, route }) {
  const { tool: initialTool } = route.params || {};
  const insets = useSafeAreaInsets();
  const { refresh: refreshNotifications } = useNotifications();

  const [jumlah, setJumlah] = useState(1);
  const [durasi, setDurasi] = useState(1);
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadTool = useCallback(() => api.get(`/tools/${initialTool.id}`), [initialTool.id]);
  const toolRes = useResource(loadTool, { initialData: initialTool });
  const tool = toolRes.data || initialTool;

  const loadStats = useCallback(() => api.get('/stats/summary'), []);
  const statsRes = useResource(loadStats);
  const stats = statsRes.data;

  const stok = Math.max(1, Number(tool?.stok_tersedia ?? 1));
  const jumlahDipilih = Math.min(jumlah, stok);
  const tanggalKembali = addDays(new Date(), durasi);
  const dendaPerHari = Number(stats?.denda_per_hari || 2000);
  const adaTerlambat = Number(stats?.terlambat || 0) > 0;
  const sedangDipinjam = Boolean(tool?.dipinjam_oleh_saya);
  const habis = Number(tool?.stok_tersedia ?? 0) <= 0;

  async function handleSubmit() {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const loan = await api.post('/loans', {
        items: [{ tool_id: tool.id, jumlah: jumlahDipilih }],
        durasi_hari: durasi,
        catatan: catatan.trim() || undefined,
      });
      refreshNotifications();
      navigation.replace('SuksesPinjam', { loanId: loan.id, loan });
    } catch (err) {
      setError(err);
      if (err.code === 'STOK_TIDAK_CUKUP') {
        toolRes.reload('silent');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen padded={false}>
      <StackHeader
        title="Ajukan pinjaman"
        subtitle={tool?.kode}
        right={<Pill label="Langkah 2 dari 3" tone="primary" />}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.toolCard}>
            <ToolGlyph tool={tool} size={58} />
            <View style={styles.toolCopy}>
              <Text style={styles.toolCategory}>{tool?.kategori_nama}</Text>
              <Text style={styles.toolName} numberOfLines={2}>{tool?.nama}</Text>
              <View style={styles.toolMeta}>
                <Pill label={`${tool?.stok_tersedia ?? 0} tersedia`} tone={habis ? 'danger' : 'primary'} dot />
                <Text style={styles.condition}>{labelKondisi(tool?.kondisi)}</Text>
              </View>
            </View>
          </View>

          {adaTerlambat ? (
            <InlineNotice
              tone="danger"
              title="Pinjaman terlambat harus diselesaikan"
              message="Kamu masih memiliki pinjaman yang melewati jatuh tempo. Kembalikan dulu sebelum mengajukan pinjaman baru."
              actionLabel="Buka daftar pinjaman"
              onAction={() => navigation.navigate('Pinjaman')}
            />
          ) : null}

          {sedangDipinjam ? (
            <InlineNotice
              tone="warn"
              title="Alat ini sedang kamu pinjam"
              message="Satu alat hanya boleh ada di satu pinjaman aktif. Kembalikan pinjaman sebelumnya terlebih dahulu."
              actionLabel="Lihat pinjaman"
              onAction={() => navigation.navigate('Pinjaman')}
            />
          ) : null}

          <View style={styles.section}>
            <SectionTitle title="Jumlah unit" subtitle={`Stok tersedia ${tool?.stok_tersedia ?? 0} unit`} />
            <View style={styles.quantityCard}>
              <Stepper
                value={jumlahDipilih}
                onChange={setJumlah}
                min={1}
                max={stok}
                suffix="unit"
              />
              <Text style={styles.quantityHint}>
                Pilih jumlah alat fisik yang akan dibawa.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <SectionTitle title="Durasi pinjam" subtitle="Pilih 1 sampai 3 hari kalender" />
            <View style={styles.durationRow}>
              {DURASI.map((hari) => {
                const selected = durasi === hari;
                return (
                  <Pressable
                    key={hari}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setDurasi(hari)}
                    style={[styles.durationCard, selected && styles.durationCardActive]}
                  >
                    <Text style={[styles.durationValue, selected && styles.durationValueActive]}>
                      {hari}
                    </Text>
                    <Text style={[styles.durationUnit, selected && styles.durationUnitActive]}>
                      hari
                    </Text>
                    <Text style={[styles.durationDate, selected && styles.durationDateActive]}>
                      {formatTanggal(addDays(new Date(), hari), 'd MMM')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.returnCard}>
            <View style={styles.returnIcon}>
              <Ionicons name="calendar-outline" size={20} color={colors.primaryDark} />
            </View>
            <View style={styles.returnCopy}>
              <Text style={styles.returnLabel}>Rencana pengembalian</Text>
              <Text style={styles.returnValue}>{formatTanggalPanjang(tanggalKembali)}</Text>
              <Text style={styles.returnHint}>Dihitung otomatis dari durasi pinjam.</Text>
            </View>
          </View>

          <FormField
            label="Catatan"
            hint="Opsional"
            icon="create-outline"
            value={catatan}
            onChangeText={setCatatan}
            placeholder="Contoh: untuk praktikum jaringan kelompok 3"
            multiline
            maxLength={255}
            style={styles.notes}
          />

          <InlineNotice
            tone="info"
            icon="shield-checkmark"
            title="Aturan yang berlaku"
            message={`Denda ${formatRupiah(dendaPerHari)} per hari keterlambatan. Maksimal 3 alat dan durasi 3 hari per transaksi.`}
          />

          {error ? (
            <InlineNotice
              tone="danger"
              title="Pinjaman gagal diajukan"
              message={error.message}
              actionLabel={error.code === 'PINJAMAN_TERLAMBAT' ? 'Lihat pinjaman' : undefined}
              onAction={error.code === 'PINJAMAN_TERLAMBAT' ? () => navigation.navigate('Pinjaman') : undefined}
            />
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.footerSummary}>
            <Text style={styles.footerLabel}>Ringkasan</Text>
            <Text style={styles.footerValue}>{jumlahDipilih} unit · {durasi} hari</Text>
            <Text style={styles.footerHint}>Biaya pinjam Rp0</Text>
          </View>
          <Button
            title={
              adaTerlambat
                ? 'Selesaikan pinjaman dulu'
                : sedangDipinjam
                  ? 'Sudah kamu pinjam'
                  : habis
                    ? 'Stok habis'
                    : 'Ajukan peminjaman'
            }
            icon={adaTerlambat ? 'time-outline' : 'arrow-forward'}
            loading={submitting}
            disabled={sedangDipinjam || habis}
            onPress={adaTerlambat ? () => navigation.navigate('Pinjaman') : handleSubmit}
            style={styles.submit}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 18,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  toolCopy: { flex: 1, gap: 3 },
  toolCategory: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.muted,
  },
  toolName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: colors.ink,
  },
  toolMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  condition: {
    fontSize: 10.5,
    color: colors.muted,
  },
  section: { gap: 9 },
  quantityCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  quantityHint: {
    fontSize: 10.5,
    color: colors.muted,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationCard: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 1,
  },
  durationCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
    lineHeight: 26,
  },
  durationValueActive: { color: colors.white },
  durationUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.muted,
  },
  durationUnitActive: { color: 'rgba(255,255,255,0.7)' },
  durationDate: {
    fontSize: 9.5,
    color: colors.faint,
    marginTop: 3,
  },
  durationDateActive: { color: 'rgba(255,255,255,0.82)' },
  returnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.primaryTint,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    padding: 14,
  },
  returnIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnCopy: { flex: 1, gap: 1 },
  returnLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: 0.2,
  },
  returnValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
    lineHeight: 19,
  },
  returnHint: {
    fontSize: 9.5,
    color: colors.muted,
  },
  notes: { marginTop: -4 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 11,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.sheet,
    shadowOpacity: 0.06,
  },
  footerSummary: { width: 98, gap: 0 },
  footerLabel: { fontSize: 9, color: colors.muted },
  footerValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
  },
  footerHint: { fontSize: 8.5, color: colors.faint },
  submit: { flex: 1 },
});
