// API Configuration
// Uses environment variable for flexibility between dev/production
// Set EXPO_PUBLIC_API_URL in .env file
const API_HOST = process.env.EXPO_PUBLIC_API_URL || 'https://supportlocal.shop';
export const API_BASE_URL = `${API_HOST}/api/v1`;

// Debug: log the API URL in development
if (__DEV__) {
  console.log('API Base URL:', API_BASE_URL);
}

export const API_TIMEOUT = 30000; // 30 seconds

export const ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    USER: '/auth/user',
    FORGOT_PASSWORD: '/auth/forgot-password',
    UPDATE_AVATAR: '/auth/user/avatar',
    UPDATE_PASSWORD: '/auth/user/password',
    UPDATE_DELIVERY_ADDRESS: '/auth/user/delivery-address',
  },

  // Products
  PRODUCTS: {
    LIST: '/products',
    FEATURED: '/products/featured',
    TOP_RATED: '/products/top-rated',
    TRENDING: '/products/trending',
    SEARCH: '/products/search',
    DETAIL: (id: number) => `/products/${id}`,
    RATINGS: (id: number) => `/products/${id}/ratings`,
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: number) => `/categories/${id}`,
    PRODUCTS: (id: number) => `/categories/${id}/products`,
  },

  // Sellers
  SELLERS: {
    LIST: '/sellers',
    DETAIL: (id: number) => `/sellers/${id}`,
    PRODUCTS: (id: number) => `/sellers/${id}/products`,
    RATINGS: (id: number) => `/sellers/${id}/ratings`,
  },

  // Cart
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear',
  },

  // Wishlist
  WISHLIST: {
    GET: '/wishlist',
    TOGGLE: '/wishlist/toggle',
    ADD: '/wishlist/add',
    REMOVE: '/wishlist/remove',
    CLEAR: '/wishlist/clear',
  },

  // Orders
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: (id: number) => `/orders/${id}`,
    CANCEL: (id: number) => `/orders/${id}/cancel`,
    PAYMENT_PROOF: (id: number) => `/orders/${id}/payment-proof`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
  },

  // Chat/Messaging
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    CREATE_CONVERSATION: '/chat/conversations',
    MESSAGES: (conversationId: number) => `/chat/conversations/${conversationId}/messages`,
    SEND_MESSAGE: (conversationId: number) => `/chat/conversations/${conversationId}/messages`,
    DELETE_CONVERSATION: (conversationId: number) => `/chat/conversations/${conversationId}`,
    UNREAD_COUNT: '/chat/unread-count',
  },

  // Custom Orders (Buyer - for bidding feature)
  CUSTOM_ORDERS: {
    CATEGORIES: '/custom-orders/categories',
    LIST: '/custom-orders',
    CREATE: '/custom-orders',
    DETAIL: (id: number) => `/custom-orders/${id}`,
    CANCEL: (id: number) => `/custom-orders/${id}/cancel`,
    ACCEPT_QUOTE: (id: number) => `/custom-orders/${id}/accept-quote`,
    DECLINE_QUOTE: (id: number) => `/custom-orders/${id}/decline-quote`,
    ACCEPT_BID: (orderId: number, bidId: number) => `/custom-orders/${orderId}/bids/${bidId}/accept`,
  },

  // Seller endpoints (for seller/artisan users)
  SELLER: {
    DASHBOARD: '/seller/dashboard',
    QUICK_STATS: '/seller/dashboard/quick-stats',
    CATEGORIES: '/seller/categories',
    PRODUCTS: {
      LIST: '/seller/products',
      CREATE: '/seller/products',
      DETAIL: (id: number) => `/seller/products/${id}`,
      UPDATE: (id: number) => `/seller/products/${id}`,
      DELETE: (id: number) => `/seller/products/${id}`,
      TOGGLE_STATUS: (id: number) => `/seller/products/${id}/toggle-status`,
      UPDATE_INVENTORY: (id: number) => `/seller/products/${id}/inventory`,
    },
    ORDERS: {
      STATS: '/seller/orders/stats',
      LIST: '/seller/orders',
      DETAIL: (id: number) => `/seller/orders/${id}`,
      CONFIRM: (id: number) => `/seller/orders/${id}/confirm`,
      REJECT: (id: number) => `/seller/orders/${id}/reject`,
      SHIP: (id: number) => `/seller/orders/${id}/ship`,
      COMPLETE: (id: number) => `/seller/orders/${id}/complete`,
      VERIFY_PAYMENT: (id: number) => `/seller/orders/${id}/verify-payment`,
      REJECT_PAYMENT: (id: number) => `/seller/orders/${id}/reject-payment`,
    },
    // Marketplace (Bidding)
    MARKETPLACE: {
      LIST: '/seller/marketplace',
      DETAIL: (id: number) => `/seller/marketplace/${id}`,
      SUBMIT_BID: (id: number) => `/seller/marketplace/${id}/bid`,
    },
    MY_BIDS: {
      LIST: '/seller/my-bids',
      UPDATE: (id: number) => `/seller/my-bids/${id}`,
      WITHDRAW: (id: number) => `/seller/my-bids/${id}/withdraw`,
    },
    CUSTOM_REQUESTS: {
      LIST: '/seller/custom-requests',
      SUBMIT_QUOTE: (id: number) => `/seller/custom-requests/${id}/quote`,
      START_WORK: (id: number) => `/seller/custom-requests/${id}/start-work`,
      SEND_FOR_CHECKOUT: (id: number) => `/seller/custom-requests/${id}/send-for-checkout`,
    },
  },
} as const;
