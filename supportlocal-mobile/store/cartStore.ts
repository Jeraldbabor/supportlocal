import { create } from 'zustand';
import { api, ApiError } from '../services/api';
import { ENDPOINTS } from '../constants/api';
import type { Cart, CartItem } from '../types';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<boolean>;
  updateQuantity: (productId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  clearError: () => void;
}

interface CartResponse {
  success: boolean;
  message?: string;
  cart: Cart;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get<CartResponse>(ENDPOINTS.CART.GET);

      if (response.success) {
        set({ cart: response.cart, isLoading: false });
      } else {
        set({ isLoading: false, error: 'Failed to fetch cart' });
      }
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : 'Failed to fetch cart';

      set({ isLoading: false, error: message });
    }
  },

  addToCart: async (productId: number, quantity: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post<CartResponse>(ENDPOINTS.CART.ADD, {
        product_id: productId,
        quantity,
      });

      if (response.success) {
        set({ cart: response.cart, isLoading: false });
        return true;
      }

      set({ isLoading: false, error: response.message || 'Failed to add to cart' });
      return false;
    } catch (error) {
      const message = error instanceof ApiError
        ? error.getFirstError()
        : 'Failed to add to cart';

      set({ isLoading: false, error: message });
      return false;
    }
  },

  updateQuantity: async (productId: number, quantity: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.put<CartResponse>(ENDPOINTS.CART.UPDATE, {
        product_id: productId,
        quantity,
      });

      if (response.success) {
        set({ cart: response.cart, isLoading: false });
        return true;
      }

      set({ isLoading: false, error: response.message || 'Failed to update cart' });
      return false;
    } catch (error) {
      const message = error instanceof ApiError
        ? error.getFirstError()
        : 'Failed to update cart';

      set({ isLoading: false, error: message });
      return false;
    }
  },

  removeFromCart: async (productId: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.delete<CartResponse>(ENDPOINTS.CART.REMOVE, {
        product_id: productId,
      });

      if (response.success) {
        set({ cart: response.cart, isLoading: false });
        return true;
      }

      set({ isLoading: false, error: response.message || 'Failed to remove item' });
      return false;
    } catch (error) {
      const message = error instanceof ApiError
        ? error.getFirstError()
        : 'Failed to remove item';

      set({ isLoading: false, error: message });
      return false;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.delete<CartResponse>(ENDPOINTS.CART.CLEAR);

      if (response.success) {
        set({ cart: response.cart, isLoading: false });
        return true;
      }

      set({ isLoading: false, error: 'Failed to clear cart' });
      return false;
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : 'Failed to clear cart';

      set({ isLoading: false, error: message });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

// Helper to get cart items count
export const useCartItemsCount = () => {
  const cart = useCartStore((state) => state.cart);
  return cart?.items_count ?? 0;
};
