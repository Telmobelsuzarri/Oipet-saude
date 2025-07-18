import React from 'react'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

import { GlassCard } from '@/components/ui/GlassContainer'
import type { ReportFilter } from '@/services/reportService'
import type { Pet } from '@/stores/petStore'
import { cn } from '@/lib/utils'

interface ReportFiltersProps {
  filter: ReportFilter
  pets: Pet[]
  onChange: (filter: Partial<ReportFilter>) => void
}

const periods = [
  { id: 'week', name: 'Esta Semana', description: 'Últimos 7 dias' },
  { id: 'month', name: 'Este Mês', description: 'Mês atual' },
  { id: 'quarter', name: 'Este Trimestre', description: 'Últimos 3 meses' },
  { id: 'year', name: 'Este Ano', description: 'Ano atual' },
  { id: 'custom', name: 'Período Personalizado', description: 'Escolha as datas' }
]

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filter,
  pets,
  onChange
}) => {
  const handlePetToggle = (petId: string) => {
    const currentPetIds = filter.petIds || []
    const newPetIds = currentPetIds.includes(petId)
      ? currentPetIds.filter(id => id !== petId)
      : [...currentPetIds, petId]
    
    onChange({ petIds: newPetIds.length > 0 ? newPetIds : undefined })
  }

  const handleSelectAllPets = () => {
    const allPetIds = pets.map(pet => pet._id)
    const currentPetIds = filter.petIds || []
    
    if (currentPetIds.length === allPetIds.length) {
      onChange({ petIds: undefined }) // Deselect all
    } else {
      onChange({ petIds: allPetIds }) // Select all
    }
  }

  const isPetSelected = (petId: string) => {
    return filter.petIds ? filter.petIds.includes(petId) : true
  }

  const getSelectedPetsCount = () => {
    return filter.petIds ? filter.petIds.length : pets.length
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FunnelIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Filtros do Relatório
          </h3>
        </div>
        
        <div className="text-sm text-gray-600">
          {getSelectedPetsCount()} de {pets.length} pets selecionados
        </div>
      </div>

      <div className="space-y-6">
        {/* Period Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Período
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {periods.map((period) => (
              <motion.button
                key={period.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange({ period: period.id as any })}
                className={cn(
                  'p-3 rounded-glass border text-left transition-all',
                  filter.period === period.id
                    ? 'border-coral-500 bg-coral-50 ring-2 ring-coral-200'
                    : 'border-gray-200 bg-white/30 hover:bg-white/50'
                )}
              >
                <div className="font-medium text-gray-900 text-sm">
                  {period.name}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {period.description}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        {filter.period === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filter.startDate || ''}
                  onChange={(e) => onChange({ startDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filter.endDate || ''}
                  onChange={(e) => onChange({ endDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Pet Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Pets Incluídos
            </label>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSelectAllPets}
              className="text-sm text-coral-600 hover:text-coral-700 font-medium"
            >
              {getSelectedPetsCount() === pets.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </motion.button>
          </div>
          
          {pets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🐾</div>
              <p>Nenhum pet cadastrado</p>
              <p className="text-sm">Cadastre um pet para gerar relatórios</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pets.map((pet) => (
                <motion.button
                  key={pet._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePetToggle(pet._id)}
                  className={cn(
                    'p-3 rounded-glass border text-left transition-all',
                    isPetSelected(pet._id)
                      ? 'border-coral-500 bg-coral-50 ring-2 ring-coral-200'
                      : 'border-gray-200 bg-white/30 hover:bg-white/50'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-coral-400 to-teal-400 flex items-center justify-center text-white text-lg">
                      {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {pet.name}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {pet.species} • {pet.breed}
                      </div>
                    </div>
                    {isPetSelected(pet._id) && (
                      <div className="text-coral-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-glass p-4">
          <h4 className="font-medium text-gray-900 mb-2">Resumo dos Filtros</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>
              <span className="font-medium">Período:</span> {periods.find(p => p.id === filter.period)?.name}
            </div>
            <div>
              <span className="font-medium">Pets:</span> {getSelectedPetsCount()} selecionado(s)
            </div>
            {filter.startDate && filter.endDate && (
              <div>
                <span className="font-medium">Datas:</span> {filter.startDate} até {filter.endDate}
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}