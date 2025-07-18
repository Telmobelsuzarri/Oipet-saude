import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePetStore } from '@/stores/petStore'
import { useAuthStore } from '@/stores/authStore'
import { AddPetModal } from '@/components/modals/AddPetModal'

export const PetsPage: React.FC = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                to="/app/dashboard"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                🐾 Meus Pets
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Add Pet Button */}
        <div className="mb-8">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <span>➕</span>
            <span>Adicionar Pet</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando pets...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && pets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐕</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Nenhum pet cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece adicionando o seu primeiro pet para monitorar sua saúde!
            </p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Adicionar Primeiro Pet
            </button>
          </div>
        )}

        {/* Pets Grid */}
        {!isLoading && pets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div key={pet._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
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
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Peso:</span>
                      <span>{pet.weight}kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Idade:</span>
                      <span>{new Date().getFullYear() - new Date(pet.birthDate).getFullYear()} anos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sexo:</span>
                      <span>{pet.gender === 'male' ? 'Macho' : 'Fêmea'}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-teal-50 text-teal-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-100">
                      Ver Detalhes
                    </button>
                    <button className="flex-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100">
                      Saúde
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mock Data for Demo */}
        {!isLoading && pets.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Para demonstração, aqui estão alguns pets de exemplo:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Rex', species: 'dog', breed: 'Golden Retriever', weight: 30, gender: 'male' },
                { name: 'Mimi', species: 'cat', breed: 'Siamês', weight: 4, gender: 'female' },
                { name: 'Buddy', species: 'dog', breed: 'Labrador', weight: 28, gender: 'male' },
              ].map((pet, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 opacity-50">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">
                        {pet.species === 'dog' ? '🐕' : '🐱'}
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
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Peso:</span>
                      <span>{pet.weight}kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sexo:</span>
                      <span>{pet.gender === 'male' ? 'Macho' : 'Fêmea'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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