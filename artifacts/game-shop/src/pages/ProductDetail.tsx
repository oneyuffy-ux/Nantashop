import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Home, ChevronRight, Flame, ShoppingCart, Package, Share2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Product, Category } from "@/types";

type ModalStep = "closed" | "confirm" | "loading" | "success";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const [, setLocation] = useLocation();
  const { currentUser, refreshUser } = useApp();
  const { toast } = useToast();

  const productId = params?.id ?? "";

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [step, setStep] = useState<ModalStep>("closed");
  const [buying, setBuying] = useState(false);

  /* keep a ref copy of product so handlePurchase never reads stale state */
  const productRef = useRef<Product | null>(null);
  productRef.current = product;

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    api.get(`/products/${productId}`)
      .then(async (data: Product) => {
        setProduct(data ?? null);
        if (data?.category_id) {
          try {
            const cats = await api.get("/categories") as Category[];
            setCategory(cats.find(c => c.id === data.category_id) ?? null);
          } catch {}
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  async function handlePurchase() {
    const snap = productRef.current;
    if (!currentUser || !snap) return;
    setStep("loading");
    setBuying(true);
    try {
      await api.post("/orders", { product_id: snap.id, qty });
      setStep("success");
      refreshUser().catch(() => {});
      api.get(`/products/${snap.id}`)
        .then((d: Product) => setProduct(d ?? null))
        .catch(() => {});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      toast({ title: msg, variant: "destructive" });
      setStep("closed");
    } finally {
      setBuying(false);
    }
  }

  function handleOk() {
    setStep("closed");
    setLocation("/profile");
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "คัดลอกลิงค์แล้ว!" });
  }

  /* use snapshot price for display in case product reloads */
  const displayProduct = productRef.current ?? product;
  const outOfStock = (product?.stock ?? 0) === 0;
  const discount = product?.show_fake_price && product?.fake_price
    ? Math.round((1 - product.real_price / product.fake_price) * 100)
    : null;

  if (loading) {
    return (
      <div className="shop-container page-bottom-pad pt-12 flex flex-col items-center gap-4 max-w-3xl">
        <div className="w-full h-72 rounded-2xl bg-card animate-pulse border border-border" />
        <div className="w-full h-8 rounded-xl bg-card animate-pulse border border-border" />
        <div className="w-2/3 h-6 rounded-xl bg-card animate-pulse border border-border" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="shop-container page-bottom-pad pt-20 text-center max-w-3xl">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">ไม่พบสินค้า</h2>
        <Button onClick={() => setLocation("/")} className="mt-4">กลับหน้าหลัก</Button>
      </div>
    );
  }

  return (
    <>
      <div className="shop-container page-bottom-pad pt-4 max-w-3xl">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 flex-wrap">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>หน้าหลัก</span>
          </button>
          {category && (
            <>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <button
                onClick={() => setLocation("/products")}
                className="hover:text-primary transition-colors"
              >
                {category.name}
              </button>
            </>
          )}
          <ChevronRight className="w-3 h-3 opacity-50" />
          <span className="text-foreground font-medium line-clamp-1 max-w-[160px]">{product.name}</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

          {/* ── Product Image ── */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-secondary mb-4" style={{ aspectRatio: "1/1" }}>
            <img
              src={product.image_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute top-3 left-3 flex gap-2">
              {product.hot_badge && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/90 text-white text-xs font-bold shadow">
                  <Flame className="w-3 h-3" /> ขายดี
                </span>
              )}
              {discount && (
                <span className="px-2.5 py-1 rounded-full bg-green-500/90 text-white text-xs font-bold shadow">
                  -{discount}%
                </span>
              )}
            </div>
          </div>

          {/* ── Share Row ── */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">แชร์ไปยังที่อื่น</span>
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 transition-all"
            >
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* ── Product Name & Category ── */}
          <h1 className="text-xl font-extrabold text-primary mb-1 leading-tight">{product.name}</h1>
          {category && (
            <p className="text-sm text-muted-foreground mb-3">หมวดหมู่: {category.name}</p>
          )}

          {/* ── Description ── */}
          {product.description && (
            <div className="rounded-xl border border-border bg-card p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 rounded-full bg-primary" />
                <span className="text-sm font-semibold text-foreground">รายละเอียดสินค้า</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {/* ── Price & Stock ── */}
          <div className="rounded-xl border border-border bg-card p-4 mb-4 flex items-center justify-between">
            <div>
              {product.show_fake_price && product.fake_price && (
                <p className="text-sm text-muted-foreground line-through mb-0.5">
                  ฿{product.fake_price.toLocaleString()}
                </p>
              )}
              <p className="text-3xl font-bold text-primary" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                ฿{product.real_price.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">สินค้าคงเหลือ</p>
              <p className={`text-lg font-bold ${outOfStock ? "text-red-400" : "text-green-400"}`}>
                {outOfStock ? "สินค้าหมด" : `${product.stock} ชิ้น`}
              </p>
            </div>
          </div>

          {/* ── Qty Selector ── */}
          {!outOfStock && (
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-2 block">
                กรอกจำนวนที่ต้องการสั่งซื้อ <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl border border-border bg-card text-foreground font-bold text-lg hover:border-primary/50 transition-colors flex items-center justify-center"
                >-</button>
                <span className="w-16 text-center font-bold text-xl text-foreground">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock ?? 1, q + 1))}
                  disabled={qty >= (product.stock ?? 0)}
                  className="w-10 h-10 rounded-xl border border-border bg-card text-foreground font-bold text-lg hover:border-primary/50 transition-colors flex items-center justify-center disabled:opacity-40"
                >+</button>
              </div>
            </div>
          )}

          {/* ── Total price ── */}
          {!outOfStock && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20 mb-5">
              <span className="text-sm text-muted-foreground">ราคารวม</span>
              <span className="text-2xl font-bold text-primary" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                ฿{(product.real_price * qty).toLocaleString()}
              </span>
            </div>
          )}

          {/* ── CTA ── */}
          {!currentUser ? (
            <Button onClick={() => setLocation("/auth")} className="w-full h-14 text-base font-semibold">
              เข้าสู่ระบบเพื่อซื้อสินค้า
            </Button>
          ) : outOfStock ? (
            <Button disabled className="w-full h-14 text-base font-semibold opacity-60">สินค้าหมด</Button>
          ) : (
            <Button
              onClick={() => setStep("confirm")}
              className="w-full h-14 text-base font-semibold shadow-xl shadow-primary/20 gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              ซื้อสินค้า
            </Button>
          )}
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════
          SINGLE PURCHASE MODAL  (confirm → success)
      ═══════════════════════════════════════ */}
      <AnimatePresence>
        {step !== "closed" && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => { if (step === "confirm") setStep("closed"); }}
          >
            <motion.div
              key="modal-box"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 320 }}
              className="bg-white rounded-3xl px-8 py-10 max-w-xs w-full shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">

                {/* ─── LOADING STEP ─── */}
                {step === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center py-6"
                  >
                    <svg className="w-20 h-20 animate-spin mb-6" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#e0f2fe" strokeWidth="6" />
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#0ea5e9" strokeWidth="6"
                        strokeDasharray="200" strokeDashoffset="150" strokeLinecap="round" />
                    </svg>
                    <h3 className="text-2xl font-extrabold text-gray-800 mb-1" style={{ fontFamily: "Sarabun, sans-serif" }}>สำเร็จ</h3>
                    <p className="text-gray-500 text-base font-semibold" style={{ fontFamily: "Sarabun, sans-serif" }}>กำลังดำเนินการ...</p>
                  </motion.div>
                )}

                {/* ─── CONFIRM STEP ─── */}
                {step === "confirm" && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-center mb-6">
                      <div className="w-24 h-24 rounded-full border-4 border-orange-400 bg-white flex items-center justify-center">
                        <span className="text-5xl font-black text-orange-400" style={{ lineHeight: 1 }}>!</span>
                      </div>
                    </div>

                    <h3 className="text-3xl font-bold text-gray-800 mb-5">ยืนยันการสั่งซื้อ?</h3>

                    <p className="text-gray-600 text-base mb-6">
                      {displayProduct?.name} {qty} ชิ้น ราคา {((displayProduct?.real_price ?? 0) * qty).toLocaleString()} บาท
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={handlePurchase}
                        disabled={buying || (currentUser?.balance ?? 0) < (displayProduct?.real_price ?? 0) * qty}
                        className="flex-1 h-14 rounded-2xl text-lg font-bold bg-sky-400 hover:bg-sky-500 active:bg-sky-600 text-white transition-colors disabled:opacity-50 flex items-center justify-center shadow-md shadow-sky-200"
                      >
                        {buying
                          ? <span className="inline-block w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : "ซื้อเลย"}
                      </button>
                      <button
                        onClick={() => setStep("closed")}
                        disabled={buying}
                        className="flex-1 h-14 rounded-2xl text-lg font-bold bg-red-500 hover:bg-red-600 active:bg-red-700 text-white transition-colors shadow-md shadow-red-200"
                      >
                        ยกเลิก
                      </button>
                    </div>

                    {currentUser && currentUser.balance < (displayProduct?.real_price ?? 0) * qty && (
                      <p className="text-xs text-red-400 mt-3">
                        ยอดเงินไม่เพียงพอ (มี ฿{currentUser.balance.toLocaleString()})
                      </p>
                    )}
                  </motion.div>
                )}

                {/* ─── SUCCESS STEP ─── */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-center mb-6">
                      <div className="w-24 h-24 rounded-full border-4 border-teal-400 bg-white flex items-center justify-center">
                        <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12">
                          <polyline
                            points="8,22 16,30 32,12"
                            stroke="#2dd4bf"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    <h3 className="text-4xl font-bold text-gray-800 mb-2">สำเร็จ</h3>
                    <p className="text-gray-400 text-base mb-8">ซื้อสินค้าสำเร็จ !</p>

                    <button
                      onClick={handleOk}
                      className="w-44 h-14 rounded-2xl text-lg font-bold bg-sky-400 hover:bg-sky-500 active:bg-sky-600 text-white transition-colors shadow-md shadow-sky-200"
                    >
                      ตกลง
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
