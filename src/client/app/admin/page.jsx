'use client';

/**
 * Fair Support Fair Play - Admin Dashboard
 * ==========================================
 * 
 * Panel de administración completo para gestión de contenido y monitoreo
 * 
 * Consultor y Curador de Contenido: Marcelo Roffé
 * © Fair Support Fair Play 2026 - Todos los derechos reservados
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '../components/admin/AdminHeader';
import MetricsOverview from '../components/admin/MetricsOverview';
import PendingReviewsPanel from '../components/admin/PendingReviewsPanel';
import AlertsPanel from '../components/admin/AlertsPanel';
import ContentLibrary from '../components/admin/ContentLibrary';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch metrics
  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/analytics/overview');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Vista General', icon: '📊' },
    { id: 'reviews', name: 'Revisión Contenido', icon: '✅' },
    { id: 'alerts', name: 'Alertas', icon: '🚨' },
    { id: 'content', name: 'Biblioteca', icon: '📚' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          <p className="text-lg text-gray-600">
            Gestión de contenido y monitoreo de alertas
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-2">
          <nav className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <MetricsOverview metrics={metrics} onRefresh={fetchMetrics} />}
              {activeTab === 'reviews' && <PendingReviewsPanel onRefresh={fetchMetrics} />}
              {activeTab === 'alerts' && <AlertsPanel />}
              {activeTab === 'content' && <ContentLibrary />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
