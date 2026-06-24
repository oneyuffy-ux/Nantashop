import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SuccessModalProps {
  open: boolean;
  message?: string;
  onClose: () => void;
}

export default function SuccessModal({ open, message = "บันทึกสำเร็จ", onClose }: SuccessModalProps) {
  const [phase, setPhase] = useState<"loading" | "success">("loading");

  useEffect(() => {
    if (!open) return;
    setPhase("loading");
    const t = setTimeout(() => setPhase("success"), 700);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (phase !== "success") return;
    const t = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(t);
  }, [phase, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          onClick={phase === "success" ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center max-w-xs w-full"
          >
            <AnimatePresence mode="wait">
              {phase === "loading" ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center gap-5 py-4"
                >
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 animate-spin" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#e0f2fe" strokeWidth="6" />
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#0ea5e9" strokeWidth="6"
                        strokeDasharray="213" strokeDashoffset="160" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-sky-400 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm font-medium" style={{ fontFamily: "Sarabun, sans-serif" }}>
                    กำลังดำเนินการ...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", damping: 18, stiffness: 260 }}
                  className="flex flex-col items-center gap-0"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.05, type: "spring", damping: 14, stiffness: 200 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                    style={{ border: "4px solid #0ea5e9" }}
                  >
                    <motion.svg
                      viewBox="0 0 40 40" width="40" height="40"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ delay: 0.2, duration: 0.45, ease: "easeOut" }}
                    >
                      <motion.path
                        d="M8 20 L16 28 L32 12"
                        fill="none" stroke="#0ea5e9" strokeWidth="3.5"
                        strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ delay: 0.2, duration: 0.45, ease: "easeOut" }}
                      />
                    </motion.svg>
                  </motion.div>

                  <h2 className="text-2xl font-extrabold text-gray-800 mb-2" style={{ fontFamily: "Sarabun, sans-serif" }}>
                    สำเร็จ
                  </h2>
                  <p className="text-gray-500 text-sm text-center mb-6" style={{ fontFamily: "Sarabun, sans-serif" }}>
                    {message}
                  </p>
                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl text-white font-bold text-base transition-all active:scale-95"
                    style={{ background: "linear-gradient(135deg,#0ea5e9,#0284c7)", fontFamily: "Sarabun, sans-serif" }}
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
  );
}
