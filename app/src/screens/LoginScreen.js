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
import { colors, gradients, radius, shadows, type, weight } from '../theme/tokens';

const DEMO_NIM = '21120124140118';
const DEMO_PASSWORD = 'praktikum123';
const DEMO_ADMIN_NIM = '2112012414000';
const DEMO_ADMIN_PASSWORD = 'admin123';

const FEATURES = [
  { icon: 'scan-outline', label: 'QR Code' },
  { icon: 'cube-outline', label: 'Stok live' },
  { icon: 'wallet-outline', label: 'Denda jelas' },
];

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

  function fillDemo(nimValue, passwordValue) {
    setNim(nimValue);
    setPassword(passwordValue);
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
            contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 18) }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Reveal distance={10} style={styles.hero}>
              <View style={styles.brandRow}>
                <BrandMark size={42} tone="light" />
                <View style={styles.brandCopy}>
                  <Text style={styles.brandName}>SiPinjam</Text>
                  <Text style={styles.brandSub}>Laboratorium Komputer</Text>
                </View>
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>QR aktif</Text>
                </View>
              </View>

              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>
                  Pinjam alat,{'\n'}
                  <Text style={styles.heroTitleAccent}>kembali tepat.</Text>
                </Text>
                <Text style={styles.heroSubtitle}>
                  Katalog real-time, QR peminjaman, pengingat jatuh tempo, dan denda
                  transparan dalam satu aplikasi laboratorium.
                </Text>
              </View>

              <View style={styles.featureRow}>
                {FEATURES.map((feature) => (
                  <View key={feature.label} style={styles.feature}>
                    <Ionicons name={feature.icon} size={15} color={colors.accent} />
                    <Text style={styles.featureText}>{feature.label}</Text>
                  </View>
                ))}
              </View>
            </Reveal>

            <Reveal delay={110} distance={26} style={styles.sheetWrap}>
              <View style={styles.sheet}>
                <View style={styles.sheetHead}>
                  <View style={styles.sheetMark}>
                    <Ionicons name="finger-print-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.sheetCopy}>
                    <Text style={styles.formTitle}>Masuk ke akun</Text>
                    <Text style={styles.formSubtitle}>
                      Gunakan NIM dan kata sandi laboratorium.
                    </Text>
                  </View>
                </View>

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

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>atau coba dulu</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Isi akun demo praktikan"
                  onPress={() => fillDemo(DEMO_NIM, DEMO_PASSWORD)}
                  style={({ pressed }) => [styles.demo, pressed && { opacity: 0.8 }]}
                >
                  <View style={styles.demoIcon}>
                    <Ionicons name="flash" size={17} color={colors.accentInk} />
                  </View>
                  <View style={styles.demoCopy}>
                    <Text style={styles.demoLabel}>Akun demo praktikan</Text>
                    <Text style={styles.demoText}>{DEMO_NIM} · {DEMO_PASSWORD}</Text>
                  </View>
                  <View style={styles.demoAction}>
                    <Text style={styles.demoActionText}>Isi otomatis</Text>
                    <Ionicons name="arrow-forward" size={13} color={colors.accentInk} />
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Isi akun demo admin"
                  onPress={() => fillDemo(DEMO_ADMIN_NIM, DEMO_ADMIN_PASSWORD)}
                  style={({ pressed }) => [styles.demo, styles.demoSecond, pressed && { opacity: 0.8 }]}
                >
                  <View style={styles.demoIcon}>
                    <Ionicons name="shield-checkmark-outline" size={17} color={colors.accentInk} />
                  </View>
                  <View style={styles.demoCopy}>
                    <Text style={styles.demoLabel}>Akun demo admin</Text>
                    <Text style={styles.demoText}>{DEMO_ADMIN_NIM} · {DEMO_ADMIN_PASSWORD}</Text>
                  </View>
                  <View style={styles.demoAction}>
                    <Text style={styles.demoActionText}>Isi otomatis</Text>
                    <Ionicons name="arrow-forward" size={13} color={colors.accentInk} />
                  </View>
                </Pressable>

                <Text style={styles.footer}>
                  SiPinjam · Tugas Akhir Praktikum PPB 2026
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
    paddingTop: 14,
    paddingBottom: 32,
    gap: 28,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  brandCopy: { flex: 1, gap: 1 },
  brandName: { fontSize: 16, fontWeight: weight.heavy, color: colors.white, letterSpacing: -0.3 },
  brandSub: { fontSize: type.xs, color: 'rgba(255,255,255,0.56)' },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(200,241,105,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(200,241,105,0.2)',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  liveText: { fontSize: type.xxs, fontWeight: weight.bold, color: colors.accent, letterSpacing: 0.3 },
  heroCopy: { gap: 11 },
  heroTitle: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: weight.heavy,
    color: colors.white,
    letterSpacing: -1.4,
    maxWidth: 320,
  },
  heroTitleAccent: { color: colors.accent },
  heroSubtitle: {
    fontSize: type.sm,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.62)',
    maxWidth: 330,
  },
  featureRow: { flexDirection: 'row', gap: 8 },
  feature: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  featureText: { fontSize: 10.5, fontWeight: weight.semibold, color: 'rgba(255,255,255,0.8)' },
  sheetWrap: { flexGrow: 1 },
  sheet: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    ...shadows.sheet,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  sheetMark: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCopy: { flex: 1, gap: 2 },
  formTitle: { fontSize: 22, fontWeight: weight.heavy, color: colors.text, letterSpacing: -0.5 },
  formSubtitle: { fontSize: type.xs, lineHeight: 17, color: colors.muted },
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    marginBottom: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: type.xxs, color: colors.faint },
  demo: {
    padding: 13,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  demoSecond: { marginTop: 8 },
  demoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoCopy: { flex: 1, gap: 2 },
  demoLabel: { fontSize: type.xs, fontWeight: weight.bold, color: colors.text },
  demoText: { fontSize: type.xxs, color: colors.muted },
  demoAction: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  demoActionText: { fontSize: type.xxs, fontWeight: weight.bold, color: colors.accentInk },
  footer: {
    marginTop: 'auto',
    paddingTop: 22,
    textAlign: 'center',
    fontSize: type.xxs,
    color: colors.faint,
  },
});
