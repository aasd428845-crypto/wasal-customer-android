import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react-native';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import EmptyState from '@/components/EmptyState';

const PRIMARY = '#1B4332';
const LIGHT_GREEN = '#52B788';
const TEXT_SECONDARY = '#888888';
const DANGER = '#E53935';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CartScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const cartItems = useStore(s => s.cartItems);
  const cartRestaurantId = useStore(s => s.cartRestaurantId);
  const clearCart = useStore(s => s.clearCart);
  const updateQuantity = useStore(s => s.updateQuantity);
  const removeFromCart = useStore(s => s.removeFromCart);
  const getCartTotal = useStore(s => s.getCartTotal);

  const total = getCartTotal();

  const handleCheckout = () => {
    if (!user) {
      Alert.alert('تنبيه', 'يرجى تسجيل الدخول أولاً', [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الدخول', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    if (cartItems.length === 0) return;
    navigation.navigate('Checkout', {
      restaurantId: cartRestaurantId || '',
      restaurantName: '',
      deliveryFee: 0,
    });
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.screen}>
        <Text style={styles.headerTitle}>سلة التسوق</Text>
        <EmptyState
          message="السلة فارغة"
          subMessage="أضف بعض الوجبات اللذيذة!"
        />
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={() => navigation.navigate('Restaurants')}
        >
          <Text style={styles.browseBtnText}>تصفح المطاعم</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.headerTitle}>سلة التسوق ({cartItems.length})</Text>

      <ScrollView style={styles.itemList} contentContainerStyle={{ paddingBottom: 20 }}>
        {cartItems.map(item => (
          <View key={item.menu_item_id} style={styles.itemCard}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.itemImage} />
            ) : (
              <View style={[styles.itemImage, { backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 24 }}>🍽️</Text>
              </View>
            )}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => item.quantity <= 1 ? removeFromCart(item.menu_item_id) : updateQuantity(item.menu_item_id, item.quantity - 1)}
              >
                {item.quantity <= 1 ? <Trash2 size={14} color={DANGER} /> : <Minus size={14} color={PRIMARY} />}
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
              >
                <Plus size={14} color={PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Clear Cart */}
        <TouchableOpacity style={styles.clearBtn} onPress={() => {
          Alert.alert('مسح السلة', 'هل أنت متأكد من مسح جميع العناصر؟', [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'مسح', style: 'destructive', onPress: clearCart },
          ]);
        }}>
          <Trash2 size={16} color={DANGER} />
          <Text style={styles.clearText}>مسح السلة</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Total */}
      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>المجموع:</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <ShoppingBag size={18} color="#fff" />
          <Text style={styles.checkoutText}>إتمام الطلب</Text>
        </TouchableOpacity>
      </View>
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

  itemList: { flex: 1, paddingHorizontal: 12, paddingTop: 8 },

  itemCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 10,
    marginBottom: 8, borderWidth: 1, borderColor: '#f0f0f0',
  },
  itemImage: { width: 56, height: 56, borderRadius: 10 },
  itemInfo: { flex: 1, marginHorizontal: 10 },
  itemName: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', textAlign: 'right' },
  itemPrice: { fontSize: 12, fontWeight: '700', color: PRIMARY, marginTop: 4 },

  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
  },
  qtyText: { fontSize: 13, fontWeight: '700', color: PRIMARY, minWidth: 20, textAlign: 'center' },

  clearBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 12, paddingVertical: 10,
  },
  clearText: { fontSize: 13, color: DANGER, fontWeight: '600' },

  bottomBar: {
    padding: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalLabel: { fontSize: 14, color: TEXT_SECONDARY },
  totalValue: { fontSize: 18, fontWeight: '900', color: PRIMARY },

  checkoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 14,
  },
  checkoutText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  browseBtn: {
    marginHorizontal: 40, backgroundColor: PRIMARY,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  browseBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
