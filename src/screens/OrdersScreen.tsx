import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClipboardList, ChevronLeft, Package } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMyOrders } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { DeliveryOrder } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

const PRIMARY = '#1B4332';
const LIGHT_GREEN = '#52B788';
const TEXT_SECONDARY = '#888888';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  preparing: '#8B5CF6',
  ready: '#06B6D4',
  out_for_delivery: '#F97316',
  delivered: '#10B981',
  cancelled: '#EF4444',
  pending_approval: '#F59E0B',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  preparing: 'قيد التحضير',
  ready: 'جاهز',
  out_for_delivery: 'في الطريق',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
  pending_approval: 'بانتظار الموافقة',
};

function OrderCard({ order, onPress }: { order: DeliveryOrder; onPress: () => void }) {
  const statusColor = STATUS_COLORS[order.status] || TEXT_SECONDARY;
  const statusLabel = STATUS_LABELS[order.status] || order.status;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
        <Text style={styles.orderDate}>
          {new Date(order.created_at).toLocaleDateString('ar-YE')}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.orderId}>طلب #{order.id.slice(-6)}</Text>
        <Text style={styles.orderItems} numberOfLines={1}>
          {order.items?.map((i: any) => i.name).join('، ') || 'طلب توصيل'}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.paymentBadge}>
          <Text style={styles.paymentText}>
            {order.payment_method === 'cash' ? 'نقداً' : order.payment_method === 'card' ? 'بطاقة' : order.payment_method}
          </Text>
        </View>
        <Text style={styles.totalText}>{formatPrice(order.total)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchMyOrders(user.id);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return (
      <View style={styles.screen}>
        <EmptyState message="تسجيل الدخول مطلوب" subMessage="سجل الدخول لعرض طلباتك" />
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.headerTitle}>طلباتي</Text>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} />}
        contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState message="لا توجد طلبات" subMessage="اطلب الآن واستمتع!" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  headerTitle: {
    fontSize: 18, fontWeight: '900', color: '#1A1A1A',
    textAlign: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },

  card: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderDate: { fontSize: 11, color: TEXT_SECONDARY },

  cardBody: { marginBottom: 10 },
  orderId: { fontSize: 14, fontWeight: '900', color: '#1A1A1A' },
  orderItems: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 4 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentBadge: {
    backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  paymentText: { fontSize: 11, color: TEXT_SECONDARY },
  totalText: { fontSize: 15, fontWeight: '900', color: PRIMARY },

  loginBtn: {
    marginHorizontal: 40, marginTop: 16,
    backgroundColor: PRIMARY, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  loginBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
