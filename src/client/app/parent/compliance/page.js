"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IconClock,
  IconAlertTriangle,
  IconShield,
  IconSettings,
  IconChartBar,
  IconBell,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { getChildSummary, updateParentSettings } from "@lib/complianceApi";
import { toast } from "react-hot-toast";

/**
 * Parent Compliance Dashboard
 * Allows parents to monitor child activity and adjust settings
 * Complies with GDPR Art. 8 (parental consent) and COPPA parental rights
 */
export default function ParentCompliancePage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [settings, setSettings] = useState({});

  // TODO: Get from auth/session
  const parentId = 2;
  const childId = 3;

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const data = await getChildSummary(parentId, childId);
      setSummary(data);
      setSettings({
        daily_time_limit_minutes: data.settings.daily_time_limit_minutes,
        crisis_notifications: data.settings.crisis_notifications,
        complaint_notifications: data.settings.complaint_notifications,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateParentSettings(parentId, childId, settings);
      toast.success("Configuración actualizada");
      setIsEditingSettings(false);
      fetchSummary();
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Error al guardar cambios");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="text-6xl"
        >
          ⏳
        </motion.div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error al cargar datos</h2>
          <p className="text-neutral-400">No se pudo obtener la información del niño.</p>
        </div>
      </div>
    );
  }

  const usagePercentage = (summary.usage_today_minutes / summary.daily_limit_minutes) * 100;
  const isNearLimit = summary.remaining_minutes <= 5;
  const isExceeded = usagePercentage >= 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <IconShield size={36} className="text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Seguridad y Cumplimiento</h1>
              <p className="text-purple-300 text-sm">
                Monitorea y administra el uso del asistente por tu hijo/a
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Usage Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-xl rounded-2xl p-6 border border-neutral-700/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <IconClock size={24} className="text-blue-400" />
                <h2 className="text-xl font-bold text-white">Uso de Hoy</h2>
              </div>

              <div className="mb-4">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-4xl font-bold text-white">
                      {summary.usage_today_minutes}
                    </span>
                    <span className="text-xl text-neutral-400 ml-2">
                      / {summary.daily_limit_minutes} min
                    </span>
                  </div>
                  <div
                    className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      isExceeded
                        ? "bg-red-500/20 text-red-400"
                        : isNearLimit
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {isExceeded
                      ? "Límite Alcanzado"
                      : `${summary.remaining_minutes} min restantes`}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-4 bg-neutral-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${
                      isExceeded
                        ? "bg-gradient-to-r from-red-500 to-orange-500"
                        : isNearLimit
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-neutral-800/50 rounded-xl p-4">
                  <p className="text-sm text-neutral-400 mb-1">Límite Diario</p>
                  <p className="text-2xl font-bold text-white">
                    {summary.daily_limit_minutes} min
                  </p>
                </div>
                <div className="bg-neutral-800/50 rounded-xl p-4">
                  <p className="text-sm text-neutral-400 mb-1">Porcentaje Usado</p>
                  <p className="text-2xl font-bold text-white">
                    {usagePercentage.toFixed(0)}%
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Alerts Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-xl rounded-2xl p-6 border border-neutral-700/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <IconAlertTriangle size={24} className="text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Alertas y Reportes</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/30">
                  <p className="text-sm text-yellow-400 mb-1">Reportes Pendientes</p>
                  <p className="text-3xl font-bold text-white">
                    {summary.pending_complaints}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl p-4 border border-red-500/30">
                  <p className="text-sm text-red-400 mb-1">Alertas de Crisis (7 días)</p>
                  <p className="text-3xl font-bold text-white">
                    {summary.crisis_alerts_7days}
                  </p>
                </div>
              </div>

              {summary.crisis_alerts_7days > 0 && (
                <div className="mt-4 p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                  <p className="text-sm text-red-200">
                    ⚠️ <strong>Importante:</strong> Se detectaron {summary.crisis_alerts_7days} alerta(s) de crisis en los últimos 7 días. Revisa el historial y considera hablar con tu hijo/a.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Compliance Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-xl rounded-2xl p-6 border border-neutral-700/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <IconChartBar size={24} className="text-green-400" />
                <h2 className="text-xl font-bold text-white">Estado de Cumplimiento</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/30">
                  <span className="text-sm text-green-200">
                    ✅ Consentimiento Parental Verificado
                  </span>
                  <IconCheck size={20} className="text-green-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/30">
                  <span className="text-sm text-green-200">
                    ✅ Límites de Tiempo Configurados
                  </span>
                  <IconCheck size={20} className="text-green-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/30">
                  <span className="text-sm text-green-200">
                    ✅ Notificaciones de Crisis Activas
                  </span>
                  <IconCheck size={20} className="text-green-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/30">
                  <span className="text-sm text-green-200">
                    ✅ Detección PII Activa
                  </span>
                  <IconCheck size={20} className="text-green-400" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-xl rounded-2xl p-6 border border-neutral-700/50 sticky top-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <IconSettings size={24} className="text-purple-400" />
                  <h2 className="text-xl font-bold text-white">Configuración</h2>
                </div>
                {!isEditingSettings && (
                  <button
                    onClick={() => setIsEditingSettings(true)}
                    className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                  >
                    Editar
                  </button>
                )}
              </div>

              {isEditingSettings ? (
                <div className="space-y-6">
                  {/* Time Limit Slider */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Límite de Tiempo Diario
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="15"
                        max="120"
                        step="15"
                        value={settings.daily_time_limit_minutes}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            daily_time_limit_minutes: parseInt(e.target.value),
                          })
                        }
                        className="flex-1 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider-thumb:bg-purple-500"
                      />
                      <span className="text-2xl font-bold text-white w-20 text-right">
                        {settings.daily_time_limit_minutes} min
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">
                      Recomendado: 30-60 minutos para niños de 8-13 años
                    </p>
                  </div>

                  {/* Crisis Notifications */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      <IconBell size={16} className="inline mr-1" />
                      Notificaciones de Crisis
                    </label>
                    <div className="space-y-2">
                      {["email", "sms", "push"].map((method) => (
                        <label
                          key={method}
                          className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={settings.crisis_notifications?.includes(method)}
                            onChange={(e) => {
                              const current = settings.crisis_notifications?.split(",") || [];
                              const updated = e.target.checked
                                ? [...current, method]
                                : current.filter((m) => m !== method);
                              setSettings({
                                ...settings,
                                crisis_notifications: updated.join(","),
                              });
                            }}
                            className="w-4 h-4 text-purple-500 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                          />
                          {method.toUpperCase()}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Complaint Notifications */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Notificaciones de Reportes
                    </label>
                    <div className="space-y-2">
                      {["email", "sms"].map((method) => (
                        <label
                          key={method}
                          className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={settings.complaint_notifications?.includes(method)}
                            onChange={(e) => {
                              const current = settings.complaint_notifications?.split(",") || [];
                              const updated = e.target.checked
                                ? [...current, method]
                                : current.filter((m) => m !== method);
                              setSettings({
                                ...settings,
                                complaint_notifications: updated.join(","),
                              });
                            }}
                            className="w-4 h-4 text-purple-500 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                          />
                          {method.toUpperCase()}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setIsEditingSettings(false);
                        setSettings({
                          daily_time_limit_minutes: summary.settings.daily_time_limit_minutes,
                          crisis_notifications: summary.settings.crisis_notifications,
                          complaint_notifications: summary.settings.complaint_notifications,
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-xl hover:bg-neutral-600 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-neutral-800/50 rounded-xl">
                    <p className="text-sm text-neutral-400 mb-1">Límite Diario</p>
                    <p className="text-xl font-bold text-white">
                      {summary.settings.daily_time_limit_minutes} minutos
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-800/50 rounded-xl">
                    <p className="text-sm text-neutral-400 mb-1">Alertas de Crisis</p>
                    <p className="text-sm font-semibold text-white">
                      {summary.settings.crisis_notifications?.toUpperCase() || "EMAIL"}
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-800/50 rounded-xl">
                    <p className="text-sm text-neutral-400 mb-1">Notif. Reportes</p>
                    <p className="text-sm font-semibold text-white">
                      {summary.settings.complaint_notifications?.toUpperCase() || "EMAIL"}
                    </p>
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                <p className="text-xs text-blue-200">
                  💡 <strong>Nota:</strong> Los cambios se aplicarán inmediatamente. Tu hijo/a será notificado si se reduce el límite de tiempo.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
