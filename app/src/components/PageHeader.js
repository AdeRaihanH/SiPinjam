import { StyleSheet, Text, View } from 'react-native';
import { colors, text, type, weight } from '../theme/tokens';

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
  root: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, gap: 2 },
  eyebrow: {
    fontSize: type.xs,
    fontWeight: weight.semibold,
    color: colors.primary,
    letterSpacing: 0.2,
  },
  title: text.h1,
  subtitle: { fontSize: type.xs, lineHeight: 17, color: colors.muted },
});
