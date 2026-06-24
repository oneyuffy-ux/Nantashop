import { pgTable, uuid, text, boolean, timestamp, integer, real, unique, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const bankConfigs = pgTable("bank_configs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bankName: text("bank_name").notNull(),
	accountNumber: text("account_number").notNull(),
	accountName: text("account_name").notNull(),
	bankCode: text("bank_code"),
	qrCodeUrl: text("qr_code_url"),
	rdcwClientId: text("rdcw_client_id"),
	rdcwClientSecret: text("rdcw_client_secret"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	imageUrl: text("image_url"),
	isFeatured: boolean("is_featured").default(false),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const news = pgTable("news", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	productId: uuid("product_id"),
	productName: text("product_name").notNull(),
	productImage: text("product_image"),
	pricePaid: real("price_paid").notNull(),
	deliveredData: text("delivered_data").default(').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const productStocks = pgTable("product_stocks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	categoryId: uuid("category_id"),
	name: text().notNull(),
	description: text(),
	imageUrl: text("image_url"),
	realPrice: real("real_price").default(0).notNull(),
	fakePrice: real("fake_price"),
	showFakePrice: boolean("show_fake_price").default(false),
	hotBadge: boolean("hot_badge").default(false),
	isFeatured: boolean("is_featured").default(false),
	productType: text("product_type").default('ได้ของทันที'),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const quickLinks = pgTable("quick_links", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	imageUrl: text("image_url"),
	targetPage: text("target_page").notNull(),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const redeemCodes = pgTable("redeem_codes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: text().notNull(),
	creditAmount: real("credit_amount").notNull(),
	usageLimit: integer("usage_limit").default(10).notNull(),
	usesCount: integer("uses_count").default(0).notNull(),
	expireDate: timestamp("expire_date", { mode: 'string' }),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("redeem_codes_code_unique").on(table.code),
]);

export const sliders = pgTable("sliders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text(),
	imageUrl: text("image_url").notNull(),
	linkUrl: text("link_url"),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const topupRequests = pgTable("topup_requests", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	username: text(),
	amount: real().default(0).notNull(),
	method: text().default('slip').notNull(),
	slipUrl: text("slip_url"),
	angpaoUrl: text("angpao_url"),
	status: text().default('pending').notNull(),
	note: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const topups = pgTable("topups", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	amount: real().notNull(),
	method: text().notNull(),
	status: text().default('success').notNull(),
	transRef: text("trans_ref"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	username: text().notNull(),
	email: text(),
	passwordHash: text("password_hash"),
	avatarUrl: text("avatar_url"),
	balance: real().default(0).notNull(),
	totalTopup: real("total_topup").default(0).notNull(),
	isAdmin: boolean("is_admin").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_username_unique").on(table.username),
	unique("users_email_unique").on(table.email),
]);

export const walletConfigs = pgTable("wallet_configs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	phoneNumber: text("phone_number").notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const websiteSettings = pgTable("website_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	siteName: text("site_name").default('NantaShop').notNull(),
	siteDescription: text("site_description"),
	announcement: text(),
	primaryColor: text("primary_color"),
	secondaryColor: text("secondary_color"),
	logoUrl: text("logo_url"),
	backgroundUrl: text("background_url"),
	particleType: text("particle_type").default('none'),
	enablePopup: boolean("enable_popup").default(false),
	popupTitle: text("popup_title"),
	popupContent: text("popup_content"),
	popupImageUrl: text("popup_image_url"),
	heroTitle: text("hero_title"),
	heroDescription: text("hero_description"),
	heroBackground: text("hero_background"),
	font: text(),
	fontColor: text("font_color"),
	borderColor: text("border_color"),
	enableLoadingScreen: boolean("enable_loading_screen").default(false),
	loadingGifUrl: text("loading_gif_url"),
	navbarEnableHome: boolean("navbar_enable_home").default(true),
	navbarEnableProducts: boolean("navbar_enable_products").default(true),
	navbarEnableTopup: boolean("navbar_enable_topup").default(true),
	socialLinks: jsonb("social_links"),
	embedDescription: text("embed_description"),
	particlePosition: text("particle_position").default('background'),
	fakeUsersOffset: integer("fake_users_offset").default(0).notNull(),
	fakeTopupOffset: integer("fake_topup_offset").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});
