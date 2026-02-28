'use client';

/**
 * Hero Section - Landing Page
 */

export default function HeroSection({ onDemoClick }) {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-block mb-6">
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              🚀 Buscando Inversión Seed: $250K USD
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Protegiendo la Salud Mental<br />
            de <span className="text-yellow-300">100M+ Niños Deportistas</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Plataforma de IA que detecta y previene crisis emocionales en niños deportistas
            con contenido curado por expertos
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold text-yellow-300 mb-2">$4B</div>
              <div className="text-sm text-blue-100">Mercado Salud Mental Infantil</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold text-yellow-300 mb-2">40%</div>
              <div className="text-sm text-blue-100">Niños con Ansiedad Deportiva</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold text-yellow-300 mb-2">70%</div>
              <div className="text-sm text-blue-100">Abandonan antes de los 13</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={onDemoClick}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🎯 Ver Demo en Vivo
            </button>
            <a
              href="#inversion"
              className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              💰 Oportunidad de Inversión
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-blue-200">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✅</span>
              <span>100% Operativo</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🤖</span>
              <span>IA Real (OpenAI GPT-4)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔒</span>
              <span>COPPA & GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👨‍⚕️</span>
              <span>Contenido Curado por Expertos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
