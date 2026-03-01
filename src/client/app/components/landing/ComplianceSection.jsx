"use client";

import { motion } from "framer-motion";
import { IconShield, IconCertificate, IconCheck, IconExternalLink } from "@tabler/icons-react";

/**
 * Compliance & Child Safety Section for Investor Landing
 * Highlights GDPR, COPPA, CRC, UNICEF compliance
 */
export default function ComplianceSection() {
  const complianceBadges = [
    {
      name: "GDPR",
      icon: "🇪🇺",
      description: "Reglamento General de Protección de Datos (UE)",
      articles: ["Art. 5", "Art. 6", "Art. 8", "Art. 9"],
      status: "Compliant",
      color: "blue",
    },
    {
      name: "COPPA",
      icon: "🇺🇸",
      description: "Children's Online Privacy Protection Act (EE.UU.)",
      articles: ["§312.4", "§312.5", "§312.6", "§312.7"],
      status: "Compliant",
      color: "green",
    },
    {
      name: "UN CRC",
      icon: "🌍",
      description: "Convención de los Derechos del Niño (ONU)",
      articles: ["Art. 3", "Art. 12", "Art. 16", "Art. 19", "Art. 34"],
      status: "Compliant",
      color: "purple",
    },
    {
      name: "UNICEF",
      icon: "🦄",
      description: "AI & Child Rights Policy Guidance",
      articles: ["CRIA", "Child Feedback", "Transparency"],
      status: "Compliant",
      color: "pink",
    },
  ];

  const keyFeatures = [
    {
      icon: "🆘",
      title: "Detección Automática de Crisis",
      description: "Sistema que detecta palabras clave de riesgo (suicidio, abuso) y notifica a padres en <1 hora.",
      tech: "NLP + hotlines argentinas (135, 102)",
    },
    {
      icon: "⏱️",
      title: "Límites de Tiempo por Edad",
      description: "30 min/día por defecto, ajustable por padres. Bloqueo automático al exceder límite.",
      tech: "PostgreSQL triggers + tiempo real",
    },
    {
      icon: "📝",
      title: "Mecanismo de Queja Infantil",
      description: "Botón 'Reportar un Problema' con 3 categorías. SLA 48h de revisión humana.",
      tech: "FastAPI + review_queue + notificaciones",
    },
    {
      icon: "👪",
      title: "Dashboard Parental en Vivo",
      description: "Padres ven uso diario, reportes y alertas. Control total sobre configuraciones.",
      tech: "React + TanStack Query + WebSockets",
    },
    {
      icon: "🔒",
      title: "Privacidad por Diseño (PbD)",
      description: "Filtrado PII con Presidio antes de GPT-4. Minimización de datos (solo edad, deporte, nivel).",
      tech: "Microsoft Presidio + OpenAI Moderation",
    },
    {
      icon: "📊",
      title: "Transparencia & Auditoría",
      description: "Reporte trimestral público con métricas de seguridad (crisis, reportes, PII detections).",
      tech: "compliance_metrics + public API",
    },
  ];

  return (
    <section id="cumplimiento" className="py-20 bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-4">
            <IconShield size={20} className="text-green-600" />
            <span className="text-green-700 font-semibold text-sm">100% Compliant</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Cumplimiento y Seguridad Infantil
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Primera plataforma de IA para niños{" "}
            <strong>totalmente certificada</strong> en GDPR, COPPA, CRC y UNICEF.
          </p>
        </motion.div>

        {/* Compliance Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {complianceBadges.map((badge, index) => (
            <motion.div
              key={badge.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl p-6 border-2 border-${badge.color}-200 hover:border-${badge.color}-400 transition-colors shadow-lg hover:shadow-xl`}
            >
              <div className="text-5xl mb-4">{badge.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{badge.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
              <div className="space-y-2">
                {badge.articles.map((article) => (
                  <div
                    key={article}
                    className="flex items-center gap-2 text-xs text-gray-700"
                  >
                    <IconCheck size={14} className={`text-${badge.color}-500`} />
                    <span>{article}</span>
                  </div>
                ))}
              </div>
              <div
                className={`mt-4 px-3 py-1 bg-${badge.color}-100 text-${badge.color}-700 rounded-full text-xs font-semibold inline-block`}
              >
                ✓ {badge.status}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Key Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Funcionalidades Clave de Protección Infantil
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-700 font-mono">{feature.tech}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <p className="text-purple-200">Filtrado PII</p>
              <p className="text-xs text-purple-300 mt-1">Microsoft Presidio</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">&lt;1h</div>
              <p className="text-purple-200">SLA Crisis</p>
              <p className="text-xs text-purple-300 mt-1">Revisión humana</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">48h</div>
              <p className="text-purple-200">SLA Reportes</p>
              <p className="text-xs text-purple-300 mt-1">Respuesta garantizada</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">14</div>
              <p className="text-purple-200">KPIs Monitoreados</p>
              <p className="text-xs text-purple-300 mt-1">Dashboard en vivo</p>
            </div>
          </div>
        </motion.div>

        {/* CTA - Transparency Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-white rounded-2xl p-8 border-2 border-dashed border-gray-300 hover:border-purple-500 transition-colors"
        >
          <IconCertificate size={48} className="text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Reporte de Transparencia
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Publicamos reportes trimestrales con estadísticas de seguridad infantil,
            alertas de crisis, reportes resueltos y detecciones de PII. Total transparencia
            para padres, educadores e inversores.
          </p>
          <a
            href="/transparency-report"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Ver Reporte Q1 2026
            <IconExternalLink size={18} />
          </a>
        </motion.div>

        {/* Legal Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500">
            🔒 <strong>Cumplimiento Legal Verificado:</strong> Todos los controles
            técnicos están implementados y probados. Schema SQL, APIs FastAPI y tests
            E2E disponibles en GitHub (repositorio privado para inversores).
          </p>
        </motion.div>
      </div>
    </section>
  );
}
