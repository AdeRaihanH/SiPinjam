import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, weight } from '../theme/tokens';
import { inisial } from '../lib/format';

export default function UserAvatar({ nama, size = 40, inverted = false, style }) {
  return (
    <View
      style={[
        styles.root,
        {
          width: size,
          height: size,
          borderRadius: radius.md,
          backgroundColor: inverted ? 'rgba(255,255,255,0.14)' : colors.primarySoft,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { fontSize: size * 0.34, color: inverted ? colors.white : colors.primary },
        ]}
      >
        {inisial(nama)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: weight.bold, letterSpacing: 0.2 },
});
