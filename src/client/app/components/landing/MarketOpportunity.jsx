'use client';

export default function MarketOpportunity() {
  return (
    <section id="oportunidad" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Oportunidad de Mercado</h2>
          <p className="text-xl text-gray-600">Un mercado masivo desatendido</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-8">
            <div className="text-6xl font-bold mb-2">100M+</div>
            <div className="text-xl font-semibold mb-2">Niños Deportistas</div>
            <div className="text-blue-100">A nivel mundial (8-18 años)</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-8">
            <div className="text-6xl font-bold mb-2">$4B</div>
            <div className="text-xl font-semibold mb-2">Mercado TAM</div>
            <div className="text-green-100">Salud Mental Infantil</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-8">
            <div className="text-6xl font-bold mb-2">20M+</div>
            <div className="text-xl font-semibold mb-2">Latinoamérica</div>
            <div className="text-purple-100">Mercado inicial objetivo</div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Segmentos de Mercado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-3">🏠 B2C - Familias</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• 10M familias objetivo (Año 1)</li>
                <li>• $9.99/mes - Freemium</li>
                <li>• CAC bajo (redes sociales, referidos)</li>
                <li>• LTV: $240 (2 años promedio)</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-3">🏢 B2B - Institucional</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Clubes deportivos: $299/mes (≤50 niños)</li>
                <li>• Escuelas deportivas: $499/mes (≤100)</li>
                <li>• Federaciones: Enterprise pricing</li>
                <li>• Retención 85%+</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
