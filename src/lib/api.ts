import { supabase } from '@/integrations/supabase/client';
import type { Restaurant, MenuItem, DeliveryBanner, DeliveryOffer, CustomerAddress, DeliveryOrder } from '@/types';
import { PROMO_SELECT, isPromoScheduleActive } from './utils';

// ===== Auth =====
export const signInWithPhone = async (phone: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: phone,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUp = async (phone: string, password: string, fullName: string) => {
  const email = `${phone.replace(/\+/g, '').replace(/\s/g, '')}@wasal.app`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone } },
  });
  if (error) throw error;
  return data;
};

// ===== Banners =====
export const fetchBanners = async (): Promise<DeliveryBanner[]> => {
  const { data, error } = await (supabase
    .from('delivery_banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order') as any);
  if (error) throw error;
  return data || [];
};

// ===== Offers =====
export const getCustomerActiveOffers = async (): Promise<DeliveryOffer[]> => {
  const { data, error } = await (supabase
    .from('delivery_offers')
    .select('*')
    .eq('is_active', true)
    .gte('starts_at', new Date().toISOString())
    .lte('ends_at', new Date().toISOString())
    .order('sort_order') as any);
  if (error) {
    // Fallback: get all active offers
    const { data: allData } = await (supabase
      .from('delivery_offers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order') as any);
    return allData || [];
  }
  return data || [];
};

// ===== Restaurants =====
export const getActiveRestaurants = async (city?: string): Promise<Restaurant[]> => {
  let query = supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  if (!data) return [];

  return (city && city !== 'all'
    ? data.filter((r: any) => !r.city || r.city === '' || r.city === city)
    : data) as Restaurant[];
};

export const getRestaurantById = async (id: string): Promise<Restaurant> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Restaurant;
};

export const getRestaurantMenu = async (restaurantId: string) => {
  const [catRes, itemRes] = await Promise.all([
    supabase.from('menu_categories').select('*').eq('restaurant_id', restaurantId).neq('is_active', false).order('sort_order'),
    supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId).neq('is_available', false).order('sort_order'),
  ]);
  if (catRes.error) throw catRes.error;
  if (itemRes.error) throw itemRes.error;
  return {
    categories: catRes.data || [],
    items: (itemRes.data || []) as MenuItem[],
  };
};

// ===== Menu Items (with promos) =====
export const fetchTopRatedItems = async (): Promise<MenuItem[]> => {
  const { data, error } = await (supabase
    .from('menu_items')
    .select(PROMO_SELECT)
    .eq('is_available', true)
    .order('rating', { ascending: false })
    .order('total_ratings', { ascending: false })
    .limit(10) as any);
  if (error) {
    const { data: d2 } = await (supabase
      .from('menu_items')
      .select(PROMO_SELECT)
      .eq('is_popular', true)
      .eq('is_available', true)
      .limit(10) as any);
    return d2 || [];
  }
  return data || [];
};

export const fetchFeaturedItems = async (): Promise<MenuItem[]> => {
  const { data } = await (supabase
    .from('menu_items')
    .select(PROMO_SELECT)
    .eq('is_featured', true)
    .eq('is_available', true)
    .limit(10) as any);
  return data || [];
};

export const fetchMealOffers = async (): Promise<MenuItem[]> => {
  const { data } = await (supabase
    .from('menu_items')
    .select(PROMO_SELECT)
    .eq('promo_active', true)
    .eq('is_available', true)
    .order('promo_value', { ascending: false })
    .limit(20) as any);

  const active = (data || []).filter((item: any) => isPromoScheduleActive(item));
  active.sort((a: any, b: any) => {
    const pctA = a.promo_type === 'discount_percent' ? (a.promo_value || 0) : 0;
    const pctB = b.promo_type === 'discount_percent' ? (b.promo_value || 0) : 0;
    return pctB - pctA;
  });
  return active.slice(0, 10);
};

// ===== Addresses =====
export const fetchAddresses = async (customerId: string): Promise<CustomerAddress[]> => {
  const { data, error } = await supabase
    .from('customer_addresses')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as CustomerAddress[];
};

export const createAddress = async (address: Omit<CustomerAddress, 'id'>) => {
  if (address.is_default) {
    await supabase
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('customer_id', address.customer_id);
  }
  const { data, error } = await supabase
    .from('customer_addresses')
    .insert(address as any)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAddress = async (id: string) => {
  const { error } = await supabase.from('customer_addresses').delete().eq('id', id);
  if (error) throw error;
};

// ===== Orders =====
export const createOrder = async (orderData: any) => {
  const { data, error } = await supabase
    .from('delivery_orders')
    .insert(orderData)
    .select('id')
    .single();
  if (error) throw error;
  return data;
};

export const fetchMyOrders = async (customerId: string): Promise<DeliveryOrder[]> => {
  const { data, error } = await supabase
    .from('delivery_orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []) as DeliveryOrder[];
};

export const getOrderById = async (orderId: string): Promise<DeliveryOrder | null> => {
  const { data, error } = await supabase
    .from('delivery_orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();
  if (error) throw error;
  return data as DeliveryOrder | null;
};

// ===== Stats =====
export const fetchPlatformStats = async () => {
  const { data } = await supabase
    .from('restaurants')
    .select('city, rating')
    .neq('is_active', false);
  if (!data || data.length === 0) return null;
  const uniqueCities = new Set(data.map((r: any) => r.city).filter(Boolean)).size;
  const ratings = data.map((r: any) => Number(r.rating || 0)).filter((v: number) => v > 0);
  const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
  return { restaurants: data.length, cities: uniqueCities, avgRating };
};

// ===== Profile =====
export const updateProfile = async (userId: string, data: { full_name?: string; phone?: string; city?: string }) => {
  const { error } = await supabase.from('profiles').update(data).eq('user_id', userId);
  if (error) throw error;
};
