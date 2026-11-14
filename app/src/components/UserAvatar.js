import { StyleSheet, Text, View } from 'react-native';
import { inisial } from '../utils/format';
import { colors } from '../theme';

export default function UserAvatar({
  nama,
  size = 44,
  inverted = false,
  style,
}) {
  return (
    <View
      style={[
        styles.root,
        {
          width: size,
          height: size,
          borderRadius: size * 0.36,
          backgroundColor: inverted ? 'rgba(255,255,255,0.16)' : colors.primarySoft,
          borderWidth: inverted ? 1 : 0,
          borderColor: 'rgba(255,255,255,0.24)',
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: size * 0.34,
            color: inverted ? colors.white : colors.primaryDark,
          },
        ]}
      >
        {inisial(nama)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
