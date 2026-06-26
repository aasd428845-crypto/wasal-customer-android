import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Image, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Star, Truck, Search, SlidersHorizontal } from 'lucide-react-native';
import { getActiveRestaurants } from '@/lib/api';
import type { Restaurant } from '@/types';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import ScreenHeader from '@/components/ScreenHeader';

const PRIMARY = '#1B4332';
const LIGHT_GREEN = '#52B788';
const TEXT_SECONDARY = '#888888';
const CARD_BG = '#FFFFFF';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CUISINE_FILTERS = ['الكل', 'يمني', 'برجر', 'بيتزا', 'مشاوي', 'صحي', 'حلويات', 'مأكولات بحرية'];

function RestaurantCard({ restaurant, onPress }: { restaurant: Restaurant; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {restaurant.image_url ? (
        <Image source={{ uri: restaurant.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>🍽️</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{restaurant.name_ar}</Text>
        {restaurant.description && (
          <Text style={styles.desc} numberOfLines={1}>{restaurant.description}</Text>
        )}
        <View style={styles.row}>
          <View style={styles.ratingRow}>
            <Star size={13} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>
              {restaurant.rating ? Number(restaurant.rating).toFixed(1) : 'جديد'}
            </Text>
            {restaurant.total_ratings && restaurant.total_ratings > 0 && (
              <Text style={styles.ratingCount}>({restaurant.total_ratings})</Text>
            )}
          </View>
          <View style={styles.deliveryRow}>
            <Truck size={13} color={TEXT_SECONDARY} />
            <Text style={styles.deliveryText}>
              {restaurant.delivery_fee !== undefined ? `${restaurant.delivery_fee} ر.ي` : 'مجاني'}
            </Text>
          </View>
        </View>
        {restaurant.delivery_time && (
          <Text style={styles.timeText}>⏱️ {restaurant.delivery_time}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function RestaurantsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filtered, setFiltered] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('الكل');

  const loadData = useCallback(async () => {
    try {
      const data = await getActiveRestaurants();
      setRestaurants(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    let result = restaurants;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.name_ar.toLowerCase().includes(q) ||
        r.cuisine_type?.toLowerCase().includes(q)
      );
    }
    if (activeFilter !== 'الكل') {
      result = result.filter(r => r.cuisine_type?.includes(activeFilter));
    }
    setFiltered(result);
  }, [search, activeFilter, restaurants]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="المطاعم" />

      {/* Search */}
      <View style={styles.searchBox}>
        <Search size={18} color={TEXT_SECONDARY} />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن مطعم أو نوع أكل..."
          placeholderTextColor={TEXT_SECONDARY}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity>
          <SlidersHorizontal size={18} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <FlatList
        data={CUISINE_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === item && styles.filterChipActive]}
            onPress={() => setActiveFilter(item)}
          >
            <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} />}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => navigation.navigate('RestaurantMenu', { restaurantId: item.id, restaurantName: item.name_ar })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا توجد مطاعم مطابقة للبحث</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 12, marginVertical: 8,
    backgroundColor: '#F5F5F5', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, textAlign: 'right', color: '#1A1A1A' },
  filters: { paddingHorizontal: 12, paddingBottom: 8, gap: 6 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#F5F5F5',
    marginRight: 6,
  },
  filterChipActive: { backgroundColor: PRIMARY },
  filterText: { fontSize: 12, color: TEXT_SECONDARY, fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '700' },

  card: {
    flexDirection: 'row', backgroundColor: CARD_BG,
    borderRadius: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 5, elevation: 3,
    overflow: 'hidden',
  },
  image: { width: 100, height: 100 },
  placeholder: { backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 32 },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '900', color: '#1A1A1A', textAlign: 'right' },
  desc: { fontSize: 11, color: TEXT_SECONDARY, marginTop: 2, textAlign: 'right' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 11, color: '#F59E0B', fontWeight: '700' },
  ratingCount: { fontSize: 10, color: TEXT_SECONDARY },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  deliveryText: { fontSize: 11, color: TEXT_SECONDARY },
  timeText: { fontSize: 10, color: LIGHT_GREEN, marginTop: 4, textAlign: 'right' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: TEXT_SECONDARY },
});
