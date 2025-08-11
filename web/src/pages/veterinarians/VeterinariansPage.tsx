import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  HomeIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { GlassCard } from '@/components/ui/GlassContainer'
import { veterinarianService } from '@/services/veterinarianService'
import { Veterinarian, VetSearchFilters } from '@/types/veterinarian'
import { Link } from 'react-router-dom'

export const VeterinariansPage: React.FC = () => {
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<VetSearchFilters>({})

  useEffect(() => {
    loadVeterinarians()
  }, [filters])

  const loadVeterinarians = async () => {
    setLoading(true)
    try {
      const results = await veterinarianService.searchVeterinarians(filters)
      setVeterinarians(results)
    } catch (error) {
      console.error('Error loading veterinarians:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ ...filters, city: searchTerm })
  }

  const toggleFilter = (filterType: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType as keyof VetSearchFilters] === value ? undefined : value
    }))
  }

  const getPriceRangeDisplay = (range: string) => {
    switch (range) {
      case 'low': return '💰'
      case 'medium': return '💰💰'
      case 'high': return '💰💰💰'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <span className="text-4xl mr-3">🏥</span>
            Encontre um Veterinário
          </h1>
          <p className="text-gray-600">
            Veterinários qualificados e verificados para cuidar do seu pet
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="mb-6"
        >
          <GlassCard className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por cidade, bairro ou clínica..."
                  className="w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-glass focus:outline-none focus:ring-2 focus:ring-coral-500"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="p-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-glass hover:bg-white/70 transition-colors"
              >
                <FunnelIcon className="h-5 w-5 text-gray-700" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-3 bg-coral-500 text-white rounded-glass hover:bg-coral-600 transition-colors"
              >
                Buscar
              </motion.button>
            </div>
          </GlassCard>
        </motion.form>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Faixa de Preço</h4>
                  <div className="space-y-2">
                    {['low', 'medium', 'high'].map(range => (
                      <label key={range} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.priceRange === range}
                          onChange={() => toggleFilter('priceRange', range)}
                          className="rounded text-coral-500 focus:ring-coral-500"
                        />
                        <span className="text-sm">
                          {getPriceRangeDisplay(range)} {range === 'low' ? 'Econômico' : range === 'medium' ? 'Médio' : 'Premium'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Serviços</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.emergencyService}
                        onChange={() => toggleFilter('emergencyService', true)}
                        className="rounded text-coral-500 focus:ring-coral-500"
                      />
                      <span className="text-sm flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1 text-red-500" />
                        Emergência 24h
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.homeService}
                        onChange={() => toggleFilter('homeService', true)}
                        className="rounded text-coral-500 focus:ring-coral-500"
                      />
                      <span className="text-sm flex items-center">
                        <HomeIcon className="h-4 w-4 mr-1 text-blue-500" />
                        Atendimento Domiciliar
                      </span>
                    </label>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilters({})}
                    className="px-4 py-2 text-sm text-coral-500 hover:text-coral-600 transition-colors"
                  >
                    Limpar Filtros
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {veterinarians.map((vet, index) => (
              <motion.div
                key={vet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="h-full hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    {/* Veterinarian Info */}
                    <div className="flex items-start space-x-4 mb-4">
                      <img
                        src={vet.avatar || `https://ui-avatars.com/api/?name=${vet.name}&background=E85A5A&color=fff`}
                        alt={vet.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{vet.name}</h3>
                        <p className="text-sm text-gray-600">{vet.clinicName}</p>
                        {vet.verified && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            ✓ Verificado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center">
                        <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-1 font-semibold">{vet.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-gray-500">({vet.reviewsCount} avaliações)</span>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {vet.specialties.map(specialty => (
                        <span
                          key={specialty.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          <span className="mr-1">{specialty.icon}</span>
                          {specialty.name}
                        </span>
                      ))}
                    </div>

                    {/* Location */}
                    <div className="flex items-start space-x-2 text-sm text-gray-600 mb-3">
                      <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{vet.address.neighborhood}, {vet.address.city}</span>
                    </div>

                    {/* Features */}
                    <div className="flex items-center space-x-4 text-sm mb-4">
                      <span className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                        {getPriceRangeDisplay(vet.priceRange)}
                      </span>
                      {vet.emergencyService && (
                        <span className="flex items-center text-red-600">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          24h
                        </span>
                      )}
                      {vet.homeService && (
                        <span className="flex items-center text-blue-600">
                          <HomeIcon className="h-4 w-4 mr-1" />
                          Domiciliar
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const phoneNumber = vet.phone.replace(/\D/g, '')
                          const message = `Olá! Gostaria de agendar uma consulta para meu pet. Vi seu perfil no OiPet Saúde.`
                          window.open(`https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
                        }}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-glass hover:bg-green-600 transition-colors flex items-center justify-center"
                      >
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Agendar via WhatsApp
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.open(`tel:${vet.phone}`, '_self')}
                        className="p-2 bg-gray-100 text-gray-700 rounded-glass hover:bg-gray-200 transition-colors"
                      >
                        <PhoneIcon className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && veterinarians.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <GlassCard className="inline-block p-8">
              <p className="text-gray-500">Nenhum veterinário encontrado com os filtros selecionados.</p>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}