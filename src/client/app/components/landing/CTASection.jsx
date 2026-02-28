'use client';

export default function CTASection({ onDemoClick }) {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-4">¿Listo para Invertir?</h2>
        <p className="text-xl text-blue-100 mb-8">
          Únete a nosotros en la misión de proteger la salud mental de millones de niños deportistas
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <button
            onClick={onDemoClick}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all"
          >
            🎯 Ver Demo Completo
          </button>
          <a
            href="mailto:investors@fairsupport.com"
            className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all"
          >
            💰 Solicitar Reunión
          </a>
        </div>

        <p className="text-blue-100">
          📧 investors@fairsupport.com • 📞 +54 11 1234-5678
        </p>
      </div>
    </section>
  );
}
