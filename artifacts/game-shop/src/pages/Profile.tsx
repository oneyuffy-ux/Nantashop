import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { User, Wallet, ShoppingBag, Eye, History, Settings, Copy, Check, CreditCard, LogOut, AlertCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Order, TopupLog } from "@/types";
import { ResultPopup } from "@/components/ShopPopups";

type Tab = "orders" | "topups" | "settings";

export default function Profile() {
  const { currentUser, logout, setCurrentUser } = useApp();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [topups, setTopups] = useState<TopupLog[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [profileResult, setProfileResult] = useState<"idle" | "loading" | "success">("idle");

  useEffect(() => {
    if (!currentUser) return;
    setNewUsername(currentUser.username);
    setNewAvatar(currentUser.avatar_url || "");
    setOrdersLoading(true);
    api.get(`/orders?user_id=${currentUser.id}`)
      .then((d: Order[]) => { setOrders(Array.isArray(d) ? d : []); })
      .catch(() => { setOrders([]); })
      .finally(() => setOrdersLoading(false));
    api.get(`/topups?user_id=${currentUser.id}`)
      .then((d: TopupLog[]) => { setTopups(Array.isArray(d) ? d : []); })
      .catch(() => { setTopups([]); });
  }, [currentUser]);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "คัดลอกแล้ว!" });
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSaveSettings() {
    if (!currentUser) return;
    setSavingSettings(true);
    setProfileResult("loading");
    try {
      await api.patch(`/users/${currentUser.id}`, { username: newUsername, avatar_url: newAvatar || null });
      setCurrentUser({ ...currentUser, username: newUsername, avatar_url: newAvatar || undefined });
      setProfileResult("success");
    } catch {
      setProfileResult("idle");
      toast({ title: "ไม่สามารถอัปเดตโปรไฟล์ได้", variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  }

  if (!currentUser) {
    return (
      <div className="shop-container page-bottom-pad pt-20 text-center max-w-4xl">
        <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">ยังไม่ได้เข้าสู่ระบบ</h2>
        <p className="text-muted-foreground mb-6">กรุณาเข้าสู่ระบบก่อน</p>
        <Button onClick={() => setLocation("/auth")}>เข้าสู่ระบบ</Button>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "orders", label: "ประวัติการซื้อ", icon: ShoppingBag },
    { id: "topups", label: "ประวัติการเติมเงิน", icon: History },
    { id: "settings", label: "ตั้งค่าบัญชี", icon: Settings },
  ];

  return (
    <div className="shop-container page-bottom-pad pt-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground" style={{ fontFamily: "'Orbitron', sans-serif" }}>บัญชีของฉัน</h1>
        <p className="text-muted-foreground text-sm mt-1">จัดการโปรไฟล์และดูประวัติการซื้อ</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            {currentUser.avatar_url ? (
              <img src={currentUser.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-primary/40" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Username</p>
              <h2 className="text-xl font-bold text-foreground" data-testid="text-username">{currentUser.username}</h2>
              {currentUser.is_admin && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 mt-1 inline-block">Admin</span>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">ยอดเงิน</p>
              <p className="text-3xl font-bold text-accent" style={{ fontFamily: "'Orbitron', sans-serif" }} data-testid="text-wallet-balance">
                ฿{currentUser.balance.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" className="flex-1" onClick={() => setLocation("/topup")}>
              <CreditCard className="w-3.5 h-3.5 mr-1" /> เติมเงิน
            </Button>
            <Button size="sm" variant="outline" onClick={() => { logout(); setLocation("/"); }} className="gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> ออกจากระบบ
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              tab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "orders" && (
          <motion.div key="orders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">ประวัติการซื้อสินค้า</h3>
                <span className="ml-auto text-xs text-muted-foreground">{orders.length} รายการ</span>
              </div>
              {ordersLoading ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                </div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">ยังไม่มีประวัติการซื้อ</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setLocation("/products")}>
                    ไปซื้อสินค้า
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {orders.map((order, i) => (
                    <motion.div key={order.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="px-6 py-4 flex items-center justify-between gap-4" data-testid={`row-order-${order.id}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{order.product_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(order.created_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-semibold text-foreground text-sm">฿{order.price_paid.toLocaleString()}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">สำเร็จ</span>
                        <Button size="sm" variant="outline" onClick={() => setViewOrder(order)} className="flex items-center gap-1.5" data-testid={`btn-view-order-${order.id}`}>
                          <Eye className="w-3.5 h-3.5" /> ดูข้อมูล
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === "topups" && (
          <motion.div key="topups" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <History className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">ประวัติการเติมเงิน</h3>
                <span className="ml-auto text-xs text-muted-foreground">{topups.length} รายการ</span>
              </div>
              {topups.length === 0 ? (
                <div className="py-16 text-center">
                  <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">ยังไม่มีประวัติการเติมเงิน</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setLocation("/topup")}>
                    เติมเงิน
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {topups.map((t, i) => (
                    <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="px-6 py-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{t.method}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(t.created_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-bold text-accent text-sm">+฿{t.amount.toLocaleString()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${t.status === "success" ? "bg-green-500/10 text-green-400 border-green-500/20" : t.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                          {t.status === "success" ? "สำเร็จ" : t.status === "pending" ? "รอดำเนินการ" : "ยกเลิก"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === "settings" && (
          <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h3 className="font-semibold text-foreground mb-2">ตั้งค่าบัญชี</h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">ชื่อผู้ใช้</label>
                <Input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Username ของคุณ" data-testid="input-new-username" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">URL รูปโปรไฟล์</label>
                <Input value={newAvatar} onChange={e => setNewAvatar(e.target.value)} placeholder="https://..." data-testid="input-new-avatar" />
                {newAvatar && <img src={newAvatar} alt="preview" className="w-16 h-16 rounded-full mt-3 object-cover border-2 border-border" />}
              </div>
              <div className="pt-2 flex items-center gap-3">
                <Button onClick={() => setSaveConfirmOpen(true)} disabled={savingSettings} className="gap-2" data-testid="btn-save-profile">
                  {savingSettings ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "บันทึกการเปลี่ยนแปลง"}
                </Button>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-3">โซนอันตราย</p>
                <Button variant="destructive" size="sm" onClick={() => { logout(); setLocation("/"); }} className="gap-2">
                  <LogOut className="w-4 h-4" /> ออกจากระบบ
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="sm:max-w-md bg-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-foreground">รายละเอียดสินค้าที่ซื้อ</DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">สินค้า:</span>
                <span className="font-medium text-foreground">{viewOrder.product_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ราคาที่จ่าย:</span>
                <span className="font-semibold text-primary">฿{viewOrder.price_paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">วันที่:</span>
                <span className="text-muted-foreground">{new Date(viewOrder.created_at).toLocaleString("th-TH")}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">ข้อมูลที่ได้รับ:</p>
                <pre className="p-4 rounded-lg bg-secondary border border-border text-sm font-mono text-accent whitespace-pre-wrap break-all" data-testid="text-delivered-data">
                  {viewOrder.delivered_data}
                </pre>
              </div>
              <Button className="w-full gap-2" variant="outline" onClick={() => handleCopy(viewOrder.delivered_data)} data-testid="btn-copy-account">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "คัดลอกแล้ว!" : "คัดลอกข้อมูล"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ResultPopup
        open={profileResult !== "idle"}
        loading={profileResult === "loading"}
        title="สำเร็จ"
        message="อัปเดตโปรไฟล์สำเร็จ !"
        onClose={() => setProfileResult("idle")}
      />
      {saveConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setSaveConfirmOpen(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: "3px solid #f97316", background: "rgba(249,115,22,0.08)" }}>
                <AlertCircle className="w-10 h-10 text-orange-500" />
              </div>
            </div>
            <h3 className="text-center text-2xl font-extrabold text-gray-800 mb-2" style={{ fontFamily: "Sarabun, sans-serif" }}>ยืนยันการบันทึก?</h3>
            <p className="text-center text-base text-gray-500 mb-4" style={{ fontFamily: "Sarabun, sans-serif" }}>ต้องการบันทึกการเปลี่ยนแปลงโปรไฟล์นี้ใช่ไหม?</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setSaveConfirmOpen(false); handleSaveSettings(); }}
                className="flex-1 h-12 font-bold text-base rounded-2xl text-white"
                style={{ background: "linear-gradient(135deg,#38bdf8,#0284c7)", fontFamily: "Sarabun, sans-serif" }}>
                ยืนยัน
              </button>
              <button
                onClick={() => setSaveConfirmOpen(false)}
                className="flex-1 h-12 font-bold text-base rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-colors"
                style={{ fontFamily: "Sarabun, sans-serif" }}>
                ยกเลิก
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
