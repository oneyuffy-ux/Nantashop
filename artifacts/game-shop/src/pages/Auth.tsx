import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, LogIn, Store, ArrowLeft, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";
import { api, setAuthToken } from "@/lib/api";
import { UserProfile } from "@/types";

const loginSchema = z.object({
  username: z.string().min(1, "กรุณาใส่ Username"),
  password: z.string().min(6, "Password ต้องมีอย่างน้อย 6 ตัวอักษร"),
});
const registerSchema = z.object({
  username: z.string().min(3, "Username ต้องมีอย่างน้อย 3 ตัวอักษร"),
  password: z.string().min(6, "Password ต้องมีอย่างน้อย 6 ตัวอักษร"),
});
type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    delay: Math.random() * 4,
    dur: Math.random() * 3 + 2,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function SuccessPopup({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 280 }}
        className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center max-w-xs w-full"
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", damping: 14 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ border: "4px solid #0ea5e9" }}
        >
          <motion.svg viewBox="0 0 40 40" width="40" height="40">
            <motion.path d="M8 20 L16 28 L32 12" fill="none" stroke="#0ea5e9" strokeWidth="3.5"
              strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ delay: 0.25, duration: 0.45 }} />
          </motion.svg>
        </motion.div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2" style={{ fontFamily: "Sarabun, sans-serif" }}>สำเร็จ</h2>
        <p className="text-gray-500 text-sm text-center mb-6" style={{ fontFamily: "Sarabun, sans-serif" }}>{message}</p>
        <button onClick={onClose} className="w-full py-3 rounded-xl text-white font-bold text-base" style={{ background: "linear-gradient(135deg,#0ea5e9,#0284c7)", fontFamily: "Sarabun, sans-serif" }}>ตกลง</button>
      </motion.div>
    </motion.div>
  );
}

export default function Auth() {
  const [, setLocation] = useLocation();
  const { setCurrentUser, setGuestMode, cmsConfig } = useApp();
  const [view, setView] = useState<"splash" | "login" | "register">("splash");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema), defaultValues: { username: "", password: "" } });
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema), defaultValues: { username: "", password: "" } });

  async function handleLogin(data: LoginData) {
    setLoading(true);
    try {
      const user = await api.post("/auth/login", { username: data.username, password: data.password }) as UserProfile & { token?: string };
      if (user.token) setAuthToken(user.token);
      setCurrentUser(user);
      setSuccessMsg(`ยินดีต้อนรับกลับมา, ${user.username}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ";
      loginForm.setError("password", { message: msg });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(data: RegisterData) {
    setLoading(true);
    try {
      const user = await api.post("/auth/register", { username: data.username, password: data.password }) as UserProfile & { token?: string };
      if (user.token) setAuthToken(user.token);
      setCurrentUser(user);
      setSuccessMsg(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ, ${user.username}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "สมัครสมาชิกไม่สำเร็จ";
      registerForm.setError("username", { message: msg });
    } finally {
      setLoading(false);
    }
  }

  const siteName = cmsConfig?.site_name || "NantaShop";
  const siteDesc = cmsConfig?.site_description || "บริการจำหน่ายไอดีเกม";
  const logoUrl = cmsConfig?.logo_url || null;
  const themeColor = (cmsConfig as any)?.primary_color || "#7c3aed";
  const themeColorDark = themeColor + "90";

  return (
    <>
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${themeColor}40 0%, #0d0920 40%, #050510 100%)` }}>
        <StarField />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)` }} />
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${themeColor}cc 0%, transparent 70%)` }} />
        </div>

        <AnimatePresence mode="wait">

          {view === "splash" && (
            <motion.div key="splash"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="relative z-10 flex flex-col items-center gap-6 px-6 text-center max-w-sm w-full"
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", damping: 18 }}
                className="w-28 h-28 rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl"
                style={{ boxShadow: `0 0 40px ${themeColor}99`, background: "#1a0b3b" }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <Gamepad2 className="w-14 h-14 text-purple-300" />
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg" style={{ fontFamily: "'Orbitron','Kanit',sans-serif" }}>
                  {siteName}
                </h1>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <span className="inline-block px-5 py-2 rounded-full border text-sm font-medium text-white/80"
                  style={{ borderColor: `${themeColor}99`, background: `${themeColor}25` }}>
                  {siteDesc}
                </span>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-3 w-full mt-2"
              >
                <button
                  onClick={() => setView("login")}
                  className="flex flex-col items-center justify-center gap-2 py-5 px-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-95 hover:brightness-110"
                  style={{ background: `linear-gradient(135deg,${themeColor},${themeColor}bb)`, boxShadow: `0 4px 20px ${themeColor}66` }}
                >
                  <LogIn className="w-6 h-6" />
                  เข้าสู่ระบบเลย
                </button>
                <button
                  onClick={() => { setGuestMode(true); setLocation("/"); }}
                  className="flex flex-col items-center justify-center gap-2 py-5 px-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-95 hover:brightness-110"
                  style={{ background: "linear-gradient(135deg,#6d28d9,#4c1d95)", boxShadow: "0 4px 20px rgba(109,40,217,0.35)" }}
                >
                  <Store className="w-6 h-6" />
                  เยี่ยมชมร้านค้า
                </button>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                onClick={() => setView("register")}
                className="text-purple-300/70 text-sm hover:text-purple-200 transition-colors mt-1"
              >
                ยังไม่มีบัญชี? <span className="underline">สมัครสมาชิกฟรี</span>
              </motion.button>
            </motion.div>
          )}

          {(view === "login" || view === "register") && (
            <motion.div key="form"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="relative z-10 w-full max-w-md px-4"
            >
              <button onClick={() => setView("splash")} className="flex items-center gap-2 text-purple-300/70 hover:text-purple-200 text-sm mb-5 transition-colors">
                <ArrowLeft className="w-4 h-4" /> กลับ
              </button>

              <div className="rounded-2xl border p-8 shadow-2xl"
                style={{ borderColor: "rgba(124,58,237,0.3)", background: "rgba(13,9,32,0.85)", backdropFilter: "blur(16px)" }}
              >
                <div className="flex rounded-xl p-1 mb-6" style={{ background: "rgba(255,255,255,0.06)" }}>
                  {[["เข้าสู่ระบบ", "login"], ["สมัครสมาชิก", "register"]].map(([label, key]) => (
                    <button key={key} onClick={() => setView(key as "login" | "register")}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                      style={view === key
                        ? { background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", boxShadow: "0 2px 12px rgba(124,58,237,0.4)" }
                        : { color: "rgba(196,181,253,0.6)" }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {view === "login" ? (
                    <motion.form key="lf" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                      onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4"
                    >
                      <div>
                        <label className="text-sm text-purple-200/70 mb-1.5 block">Username</label>
                        <Input {...loginForm.register("username")} placeholder="ใส่ Username" autoComplete="username"
                          className="bg-white/5 border-purple-800/50 text-white placeholder:text-white/30 focus:border-purple-500/60" />
                        {loginForm.formState.errors.username && <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.username.message}</p>}
                      </div>
                      <div>
                        <label className="text-sm text-purple-200/70 mb-1.5 block">Password</label>
                        <div className="relative">
                          <Input {...loginForm.register("password")} type={showPass ? "text" : "password"} placeholder="••••••••" className="pr-10 bg-white/5 border-purple-800/50 text-white placeholder:text-white/30 focus:border-purple-500/60" autoComplete="current-password" />
                          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/50 hover:text-purple-200">
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {loginForm.formState.errors.password && <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.password.message}</p>}
                      </div>
                      <Button type="submit" disabled={loading} className="w-full h-12 font-bold text-base mt-2"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }}>
                        {loading ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "เข้าสู่ระบบ"}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.form key="rf" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                      onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4"
                    >
                      <div>
                        <label className="text-sm text-purple-200/70 mb-1.5 block">Username</label>
                        <Input {...registerForm.register("username")} placeholder="อย่างน้อย 3 ตัวอักษร" autoComplete="username"
                          className="bg-white/5 border-purple-800/50 text-white placeholder:text-white/30 focus:border-purple-500/60" />
                        {registerForm.formState.errors.username && <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.username.message}</p>}
                      </div>
                      <div>
                        <label className="text-sm text-purple-200/70 mb-1.5 block">Password</label>
                        <div className="relative">
                          <Input {...registerForm.register("password")} type={showPass ? "text" : "password"} placeholder="อย่างน้อย 6 ตัวอักษร" className="pr-10 bg-white/5 border-purple-800/50 text-white placeholder:text-white/30 focus:border-purple-500/60" autoComplete="new-password" />
                          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/50 hover:text-purple-200">
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {registerForm.formState.errors.password && <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.password.message}</p>}
                      </div>
                      <Button type="submit" disabled={loading} className="w-full h-12 font-bold text-base mt-2"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }}>
                        {loading ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "สมัครสมาชิก"}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {successMsg && (
          <SuccessPopup message={successMsg} onClose={() => { setSuccessMsg(null); setLocation("/"); }} />
        )}
      </AnimatePresence>
    </>
  );
}
