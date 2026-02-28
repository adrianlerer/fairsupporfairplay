'use client';

export default function ProblemSolution() {
  return (
    <section id="problema" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">El Problema que Resolvemos</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            El deporte infantil enfrenta una crisis silenciosa de salud mental
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Problem Side */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8">
            <div className="text-5xl mb-4">😰</div>
            <h3 className="text-2xl font-bold text-red-900 mb-4">Situación Actual</h3>
            <ul className="space-y-3 text-red-800">
              <li className="flex items-start space-x-2">
                <span>❌</span>
                <span><strong>40%</strong> de niños deportistas sufren ansiedad</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>❌</span>
                <span><strong>70%</strong> abandonan antes de los 13 años</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>❌</span>
                <span>Padres no detectan señales de alerta a tiempo</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>❌</span>
                <span>Acceso limitado a psicólogos deportivos</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>❌</span>
                <span>Crisis emocionales no detectadas = traumas permanentes</span>
              </li>
            </ul>
          </div>

          {/* Solution Side */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-green-900 mb-4">Nuestra Solución</h3>
            <ul className="space-y-3 text-green-800">
              <li className="flex items-start space-x-2">
                <span>✅</span>
                <span><strong>IA 24/7</strong> detecta crisis emocionales en tiempo real</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>✅</span>
                <span><strong>Alertas automáticas</strong> a padres (🟢🟡🔴)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>✅</span>
                <span><strong>Contenido curado</strong> por expertos en psicología deportiva</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>✅</span>
                <span><strong>Multicanal:</strong> Web, Discord, WhatsApp, SMS</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>✅</span>
                <span><strong>Circuito cerrado</strong> - sin alucinaciones de IA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Key Differentiator */}
        <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
          <h3 className="text-3xl font-bold mb-4">🎯 Nuestro Diferenciador Clave</h3>
          <p className="text-xl mb-4">
            Somos la <strong>única plataforma</strong> que combina:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-4xl mb-2">🤖</div>
              <p className="font-bold">IA Real (GPT-4)</p>
            </div>
            <div>
              <div className="text-4xl mb-2">👨‍⚕️</div>
              <p className="font-bold">Contenido Experto</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🚨</div>
              <p className="font-bold">Alertas Preventivas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
