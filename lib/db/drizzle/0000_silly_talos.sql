-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "bank_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"account_name" text NOT NULL,
	"bank_code" text,
	"qr_code_url" text,
	"rdcw_client_id" text,
	"rdcw_client_secret" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"is_featured" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"product_id" uuid,
	"product_name" text NOT NULL,
	"product_image" text,
	"price_paid" real NOT NULL,
	"delivered_data" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_stocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"real_price" real DEFAULT 0 NOT NULL,
	"fake_price" real,
	"show_fake_price" boolean DEFAULT false,
	"hot_badge" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"product_type" text DEFAULT 'ได้ของทันที',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quick_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"image_url" text,
	"target_page" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "redeem_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"credit_amount" real NOT NULL,
	"usage_limit" integer DEFAULT 10 NOT NULL,
	"uses_count" integer DEFAULT 0 NOT NULL,
	"expire_date" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "redeem_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sliders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text,
	"image_url" text NOT NULL,
	"link_url" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "topup_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"username" text,
	"amount" real DEFAULT 0 NOT NULL,
	"method" text DEFAULT 'slip' NOT NULL,
	"slip_url" text,
	"angpao_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "topups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" real NOT NULL,
	"method" text NOT NULL,
	"status" text DEFAULT 'success' NOT NULL,
	"trans_ref" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"password_hash" text,
	"avatar_url" text,
	"balance" real DEFAULT 0 NOT NULL,
	"total_topup" real DEFAULT 0 NOT NULL,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wallet_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_number" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "website_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_name" text DEFAULT 'NantaShop' NOT NULL,
	"site_description" text,
	"announcement" text,
	"primary_color" text,
	"secondary_color" text,
	"logo_url" text,
	"background_url" text,
	"particle_type" text DEFAULT 'none',
	"enable_popup" boolean DEFAULT false,
	"popup_title" text,
	"popup_content" text,
	"popup_image_url" text,
	"hero_title" text,
	"hero_description" text,
	"hero_background" text,
	"font" text,
	"font_color" text,
	"border_color" text,
	"enable_loading_screen" boolean DEFAULT false,
	"loading_gif_url" text,
	"navbar_enable_home" boolean DEFAULT true,
	"navbar_enable_products" boolean DEFAULT true,
	"navbar_enable_topup" boolean DEFAULT true,
	"social_links" jsonb,
	"embed_description" text,
	"particle_position" text DEFAULT 'background',
	"fake_users_offset" integer DEFAULT 0 NOT NULL,
	"fake_topup_offset" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);

*/