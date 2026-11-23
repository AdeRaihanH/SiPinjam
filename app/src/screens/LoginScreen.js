import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import BrandMark from '../components/BrandMark';
import Button from '../components/Button';
import FormField from '../components/FormField';
import HeroGlow from '../components/HeroGlow';
import InlineNotice from '../components/InlineNotice';
import Reveal from '../components/Reveal';
import { useAuth } from '../hooks/useAuth';
import { colors, gradients, radius, type, weight } from '../theme/tokens';

const DEMO_NIM = '21120124140118';
const DEMO_PASSWORD = 'praktikum123';

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin() {
    Keyboard.dismiss();
    setError(null);

    if (!nim.trim() || !password) {
      setError({ message: 'NIM dan kata sandi wajib diisi.' });
      return;
    }

    setLoading(true);
    try {
      await login(nim, password);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setNim(DEMO_NIM);
    setPassword(DEMO_PASSWORD);
    setError(null);
  }

  const network = error?.code === 'NETWORK_ERROR';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <HeroGlow />

      <SafeAreaView edges={['top']} style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 20) }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Reveal distance={10} style={styles.hero}>
              <View style={styles.brandRow}>
                <BrandMark size={44} tone="light" />
                <View style={styles.brandCopy}>
                  <Text style={styles.brandName}>SiPinjam</Text>
                  <Text style={styles.brandSub}>Laboratorium Komputer</Text>
                </View>
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>QR Aktif</Text>
                </View>
              </View>

              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>Pinjam alat,{'\n'}tanpa antre.</Text>
                <Text style={styles.heroSubtitle}>
                  Katalog stok real-time, QR peminjaman, pengingat jatuh tempo, dan denda
                  yang transparan dalam satu aplikasi.
                </Text>
              </View>

              <View style={styles.featureRow}>
                <Ionicons name="sparkles-outline" size={14} color={colors.gold} />
                <Text style={styles.featureText}>
                  QR Code • Stok real-time • Denda otomatis
                </Text>
              </View>
            </Reveal>

            <Reveal delay={120} distance={24} style={styles.sheetWrap}>
              <View style={styles.sheet}>
                <Text style={styles.formTitle}>Selamat datang kembali</Text>
                <Text style={styles.formSubtitle}>
                  Masuk dengan NIM dan kata sandi laboratorium.
                </Text>

                {error ? (
                  <InlineNotice
                    tone="danger"
                    title={network ? 'Tidak dapat terhubung' : 'Gagal masuk'}
                    message={error.message}
                    style={styles.notice}
                  />
                ) : null}

                <View style={styles.form}>
                  <FormField
                    label="NIM"
                    icon="person-outline"
                    value={nim}
                    onChangeText={setNim}
                    placeholder="21120124140118"
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    maxLength={20}
                  />
                  <FormField
                    label="Kata sandi"
                    icon="lock-closed-outline"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Masukkan kata sandi"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    right={(
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        hitSlop={8}
                        onPress={() => setShowPassword((value) => !value)}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={19}
                          color={colors.muted}
                        />
                      </Pressable>
                    )}
                  />
                </View>

                <Button
                  title={loading ? 'Memeriksa akun...' : 'Masuk ke SiPinjam'}
                  iconRight="arrow-forward"
                  loading={loading}
                  onPress={handleLogin}
                  style={styles.button}
                />

                <Text style={styles.help}>
                  Akun dikelola laboran. Hubungi laboran jika kata sandi bermasalah.
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={fillDemo}
                  style={({ pressed }) => [styles.demo, pressed && { opacity: 0.75 }]}
                >
                  <View style={styles.demoIcon}>
                    <Ionicons name="flash" size={16} color={colors.gold} />
                  </View>
                  <View style={styles.demoCopy}>
                    <Text style={styles.demoLabel}>Coba akun demo</Text>
                    <Text style={styles.demoText}>{DEMO_NIM} • {DEMO_PASSWORD}</Text>
                  </View>
                  <View style={styles.demoAction}>
                    <Text style={styles.demoActionText}>Isi otomatis</Text>
                    <Ionicons name="arrow-forward" size={13} color={colors.primary} />
                  </View>
                </Pressable>

                <Text style={styles.footer}>
                  SiPinjam • Tugas Akhir Praktikum PPB 2026
                </Text>
              </View>
            </Reveal>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primaryDeep },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 34,
    gap: 30,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  brandCopy: { flex: 1, gap: 1 },
  brandName: { fontSize: type.md, fontWeight: weight.heavy, color: colors.white, letterSpacing: -0.3 },
  brandSub: { fontSize: type.xs, color: 'rgba(255,255,255,0.62)' },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  liveText: { fontSize: type.xxs, fontWeight: weight.bold, color: colors.white, letterSpacing: 0.4 },
  heroCopy: { gap: 10 },
  heroTitle: {
    fontSize: type.display,
    lineHeight: 41,
    fontWeight: weight.heavy,
    color: colors.white,
    letterSpacing: -1,
    maxWidth: 300,
  },
  heroSubtitle: {
    fontSize: type.sm,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.72)',
    maxWidth: 320,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureText: { fontSize: type.xxs, fontWeight: weight.semibold, color: 'rgba(255,255,255,0.82)' },
  sheetWrap: { flexGrow: 1 },
  sheet: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 22,
  },
  formTitle: { fontSize: type.lg, fontWeight: weight.heavy, color: colors.text, letterSpacing: -0.4 },
  formSubtitle: { fontSize: type.xs, color: colors.muted, marginTop: 4, marginBottom: 20 },
  notice: { marginBottom: 16 },
  form: { gap: 15 },
  button: { marginTop: 20 },
  help: {
    fontSize: type.xxs,
    lineHeight: 16,
    color: colors.faint,
    textAlign: 'center',
    marginTop: 10,
  },
  demo: {
    marginTop: 18,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  demoIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoCopy: { flex: 1, gap: 2 },
  demoLabel: { fontSize: type.xs, fontWeight: weight.bold, color: colors.text },
  demoText: { fontSize: type.xxs, color: colors.muted },
  demoAction: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  demoActionText: { fontSize: type.xxs, fontWeight: weight.bold, color: colors.primary },
  footer: {
    marginTop: 'auto',
    paddingTop: 22,
    textAlign: 'center',
    fontSize: type.xxs,
    color: colors.faint,
  },
});
