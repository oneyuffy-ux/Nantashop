import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Globe, Home, Sparkles, Bell, Layers, Image, Zap,
  Wallet, Building2, Gift, ShoppingBag, DollarSign, Tag, Package,
  Users, ChevronLeft, ChevronRight, ChevronDown, Plus, Trash2, Edit2, Save, X,
  Eye, TrendingUp, BarChart2, Copy, Check, Navigation, Clock,
  CheckCircle2, CheckCircle, Ban, AlertCircle, Link2, Search, Database,
  KeyRound, Shield, UserCog,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  Product, Category, Slider, BankConfig, WalletConfig,
  Order, TopupLog, UserProfile, TopupRequest, RedeemCode, ProductStock,
} from "@/types";
import { mockDailyStats } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type Tab =
  | "dashboard"
  | "website" | "navbar" | "homepage" | "theme" | "news" | "popup"
  | "quicklinks" | "sliders" | "particle" | "login-page"
  | "wallet-config" | "bank-config" | "gift-codes" | "topup-approval" | "redeem-codes"
  | "all-orders" | "all-topups"
  | "categories" | "products" | "users";

interface NavGroup {
  type: "group"; id: string; label: string; icon: React.ElementType;
  items: { id: Tab; label: string }[];
}
interface NavSingle { type: "single"; id: Tab; label: string; icon: React.ElementType }
type NavEntry = NavSingle | NavGroup;

const NAV: NavEntry[] = [
  { type: "single", id: "dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  {
    type: "group", id: "website", label: "จัดการเว็บไซต์", icon: Globe,
    items: [
      { id: "website", label: "จัดการเว็บไซต์" },
      { id: "navbar",  label: "จัดการ Navbar" },
      { id: "homepage", label: "จัดการหน้าหลัก" },
      { id: "theme",   label: "จัดการ Theme" },
      { id: "news",    label: "ข่าวสาร" },
      { id: "popup",   label: "ป๊อปอัพ" },
      { id: "quicklinks", label: "ปุ่มลัด" },
      { id: "sliders", label: "สไลด์ภาพ" },
      { id: "particle", label: "Particle" },
      { id: "login-page", label: "จัดการหน้า Login" },
    ],
  },
  {
    type: "group", id: "topup", label: "จัดการเติมเงิน", icon: Wallet,
    items: [
      { id: "topup-approval", label: "อนุมัติเติมเงิน" },
      { id: "wallet-config",  label: "จัดการวอเล็ท" },
      { id: "bank-config",    label: "จัดการธนาคาร" },
      { id: "redeem-codes",   label: "โค้ดเติมเงิน" },
    ],
  },
  {
    type: "group", id: "history", label: "ประวัติทั้งหมด", icon: BarChart2,
    items: [
      { id: "all-orders", label: "ประวัติการซื้อ" },
      { id: "all-topups", label: "ประวัติเติมเงิน" },
    ],
  },
  {
    type: "group", id: "store", label: "จัดการร้านค้า", icon: Package,
    items: [
      { id: "categories", label: "จัดการหมวดหมู่" },
      { id: "products",   label: "จัดการสินค้า" },
      { id: "users",      label: "จัดการผู้ใช้งาน" },
    ],
  },
];

const emptyProduct: Omit<Product, "id"> = {
  name: "", category_id: "", description: "", image_url: "",
  real_price: 0, fake_price: 0, show_fake_price: false,
  hot_badge: false, is_featured: false, product_type: "ได้ของทันที", sort_order: 0,
};
const emptyCategory: Omit<Category, "id"> = {
  name: "", description: "", image_url: "", is_featured: false, sort_order: 0,
};

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b); let h=0,s=0;
  const l=(max+min)/2;
  if(max!==min){const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);
    if(max===r)h=((g-b)/d+(g<b?6:0))/6;else if(max===g)h=((b-r)/d+2)/6;else h=((r-g)/d+4)/6;}
  return `${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%`;
}

function hslToHex(hsl: string): string {
  if (!hsl) return "#000000";
  const m = hsl.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%?\s+(\d+\.?\d*)%?/);
  if (!m) return "#000000";
  let h = parseFloat(m[1])/360, s = parseFloat(m[2])/100, l = parseFloat(m[3])/100;
  let r: number, g: number, b: number;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l*(1+s) : l+s-l*s, p = 2*l-q;
    const hue2rgb = (p: number, q: number, t: number) => {
      if(t<0)t+=1; if(t>1)t-=1;
      if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q;
      if(t<2/3)return p+(q-p)*(2/3-t)*6; return p;
    };
    r=hue2rgb(p,q,h+1/3); g=hue2rgb(p,q,h); b=hue2rgb(p,q,h-1/3);
  }
  const toHex=(x:number)=>Math.round(x*255).toString(16).padStart(2,"0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/* ─────────────────────────────────────────────
   PRIMITIVE UI
───────────────────────────────────────────── */
function PCard({ children, className="" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-[#252836] bg-[#1c1e2e] ${className}`}>{children}</div>;
}
function STitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
      <span className="w-1 h-4 rounded-full bg-blue-500 inline-block flex-shrink-0" />
      {children}
    </h2>
  );
}
function FRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-[11px] font-semibold text-[#7c7f96] uppercase tracking-wider">{label}</label>{children}</div>;
}
function SInput(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={`w-full px-3 py-2.5 rounded-xl bg-[#111320] border border-[#252836] text-white text-sm placeholder-[#464960] focus:outline-none focus:border-blue-500/60 transition-colors ${p.className||""}`} />;
}
function STextarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={`w-full px-3 py-2.5 rounded-xl bg-[#111320] border border-[#252836] text-white text-sm placeholder-[#464960] focus:outline-none focus:border-blue-500/60 transition-colors resize-none ${p.className||""}`} />;
}
function SSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-xl bg-[#111320] border border-[#252836] text-white text-sm focus:outline-none focus:border-blue-500/60">
      {children}
    </select>
  );
}
function SToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#111320] border border-[#252836]">
      <span className="text-sm text-[#c0c3d6]">{label}</span>
      <button onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-blue-500" : "bg-[#252836]"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
function SaveBtn({ onClick, loading=false, label="บันทึก" }: { onClick: () => void; loading?: boolean; label?: string }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-60">
      {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
      {label}
    </button>
  );
}
function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
      <Plus className="w-4 h-4" />{label}
    </button>
  );
}

function ConfirmSaveDialog({ open, onConfirm, onCancel, title="ยืนยันการบันทึกข้อมูล ?", body="คุณต้องการบันทึกการเปลี่ยนแปลงนี้ใช่ไหม?" }: {
  open: boolean; onConfirm: () => void; onCancel: () => void; title?: string; body?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onCancel}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ border: "3px solid #f97316", background: "rgba(249,115,22,0.08)" }}>
            <AlertCircle className="w-10 h-10 text-orange-500" />
          </div>
        </div>
        <h3 className="text-center text-2xl font-extrabold text-gray-800 mb-2" style={{ fontFamily: "Sarabun, sans-serif" }}>{title}</h3>
        {body && <p className="text-center text-base text-gray-500 mb-6" style={{ fontFamily: "Sarabun, sans-serif" }}>{body}</p>}
        <div className="flex gap-3 mt-2">
          <button onClick={onConfirm}
            className="flex-1 h-12 font-bold text-base rounded-2xl text-white transition-colors hover:opacity-90"
            style={{ background: "#38bdf8", fontFamily: "Sarabun, sans-serif" }}>ยืนยัน</button>
          <button onClick={onCancel}
            className="flex-1 h-12 font-bold text-base rounded-2xl text-white transition-colors hover:opacity-90"
            style={{ background: "#ef4444", fontFamily: "Sarabun, sans-serif" }}>ยกเลิก</button>
        </div>
      </motion.div>
    </div>
  );
}

function SaveLoadingDialog({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 280 }}
        className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center max-w-xs w-full">
        <svg className="w-20 h-20 animate-spin mb-5" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="#e0f2fe" strokeWidth="6" />
          <circle cx="40" cy="40" r="32" fill="none" stroke="#0ea5e9" strokeWidth="6"
            strokeDasharray="200" strokeDashoffset="150" strokeLinecap="round" />
        </svg>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-1" style={{ fontFamily: "Sarabun, sans-serif" }}>สำเร็จ</h2>
        <p className="text-gray-600 text-base font-semibold mb-5" style={{ fontFamily: "Sarabun, sans-serif" }}>บันทึกข้อมูลสำเร็จ !</p>
        <button disabled className="w-full py-3 rounded-2xl text-white font-bold text-base opacity-50"
          style={{ background: "linear-gradient(135deg,#38bdf8,#0284c7)", fontFamily: "Sarabun, sans-serif" }}>ตกลง</button>
      </motion.div>
    </div>
  );
}

function SaveSuccessDialog({ open, onClose, message="บันทึกข้อมูลสำเร็จ !" }: { open: boolean; onClose: () => void; message?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 280 }}
        className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center max-w-xs w-full">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", damping: 14 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-5 flex-shrink-0"
          style={{ border: "4px solid #0ea5e9" }}>
          <motion.svg viewBox="0 0 40 40" width="40" height="40">
            <motion.path d="M8 20 L16 28 L32 12" fill="none" stroke="#0ea5e9" strokeWidth="3.5"
              strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ delay: 0.25, duration: 0.45 }} />
          </motion.svg>
        </motion.div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-1" style={{ fontFamily: "Sarabun, sans-serif" }}>สำเร็จ</h2>
        <p className="text-gray-600 text-base text-center font-semibold mb-5" style={{ fontFamily: "Sarabun, sans-serif" }}>{message}</p>
        <button onClick={onClose} className="w-full py-3 rounded-2xl text-white font-bold text-base"
          style={{ background: "linear-gradient(135deg,#38bdf8,#0284c7)", fontFamily: "Sarabun, sans-serif" }}>ตกลง</button>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────── */
interface AdminStats {
  total_users: number; total_orders: number; total_revenue: number;
  total_topups: number; total_topup_amount: number; total_products: number;
  today_orders: number; today_revenue: number; today_topup: number;
  daily_chart: { day: string; sales: number; topups: number }[];
}
function Dashboard({ orders, topups }: { orders: Order[]; topups: TopupLog[] }) {
  const [period, setPeriod] = useState<"daily"|"weekly"|"monthly"|"yearly">("daily");
  const [realStats, setRealStats] = useState<AdminStats>({
    total_users: 0, total_orders: 0, total_revenue: 0,
    total_topups: 0, total_topup_amount: 0, total_products: 0,
    today_orders: 0, today_revenue: 0, today_topup: 0,
    daily_chart: mockDailyStats,
  });

  useEffect(() => {
    api.get("/admin/stats").then(d => { if (d) setRealStats(d as AdminStats); }).catch(() => {});
  }, []);

  const cards = [
    { label:"รายได้ทั้งหมด",   value:`฿${realStats.total_revenue.toLocaleString()}`, icon:TrendingUp, from:"from-blue-600/20",   ic:"text-blue-400",   bd:"border-blue-500/20" },
    { label:"ออเดอร์วันนี้",   value:realStats.today_orders.toString(),              icon:ShoppingBag, from:"from-purple-600/20", ic:"text-purple-400", bd:"border-purple-500/20" },
    { label:"เติมเงินทั้งหมด", value:`฿${realStats.total_topup_amount.toLocaleString()}`, icon:Wallet, from:"from-green-600/20",  ic:"text-green-400",  bd:"border-green-500/20" },
    { label:"เติมเงินวันนี้",  value:`฿${realStats.today_topup.toLocaleString()}`,   icon:DollarSign,  from:"from-yellow-600/20", ic:"text-yellow-400", bd:"border-yellow-500/20" },
    { label:"สมาชิกทั้งหมด",   value:realStats.total_users.toString(),               icon:Users,       from:"from-cyan-600/20",   ic:"text-cyan-400",   bd:"border-cyan-500/20" },
    { label:"สินค้าทั้งหมด",   value:realStats.total_products.toString(),            icon:Package,     from:"from-orange-600/20", ic:"text-orange-400", bd:"border-orange-500/20" },
  ];

  const chartData = {
    daily:   realStats.daily_chart.length ? realStats.daily_chart : mockDailyStats,
    weekly:  [{ day:"สป.1",sales:28400,topups:52000},{ day:"สป.2",sales:35200,topups:68000},{ day:"สป.3",sales:42100,topups:79000},{ day:"สป.4",sales:38700,topups:71000}],
    monthly: [{ day:"ม.ค.",sales:120000,topups:210000},{ day:"ก.พ.",sales:98000,topups:180000},{ day:"มี.ค.",sales:145000,topups:260000},{ day:"เม.ย.",sales:162000,topups:290000},{ day:"พ.ค.",sales:134000,topups:240000},{ day:"มิ.ย.",sales:178000,topups:310000}],
    yearly:  [{ day:"2022",sales:980000,topups:1800000},{ day:"2023",sales:1450000,topups:2600000},{ day:"2024",sales:1820000,topups:3200000},{ day:"2025",sales:2100000,topups:3800000}],
  };

  return (
    <div className="space-y-5">
      <STitle>แดชบอร์ด</STitle>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((c,i) => (
          <motion.div key={c.label} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
            <PCard className={`p-5 bg-gradient-to-br ${c.from} to-transparent border ${c.bd}`}>
              <div className="flex items-start justify-between">
                <div><p className="text-xs text-[#7c7f96] mb-1">{c.label}</p><p className="text-2xl font-bold text-white">{c.value}</p></div>
                <c.icon className={`w-5 h-5 ${c.ic} mt-0.5`} />
              </div>
            </PCard>
          </motion.div>
        ))}
      </div>

      <PCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">กราฟยอดขาย & เติมเงิน</h3>
          <div className="flex gap-1">
            {(["daily","weekly","monthly","yearly"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period===p ? "bg-blue-600 text-white" : "bg-[#111320] text-[#7c7f96] hover:text-white"}`}>
                {p==="daily"?"รายวัน":p==="weekly"?"รายสัปดาห์":p==="monthly"?"รายเดือน":"รายปี"}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData[period]}>
            <defs>
              <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
              <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#252836" />
            <XAxis dataKey="day" tick={{fill:"#7c7f96",fontSize:11}} axisLine={false} tickLine={false} />
            <YAxis tick={{fill:"#7c7f96",fontSize:11}} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{background:"#1c1e2e",border:"1px solid #252836",borderRadius:"12px",color:"#fff",fontSize:"12px"}} />
            <Area type="monotone" dataKey="sales"  stroke="#3b82f6" fill="url(#gS)" strokeWidth={2} name="ยอดขาย" />
            <Area type="monotone" dataKey="topups" stroke="#10b981" fill="url(#gT)" strokeWidth={2} name="เติมเงิน" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center">
          <span className="flex items-center gap-1.5 text-xs text-[#7c7f96]"><span className="w-3 h-1 rounded bg-blue-500 inline-block"/>ยอดขาย</span>
          <span className="flex items-center gap-1.5 text-xs text-[#7c7f96]"><span className="w-3 h-1 rounded bg-green-500 inline-block"/>เติมเงิน</span>
        </div>
      </PCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-blue-400"/>ออเดอร์ล่าสุด</h3>
          <div className="space-y-2">
            {orders.slice(0,5).map(o => (
              <div key={o.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#111320] border border-[#252836]">
                <div className="min-w-0 flex-1"><p className="text-xs font-medium text-white truncate">{o.product_name}</p><p className="text-[10px] text-[#7c7f96]">{new Date(o.created_at).toLocaleDateString("th-TH")}</p></div>
                <span className="text-xs font-bold text-green-400 ml-3">฿{o.price_paid.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </PCard>
        <PCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Wallet className="w-4 h-4 text-green-400"/>เติมเงินล่าสุด</h3>
          <div className="space-y-2">
            {topups.slice(0,5).map(t => (
              <div key={t.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#111320] border border-[#252836]">
                <div className="min-w-0 flex-1"><p className="text-xs font-medium text-white truncate">{t.method}</p><p className="text-[10px] text-[#7c7f96]">{new Date(t.created_at).toLocaleDateString("th-TH")}</p></div>
                <div className="flex items-center gap-2 ml-3">
                  <span className="text-xs font-bold text-green-400">+฿{t.amount.toLocaleString()}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${t.status==="success"?"bg-green-500/20 text-green-400":"bg-yellow-500/20 text-yellow-400"}`}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </PCard>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TOPUP APPROVAL
───────────────────────────────────────────── */
function TopupApproval({ isMockMode, topupRequests, setTopupRequests, users, setUsers, toast }: any) {
  const [approveDialog, setApproveDialog] = useState<{open:boolean; req:TopupRequest|null; amount:string}>({ open:false, req:null, amount:"" });
  const [rejectDialog, setRejectDialog] = useState<{open:boolean; req:TopupRequest|null}>({ open:false, req:null });
  const [processing, setProcessing] = useState(false);

  const pending = (topupRequests as TopupRequest[]).filter(r => r.status === "pending");
  const slipPending = pending.filter(r => r.method === "slip");
  const angpaoPending = pending.filter(r => r.method === "angpao");
  const approved = (topupRequests as TopupRequest[]).filter(r => r.status === "approved");
  const rejected = (topupRequests as TopupRequest[]).filter(r => r.status === "rejected");

  async function handleApprove() {
    const { req } = approveDialog;
    if (!req) return;
    const amount = parseFloat(approveDialog.amount);
    if (!amount || amount <= 0) { toast({ title: "กรุณาระบุจำนวนเงิน", variant: "destructive" }); return; }
    setProcessing(true);
    try {
      await api.post(`/topup-requests/${req.id}/approve`, { amount });
      setTopupRequests((prev: TopupRequest[]) => prev.map(r => r.id === req.id ? { ...r, status: "approved", amount } : r));
      setUsers((prev: UserProfile[]) => prev.map(u => u.id === req.user_id ? { ...u, balance: u.balance + amount } : u));
      toast({ title: `อนุมัติสำเร็จ! เพิ่มเงิน ฿${amount.toLocaleString()} ให้ผู้ใช้` });
      setApproveDialog({ open: false, req: null, amount: "" });
    } catch { toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" }); }
    setProcessing(false);
  }

  async function handleReject() {
    const { req } = rejectDialog;
    if (!req) return;
    setProcessing(true);
    try {
      await api.post(`/topup-requests/${req.id}/reject`, {});
      setTopupRequests((prev: TopupRequest[]) => prev.map(r => r.id === req.id ? { ...r, status: "rejected" } : r));
      toast({ title: "ปฏิเสธรายการแล้ว" });
      setRejectDialog({ open: false, req: null });
    } catch { toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" }); }
    setProcessing(false);
  }

  function RequestRow({ req }: { req: TopupRequest }) {
    const timeAgo = Math.round((Date.now() - new Date(req.created_at).getTime()) / 60000);
    return (
      <div className="p-4 rounded-xl bg-[#111320] border border-[#252836] space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{req.username || req.user_id.slice(0,8)}</p>
            <p className="text-xs text-[#7c7f96]">{timeAgo < 60 ? `${timeAgo} นาทีที่แล้ว` : `${Math.round(timeAgo/60)} ชั่วโมงที่แล้ว`}</p>
            {req.amount > 0 && <p className="text-sm font-bold text-green-400 mt-1">฿{req.amount.toLocaleString()}</p>}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setApproveDialog({ open: true, req, amount: req.amount > 0 ? String(req.amount) : "" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold transition-colors"
            ><CheckCircle2 className="w-3.5 h-3.5"/>อนุมัติ</button>
            <button
              onClick={() => setRejectDialog({ open: true, req })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold transition-colors"
            ><Ban className="w-3.5 h-3.5"/>ปฏิเสธ</button>
          </div>
        </div>
        {req.slip_url && (
          <div>
            <p className="text-[10px] text-[#7c7f96] mb-1.5">สลิปการโอนเงิน</p>
            <img src={req.slip_url} alt="slip" className="max-h-48 rounded-xl border border-[#252836] object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        )}
        {req.angpao_url && (
          <div>
            <p className="text-[10px] text-[#7c7f96] mb-1">URL อั่งเปา</p>
            <a href={req.angpao_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 break-all underline">{req.angpao_url}</a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <STitle>อนุมัติเติมเงิน</STitle>

      <div className="grid grid-cols-3 gap-3">
        <PCard className="p-4 border-yellow-500/20 bg-yellow-500/5">
          <p className="text-xs text-[#7c7f96] mb-1">รอตรวจสอบ</p>
          <p className="text-2xl font-bold text-yellow-400">{pending.length}</p>
        </PCard>
        <PCard className="p-4 border-green-500/20 bg-green-500/5">
          <p className="text-xs text-[#7c7f96] mb-1">อนุมัติแล้ว</p>
          <p className="text-2xl font-bold text-green-400">{approved.length}</p>
        </PCard>
        <PCard className="p-4 border-red-500/20 bg-red-500/5">
          <p className="text-xs text-[#7c7f96] mb-1">ปฏิเสธ</p>
          <p className="text-2xl font-bold text-red-400">{rejected.length}</p>
        </PCard>
      </div>

      <PCard className="p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-400"/>รอสลิปตรวจสอบ
          {slipPending.length > 0 && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">{slipPending.length} รายการ</span>}
        </h3>
        {slipPending.length === 0 ? (
          <p className="text-sm text-[#7c7f96] text-center py-4">ไม่มีรายการรอตรวจสอบ</p>
        ) : (
          <div className="space-y-3">{slipPending.map(r => <RequestRow key={r.id} req={r} />)}</div>
        )}
      </PCard>

      <PCard className="p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Gift className="w-4 h-4 text-red-400"/>รออั่งเปาตรวจสอบ
          {angpaoPending.length > 0 && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">{angpaoPending.length} รายการ</span>}
        </h3>
        {angpaoPending.length === 0 ? (
          <p className="text-sm text-[#7c7f96] text-center py-4">ไม่มีรายการรอตรวจสอบ</p>
        ) : (
          <div className="space-y-3">{angpaoPending.map(r => <RequestRow key={r.id} req={r} />)}</div>
        )}
      </PCard>

      <AnimatePresence>
        {approveDialog.open && approveDialog.req && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => !processing && setApproveDialog({ open: false, req: null, amount: "" })}>
            <motion.div initial={{scale:0.92}} animate={{scale:1}} exit={{scale:0.92}}
              className="bg-[#1c1e2e] border border-[#252836] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-white mb-1">ยืนยันการอนุมัติ</h3>
              <p className="text-xs text-[#7c7f96] mb-4">ผู้ใช้: {approveDialog.req.username || approveDialog.req.user_id.slice(0,8)}</p>
              <div className="space-y-1.5 mb-5">
                <label className="text-[11px] font-semibold text-[#7c7f96] uppercase tracking-wider">จำนวนเงินที่อนุมัติ (฿)</label>
                <SInput type="number" value={approveDialog.amount} onChange={e => setApproveDialog(p => ({ ...p, amount: e.target.value }))} placeholder="ระบุจำนวนเงิน" autoFocus />
              </div>
              <div className="flex gap-3">
                <button onClick={handleApprove} disabled={processing} className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-colors disabled:opacity-60">
                  {processing ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "อนุมัติ"}
                </button>
                <button onClick={() => setApproveDialog({ open: false, req: null, amount: "" })} disabled={processing} className="flex-1 py-2.5 rounded-xl bg-[#252836] text-[#7c7f96] hover:text-white font-semibold text-sm transition-colors">ยกเลิก</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rejectDialog.open && rejectDialog.req && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => !processing && setRejectDialog({ open: false, req: null })}>
            <motion.div initial={{scale:0.92}} animate={{scale:1}} exit={{scale:0.92}}
              className="bg-[#1c1e2e] border border-[#252836] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-white mb-2">ยืนยันการปฏิเสธ</h3>
              <p className="text-sm text-[#7c7f96] mb-6">ปฏิเสธรายการเติมเงินของ {rejectDialog.req.username || rejectDialog.req.user_id.slice(0,8)} ใช่ไหม?</p>
              <div className="flex gap-3">
                <button onClick={handleReject} disabled={processing} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors disabled:opacity-60">
                  {processing ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "ปฏิเสธ"}
                </button>
                <button onClick={() => setRejectDialog({ open: false, req: null })} disabled={processing} className="flex-1 py-2.5 rounded-xl bg-[#252836] text-[#7c7f96] hover:text-white font-semibold text-sm transition-colors">ยกเลิก</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   WEBSITE SETTINGS
───────────────────────────────────────────── */
function WebsiteSettings({ isMockMode, cmsConfig, setCmsConfig, toast }: any) {
  const [f, setF] = useState({
    site_name: cmsConfig.site_name||"",
    announcement: cmsConfig.announcement||"",
    site_description: cmsConfig.site_description||"",
    embed_description: cmsConfig.embed_description||"",
    logo_url: cmsConfig.logo_url||"",
    facebook_url: cmsConfig.social_links?.facebook||"",
    discord_url: cmsConfig.social_links?.discord||"",
    enable_slip: false,
    enable_angpao: true,
    enable_redeem: true,
    fake_users_offset: Number((cmsConfig as any).fake_users_offset ?? 0),
    fake_topup_offset: Number((cmsConfig as any).fake_topup_offset ?? 0),
  });
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  async function actualSave() {
    setSaving(true);
    try {
      const updated = await api.patch("/settings", {
        site_name: f.site_name,
        announcement: f.announcement,
        site_description: f.site_description,
        embed_description: f.embed_description,
        logo_url: f.logo_url,
        social_links: { ...(cmsConfig.social_links||{}), facebook: f.facebook_url, discord: f.discord_url },
        fake_users_offset: Number(f.fake_users_offset) || 0,
        fake_topup_offset: Number(f.fake_topup_offset) || 0,
      });
      setCmsConfig({ ...cmsConfig, ...updated });
      setLoadingOpen(false); setSuccessOpen(true);
    } catch { setLoadingOpen(false); toast({ title:"บันทึกล้มเหลว", variant:"destructive" }); }
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <STitle>จัดการเว็บไซต์</STitle>
      <PCard className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FRow label="ชื่อเว็บไซต์"><SInput value={f.site_name} onChange={e=>setF(x=>({...x,site_name:e.target.value}))} placeholder="NantaShop"/></FRow>
          <FRow label="Logo URL"><SInput value={f.logo_url} onChange={e=>setF(x=>({...x,logo_url:e.target.value}))} placeholder="https://..."/></FRow>
        </div>
        <FRow label="ประกาศ / Announcement"><SInput value={f.announcement} onChange={e=>setF(x=>({...x,announcement:e.target.value}))} placeholder="ข้อความประกาศ..."/></FRow>
        <FRow label="รายละเอียดร้าน"><STextarea rows={3} value={f.site_description} onChange={e=>setF(x=>({...x,site_description:e.target.value}))} placeholder="รายละเอียดร้านค้า..."/></FRow>
        <FRow label="Embed Description"><STextarea rows={2} value={f.embed_description} onChange={e=>setF(x=>({...x,embed_description:e.target.value}))} placeholder="คำอธิบายสำหรับ embed..."/></FRow>
      </PCard>

      {/* ── Fake Stats ── */}
      <PCard className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-semibold text-[#7c7f96] uppercase tracking-wider">ตัวเลขสถิติหน้าหลัก</p>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold">Display Offset</span>
        </div>
        <p className="text-[11px] text-[#7c7f96] -mt-2">ตัวเลขที่ตั้งจะถูก <span className="text-amber-400 font-semibold">บวกเพิ่ม</span> จากยอดจริงใน DB แล้วแสดงในหน้าหลัก</p>
        <div className="grid grid-cols-2 gap-4">
          <FRow label="เพิ่มจำนวนผู้ใช้งาน (+)">
            <div className="relative">
              <SInput
                type="number"
                min="0"
                value={f.fake_users_offset}
                onChange={e => setF(x => ({ ...x, fake_users_offset: Number(e.target.value) }))}
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-amber-400 font-bold pointer-events-none">คน</span>
            </div>
          </FRow>
          <FRow label="เพิ่มยอดเติมเงินรวม (+)">
            <div className="relative">
              <SInput
                type="number"
                min="0"
                value={f.fake_topup_offset}
                onChange={e => setF(x => ({ ...x, fake_topup_offset: Number(e.target.value) }))}
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-amber-400 font-bold pointer-events-none">฿</span>
            </div>
          </FRow>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1c2e] border border-[#252836]">
          <span className="text-lg">👁️</span>
          <div className="text-[11px] text-[#7c7f96]">
            ผู้ใช้งานที่แสดง: <span className="text-white font-bold">{(f.fake_users_offset).toLocaleString()} คน (offset)</span>
            <span className="mx-2">·</span>
            ยอดเติมเงินที่แสดง: <span className="text-white font-bold">฿{(f.fake_topup_offset).toLocaleString()} (offset)</span>
          </div>
        </div>
      </PCard>

      <PCard className="p-5 space-y-4">
        <p className="text-xs font-semibold text-[#7c7f96] uppercase tracking-wider mb-1">ช่องทางการติดต่อ</p>
        <FRow label="Facebook URL">
          <SInput value={f.facebook_url} onChange={e=>setF(x=>({...x,facebook_url:e.target.value}))} placeholder="https://facebook.com/yourpage"/>
        </FRow>
        <FRow label="Discord URL">
          <SInput value={f.discord_url} onChange={e=>setF(x=>({...x,discord_url:e.target.value}))} placeholder="https://discord.gg/yourserver"/>
        </FRow>
      </PCard>
      <PCard className="p-5 space-y-3">
        <p className="text-xs font-semibold text-[#7c7f96] uppercase tracking-wider mb-1">การตั้งค่าระบบ</p>
        <SToggle checked={f.enable_slip} onChange={v=>setF(x=>({...x,enable_slip:v}))} label="เปิด/ปิด ระบบตรวจสลิป" />
        <SToggle checked={f.enable_angpao} onChange={v=>setF(x=>({...x,enable_angpao:v}))} label="เปิด/ปิด ระบบอังเปา (Angpao)" />
        <SToggle checked={f.enable_redeem} onChange={v=>setF(x=>({...x,enable_redeem:v}))} label="เปิด/ปิด ระบบ Redeem Code" />
      </PCard>
      <div className="flex justify-end"><SaveBtn onClick={() => setConfirmOpen(true)} loading={saving}/></div>
      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); setLoadingOpen(true); actualSave(); }} onCancel={() => setConfirmOpen(false)} />
      <SaveLoadingDialog open={loadingOpen} />
      <SaveSuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOGIN PAGE CMS
───────────────────────────────────────────── */
function LoginPageSettings({ cmsConfig, setCmsConfig, toast }: any) {
  const [f, setF] = useState({
    logo_url: cmsConfig.logo_url || "",
    site_name: cmsConfig.site_name || "",
    site_description: cmsConfig.site_description || "",
    announcement: cmsConfig.announcement || "",
    background_url: cmsConfig.background_url || "",
    primary_color: cmsConfig.primary_color || "#7c3aed",
  });
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  async function actualSave() {
    setSaving(true);
    try {
      const updated = await api.patch("/settings", f);
      setCmsConfig({ ...cmsConfig, ...updated });
      setLoadingOpen(false); setSuccessOpen(true);
    } catch { setLoadingOpen(false); toast({ title: "บันทึกล้มเหลว", variant: "destructive" }); }
    setSaving(false);
  }
  const themeColor = f.primary_color || "#7c3aed";
  return (
    <div className="space-y-5">
      <STitle>จัดการหน้า Login</STitle>

      {/* Preview */}
      <PCard className="p-5">
        <p className="text-xs font-semibold text-[#7c7f96] uppercase tracking-wider mb-3">ตัวอย่างหน้า Login</p>
        <div className="rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-4 py-10 px-6"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${themeColor}40 0%, #0d0920 60%, #050510 100%)` }}>
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg"
            style={{ boxShadow: `0 0 20px ${themeColor}80`, background: "#1a0b3b" }}>
            {f.logo_url
              ? <img src={f.logo_url} alt="logo" className="w-full h-full object-cover" onError={(e)=>{(e.target as HTMLImageElement).style.display="none";}} />
              : <span className="text-white text-2xl font-bold">{(f.site_name||"NS").slice(0,1)}</span>
            }
          </div>
          <p className="text-white font-extrabold text-xl tracking-tight">{f.site_name || "NantaShop"}</p>
          <span className="px-4 py-1.5 rounded-full text-xs text-white/80 border" style={{ borderColor: `${themeColor}60`, background: `${themeColor}20` }}>
            {f.site_description || "บริการจำหน่ายไอดีเกม"}
          </span>
          {f.announcement && (
            <span className="text-white/60 text-xs text-center max-w-xs">{f.announcement}</span>
          )}
          <div className="flex gap-3 mt-2">
            <div className="px-6 py-3 rounded-2xl text-white text-sm font-bold" style={{ background: themeColor }}>เข้าสู่ระบบ</div>
            <div className="px-6 py-3 rounded-2xl text-white text-sm font-bold opacity-70" style={{ background: `${themeColor}90` }}>ดูสินค้า</div>
          </div>
        </div>
      </PCard>

      {/* Fields */}
      <PCard className="p-5 space-y-4">
        <p className="text-xs font-semibold text-[#7c7f96] uppercase tracking-wider">ข้อมูลร้าน</p>
        <div className="grid grid-cols-2 gap-4">
          <FRow label="ชื่อร้าน (Site Name)"><SInput value={f.site_name} onChange={e=>setF(x=>({...x,site_name:e.target.value}))} placeholder="NantaShop"/></FRow>
          <FRow label="Logo URL"><SInput value={f.logo_url} onChange={e=>setF(x=>({...x,logo_url:e.target.value}))} placeholder="https://..."/></FRow>
        </div>
        <FRow label="คำอธิบาย / Badge ใต้ชื่อ"><SInput value={f.site_description} onChange={e=>setF(x=>({...x,site_description:e.target.value}))} placeholder="บริการจำหน่ายไอดีเกม"/></FRow>
        <FRow label="ข้อความต้อนรับ (Announcement)"><SInput value={f.announcement} onChange={e=>setF(x=>({...x,announcement:e.target.value}))} placeholder="ยินดีต้อนรับสู่ร้านค้าของเรา!"/></FRow>
      </PCard>

      <PCard className="p-5 space-y-4">
        <p className="text-xs font-semibold text-[#7c7f96] uppercase tracking-wider">สี Theme</p>
        <FRow label="Theme Color">
          <div className="flex gap-3 items-center">
            <input type="color" value={themeColor} onChange={e=>setF(x=>({...x,primary_color:e.target.value}))}
              className="w-12 h-10 rounded-lg border border-[#252836] cursor-pointer bg-transparent" />
            <SInput value={f.primary_color} onChange={e=>setF(x=>({...x,primary_color:e.target.value}))} placeholder="#7c3aed" />
          </div>
        </FRow>
        <div className="flex gap-2 flex-wrap">
          {["#7c3aed","#0ea5e9","#10b981","#f59e0b","#ef4444","#ec4899","#6366f1","#14b8a6"].map(c => (
            <button key={c} onClick={() => setF(x=>({...x,primary_color:c}))}
              className={`w-8 h-8 rounded-full border-2 transition-all ${f.primary_color===c?"border-white scale-110":"border-transparent"}`}
              style={{ background: c }} />
          ))}
        </div>
      </PCard>

      <div className="flex justify-end"><SaveBtn onClick={() => setConfirmOpen(true)} loading={saving}/></div>
      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); setLoadingOpen(true); actualSave(); }} onCancel={() => setConfirmOpen(false)} />
      <SaveLoadingDialog open={loadingOpen} />
      <SaveSuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function NavbarSettings({ isMockMode, cmsConfig, setCmsConfig, toast }: any) {
  const [f, setF] = useState({ navbar_enable_home:cmsConfig.navbar_enable_home!==false, navbar_enable_products:cmsConfig.navbar_enable_products!==false, navbar_enable_topup:cmsConfig.navbar_enable_topup!==false, enable_loading_screen:cmsConfig.enable_loading_screen||false, loading_gif_url:cmsConfig.loading_gif_url||"" });
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  async function actualSave() {
    setSaving(true);
    try {
      const updated = await api.patch("/settings", f);
      setCmsConfig({...cmsConfig,...updated});
      setLoadingOpen(false); setSuccessOpen(true);
    } catch { setLoadingOpen(false); toast({title:"บันทึกล้มเหลว",variant:"destructive"}); }
    setSaving(false);
  }
  async function handleSuccessClose() {
    setSuccessOpen(false);
    try { const d = await api.get("/settings"); if(d) setCmsConfig(d); } catch {}
  }
  return (
    <div className="space-y-5">
      <STitle>จัดการ Navbar</STitle>
      <PCard className="p-5 space-y-3">
        <SToggle checked={f.navbar_enable_home} onChange={v=>setF(x=>({...x,navbar_enable_home:v}))} label="แสดงปุ่ม หน้าหลัก" />
        <SToggle checked={f.navbar_enable_products} onChange={v=>setF(x=>({...x,navbar_enable_products:v}))} label="แสดงปุ่ม สินค้า" />
        <SToggle checked={f.navbar_enable_topup} onChange={v=>setF(x=>({...x,navbar_enable_topup:v}))} label="แสดงปุ่ม เติมเงิน" />
        <SToggle checked={f.enable_loading_screen} onChange={v=>setF(x=>({...x,enable_loading_screen:v}))} label="เปิด Loading Screen" />
      </PCard>
      {f.enable_loading_screen && (
        <PCard className="p-5">
          <FRow label="Loading Screen GIF URL"><SInput value={f.loading_gif_url} onChange={e=>setF(x=>({...x,loading_gif_url:e.target.value}))} placeholder="https://...gif"/></FRow>
        </PCard>
      )}
      <div className="flex justify-end"><SaveBtn onClick={() => setConfirmOpen(true)} loading={saving}/></div>
      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); setLoadingOpen(true); actualSave(); }} onCancel={() => setConfirmOpen(false)} />
      <SaveLoadingDialog open={loadingOpen} />
      <SaveSuccessDialog open={successOpen} onClose={handleSuccessClose} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   HOMEPAGE
───────────────────────────────────────────── */
function HomepageSettings({ isMockMode, cmsConfig, setCmsConfig, toast }: any) {
  const [f, setF] = useState({ hero_title:cmsConfig.hero_title||"", hero_description:cmsConfig.hero_description||"", hero_background:cmsConfig.hero_background||"", enable_section:true, enable_slider:true, enable_announcement:true, enable_stats:true, enable_recent:true });
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  async function actualSave() {
    setSaving(true);
    try { const updated = await api.patch("/settings", {hero_title:f.hero_title,hero_description:f.hero_description,hero_background:f.hero_background}); setCmsConfig({...cmsConfig,...updated}); setLoadingOpen(false); setSuccessOpen(true); } catch { setLoadingOpen(false); toast({title:"บันทึกล้มเหลว",variant:"destructive"}); }
    setSaving(false);
  }
  return (
    <div className="space-y-5">
      <STitle>จัดการหน้าหลัก</STitle>
      <PCard className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FRow label="หัวข้อหลัก"><SInput value={f.hero_title} onChange={e=>setF(x=>({...x,hero_title:e.target.value}))} placeholder="บริการจำหน่ายไอดีเกม"/></FRow>
          <FRow label="คำอธิบาย"><SInput value={f.hero_description} onChange={e=>setF(x=>({...x,hero_description:e.target.value}))} placeholder="ราคาถูกที่สุดในไทย"/></FRow>
        </div>
        <FRow label="Background URL"><SInput value={f.hero_background} onChange={e=>setF(x=>({...x,hero_background:e.target.value}))} placeholder="https://..."/></FRow>
      </PCard>
      <PCard className="p-5 space-y-3">
        <p className="text-xs font-semibold text-[#7c7f96] uppercase tracking-wider mb-1">ส่วนที่แสดงบนหน้าหลัก</p>
        <SToggle checked={f.enable_section}      onChange={v=>setF(x=>({...x,enable_section:v}))}      label="เปิด/ปิด Hero Section" />
        <SToggle checked={f.enable_slider}       onChange={v=>setF(x=>({...x,enable_slider:v}))}       label="เปิด/ปิด Slider" />
        <SToggle checked={f.enable_announcement} onChange={v=>setF(x=>({...x,enable_announcement:v}))} label="เปิด/ปิด Announcement" />
        <SToggle checked={f.enable_stats}        onChange={v=>setF(x=>({...x,enable_stats:v}))}        label="เปิด/ปิด สถิติเว็บไซต์" />
        <SToggle checked={f.enable_recent}       onChange={v=>setF(x=>({...x,enable_recent:v}))}       label="เปิด/ปิด การซื้อล่าสุด" />
      </PCard>
      <div className="flex justify-end"><SaveBtn onClick={() => setConfirmOpen(true)} loading={saving}/></div>
      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); setLoadingOpen(true); actualSave(); }} onCancel={() => setConfirmOpen(false)} />
      <SaveLoadingDialog open={loadingOpen} />
      <SaveSuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   THEME
───────────────────────────────────────────── */
function ThemeSettings({ isMockMode, cmsConfig, setCmsConfig, toast }: any) {
  const [f, setF] = useState({ font:cmsConfig.font||"", logo_url:cmsConfig.logo_url||"", background_url:cmsConfig.background_url||"", primary:cmsConfig.primary_color?hslToHex(cmsConfig.primary_color):"#0ea5e9", secondary:cmsConfig.secondary_color?hslToHex(cmsConfig.secondary_color):"#1e2536", font_color:cmsConfig.font_color||"#ffffff", border_color:cmsConfig.border_color||"#2a2d3a", bg_color:"#0f1117", animation:"none" });
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  async function actualSave() {
    setSaving(true);
    try {
      const p = { font:f.font, logo_url:f.logo_url, background_url:f.background_url, primary_color:hexToHsl(f.primary), secondary_color:hexToHsl(f.secondary), font_color:f.font_color, border_color:f.border_color };
      const updated = await api.patch("/settings", p);
      setCmsConfig({...cmsConfig,...updated});
      setLoadingOpen(false); setSuccessOpen(true);
    } catch { setLoadingOpen(false); toast({title:"บันทึกล้มเหลว",variant:"destructive"}); }
    setSaving(false);
  }
  async function handleSuccessClose() {
    setSuccessOpen(false);
    try { const d = await api.get("/settings"); if(d) setCmsConfig(d); } catch {}
  }
  const colors = [
    { key:"primary",     label:"Primary Color" },
    { key:"secondary",   label:"Secondary Color" },
    { key:"font_color",  label:"Font Color" },
    { key:"border_color",label:"Border Color" },
    { key:"bg_color",    label:"Background Color" },
  ];
  return (
    <div className="space-y-5">
      <STitle>จัดการ Theme</STitle>
      <PCard className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FRow label="Font Family">
            <SSelect value={f.font} onChange={v=>setF(x=>({...x,font:v}))}>
              <option value="">ค่าเริ่มต้น</option>
              {["Kanit","Sarabun","Prompt","Noto Sans Thai","Orbitron","Inter"].map(fn=><option key={fn} value={fn}>{fn}</option>)}
            </SSelect>
          </FRow>
          <FRow label="Animation Effect">
            <SSelect value={f.animation} onChange={v=>setF(x=>({...x,animation:v}))}>
              <option value="none">ไม่มี</option>
              <option value="snow">Snow</option>
              <option value="ember">Ember</option>
              <option value="meteor">Meteor</option>
            </SSelect>
          </FRow>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FRow label="Logo URL"><SInput value={f.logo_url} onChange={e=>setF(x=>({...x,logo_url:e.target.value}))} placeholder="https://..."/></FRow>
          <FRow label="Background URL"><SInput value={f.background_url} onChange={e=>setF(x=>({...x,background_url:e.target.value}))} placeholder="https://..."/></FRow>
        </div>
      </PCard>
      <PCard className="p-5">
        <p className="text-xs font-semibold text-[#7c7f96] uppercase tracking-wider mb-4">สีธีม</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {colors.map(({key,label}) => (
            <FRow key={key} label={label}>
              <div className="flex items-center gap-2">
                <input type="color" value={(f as any)[key]} onChange={e=>setF(x=>({...x,[key]:e.target.value}))} className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0.5 bg-[#111320]" />
                <SInput value={(f as any)[key]} onChange={e=>setF(x=>({...x,[key]:e.target.value}))} className="font-mono text-xs"/>
              </div>
            </FRow>
          ))}
        </div>
      </PCard>
      <div className="flex justify-end"><SaveBtn onClick={() => setConfirmOpen(true)} loading={saving}/></div>
      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); setLoadingOpen(true); actualSave(); }} onCancel={() => setConfirmOpen(false)} />
      <SaveLoadingDialog open={loadingOpen} />
      <SaveSuccessDialog open={successOpen} onClose={handleSuccessClose} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   NEWS
───────────────────────────────────────────── */
function NewsSettings({ toast }: any) {
  type NI = { id:string; title:string; content:string; created_at:string };
  const [news, setNews] = useState<NI[]>([]);
  const [f, setF] = useState({ title:"", content:"" });
  const [editing, setEditing] = useState<string|null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);
  const [delConfirmId, setDelConfirmId] = useState<string|null>(null);
  useEffect(() => {
    api.get("/news").then(d => { if (d?.length) setNews(d); }).catch(() => {});
  }, []);
  async function actualSave() {
    if (!f.title) return;
    try {
      if (editing) {
        const updated = await api.patch(`/news/${editing}`, f);
        setNews(prev=>prev.map(n=>n.id===editing?updated:n)); setEditing(null);
      } else {
        const created = await api.post("/news", f);
        setNews(prev=>[...prev, created]);
      }
      setF({ title:"", content:"" }); setLoadingOpen(false); setSaveSuccessOpen(true);
    } catch { setLoadingOpen(false); toast({ title:"บันทึกล้มเหลว", variant:"destructive" }); }
  }
  return (
    <div className="space-y-5">
      <STitle>จัดการข่าวสาร</STitle>
      <PCard className="p-5 space-y-4">
        <p className="text-sm font-semibold text-white">{editing?"แก้ไขข่าวสาร":"เพิ่มข่าวสารใหม่"}</p>
        <FRow label="หัวข้อ"><SInput value={f.title} onChange={e=>setF(x=>({...x,title:e.target.value}))} placeholder="หัวข้อข่าวสาร..."/></FRow>
        <FRow label="เนื้อหา"><STextarea rows={3} value={f.content} onChange={e=>setF(x=>({...x,content:e.target.value}))} placeholder="เนื้อหา..."/></FRow>
        <div className="flex gap-2">
          <SaveBtn onClick={() => setConfirmOpen(true)}/>
          {editing && <button onClick={()=>{setEditing(null);setF({title:"",content:""});}} className="px-4 py-2.5 rounded-xl border border-[#252836] text-[#7c7f96] text-sm hover:text-white transition-colors">ยกเลิก</button>}
        </div>
      </PCard>
      <div className="space-y-2">
        {news.map(n=>(
          <PCard key={n.id} className="p-4 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{n.title}</p>
              <p className="text-xs text-[#7c7f96] mt-1 line-clamp-2">{n.content}</p>
              <p className="text-[10px] text-[#565870] mt-1">{new Date(n.created_at).toLocaleDateString("th-TH")}</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={()=>{setEditing(n.id);setF({title:n.title,content:n.content});}} className="p-2 rounded-lg hover:bg-[#252836] text-[#7c7f96] hover:text-white transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
              <button onClick={()=>setDelConfirmId(n.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-[#7c7f96] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
          </PCard>
        ))}
      </div>
      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); setLoadingOpen(true); actualSave(); }} onCancel={() => setConfirmOpen(false)} />
      <SaveLoadingDialog open={loadingOpen} />
      <SaveSuccessDialog open={saveSuccessOpen} onClose={() => setSaveSuccessOpen(false)} />
      <ConfirmSaveDialog open={!!delConfirmId} title="ยืนยันการลบข่าวสาร?" body="ข่าวสารนี้จะถูกลบออกจากระบบถาวร" onConfirm={async () => { if (!delConfirmId) return; try { await api.delete("/news/" + delConfirmId); setNews(prev => prev.filter(x => x.id !== delConfirmId)); toast({ title: "ลบข่าวสารแล้ว" }); } catch { toast({ title: "ลบล้มเหลว", variant: "destructive" }); } finally { setDelConfirmId(null); } }} onCancel={() => setDelConfirmId(null)} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   POPUP
───────────────────────────────────────────── */
function PopupSettings({ isMockMode, cmsConfig, setCmsConfig, toast }: any) {
  const [f, setF] = useState({ enable_popup:cmsConfig.enable_popup||false, popup_image_url:cmsConfig.popup_image_url||"", popup_title:cmsConfig.popup_title||"", popup_link:"" });
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  async function actualSave() {
    setSaving(true);
    try { const updated = await api.patch("/settings", f); setCmsConfig({...cmsConfig,...updated}); setLoadingOpen(false); setSuccessOpen(true); } catch { setLoadingOpen(false); toast({title:"บันทึกล้มเหลว",variant:"destructive"}); }
    setSaving(false);
  }
  return (
    <div className="space-y-5">
      <STitle>จัดการป๊อปอัพ</STitle>
      <PCard className="p-5 space-y-4">
        <SToggle checked={f.enable_popup} onChange={v=>setF(x=>({...x,enable_popup:v}))} label="เปิด/ปิด ระบบ Popup"/>
        <div className="grid grid-cols-2 gap-4">
          <FRow label="หัวข้อ Popup"><SInput value={f.popup_title} onChange={e=>setF(x=>({...x,popup_title:e.target.value}))} placeholder="ชื่อ Popup..."/></FRow>
          <FRow label="URL ปลายทาง"><SInput value={f.popup_link} onChange={e=>setF(x=>({...x,popup_link:e.target.value}))} placeholder="https://..."/></FRow>
        </div>
        <FRow label="URL รูปภาพ"><SInput value={f.popup_image_url} onChange={e=>setF(x=>({...x,popup_image_url:e.target.value}))} placeholder="https://..."/></FRow>
        {f.popup_image_url && <div className="rounded-xl overflow-hidden border border-[#252836] w-40"><img src={f.popup_image_url} alt="preview" className="w-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/></div>}
      </PCard>
      <div className="flex justify-end"><SaveBtn onClick={() => setConfirmOpen(true)} loading={saving}/></div>
      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); setLoadingOpen(true); actualSave(); }} onCancel={() => setConfirmOpen(false)} />
      <SaveLoadingDialog open={loadingOpen} />
      <SaveSuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   QUICK LINKS
───────────────────────────────────────────── */
function QuickLinksSettings({ toast }: any) {
  const [enabled, setEnabled] = useState(true);
  const [links, setLinks] = useState([
    { id:"1", title:"ติดต่อ",    image_url:"", target_page:"/contact" },
    { id:"2", title:"เติมเงิน",  image_url:"", target_page:"/topup" },
    { id:"3", title:"ประวัติ",   image_url:"", target_page:"/profile" },
    { id:"4", title:"สินค้า",    image_url:"", target_page:"/products" },
  ]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  useEffect(() => {
    api.get("/quick-links").then(d => { if (d?.length) setLinks(d); }).catch(() => {});
  }, []);
  async function actualSave() {
    try {
      const saved = await api.put("/quick-links", links.map((l,i) => ({ title:l.title, image_url:l.image_url, target_page:l.target_page, sort_order:i })));
      if (saved?.length) setLinks(saved);
      setSuccessOpen(true);
    } catch { toast({title:"บันทึกล้มเหลว",variant:"destructive"}); }
  }
  async function handleSuccessClose() {
    setSuccessOpen(false);
    try { const d = await api.get("/quick-links"); if(d?.length) setLinks(d); } catch {}
  }
  return (
    <div className="space-y-5">
      <STitle>จัดการปุ่มลัด</STitle>
      <PCard className="p-5 space-y-4">
        <SToggle checked={enabled} onChange={setEnabled} label="เปิด/ปิด ระบบปุ่มลัด"/>
        {links.map((l,i)=>(
          <div key={l.id} className="p-4 rounded-xl bg-[#111320] border border-[#252836] space-y-3">
            <p className="text-xs font-bold text-blue-400 uppercase">ปุ่มลัด {i+1}</p>
            <div className="grid grid-cols-3 gap-3">
              <FRow label="ชื่อปุ่ม"><SInput value={l.title} onChange={e=>setLinks(p=>p.map(x=>x.id===l.id?{...x,title:e.target.value}:x))}/></FRow>
              <FRow label="Image URL"><SInput value={l.image_url} onChange={e=>setLinks(p=>p.map(x=>x.id===l.id?{...x,image_url:e.target.value}:x))} placeholder="https://..."/></FRow>
              <FRow label="URL ปลายทาง"><SInput value={l.target_page} onChange={e=>setLinks(p=>p.map(x=>x.id===l.id?{...x,target_page:e.target.value}:x))}/></FRow>
            </div>
          </div>
        ))}
      </PCard>
      <div className="flex justify-end"><SaveBtn onClick={() => setConfirmOpen(true)}/></div>
      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); actualSave(); }} onCancel={() => setConfirmOpen(false)} />
      <SaveSuccessDialog open={successOpen} onClose={handleSuccessClose} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   SLIDERS
───────────────────────────────────────────── */
function SlidersSettings({ isMockMode, sliders, setSliders, toast }: any) {
  const [f, setF] = useState({ title:"", image_url:"", link_url:"", sort_order:0 });
  const [editing, setEditing] = useState<string|null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [delConfirmId, setDelConfirmId] = useState<string|null>(null);
  async function actualSave() {
    if (!f.image_url) { toast({title:"ใส่ URL รูปภาพก่อน",variant:"destructive"}); return; }
    try {
      if (editing) {
        const updated = await api.patch(`/sliders/${editing}`, f);
        setSliders(sliders.map((s:Slider)=>s.id===editing?updated:s));
      } else {
        const created = await api.post("/sliders", f);
        setSliders([...sliders, created]);
      }
      setF({title:"",image_url:"",link_url:"",sort_order:0}); setEditing(null);
      toast({title:editing?"อัปเดต Slider แล้ว!":"เพิ่ม Slider แล้ว!"});
    } catch { toast({title:"บันทึกล้มเหลว",variant:"destructive"}); }
  }
  function del(id:string) { setDelConfirmId(id); }
  return (
    <div className="space-y-5">
      <STitle>จัดการสไลด์ภาพ</STitle>
      <PCard className="p-5 space-y-4">
        <p className="text-sm font-semibold text-white">{editing?"แก้ไข Slider":"เพิ่ม Slider ใหม่"}</p>
        <div className="grid grid-cols-2 gap-4">
          <FRow label="ชื่อ (ไม่บังคับ)"><SInput value={f.title} onChange={e=>setF(x=>({...x,title:e.target.value}))} placeholder="ชื่อ slider..."/></FRow>
          <FRow label="URL ปลายทาง"><SInput value={f.link_url} onChange={e=>setF(x=>({...x,link_url:e.target.value}))} placeholder="/products"/></FRow>
        </div>
        <FRow label="Image URL"><SInput value={f.image_url} onChange={e=>setF(x=>({...x,image_url:e.target.value}))} placeholder="https://..."/></FRow>
        <div className="flex gap-2">
          <SaveBtn onClick={() => setConfirmOpen(true)}/>
          {editing && <button onClick={()=>{setEditing(null);setF({title:"",image_url:"",link_url:"",sort_order:0});}} className="px-4 py-2.5 rounded-xl border border-[#252836] text-[#7c7f96] text-sm hover:text-white transition-colors">ยกเลิก</button>}
        </div>
      </PCard>
      <div className="space-y-2">
        {sliders.map((s:Slider)=>(
          <PCard key={s.id} className="p-4 flex items-center gap-3">
            <img src={s.image_url} alt={s.title||""} className="w-20 h-11 rounded-lg object-cover border border-[#252836] flex-shrink-0" onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white">{s.title||"(ไม่มีชื่อ)"}</p><p className="text-xs text-[#7c7f96] truncate">{s.link_url||"—"}</p></div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={()=>{setEditing(s.id);setF({title:s.title||"",image_url:s.image_url,link_url:s.link_url||"",sort_order:s.sort_order});}} className="p-2 rounded-lg hover:bg-[#252836] text-[#7c7f96] hover:text-white transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
              <button onClick={()=>del(s.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-[#7c7f96] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
          </PCard>
        ))}
      </div>
      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); actualSave(); }} onCancel={() => setConfirmOpen(false)} />
      <ConfirmSaveDialog open={!!delConfirmId} title="ยืนยันการลบ Slider?" body="Slider นี้จะถูกลบออกจากระบบถาวร" onConfirm={async () => { if (!delConfirmId) return; try { await api.delete("/sliders/" + delConfirmId); setSliders(sliders.filter((s:Slider) => s.id !== delConfirmId)); toast({ title: "ลบ Slider แล้ว" }); } catch { toast({ title: "ลบล้มเหลว", variant: "destructive" }); } finally { setDelConfirmId(null); } }} onCancel={() => setDelConfirmId(null)} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   PARTICLE
───────────────────────────────────────────── */
function ParticleSettings({ isMockMode, cmsConfig, setCmsConfig, toast }: any) {
  const [f, setF] = useState({ enabled:(cmsConfig.particle_type||"none")!=="none", type:cmsConfig.particle_type||"none", position:cmsConfig.particle_position||"background" });
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  async function actualSave() {
    setSaving(true);
    const payload = { particle_type: f.enabled ? f.type : "none", particle_position: f.position };
    try {
      const updated = await api.patch("/settings", payload);
      setCmsConfig({...cmsConfig,...updated});
      setSuccessOpen(true);
    } catch { toast({title:"บันทึกล้มเหลว",variant:"destructive"}); }
    setSaving(false);
  }
  async function handleSuccessClose() {
    setSuccessOpen(false);
    try { const d = await api.get("/settings"); if(d) setCmsConfig(d); } catch {}
  }
  const effects = ["none","snow","ember","meteor"];
  const positions = [{v:"background",l:"Background Only"},{v:"under-content",l:"Under Content"},{v:"above-content",l:"Above Content"}];
  return (
    <div className="space-y-5">
      <STitle>จัดการ Particle Effects</STitle>
      <PCard className="p-5 space-y-4">
        <SToggle checked={f.enabled} onChange={v=>setF(x=>({...x,enabled:v}))} label="เปิด/ปิด Particle Effects"/>
        {f.enabled && (
          <>
            <FRow label="เลือก Effect">
              <div className="grid grid-cols-2 gap-2">
                {effects.map(e=>(
                  <button key={e} onClick={()=>setF(x=>({...x,type:e}))}
                    className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition-colors ${f.type===e?"bg-blue-600/20 border-blue-500/60 text-blue-400":"bg-[#111320] border-[#252836] text-[#7c7f96] hover:text-white"}`}>
                    {e==="none"?"ไม่มี":e.charAt(0).toUpperCase()+e.slice(1)}
                  </button>
                ))}
              </div>
            </FRow>
            <FRow label="ตำแหน่ง">
              <div className="grid grid-cols-3 gap-2">
                {positions.map(p=>(
                  <button key={p.v} onClick={()=>setF(x=>({...x,position:p.v}))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-colors ${f.position===p.v?"bg-blue-600/20 border-blue-500/60 text-blue-400":"bg-[#111320] border-[#252836] text-[#7c7f96] hover:text-white"}`}>
                    {p.l}
                  </button>
                ))}
              </div>
            </FRow>
          </>
        )}
      </PCard>
      <div className="flex justify-end"><SaveBtn onClick={() => setConfirmOpen(true)} loading={saving}/></div>
      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); actualSave(); }} onCancel={() => setConfirmOpen(false)} />
      <SaveSuccessDialog open={successOpen} onClose={handleSuccessClose} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   WALLET / BANK / REDEEM CODES
───────────────────────────────────────────── */
function WalletSettings({ isMockMode, walletConfigs, setWalletConfigs, toast }: any) {
  const [phone, setPhone] = useState(walletConfigs[0]?.phone_number||"");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  async function actualSave() {
    setSaving(true);
    try {
      const rec = await api.put("/wallet-configs", { phone_number:phone });
      setWalletConfigs(rec?.id ? [rec] : [{ id:crypto.randomUUID(), phone_number:phone, is_active:true }]);
      toast({title:"บันทึกเบอร์วอเล็ทแล้ว!"});
    } catch { toast({title:"บันทึกล้มเหลว",variant:"destructive"}); }
    setSaving(false);
  }
  return (
    <div className="space-y-5">
      <STitle>จัดการวอเล็ท (TrueMoney)</STitle>
      <PCard className="p-5 space-y-4">
        <FRow label="เบอร์รับอั้งเปา TrueMoney (ระบบอัตโนมัติ)"><SInput value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0812345678"/></FRow>
        <p className="text-xs text-[#7c7f96]">⚡ เบอร์นี้จะถูกใช้รับอั้งเปาอัตโนมัติ — เมื่อลูกค้าวางลิ้งค์ ระบบจะโอนเงินเข้าเบอร์นี้และเด้งเงินเข้าวอเล็ทลูกค้าทันที</p>
        <div className="flex justify-end"><SaveBtn onClick={() => setConfirmOpen(true)} loading={saving}/></div>
      </PCard>
      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); actualSave(); }} onCancel={() => setConfirmOpen(false)} />
    </div>
  );
}

function BankSettings({ isMockMode, bankConfigs, setBankConfigs, toast }: any) {
  const emptyForm = { bank_name:"", account_number:"", account_name:"", qr_code_url:"", rdcw_client_id:"", rdcw_client_secret:"" };
  const [f, setF] = useState(emptyForm);
  const [show, setShow] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [delConfirmId, setDelConfirmId] = useState<string|null>(null);
  const [editId, setEditId] = useState<string|null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editConfirm, setEditConfirm] = useState(false);
  const [showRdcwSecret, setShowRdcwSecret] = useState(false);
  const [showEditRdcwSecret, setShowEditRdcwSecret] = useState(false);

  async function actualSave() {
    if (!f.bank_name||!f.account_number) { toast({title:"กรอกข้อมูลให้ครบ",variant:"destructive"}); return; }
    try {
      const payload: any = { bank_name:f.bank_name, account_number:f.account_number, account_name:f.account_name, is_active:true };
      if (f.qr_code_url) payload.qr_code_url = f.qr_code_url;
      if (f.rdcw_client_id) payload.rdcw_client_id = f.rdcw_client_id;
      if (f.rdcw_client_secret) payload.rdcw_client_secret = f.rdcw_client_secret;
      const created = await api.post("/bank-configs", payload);
      setBankConfigs([...bankConfigs, created]); setF(emptyForm); setShow(false);
      toast({title:"เพิ่มบัญชีธนาคารแล้ว!"});
    } catch { toast({title:"บันทึกล้มเหลว",variant:"destructive"}); }
  }

  async function actualEdit() {
    if (!editId||!editForm) return;
    try {
      await api.patch(`/bank-configs/${editId}`, editForm);
      setBankConfigs(bankConfigs.map((b:BankConfig)=>b.id===editId?{...b,...editForm}:b));
      setEditId(null); setEditForm(null);
      toast({title:"อัปเดตข้อมูลธนาคารแล้ว!"});
    } catch { toast({title:"บันทึกล้มเหลว",variant:"destructive"}); }
  }

  async function toggle(id:string, active:boolean) {
    try { await api.patch(`/bank-configs/${id}`, {is_active:active}); setBankConfigs(bankConfigs.map((b:BankConfig)=>b.id===id?{...b,is_active:active}:b)); } catch {}
  }
  function del(id:string) { setDelConfirmId(id); }

  function startEdit(b: BankConfig) {
    setEditId(b.id);
    setEditForm({
      bank_name: b.bank_name,
      account_number: b.account_number,
      account_name: b.account_name,
      qr_code_url: b.qr_code_url ?? "",
      rdcw_client_id: (b as any).rdcw_client_id ?? "",
      rdcw_client_secret: (b as any).rdcw_client_secret ?? "",
    });
    setShowEditRdcwSecret(false);
  }

  return (
    <div className="space-y-5">
      <STitle>จัดการธนาคาร</STitle>

      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs text-blue-300 space-y-1">
        <p className="font-semibold text-blue-200">🔐 ระบบตรวจสลิปอัตโนมัติ (RDCW)</p>
        <p>ใส่ Client ID และ Client Secret จาก <span className="font-mono text-blue-100">slip.rdcw.co.th</span> เพื่อให้ระบบตรวจสลิปและเติมเครดิตอัตโนมัติทันที</p>
        <p className="text-blue-400">ถ้าไม่ใส่ — สลิปจะถูกส่งให้แอดมินอนุมัติเอง</p>
      </div>

      <div className="flex justify-end"><AddBtn onClick={()=>setShow(!show)} label="เพิ่มบัญชีธนาคาร"/></div>

      {show && (
        <PCard className="p-5 space-y-4">
          <p className="text-xs font-semibold text-[#7c7f96] uppercase tracking-wider">ข้อมูลบัญชี</p>
          <div className="grid grid-cols-2 gap-4">
            <FRow label="ชื่อธนาคาร"><SInput value={f.bank_name} onChange={e=>setF(x=>({...x,bank_name:e.target.value}))} placeholder="ธนาคารไทยพาณิชย์ (SCB)"/></FRow>
            <FRow label="เลขบัญชี"><SInput value={f.account_number} onChange={e=>setF(x=>({...x,account_number:e.target.value}))} placeholder="123-456-7890"/></FRow>
          </div>
          <FRow label="ชื่อบัญชี"><SInput value={f.account_name} onChange={e=>setF(x=>({...x,account_name:e.target.value}))} placeholder="ชื่อ นามสกุล"/></FRow>
          <FRow label="QR Code URL (ไม่บังคับ)"><SInput value={f.qr_code_url} onChange={e=>setF(x=>({...x,qr_code_url:e.target.value}))} placeholder="https://..."/></FRow>

          <div className="pt-2 border-t border-[#252836]">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">🔐 RDCW — ตรวจสลิปอัตโนมัติ (ไม่บังคับ)</p>
            <div className="grid grid-cols-2 gap-4">
              <FRow label="Client ID"><SInput value={f.rdcw_client_id} onChange={e=>setF(x=>({...x,rdcw_client_id:e.target.value}))} placeholder="r842gxchc8uk502l"/></FRow>
              <FRow label="Client Secret">
                <div className="relative">
                  <SInput type={showRdcwSecret?"text":"password"} value={f.rdcw_client_secret} onChange={e=>setF(x=>({...x,rdcw_client_secret:e.target.value}))} placeholder="rdip4kpque7yk0m3c88evo3xlins..."/>
                  <button type="button" onClick={()=>setShowRdcwSecret(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7c7f96] hover:text-white text-xs px-1">{showRdcwSecret?"ซ่อน":"แสดง"}</button>
                </div>
              </FRow>
            </div>
          </div>

          <SaveBtn onClick={() => setConfirmOpen(true)}/>
        </PCard>
      )}

      {/* Edit modal */}
      {editId && editForm && (
        <PCard className="p-5 space-y-4 border border-blue-500/30">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">แก้ไขบัญชีธนาคาร</p>
          <div className="grid grid-cols-2 gap-4">
            <FRow label="ชื่อธนาคาร"><SInput value={editForm.bank_name} onChange={e=>setEditForm((x:any)=>({...x,bank_name:e.target.value}))} placeholder="ธนาคารไทยพาณิชย์ (SCB)"/></FRow>
            <FRow label="เลขบัญชี"><SInput value={editForm.account_number} onChange={e=>setEditForm((x:any)=>({...x,account_number:e.target.value}))} placeholder="123-456-7890"/></FRow>
          </div>
          <FRow label="ชื่อบัญชี"><SInput value={editForm.account_name} onChange={e=>setEditForm((x:any)=>({...x,account_name:e.target.value}))} placeholder="ชื่อ นามสกุล"/></FRow>
          <FRow label="QR Code URL (ไม่บังคับ)"><SInput value={editForm.qr_code_url} onChange={e=>setEditForm((x:any)=>({...x,qr_code_url:e.target.value}))} placeholder="https://..."/></FRow>

          <div className="pt-2 border-t border-[#252836]">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">🔐 RDCW — ตรวจสลิปอัตโนมัติ</p>
            <div className="grid grid-cols-2 gap-4">
              <FRow label="Client ID"><SInput value={editForm.rdcw_client_id} onChange={e=>setEditForm((x:any)=>({...x,rdcw_client_id:e.target.value}))} placeholder="r842gxchc8uk502l"/></FRow>
              <FRow label="Client Secret">
                <div className="relative">
                  <SInput type={showEditRdcwSecret?"text":"password"} value={editForm.rdcw_client_secret} onChange={e=>setEditForm((x:any)=>({...x,rdcw_client_secret:e.target.value}))} placeholder="rdip4kpque7yk0m3c88evo3xlins..."/>
                  <button type="button" onClick={()=>setShowEditRdcwSecret(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7c7f96] hover:text-white text-xs px-1">{showEditRdcwSecret?"ซ่อน":"แสดง"}</button>
                </div>
              </FRow>
            </div>
          </div>

          <div className="flex gap-2">
            <SaveBtn onClick={() => setEditConfirm(true)}/>
            <button onClick={()=>{setEditId(null);setEditForm(null);}} className="px-4 py-2 rounded-lg text-xs font-medium bg-[#252836] text-[#7c7f96] hover:bg-[#2f3244]">ยกเลิก</button>
          </div>
        </PCard>
      )}

      <div className="space-y-3">
        {bankConfigs.map((b:BankConfig)=>(
          <PCard key={b.id} className="overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${b.is_active?"bg-green-400":"bg-[#464960]"}`}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-white">{b.bank_name}</p>
                  {(b as any).rdcw_client_id
                    ? <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-400 font-semibold">✓ RDCW อัตโนมัติ</span>
                    : <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-yellow-500/15 text-yellow-400 font-semibold">รอแอดมินอนุมัติ</span>
                  }
                </div>
                <p className="text-xs text-blue-400 font-mono">{b.account_number} — {b.account_name}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={()=>startEdit(b)} className="px-3 py-1.5 rounded-lg transition-colors text-xs font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">แก้ไข</button>
                <button onClick={()=>toggle(b.id,!b.is_active)} className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${b.is_active?"bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30":"bg-green-500/20 text-green-400 hover:bg-green-500/30"}`}>{b.is_active?"ปิด":"เปิด"}</button>
                <button onClick={()=>del(b.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-[#7c7f96] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
              </div>
            </div>
          </PCard>
        ))}
      </div>
      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); actualSave(); }} onCancel={() => setConfirmOpen(false)} />
      <ConfirmSaveDialog open={editConfirm} onConfirm={() => { setEditConfirm(false); actualEdit(); }} onCancel={() => setEditConfirm(false)} />
      <ConfirmSaveDialog open={!!delConfirmId} title="ยืนยันการลบบัญชีธนาคาร?" body="บัญชีธนาคารนี้จะถูกลบออกจากระบบถาวร" onConfirm={async () => { if (!delConfirmId) return; try { await api.delete("/bank-configs/" + delConfirmId); setBankConfigs(bankConfigs.filter((b:BankConfig) => b.id !== delConfirmId)); toast({ title: "ลบบัญชีธนาคารแล้ว" }); } catch { toast({ title: "ลบล้มเหลว", variant: "destructive" }); } finally { setDelConfirmId(null); } }} onCancel={() => setDelConfirmId(null)} />
    </div>
  );
}

function RedeemCodesSettings({ isMockMode, redeemCodes, setRedeemCodes, toast }: any) {
  const [f, setF] = useState({ code:"", credit_amount:0, usage_limit:10, expire_date:"" });
  const [show, setShow] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [delConfirmId, setDelConfirmId] = useState<string|null>(null);
  async function actualSave() {
    if (!f.code || !f.credit_amount) { toast({title:"กรอกข้อมูลให้ครบ",variant:"destructive"}); return; }
    try {
      const created = await api.post("/redeem-codes", {
        code: f.code.toUpperCase(), credit_amount: f.credit_amount,
        usage_limit: f.usage_limit, uses_count: 0, is_active: true,
        expire_date: f.expire_date ? new Date(f.expire_date).toISOString() : "",
      });
      setRedeemCodes([...redeemCodes, created]); setF({code:"",credit_amount:0,usage_limit:10,expire_date:""}); setShow(false);
      toast({title:"สร้าง Redeem Code แล้ว!"});
    } catch { toast({title:"บันทึกล้มเหลว",variant:"destructive"}); }
  }
  async function toggle(id:string, active:boolean) {
    try { await api.patch(`/redeem-codes/${id}`, {is_active:active}); setRedeemCodes(redeemCodes.map((g:RedeemCode)=>g.id===id?{...g,is_active:active}:g)); } catch {}
  }
  function del(id:string) { setDelConfirmId(id); }
  return (
    <div className="space-y-5">
      <STitle>จัดการโค้ดเติมเงิน (Redeem Codes)</STitle>
      <div className="flex justify-end"><AddBtn onClick={()=>setShow(!show)} label="สร้างโค้ดใหม่"/></div>
      {show && (
        <PCard className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FRow label="โค้ด"><SInput value={f.code} onChange={e=>setF(x=>({...x,code:e.target.value.toUpperCase()}))} placeholder="WELCOME100" className="font-mono tracking-widest uppercase"/></FRow>
            <FRow label="มูลค่า (฿)"><SInput type="number" value={f.credit_amount} onChange={e=>setF(x=>({...x,credit_amount:Number(e.target.value)}))}/></FRow>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FRow label="ใช้ได้กี่ครั้ง"><SInput type="number" value={f.usage_limit} onChange={e=>setF(x=>({...x,usage_limit:Number(e.target.value)}))}/></FRow>
            <FRow label="วันหมดอายุ (ไม่บังคับ)"><SInput type="datetime-local" value={f.expire_date} onChange={e=>setF(x=>({...x,expire_date:e.target.value}))}/></FRow>
          </div>
          <SaveBtn onClick={() => setConfirmOpen(true)}/>
        </PCard>
      )}
      <div className="space-y-2">
        {(redeemCodes as RedeemCode[]).map((g)=>(
          <PCard key={g.id} className="p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-blue-400 font-mono">{g.code}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs text-green-400">+฿{g.credit_amount.toLocaleString()}</span>
                <span className="text-xs text-[#7c7f96]">ใช้แล้ว {g.uses_count}/{g.usage_limit}</span>
                {g.expire_date && <span className="text-xs text-[#7c7f96]">หมดอายุ {new Date(g.expire_date).toLocaleDateString("th-TH")}</span>}
                {g.expire_date && new Date(g.expire_date) < new Date() && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">หมดอายุแล้ว</span>}
              </div>
            </div>
            <div className="w-24 flex-shrink-0">
              <div className="h-1.5 rounded-full bg-[#252836] overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{width:`${Math.min(100,(g.uses_count/g.usage_limit)*100)}%`}}/>
              </div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={()=>toggle(g.id,!g.is_active)} className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${g.is_active?"bg-yellow-500/20 text-yellow-400":"bg-green-500/20 text-green-400"}`}>{g.is_active?"ปิด":"เปิด"}</button>
              <button onClick={()=>del(g.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-[#7c7f96] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
          </PCard>
        ))}
      </div>
      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); actualSave(); }} onCancel={() => setConfirmOpen(false)} />
      <ConfirmSaveDialog open={!!delConfirmId} title="ยืนยันการลบโค้ด?" body="Redeem Code นี้จะถูกลบออกจากระบบถาวร" onConfirm={async () => { if (!delConfirmId) return; try { await api.delete("/redeem-codes/" + delConfirmId); setRedeemCodes(redeemCodes.filter((g:RedeemCode) => g.id !== delConfirmId)); toast({ title: "ลบ Redeem Code แล้ว" }); } catch { toast({ title: "ลบล้มเหลว", variant: "destructive" }); } finally { setDelConfirmId(null); } }} onCancel={() => setDelConfirmId(null)} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGINATION HELPER
───────────────────────────────────────────── */
function Pagination({ total, page, perPage, onPage }: { total: number; page: number; perPage: number; onPage: (p: number) => void }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-3 border-t border-[#252836]">
      <span className="text-xs text-[#7c7f96]">แสดง {Math.min((page-1)*perPage+1, total)}–{Math.min(page*perPage, total)} จาก {total} รายการ</span>
      <div className="flex gap-1">
        <button onClick={() => onPage(page-1)} disabled={page===1} className="p-1.5 rounded-lg hover:bg-[#252836] text-[#7c7f96] hover:text-white disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4"/></button>
        {Array.from({length: pages}, (_,i) => i+1).filter(p => Math.abs(p-page) < 3 || p===1 || p===pages).map((p, i, arr) => (
          <span key={p}>
            {i > 0 && arr[i-1] !== p-1 && <span className="px-1 text-[#7c7f96] text-xs">…</span>}
            <button onClick={() => onPage(p)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p===page ? "bg-blue-600 text-white" : "hover:bg-[#252836] text-[#7c7f96] hover:text-white"}`}>{p}</button>
          </span>
        ))}
        <button onClick={() => onPage(page+1)} disabled={page===pages} className="p-1.5 rounded-lg hover:bg-[#252836] text-[#7c7f96] hover:text-white disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4"/></button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CATEGORIES
───────────────────────────────────────────── */
function CategoriesSettings({ categories, setCategories, toast }: any) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string|null>(null);
  const [f, setF] = useState<Omit<Category,"id">>(emptyCategory);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [delId, setDelId] = useState<string|null>(null);

  const filtered = categories.filter((c: Category) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.description||"").toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice((page-1)*PER, page*PER);

  function openCreate() { setEditing(null); setF(emptyCategory); setModalOpen(true); }
  function openEdit(c: Category) { setEditing(c.id); setF({ name: c.name, description: c.description, image_url: c.image_url, is_featured: c.is_featured, sort_order: c.sort_order||0 }); setModalOpen(true); }

  async function actualSave() {
    if (!f.name) { toast({ title: "ใส่ชื่อหมวดหมู่ก่อน", variant: "destructive" }); return; }
    try {
      if (editing) {
        const updated = await api.patch(`/categories/${editing}`, f);
        setCategories(categories.map((c: Category) => c.id === editing ? updated : c));
      } else {
        const created = await api.post("/categories", f);
        setCategories([...categories, created]);
      }
      setModalOpen(false); setSuccessOpen(true);
    } catch { toast({ title: "บันทึกล้มเหลว", variant: "destructive" }); }
  }

  async function confirmDel() {
    if (!delId) return;
    try {
      await api.delete(`/categories/${delId}`);
      setCategories(categories.filter((c: Category) => c.id !== delId));
      toast({ title: "ลบหมวดหมู่แล้ว" });
    } catch { toast({ title: "ลบล้มเหลว", variant: "destructive" }); }
    setDelId(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <STitle>จัดการหมวดหมู่</STitle>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"><Plus className="w-4 h-4"/>+ เพิ่มหมวดหมู่</button>
      </div>

      <PCard className="overflow-hidden">
        <div className="p-4 border-b border-[#252836]">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7f96]"/><SInput className="pl-9" placeholder="ค้นหาหมวดหมู่..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[#252836]">
              {["#","ภาพ","ชื่อหมวดหมู่","คำอธิบาย","วันที่สร้าง","จัดการ"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#7c7f96] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-[#252836]">
              {paged.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[#7c7f96]">ไม่พบหมวดหมู่</td></tr>
              )}
              {paged.map((c: Category, i: number) => (
                <tr key={c.id} className="hover:bg-[#111320] transition-colors">
                  <td className="px-4 py-3 text-xs text-[#7c7f96]">{(page-1)*PER+i+1}</td>
                  <td className="px-4 py-3">
                    {c.image_url
                      ? <img src={c.image_url} alt={c.name} className="w-10 h-10 rounded-lg object-cover border border-[#252836]" onError={e => { (e.target as HTMLImageElement).src = ""; }}/>
                      : <div className="w-10 h-10 rounded-lg bg-[#252836] flex items-center justify-center"><Tag className="w-4 h-4 text-[#464960]"/></div>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-white">{c.name}</p>
                    {c.is_featured && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Featured</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#7c7f96] max-w-[200px] truncate">{c.description || "—"}</td>
                  <td className="px-4 py-3 text-xs text-[#7c7f96] whitespace-nowrap">{c.created_at ? new Date(c.created_at).toLocaleDateString("th-TH") : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(c)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs font-medium transition-colors"><Edit2 className="w-3 h-3"/>แก้ไข</button>
                      <button onClick={() => setDelId(c.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors"><Trash2 className="w-3 h-3"/>ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3"><Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage}/></div>
      </PCard>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              className="bg-[#1c1e2e] border border-[#252836] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">{editing ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}</h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-[#252836] text-[#7c7f96]"><X className="w-4 h-4"/></button>
              </div>
              <FRow label="ชื่อหมวดหมู่"><SInput value={f.name} onChange={e => setF(x => ({...x, name: e.target.value}))} placeholder="Blox Fruits"/></FRow>
              <FRow label="ลิงก์รูปภาพ"><SInput value={f.image_url||""} onChange={e => setF(x => ({...x, image_url: e.target.value}))} placeholder="https://..."/></FRow>
              <FRow label="คำอธิบาย"><STextarea rows={3} value={f.description||""} onChange={e => setF(x => ({...x, description: e.target.value}))} placeholder="คำอธิบายหมวดหมู่..."/></FRow>
              <SToggle checked={f.is_featured||false} onChange={v => setF(x => ({...x, is_featured: v}))} label="แสดงในหน้าหลัก (Featured)"/>
              <div className="flex gap-3 pt-2">
                <SaveBtn onClick={() => { setModalOpen(false); setConfirmOpen(true); }} label="บันทึกข้อมูล"/>
                <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-[#252836] text-[#7c7f96] text-sm hover:text-white transition-colors">ยกเลิก</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); actualSave(); }} onCancel={() => { setConfirmOpen(false); setModalOpen(true); }}/>
      <SaveSuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)}/>
      <ConfirmSaveDialog open={!!delId} title="ยืนยันการลบ ?" body="หมวดหมู่นี้จะถูกลบออกจากระบบถาวร" onConfirm={confirmDel} onCancel={() => setDelId(null)}/>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRODUCTS
───────────────────────────────────────────── */
function StockModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { toast } = useToast();
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkText, setBulkText] = useState("");
  const [saving, setSaving] = useState(false);
  const [delConfirmId, setDelConfirmId] = useState<string|null>(null);

  useEffect(() => {
    api.get(`/stocks/${product.id}`)
      .then(d => setStocks(d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [product.id]);

  async function addStock() {
    const lines = bulkText.split("\n").map((l: string) => l.trim()).filter(Boolean);
    if (!lines.length) { toast({ title: "ใส่ข้อมูล stock ก่อน", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const added = await api.post(`/stocks/${product.id}`, { lines });
      setStocks(prev => [...prev, ...added]);
      setBulkText("");
      toast({ title: `เพิ่ม ${lines.length} รายการสำเร็จ` });
    } catch { toast({ title: "เพิ่มล้มเหลว", variant: "destructive" }); }
    setSaving(false);
  }

  function delStock(id: string) { setDelConfirmId(id); }
  async function confirmDelStock() {
    if (!delConfirmId) return;
    try {
      await api.delete("/stocks/item/" + delConfirmId);
      setStocks(prev => prev.filter(s => s.id !== delConfirmId));
      toast({ title: "ลบสต็อกแล้ว" });
    } catch { toast({ title: "ลบล้มเหลว", variant: "destructive" }); }
    setDelConfirmId(null);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
        className="bg-[#1c1e2e] border border-[#252836] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-[#252836] flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-bold text-white">จัดการสต็อก</h3>
            <p className="text-xs text-[#7c7f96]">{product.name} • คงเหลือ {stocks.length} รายการ</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#252836] text-[#7c7f96]"><X className="w-4 h-4"/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#7c7f96] uppercase tracking-wider">เพิ่มสต็อกใหม่ (1 รายการต่อบรรทัด)</p>
            <STextarea rows={6} value={bulkText} onChange={e => setBulkText(e.target.value)} placeholder={"ACC001\nACC002\nACC003"}/>
            <button onClick={addStock} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Plus className="w-4 h-4"/>}
              เพิ่มสต็อก
            </button>
          </div>
          <div className="border-t border-[#252836] pt-4">
            <p className="text-xs font-semibold text-[#7c7f96] uppercase tracking-wider mb-3">สต็อกคงเหลือ ({stocks.length} รายการ)</p>
            {loading ? (
              <div className="flex justify-center py-6"><span className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"/></div>
            ) : stocks.length === 0 ? (
              <p className="text-sm text-[#7c7f96] text-center py-4">ยังไม่มีสต็อก</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {stocks.map(s => (
                  <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#111320] border border-[#252836]">
                    <Database className="w-3.5 h-3.5 text-[#464960] flex-shrink-0"/>
                    <span className="flex-1 text-sm font-mono text-green-400 truncate">{s.content}</span>
                    <button onClick={() => delStock(s.id)} className="p-1 rounded hover:bg-red-500/20 text-[#7c7f96] hover:text-red-400 transition-colors flex-shrink-0"><Trash2 className="w-3 h-3"/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    <ConfirmSaveDialog open={!!delConfirmId} title="ยืนยันการลบสต็อก?" body="รายการสต็อกนี้จะถูกลบออกจากระบบถาวร" onConfirm={confirmDelStock} onCancel={() => setDelConfirmId(null)} />
    </motion.div>
  );
}

function ProductsSettings({ products, setProducts, categories, toast }: any) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string|null>(null);
  const [f, setF] = useState<Omit<Product,"id">>(emptyProduct);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [delId, setDelId] = useState<string|null>(null);
  const [stockProduct, setStockProduct] = useState<Product|null>(null);

  const filtered = products.filter((p: Product) => p.name.toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice((page-1)*PER, page*PER);

  function catName(id?: string) { return categories.find((c: Category) => c.id === id)?.name || "—"; }

  function openCreate() { setEditing(null); setF(emptyProduct); setModalOpen(true); }
  function openEdit(p: Product) {
    setEditing(p.id);
    setF({ name: p.name, category_id: p.category_id, description: p.description, image_url: p.image_url, real_price: p.real_price, fake_price: p.fake_price||0, show_fake_price: p.show_fake_price||false, hot_badge: p.hot_badge||false, is_featured: p.is_featured||false, product_type: p.product_type||"ได้ของทันที", sort_order: p.sort_order||0 });
    setModalOpen(true);
  }

  async function actualSave() {
    if (!f.name) { toast({ title: "ใส่ชื่อสินค้าก่อน", variant: "destructive" }); return; }
    try {
      if (editing) {
        const updated = await api.patch(`/products/${editing}`, f);
        setProducts(products.map((p: Product) => p.id === editing ? updated : p));
      } else {
        const created = await api.post("/products", f);
        setProducts([...products, created]);
      }
      setModalOpen(false); setSuccessOpen(true);
    } catch { toast({ title: "บันทึกล้มเหลว", variant: "destructive" }); }
  }

  async function confirmDel() {
    if (!delId) return;
    try {
      await api.delete(`/products/${delId}`);
      setProducts(products.filter((p: Product) => p.id !== delId));
      toast({ title: "ลบสินค้าแล้ว" });
    } catch { toast({ title: "ลบล้มเหลว", variant: "destructive" }); }
    setDelId(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <STitle>จัดการสินค้า</STitle>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"><Plus className="w-4 h-4"/>+ เพิ่มสินค้า</button>
      </div>

      <PCard className="overflow-hidden">
        <div className="p-4 border-b border-[#252836]">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7f96]"/><SInput className="pl-9" placeholder="ค้นหาสินค้า..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[#252836]">
              {["#","รูป","ชื่อสินค้า","ราคา","ราคาปลอม","ประเภท","หมวดหมู่","ยอดฮิต","จัดการ"].map(h => (
                <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-[#7c7f96] uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-[#252836]">
              {paged.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-[#7c7f96]">ไม่พบสินค้า</td></tr>
              )}
              {paged.map((p: Product, i: number) => (
                <tr key={p.id} className="hover:bg-[#111320] transition-colors">
                  <td className="px-3 py-3 text-xs text-[#7c7f96]">{(page-1)*PER+i+1}</td>
                  <td className="px-3 py-3">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-[#252836]" onError={e => { (e.target as HTMLImageElement).src = ""; }}/>
                      : <div className="w-10 h-10 rounded-lg bg-[#252836] flex items-center justify-center"><Package className="w-4 h-4 text-[#464960]"/></div>
                    }
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-sm font-semibold text-white max-w-[140px] truncate">{p.name}</p>
                    {p.hot_badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">HOT</span>}
                  </td>
                  <td className="px-3 py-3 text-sm font-bold text-green-400 whitespace-nowrap">฿{p.real_price.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-[#7c7f96] whitespace-nowrap">
                    {p.show_fake_price && p.fake_price ? <span className="line-through text-red-400/70">฿{p.fake_price.toLocaleString()}</span> : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap ${p.product_type === "สุ่มสินค้า" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>{p.product_type||"ได้ของทันที"}</span>
                  </td>
                  <td className="px-3 py-3 text-xs text-[#7c7f96] whitespace-nowrap">{catName(p.category_id)}</td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${p.hot_badge ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-[#252836] text-[#7c7f96] border-[#252836]"}`}>{p.hot_badge ? "เปิด" : "ปิด"}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => openEdit(p)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-[11px] font-medium transition-colors whitespace-nowrap"><Edit2 className="w-3 h-3"/>แก้ไข</button>
                      <button onClick={() => setStockProduct(p)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[11px] font-medium transition-colors whitespace-nowrap"><Database className="w-3 h-3"/>สต็อก</button>
                      <button onClick={() => setDelId(p.id)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-medium transition-colors"><Trash2 className="w-3 h-3"/>ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3"><Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage}/></div>
      </PCard>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              className="bg-[#1c1e2e] border border-[#252836] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-5 border-b border-[#252836] flex items-center justify-between sticky top-0 bg-[#1c1e2e] z-10">
                <h3 className="font-bold text-white">{editing ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-[#252836] text-[#7c7f96]"><X className="w-4 h-4"/></button>
              </div>
              <div className="p-5 space-y-4">
                <FRow label="ชื่อสินค้า"><SInput value={f.name} onChange={e => setF(x => ({...x, name: e.target.value}))} placeholder="ชื่อสินค้า..."/></FRow>
                <FRow label="ลิงก์รูปภาพ"><SInput value={f.image_url||""} onChange={e => setF(x => ({...x, image_url: e.target.value}))} placeholder="https://..."/></FRow>
                <FRow label="รายละเอียดสินค้า"><STextarea rows={3} value={f.description||""} onChange={e => setF(x => ({...x, description: e.target.value}))} placeholder="รายละเอียด..."/></FRow>
                <div className="grid grid-cols-2 gap-4">
                  <FRow label="ราคาสินค้า (฿)"><SInput type="number" value={f.real_price} onChange={e => setF(x => ({...x, real_price: Number(e.target.value)}))}/></FRow>
                  <FRow label="ราคาปลอม (฿)"><SInput type="number" value={f.fake_price||0} onChange={e => setF(x => ({...x, fake_price: Number(e.target.value)}))}/></FRow>
                </div>
                <FRow label="ประเภทสินค้า">
                  <SSelect value={f.product_type||"ได้ของทันที"} onChange={v => setF(x => ({...x, product_type: v}))}>
                    <option value="ได้ของทันที">ได้ของทันที</option>
                    <option value="สุ่มสินค้า">สุ่มสินค้า</option>
                  </SSelect>
                </FRow>
                <FRow label="หมวดหมู่สินค้า">
                  <SSelect value={f.category_id||""} onChange={v => setF(x => ({...x, category_id: v}))}>
                    <option value="">เลือกหมวดหมู่</option>
                    {categories.map((c: Category) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </SSelect>
                </FRow>
                <SToggle checked={f.show_fake_price||false} onChange={v => setF(x => ({...x, show_fake_price: v}))} label="เปิด/ปิด ราคาปลอม"/>
                <SToggle checked={f.hot_badge||false} onChange={v => setF(x => ({...x, hot_badge: v}))} label="ยอดฮิต (เปิด/ปิด)"/>
                <SToggle checked={f.is_featured||false} onChange={v => setF(x => ({...x, is_featured: v}))} label="แสดงในหน้าหลัก"/>
                <div className="flex gap-3 pt-2">
                  <SaveBtn onClick={() => { setModalOpen(false); setConfirmOpen(true); }} label="บันทึกข้อมูล"/>
                  <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-[#252836] text-[#7c7f96] text-sm hover:text-white transition-colors">ยกเลิก</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Modal */}
      <AnimatePresence>
        {stockProduct && <StockModal product={stockProduct} onClose={() => setStockProduct(null)}/>}
      </AnimatePresence>

      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); actualSave(); }} onCancel={() => { setConfirmOpen(false); setModalOpen(true); }}/>
      <SaveSuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)}/>
      <ConfirmSaveDialog open={!!delId} title="ยืนยันการลบ ?" body="สินค้านี้จะถูกลบออกจากระบบถาวร (สต็อกจะถูกลบด้วย)" onConfirm={confirmDel} onCancel={() => setDelId(null)}/>
    </div>
  );
}

/* ─────────────────────────────────────────────
   USERS
───────────────────────────────────────────── */
function UsersSettings({ users, setUsers, toast }: any) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile|null>(null);
  const [f, setF] = useState({ username: "", password: "", balance: 0, total_topup: 0, is_admin: false });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [delId, setDelId] = useState<string|null>(null);

  const filtered = users.filter((u: UserProfile) => u.username.toLowerCase().includes(search.toLowerCase()) || (u.email||"").toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice((page-1)*PER, page*PER);

  function openEdit(u: UserProfile) {
    setEditUser(u);
    setF({ username: u.username, password: "", balance: u.balance, total_topup: u.total_topup||0, is_admin: u.is_admin });
    setModalOpen(true);
  }

  async function actualSave() {
    if (!editUser) return;
    const body: Record<string, unknown> = { username: f.username, balance: f.balance, total_topup: f.total_topup, is_admin: f.is_admin };
    if (f.password) body.password = f.password;
    try {
      const updated = await api.patch(`/users/${editUser.id}`, body);
      setUsers(users.map((u: UserProfile) => u.id === editUser.id ? { ...u, ...updated } : u));
      setModalOpen(false); setSuccessOpen(true);
    } catch { toast({ title: "บันทึกล้มเหลว", variant: "destructive" }); }
  }

  async function confirmDel() {
    if (!delId) return;
    try {
      await api.delete(`/users/${delId}`);
      setUsers(users.filter((u: UserProfile) => u.id !== delId));
      toast({ title: "ลบผู้ใช้แล้ว" });
    } catch { toast({ title: "ลบล้มเหลว", variant: "destructive" }); }
    setDelId(null);
  }

  return (
    <div className="space-y-5">
      <STitle>จัดการผู้ใช้งาน</STitle>

      <PCard className="overflow-hidden">
        <div className="p-4 border-b border-[#252836]">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7f96]"/><SInput className="pl-9" placeholder="ค้นหาผู้ใช้..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[#252836]">
              {["#","ชื่อผู้ใช้","เงินคงเหลือ","ยอดเติมเงิน","ยศ","จัดการ"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#7c7f96] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-[#252836]">
              {paged.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[#7c7f96]">ไม่พบผู้ใช้</td></tr>
              )}
              {paged.map((u: UserProfile, i: number) => (
                <tr key={u.id} className="hover:bg-[#111320] transition-colors">
                  <td className="px-4 py-3 text-xs text-[#7c7f96]">{(page-1)*PER+i+1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-400">{u.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{u.username}</p>
                        {u.email && <p className="text-[10px] text-[#7c7f96]">{u.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-green-400">฿{u.balance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-blue-400">฿{(u.total_topup||0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${u.is_admin ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-[#252836] text-[#7c7f96] border-[#252836]"}`}>{u.is_admin ? "แอดมิน" : "ลูกค้า"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(u)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs font-medium transition-colors"><UserCog className="w-3 h-3"/>แก้ไข</button>
                      <button onClick={() => setDelId(u.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors"><Trash2 className="w-3 h-3"/>ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3"><Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage}/></div>
      </PCard>

      {/* Edit User Modal */}
      <AnimatePresence>
        {modalOpen && editUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              className="bg-[#1c1e2e] border border-[#252836] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-5 border-b border-[#252836] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">แก้ไขผู้ใช้งาน</h3>
                  <p className="text-xs text-[#7c7f96]">{editUser.username}</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-[#252836] text-[#7c7f96]"><X className="w-4 h-4"/></button>
              </div>
              <div className="p-5 space-y-4">
                <FRow label="ชื่อผู้ใช้งาน">
                  <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2"><Shield className="w-4 h-4 text-[#464960]"/></span>
                  <SInput className="pl-9" value={f.username} onChange={e => setF(x => ({...x, username: e.target.value}))}/></div>
                </FRow>
                <FRow label="รหัสผ่าน (เว้นว่างไว้เพื่อไม่เปลี่ยน)">
                  <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2"><KeyRound className="w-4 h-4 text-[#464960]"/></span>
                  <SInput type="password" className="pl-9" value={f.password} onChange={e => setF(x => ({...x, password: e.target.value}))} placeholder="รหัสผ่านใหม่..."/></div>
                </FRow>
                <div className="grid grid-cols-2 gap-4">
                  <FRow label="เงินคงเหลือ (฿)"><SInput type="number" value={f.balance} onChange={e => setF(x => ({...x, balance: Number(e.target.value)}))}/></FRow>
                  <FRow label="ยอดเติมเงิน (฿)"><SInput type="number" value={f.total_topup} onChange={e => setF(x => ({...x, total_topup: Number(e.target.value)}))}/></FRow>
                </div>
                <FRow label="ยศผู้ใช้งาน">
                  <SSelect value={f.is_admin ? "admin" : "customer"} onChange={v => setF(x => ({...x, is_admin: v === "admin"}))}>
                    <option value="customer">ลูกค้า</option>
                    <option value="admin">แอดมิน</option>
                  </SSelect>
                </FRow>
                <div className="flex gap-3 pt-2">
                  <SaveBtn onClick={() => { setModalOpen(false); setConfirmOpen(true); }} label="บันทึกข้อมูล"/>
                  <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-[#252836] text-[#7c7f96] text-sm hover:text-white transition-colors">ยกเลิก</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmSaveDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); actualSave(); }} onCancel={() => { setConfirmOpen(false); setModalOpen(true); }}/>
      <SaveSuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)}/>
      <ConfirmSaveDialog open={!!delId} title="ยืนยันการลบ ?" body="ผู้ใช้นี้จะถูกลบออกจากระบบถาวร" onConfirm={confirmDel} onCancel={() => setDelId(null)}/>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ORDERS / TOPUPS HISTORY
───────────────────────────────────────────── */
function OrdersHistory({ orders }: { orders: Order[] }) {
  const [view, setView] = useState<Order|null>(null);
  const [copied, setCopied] = useState(false);
  function copy(text:string) { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  return (
    <div className="space-y-5">
      <STitle>ประวัติการซื้อสินค้า</STitle>
      <PCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[#252836]">
              {["สินค้า","ราคา","วันที่",""].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#7c7f96] uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-[#252836]">
              {orders.map(o=>(
                <tr key={o.id} className="hover:bg-[#111320] transition-colors">
                  <td className="px-4 py-3 text-sm text-white font-medium max-w-[180px] truncate">{o.product_name}</td>
                  <td className="px-4 py-3 text-sm text-green-400 font-semibold">฿{o.price_paid.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-[#7c7f96]">{new Date(o.created_at).toLocaleDateString("th-TH")}</td>
                  <td className="px-4 py-3"><button onClick={()=>setView(o)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"><Eye className="w-3 h-3"/>ดูข้อมูล</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PCard>
      <AnimatePresence>
        {view && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={()=>setView(null)}>
            <motion.div initial={{scale:0.92}} animate={{scale:1}} exit={{scale:0.92}} className="bg-[#1c1e2e] border border-[#252836] rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">ข้อมูล Account</h3>
                <button onClick={()=>setView(null)} className="p-1.5 rounded-lg hover:bg-[#252836] text-[#7c7f96]"><X className="w-4 h-4"/></button>
              </div>
              <p className="text-sm font-semibold text-white mb-1">{view.product_name}</p>
              <p className="text-xs text-[#7c7f96] mb-3">฿{view.price_paid.toLocaleString()} • {new Date(view.created_at).toLocaleDateString("th-TH")}</p>
              <pre className="p-4 rounded-xl bg-[#111320] border border-[#252836] text-sm font-mono text-green-400 whitespace-pre-wrap break-all mb-4">{view.delivered_data}</pre>
              <button onClick={()=>copy(view.delivered_data)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#252836] hover:border-blue-500/40 text-sm text-white transition-colors">
                {copied?<><Check className="w-4 h-4 text-green-400"/>Copied!</>:<><Copy className="w-4 h-4"/>คัดลอก</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TopupsHistory({ topups }: { topups: TopupLog[] }) {
  return (
    <div className="space-y-5">
      <STitle>ประวัติการเติมเงิน</STitle>
      <PCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[#252836]">
              {["ช่องทาง","จำนวน","สถานะ","วันที่"].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#7c7f96] uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-[#252836]">
              {topups.map(t=>(
                <tr key={t.id} className="hover:bg-[#111320] transition-colors">
                  <td className="px-4 py-3 text-sm text-white">{t.method}</td>
                  <td className="px-4 py-3 text-sm text-green-400 font-semibold">+฿{t.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${t.status==="success"?"bg-green-500/20 text-green-400":t.status==="pending"?"bg-yellow-500/20 text-yellow-400":"bg-red-500/20 text-red-400"}`}>{t.status}</span></td>
                  <td className="px-4 py-3 text-xs text-[#7c7f96]">{new Date(t.created_at).toLocaleDateString("th-TH")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PCard>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN ADMIN COMPONENT
══════════════════════════════════════════════ */
export default function Admin() {
  const { currentUser, cmsConfig, setCmsConfig, isMockMode } = useApp();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["website"]));
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  const [products,      setProducts]      = useState<Product[]>([]);
  const [categories,    setCategories]    = useState<Category[]>([]);
  const [sliders,       setSliders]       = useState<Slider[]>([]);
  const [bankConfigs,   setBankConfigs]   = useState<BankConfig[]>([]);
  const [walletConfigs, setWalletConfigs] = useState<WalletConfig[]>([]);
  const [allOrders,     setAllOrders]     = useState<Order[]>([]);
  const [allTopups,     setAllTopups]     = useState<TopupLog[]>([]);
  const [users,         setUsers]         = useState<UserProfile[]>([]);
  const [topupRequests, setTopupRequests] = useState<TopupRequest[]>([]);
  const [redeemCodes,   setRedeemCodes]   = useState<RedeemCode[]>([]);

  useEffect(() => { if (!currentUser?.is_admin) setLocation("/"); }, [currentUser]);

  useEffect(() => {
    api.get("/products").then(d => { if (Array.isArray(d)) setProducts(d); }).catch(() => {});
    api.get("/categories").then(d => { if (Array.isArray(d)) setCategories(d); }).catch(() => {});
    api.get("/sliders").then(d => { if (d?.length) setSliders(d); }).catch(() => {});
    api.get("/bank-configs").then(d => { if (d?.length) setBankConfigs(d); }).catch(() => {});
    api.get("/wallet-configs").then(d => { if (d?.length) setWalletConfigs(d); }).catch(() => {});
    api.get("/orders").then(d => { if (d?.length) setAllOrders(d); }).catch(() => {});
    api.get("/topups").then(d => { if (d?.length) setAllTopups(d); }).catch(() => {});
    api.get("/users").then(d => { if (d?.length) setUsers(d); }).catch(() => {});
    api.get("/topup-requests").then(d => { if (d?.length) setTopupRequests(d); }).catch(() => {});
    api.get("/redeem-codes").then(d => { if (d?.length) setRedeemCodes(d); }).catch(() => {});
  }, []);

  function toggleGroup(id:string) {
    setOpenGroups(prev=>{ const n=new Set(prev); if(n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function goTo(t:Tab) {
    setTab(t);
    for (const e of NAV) if(e.type==="group" && e.items.some(i=>i.id===t)) setOpenGroups(prev=>new Set([...prev,e.id]));
    if (window.innerWidth < 768) setSidebarOpen(false);
  }

  if (!currentUser?.is_admin) return null;

  const sp = { isMockMode, cmsConfig, setCmsConfig, toast };

  function renderContent() {
    switch (tab) {
      case "dashboard":      return <Dashboard orders={allOrders} topups={allTopups}/>;
      case "website":        return <WebsiteSettings {...sp}/>;
      case "navbar":         return <NavbarSettings {...sp}/>;
      case "homepage":       return <HomepageSettings {...sp}/>;
      case "theme":          return <ThemeSettings {...sp}/>;
      case "news":           return <NewsSettings toast={toast}/>;
      case "popup":          return <PopupSettings {...sp}/>;
      case "quicklinks":     return <QuickLinksSettings toast={toast}/>;
      case "sliders":        return <SlidersSettings isMockMode={isMockMode} sliders={sliders} setSliders={setSliders} toast={toast}/>;
      case "particle":       return <ParticleSettings {...sp}/>;
      case "login-page":     return <LoginPageSettings {...sp}/>;
      case "topup-approval": return <TopupApproval isMockMode={isMockMode} topupRequests={topupRequests} setTopupRequests={setTopupRequests} users={users} setUsers={setUsers} toast={toast}/>;
      case "wallet-config":  return <WalletSettings isMockMode={isMockMode} walletConfigs={walletConfigs} setWalletConfigs={setWalletConfigs} toast={toast}/>;
      case "bank-config":    return <BankSettings isMockMode={isMockMode} bankConfigs={bankConfigs} setBankConfigs={setBankConfigs} toast={toast}/>;
      case "redeem-codes":   return <RedeemCodesSettings isMockMode={isMockMode} redeemCodes={redeemCodes} setRedeemCodes={setRedeemCodes} toast={toast}/>;
      case "all-orders":     return <OrdersHistory orders={allOrders}/>;
      case "all-topups":     return <TopupsHistory topups={allTopups}/>;
      case "categories":     return <CategoriesSettings isMockMode={isMockMode} categories={categories} setCategories={setCategories} toast={toast}/>;
      case "products":       return <ProductsSettings isMockMode={isMockMode} products={products} setProducts={setProducts} categories={categories} toast={toast}/>;
      case "users":          return <UsersSettings isMockMode={isMockMode} users={users} setUsers={setUsers} toast={toast}/>;
      default: return null;
    }
  }

  const currentLabel = NAV.flatMap(e => e.type==="single"?[{id:e.id,label:e.label}]:e.items).find(i=>i.id===tab)?.label || "Admin Panel";

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="flex h-screen bg-[#0d0f1a] overflow-hidden" style={{fontFamily:"'Inter','Kanit',sans-serif"}}>

      {/* ══ MOBILE BACKDROP ══ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══ SIDEBAR ══ */}
      <aside className={`
        flex-shrink-0 flex flex-col bg-[#11131f] border-r border-[#1e2030] transition-all duration-300
        fixed md:relative inset-y-0 left-0 z-30
        ${sidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:w-0 md:overflow-hidden md:translate-x-0"}
      `}>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#1e2030]">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/25">
            <span className="text-white text-xs font-bold leading-none">(o)</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-tight">Admin Panel</p>
            <p className="text-[10px] text-[#6c6f85]">จัดการระบบ</p>
          </div>
          <button onClick={()=>setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-[#1e2030] text-[#6c6f85] hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4"/>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
          {NAV.map(entry => {
            if (entry.type === "single") {
              const active = tab === entry.id;
              return (
                <button key={entry.id} onClick={()=>goTo(entry.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active?"bg-[#1a1d30] text-white":"text-[#6c6f85] hover:text-white hover:bg-[#161826]"}`}>
                  <entry.icon className={`w-4 h-4 flex-shrink-0 ${active?"text-blue-400":""}`}/>
                  {entry.label}
                </button>
              );
            }
            const isOpen = openGroups.has(entry.id);
            const hasActive = entry.items.some(i=>i.id===tab);
            return (
              <div key={entry.id}>
                <button onClick={()=>toggleGroup(entry.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${hasActive?"text-white":"text-[#6c6f85] hover:text-white hover:bg-[#161826]"}`}>
                  <entry.icon className={`w-4 h-4 flex-shrink-0 ${hasActive?"text-blue-400":""}`}/>
                  <span className="flex-1 text-left">{entry.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform flex-shrink-0 ${isOpen?"":"rotate-[-90deg]"}`}/>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.16}} className="overflow-hidden">
                      <div className="ml-4 pl-3 border-l border-[#1e2030] py-1 space-y-0.5">
                        {entry.items.map(item=>(
                          <button key={item.id} onClick={()=>goTo(item.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${tab===item.id?"text-white bg-[#1a1d30]":"text-[#6c6f85] hover:text-white"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${tab===item.id?"bg-blue-400":"bg-[#3a3d52]"}`}/>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          <div className="pt-3 mt-1 border-t border-[#1e2030]">
            <button onClick={()=>setLocation("/")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#6c6f85] hover:text-white hover:bg-[#161826] transition-all">
              <Home className="w-4 h-4 flex-shrink-0"/>กลับหน้าร้าน
            </button>
          </div>
        </nav>
      </aside>

      {/* ══ MAIN AREA ══ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <div className="flex items-center gap-2 px-3 md:px-5 py-3 border-b border-[#1e2030] bg-[#11131f] flex-shrink-0">
          {/* hamburger — always show on mobile, show on desktop only when sidebar collapsed */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="p-2 rounded-xl hover:bg-[#1e2030] text-[#6c6f85] hover:text-white transition-colors flex-shrink-0 md:hidden"
          >
            <LayoutDashboard className="w-4 h-4"/>
          </button>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="hidden md:flex p-2 rounded-xl hover:bg-[#1e2030] text-[#6c6f85] hover:text-white transition-colors">
              <LayoutDashboard className="w-4 h-4"/>
            </button>
          )}
          <span className="text-sm font-semibold text-white flex-1 truncate">{currentLabel}</span>
          {topupRequests.filter(r=>r.status==="pending").length > 0 && (
            <button onClick={() => goTo("topup-approval")} className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-semibold hover:bg-yellow-500/30 transition-colors flex-shrink-0">
              <Clock className="w-3.5 h-3.5"/>
              <span className="hidden sm:inline">{topupRequests.filter(r=>r.status==="pending").length} รอตรวจสอบ</span>
              <span className="sm:hidden">{topupRequests.filter(r=>r.status==="pending").length}</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-xl bg-[#161826] border border-[#1e2030] flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0"/>
            <span className="text-xs text-[#6c6f85] hidden sm:inline">{currentUser.username}</span>
          </div>
        </div>

        {/* Content — pb-20 accounts for bottom tab bar on mobile */}
        <main className="flex-1 overflow-y-auto p-3 md:p-5 pb-24 md:pb-5">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.13}}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
