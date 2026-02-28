'use client';

/**
 * Content Library Component
 * Biblioteca de FAQ, ejercicios y contenido educativo
 */

import { useState, useEffect } from 'react';

export default function ContentLibrary() {
  const [content, setContent] = useState({ faq: [], exercises: [] });
  const [activeType, setActiveType] = useState('faq'); // faq, exercises
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [faqRes, exercisesRes] = await Promise.all([
        fetch('/api/content/faq'),
        fetch('/api/content/exercises')
      ]);
      
      const faqData = await faqRes.json();
      const exercisesData = await exercisesRes.json();
      
      setContent({
        faq: faqData.items || [],
        exercises: exercisesData.items || []
      });
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'Presión Competitiva', icon: '🏆', color: 'bg-red-100 text-red-700' },
    { id: 'Ansiedad Pre-Competencia', icon: '😰', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'Manejo de Fracaso', icon: '💪', color: 'bg-blue-100 text-blue-700' },
    { id: 'Presión Familiar', icon: '👨‍👩‍👦', color: 'bg-purple-100 text-purple-700' },
    { id: 'Burnout Deportivo', icon: '🔥', color: 'bg-orange-100 text-orange-700' },
  ];

  const currentItems = content[activeType];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Biblioteca de Contenido</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveType('faq')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeType === 'faq' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💬 FAQ ({content.faq.length})
          </button>
          <button
            onClick={() => setActiveType('exercises')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeType === 'exercises' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏃 Ejercicios ({content.exercises.length})
          </button>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const count = currentItems.filter(item => item.category === cat.id).length;
          return (
            <div key={cat.id} className={`p-4 rounded-lg ${cat.color}`}>
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs font-medium">{cat.id}</p>
            </div>
          );
        })}
      </div>

      {/* Content Items */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Sin contenido</h3>
          <p className="text-gray-600">Importa contenido desde NotebookLM para comenzar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      categories.find(c => c.id === item.category)?.color || 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.category}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      ✅ Aprobado
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title || item.question}</h3>
                  {item.curator && (
                    <p className="text-sm text-gray-600 mt-1">
                      Curado por: {item.curator}
                    </p>
                  )}
                </div>
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
                  Editar
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {activeType === 'faq' ? item.answer : item.description}
                </p>
              </div>

              {activeType === 'exercises' && item.duration && (
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                  <span>⏱️ Duración: {item.duration}</span>
                  <span>📊 Dificultad: {item.difficulty || 'Media'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
