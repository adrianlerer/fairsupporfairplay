'use client';

export default function InvestmentAsk() {
  return (
    <section id="inversion" className="py-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">💰</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Oportunidad de Inversión</h2>
            <p className="text-xl text-gray-600">Seed Round - Momento perfecto para entrar</p>
          </div>

          {/* Investment Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">💵 Términos</h3>
              <div className="space-y-3 text-blue-900">
                <div className="flex justify-between">
                  <span className="font-medium">Monto:</span>
                  <span className="font-bold">$250,000 USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Valuación Pre-money:</span>
                  <span className="font-bold">$2,000,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Equity Ofrecido:</span>
                  <span className="font-bold">11.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tipo:</span>
                  <span className="font-bold">Seed Round</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-green-900 mb-4">🎯 Uso de Fondos</h3>
              <div className="space-y-2 text-green-900">
                <div className="flex justify-between">
                  <span>Tech & Producto:</span>
                  <span className="font-bold">$100K (40%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Marketing & Growth:</span>
                  <span className="font-bold">$75K (30%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Contenido & Expertos:</span>
                  <span className="font-bold">$50K (20%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Operaciones:</span>
                  <span className="font-bold">$25K (10%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Milestones */}
          <div className="bg-purple-50 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-purple-900 mb-4">📈 Milestones con Este Capital</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-purple-900 mb-2">Mes 1-3</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>✓ 1,000 familias activas</li>
                  <li>✓ 5 clubes deportivos</li>
                  <li>✓ $10K MRR</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-purple-900 mb-2">Mes 4-6</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>✓ 5,000 familias activas</li>
                  <li>✓ 20 clubes + 5 escuelas</li>
                  <li>✓ $50K MRR</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-purple-900 mb-2">Mes 7-9</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>✓ 10,000 familias</li>
                  <li>✓ 50 instituciones</li>
                  <li>✓ $100K MRR</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-purple-900 mb-2">Mes 10-12</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>✓ Series A preparada</li>
                  <li>✓ Expansión regional</li>
                  <li>✓ $1.2M ARR</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Why Now */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold mb-4">⏰ ¿Por Qué Ahora?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-2xl mb-2">📈</div>
                <p><strong>Timing Perfecto:</strong> Salud mental infantil post-pandemia es prioridad #1</p>
              </div>
              <div>
                <div className="text-2xl mb-2">🤖</div>
                <p><strong>Tech Madura:</strong> IA accesible y confiable (GPT-4, embeddings)</p>
              </div>
              <div>
                <div className="text-2xl mb-2">🏆</div>
                <p><strong>First Mover:</strong> Ningún competidor con este enfoque integral</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <a
              href="mailto:investors@fairsupport.com"
              className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              📧 Contactar para Invertir
            </a>
            <p className="text-sm text-gray-600 mt-4">
              investors@fairsupport.com • +54 11 1234-5678
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
