import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { getOrderById } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { DeliveryOrder } from '@/types';
import ScreenHeader from '@/components/ScreenHeader';

const PRIMARY = '#1B4332';
const TEXT_SECONDARY = '#888888';

type Route = RouteProp<RootStackParamList, 'OrderDetails'>;

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  preparing: 'قيد التحضير',
  ready: 'جاهز',
  out_for_delivery: 'في الطريق',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

export default function OrderDetailsScreen() {
  const route = useRoute<Route>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(orderId).then(data => {
      setOrder(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="تفاصيل الطلب" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="تفاصيل الطلب" />
        <View style={styles.center}>
          <Text>الطلب غير موجود</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title={`طلب #${order.id.slice(-6)}`} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>حالة الطلب</Text>
          <Text style={styles.statusValue}>{STATUS_LABELS[order.status] || order.status}</Text>
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>الأصناف</Text>
          {order.items?.map((item: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.itemRight}>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
                <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>الفاتورة</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>المجموع الفرعي</Text>
            <Text style={styles.billValue}>{formatPrice(order.subtotal)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>رسوم التوصيل</Text>
            <Text style={styles.billValue}>{formatPrice(order.delivery_fee)}</Text>
          </View>
          {order.tax && order.tax > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>الضريبة</Text>
              <Text style={styles.billValue}>{formatPrice(order.tax)}</Text>
            </View>
          )}
          <View style={[styles.billRow, styles.grandRow]}>
            <Text style={styles.grandLabel}>الإجمالي</Text>
            <Text style={styles.grandValue}>{formatPrice(order.total)}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>معلومات التوصيل</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>الاسم:</Text>
            <Text style={styles.infoValue}>{order.customer_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>الهاتف:</Text>
            <Text style={styles.infoValue}>{order.customer_phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>العنوان:</Text>
            <Text style={styles.infoValue}>{order.customer_address}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 30 },

  statusCard: {
    backgroundColor: '#F0FFF4', borderRadius: 14, padding: 16,
    alignItems: 'center', marginBottom: 16,
  },
  statusLabel: { fontSize: 12, color: TEXT_SECONDARY },
  statusValue: { fontSize: 18, fontWeight: '900', color: PRIMARY, marginTop: 4 },

  card: {
    backgroundColor: '#FAFAFA', borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0',
  },
  cardTitle: { fontSize: 14, fontWeight: '900', color: '#1A1A1A', marginBottom: 12 },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  itemName: { fontSize: 13, color: '#1A1A1A', flex: 1, textAlign: 'right' },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemQty: { fontSize: 12, color: TEXT_SECONDARY },
  itemPrice: { fontSize: 13, fontWeight: '700', color: PRIMARY },

  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  billLabel: { fontSize: 12, color: TEXT_SECONDARY },
  billValue: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  grandRow: { borderTopWidth: 1, borderTopColor: '#e0e0e0', marginTop: 8, paddingTop: 8 },
  grandLabel: { fontSize: 15, fontWeight: '900', color: '#1A1A1A' },
  grandValue: { fontSize: 18, fontWeight: '900', color: PRIMARY },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  infoLabel: { fontSize: 12, color: TEXT_SECONDARY, width: 60 },
  infoValue: { fontSize: 12, color: '#1A1A1A', fontWeight: '600', flex: 1, textAlign: 'right' },
});
