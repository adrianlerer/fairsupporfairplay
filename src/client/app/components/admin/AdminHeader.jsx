'use client';

/**
 * Admin Header Component
 */

export default function AdminHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">🏆</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Fair Support Fair Play</h1>
              <p className="text-sm text-gray-500">Panel Administrativo</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Importar NotebookLM
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
