import React from 'react';
import { TouchableOpacity, Text, ImageBackground, StyleSheet } from 'react-native';

interface Props {
  title: string;
  imageUrl: string;
  onPress: () => void;
}

export default function ServiceTile({ title, imageUrl, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.85}>
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.image}
        imageStyle={{ borderRadius: 14 }}
      >
        <Text style={styles.label}>{title}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 80,
    margin: 4,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 8,
    borderRadius: 14,
    backgroundColor: '#1B4332',
  },
  label: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
}], 