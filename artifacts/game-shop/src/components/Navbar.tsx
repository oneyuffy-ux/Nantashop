import { useLocation } from "wouter";
import {
  Home, ShoppingCart, Wallet, Gamepad2,
  Settings, History, ShieldCheck, LogOut, User, ChevronDown, Store
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useState } from "react";

export default function Navbar() {
  const { currentUser, cmsConfig, logout } = useApp();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  function go(path: string) {
    setLocation(path);
    setOpen(false);
  }

  const initials = currentUser?.username?.slice(0, 2).toUpperCase() ?? "NS";

  const topNavLinks = [
    { icon: Home,         label: "หน้าหลัก",   path: "/" },
    { icon: Store,        label: "ร้านค้า",      path: "/products" },
    { icon: Wallet,       label: "เติมเงิน",     path: "/topup" },
    { icon: History,      label: "ประวัติ",       path: "/profile" },
  ];

  const bottomTabs = [
    { icon: Home,         label: "หน้าหลัก",   path: "/" },
    { icon: Store,        label: "ร้านค้า",      path: "/products" },
    { icon: Wallet,       label: "เติมเงิน",     path: "/topup" },
    { icon: History,      label: "ประวัติ",       path: "/profile" },
    { icon: User,         label: "บัญชี",         path: "/auth" },
  ];

  const dropdownItems = [
    { icon: History,      label: "ออเดอร์ / ประวัติ",  path: "/profile" },
    { icon: Settings,     label: "ตั้งค่าบัญชี",        path: "/profile" },
  ];

  return (
    <>
      {/* ─── TOP NAVBAR ─── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="px-4 h-14 flex items-center justify-between max-w-screen-xl mx-auto gap-3">

          {/* Logo */}
          <button onClick={() => go("/")} className="flex items-center gap-2.5 flex-shrink-0">
            {cmsConfig.logo_url ? (
              <img
                src={cmsConfig.logo_url}
                alt={cmsConfig.site_name}
                className="h-9 w-9 rounded-xl object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#0ea5e9,#0369a1)" }}>
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
            )}
            <span
              className="hidden sm:block text-base font-extrabold text-foreground leading-none"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {cmsConfig.site_name || "NantaShop"}
            </span>
          </button>

          {/* Center: nav links (tablet+) */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {topNavLinks.map(({ icon: Icon, label, path }) => {
              const active = location === path;
              return (
                <button
                  key={path}
                  onClick={() => go(path)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Right: balance + profile dropdown */}
          <div className="relative ml-auto md:ml-0">
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-secondary border border-border hover:border-primary/50 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : currentUser ? (
                  <span className="text-[11px] font-bold text-primary">{initials}</span>
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )}
              </div>
              {currentUser && (
                <span className="text-xs font-bold neon-text hidden sm:inline">
                  🪙 {currentUser.balance.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {open && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 rounded-2xl border border-border bg-card shadow-2xl shadow-black/60 overflow-hidden z-50"
                  >
                    {currentUser ? (
                      <div className="px-4 py-3 border-b border-border bg-secondary/50">
                        <p className="text-sm font-bold text-foreground">{currentUser.username}</p>
                        <p className="text-xs neon-text font-semibold mt-0.5">
                          🪙 {currentUser.balance.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                        </p>
                      </div>
                    ) : (
                      <div className="px-4 py-3 border-b border-border bg-secondary/50">
                        <button
                          onClick={() => go("/auth")}
                          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
                        >
                          เข้าสู่ระบบ / สมัครสมาชิก
                        </button>
                      </div>
                    )}

                    <div className="py-1">
                      {dropdownItems.map(({ icon: Icon, label, path }) => (
                        <button key={label} onClick={() => go(path)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors">
                          <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          {label}
                        </button>
                      ))}

                      {currentUser?.is_admin && (
                        <>
                          <div className="border-t border-border my-1" />
                          <button onClick={() => go("/admin")}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors">
                            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                            หลังบ้าน (Admin)
                          </button>
                        </>
                      )}

                      {currentUser && (
                        <>
                          <div className="border-t border-border my-1" />
                          <button
                            onClick={() => { logout(); setOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4 flex-shrink-0" />
                            ออกจากระบบ
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* ─── BOTTOM TAB BAR (mobile only, hidden md+) ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
        <div className="flex items-stretch h-[60px]">
          {bottomTabs.map(({ icon: Icon, label, path }) => {
            const active = path === "/auth"
              ? !currentUser && location === path
              : location === path;
            return (
              <button
                key={path}
                onClick={() => path === "/auth" && currentUser ? go("/profile") : go(path)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${active ? "scale-110" : ""}`} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
                {active && <span className="absolute bottom-0 w-10 h-0.5 bg-primary rounded-full" style={{ marginBottom: "-1px" }} />}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
