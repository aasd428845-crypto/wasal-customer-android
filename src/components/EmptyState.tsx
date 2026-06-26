import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Package } from 'lucide-react-native';

interface Props {
  message: string;
  subMessage?: string;
}

export default function EmptyState({ message, subMessage }: Props) {
  return (
    <View style={styles.container}>
      <Package size={48} color="#ccc" />
      <Text style={styles.message}>{message}</Text>
      {subMessage && <Text style={styles.sub}>{subMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  message: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
    marginTop: 12,
  },
  sub: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
});
