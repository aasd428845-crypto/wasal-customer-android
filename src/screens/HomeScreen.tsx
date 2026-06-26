import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TouchableOpacity, Dimensions, FlatList, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, Star, TrendingUp, Shield, Zap, Truck } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/store/useStore';
import { fetchBanners, getCustomerActiveOffers, fetchTopRatedItems, fetchFeaturedItems, fetchMealOffers, getActiveRestaurants, fetchPlatformStats } from '@/lib/api';
import { computeItemPromo, formatPrice, PROMO_SELECT } from '@/lib/utils';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { DeliveryBanner, DeliveryOffer, MenuItem, Restaurant } from '@/types';

const { width } = Dimensions.get('window');
const PRIMARY = '#1B4332';
const LIGHT_GREEN = '#52B788';
const CARD_BG = '#FFFFFF';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#888888';
const DANGER = '#E53935';

const FEATURES = [
  { icon: Zap, label: 'توصيل سريع', color: '#F59E0B' },
  { icon: Shield, label: 'دفع آمن', color: LIGHT_GREEN },
  { icon: Star, label: 'تقييمات موثوقة', color: '#F97316' },
  { icon: TrendingUp, label: 'أسعار تنافسية', color: '#3B82F6' },
];

const DEFAULT_BANNERS: DeliveryBanner[] = [
  { id: 'd1', title: 'اطلب من مطاعمك المفضلة', subtitle: 'توصيل سريع لباب منزلك', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&fit=crop', badge_text: 'جديد', link_url: '/food', banner_type: 'carousel', is_active: true },
  { id: 'd2', title: 'خدمات توصيل، تسوق، انقل من أي مكان', subtitle: 'مناديب لتوصيل طرودك وطلباتك في أسرع وقت', image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80&fit=crop', badge_text: 'متاح الآن', link_url: '/delivery-request', banner_type: 'carousel', is_active: true },
  { id: 'd3', title: 'عروض حصرية كل يوم', subtitle: 'لا تفوّت أفضل الأسعار', image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80&fit=crop', badge_text: 'عرض محدود', link_url: '/food', banner_type: 'carousel', is_active: true },
];

const DEFAULT_OFFERS: DeliveryOffer[] = [
  { id: 'o1', title: 'خصم 20% على أول طلب', description: 'لعملاء وصل الجدد', image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80&fit=crop', offer_type: 'percent_off_order', discount_percent: 20, delivery_company_id: '', is_active: true, created_at: '' },
  { id: 'o2', title: 'توصيل مجاني', description: 'عند الطلب فوق 2000 ر.ي', image_url: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=600&q=80&fit=crop', offer_type: 'free_delivery', delivery_company_id: '', is_active: true, created_at: '' },
  { id: 'o3', title: 'وجبات البرجر المميزة', description: 'أقل سعر في المدينة', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80&fit=crop', offer_type: 'percent_off_delivery', discount_percent: 30, delivery_company_id: '', is_active: true, created_at: '' },
];

const DEFAULT_SERVICE_TILES = [
  { key: 'food', label: 'مطاعم وتوصيل', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&fit=crop', action: 'food' },
  { key: 'delivery', label: 'توصيل طرود', img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80&fit=crop', action: 'delivery' },
];

const SERVICE_COLORS: Record<string, string> = {
  food: '#E07A5F',
  delivery: '#3D405B',
  grocery: '#81B29A',
  pharmacy: '#5FA8D3',
  more: '#F2CC8F',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ─── Menu Item Card ──────────────────────────────────────────────────────────
function ItemCard({ item, onPress }: { item: MenuItem; onPress: () => void }) {
  const { originalPrice, finalPrice, hasPromo } = computeItemPromo(item);
  const showDiscount = hasPromo && finalPrice < originalPrice;
  const discountPct = showDiscount
    ? Math.round((1 - finalPrice / originalPrice) * 100)
    : 0;

  return (
    <TouchableOpacity style={styles.itemCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.itemImageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>🍔</Text>
          </View>
        )}
        {discountPct > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPct}%</Text>
          </View>
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name_ar}</Text>
        <Text style={styles.itemRestaurant} numberOfLines={1}>
          {item.restaurants?.name_ar || ''}
        </Text>
        <View style={styles.itemFooter}>
          <View style={styles.ratingRow}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>
              {item.rating && item.rating > 0 ? Number(item.rating).toFixed(1) : 'جديد'}
            </Text>
          </View>
          {showDiscount ? (
            <View style={styles.priceColumn}>
              <Text style={styles.oldPrice}>{Number(originalPrice).toLocaleString()}</Text>
              <Text style={styles.newPrice}>{formatPrice(finalPrice)}</Text>
            </View>
          ) : (
            <Text style={styles.priceText}>{formatPrice(finalPrice)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Restaurant Card ─────────────────────────────────────────────────────────
function RestaurantCard({ restaurant, onPress }: { restaurant: Restaurant; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.restCard} onPress={onPress} activeOpacity={0.85}>
      {restaurant.image_url ? (
        <Image source={{ uri: restaurant.image_url }} style={styles.restImage} />
      ) : (
        <View style={[styles.restImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>🍽️</Text>
        </View>
      )}
      <View style={styles.restInfo}>
        <Text style={styles.restName} numberOfLines={1}>{restaurant.name_ar}</Text>
        <View style={styles.restRow}>
          <View style={styles.ratingRow}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>
              {restaurant.rating ? Number(restaurant.rating).toFixed(1) : 'جديد'}
            </Text>
          </View>
          {restaurant.delivery_time && (
            <View style={styles.deliveryRow}>
              <Truck size={12} color={TEXT_SECONDARY} />
              <Text style={styles.deliveryText}>{restaurant.delivery_time}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ title, onMore }: { title: string; onMore?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onMore && (
        <TouchableOpacity onPress={onMore}>
          <Text style={styles.moreText}>عرض الكل</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, profile } = useAuth();
  const unreadCount = useStore(s => s.unreadCount);

  const [refreshing, setRefreshing] = useState(false);
  const [carouselBanners, setCarouselBanners] = useState<DeliveryBanner[]>(DEFAULT_BANNERS);
  const [offers, setOffers] = useState<DeliveryOffer[]>(DEFAULT_OFFERS);
  const [topItems, setTopItems] = useState<MenuItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [mealOffers, setMealOffers] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState<{ restaurants: number; cities: number; avgRating: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [bannersData, offersData, topData, featuredData, mealData, restsData, statsData] = await Promise.all([
        fetchBanners(),
        getCustomerActiveOffers(),
        fetchTopRatedItems(),
        fetchFeaturedItems(),
        fetchMealOffers(),
        getActiveRestaurants(),
        fetchPlatformStats(),
      ]);

      const carousel = bannersData.filter(b => !b.banner_type || b.banner_type === 'carousel');
      setCarouselBanners(carousel.length > 0 ? carousel : DEFAULT_BANNERS);
      setOffers(offersData.length > 0 ? offersData : DEFAULT_OFFERS);
      setTopItems(topData);
      setFeaturedItems(featuredData);
      setMealOffers(mealData);
      setRestaurants(restsData.slice(0, 6));
      setStats(statsData);
    } catch (err) {
      console.error('Home load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const navigateToRestaurant = (id: string, name: string) => {
    navigation.navigate('RestaurantMenu', { restaurantId: id, restaurantName: name });
  };

  const handleServiceTile = (action: string) => {
    if (action === 'food') navigation.navigate('Restaurants');
    else if (action === 'delivery') navigation.navigate('DeliveryRequest');
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>أهلاً{profile?.full_name ? `، ${profile.full_name.split(' ')[0]}` : ''} 👋</Text>
          <Text style={styles.subGreeting}>ماذا تريد أن تطلب اليوم؟</Text>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Bell size={22} color={PRIMARY} />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Service Tiles */}
        <View style={styles.tilesGrid}>
          {DEFAULT_SERVICE_TILES.map(tile => (
            <TouchableOpacity
              key={tile.key}
              style={[styles.tile, { backgroundColor: SERVICE_COLORS[tile.key] || PRIMARY }]}
              onPress={() => handleServiceTile(tile.action)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: tile.img }} style={styles.tileImage} />
              <View style={styles.tileOverlay} />
              <Text style={styles.tileLabel}>{tile.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Banner Carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bannerScroll}
        >
          {carouselBanners.map(banner => (
            <TouchableOpacity
              key={banner.id}
              style={styles.bannerCard}
              onPress={() => {
                if (banner.link_url?.includes('food') || banner.link_tab === 'food') {
                  navigation.navigate('Restaurants');
                } else if (banner.link_url?.includes('delivery')) {
                  navigation.navigate('DeliveryRequest');
                }
              }}
              activeOpacity={0.9}
            >
              <Image source={{ uri: banner.image_url }} style={styles.bannerImage} />
              <View style={styles.bannerOverlay} />
              {banner.badge_text && (
                <View style={styles.bannerBadge}>
                  <Text style={styles.bannerBadgeText}>{banner.badge_text}</Text>
                </View>
              )}
              <View style={styles.bannerTextBox}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                {banner.subtitle && (
                  <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Offers */}
        {offers.length > 0 && (
          <>
            <SectionHeader title="عروض وخصومات التوصيل" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {offers.map(offer => (
                <TouchableOpacity
                  key={offer.id}
                  style={styles.offerCard}
                  onPress={() => navigation.navigate('Restaurants')}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: offer.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80' }} style={styles.offerImage} />
                  <View style={styles.offerOverlay} />
                  <View style={[styles.offerBadge, { backgroundColor: offer.offer_type === 'free_delivery' ? '#1B9E6E' : DANGER }]}>
                    <Text style={styles.offerBadgeText}>
                      {offer.offer_type === 'free_delivery' ? 'مجاني' : offer.discount_percent ? `${offer.discount_percent}%` : 'عرض'}
                    </Text>
                  </View>
                  <View style={styles.offerTextBox}>
                    <Text style={styles.offerTitle}>{offer.title}</Text>
                    {offer.description && <Text style={styles.offerSubtitle}>{offer.description}</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Meal Offers */}
        {mealOffers.length > 0 && (
          <>
            <SectionHeader title="🔥 عروض الوجبات" onMore={() => navigation.navigate('Restaurants')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {mealOffers.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onPress={() => item.restaurant_id && navigateToRestaurant(item.restaurant_id, item.restaurants?.name_ar || '')}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Top Rated */}
        {topItems.length > 0 && (
          <>
            <SectionHeader title="الأكثر تقييماً 🔥" onMore={() => navigation.navigate('Restaurants')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {topItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onPress={() => item.restaurant_id && navigateToRestaurant(item.restaurant_id, item.restaurants?.name_ar || '')}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Delivery Request Banner */}
        <TouchableOpacity
          style={styles.deliveryBanner}
          onPress={() => navigation.navigate('DeliveryRequest')}
          activeOpacity={0.85}
        >
          <View style={styles.deliveryBannerContent}>
            <Truck size={28} color={LIGHT_GREEN} />
            <View style={{ marginRight: 12 }}>
              <Text style={styles.deliveryBannerTitle}>اطلب توصيل الآن</Text>
              <Text style={styles.deliveryBannerSub}>نوصل لك أي شيء، من أي مكان</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Featured Items */}
        {featuredItems.length > 0 && (
          <>
            <SectionHeader title="مختارات لك ✨" onMore={() => navigation.navigate('Restaurants')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {featuredItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onPress={() => item.restaurant_id && navigateToRestaurant(item.restaurant_id, item.restaurants?.name_ar || '')}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Featured Restaurants */}
        {restaurants.length > 0 && (
          <>
            <SectionHeader title="أفضل المطاعم" onMore={() => navigation.navigate('Restaurants')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {restaurants.map(r => (
                <RestaurantCard
                  key={r.id}
                  restaurant={r}
                  onPress={() => navigateToRestaurant(r.id, r.name_ar)}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Feature Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {FEATURES.map(feat => (
            <View key={feat.label} style={styles.pill}>
              <feat.icon size={14} color={feat.color} />
              <Text style={styles.pillText}>{feat.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Platform Stats */}
        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.restaurants}+</Text>
              <Text style={styles.statLabel}>مطعم</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.cities > 0 ? `${stats.cities}+` : '—'}</Text>
              <Text style={styles.statLabel}>مدينة</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} ⭐` : '—'}</Text>
              <Text style={styles.statLabel}>تقييم</Text>
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  greeting: { fontSize: 18, fontWeight: '900', color: TEXT_PRIMARY },
  subGreeting: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 },
  notifBtn: { padding: 8, position: 'relative' },
  notifBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: DANGER, borderRadius: 8,
    minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center',
  },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },

  tilesGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 8,
  },
  tile: {
    flex: 1,
    height: 90,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  tileImage: { ...StyleSheet.absoluteFillObject, opacity: 0.6 },
  tileOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  tileLabel: {
    color: '#fff', fontWeight: '900', fontSize: 13,
    marginBottom: 10, textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },

  bannerScroll: { paddingHorizontal: 12 },
  bannerCard: {
    width: width - 24,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 8,
  },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  bannerBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: LIGHT_GREEN, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  bannerBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  bannerTextBox: { position: 'absolute', bottom: 16, right: 16, left: 16 },
  bannerTitle: { color: '#fff', fontSize: 16, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  bannerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, marginTop: 16, marginBottom: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: TEXT_PRIMARY },
  moreText: { fontSize: 12, fontWeight: '700', color: LIGHT_GREEN },

  hScroll: { paddingHorizontal: 12, gap: 10 },

  offerCard: {
    width: 175, height: 108, borderRadius: 14, overflow: 'hidden',
    marginRight: 8, justifyContent: 'flex-end',
  },
  offerImage: { ...StyleSheet.absoluteFillObject },
  offerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  offerBadge: {
    position: 'absolute', top: 10, right: 10,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  offerBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  offerTextBox: { padding: 10 },
  offerTitle: { color: '#fff', fontSize: 12, fontWeight: '900' },
  offerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 2 },

  itemCard: {
    width: 160, borderRadius: 14, backgroundColor: CARD_BG,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09, shadowRadius: 6, elevation: 3,
    marginRight: 10, overflow: 'hidden',
  },
  itemImageContainer: { position: 'relative', width: '100%', height: 110 },
  itemImage: { width: '100%', height: '100%' },
  placeholderImage: { backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 32 },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: DANGER, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
  },
  discountText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  itemInfo: { padding: 10 },
  itemName: { fontSize: 12, fontWeight: '700', color: TEXT_PRIMARY, textAlign: 'right' },
  itemRestaurant: { fontSize: 10, color: TEXT_SECONDARY, marginTop: 2, textAlign: 'right' },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 10, color: TEXT_SECONDARY },
  priceColumn: { alignItems: 'flex-end' },
  oldPrice: { fontSize: 9, color: TEXT_SECONDARY, textDecorationLine: 'line-through' },
  newPrice: { fontSize: 12, fontWeight: '900', color: LIGHT_GREEN },
  priceText: { fontSize: 12, fontWeight: '900', color: PRIMARY },

  deliveryBanner: {
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: '#F0FFF4', borderRadius: 16,
    borderWidth: 1, borderColor: LIGHT_GREEN,
    padding: 16,
  },
  deliveryBannerContent: { flexDirection: 'row', alignItems: 'center' },
  deliveryBannerTitle: { fontSize: 14, fontWeight: '900', color: PRIMARY },
  deliveryBannerSub: { fontSize: 11, color: TEXT_SECONDARY, marginTop: 2 },

  restCard: {
    width: 140, borderRadius: 14, backgroundColor: CARD_BG,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09, shadowRadius: 6, elevation: 3,
    marginRight: 10, overflow: 'hidden',
  },
  restImage: { width: '100%', height: 95 },
  restInfo: { padding: 8 },
  restName: { fontSize: 11, fontWeight: '700', color: TEXT_PRIMARY, textAlign: 'right' },
  restRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  deliveryText: { fontSize: 9, color: TEXT_SECONDARY },

  pillsScroll: { paddingHorizontal: 12, marginTop: 12, gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 6, backgroundColor: CARD_BG,
    marginRight: 8,
  },
  pillText: { fontSize: 10, fontWeight: '600', color: TEXT_SECONDARY },

  statsRow: { flexDirection: 'row', paddingHorizontal: 12, marginTop: 16, gap: 8 },
  statCard: {
    flex: 1, alignItems: 'center', padding: 12, backgroundColor: CARD_BG,
    borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 5, elevation: 2,
  },
  statNum: { fontSize: 14, fontWeight: '900', color: PRIMARY },
  statLabel: { fontSize: 10, color: TEXT_SECONDARY, marginTop: 2 },
});
