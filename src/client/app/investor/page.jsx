'use client';

/**
 * Fair Support Fair Play - Investor Landing Page
 * ================================================
 * 
 * Landing page profesional para presentar la plataforma a inversores
 * 
 * Consultor y Curador de Contenido: Marcelo Roffé
 * © Fair Support Fair Play 2026 - Todos los derechos reservados
 */

import { useState } from 'react';
import HeroSection from '../components/landing/HeroSection';
import ProblemSolution from '../components/landing/ProblemSolution';
import MarketOpportunity from '../components/landing/MarketOpportunity';
import ProductShowcase from '../components/landing/ProductShowcase';
import ComplianceSection from '../components/landing/ComplianceSection';
import BusinessModel from '../components/landing/BusinessModel';
import TechnologyStack from '../components/landing/TechnologyStack';
import TeamSection from '../components/landing/TeamSection';
import MetricsSection from '../components/landing/MetricsSection';
import InvestmentAsk from '../components/landing/InvestmentAsk';
import CTASection from '../components/landing/CTASection';

export default function InvestorLandingPage() {
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🏆</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Fair Support Fair Play</h1>
                <p className="text-xs text-gray-600">Apoyo Emocional para Niños Deportistas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#oportunidad" className="text-gray-700 hover:text-gray-900 font-medium">
                Oportunidad
              </a>
              <a href="#producto" className="text-gray-700 hover:text-gray-900 font-medium">
                Producto
              </a>
              <a href="#cumplimiento" className="text-gray-700 hover:text-gray-900 font-medium">
                Cumplimiento
              </a>
              <a href="#metricas" className="text-gray-700 hover:text-gray-900 font-medium">
                Métricas
              </a>
              <a href="#inversion" className="text-gray-700 hover:text-gray-900 font-medium">
                Inversión
              </a>
              <button
                onClick={() => setShowDemoModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Ver Demo
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        <HeroSection onDemoClick={() => setShowDemoModal(true)} />
        <ProblemSolution />
        <MarketOpportunity />
        <ProductShowcase />
        <ComplianceSection />
        <BusinessModel />
        <TechnologyStack />
        <MetricsSection />
        <TeamSection />
        <InvestmentAsk />
        <CTASection onDemoClick={() => setShowDemoModal(true)} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-2xl">🏆</div>
                <span className="text-lg font-bold">Fair Support Fair Play</span>
              </div>
              <p className="text-gray-400 text-sm">
                Plataforma de apoyo emocional para niños deportistas basada en evidencia científica.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <p className="text-gray-400 text-sm">Email: investors@fairsupport.com</p>
              <p className="text-gray-400 text-sm">Tel: +54 11 1234-5678</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <p className="text-gray-400 text-sm">© 2026 Fair Support Fair Play</p>
              <p className="text-gray-400 text-sm mt-2">
                Consultor y Curador: Marcelo Roffé
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Demo de la Plataforma</h2>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🎯 Panel de Administración</h3>
                <p className="text-blue-800 text-sm mb-3">
                  Gestión completa de contenido, revisión de importaciones de NotebookLM, y monitoreo de alertas.
                </p>
                <a
                  href="/admin"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Abrir Dashboard Admin →
                </a>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">🔌 API REST</h3>
                <p className="text-green-800 text-sm mb-3">
                  15+ endpoints completamente funcionales con integración OpenAI GPT-4.
                </p>
                <a
                  href="/api/docs"
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Ver Documentación API →
                </a>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">📊 Análisis IA en Tiempo Real</h3>
                <p className="text-purple-800 text-sm mb-3">
                  Sistema de análisis de sentimiento y generación de alertas con OpenAI.
                </p>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                  Probar Análisis →
                </button>
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg">
                <h3 className="font-semibold text-emerald-900 mb-2">🛡️ Dashboard de Cumplimiento</h3>
                <p className="text-emerald-800 text-sm mb-3">
                  Panel parental con métricas de seguridad, límites de tiempo y alertas en vivo.
                </p>
                <a
                  href="/parent/compliance"
                  className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Ver Dashboard Parental →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
