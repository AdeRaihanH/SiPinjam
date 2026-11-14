import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function PageHeader({ eyebrow, title, subtitle, right, style }) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  copy: { flex: 1, gap: 3 },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.muted,
  },
});
