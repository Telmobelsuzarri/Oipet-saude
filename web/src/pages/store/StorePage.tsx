import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  TagIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

import { GlassContainer, GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { ProductCard } from '@/components/store/ProductCard'
import { CartSidebar } from '@/components/store/CartSidebar'
import { ecommerceService, type Product, type ProductFilter } from '@/services/ecommerceService'
import { useCartStore } from '@/stores/cartStore'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'all', name: 'Todos', icon: '🏪' },
  { id: 'ração', name: 'Ração', icon: '🥘' },
  { id: 'petiscos', name: 'Petiscos', icon: '🦴' },
  { id: 'brinquedos', name: 'Brinquedos', icon: '🎾' },
  { id: 'acessórios', name: 'Acessórios', icon: '🎒' },
  { id: 'higiene', name: 'Higiene', icon: '🧴' },
  { id: 'saúde', name: 'Saúde', icon: '💊' }
]

const petTypes = [
  { id: 'both', name: 'Todos' },
  { id: 'dog', name: 'Cães' },
  { id: 'cat', name: 'Gatos' }
]

const sortOptions = [
  { id: 'relevance', name: 'Relevância' },
  { id: 'price-low', name: 'Menor preço' },
  { id: 'price-high', name: 'Maior preço' },
  { id: 'rating', name: 'Melhor avaliação' },
  { id: 'newest', name: 'Mais recentes' }
]

export const StorePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPetType, setSelectedPetType] = useState('both')
  const [sortBy, setSortBy] = useState('relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  
  const { getTotalItems, isOpen: cartOpen } = useCartStore()

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, selectedPetType])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const filter: ProductFilter = {
        petType: selectedPetType === 'both' ? undefined : selectedPetType,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchTerm || undefined,
        inStock: true
      }
      
      const productList = await ecommerceService.getProducts(filter)
      setProducts(sortProducts(productList, sortBy))
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortProducts = (productList: Product[], sortOption: string): Product[] => {
    const sorted = [...productList]
    
    switch (sortOption) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price)
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price)
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating)
      case 'newest':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      default:
        // Relevância: produtos recomendados primeiro, depois por rating
        return sorted.sort((a, b) => {
          if (a.isRecommended && !b.isRecommended) return -1
          if (!a.isRecommended && b.isRecommended) return 1
          return b.rating - a.rating
        })
    }
  }

  const handleSearch = async () => {
    loadProducts()
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    setProducts(prev => sortProducts(prev, newSort))
  }

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }
      return newFavorites
    })
  }

  const totalItems = getTotalItems()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Loja OiPet 🛒
              </h1>
              <p className="text-gray-600">
                Produtos selecionados para o seu pet
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => useCartStore.getState().toggleCart()}
                className="relative p-3 bg-coral-500 text-white rounded-glass hover:bg-coral-600 transition-colors"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {totalItems > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold"
                  >
                    {totalItems}
                  </motion.div>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <GlassCard className="mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSearch}
                className="px-6 py-3 bg-coral-500 text-white rounded-glass hover:bg-coral-600 transition-colors"
              >
                Buscar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-white/50 border border-gray-200 rounded-glass hover:bg-white/70 transition-colors"
              >
                <FunnelIcon className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-glass font-medium transition-all',
                    selectedCategory === category.id
                      ? 'bg-coral-500 text-white'
                      : 'bg-white/50 text-gray-700 hover:bg-white/70'
                  )}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-200/50 pt-4 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Pet Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Pet
                    </label>
                    <select
                      value={selectedPetType}
                      onChange={(e) => setSelectedPetType(e.target.value)}
                      className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500"
                    >
                      {petTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stock Filter */}
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="inStock"
                      defaultChecked
                      className="rounded border-gray-300 text-coral-600 focus:ring-coral-500"
                    />
                    <label htmlFor="inStock" className="text-sm text-gray-700">
                      Apenas em estoque
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </GlassCard>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? 'Carregando...' : `${products.length} produtos encontrados`}
          </p>
          
          {/* OiPet Store Link */}
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={ecommerceService.getOiPetStoreUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-coral-600 hover:text-coral-700 font-medium"
          >
            <span>Ver loja completa</span>
            <ExclamationTriangleIcon className="h-4 w-4" />
          </motion.a>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <GlassCard key={index} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-glass mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : products.length === 0 ? (
          <GlassCard className="text-center py-12">
            <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar os filtros ou termos de busca
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedPetType('both')
                loadProducts()
              }}
              className="bg-coral-500 text-white px-6 py-2 rounded-glass hover:bg-coral-600 transition-colors"
            >
              Limpar filtros
            </motion.button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={() => toggleFavorite(product.id)}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {products.length > 0 && products.length >= 12 && (
          <div className="mt-12 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/50 text-gray-700 px-8 py-3 rounded-glass border border-gray-200 hover:bg-white/70 transition-colors"
            >
              Carregar mais produtos
            </motion.button>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  )
}