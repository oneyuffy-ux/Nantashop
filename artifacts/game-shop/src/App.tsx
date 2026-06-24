import React, { useEffect, useMemo, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import FloatingSupport from "@/components/FloatingSupport";
import SuccessModal from "@/components/SuccessModal";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Topup from "@/pages/Topup";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function LoadingScreen() {
  const { cmsConfig } = useApp();
  const [visible, setVisible] = useState(false);
  const enabled = !!(cmsConfig.enable_loading_screen && cmsConfig.loading_gif_url);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, [enabled, cmsConfig.loading_gif_url]);

  if (!visible || !cmsConfig.loading_gif_url) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0f1117]">
      <img
        src={cmsConfig.loading_gif_url}
        alt="กำลังโหลด..."
        className="max-w-sm max-h-64 object-contain"
      />
    </div>
  );
}

function ParticleEffect() {
  const { cmsConfig } = useApp();
  const type = cmsConfig.particle_type;
  const position = (cmsConfig as any).particle_position || "background";

  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: parseFloat((Math.random() * 100).toFixed(2)),
        delay: parseFloat((Math.random() * 8).toFixed(2)),
        size: parseFloat((2 + Math.random() * 3).toFixed(1)),
        dur: parseFloat((4 + Math.random() * 6).toFixed(1)),
        hue: Math.floor(20 + Math.random() * 40),
        w: parseFloat((60 + Math.random() * 80).toFixed(1)),
      })),
    [],
  );

  useEffect(() => {
    const existing = document.getElementById("particle-keyframes");
    if (existing) return;
    const s = document.createElement("style");
    s.id = "particle-keyframes";
    s.textContent = `
      @keyframes p-snow {
        0%   { transform: translateY(-20px) rotate(0deg); opacity: 0.9; }
        100% { transform: translateY(105vh)  rotate(360deg); opacity: 0.2; }
      }
      @keyframes p-ember {
        0%   { transform: translateY(105vh) scale(1);    opacity: 1; }
        100% { transform: translateY(-20px)  scale(0.3);  opacity: 0; }
      }
      @keyframes p-meteor {
        0%   { opacity: 0;   transform: translate(0px, 0px); }
        8%   { opacity: 0.9; }
        100% { opacity: 0;   transform: translate(140vw, 80vh); }
      }
    `;
    document.head.appendChild(s);
    return () => { document.getElementById("particle-keyframes")?.remove(); };
  }, []);

  if (!type || type === "none") return null;

  const zClass =
    position === "above-content"
      ? "z-[50]"
      : position === "under-content"
        ? "z-[1]"
        : "z-[5]";

  if (type === "snow") {
    return (
      <div className={`fixed inset-0 pointer-events-none overflow-hidden ${zClass}`}>
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white/80"
            style={{
              left: `${p.left}%`,
              top: -10,
              width: p.size,
              height: p.size,
              animation: `p-snow ${p.dur}s ${p.delay}s linear infinite`,
            }}
          />
        ))}
      </div>
    );
  }

  if (type === "ember") {
    return (
      <div className={`fixed inset-0 pointer-events-none overflow-hidden ${zClass}`}>
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              bottom: -10,
              width: p.size,
              height: p.size,
              background: `hsl(${p.hue} 100% 65%)`,
              animation: `p-ember ${p.dur}s ${p.delay}s linear infinite`,
            }}
          />
        ))}
      </div>
    );
  }

  if (type === "meteor") {
    return (
      <div className={`fixed inset-0 pointer-events-none overflow-hidden ${zClass}`}>
        {particles.slice(0, 18).map(p => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.left * 0.4}%`,
              top: `${p.left * 0.15}%`,
              width: p.w,
              height: 2,
              background: "linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4), transparent)",
              borderRadius: 1,
              animation: `p-meteor ${p.dur * 0.55}s ${p.delay}s linear infinite`,
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}

function GlobalModals() {
  const { successModal, closeSuccess } = useApp();
  return <SuccessModal open={successModal.open} message={successModal.message} onClose={closeSuccess} />;
}


function BrowseRoute({ component: Component }: { component: React.ComponentType }) {
  const { currentUser, isAuthChecked, isGuestMode } = useApp();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthChecked && !currentUser && !isGuestMode) {
      setLocation("/auth");
    }
  }, [isAuthChecked, currentUser, isGuestMode, setLocation]);

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!currentUser && !isGuestMode) return null;
  return <Component />;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { currentUser, isAuthChecked } = useApp();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthChecked && !currentUser) {
      setLocation("/auth");
    }
  }, [isAuthChecked, currentUser, setLocation]);

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!currentUser) return null;
  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { currentUser, isAuthChecked } = useApp();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthChecked && !currentUser) {
      setLocation("/auth");
    } else if (isAuthChecked && currentUser && !currentUser.is_admin) {
      setLocation("/");
    }
  }, [isAuthChecked, currentUser, setLocation]);

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!currentUser || !currentUser.is_admin) return null;
  return <Component />;
}

function AuthRoute() {
  const { currentUser, isAuthChecked } = useApp();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthChecked && currentUser) {
      setLocation("/");
    }
  }, [isAuthChecked, currentUser, setLocation]);

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (currentUser) return null;
  return <Auth />;
}

function GuestRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthChecked } = useApp();
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  return <Component />;
}

function ComingSoon({ title }: { title: string }) {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 px-4">
      <div className="text-7xl mb-2">🚧</div>
      <h1 className="text-3xl font-extrabold text-foreground" style={{ fontFamily: "'Orbitron', sans-serif" }}>{title}</h1>
      <p className="text-muted-foreground text-center max-w-xs">ฟีเจอร์นี้กำลังอยู่ในระหว่างการพัฒนา กรุณารอติดตามการอัปเดตเร็วๆ นี้</p>
      <span className="px-5 py-2 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20">Coming Soon</span>
      <button onClick={() => setLocation("/")} className="mt-2 text-sm text-muted-foreground hover:text-primary transition-colors underline">← กลับหน้าหลัก</button>
    </div>
  );
}

const MinigameComingSoon = () => <ComingSoon title="มินิเกม" />;

const RouteHome          = () => <BrowseRoute component={Home} />;
const RouteProducts      = () => <GuestRoute component={Products} />;
const RouteProductDetail = () => <GuestRoute component={ProductDetail} />;
const RouteTopup         = () => <ProtectedRoute component={Topup} />;
const RouteProfile       = () => <ProtectedRoute component={Profile} />;
const RouteAdmin         = () => <AdminRoute component={Admin} />;

function Router() {
  const { currentUser } = useApp();
  return (
    <>
      <LoadingScreen />
      <ParticleEffect />
      <Navbar />
      <Switch>
        <Route path="/auth"         component={AuthRoute} />
        <Route path="/"             component={RouteHome} />
        <Route path="/products"     component={RouteProducts} />
        <Route path="/products/:id" component={RouteProductDetail} />
        <Route path="/topup"        component={RouteTopup} />
        <Route path="/profile"      component={RouteProfile} />
        <Route path="/admin"        component={RouteAdmin} />
        <Route path="/minigame"     component={MinigameComingSoon} />
        <Route component={NotFound} />
      </Switch>
      {currentUser && <FloatingSupport />}
      <GlobalModals />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AppProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
