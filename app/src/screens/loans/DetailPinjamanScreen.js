import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorState from '../../components/ErrorState';
import HeroGlow from '../../components/HeroGlow';
import InlineNotice from '../../components/InlineNotice';
import QRCodeCard from '../../components/QRCodeCard';
import Screen from '../../components/Screen';
import SectionTitle from '../../components/SectionTitle';
import { Skeleton } from '../../components/Skeleton';
import StackHeader from '../../components/StackHeader';
import StatusPill from '../../components/StatusPill';
import { loansApi } from '../../api/loans';
import { useNotificationBadge } from '../../context/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import { useLoanDetail } from '../../hooks/useLoanDetail';
import {
  formatRupiah,
  formatTanggal,
  formatTanggalPanjang,
} from '../../lib/format';
import { LOAN_FINE_PER_DAY } from '../../lib/loanRules';
import { toLoanQr } from '../../lib/scan';
import { colors, gradients, layout, radius, shadows, type, weight } from '../../theme/tokens';
import LoanItemRow from './components/LoanItemRow';
import LoanTimeline from './components/LoanTimeline';
import ReturnConfirmSheet from './components/ReturnConfirmSheet';

export default function DetailPinjamanScreen({ navigation, route }) {
  const { loanId } = route.params || {};
  const insets = useSafeAreaInsets();
  const { member: authMember } = useAuth();
  const isAdmin = authMember?.role === 'admin';
  const { refresh: refreshBadge } = useNotificationBadge();
  const query = useLoanDetail(loanId);
  const { refetch } = query;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [justReturned, setJustReturned] = useState(false);

  const loan = query.data;
  const late = loan?.status_efektif === 'terlambat';
  const returned = loan?.status === 'dikembalikan';
  const denda = returned ? Number(loan?.total_denda || 0) : Number(loan?.denda_berjalan || 0);

  const onRefresh = useCallback(() => refetch('refresh'), [refetch]);

  async function handleReturn() {
    if (submitting) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await loansApi.returnLoan(loan.id);
      setConfirmOpen(false);
      setJustReturned(true);
      await refetch('silent');
      refreshBadge();
    } catch (error) {
      setActionError(error);
      if (error.code === 'CONFLICT') refetch('silent');
    } finally {
      setSubmitting(false);
    }
  }

  if (query.loading && !loan) {
    return (
      <Screen padded={false}>
        <StackHeader title="Detail pinjaman" subtitle="Memuat..." />
        <View style={styles.loading}>
          <Skeleton height={112} radius={16} />
          <Skeleton height={200} radius={16} />
          <Skeleton height={130} radius={16} />
        </View>
      </Screen>
    );
  }

  if (query.error && !loan) {
    return (
      <Screen padded={false}>
        <StackHeader title="Detail pinjaman" />
        <ErrorState error={query.error} onRetry={() => query.refetch('refresh')} />
      </Screen>
    );
  }

  if (!loan) return null;

  const statusTitle = returned
    ? 'Sudah dikembalikan'
    : late
      ? `Terlambat ${loan.hari_terlambat} hari`
      : 'Sedang dipinjam';

  return (
    <Screen padded={false}>
      <StatusBar style="dark" />
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
            refreshing={query.refreshing}
            onRefresh={onRefresh}
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
            message={denda > 0
              ? `Denda ${formatRupiah(denda)} tercatat pada pinjaman ini.`
              : 'Alat dikembalikan tepat waktu tanpa denda.'}
          />
        ) : null}

        {isAdmin && loan.member ? (
          <View style={styles.borrowerCard}>
            <View style={styles.borrowerIcon}>
              <Ionicons name="person-outline" size={16} color={colors.primary} />
            </View>
            <View style={styles.borrowerCopy}>
              <Text style={styles.borrowerLabel}>Peminjam</Text>
              <Text style={styles.borrowerName} numberOfLines={1}>
                {loan.member.nama} · {loan.member.nim}
              </Text>
            </View>
          </View>
        ) : null}

        <LinearGradient
          colors={returned ? ['#3C4B43', '#202D27'] : late ? gradients.danger : gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statusCard}
        >
          <HeroGlow />
          <View style={styles.statusHead}>
            <Text style={styles.statusLabel}>Status pinjaman</Text>
            <StatusPill status={loan.status_efektif} />
          </View>
          <Text style={styles.statusTitle}>
            {statusTitle}
          </Text>
          <Text style={styles.statusMessage}>
            {returned
              ? `Diterima ${formatTanggalPanjang(loan.tanggal_kembali_aktual)}.`
              : late
                ? 'Segera kembalikan alat untuk menghentikan denda harian.'
                : `Kembalikan sebelum ${formatTanggalPanjang(loan.tanggal_kembali_rencana)}.`}
          </Text>
          <View style={styles.statusMeta}>
            <View>
              <Text style={styles.statusMetaLabel}>Jatuh tempo</Text>
              <Text style={styles.statusMetaValue}>{formatTanggal(loan.tanggal_kembali_rencana)}</Text>
            </View>
            <View style={styles.statusMetaRight}>
              <Text style={styles.statusMetaLabel}>
                {returned ? 'Dikembalikan' : 'Denda berjalan'}
              </Text>
              <Text style={[styles.statusMetaValue, !returned && denda > 0 && styles.statusMetaDanger]}>
                {returned
                  ? formatTanggal(loan.tanggal_kembali_aktual)
                  : denda > 0 ? formatRupiah(denda) : 'Tidak ada'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <SectionTitle title="Alat dipinjam" subtitle={`${loan.total_unit} unit`} />
          <Card padded={false}>
            {loan.items?.map((item, index) => (
              <LoanItemRow
                key={item.id}
                item={item}
                last={index === (loan.items?.length || 0) - 1}
                onPress={() => navigation.navigate('DetailAlat', { toolId: item.tool_id })}
              />
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Riwayat" />
          <LoanTimeline loan={loan} late={late} returned={returned} />
        </View>

        {denda > 0 ? (
          <Card style={styles.fineCard}>
            <View style={styles.fineHead}>
              <Ionicons name="wallet-outline" size={17} color={colors.danger} />
              <Text style={styles.fineTitle}>{returned ? 'Denda tercatat' : 'Denda berjalan'}</Text>
              <Text style={styles.fineTotal}>{formatRupiah(denda)}</Text>
            </View>
            <View style={styles.fineRow}>
              <Text style={styles.fineLabel}>Hari terlambat</Text>
              <Text style={styles.fineValue}>{loan.hari_terlambat} hari</Text>
            </View>
            <View style={styles.fineRow}>
              <Text style={styles.fineLabel}>Tarif per hari</Text>
              <Text style={styles.fineValue}>
                {formatRupiah(loan.denda_per_hari ?? LOAN_FINE_PER_DAY)}
              </Text>
            </View>
            {!returned ? (
              <Text style={styles.fineNote}>Denda masih bertambah sampai alat dikembalikan.</Text>
            ) : null}
          </Card>
        ) : null}

        {!returned ? (
          <QRCodeCard
            value={toLoanQr(loan.kode)}
            code={loan.kode}
            label="Tunjukkan QR ini ke laboran saat mengambil atau mengembalikan alat"
            size={156}
          />
        ) : null}

        {loan.catatan ? (
          <View style={styles.section}>
            <SectionTitle title="Catatan" />
            <Card>
              <Text style={styles.notes}>{loan.catatan}</Text>
            </Card>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {loan.bisa_dikembalikan ? (
          <>
            <View style={styles.footerCopy}>
              <Text style={styles.footerLabel}>{late ? 'Denda berjalan' : 'Denda'}</Text>
              <Text style={[styles.footerValue, late && { color: colors.danger }]}>
                {late ? formatRupiah(denda) : 'Rp0'}
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

      <ReturnConfirmSheet
        visible={confirmOpen}
        loan={loan}
        denda={denda}
        submitting={submitting}
        error={actionError}
        onClose={() => { if (!submitting) setConfirmOpen(false); }}
        onConfirm={handleReturn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { paddingHorizontal: layout.screenPadding, gap: 12 },
  borrowerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  borrowerIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borrowerCopy: { flex: 1, gap: 1 },
  borrowerLabel: {
    fontSize: 9,
    fontWeight: weight.bold,
    color: colors.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  borrowerName: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.text },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 16,
    gap: 16,
  },
  statusCard: { gap: 7, borderRadius: radius.lg, padding: 18, overflow: 'hidden' },
  statusHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLabel: {
    fontSize: type.xxs,
    fontWeight: weight.bold,
    color: 'rgba(255,255,255,0.52)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statusTitle: { fontSize: 24, fontWeight: weight.heavy, color: colors.white, letterSpacing: -0.6 },
  statusMessage: { fontSize: type.xs, lineHeight: 18, color: 'rgba(255,255,255,0.66)' },
  statusMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    marginTop: 6,
  },
  statusMetaRight: { alignItems: 'flex-end' },
  statusMetaLabel: { fontSize: type.xs, color: 'rgba(255,255,255,0.6)' },
  statusMetaValue: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.white, marginTop: 2 },
  statusMetaDanger: { color: '#F2C9C4' },
  section: { gap: 10 },
  fineCard: { borderColor: '#EFCFCB', gap: 8 },
  fineHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  fineTitle: { flex: 1, fontSize: type.xs, fontWeight: weight.semibold, color: colors.text },
  fineTotal: { fontSize: type.sm, fontWeight: weight.bold, color: colors.danger },
  fineRow: { flexDirection: 'row', justifyContent: 'space-between' },
  fineLabel: { fontSize: type.xs, color: colors.muted },
  fineValue: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.text },
  fineNote: { fontSize: type.xs, color: colors.danger, marginTop: 1 },
  notes: { fontSize: type.sm, lineHeight: 20, color: colors.text },
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
  footerCopy: { width: 92, gap: 1 },
  footerLabel: { fontSize: type.xs, color: colors.muted },
  footerValue: { fontSize: type.sm, fontWeight: weight.bold, color: colors.text },
  footerButton: { flex: 1 },
});
