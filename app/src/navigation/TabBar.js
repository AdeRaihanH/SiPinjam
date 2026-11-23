import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PressableScale from '../components/PressableScale';
import { useNotificationBadge } from '../context/NotificationContext';
import { select } from '../lib/haptics';
import { colors, gradients, radius, shadows, type, weight } from '../theme/tokens';

const ICONS = {
  Katalog: ['grid-outline', 'grid'],
  Pinjaman: ['document-text-outline', 'document-text'],
  Scan: ['scan-outline', 'scan'],
  Notifikasi: ['notifications-outline', 'notifications'],
  Profil: ['person-outline', 'person'],
};

const LABELS = {
  Katalog: 'Katalog',
  Pinjaman: 'Pinjaman',
  Scan: 'Scan',
  Notifikasi: 'Notifikasi',
  Profil: 'Profil',
};

export default function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { unread } = useNotificationBadge();

  const go = (route, focused) => {
    if (!focused) select();
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const isScan = route.name === 'Scan';
          const [idle, active] = ICONS[route.name] || ['ellipse-outline', 'ellipse'];
          const label = LABELS[route.name] || route.name;

          if (isScan) {
            return (
              <PressableScale
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel="Pindai QR"
                onPress={() => go(route, focused)}
                scaleTo={0.92}
                haptic={false}
                style={styles.item}
              >
                <View style={[styles.scanRing, focused && styles.scanRingActive]}>
                  <LinearGradient
                    colors={focused ? gradients.accent : gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.scanButton}
                  >
                    <Ionicons name="scan" size={24} color={colors.white} />
                  </LinearGradient>
                </View>
                <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
              </PressableScale>
            );
          }

          return (
            <PressableScale
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={() => go(route, focused)}
              scaleTo={0.9}
              haptic={false}
              style={styles.item}
            >
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Ionicons
                  name={focused ? active : idle}
                  size={20}
                  color={focused ? colors.primary : colors.muted}
                />
                {route.name === 'Notifikasi' && unread > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingTop: 6,
    backgroundColor: colors.bg,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 62,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingBottom: 6,
    ...shadows.sheet,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    minHeight: 52,
  },
  iconWrap: {
    width: 38,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: colors.primarySoft },
  label: { fontSize: type.xxs, fontWeight: weight.semibold, color: colors.muted },
  labelActive: { color: colors.primary, fontWeight: weight.bold },
  scanRing: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
    ...shadows.floating,
  },
  scanRingActive: {
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
  },
  scanButton: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 9, fontWeight: weight.bold, color: colors.white },
});
