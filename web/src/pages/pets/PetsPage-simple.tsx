import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlusIcon, HeartIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { usePetStore } from '@/stores/petStore'
import { useAuthStore } from '@/stores/authStore'
import { AddPetModal } from '@/components/modals/AddPetModal'
import { GlassContainer } from '@/components/ui/GlassContainer'
import { OiPetLogo } from '@/components/ui/OiPetLogo'

const PetsPage: React.FC = () => {
  const { pets, fetchPets, isLoading } = usePetStore()
  const { user, logout } = useAuthStore()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  const handleAddPetSuccess = () => {
    // Refresh pets list after adding new pet
    fetchPets()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/20 backdrop-blur-lg border-b border-white/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <OiPetLogo size="md" showText={true} />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">Meus Pets</h1>
                <p className="text-sm text-gray-600">Gerencie seus pets</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/app/dashboard"
                className="text-coral-600 hover:text-coral-700 font-medium text-sm"
              >
                ← Dashboard
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-coral-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.[0] || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || 'Usuário'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Add Pet Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Adicionar Pet</span>
          </motion.button>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando pets...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && pets.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassContainer className="text-center py-12">
              <div className="text-6xl mb-4">🐕</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Nenhum pet cadastrado
              </h3>
              <p className="text-gray-600 mb-6">
                Comece adicionando o seu primeiro pet para monitorar sua saúde!
              </p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary"
              >
                Adicionar Primeiro Pet
              </motion.button>
            </GlassContainer>
          </motion.div>
        )}

        {/* Pets Grid */}
        {!isLoading && pets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {pets.map((pet, index) => (
              <motion.div
                key={pet._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
              >
                <GlassContainer className="p-6 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-coral-500 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl">
                        {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {pet.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {pet.breed}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Peso:</span>
                      <span className="font-medium">{pet.weight}kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Idade:</span>
                      <span className="font-medium">{new Date().getFullYear() - new Date(pet.birthDate).getFullYear()} anos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sexo:</span>
                      <span className="font-medium">{pet.gender === 'male' ? 'Macho' : 'Fêmea'}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 btn-glass text-sm flex items-center justify-center space-x-1"
                    >
                      <ChartBarIcon className="h-4 w-4" />
                      <span>Detalhes</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-1"
                    >
                      <HeartIcon className="h-4 w-4" />
                      <span>Saúde</span>
                    </motion.button>
                  </div>
                </GlassContainer>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>

      {/* Add Pet Modal */}
      <AddPetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddPetSuccess}
      />
    </div>
  )
}

export default PetsPage
export { PetsPage }
