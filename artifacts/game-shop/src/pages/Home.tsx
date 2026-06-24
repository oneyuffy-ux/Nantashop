import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Eye, Package, ShoppingBag, ChevronLeft, ChevronRight, Search, X, ShoppingCart } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Product, Category, Slider, Order, QuickLink } from "@/types";
import {
  mockSliders, mockQuickLinks,
  mockStats, mockAllOrders
} from "@/lib/mock-data";
import ProductCard from "@/components/ProductCard";

function formatThaiDate(iso: string) {
  const d = new Date(iso);
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const buddhistYear = d.getFullYear() - 1900 + 43;
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${months[d.getMonth()]} ${buddhistYear} – ${h}:${m} น.`;
}

function StatCard({ label, sublabel, value, icon }: { label: string; sublabel: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-border bg-card overflow-hidden p-4 md:p-5">
      <p className="text-xs text-foreground/70 mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-extrabold neon-text leading-tight mb-0.5">{value}</p>
      <p className="text-[11px] text-muted-foreground">{sublabel}</p>
      <div className="absolute right-2 bottom-0 opacity-[0.06] text-primary pointer-events-none select-none">
        {icon}
      </div>
    </div>
  );
}

function QuickLinkBtn({ title, imageUrl, onClick }: { title: string; imageUrl: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden aspect-[2/1] w-full border border-border hover:border-primary/40 transition-all group"
    >
      <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-1.5">
        <span className="text-[9px] text-white/60 font-medium">Nantashop</span>
        <span className="text-[9px] text-primary font-bold tracking-wide">▶ CLICK</span>
      </div>
      <div className="absolute inset-0 flex items-center justify-end pr-4">
        <span className="text-white font-extrabold text-base md:text-lg leading-tight drop-shadow-lg text-right" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          {title}
        </span>
      </div>
    </button>
  );
}

export default function Home() {
  const { cmsConfig } = useApp();
  const [, setLocation] = useLocation();

  const [sliders, setSliders] = useState<Slider[]>(mockSliders);
  const [sliderIdx, setSliderIdx] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>(mockAllOrders);
  const [search, setSearch] = useState("");
  const [stats] = useState(mockStats);
  const [realStats, setRealStats] = useState<{ total_users: number; total_products: number; total_orders: number; total_topup_amount: number } | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [noShowChecked, setNoShowChecked] = useState(false);
  const recentRef = useRef<HTMLDivElement>(null);
  const [recentPage, setRecentPage] = useState(0);
  const [quickLinks, setQuickLinks] = useState(mockQuickLinks);

  useEffect(() => {
    api.get("/sliders").then((d: Slider[]) => { if (d?.length) setSliders(d); }).catch(() => {});
    api.get("/categories").then((d: Category[]) => { if (Array.isArray(d)) setCategories(d); }).catch(() => {});
    api.get("/products").then((d: Product[]) => { if (Array.isArray(d)) setProducts(d); }).catch(() => {});
    api.get("/orders").then((d: Order[]) => { if (d?.length) setRecentOrders(d); }).catch(() => {});
    api.get("/admin/stats").then((d: typeof realStats) => { if (d) setRealStats(d); }).catch(() => {});
    api.get("/quick-links").then((d: typeof mockQuickLinks) => { if (d?.length) setQuickLinks(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!cmsConfig.enable_popup) return;
    const stored = localStorage.getItem("popup_hide_until");
    if (stored && Date.now() < parseInt(stored)) return;
    const t = setTimeout(() => setPopupOpen(true), 800);
    return () => clearTimeout(t);
  }, [cmsConfig.enable_popup]);

  function closePopup() {
    if (noShowChecked) localStorage.setItem("popup_hide_until", String(Date.now() + 60 * 60 * 1000));
    setPopupOpen(false);
  }

  useEffect(() => {
    if (!sliders.length) return;
    const t = setInterval(() => setSliderIdx(i => (i + 1) % sliders.length), 5000);
    return () => clearInterval(t);
  }, [sliders.length]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const RECENT_VISIBLE = 4;
  const recentMaxPage = Math.max(0, Math.ceil(recentOrders.length / RECENT_VISIBLE) - 1);

  return (
    <div className="min-h-screen bg-background page-bottom-pad">

      {/* Popup */}
      <AnimatePresence>
        {cmsConfig.enable_popup && popupOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
              className="relative bg-card border border-border rounded-2xl max-w-sm w-full shadow-2xl shadow-black/80 overflow-hidden"
            >
              <div className="w-full bg-secondary aspect-square">
                <img
                  src={cmsConfig.popup_image_url || products[0]?.image_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80"}
                  alt="promotion"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-between gap-3 bg-card">
                <button onClick={closePopup} className="px-5 py-2.5 rounded-full text-white font-bold text-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#0ea5e9,#0369a1)" }}>
                  ปิดหน้าต่าง
                </button>
                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground text-xs select-none">
                  <input type="checkbox" checked={noShowChecked} onChange={e => setNoShowChecked(e.target.checked)} className="w-4 h-4 rounded accent-primary" />
                  ไม่แสดงอีก 1 ชม.
                </label>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="shop-container pt-4 space-y-6">

        {/* ── Hero Slider ── */}
        {sliders.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden w-full bg-secondary" style={{ aspectRatio: "21/8" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={sliders[sliderIdx].id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0"
              >
                <img
                  src={sliders[sliderIdx].image_url}
                  alt={sliders[sliderIdx].title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => sliders[sliderIdx].link_url && setLocation(sliders[sliderIdx].link_url!)}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
                {sliders[sliderIdx].title && (
                  <div className="absolute bottom-4 left-4 right-8">
                    <p className="text-white text-sm md:text-base font-bold drop-shadow-lg line-clamp-2">{sliders[sliderIdx].title}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            {sliders.length > 1 && (
              <>
                <button onClick={() => setSliderIdx(i => (i - 1 + sliders.length) % sliders.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-all">
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button onClick={() => setSliderIdx(i => (i + 1) % sliders.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-all">
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-3 right-3 flex gap-1">
                  {sliders.map((_, i) => (
                    <button key={i} onClick={() => setSliderIdx(i)} className={`h-1.5 rounded-full transition-all ${i === sliderIdx ? "w-5 bg-primary" : "w-1.5 bg-white/30"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Announcement ── */}
        {cmsConfig.announcement && (
          <div className="rounded-xl border border-primary/30 bg-primary/10 overflow-hidden">
            <style>{`@keyframes marquee-scroll { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }`}</style>
            <div className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-xs font-bold text-primary whitespace-nowrap flex-shrink-0">📢 ประกาศ</span>
              <div className="overflow-hidden flex-1">
                <p className="text-xs text-primary font-medium whitespace-nowrap inline-block"
                  style={{ animation: "marquee-scroll 18s linear infinite" }}>
                  {cmsConfig.announcement}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="stat-grid">
          <StatCard label="สมาชิกทั้งหมด" sublabel="Users Registered"
            value={(realStats?.total_users ?? stats.total_users).toLocaleString()}
            icon={<Users size={90} />} />
          <StatCard label="ยอดเติมเงินรวม" sublabel="Total Top-up"
            value={`฿${(realStats?.total_topup_amount ?? 0).toLocaleString()}`}
            icon={<Eye size={90} />} />
          <StatCard label="สินค้าทั้งหมด" sublabel="Total Products"
            value={(realStats?.total_products ?? stats.ready_stock).toLocaleString()}
            icon={<Package size={90} />} />
          <StatCard label="ออเดอร์ทั้งหมด" sublabel="Total Orders"
            value={(realStats?.total_orders ?? stats.total_sales).toLocaleString()}
            icon={<ShoppingBag size={90} />} />
        </div>

        {/* ── Quick Links ── */}
        {quickLinks.length > 0 && (
          <div className="quicklink-grid">
            {quickLinks.map(ql => (
              <QuickLinkBtn key={ql.id} title={ql.title}
                imageUrl={(ql as QuickLink & { image_url?: string }).image_url || ""}
                onClick={() => setLocation(ql.target_page)} />
            ))}
          </div>
        )}

        {/* ── Categories ── */}
        {categories.filter(c => c.is_featured).length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⊞</span>
              <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Orbitron', sans-serif" }}>หมวดหมู่</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.filter(c => c.is_featured).map(cat => {
                const catProducts = products.filter(p => p.category_id === cat.id);
                return (
                  <button key={cat.id} onClick={() => setLocation("/products")}
                    className="w-full rounded-2xl border border-border bg-card overflow-hidden text-left hover:border-primary/40 transition-all group">
                    {cat.image_url && (
                      <img src={cat.image_url} alt={cat.name} className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{catProducts.length} สินค้า</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Products ── */}
        <section>
          <div className="flex items-start gap-2 mb-3">
            <span className="text-lg">🛒</span>
            <div>
              <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Orbitron', sans-serif" }}>สินค้าแนะนำ</h2>
              <p className="text-[11px] text-muted-foreground">Recommended Products</p>
            </div>
          </div>
          <div className="border-t border-border mb-4" />

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาสินค้า..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">ไม่พบสินค้า</div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* ── Recent Purchases — infinite auto-scroll slider ── */}
        {recentOrders.length > 0 && (
          <section>
            <style>{`
              @keyframes recent-scroll {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .recent-track {
                display: flex;
                gap: 0.75rem;
                width: max-content;
                animation: recent-scroll 22s linear infinite;
              }
              .recent-track:hover { animation-play-state: paused; }
            `}</style>

            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold neon-text" style={{ fontFamily: "'Orbitron', sans-serif" }}>การสั่งซื้อล่าสุด</h2>
              <span className="ml-auto text-[10px] text-muted-foreground">Real-time Purchase History</span>
            </div>
            <div className="border-t border-border my-3" />

            {/* Slider wrapper — clips overflow + adds fade edges */}
            <div className="relative overflow-hidden rounded-xl"
              style={{
                maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
              }}
            >
              {/* Track: items duplicated for seamless loop */}
              <div className="recent-track">
                {[...recentOrders, ...recentOrders].map((order, idx) => {
                  const prod = products.find(p => p.id === order.product_id);
                  const fallback = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&q=80";
                  return (
                    <div
                      key={`${order.id}-${idx}`}
                      className="flex-shrink-0 w-[140px] sm:w-[160px] rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors"
                    >
                      <div className="aspect-square bg-secondary overflow-hidden">
                        <img
                          src={prod?.image_url || order.product_image || fallback}
                          alt={order.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-[11px] font-semibold text-foreground line-clamp-2 leading-snug mb-1">{order.product_name}</p>
                        <p className="text-[10px] text-primary font-bold">฿{order.price_paid?.toLocaleString() ?? "—"}</p>
                        <p className="text-[9px] text-orange-400 mt-0.5 truncate">{formatThaiDate(order.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
