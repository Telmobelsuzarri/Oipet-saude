import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  HeartIcon,
  CameraIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

import { GlassContainer, GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { AddPetModal } from '@/components/modals/AddPetModal'
import { AddHealthRecordModal } from '@/components/modals/AddHealthRecordModal'
import { 
  calculateAge, 
  formatWeight, 
  formatHeight, 
  getSpeciesEmoji, 
  getIMCClassification,
  getRelativeTime
} from '@/lib/utils'

// Mock data - replace with real data from API
const mockPets = [
  {
    _id: '1',
    name: 'Rex',
    species: 'dog',
    breed: 'Golden Retriever',
    birthDate: '2020-03-15',
    weight: 25.5,
    height: 60.0,
    gender: 'male',
    isNeutered: true,
    avatar: null,
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2025-01-14T10:00:00Z',
    imc: 23.2,
    lastHealthRecord: '2025-01-14T10:00:00Z'
  },
  {
    _id: '2',
    name: 'Mimi',
    species: 'cat',
    breed: 'Persa',
    birthDate: '2021-07-20',
    weight: 4.2,
    height: 25.0,
    gender: 'female',
    isNeutered: true,
    avatar: null,
    createdAt: '2023-02-10T15:30:00Z',
    updatedAt: '2025-01-13T15:30:00Z',
    imc: 19.5,
    lastHealthRecord: '2025-01-13T15:30:00Z'
  },
  {
    _id: '3',
    name: 'Bob',
    species: 'dog',
    breed: 'Bulldog Francês',
    birthDate: '2019-11-30',
    weight: 12.8,
    height: 35.0,
    gender: 'male',
    isNeutered: false,
    avatar: null,
    createdAt: '2023-03-05T12:15:00Z',
    updatedAt: '2025-01-12T12:15:00Z',
    imc: 28.1,
    lastHealthRecord: '2025-01-12T12:15:00Z'
  }
]

interface PetCardProps {
  pet: typeof mockPets[0]
  onEdit: (petId: string) => void
  onDelete: (petId: string) => void
  onViewDetails: (petId: string) => void
  onAddHealthRecord: (petId: string) => void
}

const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete, onViewDetails, onAddHealthRecord }) => {
  const [showActions, setShowActions] = React.useState(false)
  const { classification, color } = getIMCClassification(pet.imc)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard 
        hover
        onClick={() => onViewDetails(pet._id)}
        className="relative overflow-hidden"
      >
        {/* Pet Avatar */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            {pet.avatar ? (
              <img
                src={pet.avatar}
                alt={pet.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 bg-gradient-to-r from-coral-400 to-teal-400 rounded-full flex items-center justify-center text-white text-2xl">
                {getSpeciesEmoji(pet.species)}
              </div>
            )}
            <button className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
              <CameraIcon className="h-3 w-3 text-gray-600" />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowActions(!showActions)
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </button>

                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-8 z-10 w-48 bg-white/90 backdrop-blur-sm rounded-glass border border-white/20 shadow-lg py-1"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewDetails(pet._id)
                          setShowActions(false)
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/50"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>Ver detalhes</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(pet._id)
                          setShowActions(false)
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/50"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(pet._id)
                          setShowActions(false)
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50/50"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>Excluir</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <p className="text-sm text-gray-600">{pet.breed}</p>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-xs text-gray-500">{calculateAge(pet.birthDate)}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500 capitalize">{pet.gender}</span>
              {pet.isNeutered && (
                <>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-green-600">Castrado</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Health Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Peso</p>
            <p className="font-semibold text-gray-900">{formatWeight(pet.weight)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Altura</p>
            <p className="font-semibold text-gray-900">{formatHeight(pet.height)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">IMC</p>
            <p className={`font-semibold ${color}`}>{pet.imc.toFixed(1)}</p>
          </div>
        </div>

        {/* Health Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HeartSolidIcon className={`h-4 w-4 ${color}`} />
            <span className={`text-sm font-medium ${color}`}>{classification}</span>
          </div>
          <p className="text-xs text-gray-500">
            Última consulta: {getRelativeTime(pet.lastHealthRecord)}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200/50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              onAddHealthRecord(pet._id)
            }}
            className="flex items-center space-x-1 px-3 py-1 bg-coral-100 text-coral-700 rounded-glass text-xs font-medium hover:bg-coral-200 transition-colors"
          >
            <HeartIcon className="h-3 w-3" />
            <span>Saúde</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              // Photo action
            }}
            className="flex items-center space-x-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-glass text-xs font-medium hover:bg-teal-200 transition-colors"
          >
            <CameraIcon className="h-3 w-3" />
            <span>Foto</span>
          </motion.button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export const PetsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterSpecies, setFilterSpecies] = React.useState<string>('all')
  const [showFilters, setShowFilters] = React.useState(false)
  const [showAddPetModal, setShowAddPetModal] = React.useState(false)
  const [showHealthRecordModal, setShowHealthRecordModal] = React.useState(false)
  const [selectedPetForHealth, setSelectedPetForHealth] = React.useState<string | null>(null)
  const [pets, setPets] = React.useState(mockPets)

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecies = filterSpecies === 'all' || pet.species === filterSpecies
    return matchesSearch && matchesSpecies
  })

  const handleEdit = (petId: string) => {
    const pet = pets.find(p => p._id === petId)
    if (pet) {
      alert(`Funcionalidade de edição será implementada em breve para ${pet.name}!`)
    }
  }

  const handleDelete = (petId: string) => {
    const pet = pets.find(p => p._id === petId)
    if (pet && window.confirm(`Tem certeza que deseja remover ${pet.name}?`)) {
      setPets(prevPets => prevPets.filter(p => p._id !== petId))
      console.log('Pet deleted:', petId)
    }
  }

  const handleViewDetails = (petId: string) => {
    const pet = pets.find(p => p._id === petId)
    if (pet) {
      alert(`Detalhes do ${pet.name}:\n\nEspécie: ${pet.species}\nRaça: ${pet.breed}\nIdade: ${calculateAge(pet.birthDate)}\nPeso: ${formatWeight(pet.weight)}\nAltura: ${formatHeight(pet.height)}\nSexo: ${pet.gender}\nCastrado: ${pet.isNeutered ? 'Sim' : 'Não'}`)
    }
  }

  const handleAddPet = (newPet: any) => {
    setPets(prevPets => [...prevPets, newPet])
  }

  const handleAddHealthRecord = (petId: string) => {
    setSelectedPetForHealth(petId)
    setShowHealthRecordModal(true)
  }

  const handleHealthRecordSuccess = (record: any) => {
    console.log('Health record added:', record)
    // In a real app, this would update the pet's health records
  }

  const speciesStats = {
    total: pets.length,
    dogs: pets.filter(p => p.species === 'dog').length,
    cats: pets.filter(p => p.species === 'cat').length,
    others: pets.filter(p => !['dog', 'cat'].includes(p.species)).length
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Pets</h1>
            <p className="text-gray-600 mt-1">
              Gerencie todos os seus companheiros peludos
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddPetModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white px-6 py-3 rounded-glass font-medium hover:from-coral-600 hover:to-coral-700 transition-all duration-200"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Adicionar Pet</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <GlassWidget className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{speciesStats.total}</p>
          <p className="text-sm text-gray-600">Total</p>
        </GlassWidget>
        <GlassWidget className="p-4 text-center">
          <p className="text-2xl font-bold text-coral-600">{speciesStats.dogs}</p>
          <p className="text-sm text-gray-600">Cães</p>
        </GlassWidget>
        <GlassWidget className="p-4 text-center">
          <p className="text-2xl font-bold text-teal-600">{speciesStats.cats}</p>
          <p className="text-sm text-gray-600">Gatos</p>
        </GlassWidget>
        <GlassWidget className="p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{speciesStats.others}</p>
          <p className="text-sm text-gray-600">Outros</p>
        </GlassWidget>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassContainer variant="widget" className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou raça..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/50 border border-white/20 rounded-glass hover:bg-white/70 transition-all duration-200"
              >
                <FunnelIcon className="h-5 w-5 text-gray-600" />
                <span>Filtros</span>
                {filterSpecies !== 'all' && (
                  <span className="inline-flex items-center justify-center h-2 w-2 bg-coral-500 rounded-full"></span>
                )}
              </button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-12 z-10 w-48 bg-white/90 backdrop-blur-sm rounded-glass border border-white/20 shadow-lg py-2"
                  >
                    <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-200/50">
                      Filtrar por espécie
                    </div>
                    {[
                      { value: 'all', label: 'Todos' },
                      { value: 'dog', label: 'Cães' },
                      { value: 'cat', label: 'Gatos' },
                      { value: 'other', label: 'Outros' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterSpecies(option.value)
                          setShowFilters(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100/50 transition-colors ${
                          filterSpecies === option.value ? 'text-coral-600 bg-coral-50/50' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </GlassContainer>
      </motion.div>

      {/* Pets Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {filteredPets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPets.map((pet) => (
                <PetCard
                  key={pet._id}
                  pet={pet}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                  onAddHealthRecord={handleAddHealthRecord}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <GlassCard className="text-center py-12">
            <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterSpecies !== 'all' 
                ? 'Nenhum pet encontrado' 
                : 'Nenhum pet cadastrado'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterSpecies !== 'all'
                ? 'Tente ajustar os filtros ou buscar por outro termo'
                : 'Comece adicionando seu primeiro pet para começar a monitorar sua saúde'
              }
            </p>
            {(!searchTerm && filterSpecies === 'all') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddPetModal(true)}
                className="bg-gradient-to-r from-coral-500 to-coral-600 text-white px-6 py-3 rounded-glass font-medium hover:from-coral-600 hover:to-coral-700 transition-all duration-200"
              >
                Adicionar Primeiro Pet
              </motion.button>
            )}
          </GlassCard>
        )}
      </motion.div>

      {/* Add Pet Modal */}
      <AddPetModal
        isOpen={showAddPetModal}
        onClose={() => setShowAddPetModal(false)}
        onSuccess={handleAddPet}
      />

      {/* Add Health Record Modal */}
      <AddHealthRecordModal
        isOpen={showHealthRecordModal}
        onClose={() => {
          setShowHealthRecordModal(false)
          setSelectedPetForHealth(null)
        }}
        onSuccess={handleHealthRecordSuccess}
        petId={selectedPetForHealth || undefined}
        petName={selectedPetForHealth ? pets.find(p => p._id === selectedPetForHealth)?.name : undefined}
      />
    </div>
  )
}