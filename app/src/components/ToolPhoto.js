import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, radius, toneForCategory } from '../theme/tokens';

export default function ToolPhoto({
  tool,
  width = 56,
  height = 56,
  style,
  imageStyle,
  rounded = radius.md,
}) {
  const [failedUrl, setFailedUrl] = useState(null);
  const failed = Boolean(failedUrl && failedUrl === tool?.foto_url);
  const tone = toneForCategory(tool?.kategori?.slug);
  const fallbackSize = typeof width === 'number' && typeof height === 'number'
    ? Math.min(width, height)
    : 48;

  if (!tool?.foto_url || failed) {
    return (
      <View
        style={[
          styles.fallback,
          { width, height, borderRadius: rounded, backgroundColor: tone.bg },
          style,
        ]}
      >
        <Ionicons
          name={tool?.kategori?.icon || 'cube-outline'}
          size={fallbackSize * 0.36}
          color={tone.fg}
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: tool.foto_url }}
      style={[
        { width, height, borderRadius: rounded, backgroundColor: colors.surfaceMuted },
        style,
        imageStyle,
      ]}
      resizeMode="cover"
      onError={() => setFailedUrl(tool.foto_url)}
      accessibilityLabel={tool.nama}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
