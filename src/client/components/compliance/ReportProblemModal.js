"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconAlertTriangle, IconX, IconCheck } from "@tabler/icons-react";
import { Button } from "@components/ui/button";
import { ModalDialog } from "@components/ui/ModalDialog";
import { reportProblem } from "@lib/complianceApi";

/**
 * Report Problem Modal - Child-accessible complaint mechanism
 * Complies with UN CRC Art. 12 (right to be heard) and UNICEF AI & Child Rights
 */
export default function ReportProblemModal({ isOpen, onClose, childId }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const categories = [
    {
      id: "technical",
      icon: "🔧",
      title: "Problema Técnico",
      description: "El chat no funciona, se traba o tiene errores",
      examples: ["No carga", "Se congela", "No responde"],
    },
    {
      id: "content",
      icon: "💬",
      title: "Contenido",
      description: "La respuesta no me ayudó o no entendió mi pregunta",
      examples: ["Respuesta confusa", "No ayudó", "Fuera de tema"],
    },
    {
      id: "privacy",
      icon: "🔒",
      title: "Privacidad",
      description: "Me pidió información personal o me sentí incómodo",
      examples: ["Preguntó datos", "Me incomodó", "No fue apropiado"],
    },
  ];

  const handleSubmit = async () => {
    if (!selectedCategory || !description.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await reportProblem(childId, selectedCategory, description);
      
      console.log("Reporte enviado:", result);
      setIsSuccess(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error al enviar reporte:", error);
      alert("Hubo un error. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setDescription("");
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-2xl bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-xl p-0 rounded-3xl border border-purple-500/30"
    >
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="mb-4"
            >
              <IconCheck size={80} className="text-green-400 mx-auto" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">
              ¡Reporte Enviado!
            </h3>
            <p className="text-neutral-300">
              Un adulto revisará tu reporte pronto. Te avisaremos cuando tengamos una respuesta.
            </p>
            <p className="text-sm text-neutral-400 mt-4">
              📧 Tu padre/madre recibirá una notificación.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <IconAlertTriangle size={28} className="text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">
                  Reportar un Problema
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <IconX size={24} />
              </button>
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <p className="text-neutral-300 mb-4">
                ¿Qué tipo de problema tuviste?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedCategory === category.id
                        ? "border-yellow-400 bg-yellow-400/10"
                        : "border-neutral-700 bg-neutral-800/50 hover:border-neutral-600"
                    }`}
                  >
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <h3 className="text-white font-semibold mb-1">
                      {category.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mb-2">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {category.examples.map((ex) => (
                        <span
                          key={ex}
                          className="text-xs px-2 py-0.5 rounded-full bg-neutral-700/50 text-neutral-300"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Description */}
            {selectedCategory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <label className="block text-neutral-300 mb-2">
                  Cuéntanos qué pasó (opcional):
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ejemplo: 'Le pregunté cómo manejar la presión antes del partido y me dio una respuesta sobre otro tema.'"
                  className="w-full p-4 rounded-xl bg-neutral-800/50 border border-neutral-700 text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-neutral-400 mt-1">
                  {description.length}/500 caracteres
                </p>
              </motion.div>
            )}

            {/* Important Notice */}
            <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-blue-200">
                <strong>📌 Importante:</strong> Tu reporte será revisado por un adulto en las próximas 48 horas. Tus padres recibirán una notificación automática.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedCategory || !description.trim() || isSubmitting}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      ⏳
                    </motion.div>
                    Enviando...
                  </span>
                ) : (
                  "Enviar Reporte"
                )}
              </Button>
            </div>

            {/* Privacy Notice */}
            <p className="text-xs text-neutral-500 mt-4 text-center">
              🔒 Tu reporte es confidencial y solo será visto por adultos responsables.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalDialog>
  );
}
