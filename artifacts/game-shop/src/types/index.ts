export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  balance: number;
  total_topup?: number;
  is_admin: boolean;
  created_at?: string;
}

export interface ProductStock {
  id: string;
  product_id: string;
  content: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_featured?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id?: string;
  name: string;
  description?: string;
  image_url?: string;
  real_price: number;
  fake_price?: number;
  show_fake_price?: boolean;
  hot_badge?: boolean;
  is_featured?: boolean;
  product_type?: string;
  sort_order?: number;
  stock?: number;
  delivered_data?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  user_id?: string;
  product_id?: string;
  product_name: string;
  product_image?: string;
  price_paid: number;
  delivered_data: string;
  created_at: string;
}

export interface TopupRequest {
  id: string;
  user_id: string;
  username?: string;
  amount: number;
  method: 'slip' | 'angpao';
  slip_url?: string;
  angpao_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  created_at: string;
}

export interface RedeemCode {
  id: string;
  code: string;
  credit_amount: number;
  usage_limit: number;
  uses_count: number;
  expire_date?: string;
  is_active: boolean;
  created_at?: string;
}

export interface RedeemHistory {
  id: string;
  user_id: string;
  code_id: string;
  code: string;
  amount: number;
  created_at: string;
}

export interface TopupLog {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  tx_type: 'topup' | 'purchase';
  reference_id?: string;
  created_at: string;
}

export interface Slider {
  id: string;
  title?: string;
  image_url: string;
  link_url?: string;
  sort_order: number;
}

export interface QuickLink {
  id: string;
  title: string;
  icon_name: string;
  target_page: string;
  image_url?: string;
  sort_order: number;
}

export interface BankConfig {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  bank_code?: string | null;
  qr_code_url?: string | null;
  rdcw_client_id?: string | null;
  rdcw_client_secret?: string | null;
  is_active: boolean;
}

export interface WalletConfig {
  id: string;
  phone_number: string;
  is_active: boolean;
}

export interface GiftCode {
  id: string;
  code: string;
  amount: number;
  max_uses: number;
  uses_count: number;
  is_active: boolean;
}

export interface ActivityLog {
  id: string;
  type: 'purchase' | 'topup';
  username: string;
  description: string;
  amount: number;
  created_at: string;
}

export interface CMSConfig {
  id: string;
  site_name: string;
  site_description?: string;
  announcement?: string;
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  background_url?: string;
  particle_type?: 'snow' | 'ember' | 'none';
  enable_popup?: boolean;
  popup_title?: string;
  popup_content?: string;
  popup_image_url?: string;
  hero_title?: string;
  hero_description?: string;
  hero_background?: string;
  font?: string;
  font_color?: string;
  border_color?: string;
  enable_loading_screen?: boolean;
  loading_gif_url?: string;
  particle_position?: string;
  navbar_enable_home?: boolean;
  navbar_enable_products?: boolean;
  navbar_enable_topup?: boolean;
  social_links?: Record<string, string>;
  embed_description?: string;
}
