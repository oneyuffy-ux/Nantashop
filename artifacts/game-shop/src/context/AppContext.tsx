import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { UserProfile, CMSConfig } from "@/types";
import { mockCMSConfig } from "@/lib/mock-data";
import { api, setAuthToken } from "@/lib/api";

interface SuccessState { open: boolean; message: string; }

interface AppContextType {
  currentUser: UserProfile | null;
  cmsConfig: CMSConfig;
  isLoading: boolean;
  isAuthChecked: boolean;
  isMockMode: boolean;
  isGuestMode: boolean;
  setGuestMode: (v: boolean) => void;
  setCurrentUser: (user: UserProfile | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
  setCmsConfig: (config: CMSConfig) => void;
  successModal: SuccessState;
  showSuccess: (message?: string) => void;
  closeSuccess: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

function hexToHsl(hex: string): string {
  if (!hex || !hex.startsWith("#")) return hex;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyTheme(cfg: CMSConfig) {
  const root = document.documentElement;

  if (cfg.primary_color) {
    root.style.setProperty("--primary", cfg.primary_color);
    root.style.setProperty("--accent", cfg.primary_color);
    root.style.setProperty("--ring", cfg.primary_color);
  }
  if (cfg.secondary_color) {
    root.style.setProperty("--secondary", cfg.secondary_color);
    root.style.setProperty("--muted", cfg.secondary_color);
    root.style.setProperty("--card", cfg.secondary_color);
  }
  if (cfg.font_color) {
    const hsl = hexToHsl(cfg.font_color);
    root.style.setProperty("--foreground", hsl);
    root.style.setProperty("--card-foreground", hsl);
    root.style.setProperty("--popover-foreground", hsl);
    root.style.setProperty("--secondary-foreground", hsl);
  }
  if (cfg.border_color) {
    const hsl = hexToHsl(cfg.border_color);
    root.style.setProperty("--border", hsl);
    root.style.setProperty("--input", hsl);
  }
  if (cfg.font) {
    document.body.style.fontFamily = `'${cfg.font}', sans-serif`;
  }
  if (cfg.background_url) {
    document.body.style.backgroundImage = `url(${cfg.background_url})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
  } else {
    document.body.style.backgroundImage = "";
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const isMockMode = false;
  const [currentUser, setCurrentUserRaw] = useState<UserProfile | null>(null);
  const [cmsConfig, setCmsConfigRaw] = useState<CMSConfig>(mockCMSConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(() => sessionStorage.getItem("guestMode") === "1");
  const [successModal, setSuccessModal] = useState<SuccessState>({ open: false, message: "บันทึกสำเร็จ" });

  function setGuestMode(v: boolean) {
    if (v) sessionStorage.setItem("guestMode", "1");
    else sessionStorage.removeItem("guestMode");
    setIsGuestMode(v);
  }

  function setCurrentUser(user: UserProfile | null) {
    if (user) setGuestMode(false);
    setCurrentUserRaw(user);
  }

  const showSuccess = useCallback((message = "บันทึกสำเร็จ") => {
    setSuccessModal({ open: true, message });
  }, []);

  const closeSuccess = useCallback(() => {
    setSuccessModal(s => ({ ...s, open: false }));
  }, []);

  function setCmsConfig(config: CMSConfig) {
    setCmsConfigRaw(config);
    applyTheme(config);
  }

  useEffect(() => {
    applyTheme(cmsConfig);
  }, [cmsConfig]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const user = await api.get("/auth/me");
        if (!cancelled) setCurrentUser(user as UserProfile);
      } catch {
        if (!cancelled) setCurrentUser(null);
      } finally {
        if (!cancelled) setIsAuthChecked(true);
      }

      try {
        const data = await api.get("/settings");
        if (!cancelled && data) setCmsConfig(data as CMSConfig);
      } catch {
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  async function refreshUser() {
    try {
      const user = await api.get("/auth/me");
      setCurrentUser(user as UserProfile);
    } catch {
      setCurrentUser(null);
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout", {});
    } catch {}
    setAuthToken(null);
    setCurrentUserRaw(null);
    setGuestMode(false);
  }

  function updateBalance(newBalance: number) {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, balance: newBalance });
  }

  return (
    <AppContext.Provider value={{
      currentUser, cmsConfig, isLoading, isAuthChecked, isMockMode,
      isGuestMode, setGuestMode,
      setCurrentUser, refreshUser, logout, updateBalance, setCmsConfig,
      successModal, showSuccess, closeSuccess,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
