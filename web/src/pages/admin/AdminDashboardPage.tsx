import React from 'react'
import { GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { UsersIcon, HeartIcon, ChartBarIcon, BellIcon } from '@heroicons/react/24/outline'

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuários</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-glass">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pets</p>
              <p className="text-2xl font-bold text-gray-900">2,156</p>
            </div>
            <div className="p-3 bg-green-100 rounded-glass">
              <HeartIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Registros</p>
              <p className="text-2xl font-bold text-gray-900">15,432</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-glass">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Notificações</p>
              <p className="text-2xl font-bold text-gray-900">3,421</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-glass">
              <BellIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </GlassWidget>
      </div>

      <GlassCard>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Estatísticas</h2>
        <p className="text-gray-600">Gráficos e métricas detalhadas em desenvolvimento...</p>
      </GlassCard>
    </div>
  )
}