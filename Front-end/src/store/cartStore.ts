import { create } from 'zustand';
import { getCartAPI } from '../api/cart.api';
import type { Product } from '../types/product';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  cartCount: number;
  addToCart: (product: Product) => void;
  remove: (id: string) => void;
  incrementCount: (quantity?: number) => void;
  refreshCartCount: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  cartCount: 0,
  incrementCount: (quantity = 1) => {
    set((state) => ({ cartCount: state.cartCount + quantity }));
  },
  refreshCartCount: async () => {
    try {
      const data = await getCartAPI();
      const total = (data?.items || []).reduce(
        (sum: number, item: { quantity: number }) => sum + item.quantity,
        0,
      );
      set({ cartCount: total });
    } catch {
      set({ cartCount: 0 });
    }
  },

  addToCart: (product) => {
    const items = get().items;
    const existing = items.find((i) => i.product._id === product._id);
    if (existing) {
      existing.quantity++;
      set({ items: [...items] });
    } else {
      set({ items: [...items, { product, quantity: 1 }] });
    }
  },

  remove: (id) => {
    set((state) => ({
      items: state.items.filter((i) => i.product._id !== id),
    }));
  },
}));
