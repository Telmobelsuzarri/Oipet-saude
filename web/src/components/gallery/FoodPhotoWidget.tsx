import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PhotoIcon,
  CameraIcon,
  ArrowRightIcon,
  PlusIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

import { GlassWidget } from '@/components/ui/GlassContainer'
import { usePetStore } from '@/stores/petStore'
import { 
  foodGalleryService, 
  type FoodPhoto, 
  type FoodGalleryStats 
} from '@/services/foodGalleryService'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface FoodPhotoWidgetProps {
  petId?: string
  className?: string
}

export const FoodPhotoWidget: React.FC<FoodPhotoWidgetProps> = ({
  petId,
  className
}) => {
  const [recentPhotos, setRecentPhotos] = useState<FoodPhoto[]>([])
  const [stats, setStats] = useState<FoodGalleryStats | null>(null)
  const [loading, setLoading] = useState(false)
  
  const { pets } = usePetStore()
  const navigate = useNavigate()

  // Usar primeiro pet se nenhum ID for fornecido
  const targetPetId = petId || (pets.length > 0 ? pets[0]._id : null)

  useEffect(() => {
    if (targetPetId) {
      loadData()
    }
  }, [targetPetId])

  const loadData = () => {
    if (!targetPetId) return

    try {
      const photos = foodGalleryService.getPhotosByPet(targetPetId).slice(0, 4)
      const petStats = foodGalleryService.getGalleryStats(targetPetId)
      
      setRecentPhotos(photos)
      setStats(petStats)
    } catch (error) {
      console.error('Erro ao carregar dados da galeria:', error)
    }
  }

  const getMealTypeIcon = (mealType: FoodPhoto['mealType']) => {
    switch (mealType) {
      case 'breakfast': return '🌅'
      case 'lunch': return '🍽️'
      case 'dinner': return '🌙'
      case 'snack': return '🥨'
      default: return '🍖'
    }
  }

  const selectedPet = pets.find(p => p._id === targetPetId)

  if (!targetPetId || !pets.length) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <GlassWidget className="relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-coral-500 to-teal-500 rounded-glass text-white">
              <PhotoIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                Galeria de Alimentação
              </h3>
              <p className="text-gray-600 text-sm">
                {selectedPet ? `${selectedPet.name}` : 'Seus pets'}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/app/gallery')}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowRightIcon className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-coral-600">{stats.totalPhotos}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-teal-600">{stats.photosThisWeek}</div>
                <div className="text-xs text-gray-600">Semana</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{stats.photosThisMonth}</div>
                <div className="text-xs text-gray-600">Mês</div>
              </div>
            </div>
            
            {/* Stock Stats */}
            {stats.stockStats && stats.stockStats.totalItems > 0 && (
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-glass p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">📦</span>
                    <span className="text-xs font-medium text-gray-700">Estoque</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {stats.stockStats.itemsWithStock}/{stats.stockStats.totalItems} itens
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {stats.stockStats.itemsLowStock > 0 && (
                    <div className="text-center">
                      <div className="text-sm font-bold text-yellow-600">{stats.stockStats.itemsLowStock}</div>
                      <div className="text-yellow-600">Baixo</div>
                    </div>
                  )}
                  {stats.stockStats.itemsOutOfStock > 0 && (
                    <div className="text-center">
                      <div className="text-sm font-bold text-red-600">{stats.stockStats.itemsOutOfStock}</div>
                      <div className="text-red-600">Acabaram</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Photos */}
        {recentPhotos.length > 0 ? (
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-medium text-gray-900">Fotos Recentes</h4>
            <div className="grid grid-cols-2 gap-3">
              {recentPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-glass overflow-hidden cursor-pointer group"
                  onClick={() => navigate('/app/gallery')}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || 'Foto de alimento'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  
                  {/* Meal type indicator */}
                  <div className="absolute top-1 left-1 bg-white/90 px-1.5 py-0.5 rounded text-xs flex items-center space-x-1">
                    <span className="text-xs">{getMealTypeIcon(photo.mealType)}</span>
                  </div>
                  
                  {/* Stock indicator */}
                  {photo.stockInfo && (
                    <div className="absolute top-1 right-1 bg-teal-500 text-white px-1.5 py-0.5 rounded text-xs flex items-center space-x-1">
                      <span>📦</span>
                      <span>{photo.stockInfo.currentQuantity}</span>
                      {photo.stockInfo.currentQuantity <= photo.stockInfo.minimumAlert && (
                        <span className="text-yellow-300">⚠️</span>
                      )}
                    </div>
                  )}

                  {/* Date */}
                  <div className="absolute bottom-1 left-1 text-white text-xs font-medium">
                    {photo.timestamp.toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit' 
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 mb-4">
            <PhotoIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm mb-2">
              Nenhuma foto ainda
            </p>
            <p className="text-xs text-gray-400">
              Fotografe as refeições do seu pet
            </p>
          </div>
        )}

        {/* Last photo date */}
        {stats?.lastPhotoDate && (
          <div className="bg-gray-50 rounded-glass p-3 mb-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4" />
              <span>
                Última foto: {stats.lastPhotoDate.toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/app/gallery')}
            className="bg-coral-500 text-white px-4 py-2 rounded-glass hover:bg-coral-600 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
          >
            <CameraIcon className="h-4 w-4" />
            <span>Fotografar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/app/gallery')}
            className="bg-white/50 text-gray-700 px-4 py-2 rounded-glass hover:bg-white/70 transition-colors border border-gray-200 text-sm font-medium flex items-center justify-center space-x-2"
          >
            <span>Ver Galeria</span>
            <ArrowRightIcon className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Favorite Food */}
        {stats?.favoriteFood && (
          <div className="mt-3 text-center">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-glass p-2">
              <p className="text-xs text-orange-700">
                <span className="font-medium">Favorito:</span> {stats.favoriteFood}
              </p>
            </div>
          </div>
        )}
      </GlassWidget>
    </motion.div>
  )
}