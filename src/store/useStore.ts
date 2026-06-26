import { create } from 'zustand';
import type { CartItem, CustomerAddress } from '@/types';

interface AppState {
  // Cart
  cartItems: CartItem[];
  cartRestaurantId: string | null;
  addToCart: (item: CartItem, restaurantId: string) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;

  // Selected Address
  selectedAddress: CustomerAddress | null;
  setSelectedAddress: (address: CustomerAddress | null) => void;

  // Notifications
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Cart
  cartItems: [],
  cartRestaurantId: null,

  addToCart: (item, restaurantId) => {
    const state = get();
    if (state.cartRestaurantId && state.cartRestaurantId !== restaurantId) {
      // Clear cart if different restaurant
      set({ cartItems: [item], cartRestaurantId: restaurantId });
      return;
    }
    const existing = state.cartItems.find(i => i.menu_item_id === item.menu_item_id);
    if (existing) {
      set({
        cartItems: state.cartItems.map(i =>
          i.menu_item_id === item.menu_item_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
        cartRestaurantId: restaurantId,
      });
    } else {
      set({
        cartItems: [...state.cartItems, item],
        cartRestaurantId: restaurantId,
      });
    }
  },

  removeFromCart: (menuItemId) => {
    const state = get();
    const newItems = state.cartItems.filter(i => i.menu_item_id !== menuItemId);
    set({
      cartItems: newItems,
      cartRestaurantId: newItems.length === 0 ? null : state.cartRestaurantId,
    });
  },

  updateQuantity: (menuItemId, quantity) => {
    const state = get();
    if (quantity <= 0) {
      get().removeFromCart(menuItemId);
      return;
    }
    set({
      cartItems: state.cartItems.map(i =>
        i.menu_item_id === menuItemId ? { ...i, quantity } : i
      ),
    });
  },

  clearCart: () => set({ cartItems: [], cartRestaurantId: null }),

  getCartTotal: () => {
    return get().cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  getCartCount: () => {
    return get().cartItems.reduce((sum, i) => sum + i.quantity, 0);
  },

  // Address
  selectedAddress: null,
  setSelectedAddress: (address) => set({ selectedAddress: address }),

  // Notifications
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
