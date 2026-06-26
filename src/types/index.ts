export interface Profile {
  user_id: string;
  full_name: string;
  phone: string | null;
  city: string | null;
  avatar_url?: string | null;
  account_status?: string | null;
}

export interface Restaurant {
  id: string;
  name_ar: string;
  name_en?: string | null;
  description?: string | null;
  image_url?: string | null;
  logo_url?: string | null;
  city: string;
  rating?: number;
  total_ratings?: number;
  delivery_fee?: number;
  delivery_time?: string;
  is_active: boolean;
  delivery_company_id?: string;
  cuisine_type?: string;
  coverage_areas?: string[];
  min_order_amount?: number;
  address?: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name_ar: string;
  name_en?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id?: string | null;
  name_ar: string;
  name_en?: string | null;
  description?: string | null;
  image_url?: string | null;
  price: number;
  discounted_price?: number | null;
  preparation_time?: number;
  is_available: boolean;
  is_featured?: boolean;
  is_popular?: boolean;
  rating?: number;
  total_ratings?: number;
  promo_type?: string | null;
  promo_value?: number | null;
  promo_text?: string | null;
  promo_active?: boolean;
  promo_starts_at?: string | null;
  promo_ends_at?: string | null;
  promo_active_days?: string | null;
  promo_start_time?: string | null;
  promo_end_time?: string | null;
  restaurants?: {
    name_ar: string;
    estimated_delivery_time?: string;
    delivery_company_id?: string;
  };
}

export interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  notes?: string;
  options?: any[];
}

export interface Cart {
  id?: string;
  customer_id: string;
  restaurant_id: string;
  items: CartItem[];
  total_amount: number;
}

export interface DeliveryOrder {
  id: string;
  customer_id: string;
  restaurant_id?: string;
  delivery_company_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  subtotal: number;
  delivery_fee: number;
  tax?: number;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  order_type?: string;
}

export interface DeliveryBanner {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  image_url: string;
  badge_text?: string | null;
  link_url?: string | null;
  link_tab?: string | null;
  banner_type?: string;
  tile_action?: string;
  is_active: boolean;
  sort_order?: number;
}

export interface DeliveryOffer {
  id: string;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  offer_type: string;
  discount_percent?: number | null;
  discount_value?: number | null;
  delivery_company_id: string;
  restaurant_id?: string | null;
  scope?: string;
  is_active: boolean;
  sort_order?: number;
  created_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  address_name: string;
  full_address: string;
  city?: string;
  district?: string;
  street?: string;
  building_number?: string;
  landmark?: string;
  phone?: string;
  is_default?: boolean;
  latitude?: number;
  longitude?: number;
}
