import React, { useState } from 'react';
import { View, Image, StyleSheet, ImageStyle, ViewStyle, Text } from 'react-native';
import { colors, borderRadius } from '../../theme';
import { getPlaceholder, getEmoji } from '../../utils/placeholders';

interface SafeImageProps {
  uri?: string;
  placeholder?: string;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  fallbackColor?: string;
  emoji?: string;
  size?: 'cover' | 'contain' | 'stretch';
}

export function SafeImage({
  uri,
  placeholder,
  style,
  containerStyle,
  fallbackColor,
  emoji: forcedEmoji,
  size = 'cover',
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const fallbackSrc = placeholder
    ? getPlaceholder(placeholder)
    : getPlaceholder('MiniGreens', fallbackColor || colors.primary);

  const displayUri = (!uri || failed) ? fallbackSrc : uri;

  const resolvedStyle: ImageStyle = {
    ...(style as object),
    resizeMode: size,
  } as ImageStyle;

  return (
    <View style={[styles.container, containerStyle, (!uri || failed) && { backgroundColor: 'transparent' }]}>
      <Image
        source={{ uri: displayUri }}
        style={[style, { width: style?.width as number || '100%', height: style?.height as number || '100%' }]}
        onError={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
