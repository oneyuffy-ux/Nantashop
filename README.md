# NantaShop 🎮

เว็บขายไอดีเกม / บัญชีเกม พร้อมระบบเติมเงิน จัดการสต็อก และ Admin Panel ครบครัน

---

## ✨ Features

- 🛒 ระบบร้านค้าขายไอดีเกม / สินค้าดิจิทัล
- 💰 ระบบเติมเงินผ่านสลิปธนาคาร, อั่งเปา Truemoney, Wallet
- 📦 จัดการสต็อกสินค้าและส่งของอัตโนมัติ
- 👑 Admin Panel ครบครัน (สถิติ, อนุมัติเติมเงิน, จัดการสมาชิก)
- 🎨 ปรับแต่ง UI ได้จาก Admin (สี, โลโก้, banner, ประกาศ)
- 🎁 ระบบ Redeem Code และอังเปา
- 📱 Responsive รองรับมือถือ/แท็บเล็ต/เดสก์ท็อป

---

## 🛠️ Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | React 18, Vite, TailwindCSS v4, Framer Motion, Wouter |
| Backend | Node.js 24, Express 5, TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | express-session + connect-pg-simple |
| Package Manager | pnpm workspaces (monorepo) |

---

## 📋 Requirements

- **Node.js** v20 หรือสูงกว่า (แนะนำ v24)
- **pnpm** v9 หรือสูงกว่า (`npm install -g pnpm`)
- **PostgreSQL** v14 หรือสูงกว่า

---

## 🚀 การติดตั้งและ Run (Local)

### 1. Clone และติดตั้ง dependencies

```bash
git clone https://github.com/YOUR_USERNAME/nantashop.git
cd nantashop
pnpm install
```

### 2. ตั้งค่า Environment Variables

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/nantashop
SESSION_SECRET=your-random-secret-here
```

### 3. สร้างตาราง Database

```bash
pnpm --filter @workspace/db run push
```

> ⚠️ คำสั่งนี้ต้องรันใน terminal ปกติ (มี interactive prompt)

### 4. สร้าง Admin User

เปิด psql หรือ DB client แล้วรัน:

```sql
INSERT INTO users (id, username, password_hash, is_admin, balance, total_topup)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2b$10$YOUR_BCRYPT_HASH_HERE',
  true,
  0,
  0
);
```

> สร้าง bcrypt hash ได้ที่ https://bcrypt.online/ (rounds = 10)

### 5. Run Development Server

```bash
# Terminal 1 — API Server
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend
pnpm --filter @workspace/game-shop run dev
```

เปิดเว็บที่ `http://localhost:5173`

---

## ☁️ Deploy บน Railway (แนะนำ)

### ขั้นตอน

1. สร้างบัญชีที่ [railway.app](https://railway.app)
2. กด **New Project → Deploy from GitHub Repo**
3. เลือก repo นี้
4. เพิ่ม **PostgreSQL** service ใน project
5. ตั้ง Environment Variables:
   - `DATABASE_URL` — copy จาก Railway PostgreSQL service
   - `SESSION_SECRET` — สุ่มค่าใหม่
   - `NODE_ENV` — `production`
6. ตั้ง Build Command: `pnpm install && pnpm run build`
7. ตั้ง Start Command: `pnpm --filter @workspace/api-server run start`

---

## ☁️ Deploy บน Render

1. สร้างบัญชีที่ [render.com](https://render.com)
2. **New → Web Service** → เชื่อม GitHub repo
3. **New → PostgreSQL** → สร้าง DB แล้วคัดลอก connection string
4. ตั้ง Environment Variables เหมือน Railway
5. Build Command: `pnpm install && pnpm run build`
6. Start Command: `node artifacts/api-server/dist/index.js`

---

## 📁 โครงสร้างโปรเจกต์

```
nantashop/
├── artifacts/
│   ├── api-server/          # Express API Backend
│   │   └── src/routes/      # API routes ทั้งหมด
│   └── game-shop/           # React Frontend
│       └── src/pages/       # หน้าต่างๆ
├── lib/
│   ├── db/                  # Drizzle ORM + Schema
│   │   └── src/schema/      # DB Tables (source of truth)
│   └── api-spec/            # OpenAPI spec + codegen
├── .env.example             # ตัวอย่าง environment variables
├── pnpm-workspace.yaml      # pnpm workspace config
└── README.md
```

---

## 🗄️ Database Tables

| Table | หน้าที่ |
|---|---|
| `website_settings` | การตั้งค่าเว็บทั้งหมด |
| `users` | สมาชิก |
| `products` | สินค้า/ไอดีเกม |
| `product_stocks` | สต็อกสินค้า |
| `orders` | ประวัติการซื้อ |
| `categories` | หมวดหมู่สินค้า |
| `topups` | ประวัติเติมเงินสำเร็จ |
| `topup_requests` | คำขอเติมเงินรอ approve |
| `redeem_codes` | โค้ดแลกเครดิต |
| `sliders` | รูป banner |
| `quick_links` | ปุ่มลัดหน้าแรก |
| `news` | ข่าวสาร |
| `bank_configs` | ข้อมูลธนาคาร |

---

## 🔐 ความปลอดภัย (ก่อน Deploy จริง)

- [ ] เปลี่ยน password admin จากค่า default
- [ ] ใช้ `SESSION_SECRET` ที่สุ่มและยาวเพียงพอ (32+ ตัวอักษร)
- [ ] ตั้ง `NODE_ENV=production`
- [ ] ใช้ HTTPS เท่านั้นใน production
- [ ] จำกัด DB access เฉพาะ server เท่านั้น

---

## 📞 คำสั่งที่ใช้บ่อย

```bash
# ติดตั้ง dependencies
pnpm install

# Typecheck ทั้งโปรเจกต์
pnpm run typecheck

# Build ทั้งโปรเจกต์
pnpm run build

# Push DB schema (ต้องมี TTY)
pnpm --filter @workspace/db run push

# Regenerate API types จาก OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

---

## 📄 License

Private — All rights reserved
