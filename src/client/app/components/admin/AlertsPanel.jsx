'use client';

/**
 * Alerts Panel
 * Monitoreo de alertas de niños deportistas
 */

import { useState, useEffect } from 'react';

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all'); // all, red, yellow, green
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      // En producción, esto conectará con /api/alerts/all
      const response = await fetch('/api/alerts/all');
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Demo data para mostrar
      setAlerts([
        {
          id: '1',
          level: 'red',
          child_name: 'Matías',
          age: 14,
          sport: 'fútbol',
          message: 'Ya no sé si quiero seguir jugando... todos esperan que sea el mejor',
          sentiment_score: -0.85,
          created_at: '2026-02-28T10:30:00Z',
          parent_notified: true,
          resolved: false
        },
        {
          id: '2',
          level: 'yellow',
          child_name: 'Sofía',
          age: 12,
          sport: 'tenis',
          message: 'Estoy un poco nerviosa por el torneo de mañana',
          sentiment_score: -0.45,
          created_at: '2026-02-28T11:15:00Z',
          parent_notified: true,
          resolved: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await fetch(`/api/alerts/${alertId}/resolve`, { method: 'POST' });
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.level === filter);

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Sistema de Alertas ({filteredAlerts.length})
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('red')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'red' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            🔴 Críticas
          </button>
          <button
            onClick={() => setFilter('yellow')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'yellow' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            🟡 Atención
          </button>
          <button
            onClick={() => setFilter('green')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'green' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            🟢 Normales
          </button>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">😊</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Sin alertas</h3>
          <p className="text-gray-600">No hay alertas activas en este momento</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
                alert.level === 'red' ? 'border-red-500' :
                alert.level === 'yellow' ? 'border-yellow-500' :
                'border-green-500'
              }`}
            >
              {/* Alert Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    alert.level === 'red' ? 'bg-red-100' :
                    alert.level === 'yellow' ? 'bg-yellow-100' :
                    'bg-green-100'
                  }`}>
                    {alert.level === 'red' ? '🚨' :
                     alert.level === 'yellow' ? '⚠️' :
                     '✅'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {alert.child_name}, {alert.age} años
                    </h3>
                    <p className="text-sm text-gray-600">
                      {alert.sport} • {new Date(alert.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  alert.level === 'red' ? 'bg-red-100 text-red-700' :
                  alert.level === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {alert.level === 'red' ? '🔴 CRÍTICO' :
                   alert.level === 'yellow' ? '🟡 ATENCIÓN' :
                   '🟢 NORMAL'}
                </div>
              </div>

              {/* Message */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-800 italic">"{alert.message}"</p>
              </div>

              {/* Sentiment Score */}
              <div className="mb-4 flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  Análisis de Sentimiento:
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      alert.sentiment_score < -0.6 ? 'bg-red-500' :
                      alert.sentiment_score < -0.3 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.abs(alert.sentiment_score) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">
                  {(alert.sentiment_score * 100).toFixed(0)}
                </span>
              </div>

              {/* Status Badges */}
              <div className="flex items-center space-x-3 mb-4">
                {alert.parent_notified && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    📧 Padre notificado
                  </span>
                )}
                {alert.resolved && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    ✅ Resuelta
                  </span>
                )}
              </div>

              {/* Actions */}
              {!alert.resolved && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    ✅ Marcar como Resuelta
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    📞 Contactar Padre
                  </button>
                  {alert.level === 'red' && (
                    <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                      🚨 Escalar a Profesional
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
