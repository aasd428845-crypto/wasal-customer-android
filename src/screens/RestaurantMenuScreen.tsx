import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, RefreshControl, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Star, Plus, Minus, ShoppingBag, ChevronLeft } from 'lucide-react-native';
import { getRestaurantById, getRestaurantMenu } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { computeItemPromo, formatPrice } from '@/lib/utils';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { MenuItem, Restaurant } from '@/types';

const PRIMARY = '#1B4332';
const LIGHT_GREEN = '#52B788';
const TEXT_SECONDARY = '#888888';
const DANGER = '#E53935';

type Route = RouteProp<RootStackParamList, 'RestaurantMenu'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function MenuItemCard({
  item, restaurantId, restaurantName
}: {
  item: MenuItem; restaurantId: string; restaurantName: string;
}) {
  const { originalPrice, finalPrice, hasPromo } = computeItemPromo(item);
  const showDiscount = hasPromo && finalPrice < originalPrice;
  const discountPct = showDiscount ? Math.round((1 - finalPrice / originalPrice) * 100) : 0;

  const addToCart = useStore(s => s.addToCart);
  const cartItems = useStore(s => s.cartItems);
  const cartRestaurantId = useStore(s => s.cartRestaurantId);
  const updateQuantity = useStore(s => s.updateQuantity);

  const existing = cartItems.find(ci => ci.menu_item_id === item.id);
  const quantity = existing?.quantity || 0;

  const handleAdd = () => {
    if (cartRestaurantId && cartRestaurantId !== restaurantId) {
      Alert.alert(
        'تنبيه',
        'السلة تحتوي على items من مطعم آخر. هل تريد مسح السلة وإضافة هذا الطلب؟',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'نعم', onPress: () => {
              useStore.getState().clearCart();
              addToCart({
                menu_item_id: item.id,
                name: item.name_ar,
                price: finalPrice,
                quantity: 1,
                image_url: item.image_url,
              }, restaurantId);
            }
          },
        ]
      );
      return;
    }
    addToCart({
      menu_item_id: item.id,
      name: item.name_ar,
      price: finalPrice,
      quantity: 1,
      image_url: item.image_url,
    }, restaurantId);
  };

  const handleIncrement = () => {
    if (existing) updateQuantity(item.id, existing.quantity + 1);
    else handleAdd();
  };

  const handleDecrement = () => {
    if (existing && existing.quantity > 0) updateQuantity(item.id, existing.quantity - 1);
  };

  return (
    <View style={styles.itemCard}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      ) : (
        <View style={[styles.itemImage, styles.placeholder]}>
          <Text style={styles.placeholderEmoji}>🍽️</Text>
        </View>
      )}
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name_ar}</Text>
          {discountPct > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPct}%</Text>
            </View>
          )}
        </View>
        {item.description && (
          <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
        )}
        <View style={styles.itemFooter}>
          <View style={styles.priceRow}>
            {showDiscount && (
              <Text style={styles.oldPrice}>{Number(originalPrice).toLocaleString()}</Text>
            )}
            <Text style={styles.priceText}>{formatPrice(finalPrice)}</Text>
          </View>

          {quantity > 0 ? (
            <View style={styles.qtyControl}>
              <TouchableOpacity style={styles.qtyBtn} onPress={handleDecrement}>
                <Minus size={14} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={handleIncrement}>
                <Plus size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Plus size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export default function RestaurantMenuScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<NavigationProp>();
  const { restaurantId, restaurantName } = route.params;
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cartCount = useStore(s => s.getCartCount());

  const loadData = useCallback(async () => {
    try {
      const [restData, menuData] = await Promise.all([
        getRestaurantById(restaurantId),
        getRestaurantMenu(restaurantId),
      ]);
      setRestaurant(restData);
      setCategories([{ id: 'all', name_ar: 'الكل' }, ...menuData.categories]);
      setMenuItems(menuData.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category_id === activeCategory);

  return (
    <View style={styles.screen}>
      {/* Header Image */}
      <View style={styles.headerImageContainer}>
        {restaurant?.image_url ? (
          <Image source={{ uri: restaurant.image_url }} style={styles.headerImage} />
        ) : (
          <View style={[styles.headerImage, { backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: 48 }}>🍽️</Text>
          </View>
        )}
        <View style={styles.headerOverlay} />

        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>

        {/* Restaurant Info */}
        <View style={styles.restInfoOverlay}>
          <Text style={styles.restName}>{restaurant?.name_ar || restaurantName}</Text>
          <View style={styles.restMetaRow}>
            <View style={styles.metaItem}>
              <Star size={13} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.metaText}>
                {restaurant?.rating ? Number(restaurant.rating).toFixed(1) : 'جديد'}
              </Text>
            </View>
            {restaurant?.delivery_time && (
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>⏱️ {restaurant.delivery_time}</Text>
              </View>
            )}
            {restaurant?.delivery_fee !== undefined && (
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>🚚 {restaurant.delivery_fee} ر.ي</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabs}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catTab, activeCategory === cat.id && styles.catTabActive]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text style={[styles.catText, activeCategory === cat.id && styles.catTextActive]}>
              {cat.name_ar}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Menu Items */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} />}
        contentContainerStyle={styles.menuList}
      >
        {filteredItems.map(item => (
          <MenuItemCard
            key={item.id}
            item={item}
            restaurantId={restaurantId}
            restaurantName={restaurant?.name_ar || restaurantName}
          />
        ))}
        {filteredItems.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا توجد أصناف في هذا القسم</Text>
          </View>
        )}
      </ScrollView>

      {/* Cart FAB */}
      {cartCount > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('Cart')}
        >
          <ShoppingBag size={22} color="#fff" />
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{cartCount}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },

  headerImageContainer: { height: 200, position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  backBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center',
  },
  restInfoOverlay: {
    position: 'absolute', bottom: 12, right: 16, left: 16,
  },
  restName: { fontSize: 20, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  restMetaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  categoryTabs: { paddingHorizontal: 12, paddingVertical: 10, gap: 6 },
  catTab: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#F5F5F5',
    marginRight: 6,
  },
  catTabActive: { backgroundColor: PRIMARY },
  catText: { fontSize: 12, color: TEXT_SECONDARY, fontWeight: '500' },
  catTextActive: { color: '#fff', fontWeight: '700' },

  menuList: { padding: 12, paddingBottom: 20 },

  itemCard: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    overflow: 'hidden',
  },
  itemImage: { width: 90, height: 90 },
  placeholder: { backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  placeholderEmoji: { fontSize: 28 },
  itemInfo: { flex: 1, padding: 10, justifyContent: 'space-between' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', flex: 1, textAlign: 'right' },
  discountBadge: {
    backgroundColor: DANGER, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
    marginLeft: 6,
  },
  discountText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  itemDesc: { fontSize: 10, color: TEXT_SECONDARY, marginTop: 2, textAlign: 'right' },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  oldPrice: { fontSize: 11, color: TEXT_SECONDARY, textDecorationLine: 'line-through' },
  priceText: { fontSize: 13, fontWeight: '900', color: PRIMARY },
  addBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center',
  },
  qtyControl: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 6,
  },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 6,
    backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center',
  },
  qtyText: { fontSize: 13, fontWeight: '700', color: PRIMARY, minWidth: 20, textAlign: 'center' },

  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: TEXT_SECONDARY },

  fab: {
    position: 'absolute', bottom: 20, left: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  fabBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: DANGER, borderRadius: 10,
    minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center',
  },
  fabBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
});
