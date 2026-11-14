import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { toneForCategory } from '../theme';

export default function ToolGlyph({ tool, size = 52, style }) {
  const tone = toneForCategory(tool?.kategori_slug);
  return (
    <View
      style={[
        styles.root,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: tone.bg,
        },
        style,
      ]}
    >
      <Ionicons
        name={tool?.kategori_icon || 'cube-outline'}
        size={size * 0.46}
        color={tone.fg}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
