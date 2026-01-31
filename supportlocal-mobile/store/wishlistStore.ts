import { create } from 'zustand';
import { api, ApiError } from '../services/api';
import { ENDPOINTS } from '../constants/api';
import type { Product } from '../types';

interface WishlistState {
  items: Product[];
  productIds: Set<number>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => Promise<boolean>;
  clearError: () => void;
}

interface WishlistResponse {
  success: boolean;
  message?: string;
  products: Product[];
}

interface ToggleResponse {
  success: boolean;
  message?: string;
  in_wishlist: boolean;
  wishlist_count: number;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  productIds: new Set(),
  isLoading: false,
  error: null,

  fetchWishlist: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get<WishlistResponse>(ENDPOINTS.WISHLIST.GET);

      if (response.success) {
        const productIds = new Set(response.products.map((p) => p.id));
        set({
          items: response.products,
          productIds,
          isLoading: false,
        });
      } else {
        set({ isLoading: false, error: 'Failed to fetch wishlist' });
      }
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : 'Failed to fetch wishlist';

      set({ isLoading: false, error: message });
    }
  },

  toggleWishlist: async (productId: number) => {
    // Optimistic update
    const currentProductIds = get().productIds;
    const wasInWishlist = currentProductIds.has(productId);

    const newProductIds = new Set(currentProductIds);
    if (wasInWishlist) {
      newProductIds.delete(productId);
    } else {
      newProductIds.add(productId);
    }

    set({ productIds: newProductIds });

    try {
      const response = await api.post<ToggleResponse>(ENDPOINTS.WISHLIST.TOGGLE, {
        product_id: productId,
      });

      if (!response.success) {
        // Revert on failure
        set({ productIds: currentProductIds });
        return false;
      }

      return true;
    } catch (error) {
      // Revert on error
      set({ productIds: currentProductIds });

      const message = error instanceof ApiError
        ? error.getFirstError()
        : 'Failed to update wishlist';

      set({ error: message });
      return false;
    }
  },

  isInWishlist: (productId: number) => {
    return get().productIds.has(productId);
  },

  clearWishlist: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.delete<{ success: boolean }>(ENDPOINTS.WISHLIST.CLEAR);

      if (response.success) {
        set({
          items: [],
          productIds: new Set(),
          isLoading: false,
        });
        return true;
      }

      set({ isLoading: false, error: 'Failed to clear wishlist' });
      return false;
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : 'Failed to clear wishlist';

      set({ isLoading: false, error: message });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

// Helper hook to check if a product is in wishlist
export const useIsInWishlist = (productId: number) => {
  return useWishlistStore((state) => state.productIds.has(productId));
};
