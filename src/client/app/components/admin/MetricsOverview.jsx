'use client';

/**
 * Metrics Overview Component
 * Muestra estadísticas clave del sistema
 */

export default function MetricsOverview({ metrics, onRefresh }) {
  if (!metrics) {
    return <div>Cargando métricas...</div>;
  }

  const statCards = [
    {
      title: 'Contenido Pendiente',
      value: metrics.pending_reviews || 0,
      icon: '⏳',
      color: 'bg-yellow-500',
      trend: 'neutral'
    },
    {
      title: 'FAQ Aprobadas',
      value: metrics.approved_faq || 0,
      icon: '✅',
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'Alertas Rojas',
      value: metrics.red_alerts || 0,
      icon: '🔴',
      color: 'bg-red-500',
      trend: metrics.red_alerts > 0 ? 'down' : 'neutral'
    },
    {
      title: 'Alertas Amarillas',
      value: metrics.yellow_alerts || 0,
      icon: '🟡',
      color: 'bg-yellow-500',
      trend: 'neutral'
    },
    {
      title: 'Consultas (7d)',
      value: metrics.total_queries || 0,
      icon: '💬',
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Tasa Aprobación',
      value: `${metrics.approval_rate || 0}%`,
      icon: '📈',
      color: 'bg-purple-500',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Métricas del Sistema</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              {stat.trend === 'up' && <span className="text-green-500">↗</span>}
              {stat.trend === 'down' && <span className="text-red-500">↘</span>}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {metrics.recent_queries?.map((query, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
              <span className="text-2xl">{query.emotion === 'ansiedad' ? '😰' : '😊'}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{query.child_name}</p>
                <p className="text-xs text-gray-600">{query.category}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                query.alert_level === 'red' ? 'bg-red-100 text-red-700' :
                query.alert_level === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {query.alert_level === 'red' ? '🔴 Crítico' :
                 query.alert_level === 'yellow' ? '🟡 Atención' :
                 '🟢 Normal'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Consultas por Plataforma (últimos 7 días)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.platform_stats?.map((platform, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">{platform.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{platform.count}</p>
              <p className="text-sm text-gray-600">{platform.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
