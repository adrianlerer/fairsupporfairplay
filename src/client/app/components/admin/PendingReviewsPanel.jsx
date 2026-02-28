'use client';

/**
 * Pending Reviews Panel
 * Panel para revisar y aprobar/rechazar contenido importado
 */

import { useState, useEffect } from 'react';

export default function PendingReviewsPanel({ onRefresh }) {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      const response = await fetch('/api/admin/pending-reviews');
      const data = await response.json();
      setPendingItems(data.items || []);
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      const response = await fetch('/api/admin/approve-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: id })
      });
      
      if (response.ok) {
        alert('✅ Contenido aprobado y publicado');
        fetchPendingReviews();
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      alert('❌ Error al aprobar contenido');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;

    setProcessingId(id);
    try {
      const response = await fetch('/api/admin/reject-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: id, rejection_reason: reason })
      });
      
      if (response.ok) {
        alert('✅ Contenido rechazado');
        fetchPendingReviews();
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      alert('❌ Error al rechazar contenido');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Contenido Pendiente de Revisión ({pendingItems.length})
        </h2>
        <button
          onClick={fetchPendingReviews}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>

      {pendingItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Todo revisado</h3>
          <p className="text-gray-600">No hay contenido pendiente de revisión</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.content_type === 'faq' ? 'bg-blue-100 text-blue-700' :
                    item.content_type === 'exercise' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {item.content_type === 'faq' ? '💬 FAQ' :
                     item.content_type === 'exercise' ? '🏃 Ejercicio' :
                     '📚 Artículo'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">
                      Categoría: {item.category} • Curado por: {item.curator || 'N/A'}
                    </p>
                  </div>
                </div>
                
                {/* AI Safety Check */}
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.ai_safety_check?.risk_level === 'low' ? 'bg-green-100 text-green-700' :
                  item.ai_safety_check?.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  AI Check: {item.ai_safety_check?.risk_level || 'pending'}
                </div>
              </div>

              {/* Content */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>
              </div>

              {/* AI Recommendations */}
              {item.ai_safety_check?.recommendations && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">🤖 Recomendaciones IA:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {item.ai_safety_check.recommendations.map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleApprove(item.id)}
                  disabled={processingId === item.id}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === item.id ? '⏳ Procesando...' : '✅ Aprobar y Publicar'}
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  disabled={processingId === item.id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ❌ Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
