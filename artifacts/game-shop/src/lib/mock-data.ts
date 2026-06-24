import { UserProfile, Category, Product, Order, CMSConfig, TopupLog, Slider, QuickLink, BankConfig, WalletConfig, GiftCode, ActivityLog, TopupRequest, RedeemCode } from '../types';

export const mockUser: UserProfile = {
  id: 'mock-user-1',
  username: 'EliteGamer99',
  balance: 1500,
  is_admin: true,
  avatar_url: '',
  created_at: new Date(Date.now() - 8640000000).toISOString()
};

export const mockUsers: UserProfile[] = [
  mockUser,
  { id: 'u2', username: 'ProGamer_X', balance: 320, is_admin: false, created_at: new Date(Date.now() - 2000000000).toISOString() },
  { id: 'u3', username: 'GamingKing', balance: 850, is_admin: false, created_at: new Date(Date.now() - 3000000000).toISOString() },
  { id: 'u4', username: 'StarPlayer', balance: 0, is_admin: false, created_at: new Date(Date.now() - 1000000000).toISOString() },
];

export const mockCategories: Category[] = [
  { id: 'c1', name: 'Blox Fruits', description: 'ไก่ตัน • ผลปีศาจ • เกมพาส', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80', is_featured: true, sort_order: 0 },
  { id: 'c2', name: 'Roblox Accounts', description: 'บัญชี Roblox คุณภาพสูง', image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80', is_featured: true, sort_order: 1 },
  { id: 'c3', name: 'Free Fire', description: 'ไดมอนด์ • สกิน • บัญชีพร้อม', image_url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80', is_featured: true, sort_order: 2 },
];

export const mockProducts: Product[] = [
  {
    id: 'p1', category_id: 'c1',
    name: 'ไก่ตัน 7 หมัด มังกร V4ขั้น10',
    description: '7หมัดมังกร V4 ขั้น10 🥊 โปรดอ่านก่อนซื้อ 🥊 เมื่อได้รับ ID + sห้ามแคปหน้าจอ • การันตีเผ่าดิน • การันตีหมัดแวมไพร์ • สุ่มตาบเทพ',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80',
    real_price: 150, fake_price: 250, show_fake_price: true,
    hot_badge: true, is_featured: true, sort_order: 0, stock: 2,
    delivered_data: 'Username: bloxaccount_1\nPassword: Pass@12345\nEmail: blox_1@example.com',
  },
  {
    id: 'p2', category_id: 'c1',
    name: 'ไก่ตัน7หมัดเผ่ามังกร V4T10',
    description: '7หมัดมังกร V4 ขั้น10 🥊 โปรดอ่านก่อนซื้อ 🥊 เมื่อได้รับ ID + sห้ามแคปหน้าจอ',
    image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80',
    real_price: 110, fake_price: 200, show_fake_price: true,
    hot_badge: false, is_featured: true, sort_order: 1, stock: 0,
    delivered_data: 'Username: blox_master\nPassword: pass1234',
  },
  {
    id: 'p3', category_id: 'c1',
    name: 'สุ่มไก่ตัน V4T10 | 6 หมัด',
    description: 'สุ่มไก่ตัน V4T10 พร้อมการการันตีสกิลหมัด 6 ท่า ราคาพิเศษ!',
    image_url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&q=80',
    real_price: 89, fake_price: 150, show_fake_price: true,
    hot_badge: true, is_featured: true, sort_order: 2, stock: 5,
    delivered_data: 'Username: bloxrandom_99\nPassword: randompass99',
  },
  {
    id: 'p4', category_id: 'c2',
    name: 'Roblox Premium Account',
    description: 'บัญชี Roblox Premium พร้อม Robux และ Avatar สุดเท่',
    image_url: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=400&q=80',
    real_price: 45, fake_price: 80, show_fake_price: true,
    hot_badge: false, is_featured: false, sort_order: 3, stock: 12,
    delivered_data: 'Username: roblox_premium\nPassword: roblox@2024',
  },
  {
    id: 'p5', category_id: 'c3',
    name: 'Free Fire Diamond 1000',
    description: 'เพชร Free Fire 1000 เม็ด ส่งทันที ปลอดภัย 100%',
    image_url: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&q=80',
    real_price: 59, fake_price: 100, show_fake_price: true,
    hot_badge: true, is_featured: false, sort_order: 4, stock: 30,
    delivered_data: 'Diamond Code: FF-DEMO-12345\nExpire: 30 days',
  },
  {
    id: 'p6', category_id: 'c2',
    name: 'Roblox Starter Bundle',
    description: 'แพ็กเกจ Roblox สำหรับผู้เริ่มต้น พร้อม Robux 400 + Item พิเศษ',
    image_url: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&q=80',
    real_price: 25, fake_price: 40, show_fake_price: true,
    hot_badge: false, is_featured: false, sort_order: 5, stock: 8,
    delivered_data: 'Username: starter_bundle\nPassword: bundle@2024',
  },
];

export const mockOrders: Order[] = [
  { id: 'o1', user_id: 'mock-user-1', product_id: 'p1', product_name: 'ไก่ตัน 7 หมัด มังกร V4ขั้น10', product_image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80', price_paid: 150, delivered_data: 'Username: bloxaccount_1\nPassword: Pass@12345\nEmail: blox_1@example.com', created_at: new Date(Date.now() - 10000000).toISOString() },
  { id: 'o2', user_id: 'mock-user-1', product_id: 'p3', product_name: 'สุ่มไก่ตัน V4T10 | 6 หมัด', product_image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&q=80', price_paid: 89, delivered_data: 'Username: bloxrandom_99\nPassword: randompass99', created_at: new Date(Date.now() - 50000000).toISOString() }
];

export const mockAllOrders: Order[] = [
  ...mockOrders,
  { id: 'o3', user_id: 'u2', product_id: 'p1', product_name: 'ไก่ตัน 7 หมัด มังกร V4ขั้น10', price_paid: 150, delivered_data: 'admin_acc:securepass', created_at: new Date(Date.now() - 200000000).toISOString() },
  { id: 'o4', user_id: 'u3', product_id: 'p2', product_name: 'ไก่ตัน7หมัดเผ่ามังกร V4T10', price_paid: 110, delivered_data: 'blox_master:pass1234', created_at: new Date(Date.now() - 500000000).toISOString() },
];

export const mockTopups: TopupLog[] = [
  { id: 't1', user_id: 'mock-user-1', amount: 500, method: 'TrueMoney/Angpao', status: 'success', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 't2', user_id: 'mock-user-1', amount: 1000, method: 'Slip', status: 'success', created_at: new Date(Date.now() - 200000000).toISOString() },
];

export const mockAllTopups: TopupLog[] = [
  ...mockTopups,
  { id: 't4', user_id: 'u2', amount: 300, method: 'Slip', status: 'success', created_at: new Date(Date.now() - 100000000).toISOString() },
  { id: 't5', user_id: 'u3', amount: 1500, method: 'TrueMoney/Angpao', status: 'success', created_at: new Date(Date.now() - 400000000).toISOString() },
];

export const mockTopupRequests: TopupRequest[] = [
  { id: 'tr1', user_id: 'u2', username: 'ProGamer_X', amount: 300, method: 'slip', slip_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80', status: 'pending', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'tr2', user_id: 'u3', username: 'GamingKing', amount: 500, method: 'angpao', angpao_url: 'https://gift.truemoney.com/campaign/?v=DEMO12345', status: 'pending', created_at: new Date(Date.now() - 7200000).toISOString() },
];

export const mockRedeemCodes: RedeemCode[] = [
  { id: 'rc1', code: 'WELCOME100', credit_amount: 100, usage_limit: 50, uses_count: 12, expire_date: new Date(Date.now() + 30 * 86400000).toISOString(), is_active: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'rc2', code: 'VIP500', credit_amount: 500, usage_limit: 5, uses_count: 1, expire_date: new Date(Date.now() + 7 * 86400000).toISOString(), is_active: true, created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 'rc3', code: 'NEWUSER50', credit_amount: 50, usage_limit: 100, uses_count: 45, is_active: true, created_at: new Date(Date.now() - 259200000).toISOString() },
];

export const mockSliders: Slider[] = [
  { id: 's1', title: 'ยินดีต้อนรับสู่ร้าน Nantashop', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80', link_url: '/products', sort_order: 0 },
  { id: 's2', title: 'บริการจำหน่ายไอดีเกม ราคาถูกที่สุดในไทย', image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80', link_url: '/products', sort_order: 1 },
  { id: 's3', title: 'สินค้าแนะนำ — Blox Fruits', image_url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200&q=80', link_url: '/products', sort_order: 2 },
];

export const mockQuickLinks: QuickLink[] = [
  { id: 'ql1', title: 'ติดต่อ', icon_name: 'MessageCircle', target_page: '/contact', image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80', sort_order: 0 },
  { id: 'ql2', title: 'เติมเงิน', icon_name: 'Wallet', target_page: '/topup', image_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&q=80', sort_order: 1 },
  { id: 'ql3', title: 'ประวัติการซื้อ', icon_name: 'History', target_page: '/profile', image_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80', sort_order: 2 },
  { id: 'ql4', title: 'สินค้าทั้งหมด', icon_name: 'ShoppingBag', target_page: '/products', image_url: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&q=80', sort_order: 3 },
];

export const mockBankConfigs: BankConfig[] = [
  { id: 'b1', bank_name: 'ธนาคารไทยพาณิชย์ (SCB)', account_number: '123-456-7890', account_name: 'NantaShop Admin', is_active: true },
  { id: 'b2', bank_name: 'ธนาคารกสิกรไทย (KBank)', account_number: '098-765-4321', account_name: 'NantaShop Admin', is_active: true },
];

export const mockWalletConfigs: WalletConfig[] = [
  { id: 'w1', phone_number: '0812345678', is_active: true },
];

export const mockGiftCodes: GiftCode[] = [
  { id: 'g1', code: 'WELCOME100', amount: 100, max_uses: 50, uses_count: 12, is_active: true },
  { id: 'g2', code: 'VIP500', amount: 500, max_uses: 5, uses_count: 1, is_active: true },
];

export const mockActivityLogs: ActivityLog[] = [
  { id: 'a1', type: 'purchase', username: 'Admin', description: 'ไก่ตัน 7 หมัด มังกร V4ขั้น10', amount: 150, created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 'a2', type: 'purchase', username: 'Admin', description: 'สุ่มไก่ตัน V4T10 | 6 หมัด', amount: 89, created_at: new Date(Date.now() - 4 * 24 * 3600000 - 300000).toISOString() },
  { id: 'a3', type: 'purchase', username: 'ProGamer_X', description: 'ไก่ตัน7หมัดเผ่ามังกร V4T10', amount: 110, created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString() },
  { id: 'a4', type: 'topup', username: 'GamingKing', description: 'เติมเงินผ่าน TrueMoney', amount: 500, created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
];

export const mockStats = {
  total_users: 19,
  total_visits: 332,
  ready_stock: 830,
  total_sales: 268438,
};

export const mockDailyStats = [
  { day: 'จ', sales: 4200, topups: 8000 },
  { day: 'อ', sales: 6800, topups: 12000 },
  { day: 'พ', sales: 5200, topups: 9500 },
  { day: 'พฤ', sales: 9100, topups: 16000 },
  { day: 'ศ', sales: 11400, topups: 20000 },
  { day: 'ส', sales: 15200, topups: 25000 },
  { day: 'อา', sales: 13800, topups: 22000 },
];

export const mockCMSConfig: CMSConfig = {
  id: '00000000-0000-0000-0000-000000000000',
  site_name: 'NantaShop',
  site_description: 'บริการจำหน่ายไอดีเกม ราคาถูกที่สุดในไทย',
  hero_title: 'บริการจำหน่ายไอดีเกม',
  hero_description: 'ราคาถูกที่สุดในไทย',
  announcement: 'ยินดีต้อนรับสู่ร้าน Nantashop — บริการจำหน่ายไอดีเกม ราคาถูกที่สุดในไทย!',
  primary_color: '205 100% 50%',
  secondary_color: '228 22% 13%',
  particle_type: 'none',
  enable_popup: true,
  popup_title: 'ไก่ตัน 7 หมัด มังกร V4T10',
  popup_content: 'สินค้าแนะนำวันนี้!',
  navbar_enable_home: true,
  navbar_enable_products: true,
  navbar_enable_topup: true,
  enable_loading_screen: false,
  social_links: { discord: 'https://discord.gg', line: 'https://line.me', facebook: '' }
};
