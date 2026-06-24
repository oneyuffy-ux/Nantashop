import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   CONFIRM POPUP
   White card · orange "!" circle · title · body · 2 buttons
═══════════════════════════════════════════════════════════ */
export function ConfirmPopup({
  open, title, body,
  confirmText = "ยืนยัน", cancelText = "ยกเลิก",
  onConfirm, onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onCancel}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ border: "3px solid #f97316", background: "rgba(249,115,22,0.08)" }}>
            <AlertCircle className="w-10 h-10 text-orange-500" />
          </div>
        </div>
        <h3 className="text-center text-2xl font-extrabold text-gray-800 mb-2"
          style={{ fontFamily: "Sarabun, sans-serif" }}>{title}</h3>
        {body && (
          <p className="text-center text-base text-gray-500 mb-6"
            style={{ fontFamily: "Sarabun, sans-serif" }}>{body}</p>
        )}
        <div className="flex gap-3 mt-2">
          <button onClick={onConfirm}
            className="flex-1 h-12 font-bold text-base rounded-2xl text-white hover:opacity-90 transition-opacity"
            style={{ background: "#38bdf8", fontFamily: "Sarabun, sans-serif" }}>
            {confirmText}
          </button>
          <button onClick={onCancel}
            className="flex-1 h-12 font-bold text-base rounded-2xl text-white hover:opacity-90 transition-opacity"
            style={{ background: "#ef4444", fontFamily: "Sarabun, sans-serif" }}>
            {cancelText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   RESULT POPUP
   loading=true  → big teal spinning ring  (IMG_5508)
   loading=false → teal circle + animated checkmark (IMG_5509)
   Both show same title/message - ตกลง disabled during load
═══════════════════════════════════════════════════════════ */
export function ResultPopup({
  open, loading,
  title = "สำเร็จ", message,
  onClose,
}: {
  open: boolean;
  loading: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 280 }}
        className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center max-w-xs w-full"
      >
        {/* Icon area — spinner or checkmark */}
        <div className="w-20 h-20 flex items-center justify-center mb-5 flex-shrink-0">
          {loading ? (
            <svg className="w-20 h-20 animate-spin" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#e0f2fe" strokeWidth="6" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="#0ea5e9" strokeWidth="6"
                strokeDasharray="200" strokeDashoffset="150" strokeLinecap="round" />
            </svg>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 14 }}
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ border: "4px solid #0ea5e9" }}
            >
              <motion.svg viewBox="0 0 40 40" width="40" height="40">
                <motion.path
                  d="M8 20 L16 28 L32 12"
                  fill="none" stroke="#0ea5e9" strokeWidth="3.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                />
              </motion.svg>
            </motion.div>
          )}
        </div>

        <h2 className="text-2xl font-extrabold text-gray-800 mb-1"
          style={{ fontFamily: "Sarabun, sans-serif" }}>{title}</h2>
        <p className="text-gray-600 text-base text-center font-semibold mb-5"
          style={{ fontFamily: "Sarabun, sans-serif" }}>{message}</p>

        <button
          onClick={loading ? undefined : onClose}
          disabled={loading}
          className="w-full py-3 rounded-2xl text-white font-bold text-base disabled:opacity-50 transition-opacity"
          style={{ background: "linear-gradient(135deg,#38bdf8,#0284c7)", fontFamily: "Sarabun, sans-serif" }}
        >ตกลง</button>
      </motion.div>
    </div>
  );
}
