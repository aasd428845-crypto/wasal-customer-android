import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { CheckCircle, Clock, ChefHat, Truck, Package, XCircle, MapPin } from 'lucide-react-native';
import { getOrderById } from '@/lib/api';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { DeliveryOrder } from '@/types';
import ScreenHeader from '@/components/ScreenHeader';

const PRIMARY = '#1B4332';
const LIGHT_GREEN = '#52B788';
const TEXT_SECONDARY = '#888888';

type Route = RouteProp<RootStackParamList, 'OrderTracking'>;

const STEPS = [
  { key: 'pending', label: 'تم الاستلام', icon: Clock },
  { key: 'confirmed', label: 'تم التأكيد', icon: CheckCircle },
  { key: 'preparing', label: 'قيد التحضير', icon: ChefHat },
  { key: 'ready', label: 'جاهز', icon: Package },
  { key: 'out_for_delivery', label: 'في الطريق', icon: Truck },
  { key: 'delivered', label: 'تم التوصيل', icon: MapPin },
];

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  ready: 3,
  out_for_delivery: 4,
  delivered: 5,
  cancelled: -1,
};

export default function OrderTrackingScreen() {
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
        <ScreenHeader title="تتبع الطلب" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="تتبع الطلب" />
        <View style={styles.center}>
          <Text style={styles.errorText}>الطلب غير موجود</Text>
        </View>
      </View>
    );
  }

  const currentIdx = STATUS_INDEX[order.status] ?? 0;
  const isCancelled = order.status === 'cancelled';

  return (
    <View style={styles.screen}>
      <ScreenHeader title={`تتبع الطلب #${order.id.slice(-6)}`} />

      <View style={styles.content}>
        {/* Status Banner */}
        <View style={[styles.banner, { backgroundColor: isCancelled ? '#FEF2F2' : '#F0FFF4' }]}>
          {isCancelled ? (
            <>
              <XCircle size={32} color="#EF4444" />
              <Text style={[styles.bannerTitle, { color: '#EF4444' }]}>الطلب ملغي</Text>
            </>
          ) : (
            <>
              <Truck size={32} color={LIGHT_GREEN} />
              <Text style={styles.bannerTitle}>طلبك قيد التنفيذ</Text>
              <Text style={styles.bannerSub}>سنقوم بإشعارك عند كل تحديث</Text>
            </>
          )}
        </View>

        {/* Timeline */}
        {!isCancelled && (
          <View style={styles.timeline}>
            {STEPS.map((step, idx) => {
              const isActive = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              const StepIcon = step.icon;

              return (
                <View key={step.key} style={styles.step}>
                  <View style={styles.stepContent}>
                    <View style={[
                      styles.stepIcon,
                      isActive && styles.stepIconActive,
                      isCurrent && styles.stepIconCurrent,
                    ]}>
                      <StepIcon size={18} color={isActive ? '#fff' : TEXT_SECONDARY} />
                    </View>
                    <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                      {step.label}
                    </Text>
                  </View>
                  {idx < STEPS.length - 1 && (
                    <View style={[styles.stepLine, idx < currentIdx && styles.stepLineActive]} />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Order Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>تفاصيل الطلب</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>العنوان:</Text>
            <Text style={styles.detailValue}>{order.customer_address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>الهاتف:</Text>
            <Text style={styles.detailValue}>{order.customer_phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>الدفع:</Text>
            <Text style={styles.detailValue}>
              {order.payment_method === 'cash' ? 'نقداً عند الاستلام' : order.payment_method}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>المجموع:</Text>
            <Text style={styles.detailTotal}>{order.total.toLocaleString()} ر.ي</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 14, color: TEXT_SECONDARY },

  content: { padding: 16 },

  banner: {
    alignItems: 'center', paddingVertical: 24, borderRadius: 16, marginBottom: 20,
  },
  bannerTitle: { fontSize: 16, fontWeight: '900', color: PRIMARY, marginTop: 8 },
  bannerSub: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 4 },

  timeline: { marginBottom: 20 },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  stepContent: { flexDirection: 'row', alignItems: 'center', width: 140 },
  stepIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
  },
  stepIconActive: { backgroundColor: LIGHT_GREEN },
  stepIconCurrent: { backgroundColor: PRIMARY },
  stepLabel: { fontSize: 12, color: TEXT_SECONDARY, marginLeft: 10, fontWeight: '500' },
  stepLabelActive: { color: '#1A1A1A', fontWeight: '700' },
  stepLine: {
    width: 2, height: 20, backgroundColor: '#E0E0E0',
    marginLeft: 17, marginVertical: 2,
  },
  stepLineActive: { backgroundColor: LIGHT_GREEN },

  detailsCard: {
    backgroundColor: '#FAFAFA', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#f0f0f0',
  },
  detailsTitle: { fontSize: 14, fontWeight: '900', color: '#1A1A1A', marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { fontSize: 12, color: TEXT_SECONDARY },
  detailValue: { fontSize: 12, color: '#1A1A1A', fontWeight: '600', flex: 1, textAlign: 'right' },
  detailTotal: { fontSize: 14, fontWeight: '900', color: PRIMARY },
});
