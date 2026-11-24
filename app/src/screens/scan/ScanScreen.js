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
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import SheetModal from '../../components/SheetModal';
import { loansApi } from '../../api/loans';
import { toolsApi } from '../../api/tools';
import { parseKode, parseQr } from '../../lib/scan';
import { colors, radius, type, weight } from '../../theme/tokens';
import CameraPermissionPanel from './components/CameraPermissionPanel';
import ManualCodePanel from './components/ManualCodePanel';
import ScanResultSheet from './components/ScanResultSheet';

const FRAME = 236;

function notify(type) {
  if (Platform.OS === 'web') return;
  try {
    Haptics.notificationAsync(type)?.catch(() => {});
  } catch {
    // Haptics tidak tersedia di Expo Go/perangkat tertentu; pemindaian tetap jalan.
  }
}

function Corner({ style }) {
  return <View style={[styles.corner, style]} />;
}

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [torch, setTorch] = useState(false);
  const [looking, setLooking] = useState(false);
  const [cameraError, setCameraError] = useState(false);
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
        Animated.timing(laser, { toValue: FRAME - 28, duration: 1900, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(laser, { toValue: 8, duration: 1900, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [laser]);

  const isWeb = Platform.OS === 'web';
  const denied = permission && !permission.granted;
  const cameraReady = !isWeb && !cameraError && permission?.granted && isFocused && !resultOpen && !notice;
  const showPermission = isWeb || denied || cameraError;

  async function lookup(parsed) {
    if (processing.current) return;
    processing.current = true;
    setLooking(true);
    try {
      const data = parsed.type === 'tool'
        ? await toolsApi.byKode(parsed.code)
        : await loansApi.byKode(parsed.code);
      notify(Haptics.NotificationFeedbackType.Success);
      setResult({ type: parsed.type, data });
      setResultOpen(true);
    } catch (error) {
      notify(Haptics.NotificationFeedbackType.Error);
      const network = error.code === 'NETWORK_ERROR';
      setNotice({
        title: network ? 'Server tidak terjangkau' : 'Kode tidak ditemukan',
        message: network
          ? `${error.message}\n\nJika memakai Expo Go, pastikan backend berjalan di laptop dan HP berada di Wi-Fi yang sama. Build APK memakai API produksi.`
          : error.message,
      });
      resumeAt.current = Date.now() + 1500;
    } finally {
      setLooking(false);
      processing.current = false;
    }
  }

  function processRaw(raw) {
    if (processing.current || Date.now() < resumeAt.current) return;
    try {
      const parsed = parseQr(raw);
      if (!parsed) {
        notify(Haptics.NotificationFeedbackType.Error);
        setNotice({
          title: 'QR tidak dikenali',
          message: 'QR ini bukan milik SiPinjam. Gunakan QR alat atau pinjaman yang tertera, bukan QR proyek Expo.',
        });
        resumeAt.current = Date.now() + 1800;
        return;
      }
      lookup(parsed);
    } catch {
      setNotice({
        title: 'Gagal membaca QR',
        message: 'Coba pindai ulang dengan pencahayaan yang cukup, atau ketik kode alat secara manual.',
      });
      resumeAt.current = Date.now() + 1500;
    }
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
            onMountError={(event) => {
              setCameraError(true);
              setNotice({
                title: 'Kamera tidak dapat dibuka',
                message: event?.message
                  || event?.nativeEvent?.message
                  || 'Tutup aplikasi lain yang sedang memakai kamera, lalu coba lagi. Input kode manual tetap bisa dipakai.',
              });
            }}
            onBarcodeScanned={({ data }) => processRaw(data)}
          />
        ) : (
          <View style={styles.fallback}>
            <Ionicons name="camera-outline" size={48} color="rgba(255,255,255,0.18)" />
          </View>
        )}

        <LinearGradient
          colors={['rgba(7,23,16,0.78)', 'rgba(7,23,16,0.3)', 'transparent']}
          style={styles.topShade}
          pointerEvents="none"
        />

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
            <CameraPermissionPanel
              isWeb={isWeb}
              cameraError={cameraError}
              permission={permission}
              onRequest={requestPermission}
              onRetry={() => setCameraError(false)}
            />
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

      <ManualCodePanel
        value={manual}
        onChange={setManual}
        onSubmit={submitManual}
        bottomInset={insets.bottom}
      />

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
            if (cameraError) setCameraError(false);
            resumeAt.current = Date.now() + 1200;
          }}
          style={styles.noticeButton}
        />
      </SheetModal>

      <ScanResultSheet
        visible={Boolean(resultOpen && result)}
        result={result}
        onClose={closeResult}
        onOpen={openResult}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primaryDeep },
  cameraArea: { flex: 1, backgroundColor: colors.primaryDeep },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 130,
  },
  top: { position: 'absolute', top: 0, left: 0, right: 0 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  topCopy: { flex: 1, gap: 1 },
  topTitle: { fontSize: 19, fontWeight: weight.heavy, color: colors.white, letterSpacing: -0.3 },
  topSubtitle: { fontSize: type.xs, color: 'rgba(255,255,255,0.56)' },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: colors.accent },
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
  frameHint: { fontSize: type.xs, color: 'rgba(255,255,255,0.62)' },
  noticeText: { fontSize: type.sm, lineHeight: 20, color: colors.text },
  noticeButton: { marginTop: 16 },
});

