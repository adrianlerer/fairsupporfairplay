'use client';

export default function TechnologyStack() {
  const stack = [
    { name: 'Next.js 15', icon: '⚡', category: 'Frontend' },
    { name: 'FastAPI', icon: '🚀', category: 'Backend' },
    { name: 'PostgreSQL', icon: '🐘', category: 'Database' },
    { name: 'OpenAI GPT-4', icon: '🤖', category: 'IA' },
    { name: 'Discord.js', icon: '💬', category: 'Integrations' },
    { name: 'WhatsApp (WAHA)', icon: '📱', category: 'Integrations' },
    { name: 'Vercel', icon: '▲', category: 'Deploy' },
    { name: 'Railway', icon: '🚂', category: 'Deploy' }
  ];

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Stack Tecnológico</h2>
          <p className="text-xl text-gray-400">Infraestructura moderna y escalable</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stack.map((tech, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors">
              <div className="text-4xl mb-2">{tech.icon}</div>
              <div className="font-bold">{tech.name}</div>
              <div className="text-sm text-gray-400">{tech.category}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-600 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">✅ 100% Operativo</h3>
          <p className="text-blue-100">Backend API, Frontend Dashboard, IA Real - Todo funcional</p>
        </div>
      </div>
    </section>
  );
}
