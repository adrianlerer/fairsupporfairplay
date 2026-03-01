"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconX,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { getMyComplaints } from "@lib/complianceApi";

/**
 * Child Complaints History Page
 * Shows all reports submitted by the child with their status
 */
export default function ChildComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // TODO: Get childId from session/auth
  const childId = 3; // Hardcoded for demo

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await getMyComplaints(childId);
        setComplaints(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching complaints:", error);
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [childId]);

  const getCategoryInfo = (category) => {
    const categories = {
      technical: { icon: "🔧", label: "Técnico", color: "blue" },
      content: { icon: "💬", label: "Contenido", color: "purple" },
      privacy: { icon: "🔒", label: "Privacidad", color: "red" },
      other: { icon: "📝", label: "Otro", color: "gray" },
    };
    return categories[category] || categories.other;
  };

  const getStatusInfo = (status) => {
    const statuses = {
      pending: {
        icon: <IconClock size={18} />,
        label: "Pendiente",
        color: "yellow",
        bgColor: "bg-yellow-500/10",
        textColor: "text-yellow-400",
        borderColor: "border-yellow-500/30",
      },
      in_review: {
        icon: <IconAlertTriangle size={18} />,
        label: "En Revisión",
        color: "blue",
        bgColor: "bg-blue-500/10",
        textColor: "text-blue-400",
        borderColor: "border-blue-500/30",
      },
      resolved: {
        icon: <IconCheck size={18} />,
        label: "Resuelto",
        color: "green",
        bgColor: "bg-green-500/10",
        textColor: "text-green-400",
        borderColor: "border-green-500/30",
      },
      dismissed: {
        icon: <IconX size={18} />,
        label: "Cerrado",
        color: "gray",
        bgColor: "bg-neutral-500/10",
        textColor: "text-neutral-400",
        borderColor: "border-neutral-500/30",
      },
    };
    return statuses[status] || statuses.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `Hace ${diffMinutes} minutos`;
      }
      return `Hace ${diffHours} horas`;
    } else if (diffDays === 1) {
      return "Ayer";
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm border-b border-purple-500/30">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-purple-300 hover:text-white mb-4 transition-colors"
          >
            <IconArrowLeft size={20} />
            Volver
          </button>
          <div className="flex items-center gap-3">
            <IconAlertTriangle size={32} className="text-yellow-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Mis Reportes</h1>
              <p className="text-purple-300 text-sm">
                Aquí puedes ver todos los problemas que reportaste
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="text-4xl"
            >
              ⏳
            </motion.div>
          </div>
        ) : complaints.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              No hay reportes todavía
            </h2>
            <p className="text-neutral-400 mb-6">
              Si tienes algún problema con el asistente, puedes reportarlo usando el botón de "Reportar Problema".
            </p>
            <button
              onClick={() => router.push("/chat")}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              Ir al Chat
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint, index) => {
              const categoryInfo = getCategoryInfo(complaint.category);
              const statusInfo = getStatusInfo(complaint.status);

              return (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-xl rounded-2xl p-6 border border-neutral-700/50 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-4xl flex-shrink-0">
                      {categoryInfo.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-semibold text-${categoryInfo.color}-400`}>
                              {categoryInfo.label}
                            </span>
                            <span className="text-xs text-neutral-500">•</span>
                            <span className="text-xs text-neutral-500">
                              {formatDate(complaint.created_at)}
                            </span>
                          </div>
                          <p className="text-white font-medium">
                            {complaint.description}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border`}
                        >
                          <span className={statusInfo.textColor}>
                            {statusInfo.icon}
                          </span>
                          <span className={`text-sm font-semibold ${statusInfo.textColor}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Resolution */}
                      {complaint.resolved_at && complaint.resolution && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30"
                        >
                          <p className="text-sm font-semibold text-green-400 mb-1">
                            ✅ Respuesta del equipo:
                          </p>
                          <p className="text-sm text-green-200">
                            {complaint.resolution}
                          </p>
                          <p className="text-xs text-green-400/70 mt-2">
                            Resuelto el {formatDate(complaint.resolved_at)}
                          </p>
                        </motion.div>
                      )}

                      {/* Pending Notice */}
                      {complaint.status === "pending" && (
                        <div className="mt-4 flex items-start gap-2 text-sm text-yellow-300">
                          <IconClock size={16} className="flex-shrink-0 mt-0.5" />
                          <p>
                            Un adulto revisará tu reporte en las próximas{" "}
                            <strong>48 horas</strong>. Te avisaremos cuando tengamos una respuesta.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata Footer */}
                  <div className="mt-4 pt-4 border-t border-neutral-700/50 flex items-center gap-4 text-xs text-neutral-500">
                    <span>Reporte #{complaint.id}</span>
                    {complaint.parent_notified_at && (
                      <>
                        <span>•</span>
                        <span>📧 Padre/Madre notificado</span>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Help Text */}
        {complaints.length > 0 && (
          <div className="mt-8 p-6 bg-blue-500/10 rounded-2xl border border-blue-500/30">
            <p className="text-sm text-blue-200">
              💡 <strong>¿Necesitas ayuda?</strong> Si tu problema no fue resuelto o tienes más preguntas, puedes reportar un nuevo problema desde el chat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
