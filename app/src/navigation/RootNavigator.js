import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BrandMark from '../components/BrandMark';
import { useAuth } from '../hooks/useAuth';
import { colors, text } from '../theme/tokens';
import TabBar from './TabBar';

import AdminToolFormScreen from '../screens/admin/AdminToolFormScreen';
import AdminToolQrScreen from '../screens/admin/AdminToolQrScreen';
import AdminToolsScreen from '../screens/admin/AdminToolsScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DetailAlatScreen from '../screens/catalog/DetailAlatScreen';
import KatalogScreen from '../screens/catalog/KatalogScreen';
import DetailPinjamanScreen from '../screens/loans/DetailPinjamanScreen';
import FormPinjamScreen from '../screens/loans/FormPinjamScreen';
import PinjamanScreen from '../screens/loans/PinjamanScreen';
import SuksesPinjamScreen from '../screens/loans/SuksesPinjamScreen';
import NotifikasiScreen from '../screens/notifications/NotifikasiScreen';
import ProfilScreen from '../screens/profile/ProfilScreen';
import TentangScreen from '../screens/profile/TentangScreen';
import ScanScreen from '../screens/scan/ScanScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tab.Screen name="Katalog" component={KatalogScreen} />
      <Tab.Screen name="Pinjaman" component={PinjamanScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Notifikasi" component={NotifikasiScreen} />
      <Tab.Screen name="Profil" component={ProfilScreen} />
    </Tab.Navigator>
  );
}

function BootScreen() {
  return (
    <SafeAreaView style={styles.boot} edges={['top', 'bottom']}>
      <View style={styles.bootInner}>
        <BrandMark size={72} tone="light" />
        <View style={styles.bootText}>
          <Text style={styles.bootTitle}>SiPinjam</Text>
          <Text style={styles.bootSubtitle}>Menyiapkan laboratorium...</Text>
        </View>
      </View>
      <ActivityIndicator color={colors.accent} />
    </SafeAreaView>
  );
}

export default function RootNavigator() {
  const { member, loading } = useAuth();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync().catch(() => {});
  }, [loading]);

  if (loading) return <BootScreen />;

  return (
    <View style={[styles.root, Platform.OS === 'web' && styles.webRoot]}>
      <View style={[styles.frame, Platform.OS === 'web' && styles.webFrame]}>
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_right',
            }}
          >
            {!member ? (
              <>
                <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Main" component={MainTabs} options={{ animation: 'fade' }} />
                <Stack.Screen name="DetailAlat" component={DetailAlatScreen} />
                <Stack.Screen name="FormPinjam" component={FormPinjamScreen} />
                <Stack.Screen name="SuksesPinjam" component={SuksesPinjamScreen} />
                <Stack.Screen name="DetailPinjaman" component={DetailPinjamanScreen} />
                <Stack.Screen name="Tentang" component={TentangScreen} />
                <Stack.Screen name="AdminTools" component={AdminToolsScreen} />
                <Stack.Screen name="AdminToolForm" component={AdminToolFormScreen} />
                <Stack.Screen name="AdminToolQr" component={AdminToolQrScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  webRoot: { backgroundColor: '#E4EBE2' },
  frame: { flex: 1 },
  webFrame: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: colors.bg,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#D7E1D7',
  },
  boot: {
    flex: 1,
    backgroundColor: colors.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  bootInner: { alignItems: 'center', gap: 18 },
  bootText: { alignItems: 'center', gap: 4 },
  bootTitle: { ...text.h1, color: colors.white },
  bootSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.56)' },
});
