import { StyleSheet, Text, View } from 'react-native';

import Button from '../../../components/Button';
import SheetModal from '../../../components/SheetModal';
import StatusPill from '../../../components/StatusPill';
import ToolPhoto from '../../../components/ToolPhoto';
import { formatRupiah, formatTanggal } from '../../../lib/format';
import { colors, radius, type, weight } from '../../../theme/tokens';

function ToolResult({ tool, onOpen }) {
  return (
    <>
      <View style={styles.row}>
        <ToolPhoto tool={tool} width={54} height={54} />
        <View style={styles.copy}>
          <Text style={styles.meta}>{tool.kategori?.nama}</Text>
          <Text style={styles.title}>{tool.nama}</Text>
          <Text style={styles.code}>{tool.kode}</Text>
        </View>
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{tool.stok_tersedia}</Text>
          <Text style={styles.statLabel}>Tersedia</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{tool.stok_total}</Text>
          <Text style={styles.statLabel}>Total unit</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {tool.kondisi === 'baik' ? 'Baik' : 'Rusak ringan'}
          </Text>
          <Text style={styles.statLabel}>Kondisi</Text>
        </View>
      </View>
      <Button title="Lihat detail alat" icon="arrow-forward" onPress={onOpen} />
    </>
  );
}

function LoanResult({ loan, onOpen }) {
  return (
    <>
      <View style={styles.loanHead}>
        <View style={styles.copy}>
          <Text style={styles.meta}>Kode pinjaman</Text>
          <Text style={styles.code}>{loan.kode}</Text>
        </View>
        <StatusPill status={loan.status_efektif} />
      </View>
      <Text style={styles.title}>{loan.ringkasan_alat}</Text>
      <Text style={styles.due}>
        Jatuh tempo {formatTanggal(loan.tanggal_kembali_rencana)}
      </Text>
      {Number(loan.denda_berjalan) > 0 ? (
        <Text style={styles.fine}>
          Denda berjalan {formatRupiah(loan.denda_berjalan)}
        </Text>
      ) : null}
      <Button
        title="Buka detail pinjaman"
        icon="arrow-forward"
        onPress={onOpen}
        style={styles.button}
      />
    </>
  );
}

export default function ScanResultSheet({ result, visible, onClose, onOpen }) {
  return (
    <SheetModal
      visible={visible}
      onClose={onClose}
      title={result?.type === 'tool' ? 'Alat ditemukan' : 'Pinjaman ditemukan'}
      subtitle="Hasil pemindaian QR"
    >
      {result?.type === 'tool' ? (
        <ToolResult tool={result.data} onOpen={onOpen} />
      ) : result ? (
        <LoanResult loan={result.data} onOpen={onOpen} />
      ) : null}
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  copy: { flex: 1, gap: 1 },
  meta: { fontSize: type.xs, color: colors.muted },
  title: { fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  code: { fontSize: type.xs, color: colors.muted },
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingVertical: 12,
    marginBottom: 16,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: type.sm, fontWeight: weight.bold, color: colors.text },
  statLabel: { fontSize: type.xs, color: colors.muted },
  loanHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  due: { fontSize: type.xs, color: colors.muted, marginTop: 3 },
  fine: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.danger, marginTop: 4 },
  button: { marginTop: 16 },
});
