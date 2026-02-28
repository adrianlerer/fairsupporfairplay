'use client';

export default function TeamSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Equipo & Advisors</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
              FS
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Founders & Socios</h3>
            <p className="text-gray-600">Equipo técnico y de negocio</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
              MR
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Marcelo Roffé</h3>
            <p className="text-gray-600">Consultor y Curador de Contenido</p>
            <p className="text-sm text-gray-500 mt-2">Psicólogo deportivo reconocido</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
              +
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Advisors Adicionales</h3>
            <p className="text-gray-600">Psicólogos y expertos en deportes infantiles</p>
          </div>
        </div>
      </div>
    </section>
  );
}
