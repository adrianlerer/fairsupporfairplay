'use client';

export default function BusinessModel() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Modelo de Negocio</h2>
          <p className="text-xl text-gray-600">Freemium + Institucional = ARR Predecible</p>
        </div>

        {/* Revenue Streams */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="text-4xl mb-3">👨‍👩‍👦</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Freemium B2C</h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">$9.99</div>
            <p className="text-sm text-blue-800 mb-3">/ mes por familia</p>
            <ul className="text-sm text-blue-900 space-y-1">
              <li>✓ Alertas ilimitadas</li>
              <li>✓ Consultas IA 24/7</li>
              <li>✓ Dashboard padres</li>
              <li>✓ Comunidad Discord</li>
            </ul>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <div className="text-4xl mb-3">🏢</div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Clubes B2B</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">$299</div>
            <p className="text-sm text-green-800 mb-3">/ mes (≤50 niños)</p>
            <ul className="text-sm text-green-900 space-y-1">
              <li>✓ Dashboard institucional</li>
              <li>✓ Reportes analíticos</li>
              <li>✓ Branding personalizado</li>
              <li>✓ Soporte prioritario</li>
            </ul>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
            <div className="text-4xl mb-3">🏫</div>
            <h3 className="text-xl font-bold text-purple-900 mb-2">Escuelas B2B</h3>
            <div className="text-3xl font-bold text-purple-600 mb-2">$499</div>
            <p className="text-sm text-purple-800 mb-3">/ mes (≤100 niños)</p>
            <ul className="text-sm text-purple-900 space-y-1">
              <li>✓ Todo de Clubes +</li>
              <li>✓ API Enterprise</li>
              <li>✓ Integración LMS</li>
              <li>✓ Formación docentes</li>
            </ul>
          </div>
        </div>

        {/* Financial Projections */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
          <h3 className="text-3xl font-bold mb-6 text-center">Proyecciones Año 1</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-4xl font-bold mb-2">10K</div>
              <div className="text-sm">Familias Freemium</div>
              <div className="text-xs text-blue-200 mt-1">$100K MRR</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-4xl font-bold mb-2">50</div>
              <div className="text-sm">Clubes B2B</div>
              <div className="text-xs text-blue-200 mt-1">$15K MRR</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-4xl font-bold mb-2">20</div>
              <div className="text-sm">Escuelas B2B</div>
              <div className="text-xs text-blue-200 mt-1">$10K MRR</div>
            </div>

            <div className="bg-yellow-400 text-gray-900 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold mb-2">$1.2M</div>
              <div className="text-sm font-bold">ARR Total</div>
              <div className="text-xs mt-1">Año 1</div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-lg">
              <strong>Unit Economics:</strong> CAC $15 • LTV $240 • LTV/CAC = 16x
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
