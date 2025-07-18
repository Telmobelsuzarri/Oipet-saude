import React from 'react'
import { GlassCard } from '@/components/ui/GlassContainer'

export const AdminAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Análise de dados e métricas do sistema</p>
      </div>

      <GlassCard>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Métricas</h2>
        <p className="text-gray-600">Dashboards de analytics em desenvolvimento...</p>
      </GlassCard>
    </div>
  )
}