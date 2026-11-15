import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotificationBadge } from '../context/NotificationContext';
import { colors, shadows, type, weight } from '../theme/tokens';

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

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const isScan = route.name === 'Scan';
        const [idle, active] = ICONS[route.name] || ['ellipse-outline', 'ellipse'];
        const label = LABELS[route.name] || route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
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
                <Ionicons name="scan" size={25} color={colors.white} />
              </View>
              <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
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
                name={focused ? active : idle}
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
    paddingTop: 7,
    paddingHorizontal: 4,
    ...shadows.sheet,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    minHeight: 48,
  },
  iconWrap: { width: 32, height: 24, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: type.xs, fontWeight: weight.semibold, color: colors.muted },
  labelActive: { color: colors.primary, fontWeight: weight.bold },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    ...shadows.floating,
  },
  scanButtonActive: { backgroundColor: colors.accent },
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
  badgeText: { fontSize: 9, fontWeight: weight.bold, color: colors.white },
});
