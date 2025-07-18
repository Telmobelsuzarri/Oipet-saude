import React from 'react'
import { GlassCard } from '@/components/ui/GlassContainer'

export const AdminUsersPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
        <p className="text-gray-600 mt-1">Gerenciamento de usuários do sistema</p>
      </div>

      <GlassCard>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Lista de Usuários</h2>
        <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
      </GlassCard>
    </div>
  )
}