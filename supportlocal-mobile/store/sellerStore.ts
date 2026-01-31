import { create } from 'zustand';
import { apiClient } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import type {
  SellerDashboard,
  SellerQuickStats,
  SellerProduct,
  SellerOrder,
  SellerOrderDetail,
  Pagination,
} from '@/types';

interface SellerState {
  // Dashboard
  dashboard: SellerDashboard | null;
  quickStats: SellerQuickStats | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  // Products
  products: SellerProduct[];
  productsLoading: boolean;
  productsPagination: Pagination | null;

  // Orders
  orders: SellerOrder[];
  ordersLoading: boolean;
  ordersPagination: Pagination | null;
  orderStats: {
    pending: number;
    confirmed: number;
    shipped: number;
    completed: number;
    cancelled: number;
    needs_verification: number;
  } | null;

  // Actions
  fetchDashboard: (days?: number) => Promise<void>;
  fetchQuickStats: () => Promise<void>;
  fetchProducts: (params?: Record<string, unknown>) => Promise<void>;
  fetchOrders: (params?: Record<string, unknown>) => Promise<void>;
  fetchOrderStats: () => Promise<void>;
  getOrderDetail: (orderId: number) => Promise<SellerOrderDetail | null>;
  confirmOrder: (orderId: number) => Promise<boolean>;
  rejectOrder: (orderId: number, reason?: string) => Promise<boolean>;
  shipOrder: (orderId: number, trackingNumber?: string, carrier?: string) => Promise<boolean>;
  completeOrder: (orderId: number) => Promise<boolean>;
  verifyPayment: (orderId: number) => Promise<boolean>;
  rejectPayment: (orderId: number, reason: string) => Promise<boolean>;
  toggleProductStatus: (productId: number) => Promise<boolean>;
  updateProductInventory: (productId: number, quantity: number, lowStockThreshold?: number) => Promise<boolean>;
  clearSellerData: () => void;
}

export const useSellerStore = create<SellerState>((set, get) => ({
  // Initial state
  dashboard: null,
  quickStats: null,
  dashboardLoading: false,
  dashboardError: null,
  products: [],
  productsLoading: false,
  productsPagination: null,
  orders: [],
  ordersLoading: false,
  ordersPagination: null,
  orderStats: null,

  // Dashboard
  fetchDashboard: async (days = 30) => {
    set({ dashboardLoading: true, dashboardError: null });
    try {
      const response = await apiClient.get<{ success: boolean; data: SellerDashboard }>(
        `${ENDPOINTS.SELLER.DASHBOARD}?days=${days}`
      );
      if (response.success && response.data) {
        set({ dashboard: response.data, dashboardLoading: false });
      } else {
        set({ dashboardError: 'Failed to load dashboard', dashboardLoading: false });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard';
      set({ dashboardError: message, dashboardLoading: false });
    }
  },

  fetchQuickStats: async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: SellerQuickStats }>(
        ENDPOINTS.SELLER.QUICK_STATS
      );
      if (response.success && response.data) {
        set({ quickStats: response.data });
      }
    } catch {
      // Silently fail for quick stats
    }
  },

  // Products
  fetchProducts: async (params = {}) => {
    set({ productsLoading: true });
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();
      
      const url = queryString 
        ? `${ENDPOINTS.SELLER.PRODUCTS.LIST}?${queryString}` 
        : ENDPOINTS.SELLER.PRODUCTS.LIST;
      
      const response = await apiClient.get<{
        success: boolean;
        data: SellerProduct[];
        pagination: Pagination;
      }>(url);
      
      if (response.success) {
        set({
          products: response.data || [],
          productsPagination: response.pagination || null,
          productsLoading: false,
        });
      } else {
        set({ productsLoading: false });
      }
    } catch {
      set({ productsLoading: false });
    }
  },

  // Orders
  fetchOrders: async (params = {}) => {
    set({ ordersLoading: true });
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();
      
      const url = queryString 
        ? `${ENDPOINTS.SELLER.ORDERS.LIST}?${queryString}` 
        : ENDPOINTS.SELLER.ORDERS.LIST;
      
      const response = await apiClient.get<{
        success: boolean;
        data: SellerOrder[];
        pagination: Pagination;
      }>(url);
      
      if (response.success) {
        set({
          orders: response.data || [],
          ordersPagination: response.pagination || null,
          ordersLoading: false,
        });
      } else {
        set({ ordersLoading: false });
      }
    } catch {
      set({ ordersLoading: false });
    }
  },

  fetchOrderStats: async () => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          pending: number;
          confirmed: number;
          shipped: number;
          completed: number;
          cancelled: number;
          needs_verification: number;
        };
      }>(ENDPOINTS.SELLER.ORDERS.STATS);
      
      if (response.success && response.data) {
        set({ orderStats: response.data });
      }
    } catch {
      // Silently fail
    }
  },

  getOrderDetail: async (orderId: number) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: SellerOrderDetail }>(
        ENDPOINTS.SELLER.ORDERS.DETAIL(orderId)
      );
      return response.success ? response.data : null;
    } catch {
      return null;
    }
  },

  confirmOrder: async (orderId: number) => {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        ENDPOINTS.SELLER.ORDERS.CONFIRM(orderId)
      );
      if (response.success) {
        // Refresh orders and stats
        get().fetchOrders();
        get().fetchOrderStats();
      }
      return response.success;
    } catch {
      return false;
    }
  },

  rejectOrder: async (orderId: number, reason?: string) => {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        ENDPOINTS.SELLER.ORDERS.REJECT(orderId),
        { reason }
      );
      if (response.success) {
        get().fetchOrders();
        get().fetchOrderStats();
      }
      return response.success;
    } catch {
      return false;
    }
  },

  shipOrder: async (orderId: number, trackingNumber?: string, carrier?: string) => {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        ENDPOINTS.SELLER.ORDERS.SHIP(orderId),
        { tracking_number: trackingNumber, shipping_carrier: carrier }
      );
      if (response.success) {
        get().fetchOrders();
        get().fetchOrderStats();
      }
      return response.success;
    } catch {
      return false;
    }
  },

  completeOrder: async (orderId: number) => {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        ENDPOINTS.SELLER.ORDERS.COMPLETE(orderId)
      );
      if (response.success) {
        get().fetchOrders();
        get().fetchOrderStats();
      }
      return response.success;
    } catch {
      return false;
    }
  },

  verifyPayment: async (orderId: number) => {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        ENDPOINTS.SELLER.ORDERS.VERIFY_PAYMENT(orderId)
      );
      if (response.success) {
        get().fetchOrders();
        get().fetchOrderStats();
      }
      return response.success;
    } catch {
      return false;
    }
  },

  rejectPayment: async (orderId: number, reason: string) => {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        ENDPOINTS.SELLER.ORDERS.REJECT_PAYMENT(orderId),
        { reason }
      );
      if (response.success) {
        get().fetchOrders();
        get().fetchOrderStats();
      }
      return response.success;
    } catch {
      return false;
    }
  },

  toggleProductStatus: async (productId: number) => {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        ENDPOINTS.SELLER.PRODUCTS.TOGGLE_STATUS(productId)
      );
      if (response.success) {
        get().fetchProducts();
      }
      return response.success;
    } catch {
      return false;
    }
  },

  updateProductInventory: async (productId: number, quantity: number, lowStockThreshold?: number) => {
    try {
      const response = await apiClient.put<{ success: boolean }>(
        ENDPOINTS.SELLER.PRODUCTS.UPDATE_INVENTORY(productId),
        { quantity, low_stock_threshold: lowStockThreshold }
      );
      if (response.success) {
        get().fetchProducts();
      }
      return response.success;
    } catch {
      return false;
    }
  },

  clearSellerData: () => {
    set({
      dashboard: null,
      quickStats: null,
      dashboardLoading: false,
      dashboardError: null,
      products: [],
      productsLoading: false,
      productsPagination: null,
      orders: [],
      ordersLoading: false,
      ordersPagination: null,
      orderStats: null,
    });
  },
}));

// Selector hooks
export const useSellerDashboard = () => useSellerStore((state) => state.dashboard);
export const useSellerQuickStats = () => useSellerStore((state) => state.quickStats);
export const useSellerProducts = () => useSellerStore((state) => state.products);
export const useSellerOrders = () => useSellerStore((state) => state.orders);
export const useSellerOrderStats = () => useSellerStore((state) => state.orderStats);
