// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'administrator';
  role_display: string;
  phone_number: string | null;
  address: string | null;
  date_of_birth: string | null;
  avatar_url: string;
  delivery_address: string | null;
  delivery_phone: string | null;
  delivery_province: string | null;
  delivery_city: string | null;
  delivery_barangay: string | null;
  delivery_street: string | null;
  delivery_building_details: string | null;
  delivery_notes: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  gcash_number: string | null;
  gcash_name: string | null;
  email_verified: boolean;
  is_active: boolean;
  profile_completion: {
    is_complete: boolean;
    percentage: number;
    completed_fields: number;
    total_fields: number;
    missing_fields: { field: string; label: string }[];
  };
  created_at: string;
}

// Product types
export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  formatted_price: string;
  image: string | null;
  images?: string[];
  category: {
    id: number;
    name: string;
  } | null;
  seller: {
    id: number;
    name: string;
    avatar_url?: string;
    rating?: number;
    review_count?: number;
    is_online?: boolean;
  } | null;
  rating: number;
  review_count: number;
  stock_status?: string;
  in_stock: boolean;
  quantity?: number;
  description?: string;
  short_description?: string;
  sku?: string;
  condition?: string;
  weight?: number;
  weight_unit?: string;
  shipping_cost?: number;
  free_shipping?: boolean;
  tags?: string[];
  view_count?: number;
  order_count?: number;
  recent_ratings?: Rating[];
}

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image: string | null;
  products_count?: number;
}

// Seller types
export interface Seller {
  id: number;
  name: string;
  avatar_url: string;
  address?: string;
  phone_number?: string;
  rating: number;
  review_count: number;
  products_count: number;
  is_online: boolean;
  last_seen_at?: string;
  member_since?: string;
  recent_ratings?: Rating[];
}

// Rating types
export interface Rating {
  id: number;
  rating: number;
  review: string | null;
  user: {
    id: number;
    name: string;
    avatar_url: string;
  } | null;
  seller_reply?: string | null;
  seller_replied_at?: string | null;
  created_at: string;
}

// Cart types
export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  total: number;
  seller_name: string;
  max_quantity: number;
  in_stock: boolean;
  shipping_cost: number;
  free_shipping: boolean;
}

export interface Cart {
  id: number;
  items: CartItem[];
  items_count: number;
  subtotal: number;
  shipping_fee: number;
  total: number;
}

// Order types
export interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  image: string | null;
  seller_name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  status_label: string;
  status_color: string;
  payment_method: 'cod' | 'gcash';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_status_label: string;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  items_count: number;
  first_item?: {
    name: string;
    image: string | null;
  };
  seller?: {
    id: number;
    name: string;
  };
  can_cancel: boolean;
  can_upload_payment_proof: boolean;
  created_at: string;
  // Detail fields
  items?: OrderItem[];
  shipping_name?: string;
  shipping_phone?: string;
  shipping_address?: string;
  delivery_notes?: string;
  gcash_number?: string;
  gcash_reference?: string;
  payment_proof_url?: string;
  tracking_number?: string;
  shipping_provider?: string;
  rejection_reason?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  seller_confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  completed_at?: string;
  cancelled_at?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  [key: string]: T | boolean | string | undefined;
}

export interface PaginatedResponse<T> {
  success: boolean;
  [key: string]: T[] | Pagination | boolean | undefined;
  pagination: Pagination;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more?: boolean;
}

// Seller Dashboard types
export interface SellerProductStats {
  total: number;
  active: number;
  draft: number;
  out_of_stock: number;
  low_stock: number;
}

export interface SellerOrderStats {
  total: number;
  growth: number;
  pending: number;
  confirmed: number;
  shipped: number;
  completed: number;
  cancelled: number;
}

export interface SellerRevenueStats {
  gross: number;
  commission: number;
  net: number;
  growth: number;
}

export interface SellerCustomerStats {
  period: number;
  total: number;
  growth: number;
}

export interface SellerAccountHealth {
  score: number;
  max_score: number;
  percentage: number;
  items: {
    name: string;
    score: number;
    max: number;
    status: 'good' | 'warning' | 'poor';
  }[];
}

export interface SellerPendingAction {
  type: string;
  count: number;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SellerDashboard {
  product_stats: SellerProductStats;
  order_stats: SellerOrderStats;
  revenue_stats: SellerRevenueStats;
  customer_stats: SellerCustomerStats;
  recent_orders: SellerRecentOrder[];
  recent_products: SellerProduct[];
  account_health: SellerAccountHealth;
  pending_actions: SellerPendingAction[];
  period: {
    days: number;
    start_date: string;
    end_date: string;
  };
}

export interface SellerQuickStats {
  today_orders: number;
  today_revenue: number;
  month_revenue: number;
  pending_orders: number;
  low_stock_count: number;
}

export interface SellerRecentOrder {
  id: number;
  order_number: string;
  status: string;
  total: number;
  items_count: number;
  customer: {
    name: string;
    avatar: string | null;
  } | null;
  first_item: {
    name: string;
    image: string | null;
  } | null;
  created_at: string;
}

export interface SellerProduct {
  id: number;
  name: string;
  slug?: string;
  price: number;
  compare_price?: number | null;
  quantity: number;
  low_stock_threshold?: number;
  status: 'active' | 'draft';
  images: string[];
  sku?: string;
  description?: string;
  category_id?: number;
  category?: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at?: string;
}

export interface SellerOrder {
  id: number;
  order_number: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'cod' | 'gcash';
  has_payment_proof: boolean;
  seller_total: number;
  items_count: number;
  customer: {
    id: number;
    name: string;
    avatar: string | null;
  } | null;
  first_item: {
    name: string;
    image: string | null;
    quantity: number;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface SellerOrderDetail extends SellerOrder {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_notes: string | null;
  tracking_number: string | null;
  shipping_carrier: string | null;
  notes: string | null;
  payment_proof: string | null;
  items: {
    id: number;
    product_id: number;
    name: string;
    sku: string | null;
    image: string | null;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  confirmed_at: string | null;
  shipped_at: string | null;
  completed_at: string | null;
}
