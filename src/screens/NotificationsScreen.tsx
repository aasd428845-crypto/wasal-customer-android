import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Bell } from 'lucide-react-native';
import EmptyState from '@/components/EmptyState';
import ScreenHeader from '@/components/ScreenHeader';

export default function NotificationsScreen() {
  return (
    <View style={styles.screen}>
      <ScreenHeader title="الإشعارات" />
      <EmptyState message="لا توجد إشعارات" subMessage="ستظهر إشعارات الطلبات هنا" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
});
