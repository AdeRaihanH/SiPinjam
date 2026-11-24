import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
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

import Button from '../../components/Button';
import Card from '../../components/Card';
import DatePickerField from '../../components/DatePickerField';
import FormField from '../../components/FormField';
import InlineNotice from '../../components/InlineNotice';
import Screen from '../../components/Screen';
import SectionTitle from '../../components/SectionTitle';
import StackHeader from '../../components/StackHeader';
import Stepper from '../../components/Stepper';
import StockBadge from '../../components/StockBadge';
import ToolPhoto from '../../components/ToolPhoto';
import { loansApi } from '../../api/loans';
import { useNotificationBadge } from '../../context/NotificationContext';
import { useToolDetail } from '../../hooks/useToolDetail';
import { formatTanggal } from '../../lib/format';
import { LOAN_MAX_DAYS, LOAN_RULES_TEXT } from '../../lib/loanRules';
import { colors, gradients, layout, radius, shadows, type, weight } from '../../theme/tokens';

function tomorrowISO() {
  return format(addDays(new Date(), 1), 'yyyy-MM-dd');
}

function SummaryItem({ icon, label, value }) {
  return (
    <View style={styles.summaryItem}>
      <Ionicons name={icon} size={16} color={colors.accent} />
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
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
  const maxDate = addDays(startOfDay(new Date()), LOAN_MAX_DAYS);

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
      <StatusBar style="dark" />
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
            <ToolPhoto tool={tool} width={62} height={62} />
            <View style={styles.toolCopy}>
              <Text style={styles.toolName} numberOfLines={2}>{tool?.nama}</Text>
              <Text style={styles.toolMeta}>{tool?.kode} · {tool?.kategori?.nama}</Text>
              <StockBadge stok={stok} compact />
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
            <SectionTitle title="Jumlah unit" subtitle={`Maksimal ${stok} unit tersedia`} />
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

          <LinearGradient
            colors={gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summary}
          >
            <Text style={styles.summaryEyebrow}>Ringkasan pinjaman</Text>
            <View style={styles.summaryRow}>
              <SummaryItem icon="cube-outline" label="Jumlah" value={`${jumlahDipilih} unit`} />
              <View style={styles.summaryDivider} />
              <SummaryItem
                icon="time-outline"
                label="Durasi"
                value={durasi === 0 ? 'Hari ini' : `${durasi} hari`}
              />
              <View style={styles.summaryDivider} />
              <SummaryItem
                icon="calendar-outline"
                label="Kembali"
                value={formatTanggal(tanggal, 'd MMM')}
              />
            </View>
          </LinearGradient>

          <InlineNotice
            tone="info"
            icon="shield-checkmark-outline"
            title="Aturan peminjaman"
            message={LOAN_RULES_TEXT}
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
            iconRight={habis ? undefined : 'arrow-forward'}
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
  toolCard: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  toolCopy: { flex: 1, gap: 3 },
  toolName: { fontSize: type.sm, fontWeight: weight.bold, color: colors.text },
  toolMeta: { fontSize: type.xs, color: colors.muted },
  section: { gap: 10 },
  stepperCard: { gap: 10 },
  helper: { fontSize: type.xs, color: colors.muted },
  summary: {
    borderRadius: radius.lg,
    padding: 18,
    gap: 14,
    overflow: 'hidden',
    ...shadows.lift,
  },
  summaryEyebrow: {
    fontSize: type.xxs,
    fontWeight: weight.bold,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, gap: 3 },
  summaryDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.1)' },
  summaryLabel: { fontSize: 9.5, color: 'rgba(255,255,255,0.5)' },
  summaryValue: { fontSize: type.xs, fontWeight: weight.bold, color: colors.white },
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
  footerCopy: { width: 102, gap: 1 },
  footerLabel: { fontSize: type.xxs, color: colors.muted },
  footerValue: { fontSize: type.sm, fontWeight: weight.bold, color: colors.text },
  footerButton: { flex: 1 },
});
