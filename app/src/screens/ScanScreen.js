import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../components/Button';
import FormField from '../components/FormField';
import InlineNotice from '../components/InlineNotice';
import { Pill, StatusPill } from '../components/Pill';
import SheetModal from '../components/SheetModal';
import ToolGlyph from '../components/ToolGlyph';
import { api } from '../services/api';
import { colors, radius, shadows } from '../theme';
import { formatTanggal, formatRupiah } from '../utils/format';
import { parseKode, parseQr } from '../utils/scan';

const FRAME = 252;

function Corner({ style }) {
  return <View style={[styles.corner, style]} />;
}

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [torch, setTorch] = useState(false);
  const [looking, setLooking] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [result, setResult] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [manualError, setManualError] = useState(null);

  const processing = useRef(false);
  const resumeAt = useRef(0);
  const errorTimer = useRef(null);
  const laser = useMemo(() => new Animated.Value(10), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(laser, {
          toValue: FRAME - 34,
          duration: 1900,
          useNativeDriver: true,
        }),
        Animated.timing(laser, {
          toValue: 10,
          duration: 1900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [laser]);

  useEffect(() => () => {
    if (errorTimer.current) clearTimeout(errorTimer.current);
  }, []);

  const showError = (message) => {
    setScanError(message);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setScanError(null), 3000);
  };

  async function processRaw(raw) {
    if (processing.current || Date.now() < resumeAt.current) return;

    const parsed = parseQr(raw);
    if (!parsed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      showError('QR bukan milik SiPinjam. Gunakan QR alat atau pinjaman.');
      resumeAt.current = Date.now() + 2200;
      return;
    }

    processing.current = true;
    setLooking(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    try {
      const data = parsed.type === 'tool'
        ? await api.get(`/tools/kode/${encodeURIComponent(raw)}`)
        : await api.get(`/loans/kode/${encodeURIComponent(raw)}`);
      setResult({ type: parsed.type, data });
      setResultOpen(true);
    } catch (error) {
      showError(error.message);
      resumeAt.current = Date.now() + 2000;
    } finally {
      setLooking(false);
      processing.current = false;
    }
  }

  function closeResult() {
    setResultOpen(false);
    resumeAt.current = Date.now() + 1500;
  }

  function openResult() {
    if (!result) return;
    const { type, data } = result;
    setResultOpen(false);
    resumeAt.current = Date.now() + 1800;
    if (type === 'tool') {
      navigation.navigate('DetailAlat', { toolId: data.id, tool: data });
    } else {
      navigation.navigate('DetailPinjaman', { loanId: data.id });
    }
  }

  function openManual() {
    setManualError(null);
    setManualValue('');
    setManualOpen(true);
  }

  async function submitManual() {
    const parsed = parseKode(manualValue);
    if (!parsed) {
      setManualError('Format kode tidak dikenal. Contoh: ALT-001 atau PJM-261114-001.');
      return;
    }
    setManualError(null);
    setManualOpen(false);
    resumeAt.current = 0;
    await processRaw(manualValue.trim());
  }

  const isWeb = Platform.OS === 'web';
  const permissionBlocked = permission && !permission.granted;
  const canRequest = permission?.canAskAgain !== false;
  const cameraReady = !isWeb && permission?.granted && isFocused;

  return (
    <View style={styles.root}>
      {isFocused ? <StatusBar style="light" /> : null}

      {cameraReady ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={
            resultOpen || manualOpen || looking
              ? undefined
              : ({ data }) => processRaw(data)
          }
        />
      ) : (
        <View style={styles.cameraFallback}>
          <LinearGradient
            colors={['#062A23', '#0B3F35']}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="camera-outline" size={54} color="rgba(255,255,255,0.2)" />
        </View>
      )}

      <View style={styles.dim} pointerEvents="none" />

      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.topBar}>
          <View style={styles.topCopy}>
            <Text style={styles.topEyebrow}>PEMINDAI QR</Text>
            <Text style={styles.topTitle}>Scan alat atau pinjaman</Text>
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
                size={20}
                color={torch ? colors.primaryDeep : colors.white}
              />
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>

      <View style={styles.center}>
        {permissionBlocked || isWeb ? (
          <View style={styles.permissionCard}>
            <View style={styles.permissionIcon}>
              <Ionicons name="camera-outline" size={30} color={colors.primaryDark} />
            </View>
            <Text style={styles.permissionTitle}>
              {canRequest ? 'Akses kamera diperlukan' : 'Izin kamera dimatikan'}
            </Text>
            <Text style={styles.permissionText}>
              {Platform.OS === 'web'
                ? 'Pemindaian kamera tersedia di aplikasi Android/iOS. Kamu tetap bisa memasukkan kode secara manual.'
                : canRequest
                  ? 'SiPinjam memakai kamera hanya untuk membaca QR alat dan pinjaman.'
                  : 'Buka pengaturan perangkat dan izinkan SiPinjam mengakses kamera.'}
            </Text>
            {canRequest && Platform.OS !== 'web' ? (
              <Button
                title="Izinkan kamera"
                icon="camera-outline"
                onPress={requestPermission}
                size="sm"
                fullWidth={false}
              />
            ) : Platform.OS !== 'web' ? (
              <Button
                title="Buka pengaturan"
                icon="settings-outline"
                onPress={() => Linking.openSettings()}
                size="sm"
                fullWidth={false}
                variant="secondary"
              />
            ) : null}
            <Pressable onPress={openManual} hitSlop={8}>
              <Text style={styles.permissionLink}>Masukkan kode manual</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.frame}>
              <Corner style={styles.cornerTL} />
              <Corner style={styles.cornerTR} />
              <Corner style={styles.cornerBL} />
              <Corner style={styles.cornerBR} />
              {looking ? (
                <View style={styles.looking}>
                  <ActivityIndicator color={colors.white} />
                  <Text style={styles.lookingText}>Membaca QR...</Text>
                </View>
              ) : (
                <Animated.View
                  style={[styles.laser, { transform: [{ translateY: laser }] }]}
                />
              )}
            </View>
            <Text style={styles.frameHint}>Posisikan QR di dalam kotak</Text>
            {scanError ? (
              <View style={styles.errorPill}>
                <Ionicons name="alert-circle" size={14} color={colors.white} />
                <Text style={styles.errorText}>{scanError}</Text>
              </View>
            ) : null}
          </>
        )}
      </View>

      <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <View style={styles.bottomHead}>
          <View style={styles.bottomCopy}>
            <Text style={styles.bottomTitle}>QR SiPinjam</Text>
            <Text style={styles.bottomSubtitle}>
              Pindai QR pada alat atau bukti pinjaman untuk membuka detailnya.
            </Text>
          </View>
          <View style={styles.qrBadge}>
            <Ionicons name="qr-code-outline" size={19} color={colors.primaryDark} />
          </View>
        </View>

        <Button
          title="Masukkan kode manual"
          icon="keypad-outline"
          variant="secondary"
          size="sm"
          onPress={openManual}
        />

        <View style={styles.formatRow}>
          <Ionicons name="information-circle-outline" size={13} color={colors.faint} />
          <Text style={styles.formatText}>
            Format: SIPINJAM:TOOL:ALT-001 · SIPINJAM:LOAN:PJM-261114-001
          </Text>
        </View>
      </View>

      <SheetModal
        visible={Boolean(resultOpen && result)}
        onClose={closeResult}
        title={result?.type === 'tool' ? 'Alat ditemukan' : 'Pinjaman ditemukan'}
        subtitle="Hasil pemindaian QR SiPinjam"
      >
        {result?.type === 'tool' ? (
          <>
            <View style={styles.resultRow}>
              <ToolGlyph tool={result.data} size={54} />
              <View style={styles.resultCopy}>
                <Text style={styles.resultLabel}>{result.data.kategori_nama}</Text>
                <Text style={styles.resultTitle}>{result.data.nama}</Text>
                <Text style={styles.resultMeta}>{result.data.kode}</Text>
              </View>
            </View>
            <View style={styles.resultStats}>
              <View style={styles.resultStat}>
                <Text style={styles.resultStatValue}>{result.data.stok_tersedia}</Text>
                <Text style={styles.resultStatLabel}>Tersedia</Text>
              </View>
              <View style={styles.resultStat}>
                <Text style={styles.resultStatValue}>{result.data.stok_total}</Text>
                <Text style={styles.resultStatLabel}>Total unit</Text>
              </View>
              <View style={styles.resultStat}>
                <Text style={styles.resultStatValue}>
                  {result.data.kondisi === 'baik' ? 'Baik' : 'Rusak ringan'}
                </Text>
                <Text style={styles.resultStatLabel}>Kondisi</Text>
              </View>
            </View>
            <Button
              title="Lihat detail alat"
              icon="arrow-forward"
              onPress={openResult}
              style={styles.resultButton}
            />
          </>
        ) : result ? (
          <>
            <View style={styles.loanResultHead}>
              <View style={styles.resultCopy}>
                <Text style={styles.resultLabel}>KODE PINJAMAN</Text>
                <Text style={styles.resultCode}>{result.data.kode}</Text>
              </View>
              <StatusPill status={result.data.status_efektif} />
            </View>
            <View style={styles.loanResultCard}>
              <Text style={styles.loanResultTitle}>{result.data.ringkasan_alat}</Text>
              <View style={styles.loanResultMeta}>
                <Ionicons name="calendar-outline" size={14} color={colors.muted} />
                <Text style={styles.loanResultMetaText}>
                  Jatuh tempo {formatTanggal(result.data.tanggal_kembali_rencana)}
                </Text>
              </View>
              {Number(result.data.denda_berjalan) > 0 ? (
                <Pill
                  label={`Denda berjalan ${formatRupiah(result.data.denda_berjalan)}`}
                  tone="danger"
                  icon="wallet-outline"
                />
              ) : null}
            </View>
            <Button
              title="Buka detail pinjaman"
              icon="arrow-forward"
              onPress={openResult}
              style={styles.resultButton}
            />
          </>
        ) : null}
      </SheetModal>

      <SheetModal
        visible={manualOpen}
        onClose={() => setManualOpen(false)}
        title="Masukkan kode manual"
        subtitle="Gunakan kode yang tertera pada alat atau bukti pinjaman."
        keyboard
      >
        <FormField
          label="Kode"
          icon="keypad-outline"
          value={manualValue}
          onChangeText={(value) => {
            setManualValue(value.toUpperCase());
            setManualError(null);
          }}
          placeholder="ALT-001 atau PJM-261114-001"
          autoCapitalize="characters"
          error={manualError}
        />
        <View style={styles.manualActions}>
          <Button
            title="Periksa kode"
            icon="search-outline"
            onPress={submitManual}
            style={styles.manualButton}
          />
        </View>
        <InlineNotice
          tone="info"
          message="Kode alat diawali ALT- dan kode pinjaman diawali PJM-."
          style={styles.manualNotice}
        />
      </SheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primaryDeep,
  },
  cameraFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3,18,14,0.38)',
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  topCopy: { flex: 1, gap: 2 },
  topEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.accent,
  },
  topTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.4,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingTop: 70,
    paddingBottom: 220,
  },
  frame: {
    width: FRAME,
    height: FRAME,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: colors.white,
  },
  cornerTL: {
    top: -1,
    left: -1,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 18,
  },
  cornerTR: {
    top: -1,
    right: -1,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 18,
  },
  cornerBL: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 18,
  },
  cornerBR: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 18,
  },
  laser: {
    position: 'absolute',
    top: 0,
    width: FRAME - 44,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.accent,
    opacity: 0.9,
    shadowColor: colors.accent,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  looking: {
    alignItems: 'center',
    gap: 8,
  },
  lookingText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },
  frameHint: {
    fontSize: 11.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  errorPill: {
    maxWidth: 300,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(180,35,24,0.92)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  errorText: {
    flexShrink: 1,
    fontSize: 10.5,
    color: colors.white,
    fontWeight: '600',
  },
  permissionCard: {
    width: 300,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 20,
    gap: 9,
    ...shadows.card,
  },
  permissionIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.muted,
    textAlign: 'center',
  },
  permissionLink: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 12,
    ...shadows.sheet,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: 3,
  },
  bottomHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bottomCopy: { flex: 1, gap: 2 },
  bottomTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  bottomSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.muted,
  },
  qrBadge: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  formatText: {
    flex: 1,
    fontSize: 8.5,
    color: colors.faint,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  resultCopy: { flex: 1, gap: 2 },
  resultLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  resultTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: colors.ink,
  },
  resultMeta: {
    fontSize: 10.5,
    color: colors.muted,
  },
  resultStats: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingVertical: 12,
    marginBottom: 16,
  },
  resultStat: { flex: 1, alignItems: 'center', gap: 2 },
  resultStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  resultStatLabel: {
    fontSize: 9,
    color: colors.muted,
  },
  resultButton: { marginTop: 2 },
  loanResultHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultCode: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.5,
  },
  loanResultCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 13,
    marginVertical: 14,
    gap: 8,
  },
  loanResultTitle: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  loanResultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  loanResultMetaText: {
    fontSize: 10.5,
    color: colors.muted,
  },
  manualActions: { marginTop: 14 },
  manualButton: {},
  manualNotice: { marginTop: 10 },
});
