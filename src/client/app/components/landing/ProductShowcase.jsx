'use client';

export default function ProductShowcase() {
  const features = [
    {
      icon: '🤖',
      title: 'Análisis IA en Tiempo Real',
      description: 'GPT-4 analiza cada consulta y detecta emociones, ansiedad, burnout',
      color: 'bg-blue-500'
    },
    {
      icon: '🚨',
      title: 'Sistema de Alertas 🟢🟡🔴',
      description: 'Padres reciben alertas automáticas vía SMS, Email y WhatsApp',
      color: 'bg-red-500'
    },
    {
      icon: '📚',
      title: 'Contenido Curado',
      description: 'FAQ, ejercicios y recursos validados por psicólogos deportivos',
      color: 'bg-green-500'
    },
    {
      icon: '💬',
      title: 'Multicanal',
      description: 'Web, Discord, WhatsApp - niños eligen su plataforma favorita',
      color: 'bg-purple-500'
    },
    {
      icon: '🔒',
      title: 'Circuito Cerrado',
      description: 'Solo responde con contenido aprobado - sin alucinaciones',
      color: 'bg-yellow-500'
    },
    {
      icon: '📊',
      title: 'Dashboard para Padres',
      description: 'Monitoreo del estado emocional y progreso del niño',
      color: 'bg-pink-500'
    }
  ];

  return (
    <section id="producto" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Producto 100% Operativo</h2>
          <p className="text-xl text-gray-600">Sin mockups - Todo funcional y listo para escalar</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className={`w-16 h-16 ${feature.color} rounded-lg flex items-center justify-center text-3xl mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Demo Screenshot/Video */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">🎯 Ver la Plataforma en Acción</h3>
          <p className="text-xl mb-6">Panel de administración completo con métricas en tiempo real</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-6">
            <div className="text-8xl mb-4">📊</div>
            <p className="text-lg">Dashboard Interactivo • API REST • Análisis IA Real</p>
          </div>
          <a 
            href="/admin" 
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all"
          >
            Acceder al Dashboard →
          </a>
        </div>
      </div>
    </section>
  );
}
