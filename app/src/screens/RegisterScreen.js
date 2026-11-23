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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BrandMark from '../components/BrandMark';
import Button from '../components/Button';
import FormField from '../components/FormField';
import HeroGlow from '../components/HeroGlow';
import InlineNotice from '../components/InlineNotice';
import Screen from '../components/Screen';
import StackHeader from '../components/StackHeader';
import { useAuth } from '../hooks/useAuth';
import { colors, gradients, layout, radius, shadows, type, weight } from '../theme/tokens';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  function clearField(key) {
    if (!fieldErrors[key]) return;
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate() {
    const next = {};
    const namaBersih = nama.trim();

    if (namaBersih.length < 3) next.nama = 'Nama lengkap minimal 3 karakter.';
    else if (namaBersih.length > 100) next.nama = 'Nama lengkap maksimal 100 karakter.';

    if (!/^\d{8,20}$/.test(nim.trim())) next.nim = 'NIM harus berupa 8–20 digit angka.';
    if (password.length < 8) next.password = 'Kata sandi minimal 8 karakter.';
    if (confirm !== password) next.confirm = 'Konfirmasi kata sandi belum sama.';

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRegister() {
    Keyboard.dismiss();
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await register(nama.trim(), nim.trim(), password);
      // AuthProvider mengganti stack ke Main setelah akun dibuat.
    } catch (err) {
      setError(err);
      if (Array.isArray(err.fields) && err.fields.length) {
        const mapped = {};
        for (const item of err.fields) {
          if (item?.field && item?.message) mapped[item.field] = item.message;
        }
        if (Object.keys(mapped).length) {
          setFieldErrors((current) => ({ ...current, ...mapped }));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const network = error?.code === 'NETWORK_ERROR';

  return (
    <Screen padded={false}>
      <StatusBar style="dark" />
      <StackHeader title="Daftar akun" subtitle="Praktikan baru" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <HeroGlow />
            <View style={styles.heroTop}>
              <BrandMark size={44} tone="light" />
              <View style={styles.rolePill}>
                <Ionicons name="person-add-outline" size={12} color={colors.accent} />
                <Text style={styles.roleText}>Akun praktikan</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Gabung laboratorium.</Text>
            <Text style={styles.heroSubtitle}>
              Daftar sekali untuk meminjam alat, memindai QR, dan memantau jatuh tempo.
            </Text>
          </LinearGradient>

          {error ? (
            <InlineNotice
              tone="danger"
              title={network ? 'Tidak dapat terhubung' : 'Pendaftaran gagal'}
              message={error.message}
            />
          ) : null}

          <View style={styles.formHead}>
            <Text style={styles.formTitle}>Data akun</Text>
            <Text style={styles.formSubtitle}>
              Nama lengkap dan NIM akan tampil di riwayat peminjaman laboratorium.
            </Text>
          </View>

          <View style={styles.form}>
            <FormField
              label="Nama lengkap"
              icon="person-outline"
              value={nama}
              onChangeText={(value) => { setNama(value); clearField('nama'); }}
              placeholder="Contoh: Ade Raihan Hanafi"
              autoCapitalize="words"
              autoComplete="name"
              maxLength={100}
              error={fieldErrors.nama}
            />
            <FormField
              label="NIM"
              icon="id-card-outline"
              hint="8–20 digit"
              value={nim}
              onChangeText={(value) => { setNim(value.replace(/\D/g, '')); clearField('nim'); }}
              placeholder="Contoh: 21120124140118"
              keyboardType="number-pad"
              autoCapitalize="none"
              maxLength={20}
              error={fieldErrors.nim}
            />
            <FormField
              label="Kata sandi"
              icon="lock-closed-outline"
              hint="Min. 8 karakter"
              value={password}
              onChangeText={(value) => { setPassword(value); clearField('password'); clearField('confirm'); }}
              placeholder="Buat kata sandi"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              maxLength={72}
              error={fieldErrors.password}
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
            <FormField
              label="Konfirmasi kata sandi"
              icon="shield-checkmark-outline"
              value={confirm}
              onChangeText={(value) => { setConfirm(value); clearField('confirm'); }}
              placeholder="Ulangi kata sandi"
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoComplete="new-password"
              maxLength={72}
              error={fieldErrors.confirm}
              right={(
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showConfirm ? 'Sembunyikan konfirmasi' : 'Tampilkan konfirmasi'}
                  hitSlop={8}
                  onPress={() => setShowConfirm((value) => !value)}
                >
                  <Ionicons
                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color={colors.muted}
                  />
                </Pressable>
              )}
            />
          </View>

          <InlineNotice
            tone="info"
            icon="information-circle-outline"
            title="NIM menjadi username"
            message="Gunakan NIM yang benar. Akun admin/laboran hanya bisa dibuat oleh pengelola laboratorium."
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Button
            title={loading ? 'Membuat akun...' : 'Daftar & masuk'}
            iconRight={loading ? undefined : 'arrow-forward'}
            loading={loading}
            onPress={handleRegister}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.loginLink, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.loginText}>Sudah punya akun?</Text>
            <Text style={styles.loginStrong}>Masuk</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 20,
    gap: 16,
  },
  hero: {
    borderRadius: radius.xl,
    padding: 20,
    gap: 10,
    overflow: 'hidden',
    ...shadows.lift,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 26,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(185,205,154,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(185,205,154,0.18)',
  },
  roleText: { fontSize: 9.5, fontWeight: weight.bold, color: colors.accent },
  heroTitle: {
    marginTop: 2,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: weight.heavy,
    color: colors.white,
    letterSpacing: -0.7,
  },
  heroSubtitle: {
    fontSize: type.xs,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.62)',
    maxWidth: 320,
  },
  formHead: { gap: 3, marginTop: 2 },
  formTitle: { fontSize: 20, fontWeight: weight.heavy, color: colors.text, letterSpacing: -0.4 },
  formSubtitle: { fontSize: type.xs, lineHeight: 18, color: colors.muted },
  form: { gap: 14 },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.sheet,
    shadowOpacity: 0.04,
    gap: 8,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 2,
  },
  loginText: { fontSize: type.xs, color: colors.muted },
  loginStrong: { fontSize: type.xs, fontWeight: weight.bold, color: colors.primary },
});
