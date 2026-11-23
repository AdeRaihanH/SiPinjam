import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { colors, gradients, weight } from '../theme/tokens';
import { inisial } from '../lib/format';

export default function UserAvatar({ nama, size = 40, inverted = false, style }) {
  return (
    <View
      style={[
        styles.root,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: inverted ? 'rgba(255,255,255,0.16)' : colors.primarySoft,
        },
        style,
      ]}
    >
      {!inverted ? (
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
        />
      ) : null}
      <Text
        style={[
          styles.text,
          { fontSize: size * 0.34, color: colors.white },
        ]}
      >
        {inisial(nama)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  text: { fontWeight: weight.heavy, letterSpacing: 0.2 },
});
