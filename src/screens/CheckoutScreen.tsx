import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapPin, CreditCard, Phone, User, ChevronLeft } from 'lucide-react-native';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder, fetchAddresses } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { CustomerAddress } from '@/types';

const PRIMARY = '#1B4332';
const LIGHT_GREEN = '#52B788';
const TEXT_SECONDARY = '#888888';

type Route = RouteProp<RootStackParamList, 'Checkout'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CheckoutScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();
  const { user, profile } = useAuth();
  const cartItems = useStore(s => s.cartItems);
  const cartRestaurantId = useStore(s => s.cartRestaurantId);
  const clearCart = useStore(s => s.clearCart);
  const getCartTotal = useStore(s => s.getCartTotal);

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null);
  const [customerName, setCustomerName] = useState(profile?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || '');
  const [manualAddress, setManualAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = getCartTotal();
  const deliveryFee = route.params?.deliveryFee || 0;
  const tax = 0;
  const total = subtotal + deliveryFee + tax;

  useEffect(() => {
    if (user?.id) {
      fetchAddresses(user.id).then(data => {
        setAddresses(data);
        const def = data.find(a => a.is_default);
        if (def) setSelectedAddress(def);
      }).catch(() => {});
    }
  }, [user?.id]);

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert('تنبيه', 'يرجى تسجيل الدخول أولاً');
      return;
    }
    if (!customerName || !customerPhone) {
      Alert.alert('خطأ', 'يرجى إدخال الاسم ورقم الهاتف');
      return;
    }
    if (!selectedAddress && !manualAddress) {
      Alert.alert('خطأ', 'يرجى اختيار أو إدخال عنوان التوصيل');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer_id: user.id,
        restaurant_id: cartRestaurantId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: selectedAddress?.full_address || manualAddress,
        delivery_lat: selectedAddress?.latitude || null,
        delivery_lng: selectedAddress?.longitude || null,
        items: cartItems.map(i => ({
          menu_item_id: i.menu_item_id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal,
        delivery_fee: deliveryFee,
        tax,
        total,
        payment_method: paymentMethod,
        notes: notes || null,
        status: 'pending',
        payment_status: 'pending',
        order_type: 'restaurant',
      };

      const result = await createOrder(orderData);
      clearCart();

      Alert.alert(
        'تم إرسال الطلب!',
        `رقم الطلب: ${result.id}`,
        [
          {
            text: 'تتبع الطلب',
            onPress: () => navigation.navigate('OrderTracking', { orderId: result.id }),
          },
          {
            text: 'الرئيسية',
            onPress: () => navigation.navigate('MainTabs'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('خطأ', err.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إتمام الطلب</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملخص الطلب</Text>
          {cartItems.map(item => (
            <View key={item.menu_item_id} style={styles.orderItem}>
              <Text style={styles.orderItemName}>{item.name}</Text>
              <View style={styles.orderItemRow}>
                <Text style={styles.orderItemQty}>x{item.quantity}</Text>
                <Text style={styles.orderItemPrice}>{formatPrice(item.price * item.quantity)}</Text>
              </View>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>المجموع الفرعي</Text>
            <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>رسوم التوصيل</Text>
            <Text style={styles.totalValue}>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'مجاني'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandLabel}>الإجمالي</Text>
            <Text style={styles.grandValue}>{formatPrice(total)}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات العميل</Text>
          <View style={styles.inputGroup}>
            <User size={16} color={TEXT_SECONDARY} />
            <TextInput
              style={styles.input}
              placeholder="الاسم الكامل *"
              value={customerName}
              onChangeText={setCustomerName}
              textAlign="right"
            />
          </View>
          <View style={styles.inputGroup}>
            <Phone size={16} color={TEXT_SECONDARY} />
            <TextInput
              style={styles.input}
              placeholder="رقم الهاتف *"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
              textAlign="right"
            />
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عنوان التوصيل</Text>

          {/* Saved Addresses */}
          {addresses.length > 0 && addresses.map(addr => (
            <TouchableOpacity
              key={addr.id}
              style={[styles.addressCard, selectedAddress?.id === addr.id && styles.addressCardActive]}
              onPress={() => setSelectedAddress(addr)}
            >
              <MapPin size={16} color={selectedAddress?.id === addr.id ? LIGHT_GREEN : TEXT_SECONDARY} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.addressName}>{addr.address_name}</Text>
                <Text style={styles.addressText} numberOfLines={2}>{addr.full_address}</Text>
              </View>
              {addr.is_default && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>افتراضي</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* Manual Address */}
          <TextInput
            style={[styles.inputGroup, styles.textArea]}
            placeholder="أو أدخل عنوان يدوي..."
            value={manualAddress}
            onChangeText={setManualAddress}
            multiline
            textAlign="right"
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>طريقة الدفع</Text>
          <View style={styles.paymentRow}>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentActive]}
              onPress={() => setPaymentMethod('cash')}
            >
              <CreditCard size={20} color={paymentMethod === 'cash' ? PRIMARY : TEXT_SECONDARY} />
              <Text style={[styles.paymentText, paymentMethod === 'cash' && styles.paymentTextActive]}>
                نقداً عند الاستلام
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentActive]}
              onPress={() => setPaymentMethod('card')}
            >
              <CreditCard size={20} color={paymentMethod === 'card' ? PRIMARY : TEXT_SECONDARY} />
              <Text style={[styles.paymentText, paymentMethod === 'card' && styles.paymentTextActive]}>
                بطاقة
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملاحظات (اختياري)</Text>
          <TextInput
            style={[styles.inputGroup, styles.textArea]}
            placeholder="أي ملاحظات خاصة بالطلب..."
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlign="right"
          />
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.placeBtn, loading && styles.placeBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeBtnText}>تأكيد الطلب - {formatPrice(total)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F8F8' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#1A1A1A' },

  section: { backgroundColor: '#fff', marginTop: 8, padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#1A1A1A', marginBottom: 12, textAlign: 'right' },

  orderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  orderItemName: { fontSize: 13, color: '#1A1A1A', flex: 1, textAlign: 'right' },
  orderItemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderItemQty: { fontSize: 12, color: TEXT_SECONDARY },
  orderItemPrice: { fontSize: 13, fontWeight: '700', color: PRIMARY },

  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  totalLabel: { fontSize: 13, color: TEXT_SECONDARY },
  totalValue: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  grandLabel: { fontSize: 15, fontWeight: '900', color: '#1A1A1A' },
  grandValue: { fontSize: 18, fontWeight: '900', color: PRIMARY },

  inputGroup: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F8F8', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 4,
    marginBottom: 10, borderWidth: 1, borderColor: '#E8E8E8',
  },
  input: { flex: 1, fontSize: 13, color: '#1A1A1A', marginLeft: 8, textAlign: 'right', paddingVertical: 8 },
  textArea: { minHeight: 60, alignItems: 'flex-start', paddingVertical: 8 },

  addressCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    padding: 10, marginBottom: 8, backgroundColor: '#FAFAFA',
  },
  addressCardActive: { borderColor: LIGHT_GREEN, backgroundColor: '#F0FFF4' },
  addressName: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },
  addressText: { fontSize: 11, color: TEXT_SECONDARY, marginTop: 2 },
  defaultBadge: {
    backgroundColor: LIGHT_GREEN, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  defaultText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  paymentRow: { flexDirection: 'row', gap: 10 },
  paymentOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingVertical: 12, backgroundColor: '#FAFAFA',
  },
  paymentActive: { borderColor: PRIMARY, backgroundColor: '#F0FFF4' },
  paymentText: { fontSize: 12, color: TEXT_SECONDARY, fontWeight: '600' },
  paymentTextActive: { color: PRIMARY, fontWeight: '700' },

  bottomBar: {
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  placeBtn: {
    backgroundColor: PRIMARY, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  placeBtnDisabled: { opacity: 0.6 },
  placeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
