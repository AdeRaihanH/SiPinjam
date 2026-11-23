import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PressableScale from '../components/PressableScale';
import { useNotificationBadge } from '../context/NotificationContext';
import { select } from '../lib/haptics';
import { colors, radius, shadows, weight } from '../theme/tokens';

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
                  <View style={styles.scanButton}>
                    <Ionicons name="scan" size={22} color={colors.primary} />
                  </View>
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
                  size={19}
                  color={focused ? colors.white : 'rgba(255,255,255,0.58)'}
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
    paddingHorizontal: 14,
    paddingTop: 8,
    backgroundColor: colors.bg,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 68,
    backgroundColor: colors.primaryDeep,
    borderRadius: radius.xl,
    paddingHorizontal: 7,
    ...shadows.floating,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 54,
  },
  iconWrap: {
    width: 38,
    height: 30,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: 'rgba(255,255,255,0.11)' },
  label: { fontSize: 9.5, fontWeight: weight.semibold, color: 'rgba(255,255,255,0.58)' },
  labelActive: { color: colors.white, fontWeight: weight.bold },
  scanRing: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    borderWidth: 2,
    borderColor: colors.primaryDeep,
    backgroundColor: colors.surface,
    ...shadows.lift,
  },
  scanRingActive: { borderColor: colors.accent },
  scanButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: 1,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 9, fontWeight: weight.bold, color: colors.white },
});
