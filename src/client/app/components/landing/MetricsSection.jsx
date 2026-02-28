'use client';

export default function MetricsSection() {
  return (
    <section id="metricas" className="py-20 bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Métricas de Éxito</h2>
          <p className="text-xl text-blue-100">KPIs que medimos</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-4xl font-bold mb-2">85%+</div>
            <div className="text-sm">Retención MoM</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-4xl font-bold mb-2">16x</div>
            <div className="text-sm">LTV / CAC</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-4xl font-bold mb-2">&lt;1s</div>
            <div className="text-sm">Tiempo Respuesta IA</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-4xl font-bold mb-2">95%</div>
            <div className="text-sm">Satisfacción Padres</div>
          </div>
        </div>
      </div>
    </section>
  );
}
