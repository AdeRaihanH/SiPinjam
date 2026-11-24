import { StyleSheet, Text, View } from 'react-native';

import Card from '../../../components/Card';
import { formatTanggal } from '../../../lib/format';
import { colors, type, weight } from '../../../theme/tokens';

function TimelineRow({ title, value, active, last, danger = false }) {
  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View
          style={[
            styles.dot,
            active && styles.dotActive,
            danger && styles.dotDanger,
          ]}
        />
        {!last ? <View style={styles.line} /> : null}
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, danger && { color: colors.danger }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function LoanTimeline({ loan, late, returned }) {
  return (
    <Card style={styles.card}>
      <TimelineRow
        title="Pinjaman diajukan"
        value={formatTanggal(loan.tanggal_pinjam)}
        active
      />
      <TimelineRow
        title="Jatuh tempo"
        value={formatTanggal(loan.tanggal_kembali_rencana)}
        active
        danger={late}
      />
      <TimelineRow
        title="Dikembalikan"
        value={returned ? formatTanggal(loan.tanggal_kembali_aktual) : 'Belum dikembalikan'}
        active={returned}
        last
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 14 },
  row: { flexDirection: 'row', gap: 10 },
  rail: { width: 10, alignItems: 'center' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderStrong,
    marginTop: 3,
  },
  dotActive: { backgroundColor: colors.accentInk },
  dotDanger: { backgroundColor: colors.danger },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 3,
  },
  copy: { flex: 1, paddingBottom: 14, gap: 1 },
  title: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.text },
  value: { fontSize: type.xs, color: colors.muted },
});
