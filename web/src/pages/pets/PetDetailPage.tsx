import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, PencilIcon, HeartIcon, CameraIcon } from '@heroicons/react/24/outline'
import { GlassCard, GlassWidget } from '@/components/ui/GlassContainer'

export const PetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Mock data - replace with real API call
  const pet = {
    _id: id,
    name: 'Rex',
    species: 'dog',
    breed: 'Golden Retriever',
    age: '3 anos',
    weight: '25.5 kg',
    height: '60 cm',
    gender: 'Macho',
    isNeutered: true,
    avatar: null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/20 rounded-glass"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
            <p className="text-gray-600">{pet.breed}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white/50 border border-white/20 rounded-glass hover:bg-white/70 transition-all duration-200">
            <CameraIcon className="h-4 w-4" />
            <span>Adicionar Foto</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-coral-500 text-white rounded-glass hover:bg-coral-600 transition-all duration-200">
            <PencilIcon className="h-4 w-4" />
            <span>Editar</span>
          </button>
        </div>
      </div>

      {/* Pet Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-1">
          <div className="text-center">
            <div className="h-32 w-32 bg-gradient-to-r from-coral-400 to-teal-400 rounded-full flex items-center justify-center text-white text-6xl mx-auto mb-4">
              🐕
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{pet.name}</h2>
            <p className="text-gray-600 mb-4">{pet.breed}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Idade:</span>
                <span className="font-medium">{pet.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peso:</span>
                <span className="font-medium">{pet.weight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Altura:</span>
                <span className="font-medium">{pet.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sexo:</span>
                <span className="font-medium">{pet.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Castrado:</span>
                <span className="font-medium">{pet.isNeutered ? 'Sim' : 'Não'}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="lg:col-span-2 space-y-6">
          {/* Health Status */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status de Saúde</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <GlassWidget className="p-4 text-center">
                <HeartIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Status Geral</p>
                <p className="font-semibold text-green-600">Saudável</p>
              </GlassWidget>
              <GlassWidget className="p-4 text-center">
                <p className="text-sm text-gray-600">IMC</p>
                <p className="font-semibold text-gray-900">23.2</p>
                <p className="text-xs text-green-600">Normal</p>
              </GlassWidget>
              <GlassWidget className="p-4 text-center">
                <p className="text-sm text-gray-600">Última Consulta</p>
                <p className="font-semibold text-gray-900">15 dias atrás</p>
              </GlassWidget>
            </div>
          </GlassCard>

          {/* Recent Records */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registros Recentes</h3>
            <div className="space-y-3">
              <div className="p-3 bg-white/30 rounded-glass">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">Peso registrado</p>
                    <p className="text-sm text-gray-600">25.5kg - Dentro do normal</p>
                  </div>
                  <span className="text-xs text-gray-500">2 dias atrás</span>
                </div>
              </div>
              <div className="p-3 bg-white/30 rounded-glass">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">Atividade física</p>
                    <p className="text-sm text-gray-600">Caminhada de 45 minutos</p>
                  </div>
                  <span className="text-xs text-gray-500">3 dias atrás</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}