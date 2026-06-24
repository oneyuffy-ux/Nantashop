import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Link2, CheckCircle, AlertCircle, QrCode, Wallet, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { useLocation } from "wouter";
import { ConfirmPopup, ResultPopup } from "@/components/ShopPopups";

type Method = "slip" | "angpao" | "redeem";

export default function Topup() {
  const { currentUser, updateBalance } = useApp();
  const [, setLocation] = useLocation();
  const [method, setMethod] = useState<Method | null>(null);
  const [resultState, setResultState] = useState<{ loading: boolean; msg: string } | null>(null);

  const [slipPreview, setSlipPreview] = useState<string>("");
  const [slipConfirmOpen, setSlipConfirmOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [angpaoUrl, setAngpaoUrl] = useState("");
  const [angpaoConfirmOpen, setAngpaoConfirmOpen] = useState(false);

  const [redeemCode, setRedeemCode] = useState("");
  const [redeemConfirmOpen, setRedeemConfirmOpen] = useState(false);

  const [walletPhone, setWalletPhone] = useState("0812345678");
  const [bankList, setBankList] = useState<{ bank_name: string; account_number: string; account_name: string }[]>([
    { bank_name: "ธนาคารไทยพาณิชย์ (SCB)", account_number: "123-456-7890", account_name: "NantaShop Admin" },
  ]);

  useEffect(() => {
    api.get("/wallet-configs").then((d: { phone_number: string }[]) => { if (d?.[0]?.phone_number) setWalletPhone(d[0].phone_number); }).catch(() => {});
    api.get("/bank-configs").then((d: typeof bankList) => { if (d?.length) setBankList(d); }).catch(() => {});
  }, []);

  if (!currentUser) {
    return (
      <div className="shop-container page-bottom-pad pt-24 text-center max-w-lg">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h2 className="text-xl font-bold text-foreground mb-3">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-muted-foreground text-sm mb-6">เข้าสู่ระบบก่อนเติมเงิน</p>
          <Button onClick={() => setLocation("/auth")} className="w-full">เข้าสู่ระบบ / สมัครสมาชิก</Button>
        </div>
      </div>
    );
  }

  function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  function clearSlip() { setSlipPreview(""); if (fileRef.current) fileRef.current.value = ""; }

  async function handleSlipFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlipPreview(await readFile(file));
  }

  function submitSlip() {
    if (!slipPreview) return;
    setSlipConfirmOpen(true);
  }
  async function confirmSlip() {
    if (!currentUser) return;
    setSlipConfirmOpen(false);
    setResultState({ loading: true, msg: "กำลังตรวจสอบสลิป..." });
    try {
      const data = await api.post("/topup-requests/slip-verify", { slip_base64: slipPreview }) as { ok: boolean; amount?: number; new_balance?: number; ref?: string; };
      if (data.new_balance !== undefined) updateBalance(data.new_balance);
      setResultState({ loading: false, msg: `เติมเงินสำเร็จ! +฿${(data.amount ?? 0).toLocaleString()}` });
      clearSlip();
    } catch (err: unknown) {
      setResultState(null);
      alert("❌ " + (err instanceof Error ? err.message : "ตรวจสอบสลิปไม่สำเร็จ"));
    }
  }

  function submitAngpao() {
    if (!angpaoUrl || !angpaoUrl.includes("truemoney.com")) { alert("กรุณาใส่ลิ้งค์อั่งเปา TrueMoney ที่ถูกต้อง"); return; }
    setAngpaoConfirmOpen(true);
  }
  async function confirmAngpao() {
    if (!currentUser) return;
    setAngpaoConfirmOpen(false);
    setResultState({ loading: true, msg: "กำลังรับอั้งเปา..." });
    try {
      const data = await api.post("/angpao/redeem", { url: angpaoUrl }) as { amount: number; new_balance: number; };
      updateBalance(data.new_balance);
      setResultState({ loading: false, msg: `รับอั้งเปาสำเร็จ! +฿${data.amount.toLocaleString()}` });
      setAngpaoUrl("");
    } catch (err: unknown) {
      setResultState(null);
      alert("❌ " + (err instanceof Error ? err.message : "รับอั่งเปาไม่สำเร็จ"));
    }
  }

  function submitRedeem() {
    if (!redeemCode.trim()) { alert("กรุณาใส่โค้ดเติมเงิน"); return; }
    setRedeemConfirmOpen(true);
  }
  async function confirmRedeem() {
    if (!currentUser) return;
    setRedeemConfirmOpen(false);
    setResultState({ loading: true, msg: "กำลังใช้โค้ดเติมเงิน..." });
    try {
      const data = await api.post("/redeem-codes/use", { user_id: currentUser.id, code: redeemCode.trim().toUpperCase() });
      if (data?.new_balance !== undefined) updateBalance(data.new_balance);
      setResultState({ loading: false, msg: `เติมเงินสำเร็จ! +฿${data?.amount?.toLocaleString() ?? ""}` });
      setRedeemCode("");
    } catch (err: unknown) {
      setResultState(null);
      alert("❌ " + (err instanceof Error ? err.message : "โค้ดไม่ถูกต้อง"));
    }
  }

  const paymentCards = [
    {
      id: "angpao" as Method,
      label: "TrueMoney",
      sublabel: "ซองของขวัญอั้งเปา",
      status: "ปกติ",
      icon: (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1a3c5e,#0f2744)" }}>
          <Wallet className="w-7 h-7 text-blue-400" />
        </div>
      ),
      iconBg: "#0f2744",
    },
    {
      id: "redeem" as Method,
      label: "Redeem",
      sublabel: "กิฟโค้ดจากเว็บไซต์",
      status: "ปกติ",
      icon: (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3b1f3b,#2a0f2a)" }}>
          <Link2 className="w-7 h-7 text-pink-400" />
        </div>
      ),
    },
    {
      id: "slip" as Method,
      label: "SLIP CHECK",
      sublabel: "แนบสลิปการโอนเงิน",
      status: "ปกติ",
      icon: (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0f3b4c,#07263a)" }}>
          <QrCode className="w-7 h-7 text-cyan-400" />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#0a0d1a 0%,#0d1220 100%)" }}>
        <div className="shop-container page-bottom-pad pt-6 max-w-lg">

          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "#6b7280" }}>
              <button onClick={() => setLocation("/")} className="hover:text-blue-400 transition-colors">หน้าหลัก</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-blue-400">เติมเงิน</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Payment Methods</h1>
                <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>
                  ยอดเงิน:{" "}
                  <span className="font-bold text-blue-400">฿{currentUser.balance.toLocaleString()}</span>
                </p>
              </div>
              {method && (
                <button onClick={() => setMethod(null)} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-xl transition-colors hover:text-white" style={{ color: "#9ca3af", background: "rgba(255,255,255,0.06)" }}>
                  <ArrowLeft className="w-4 h-4" /> กลับ
                </button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!method ? (
              <motion.div key="cards" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                {paymentCards.map((card, i) => (
                  <motion.button key={card.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    onClick={() => setMethod(card.id)}
                    className="w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    {card.icon}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-base">{card.label}</p>
                      <p className="text-sm mt-0.5" style={{ color: "#9ca3af" }}>{card.sublabel}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                      style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}>
                      {card.status}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            ) : method === "slip" ? (
              <motion.div key="slip" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
                <div className="rounded-2xl border p-6 space-y-5" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.25)" }}>
                      <QrCode className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="font-bold text-white">SLIP CHECK</h2>
                      <p className="text-xs" style={{ color: "#9ca3af" }}>ระบบอ่าน QR อัตโนมัติ — เงินเข้าตามยอดจริง ไม่ต้องรอแอดมิน</p>
                    </div>
                  </div>

                  <div className="rounded-xl p-4 space-y-2 text-sm" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="font-semibold text-white">บัญชีรับโอนเงิน</p>
                    {bankList.map((b, i) => (
                      <div key={i} style={{ color: "#9ca3af" }}>
                        <span className="text-white font-medium">{b.bank_name}</span><br />
                        เลขบัญชี: <span className="font-mono font-bold text-cyan-400">{b.account_number}</span>
                        {b.account_name && <> — {b.account_name}</>}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">แนบสลิปการโอนเงิน <span className="text-red-400">*</span></label>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleSlipFileChange} />
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="w-full h-44 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors overflow-hidden"
                      style={{ borderColor: slipPreview ? "rgba(34,211,238,0.5)" : "rgba(255,255,255,0.15)" }}>
                      {slipPreview ? (
                        <img src={slipPreview} alt="slip" className="h-full w-full object-contain" />
                      ) : (
                        <>
                          <QrCode className="w-9 h-9" style={{ color: "#9ca3af" }} />
                          <span className="text-sm" style={{ color: "#9ca3af" }}>คลิกเพื่ออัพโหลดสลิป</span>
                          <span className="text-xs" style={{ color: "#6b7280" }}>PNG · JPG · JPEG — ถ่ายให้เห็น QR Code ชัดๆ</span>
                        </>
                      )}
                    </button>
                    {slipPreview && <button onClick={clearSlip} className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors">ลบรูปภาพ</button>}
                  </div>

                  {slipPreview && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      className="rounded-xl p-3 flex gap-2"
                      style={{ background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.2)" }}>
                      <QrCode className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs" style={{ color: "rgba(103,232,249,0.8)" }}>ระบบจะอ่านยอดเงิน บัญชีผู้รับ และเลขอ้างอิงจาก QR Code โดยอัตโนมัติ</p>
                    </motion.div>
                  )}

                  <button onClick={submitSlip} disabled={!slipPreview}
                    className="w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#06b6d4,#0284c7)" }}>
                    <CheckCircle className="w-4 h-4" /> ตรวจสอบสลิปอัตโนมัติ
                  </button>
                </div>

                <div className="rounded-xl p-4 flex gap-3" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs" style={{ color: "rgba(134,239,172,0.8)" }}>ระบบอ่าน QR Code จากสลิปโดยตรง เงินเข้าตามยอดที่โอนจริง ไม่ต้องรอแอดมิน</p>
                </div>
              </motion.div>
            ) : method === "angpao" ? (
              <motion.div key="angpao" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
                <div className="rounded-2xl border p-6 space-y-5" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}>
                      <Gift className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="font-bold text-white">ซองของขวัญอั่งเปา</h2>
                      <p className="text-xs" style={{ color: "#9ca3af" }}>TrueMoney Gift — เงินเด้งเข้าทันที ไม่ต้องรอแอดมิน</p>
                    </div>
                  </div>

                  <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="font-semibold text-white mb-1">เบอร์รับอั่งเปา TrueMoney</p>
                    <p className="text-2xl font-bold font-mono text-blue-400">{walletPhone}</p>
                    <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>ส่งซองอั่งเปาไปที่เบอร์นี้ แล้วนำ URL ที่ได้มาวางด้านล่าง</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">URL ซองอั่งเปา <span className="text-red-400">*</span></label>
                    <input type="url" value={angpaoUrl} onChange={e => setAngpaoUrl(e.target.value)}
                      placeholder="https://gift.truemoney.com/campaign/?v=..."
                      className="w-full px-4 py-3 rounded-xl text-sm font-mono focus:outline-none transition-colors"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                  </div>

                  <button onClick={submitAngpao}
                    className="w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
                    <Gift className="w-4 h-4" /> รับอั้งเปาอัตโนมัติ
                  </button>
                </div>

                <div className="rounded-xl p-4 flex gap-3" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs" style={{ color: "rgba(134,239,172,0.8)" }}>ระบบรับอั้งเปาอัตโนมัติ เงินเข้าวอเล็ทของคุณทันทีหลังกด ไม่ต้องรอแอดมิน</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="redeem" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
                <div className="rounded-2xl border p-6 space-y-5" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)" }}>
                      <Link2 className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <h2 className="font-bold text-white">กิฟโค้ดจากเว็บไซต์</h2>
                      <p className="text-xs" style={{ color: "#9ca3af" }}>Redeem Code — เพิ่มเงินทันทีเมื่อโค้ดถูกต้อง</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">โค้ดเติมเงิน <span className="text-red-400">*</span></label>
                    <input type="text" value={redeemCode} onChange={e => setRedeemCode(e.target.value.toUpperCase())}
                      placeholder="เช่น WELCOME100"
                      className="w-full px-4 py-3 rounded-xl text-sm font-mono tracking-widest uppercase focus:outline-none transition-colors"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
                      onKeyDown={e => { if (e.key === "Enter") submitRedeem(); }} />
                  </div>

                  <button onClick={submitRedeem}
                    className="w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
                    style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}>
                    <CheckCircle className="w-4 h-4" /> ใช้โค้ดเติมเงิน
                  </button>
                </div>

                <div className="rounded-xl p-4 flex gap-3" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs" style={{ color: "rgba(134,239,172,0.8)" }}>เมื่อโค้ดถูกต้อง เงินจะถูกเพิ่มเข้าบัญชีทันที ไม่ต้องรอแอดมิน</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmPopup open={slipConfirmOpen} title="ยืนยันการตรวจสอบสลิป" body="ระบบจะอ่าน QR Code จากสลิปและเติมเงินตามยอดที่โอนมาจริง" onConfirm={confirmSlip} onCancel={() => setSlipConfirmOpen(false)} />
      <ConfirmPopup open={angpaoConfirmOpen} title="ยืนยันการรับอั้งเปา" body="ระบบจะรับอั้งเปาและเพิ่มเงินเข้าวอเล็ทของคุณทันที" onConfirm={confirmAngpao} onCancel={() => setAngpaoConfirmOpen(false)} />
      <ConfirmPopup open={redeemConfirmOpen} title="ยืนยันการใช้โค้ด" body={`โค้ด: ${redeemCode} — เงินจะถูกเพิ่มเข้าบัญชีทันที`} onConfirm={confirmRedeem} onCancel={() => setRedeemConfirmOpen(false)} />
      <ResultPopup open={!!resultState} loading={resultState?.loading ?? false} message={resultState?.msg ?? ""} onClose={() => setResultState(null)} />
    </>
  );
}
