import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '../theme';
import { useNotifications } from '../context/NotificationContext';

const ICONS = {
  Katalog: ['grid-outline', 'grid'],
  Pinjaman: ['albums-outline', 'albums'],
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
  const { unread } = useNotifications();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const isScan = route.name === 'Scan';
        const [idleIcon, activeIcon] = ICONS[route.name] || ['ellipse-outline', 'ellipse'];
        const label = LABELS[route.name] || route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isScan) {
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel="Pindai QR"
              onPress={onPress}
              style={styles.item}
            >
              <View style={[styles.scanButton, focused && styles.scanButtonActive]}>
                <Ionicons name="scan" size={27} color={colors.white} />
              </View>
              <Text style={[styles.label, styles.scanLabel, focused && styles.labelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={onPress}
            style={styles.item}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name={focused ? activeIcon : idleIcon}
                size={21}
                color={focused ? colors.primary : colors.muted}
              />
              {route.name === 'Notifikasi' && unread > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 9,
    paddingHorizontal: 4,
    ...shadows.sheet,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    minHeight: 50,
  },
  iconWrap: {
    width: 34,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9.5,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
    ...shadows.fab,
  },
  scanButtonActive: {
    backgroundColor: colors.primaryDark,
  },
  scanLabel: {
    marginTop: 1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -7,
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
  badgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.white,
  },
});
