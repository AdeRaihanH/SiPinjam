import { StyleSheet, Text, View } from 'react-native';

import Button from '../../../components/Button';
import Card from '../../../components/Card';
import InlineNotice from '../../../components/InlineNotice';
import SheetModal from '../../../components/SheetModal';
import { formatRupiah, formatTanggal } from '../../../lib/format';
import { colors, type, weight } from '../../../theme/tokens';

function ConfirmRow({ label, value, last = false, danger = false }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, danger && { color: colors.danger }]}>{value}</Text>
    </View>
  );
}

export default function ReturnConfirmSheet({
  visible,
  loan,
  denda,
  submitting,
  error,
  onClose,
  onConfirm,
}) {
  return (
    <SheetModal
      visible={visible}
      onClose={onClose}
      title="Kembalikan alat?"
      subtitle="Pastikan seluruh alat sudah diserahkan ke laboran."
    >
      <Card padded={false} style={styles.card}>
        <ConfirmRow label="Kode pinjaman" value={loan.kode} />
        <ConfirmRow label="Jumlah alat" value={`${loan.total_unit} unit`} />
        <ConfirmRow label="Jatuh tempo" value={formatTanggal(loan.tanggal_kembali_rencana)} />
        <ConfirmRow
          label="Denda saat ini"
          value={formatRupiah(denda)}
          danger={denda > 0}
          last
        />
      </Card>

      {denda > 0 ? (
        <InlineNotice
          tone="danger"
          title={`Terlambat ${loan.hari_terlambat} hari`}
          message={`Denda ${formatRupiah(denda)} akan dicatat saat pengembalian diproses.`}
          style={styles.notice}
        />
      ) : null}

      {error ? (
        <InlineNotice
          tone="danger"
          title="Pengembalian gagal"
          message={error.message}
          style={styles.notice}
        />
      ) : null}

      <View style={styles.actions}>
        <Button
          title="Batal"
          variant="secondary"
          disabled={submitting}
          onPress={onClose}
          style={styles.button}
        />
        <Button
          title="Ya, kembalikan"
          loading={submitting}
          onPress={onConfirm}
          style={styles.button}
        />
      </View>
      <Text style={styles.note}>
        Denda final dihitung server saat pengembalian diproses.
      </Text>
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  label: { fontSize: type.xs, color: colors.muted },
  value: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.text },
  notice: { marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  button: { flex: 1 },
  note: { fontSize: type.xs, color: colors.faint, textAlign: 'center', marginTop: 10 },
});
