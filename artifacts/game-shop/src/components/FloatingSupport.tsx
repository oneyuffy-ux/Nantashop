import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function FloatingSupport() {
  const { cmsConfig } = useApp();
  const [open, setOpen] = useState(false);

  const facebook = cmsConfig.social_links?.facebook;
  const discord = cmsConfig.social_links?.discord;
  const hasLinks = !!(facebook || discord);

  function handleClick() {
    if (!hasLinks) {
      const url = cmsConfig.social_links?.line || "#";
      if (url !== "#") window.open(url, "_blank");
      return;
    }
    setOpen(v => !v);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="contact-popup"
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 12 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-24 right-4 z-[99] min-w-[220px] shadow-2xl"
          >
            <div className="bg-[#1c1e2e] border border-[#252836] rounded-2xl p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-white">ช่องทางการติดต่อ</p>
                <button onClick={() => setOpen(false)} className="text-[#7c7f96] hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {facebook && (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/35 transition-colors"
                  >
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-sm font-medium text-blue-300">Facebook</span>
                  </a>
                )}
                {discord && (
                  <a
                    href={discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/35 transition-colors"
                  >
                    <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.101 18.079.11 18.1.124 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                    </svg>
                    <span className="text-sm font-medium text-indigo-300">Discord</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleClick}
        aria-label="ติดต่อสนับสนุน"
        className="fixed bottom-6 right-4 z-[100] w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95"
        style={{
          background: "radial-gradient(circle at 35% 35%, #38bdf8, #0369a1 70%)",
          boxShadow: "0 0 0 3px rgba(14,165,233,0.25), 0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 5C11.373 5 6 10.373 6 17v3a3 3 0 003 3h1a1 1 0 001-1v-5a1 1 0 00-1-1H9v-1C9 11.477 13.03 7 18 7s9 4.477 9 10v1h-1a1 1 0 00-1 1v5a1 1 0 001 1h1a3 3 0 003-3v-3c0-6.627-5.373-12-12-12z" fill="white" />
          <rect x="8.5" y="18.5" width="3" height="5" rx="1" fill="white" />
          <rect x="24.5" y="18.5" width="3" height="5" rx="1" fill="white" />
          <path d="M27 23a3 3 0 01-3 3h-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="21" cy="26" r="1.5" fill="white" />
        </svg>
      </button>
    </>
  );
}
