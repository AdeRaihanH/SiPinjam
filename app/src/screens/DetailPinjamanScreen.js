import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../components/Button';
import ErrorState from '../components/ErrorState';
import InlineNotice from '../components/InlineNotice';
import { Pill, StatusPill } from '../components/Pill';
import QRCodeCard from '../components/QRCodeCard';
import Screen from '../components/Screen';
import SectionTitle from '../components/SectionTitle';
import SheetModal from '../components/SheetModal';
import { Skeleton } from '../components/Skeleton';
import StackHeader from '../components/StackHeader';
import ToolGlyph from '../components/ToolGlyph';
import { useNotifications } from '../context/NotificationContext';
import { useResource } from '../hooks/useResource';
import { api } from '../services/api';
import { colors, radius, shadows } from '../theme';
import {
  formatDateTime,
  formatRupiah,
  formatTanggal,
  formatTanggalPanjang,
  selisihHari,
} from '../utils/format';
import { toLoanQr } from '../utils/scan';

function ItemRow({ item, onPress, last }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.itemRow,
        !last && styles.itemRowBorder,
        pressed && styles.pressed,
      ]}
    >
      <ToolGlyph tool={item} size={42} />
      <View style={styles.itemCopy}>
        <Text style={styles.itemName} numberOfLines={2}>{item.nama}</Text>
        <Text style={styles.itemMeta}>{item.kode} · {item.kategori_nama}</Text>
      </View>
      <View style={styles.qty}>
        <Text style={styles.qtyText}>{item.jumlah}×</Text>
      </View>
      <Ionicons name="chevron-forward" size={15} color={colors.faint} />
    </Pressable>
  );
}

function TimelineRow({ title, value, tone = colors.primary, last = false, muted = false }) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View
          style={[
            styles.timelineDot,
            { backgroundColor: muted ? colors.surfaceMuted : tone },
            muted && { borderWidth: 1, borderColor: colors.borderStrong },
          ]}
        />
        {!last ? <View style={styles.timelineLine} /> : null}
      </View>
      <View style={styles.timelineCopy}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={[styles.timelineValue, muted && styles.timelineMuted]}>{value}</Text>
      </View>
    </View>
  );
}

export default function DetailPinjamanScreen({ navigation, route }) {
  const { loanId } = route.params || {};
  const insets = useSafeAreaInsets();
  const { refresh: refreshNotifications } = useNotifications();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [justReturned, setJustReturned] = useState(false);

  const loadLoan = useCallback(() => api.get(`/loans/${loanId}`), [loanId]);
  const loanRes = useResource(loadLoan);

  const loan = loanRes.data;
  const late = loan?.status_efektif === 'terlambat';
  const returned = loan?.status === 'dikembalikan';
  const dendaSaatIni = returned ? Number(loan?.total_denda || 0) : Number(loan?.denda_berjalan || 0);
  const sisaHari = loan ? selisihHari(loan.tanggal_kembali_rencana) : 0;

  async function handleReturn() {
    if (submitting) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const updated = await api.post(`/loans/${loan.id}/return`);
      loanRes.setData(updated);
      setJustReturned(true);
      setConfirmOpen(false);
      refreshNotifications();
    } catch (error) {
      setActionError(error);
      if (error.code === 'SUDAH_DIKEMBALIKAN') {
        loanRes.reload('silent');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loanRes.loading && !loan) {
    return (
      <Screen padded={false}>
        <StackHeader title="Detail pinjaman" subtitle="Memuat..." />
        <View style={styles.loading}>
          <Skeleton height={120} radius={20} />
          <Skeleton height={220} radius={20} />
          <Skeleton height={140} radius={20} />
        </View>
      </Screen>
    );
  }

  if (loanRes.error && !loan) {
    return (
      <Screen padded={false}>
        <StackHeader title="Detail pinjaman" />
        <ErrorState error={loanRes.error} onRetry={() => loanRes.reload('refresh')} />
      </Screen>
    );
  }

  if (!loan) return null;

  const statusTitle = returned
    ? 'Sudah dikembalikan'
    : late
      ? `Terlambat ${loan.hari_terlambat} hari`
      : 'Sedang dipinjam';

  const statusSubtitle = returned
    ? loan.tanggal_kembali_aktual
      ? `Diterima ${formatTanggalPanjang(loan.tanggal_kembali_aktual)}`
      : 'Alat sudah kembali ke laboratorium.'
    : late
      ? 'Segera kembalikan untuk menghentikan denda harian.'
      : sisaHari === 0
        ? 'Jatuh tempo hari ini. Kembalikan sebelum laboratorium tutup.'
        : sisaHari === 1
          ? 'Jatuh tempo besok. Siapkan alatnya dari sekarang.'
          : `Masih ${sisaHari} hari lagi. Kembalikan sebelum ${formatTanggal(loan.tanggal_kembali_rencana)}.`;

  const heroTone = returned
    ? { bg: colors.surfaceMuted, fg: colors.body, icon: 'checkmark-done-circle' }
    : late
      ? { bg: colors.dangerSoft, fg: colors.danger, icon: 'alert-circle' }
      : { bg: colors.primaryTint, fg: colors.primaryDark, icon: 'time' };

  return (
    <Screen padded={false}>
      <StackHeader
        title="Detail pinjaman"
        subtitle={loan.kode}
        right={<StatusPill status={loan.status_efektif} />}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={(
          <RefreshControl
            refreshing={loanRes.refreshing}
            onRefresh={() => loanRes.reload('refresh')}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        )}
      >
        {justReturned ? (
          <InlineNotice
            tone="success"
            icon="checkmark-circle"
            title="Pengembalian berhasil dicatat"
            message={
              Number(loan.total_denda) > 0
                ? `Denda ${formatRupiah(loan.total_denda)} tercatat pada pinjaman ini.`
                : 'Alat dikembalikan tepat waktu tanpa denda.'
            }
          />
        ) : null}

        <View style={[styles.statusHero, { backgroundColor: heroTone.bg }]}>
          <View style={styles.statusTop}>
            <View style={[styles.statusIcon, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
              <Ionicons name={heroTone.icon} size={23} color={heroTone.fg} />
            </View>
            <View style={styles.statusCopy}>
              <Text style={styles.statusLabel}>STATUS PINJAMAN</Text>
              <Text style={[styles.statusTitle, { color: heroTone.fg }]}>{statusTitle}</Text>
            </View>
            {!returned ? (
              <Pill
                label={`${loan.total_unit} unit`}
                tone="neutral"
                style={{ backgroundColor: 'rgba(255,255,255,0.65)' }}
              />
            ) : null}
          </View>
          <Text style={styles.statusSubtitle}>{statusSubtitle}</Text>
          <View style={styles.statusDates}>
            <View>
              <Text style={styles.statusDateLabel}>Jatuh tempo</Text>
              <Text style={styles.statusDateValue}>{formatTanggal(loan.tanggal_kembali_rencana)}</Text>
            </View>
            <View style={styles.statusDateRight}>
              <Text style={styles.statusDateLabel}>
                {returned ? 'Dikembalikan' : 'Denda saat ini'}
              </Text>
              <Text style={[styles.statusDateValue, !returned && dendaSaatIni > 0 && { color: colors.danger }]}>
                {returned
                  ? formatTanggal(loan.tanggal_kembali_aktual)
                  : dendaSaatIni > 0
                    ? formatRupiah(dendaSaatIni)
                    : 'Tidak ada'}
              </Text>
            </View>
          </View>
        </View>

        {!returned ? (
          <QRCodeCard
            value={toLoanQr(loan.kode)}
            code={loan.kode}
            label="Tunjukkan QR ini saat mengambil atau mengembalikan alat"
            size={156}
          />
        ) : null}

        <View style={styles.section}>
          <SectionTitle
            title={`Alat dipinjam (${loan.total_unit} unit)`}
            subtitle={`${loan.jumlah_item} jenis alat`}
          />
          <View style={styles.itemsCard}>
            {loan.items.map((item, index) => (
              <ItemRow
                key={item.id}
                item={item}
                last={index === loan.items.length - 1}
                onPress={() => navigation.navigate('DetailAlat', { toolId: item.tool_id })}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Riwayat pinjaman" />
          <View style={styles.timelineCard}>
            <TimelineRow
              title="Pinjaman diajukan"
              value={formatDateTime(loan.created_at)}
            />
            <TimelineRow
              title="Batas pengembalian"
              value={formatTanggalPanjang(loan.tanggal_kembali_rencana)}
              tone={late ? colors.danger : colors.primary}
            />
            <TimelineRow
              title={returned ? 'Alat dikembalikan' : 'Menunggu pengembalian'}
              value={
                returned
                  ? formatTanggalPanjang(loan.tanggal_kembali_aktual)
                  : 'Belum dikembalikan'
              }
              tone={returned ? colors.primary : colors.borderStrong}
              muted={!returned}
              last
            />
          </View>
        </View>

        {dendaSaatIni > 0 ? (
          <View style={styles.fineCard}>
            <View style={styles.fineHead}>
              <Ionicons name="wallet-outline" size={17} color={colors.danger} />
              <Text style={styles.fineTitle}>
                {returned ? 'Rincian denda' : 'Denda berjalan'}
              </Text>
              <Text style={styles.fineTotal}>{formatRupiah(dendaSaatIni)}</Text>
            </View>
            <View style={styles.fineLine}>
              <Text style={styles.fineLabel}>Hari terlambat</Text>
              <Text style={styles.fineValue}>{loan.hari_terlambat} hari</Text>
            </View>
            <View style={styles.fineLine}>
              <Text style={styles.fineLabel}>Denda per hari</Text>
              <Text style={styles.fineValue}>
                {formatRupiah(loan.hari_terlambat > 0 ? dendaSaatIni / loan.hari_terlambat : 0)}
              </Text>
            </View>
            {!returned ? (
              <Text style={styles.fineNote}>
                Jumlah ini masih bertambah sampai alat dikembalikan.
              </Text>
            ) : null}
          </View>
        ) : null}

        {loan.catatan ? (
          <View style={styles.section}>
            <SectionTitle title="Catatan" />
            <View style={styles.notesCard}>
              <Ionicons name="chatbox-ellipses-outline" size={17} color={colors.primaryDark} />
              <Text style={styles.notesText}>{loan.catatan}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {loan.bisa_dikembalikan ? (
          <>
            <View style={styles.footerCopy}>
              <Text style={styles.footerLabel}>
                {late ? 'Denda berjalan' : 'Status denda'}
              </Text>
              <Text style={[styles.footerValue, late && { color: colors.danger }]}>
                {late ? formatRupiah(dendaSaatIni) : 'Rp0'}
              </Text>
            </View>
            <Button
              title="Kembalikan alat"
              icon="return-down-back-outline"
              variant={late ? 'danger' : 'primary'}
              onPress={() => {
                setActionError(null);
                setConfirmOpen(true);
              }}
              style={styles.footerButton}
            />
          </>
        ) : (
          <Button
            title="Pinjam alat lagi"
            icon="repeat-outline"
            variant="secondary"
            onPress={() => {
              const first = loan.items?.[0];
              if (first) navigation.navigate('DetailAlat', { toolId: first.tool_id });
              else navigation.navigate('Katalog');
            }}
          />
        )}
      </View>

      <SheetModal
        visible={confirmOpen}
        onClose={() => {
          if (!submitting) setConfirmOpen(false);
        }}
        title="Kembalikan alat?"
        subtitle="Pastikan seluruh alat sudah diserahkan ke laboran."
      >
        <View style={styles.confirmSummary}>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>Kode pinjaman</Text>
            <Text style={styles.confirmValue}>{loan.kode}</Text>
          </View>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>Jumlah alat</Text>
            <Text style={styles.confirmValue}>{loan.total_unit} unit</Text>
          </View>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>Jatuh tempo</Text>
            <Text style={styles.confirmValue}>{formatTanggal(loan.tanggal_kembali_rencana)}</Text>
          </View>
          <View style={[styles.confirmRow, styles.confirmRowLast]}>
            <Text style={styles.confirmLabel}>Denda saat ini</Text>
            <Text style={[styles.confirmValue, dendaSaatIni > 0 && { color: colors.danger }]}>
              {formatRupiah(dendaSaatIni)}
            </Text>
          </View>
        </View>

        {dendaSaatIni > 0 ? (
          <InlineNotice
            tone="danger"
            icon="alert-circle"
            title={`Terlambat ${loan.hari_terlambat} hari`}
            message={`Denda ${formatRupiah(dendaSaatIni)} akan dicatat saat pengembalian diproses.`}
            style={styles.confirmNotice}
          />
        ) : null}

        {actionError ? (
          <InlineNotice
            tone="danger"
            title="Pengembalian gagal"
            message={actionError.message}
            style={styles.confirmNotice}
          />
        ) : null}

        <View style={styles.confirmActions}>
          <Button
            title="Batal"
            variant="secondary"
            disabled={submitting}
            onPress={() => setConfirmOpen(false)}
            style={styles.confirmButton}
          />
          <Button
            title="Ya, kembalikan"
            icon="checkmark"
            loading={submitting}
            onPress={handleReturn}
            style={styles.confirmButton}
          />
        </View>
        <Text style={styles.confirmNote}>
          Denda final dihitung oleh server berdasarkan tanggal pengembalian.
        </Text>
      </SheetModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingHorizontal: 20,
    gap: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 16,
  },
  pressed: { opacity: 0.82 },
  statusHero: {
    borderRadius: radius.xl,
    padding: 16,
    gap: 10,
  },
  statusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCopy: { flex: 1, gap: 1 },
  statusLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.muted,
  },
  statusTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.35,
  },
  statusSubtitle: {
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.body,
  },
  statusDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(14,33,28,0.08)',
    paddingTop: 10,
    marginTop: 2,
  },
  statusDateRight: { alignItems: 'flex-end' },
  statusDateLabel: {
    fontSize: 9,
    color: colors.muted,
    fontWeight: '600',
  },
  statusDateValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 1,
  },
  section: { gap: 8 },
  itemsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.soft,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemCopy: { flex: 1, gap: 2 },
  itemName: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  itemMeta: {
    fontSize: 9.5,
    color: colors.muted,
  },
  qty: {
    minWidth: 30,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  qtyText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  timelineCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 11,
  },
  timelineRail: {
    width: 12,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
  },
  timelineLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 3,
  },
  timelineCopy: { flex: 1, paddingBottom: 15, gap: 1 },
  timelineTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.ink,
  },
  timelineValue: {
    fontSize: 10.5,
    color: colors.muted,
  },
  timelineMuted: { color: colors.faint },
  fineCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    padding: 14,
    gap: 7,
  },
  fineHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 2,
  },
  fineTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  fineTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.danger,
  },
  fineLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fineLabel: { fontSize: 11, color: colors.muted },
  fineValue: { fontSize: 11, fontWeight: '700', color: colors.body },
  fineNote: {
    fontSize: 9.5,
    color: colors.danger,
    marginTop: 2,
  },
  notesCard: {
    flexDirection: 'row',
    gap: 9,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.body,
  },
  bottomSpacer: { height: 2 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.sheet,
    shadowOpacity: 0.06,
  },
  footerCopy: { width: 100, gap: 1 },
  footerLabel: { fontSize: 9, color: colors.muted },
  footerValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
  },
  footerButton: { flex: 1 },
  confirmSummary: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: 13,
    marginBottom: 12,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  confirmRowLast: { borderBottomWidth: 0 },
  confirmLabel: { fontSize: 11, color: colors.muted },
  confirmValue: { fontSize: 12, fontWeight: '700', color: colors.ink },
  confirmNotice: { marginBottom: 12 },
  confirmActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 2,
  },
  confirmButton: { flex: 1 },
  confirmNote: {
    fontSize: 9.5,
    color: colors.faint,
    textAlign: 'center',
    marginTop: 10,
  },
});
