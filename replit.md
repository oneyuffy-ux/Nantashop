# NantaShop

เว็บขายไอดีเกม / บัญชีเกม พร้อมระบบเติมเงิน จัดการสต็อก และ Admin Panel ครบครัน

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/game-shop run dev` — run the frontend (Vite)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — express-session secret

> ⚠️ **อย่าใช้ `pnpm --filter @workspace/db run push`** — ต้องการ TTY interactive ทำงานไม่ได้ใน shell อัตโนมัติ  
> ✅ **แก้ schema → รัน SQL ตรงๆ** ผ่าน `executeSql` (code_execution tool) หรือ psql แทน

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (artifacts/api-server, port 5000, path `/api`)
- Frontend: React + Vite + TailwindCSS v4 + Framer Motion + Wouter routing (artifacts/game-shop, path `/`)
- DB: PostgreSQL + Drizzle ORM (lib/db)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in lib/api-spec)
- Build: esbuild (CJS bundle)
- Auth: express-session + connect-pg-simple (session table ใน DB)

## Where things live

| ของ | ที่อยู่ |
|---|---|
| DB Schema (source of truth) | `lib/db/src/schema/index.ts` |
| API routes | `artifacts/api-server/src/routes/` |
| Frontend pages | `artifacts/game-shop/src/pages/` |
| Frontend components | `artifacts/game-shop/src/components/` |
| Global CSS / CSS utilities | `artifacts/game-shop/src/index.css` |
| OpenAPI spec | `lib/api-spec/` |
| Shared types | `lib/db/src/schema/index.ts` (export ใช้ทั้งสองฝั่ง) |

## Database Tables (13 tables)

| Table | ใช้ทำอะไร |
|---|---|
| `website_settings` | การตั้งค่าเว็บทั้งหมด (ชื่อ, สี, โลโก้, ออฟเซ็ตสถิติ ฯลฯ) |
| `users` | สมาชิก (username, balance, is_admin) |
| `products` | สินค้า/ไอดีเกม |
| `product_stocks` | สต็อกสินค้าดิบ (เนื้อหาที่ส่งให้ลูกค้า) |
| `orders` | ประวัติคำสั่งซื้อ |
| `categories` | หมวดหมู่สินค้า |
| `topups` | ประวัติการเติมเงินสำเร็จ |
| `topup_requests` | คำขอเติมเงินรอ approve (slip / อังเปา) |
| `redeem_codes` | โค้ดแลกเครดิต |
| `sliders` | รูป banner หน้าแรก |
| `quick_links` | ปุ่มลัดหน้าแรก |
| `news` | ข่าวสาร/อัพเดท |
| `bank_configs` | ข้อมูลบัญชีธนาคาร / PromptPay |

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → React Query hooks + Zod schemas ฝั่ง client ไม่ต้องเขียน fetch เอง
- **Session auth**: ใช้ express-session + connect-pg-simple เก็บ session ใน Postgres ไม่ใช้ JWT เพื่อ revoke ได้ง่าย
- **Fake stats offset**: `website_settings.fake_users_offset` และ `fake_topup_offset` บวกทับยอดจริงใน `/api/admin/stats` ก่อน return — ปรับได้จาก Admin Panel
- **CSS utilities**: `.shop-container`, `.page-bottom-pad`, `.product-grid`, `.stat-grid`, `.quicklink-grid` อยู่ใน `index.css` ใช้ทั่วทั้งแอป
- **Reverse proxy**: Vite dev server และ Express ถูก route ผ่าน shared proxy (`/api` → Express, `/` → Vite) — ไม่ต้องตั้ง CORS
- **Settings whitelist**: `PATCH /api/settings` กรอง field ผ่าน `ALLOWED_SETTINGS_FIELDS` — ป้องกันการแก้ไข `id` / `created_at` โดยไม่ตั้งใจ

## Product

- **หน้าหลัก**: สถิติร้าน (จำนวนผู้ใช้, ยอดเติมเงิน), banner slider, quick links, สินค้า featured, marquee การซื้อล่าสุด
- **ร้านค้า**: grid สินค้าแยกหมวดหมู่, ดูรายละเอียด, ซื้อด้วยเครดิต
- **เติมเงิน**: อัพโหลดสลิป (RDCW auto-verify) / อังเปา Truemoney / Wallet — รอ admin อนุมัติถ้าไม่มี RDCW
- **ประวัติ**: ประวัติการซื้อและเติมเงิน
- **Admin Panel**: จัดการสินค้า, อนุมัติเติมเงิน, จัดการสมาชิก, ตั้งค่าเว็บ, ดูสถิติ (Responsive Mobile)

## User preferences

- ภาษาไทยในข้อความ UI ทั้งหมด
- ออกแบบโทนสีมืด (dark theme) ม่วง/น้ำเงิน
- UI ต้อง responsive ทั้ง mobile / tablet / desktop
- ตัวเลขสถิติหน้าหลักปรับได้จาก Admin Panel (fake offset)

## Gotchas

- **`pnpm --filter @workspace/db run push` ใช้ไม่ได้ใน non-TTY shell** → ใช้ `executeSql` ใน code_execution tool แทนเสมอ
- **Schema เปลี่ยนแล้วต้อง restart api-server** — Drizzle อ่าน schema ตอน boot
- **Bottom tab bar (mobile)** สูง 60px → ทุก page ต้องมี `.page-bottom-pad` หรือ `pb-20` ที่ container หลัก
- **Recent purchases marquee**: items ถูก duplicate ใน DOM เพื่อ loop ไม่สะดุด — อย่า deduplicate โดย key
- Admin default: username `admin` / password `admin123` (ควรเปลี่ยนก่อน deploy จริง)
- **Admin Panel mobile**: sidebar เป็น overlay drawer บน mobile — เปิด/ปิดด้วยปุ่มซ้ายบน, กดนอก sidebar ปิดได้, เลือกเมนูแล้วปิดอัตโนมัติ
- **RDCW slip verify**: ส่ง image เป็น `Uint8Array` ไปยัง Blob (ไม่ใช่ Buffer โดยตรง) เพื่อหลีกเลี่ยง TypeScript SharedArrayBuffer error

## QA Status (ล่าสุด)

- ✅ TypeScript typecheck ผ่านสะอาด 0 errors
- ✅ RDCW slip verify ทำงานถูกต้อง (Buffer→Uint8Array, String→number fixed)
- ✅ Settings PATCH มี whitelist field แล้ว
- ✅ Auth seedDefaultAdmin มี error logging แล้ว
- ✅ Admin Panel responsive บน mobile

## เป้าหมายอนาคต (ให้เช่าบริการ)

- [ ] ระบบ multi-tenant (หลายร้านในระบบเดียว)
- [ ] หน้า Landing สำหรับเปิดรับสมัครลูกค้าเช่าเว็บ
- [ ] ระบบชำระเงินค่าเช่าประจำเดือน
- [ ] Dashboard สรุปรายได้ต่อร้าน

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- DB schema source of truth: `lib/db/src/schema/index.ts`
- API routes: `artifacts/api-server/src/routes/`
