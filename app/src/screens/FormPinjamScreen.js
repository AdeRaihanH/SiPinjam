import { Ionicons } from '@expo/vector-icons';
import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Card from '../components/Card';
import DatePickerField from '../components/DatePickerField';
import FormField from '../components/FormField';
import InlineNotice from '../components/InlineNotice';
import Screen from '../components/Screen';
import SectionTitle from '../components/SectionTitle';
import StackHeader from '../components/StackHeader';
import Stepper from '../components/Stepper';
import ToolPhoto from '../components/ToolPhoto';
import { loansApi } from '../api/loans';
import { useNotificationBadge } from '../context/NotificationContext';
import { useToolDetail } from '../hooks/useToolDetail';
import { formatRupiah, formatTanggal } from '../lib/format';
import { colors, layout, shadows, type, weight } from '../theme/tokens';

function tomorrowISO() {
  return format(addDays(new Date(), 1), 'yyyy-MM-dd');
}

export default function FormPinjamScreen({ navigation, route }) {
  const { tool: initialTool } = route.params || {};
  const insets = useSafeAreaInsets();
  const { refresh: refreshBadge } = useNotificationBadge();
  const toolQuery = useToolDetail(initialTool?.id, initialTool);
  const tool = toolQuery.data || initialTool;

  const [jumlah, setJumlah] = useState(1);
  const [tanggal, setTanggal] = useState(tomorrowISO());
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  const stok = Math.max(0, Number(tool?.stok_tersedia ?? 0));
  const jumlahDipilih = Math.max(1, Math.min(jumlah, stok || 1));
  const durasi = Math.max(0, differenceInCalendarDays(
    parseISO(tanggal),
    startOfDay(new Date()),
  ));
  const habis = stok <= 0;
  const minDate = addDays(startOfDay(new Date()), 1);
  const maxDate = addDays(startOfDay(new Date()), 3);

  async function submit() {
    if (submitting || habis) return;
    setSubmitting(true);
    setError(null);
    try {
      const loan = await loansApi.create({
        tanggal_kembali_rencana: tanggal,
        catatan: catatan.trim() || undefined,
        items: [{ tool_id: tool.id, jumlah: jumlahDipilih }],
      });
      refreshBadge();
      navigation.replace('SuksesPinjam', { loan });
    } catch (err) {
      setError(err);
      if (err.code === 'STOK_TIDAK_CUKUP') toolQuery.refetch('silent');
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen padded={false}>
      <StackHeader title="Ajukan pinjaman" subtitle={tool?.kode} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.toolCard}>
            <ToolPhoto tool={tool} width={56} height={56} />
            <View style={styles.toolCopy}>
              <Text style={styles.toolName} numberOfLines={2}>{tool?.nama}</Text>
              <Text style={styles.toolMeta}>{tool?.kode} · {tool?.kategori?.nama}</Text>
              <Text style={[styles.toolStock, habis && { color: colors.danger }]}>
                {habis ? 'Stok habis' : `${stok} unit tersedia`}
              </Text>
            </View>
          </Card>

          {habis ? (
            <InlineNotice
              tone="danger"
              title="Stok tidak tersedia"
              message="Alat ini sedang dipinjam. Coba kembali setelah alat dikembalikan."
            />
          ) : null}

          <View style={styles.section}>
            <SectionTitle title="Jumlah unit" subtitle={`Maksimal ${stok} unit`} />
            <Card style={styles.stepperCard}>
              <Stepper
                value={jumlahDipilih}
                onChange={setJumlah}
                min={1}
                max={Math.max(1, stok)}
                suffix="unit"
              />
              <Text style={styles.helper}>Jumlah alat fisik yang akan dibawa.</Text>
            </Card>
          </View>

          <DatePickerField
            value={tanggal}
            onChange={setTanggal}
            minDate={minDate}
            maxDate={maxDate}
            label="Tanggal kembali"
          />

          <FormField
            label="Catatan"
            hint="Opsional"
            value={catatan}
            onChangeText={setCatatan}
            placeholder="Contoh: untuk praktikum jaringan kelompok 3"
            multiline
            maxLength={500}
          />

          <Card style={styles.summary}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="cube-outline" size={17} color={colors.muted} />
                <Text style={styles.summaryLabel}>Jumlah</Text>
                <Text style={styles.summaryValue}>{jumlahDipilih} unit</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Ionicons name="time-outline" size={17} color={colors.muted} />
                <Text style={styles.summaryLabel}>Durasi</Text>
                <Text style={styles.summaryValue}>
                  {durasi === 0 ? 'Hari ini' : `${durasi} hari`}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Ionicons name="calendar-outline" size={17} color={colors.muted} />
                <Text style={styles.summaryLabel}>Kembali</Text>
                <Text style={styles.summaryValue}>{formatTanggal(tanggal, 'd MMM')}</Text>
              </View>
            </View>
          </Card>

          <InlineNotice
            tone="info"
            icon="shield-checkmark-outline"
            title="Aturan peminjaman"
            message={`Denda ${formatRupiah(2000)} per hari keterlambatan. Maksimal 3 jenis alat dan 3 hari per transaksi.`}
          />

          {error ? (
            <InlineNotice
              tone="danger"
              title="Pinjaman gagal diajukan"
              message={error.message}
              actionLabel={error.code === 'CONFLICT' ? 'Lihat pinjaman' : undefined}
              onAction={error.code === 'CONFLICT' ? () => navigation.navigate('Pinjaman') : undefined}
            />
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.footerCopy}>
            <Text style={styles.footerLabel}>Ringkasan</Text>
            <Text style={styles.footerValue}>{jumlahDipilih} unit · {durasi} hari</Text>
          </View>
          <Button
            title={habis ? 'Stok habis' : 'Ajukan peminjaman'}
            icon={habis ? undefined : 'arrow-forward'}
            loading={submitting}
            disabled={habis}
            onPress={submit}
            style={styles.footerButton}
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
    paddingBottom: 24,
    gap: 16,
  },
  toolCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toolCopy: { flex: 1, gap: 2 },
  toolName: { fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  toolMeta: { fontSize: type.xs, color: colors.muted },
  toolStock: { fontSize: type.xs, color: colors.success, fontWeight: weight.semibold },
  section: { gap: 8 },
  stepperCard: { gap: 8 },
  helper: { fontSize: type.xs, color: colors.muted },
  summary: { paddingVertical: 14 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center', gap: 3 },
  summaryDivider: { width: 1, height: 32, backgroundColor: colors.border },
  summaryLabel: { fontSize: type.xs, color: colors.muted },
  summaryValue: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.text },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.sheet,
    shadowOpacity: 0.04,
  },
  footerCopy: { width: 96, gap: 1 },
  footerLabel: { fontSize: type.xs, color: colors.muted },
  footerValue: { fontSize: type.sm, fontWeight: weight.bold, color: colors.text },
  footerButton: { flex: 1 },
});
