import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  HeartIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  UserIcon,
  CalendarIcon,
  ScaleIcon,
  CakeIcon,
  BeakerIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import { GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { OiPetLogo } from '@/components/ui/OiPetLogo'

interface Pet {
  _id: string
  name: string
  species: 'dog' | 'cat' | 'other'
  breed: string
  age: number
  weight: number
  height: number
  gender: 'male' | 'female'
  isNeutered: boolean
  owner: {
    _id: string
    name: string
    email: string
  }
  healthRecords: number
  lastVisit?: string
  status: 'healthy' | 'sick' | 'treatment' | 'critical'
  createdAt: string
}

interface PetFilters {
  search: string
  species: 'all' | 'dog' | 'cat' | 'other'
  status: 'all' | 'healthy' | 'sick' | 'treatment' | 'critical'
  gender: 'all' | 'male' | 'female'
  isNeutered: 'all' | 'yes' | 'no'
  ageRange: 'all' | 'puppy' | 'adult' | 'senior'
}

interface PetStats {
  totalPets: number
  bySpecies: {
    dogs: number
    cats: number
    others: number
  }
  byStatus: {
    healthy: number
    sick: number
    treatment: number
    critical: number
  }
  avgAge: number
  avgWeight: number
  totalHealthRecords: number
}

export const AdminPetsPage: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([])
  const [filteredPets, setFilteredPets] = useState<Pet[]>([])
  const [filters, setFilters] = useState<PetFilters>({
    search: '',
    species: 'all',
    status: 'all',
    gender: 'all',
    isNeutered: 'all',
    ageRange: 'all'
  })
  const [stats, setStats] = useState<PetStats>({
    totalPets: 0,
    bySpecies: { dogs: 0, cats: 0, others: 0 },
    byStatus: { healthy: 0, sick: 0, treatment: 0, critical: 0 },
    avgAge: 0,
    avgWeight: 0,
    totalHealthRecords: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const petsPerPage = 10

  useEffect(() => {
    const loadPets = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Simulando dados até a API estar pronta
        const mockPets: Pet[] = [
          {
            _id: '1',
            name: 'Rex',
            species: 'dog',
            breed: 'Golden Retriever',
            age: 3,
            weight: 30.5,
            height: 65,
            gender: 'male',
            isNeutered: true,
            owner: {
              _id: '1',
              name: 'João Silva',
              email: 'joao@email.com'
            },
            healthRecords: 15,
            lastVisit: '2025-01-15T10:00:00Z',
            status: 'healthy',
            createdAt: '2024-06-10T10:00:00Z'
          },
          {
            _id: '2',
            name: 'Luna',
            species: 'cat',
            breed: 'Siamês',
            age: 2,
            weight: 4.2,
            height: 25,
            gender: 'female',
            isNeutered: true,
            owner: {
              _id: '2',
              name: 'Maria Santos',
              email: 'maria@email.com'
            },
            healthRecords: 8,
            lastVisit: '2025-01-18T14:30:00Z',
            status: 'healthy',
            createdAt: '2024-08-15T09:15:00Z'
          },
          {
            _id: '3',
            name: 'Thor',
            species: 'dog',
            breed: 'Pastor Alemão',
            age: 5,
            weight: 38.0,
            height: 70,
            gender: 'male',
            isNeutered: false,
            owner: {
              _id: '3',
              name: 'Carlos Oliveira',
              email: 'carlos@email.com'
            },
            healthRecords: 22,
            lastVisit: '2025-01-10T11:20:00Z',
            status: 'treatment',
            createdAt: '2023-03-20T11:20:00Z'
          },
          {
            _id: '4',
            name: 'Mimi',
            species: 'cat',
            breed: 'Persa',
            age: 4,
            weight: 5.5,
            height: 30,
            gender: 'female',
            isNeutered: true,
            owner: {
              _id: '4',
              name: 'Ana Costa',
              email: 'ana@email.com'
            },
            healthRecords: 12,
            lastVisit: '2025-01-12T16:00:00Z',
            status: 'sick',
            createdAt: '2023-09-10T14:45:00Z'
          },
          {
            _id: '5',
            name: 'Max',
            species: 'dog',
            breed: 'Bulldog',
            age: 6,
            weight: 25.0,
            height: 45,
            gender: 'male',
            isNeutered: true,
            owner: {
              _id: '5',
              name: 'Pedro Almeida',
              email: 'pedro@email.com'
            },
            healthRecords: 18,
            lastVisit: '2025-01-05T09:30:00Z',
            status: 'critical',
            createdAt: '2022-12-01T16:30:00Z'
          },
          {
            _id: '6',
            name: 'Bella',
            species: 'dog',
            breed: 'Poodle',
            age: 1,
            weight: 8.5,
            height: 35,
            gender: 'female',
            isNeutered: false,
            owner: {
              _id: '6',
              name: 'Fernanda Lima',
              email: 'fernanda@email.com'
            },
            healthRecords: 3,
            lastVisit: '2025-01-17T10:15:00Z',
            status: 'healthy',
            createdAt: '2024-11-10T10:00:00Z'
          }
        ]
        
        setPets(mockPets)
        setFilteredPets(mockPets)
        
        // Calcular estatísticas
        const stats: PetStats = {
          totalPets: mockPets.length,
          bySpecies: {
            dogs: mockPets.filter(p => p.species === 'dog').length,
            cats: mockPets.filter(p => p.species === 'cat').length,
            others: mockPets.filter(p => p.species === 'other').length
          },
          byStatus: {
            healthy: mockPets.filter(p => p.status === 'healthy').length,
            sick: mockPets.filter(p => p.status === 'sick').length,
            treatment: mockPets.filter(p => p.status === 'treatment').length,
            critical: mockPets.filter(p => p.status === 'critical').length
          },
          avgAge: mockPets.reduce((sum, p) => sum + p.age, 0) / mockPets.length,
          avgWeight: mockPets.reduce((sum, p) => sum + p.weight, 0) / mockPets.length,
          totalHealthRecords: mockPets.reduce((sum, p) => sum + p.healthRecords, 0)
        }
        
        setStats(stats)
        
      } catch (err) {
        setError('Erro ao carregar pets')
        console.error('Pets load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadPets()
  }, [])

  useEffect(() => {
    let filtered = pets

    // Filtro por busca
    if (filters.search) {
      filtered = filtered.filter(pet =>
        pet.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        pet.breed.toLowerCase().includes(filters.search.toLowerCase()) ||
        pet.owner.name.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Filtro por espécie
    if (filters.species !== 'all') {
      filtered = filtered.filter(pet => pet.species === filters.species)
    }

    // Filtro por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(pet => pet.status === filters.status)
    }

    // Filtro por gênero
    if (filters.gender !== 'all') {
      filtered = filtered.filter(pet => pet.gender === filters.gender)
    }

    // Filtro por castração
    if (filters.isNeutered !== 'all') {
      filtered = filtered.filter(pet => 
        filters.isNeutered === 'yes' ? pet.isNeutered : !pet.isNeutered
      )
    }

    // Filtro por faixa etária
    if (filters.ageRange !== 'all') {
      filtered = filtered.filter(pet => {
        switch (filters.ageRange) {
          case 'puppy':
            return pet.age <= 1
          case 'adult':
            return pet.age > 1 && pet.age <= 7
          case 'senior':
            return pet.age > 7
          default:
            return true
        }
      })
    }

    setFilteredPets(filtered)
    setCurrentPage(1)
  }, [filters, pets])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'sick':
        return 'bg-yellow-100 text-yellow-800'
      case 'treatment':
        return 'bg-blue-100 text-blue-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '💚'
      case 'sick':
        return '🤒'
      case 'treatment':
        return '💊'
      case 'critical':
        return '🚨'
      default:
        return '❓'
    }
  }

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'dog':
        return '🐕'
      case 'cat':
        return '🐱'
      default:
        return '🐾'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getAgeCategory = (age: number) => {
    if (age <= 1) return 'Filhote'
    if (age <= 7) return 'Adulto'
    return 'Idoso'
  }

  // Paginação
  const indexOfLastPet = currentPage * petsPerPage
  const indexOfFirstPet = indexOfLastPet - petsPerPage
  const currentPets = filteredPets.slice(indexOfFirstPet, indexOfLastPet)
  const totalPages = Math.ceil(filteredPets.length / petsPerPage)

  const handlePetAction = (petId: string, action: string) => {
    console.log(`Ação ${action} para pet ${petId}`)
    // Implementar ações: ver detalhes, editar, gerar relatório
  }

  const generateReport = () => {
    console.log('Gerando relatório de pets...')
    // Implementar geração de relatório
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header com Logo OiPet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <OiPetLogo size="lg" showText={true} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Pets</h1>
            <p className="text-gray-600 mt-1">Administração completa de todos os pets do sistema</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateReport}
          className="flex items-center space-x-2 bg-coral-500 text-white px-4 py-2 rounded-glass hover:bg-coral-600 transition-colors"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Exportar Relatório</span>
        </motion.button>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-glass p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Pets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPets}</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-xs">
                  <span className="mr-1">🐕</span>
                  <span className="text-gray-600">{stats.bySpecies.dogs} cães</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="mr-1">🐱</span>
                  <span className="text-gray-600">{stats.bySpecies.cats} gatos</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-coral-100 rounded-glass">
              <HeartIcon className="h-6 w-6 text-coral-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status de Saúde</p>
              <p className="text-2xl font-bold text-green-600">{stats.byStatus.healthy}</p>
              <p className="text-xs text-gray-500">saudáveis</p>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  <span>{stats.byStatus.sick} doentes</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  <span>{stats.byStatus.critical} críticos</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-glass">
              <BeakerIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Idade Média</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgAge.toFixed(1)} anos</p>
              <p className="text-xs text-gray-500">média geral</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
                    style={{ width: `${(stats.avgAge / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-glass">
              <CakeIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Registros de Saúde</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHealthRecords}</p>
              <p className="text-xs text-gray-500">total acumulado</p>
              <p className="text-xs text-teal-600 mt-1">
                ~{(stats.totalHealthRecords / stats.totalPets).toFixed(1)} por pet
              </p>
            </div>
            <div className="p-3 bg-teal-100 rounded-glass">
              <ClipboardDocumentListIcon className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </GlassWidget>
      </motion.div>

      {/* Estatísticas por Raça */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Raça</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(new Set(pets.map(p => p.breed))).map((breed) => {
              const count = pets.filter(p => p.breed === breed).length
              const percentage = (count / pets.length) * 100
              return (
                <div key={breed} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{breed}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-coral-500 to-teal-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar pets..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={filters.species}
              onChange={(e) => setFilters({...filters, species: e.target.value as any})}
              className="px-4 py-2 border border-gray-300 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            >
              <option value="all">Todas as Espécies</option>
              <option value="dog">Cães</option>
              <option value="cat">Gatos</option>
              <option value="other">Outros</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value as any})}
              className="px-4 py-2 border border-gray-300 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="healthy">Saudável</option>
              <option value="sick">Doente</option>
              <option value="treatment">Em Tratamento</option>
              <option value="critical">Crítico</option>
            </select>

            <select
              value={filters.gender}
              onChange={(e) => setFilters({...filters, gender: e.target.value as any})}
              className="px-4 py-2 border border-gray-300 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            >
              <option value="all">Todos os Gêneros</option>
              <option value="male">Macho</option>
              <option value="female">Fêmea</option>
            </select>

            <select
              value={filters.ageRange}
              onChange={(e) => setFilters({...filters, ageRange: e.target.value as any})}
              className="px-4 py-2 border border-gray-300 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            >
              <option value="all">Todas as Idades</option>
              <option value="puppy">Filhote (≤1 ano)</option>
              <option value="adult">Adulto (2-7 anos)</option>
              <option value="senior">Idoso (&gt;7 anos)</option>
            </select>
          </div>
        </GlassCard>
      </motion.div>

      {/* Tabela de Pets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Idade/Peso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Visita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPets.map((pet) => (
                  <tr key={pet._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 bg-gradient-to-r from-coral-500 to-teal-500 rounded-full flex items-center justify-center">
                            <span className="text-xl">{getSpeciesIcon(pet.species)}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {pet.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pet.breed} • {pet.gender === 'male' ? 'Macho' : 'Fêmea'}
                            {pet.isNeutered && ' • Castrado'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{pet.owner.name}</div>
                      <div className="text-sm text-gray-500">{pet.owner.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {pet.age} anos ({getAgeCategory(pet.age)})
                      </div>
                      <div className="text-sm text-gray-500">
                        {pet.weight}kg • {pet.height}cm
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pet.status)}`}>
                        <span className="mr-1">{getStatusIcon(pet.status)}</span>
                        <span className="capitalize">{pet.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pet.lastVisit ? formatDate(pet.lastVisit) : 'Nunca'}
                      <div className="text-xs text-gray-400">
                        {pet.healthRecords} registros
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePetAction(pet._id, 'view')}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <ChartBarIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePetAction(pet._id, 'report')}
                          className="text-coral-600 hover:text-coral-900"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {indexOfFirstPet + 1} a {Math.min(indexOfLastPet, filteredPets.length)} de {filteredPets.length} pets
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-gray-100 rounded-glass hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm bg-gray-100 rounded-glass hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  )
}