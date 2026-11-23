import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import { colors, radius, type, weight } from '../theme/tokens';

export default function StackHeader({
  title,
  subtitle,
  right,
  onBack,
  close = false,
  style,
  tone = 'dark',
}) {
  const navigation = useNavigation();
  const light = tone === 'light';

  return (
    <View style={[styles.root, style]}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={close ? 'Tutup' : 'Kembali'}
        hitSlop={8}
        onPress={onBack || (() => navigation.goBack())}
        scaleTo={0.9}
        hoverStyle={{ backgroundColor: colors.surfaceMuted }}
        style={[styles.back, light && styles.backLight]}
      >
        <Ionicons
          name={close ? 'close' : 'arrow-back'}
          size={19}
          color={light ? colors.white : colors.text}
        />
      </PressableScale>
      <View style={styles.copy}>
        <Text style={[styles.title, light && styles.titleLight]} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, light && styles.subtitleLight]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right || <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 14,
    gap: 12,
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLight: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  copy: { flex: 1, gap: 1 },
  title: { fontSize: 17, fontWeight: weight.bold, color: colors.text, letterSpacing: -0.3 },
  titleLight: { color: colors.white },
  subtitle: { fontSize: type.xs, color: colors.muted },
  subtitleLight: { color: 'rgba(255,255,255,0.62)' },
  spacer: { width: 42, height: 42 },
});
