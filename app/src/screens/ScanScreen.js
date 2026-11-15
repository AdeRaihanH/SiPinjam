import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../components/Button';
import SheetModal from '../components/SheetModal';
import StatusPill from '../components/StatusPill';
import ToolPhoto from '../components/ToolPhoto';
import { loansApi } from '../api/loans';
import { toolsApi } from '../api/tools';
import { formatRupiah, formatTanggal } from '../lib/format';
import { parseKode, parseQr } from '../lib/scan';
import { colors, radius, type, weight } from '../theme/tokens';

const FRAME = 236;

function Corner({ style }) {
  return <View style={[styles.corner, style]} />;
}

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [torch, setTorch] = useState(false);
  const [looking, setLooking] = useState(false);
  const [manual, setManual] = useState('');
  const [result, setResult] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  const processing = useRef(false);
  const resumeAt = useRef(0);
  const laser = useMemo(() => new Animated.Value(8), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(laser, { toValue: FRAME - 28, duration: 1900, useNativeDriver: true }),
        Animated.timing(laser, { toValue: 8, duration: 1900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [laser]);

  const isWeb = Platform.OS === 'web';
  const denied = permission && !permission.granted;
  const cameraReady = !isWeb && permission?.granted && isFocused && !resultOpen && !notice;
  const showPermission = isWeb || denied;

  async function lookup(parsed) {
    if (processing.current) return;
    processing.current = true;
    setLooking(true);
    try {
      const data = parsed.type === 'tool'
        ? await toolsApi.byKode(parsed.code)
        : await loansApi.byKode(parsed.code);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setResult({ type: parsed.type, data });
      setResultOpen(true);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setNotice({
        title: 'Kode tidak ditemukan',
        message: error.message,
      });
      resumeAt.current = Date.now() + 1500;
    } finally {
      setLooking(false);
      processing.current = false;
    }
  }

  function processRaw(raw) {
    if (processing.current || Date.now() < resumeAt.current) return;
    const parsed = parseQr(raw);
    if (!parsed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setNotice({
        title: 'QR tidak dikenali',
        message: 'QR ini bukan milik SiPinjam. Gunakan QR alat atau pinjaman yang tertera.',
      });
      resumeAt.current = Date.now() + 1800;
      return;
    }
    lookup(parsed);
  }

  function submitManual() {
    const parsed = parseKode(manual);
    if (!parsed) {
      setNotice({
        title: 'Kode tidak valid',
        message: 'Gunakan format ELK-001, JAR-001, ALK-001, KOM-001, atau kode pinjaman PJM-YYMMDD-NNN.',
      });
      return;
    }
    resumeAt.current = 0;
    lookup(parsed);
  }

  function closeResult() {
    setResultOpen(false);
    resumeAt.current = Date.now() + 1200;
  }

  function openResult() {
    if (!result) return;
    const { type, data } = result;
    setResultOpen(false);
    resumeAt.current = Date.now() + 1500;
    if (type === 'tool') {
      navigation.navigate('DetailAlat', { toolId: data.id, tool: data });
    } else {
      navigation.navigate('DetailPinjaman', { loanId: data.id });
    }
  }

  return (
    <View style={styles.root}>
      {isFocused ? <StatusBar style="light" /> : null}

      <View style={styles.cameraArea}>
        {cameraReady ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={torch}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => processRaw(data)}
          />
        ) : (
          <View style={styles.fallback}>
            <Ionicons name="camera-outline" size={48} color="rgba(255,255,255,0.18)" />
          </View>
        )}

        <SafeAreaView edges={['top']} style={styles.top}>
          <View style={styles.topBar}>
            <View style={styles.topCopy}>
              <Text style={styles.topTitle}>Pindai QR</Text>
              <Text style={styles.topSubtitle}>Alat atau bukti pinjaman</Text>
            </View>
            {cameraReady ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={torch ? 'Matikan flash' : 'Nyalakan flash'}
                onPress={() => setTorch((value) => !value)}
                style={[styles.iconButton, torch && styles.iconButtonActive]}
              >
                <Ionicons
                  name={torch ? 'flashlight' : 'flashlight-outline'}
                  size={19}
                  color={torch ? colors.primary : colors.white}
                />
              </Pressable>
            ) : null}
          </View>
        </SafeAreaView>

        <View style={styles.center}>
          {showPermission ? (
            <View style={styles.permission}>
              <View style={styles.permissionIcon}>
                <Ionicons name="camera-outline" size={26} color={colors.primary} />
              </View>
              <Text style={styles.permissionTitle}>
                {isWeb ? 'Kamera tersedia di aplikasi' : 'Izin kamera diperlukan'}
              </Text>
              <Text style={styles.permissionText}>
                {isWeb
                  ? 'Gunakan input kode manual di bawah untuk mencoba alur pemindaian di browser.'
                  : 'SiPinjam memakai kamera hanya untuk membaca QR alat dan pinjaman.'}
              </Text>
              {!isWeb && permission?.canAskAgain !== false ? (
                <Button
                  title="Izinkan kamera"
                  size="sm"
                  fullWidth={false}
                  onPress={requestPermission}
                  style={styles.permissionButton}
                />
              ) : null}
              {!isWeb && permission?.canAskAgain === false ? (
                <Button
                  title="Buka pengaturan"
                  icon="settings-outline"
                  size="sm"
                  variant="secondary"
                  fullWidth={false}
                  onPress={() => Linking.openSettings()}
                  style={styles.permissionButton}
                />
              ) : null}
            </View>
          ) : (
            <>
              <View style={styles.frame}>
                <Corner style={styles.tl} />
                <Corner style={styles.tr} />
                <Corner style={styles.bl} />
                <Corner style={styles.br} />
                {looking ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Animated.View style={[styles.laser, { transform: [{ translateY: laser }] }]} />
                )}
              </View>
              <Text style={styles.frameHint}>Posisikan QR di dalam kotak</Text>
            </>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Text style={styles.panelTitle}>Input kode manual</Text>
          <View style={styles.manualRow}>
            <TextInput
              value={manual}
              onChangeText={setManual}
              placeholder="ELK-001 atau PJM-..."
              placeholderTextColor={colors.faint}
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.input}
              selectionColor={colors.accent}
              returnKeyType="go"
              onSubmitEditing={submitManual}
            />
            <Pressable
              accessibilityRole="button"
              onPress={submitManual}
              style={({ pressed }) => [styles.openButton, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.openText}>Buka</Text>
            </Pressable>
          </View>
          <Text style={styles.hint}>
            QR format: SIPINJAM:TOOL:ELK-001 · SIPINJAM:LOAN:PJM-...
          </Text>
        </View>
      </KeyboardAvoidingView>

      <SheetModal
        visible={Boolean(notice)}
        onClose={() => {
          setNotice(null);
          resumeAt.current = Date.now() + 1200;
        }}
        title={notice?.title || 'QR tidak dikenali'}
        subtitle="Hasil pemindaian"
      >
        <Text style={styles.noticeText}>{notice?.message}</Text>
        <Button
          title="Coba lagi"
          onPress={() => {
            setNotice(null);
            resumeAt.current = Date.now() + 1200;
          }}
          style={styles.noticeButton}
        />
      </SheetModal>

      <SheetModal
        visible={Boolean(resultOpen && result)}
        onClose={closeResult}
        title={result?.type === 'tool' ? 'Alat ditemukan' : 'Pinjaman ditemukan'}
        subtitle="Hasil pemindaian QR"
      >
        {result?.type === 'tool' ? (
          <>
            <View style={styles.resultRow}>
              <ToolPhoto tool={result.data} width={54} height={54} />
              <View style={styles.resultCopy}>
                <Text style={styles.resultMeta}>{result.data.kategori?.nama}</Text>
                <Text style={styles.resultTitle}>{result.data.nama}</Text>
                <Text style={styles.resultCode}>{result.data.kode}</Text>
              </View>
            </View>
            <View style={styles.resultStats}>
              <View style={styles.resultStat}>
                <Text style={styles.statValue}>{result.data.stok_tersedia}</Text>
                <Text style={styles.statLabel}>Tersedia</Text>
              </View>
              <View style={styles.resultStat}>
                <Text style={styles.statValue}>{result.data.stok_total}</Text>
                <Text style={styles.statLabel}>Total unit</Text>
              </View>
              <View style={styles.resultStat}>
                <Text style={styles.statValue}>
                  {result.data.kondisi === 'baik' ? 'Baik' : 'Rusak ringan'}
                </Text>
                <Text style={styles.statLabel}>Kondisi</Text>
              </View>
            </View>
            <Button title="Lihat detail alat" icon="arrow-forward" onPress={openResult} />
          </>
        ) : result ? (
          <>
            <View style={styles.loanHead}>
              <View style={styles.resultCopy}>
                <Text style={styles.resultMeta}>Kode pinjaman</Text>
                <Text style={styles.resultCode}>{result.data.kode}</Text>
              </View>
              <StatusPill status={result.data.status_efektif} />
            </View>
            <Text style={styles.resultTitle}>{result.data.ringkasan_alat}</Text>
            <Text style={styles.resultDue}>
              Jatuh tempo {formatTanggal(result.data.tanggal_kembali_rencana)}
            </Text>
            {Number(result.data.denda_berjalan) > 0 ? (
              <Text style={styles.resultFine}>
                Denda berjalan {formatRupiah(result.data.denda_berjalan)}
              </Text>
            ) : null}
            <Button
              title="Buka detail pinjaman"
              icon="arrow-forward"
              onPress={openResult}
              style={styles.resultButton}
            />
          </>
        ) : null}
      </SheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  cameraArea: { flex: 1, backgroundColor: colors.primary },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  top: { position: 'absolute', top: 0, left: 0, right: 0 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  topCopy: { flex: 1, gap: 1 },
  topTitle: { fontSize: type.md, fontWeight: weight.bold, color: colors.white },
  topSubtitle: { fontSize: type.xs, color: 'rgba(255,255,255,0.64)' },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: { backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40, gap: 12 },
  frame: {
    width: FRAME,
    height: FRAME,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: colors.white },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 12 },
  laser: {
    position: 'absolute',
    top: 0,
    width: FRAME - 36,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.accent,
  },
  frameHint: { fontSize: type.xs, color: 'rgba(255,255,255,0.72)' },
  permission: {
    width: 300,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: 20,
    alignItems: 'center',
    gap: 7,
  },
  permissionIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  permissionTitle: { fontSize: type.md, fontWeight: weight.semibold, color: colors.text, textAlign: 'center' },
  permissionText: { fontSize: type.xs, lineHeight: 17, color: colors.muted, textAlign: 'center' },
  permissionButton: { marginTop: 6 },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 9,
  },
  panelTitle: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.muted },
  manualRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontSize: type.sm,
    color: colors.text,
  },
  openButton: {
    width: 64,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openText: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.white },
  hint: { fontSize: type.xs, color: colors.faint },
  noticeText: { fontSize: type.sm, lineHeight: 20, color: colors.text },
  noticeButton: { marginTop: 16 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  resultCopy: { flex: 1, gap: 1 },
  resultMeta: { fontSize: type.xs, color: colors.muted },
  resultTitle: { fontSize: type.sm, fontWeight: weight.semibold, color: colors.text },
  resultCode: { fontSize: type.xs, color: colors.muted },
  resultStats: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingVertical: 12,
    marginBottom: 16,
  },
  resultStat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: type.sm, fontWeight: weight.bold, color: colors.text },
  statLabel: { fontSize: type.xs, color: colors.muted },
  loanHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultDue: { fontSize: type.xs, color: colors.muted, marginTop: 3 },
  resultFine: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.danger, marginTop: 4 },
  resultButton: { marginTop: 16 },
});
