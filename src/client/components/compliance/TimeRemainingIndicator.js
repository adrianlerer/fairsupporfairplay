"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconClock, IconAlertCircle } from "@tabler/icons-react";
import { getSessionUsage } from "@lib/complianceApi";

/**
 * Time Remaining Indicator
 * Shows child's daily usage vs limit (GDPR/COPPA compliant time limits)
 * Displays warning at 5 minutes remaining
 */
export default function TimeRemainingIndicator({ childId, className = "" }) {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  // Fetch usage data
  useEffect(() => {
    if (!childId) return;

    const fetchUsage = async () => {
      try {
        const data = await getSessionUsage(childId);
        setUsage(data);

        // Show warning if 5 minutes or less remaining
        if (data.remaining_minutes <= 5 && data.remaining_minutes > 0) {
          setShowWarning(true);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching session usage:", error);
        setLoading(false);
      }
    };

    fetchUsage();

    // Refresh every 60 seconds
    const interval = setInterval(fetchUsage, 60000);
    return () => clearInterval(interval);
  }, [childId]);

  if (loading || !usage) {
    return null;
  }

  const percentage = (usage.total_minutes_today / usage.daily_limit_minutes) * 100;
  const isNearLimit = usage.remaining_minutes <= 5;
  const isExceeded = usage.exceeded_limit;

  return (
    <>
      {/* Main Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
          isExceeded
            ? "bg-red-500/20 border border-red-500/50"
            : isNearLimit
            ? "bg-yellow-500/20 border border-yellow-500/50"
            : "bg-blue-500/20 border border-blue-500/50"
        } ${className}`}
      >
        <IconClock
          size={18}
          className={
            isExceeded
              ? "text-red-400"
              : isNearLimit
              ? "text-yellow-400"
              : "text-blue-400"
          }
        />
        <span
          className={`text-sm font-semibold ${
            isExceeded
              ? "text-red-300"
              : isNearLimit
              ? "text-yellow-300"
              : "text-blue-300"
          }`}
        >
          {usage.total_minutes_today} / {usage.daily_limit_minutes} min
        </span>
        {!isExceeded && (
          <span className="text-xs text-neutral-400">
            ({usage.remaining_minutes} min restantes)
          </span>
        )}
      </motion.div>

      {/* Warning Modal (5 minutes remaining) */}
      <AnimatePresence>
        {showWarning && !isExceeded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md"
          >
            <div className="bg-gradient-to-r from-yellow-500/95 to-orange-500/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-yellow-400/50">
              <div className="flex items-start gap-3">
                <IconAlertCircle size={24} className="text-white flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-1">
                    ⏰ Quedan {usage.remaining_minutes} minutos
                  </h4>
                  <p className="text-sm text-yellow-50">
                    Pronto se acabará tu tiempo de hoy. Termina lo que estás haciendo.
                  </p>
                </div>
                <button
                  onClick={() => setShowWarning(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                >
                  <IconX size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Limit Exceeded Modal */}
      <AnimatePresence>
        {isExceeded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-md w-full bg-gradient-to-br from-red-900/95 to-orange-900/95 rounded-3xl p-8 text-center border border-red-500/50"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl mb-4"
              >
                ⏰
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Tiempo Agotado
              </h2>
              <p className="text-red-100 mb-6">
                Alcanzaste tu límite de <strong>{usage.daily_limit_minutes} minutos</strong> por hoy.
                Vuelve mañana para seguir usando el asistente.
              </p>
              <div className="bg-red-500/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-200">
                  💡 <strong>Tip:</strong> Si necesitas más tiempo, pídele a tu padre/madre que ajuste el límite en la configuración.
                </p>
              </div>
              <button
                onClick={() => window.location.href = "/"}
                className="px-6 py-3 bg-white text-red-900 font-semibold rounded-xl hover:bg-red-50 transition-colors"
              >
                Volver al Inicio
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Import IconX for close button
import { IconX } from "@tabler/icons-react";
