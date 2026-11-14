import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
import InlineNotice from '../components/InlineNotice';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import { colors, radius, text } from '../theme';

const DEMO_EMAIL = 'demo@sipinjam.id';
const DEMO_PASSWORD = 'sipinjam123';

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isNetworkError = error?.code === 'NETWORK_ERROR';

  async function handleLogin() {
    Keyboard.dismiss();
    setError(null);

    if (!email.trim() || !password) {
      setError({ message: 'Email dan kata sandi wajib diisi.' });
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
    Haptics.selectionAsync().catch(() => {});
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <LinearGradient
            colors={['#083D33', '#0E7C66', '#0A5B4B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.ringOne} pointerEvents="none" />
            <View style={styles.ringTwo} pointerEvents="none" />

            <View style={styles.brandRow}>
              <BrandMark size={42} tone="light" />
              <View style={styles.brandCopy}>
                <Text style={styles.brandName}>SiPinjam</Text>
                <Text style={styles.brandTag}>Alat lab dalam genggaman</Text>
              </View>
              <View style={styles.yearPill}>
                <Text style={styles.yearText}>2026</Text>
              </View>
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.kicker}>LABORATORIUM KOMPUTER</Text>
              <Text style={styles.heroTitle}>Pinjam alat lab,{'\n'}tanpa antre.</Text>
              <Text style={styles.heroSubtitle}>
                Cari alat, pindai QR, dan pantau jatuh tempo dari satu aplikasi.
              </Text>
            </View>

            <View style={styles.features}>
              <View style={styles.feature}>
                <Ionicons name="qr-code-outline" size={13} color={colors.white} />
                <Text style={styles.featureText}>Scan QR</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="layers-outline" size={13} color={colors.white} />
                <Text style={styles.featureText}>Stok real-time</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="shield-checkmark-outline" size={13} color={colors.white} />
                <Text style={styles.featureText}>Denda transparan</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>Masuk ke akun</Text>
            <Text style={styles.subtitle}>
              Gunakan akun laboratorium yang diberikan asisten praktikum.
            </Text>

            {error ? (
              <InlineNotice
                tone="danger"
                title={isNetworkError ? 'Server tidak terjangkau' : 'Gagal masuk'}
                message={
                  isNetworkError
                    ? `${error.message} Alamat yang dipakai: ${API_BASE_URL}`
                    : error.message
                }
                style={styles.notice}
              />
            ) : null}

            <View style={styles.form}>
              <FormField
                label="Email"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="nama@kampus.ac.id"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <FormField
                label="Kata sandi"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="Masukkan kata sandi"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
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
              title={loading ? 'Memeriksa akun...' : 'Masuk'}
              icon={loading ? undefined : 'log-in-outline'}
              loading={loading}
              onPress={handleLogin}
              style={styles.loginButton}
            />

            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>atau coba tanpa mengetik</Text>
              <View style={styles.line} />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={fillDemo}
              style={({ pressed }) => [styles.demoCard, pressed && styles.demoPressed]}
            >
              <View style={styles.demoIcon}>
                <Ionicons name="sparkles-outline" size={19} color={colors.primaryDark} />
              </View>
              <View style={styles.demoCopy}>
                <Text style={styles.demoTitle}>Akun demo</Text>
                <Text style={styles.demoText}>{DEMO_EMAIL} · {DEMO_PASSWORD}</Text>
              </View>
              <View style={styles.demoAction}>
                <Text style={styles.demoActionText}>Isi</Text>
                <Ionicons name="arrow-forward" size={13} color={colors.primaryDark} />
              </View>
            </Pressable>

            <View style={styles.footer}>
              <Ionicons name="lock-closed-outline" size={12} color={colors.faint} />
              <Text style={styles.footerText}>Data pinjaman tersimpan di server laboratorium.</Text>
            </View>
            {__DEV__ ? <Text style={styles.devText}>{API_BASE_URL}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryDeep },
  flex: { flex: 1, backgroundColor: colors.bg },
  hero: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 38,
    overflow: 'hidden',
  },
  ringOne: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    top: -86,
    right: -70,
  },
  ringTwo: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    bottom: -74,
    left: -54,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  brandCopy: { flex: 1, gap: 1 },
  brandName: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.3,
  },
  brandTag: {
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.62)',
  },
  yearPill: {
    height: 24,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.8,
  },
  heroCopy: {
    marginTop: 34,
    gap: 10,
  },
  kicker: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: colors.accent,
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.9,
  },
  heroSubtitle: {
    fontSize: 12.5,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.72)',
    maxWidth: 290,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 22,
  },
  feature: {
    height: 29,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  featureText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -24,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 20,
    flex: 1,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: 20,
  },
  title: {
    ...text.h2,
    fontSize: 23,
  },
  subtitle: {
    ...text.small,
    marginTop: 4,
    marginBottom: 18,
  },
  notice: { marginBottom: 14 },
  form: { gap: 14 },
  loginButton: { marginTop: 18 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 18,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    fontSize: 9.5,
    color: colors.faint,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
    padding: 12,
  },
  demoPressed: { opacity: 0.8 },
  demoIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoCopy: { flex: 1, gap: 2 },
  demoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  demoText: {
    fontSize: 10,
    color: colors.body,
    letterSpacing: 0.1,
  },
  demoAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  demoActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 18,
  },
  footerText: {
    fontSize: 9.5,
    color: colors.faint,
  },
  devText: {
    fontSize: 8.5,
    color: colors.faint,
    textAlign: 'center',
    marginTop: 5,
  },
});
