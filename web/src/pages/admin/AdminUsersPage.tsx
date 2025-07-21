import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UsersIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  ClockIcon,
  EyeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { OiPetLogo } from '@/components/ui/OiPetLogo'

interface User {
  _id: string
  name: string
  email: string
  isEmailVerified: boolean
  isAdmin: boolean
  createdAt: string
  lastLogin?: string
  status: 'active' | 'inactive' | 'blocked'
  petCount: number
  healthRecords: number
}

interface UserFilters {
  search: string
  status: 'all' | 'active' | 'inactive' | 'blocked'
  isAdmin: 'all' | 'yes' | 'no'
  isEmailVerified: 'all' | 'yes' | 'no'
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    isAdmin: 'all',
    isEmailVerified: 'all'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Simulando dados até a API estar pronta
        const mockUsers: User[] = [
          {
            _id: '1',
            name: 'João Silva',
            email: 'joao@email.com',
            isEmailVerified: true,
            isAdmin: false,
            createdAt: '2025-01-10T10:00:00Z',
            lastLogin: '2025-01-18T14:30:00Z',
            status: 'active',
            petCount: 2,
            healthRecords: 15
          },
          {
            _id: '2',
            name: 'Maria Santos',
            email: 'maria@email.com',
            isEmailVerified: true,
            isAdmin: true,
            createdAt: '2025-01-08T09:15:00Z',
            lastLogin: '2025-01-18T16:45:00Z',
            status: 'active',
            petCount: 1,
            healthRecords: 8
          },
          {
            _id: '3',
            name: 'Carlos Oliveira',
            email: 'carlos@email.com',
            isEmailVerified: false,
            isAdmin: false,
            createdAt: '2025-01-15T11:20:00Z',
            lastLogin: '2025-01-17T08:10:00Z',
            status: 'inactive',
            petCount: 3,
            healthRecords: 22
          },
          {
            _id: '4',
            name: 'Ana Costa',
            email: 'ana@email.com',
            isEmailVerified: true,
            isAdmin: false,
            createdAt: '2025-01-12T14:45:00Z',
            lastLogin: '2025-01-18T12:20:00Z',
            status: 'active',
            petCount: 1,
            healthRecords: 5
          },
          {
            _id: '5',
            name: 'Pedro Almeida',
            email: 'pedro@email.com',
            isEmailVerified: false,
            isAdmin: false,
            createdAt: '2025-01-16T16:30:00Z',
            status: 'blocked',
            petCount: 0,
            healthRecords: 0
          }
        ]
        
        setUsers(mockUsers)
        setFilteredUsers(mockUsers)
        
      } catch (err) {
        setError('Erro ao carregar usuários')
        console.error('Users load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    // Filtro por busca
    if (filters.search) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Filtro por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status)
    }

    // Filtro por admin
    if (filters.isAdmin !== 'all') {
      filtered = filtered.filter(user => 
        filters.isAdmin === 'yes' ? user.isAdmin : !user.isAdmin
      )
    }

    // Filtro por email verificado
    if (filters.isEmailVerified !== 'all') {
      filtered = filtered.filter(user => 
        filters.isEmailVerified === 'yes' ? user.isEmailVerified : !user.isEmailVerified
      )
    }

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }, [filters, users])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'blocked':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'inactive':
        return <ClockIcon className="h-4 w-4" />
      case 'blocked':
        return <XCircleIcon className="h-4 w-4" />
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRelativeTime = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'hoje'
    if (diffDays === 1) return 'ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`
    return `${Math.floor(diffDays / 30)} meses atrás`
  }

  // Paginação
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const handleUserAction = (userId: string, action: string) => {
    console.log(`Ação ${action} para usuário ${userId}`)
    // Implementar ações: editar, bloquear, desbloquear, deletar
  }

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    blocked: users.filter(u => u.status === 'blocked').length,
    admins: users.filter(u => u.isAdmin).length,
    unverified: users.filter(u => !u.isEmailVerified).length
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
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
            <p className="text-gray-600 mt-1">Controle completo de usuários do sistema</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-coral-500 text-white px-4 py-2 rounded-glass hover:bg-coral-600 transition-colors"
        >
          <UserPlusIcon className="h-5 w-5" />
          <span>Novo Usuário</span>
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4"
      >
        <GlassWidget className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{userStats.total}</p>
            </div>
            <UsersIcon className="h-6 w-6 text-coral-600" />
          </div>
        </GlassWidget>

        <GlassWidget className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Ativos</p>
              <p className="text-xl font-bold text-green-600">{userStats.active}</p>
            </div>
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>
        </GlassWidget>

        <GlassWidget className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Inativos</p>
              <p className="text-xl font-bold text-yellow-600">{userStats.inactive}</p>
            </div>
            <ClockIcon className="h-6 w-6 text-yellow-600" />
          </div>
        </GlassWidget>

        <GlassWidget className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Bloqueados</p>
              <p className="text-xl font-bold text-red-600">{userStats.blocked}</p>
            </div>
            <XCircleIcon className="h-6 w-6 text-red-600" />
          </div>
        </GlassWidget>

        <GlassWidget className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Admins</p>
              <p className="text-xl font-bold text-purple-600">{userStats.admins}</p>
            </div>
            <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
          </div>
        </GlassWidget>

        <GlassWidget className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Não Verificados</p>
              <p className="text-xl font-bold text-orange-600">{userStats.unverified}</p>
            </div>
            <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
          </div>
        </GlassWidget>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value as any})}
              className="px-4 py-2 border border-gray-300 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="blocked">Bloqueados</option>
            </select>

            <select
              value={filters.isAdmin}
              onChange={(e) => setFilters({...filters, isAdmin: e.target.value as any})}
              className="px-4 py-2 border border-gray-300 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="yes">Apenas Admins</option>
              <option value="no">Usuários Comuns</option>
            </select>

            <select
              value={filters.isEmailVerified}
              onChange={(e) => setFilters({...filters, isEmailVerified: e.target.value as any})}
              className="px-4 py-2 border border-gray-300 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="yes">Verificados</option>
              <option value="no">Não Verificados</option>
            </select>
          </div>
        </GlassCard>
      </motion.div>

      {/* Tabela de Usuários */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 bg-gradient-to-r from-coral-500 to-teal-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            {user.email}
                            {user.isEmailVerified && (
                              <CheckCircleIcon className="h-3 w-3 text-green-500 ml-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span className="ml-1 capitalize">{user.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.isAdmin ? (
                          <>
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <UsersIcon className="h-3 w-3 mr-1" />
                            Usuário
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="font-medium">{user.petCount}</span>
                        <span className="text-gray-500 ml-1">pets</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.healthRecords} registros
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? (
                        <div>
                          <div>{formatDate(user.lastLogin)}</div>
                          <div className="text-xs text-gray-400">
                            {getRelativeTime(user.lastLogin)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Nunca</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUserAction(user._id, 'view')}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction(user._id, 'edit')}
                          className="text-coral-600 hover:text-coral-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction(user._id, 'delete')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
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
                  Mostrando {indexOfFirstUser + 1} a {Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuários
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