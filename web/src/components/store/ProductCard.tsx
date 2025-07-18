import React from 'react'
import { motion } from 'framer-motion'
import {
  HeartIcon,
  StarIcon,
  ShoppingCartIcon,
  TagIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

import { GlassCard } from '@/components/ui/GlassContainer'
import { useCartStore } from '@/stores/cartStore'
import { ecommerceService, type Product } from '@/services/ecommerceService'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite = false,
  onToggleFavorite
}) => {
  const { addItem, getItemCount } = useCartStore()
  const itemCount = getItemCount(product.id)

  const handleAddToCart = () => {
    addItem(product, 1)
  }

  const handleBuyNow = () => {
    ecommerceService.redirectToOiPetStore(product.oipetUrl)
  }

  const getPetTypeIcon = (petType: string) => {
    switch (petType) {
      case 'dog': return '🐕'
      case 'cat': return '🐱'
      default: return '🐾'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ração': return '🥘'
      case 'petiscos': return '🦴'
      case 'brinquedos': return '🎾'
      case 'acessórios': return '🎒'
      case 'higiene': return '🧴'
      case 'saúde': return '💊'
      default: return '🏪'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <StarIcon
        key={index}
        className={cn(
          'h-4 w-4',
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        )}
      />
    ))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="group relative overflow-hidden h-full flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-glass mb-4 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {product.discount && (
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-glass">
                -{product.discount}%
              </div>
            )}
            {product.isRecommended && (
              <div className="bg-coral-500 text-white text-xs font-bold px-2 py-1 rounded-glass">
                Recomendado
              </div>
            )}
            {!product.inStock && (
              <div className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-glass">
                Esgotado
              </div>
            )}
          </div>

          {/* Favorite Button */}
          {onToggleFavorite && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleFavorite}
              className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-glass hover:bg-white/90 transition-colors"
            >
              {isFavorite ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-600" />
              )}
            </motion.button>
          )}

          {/* Quick Add Button */}
          {product.inStock && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute bottom-3 right-3 p-2 bg-coral-500 text-white rounded-glass opacity-0 group-hover:opacity-100 transition-all"
              onClick={handleAddToCart}
            >
              <ShoppingCartIcon className="h-5 w-5" />
            </motion.button>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col">
          {/* Category and Pet Type */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>{getCategoryIcon(product.category)}</span>
              <span className="capitalize">{product.category}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>{getPetTypeIcon(product.petType)}</span>
              <span className="capitalize">
                {product.petType === 'both' ? 'Cães e Gatos' : 
                 product.petType === 'dog' ? 'Cães' : 'Gatos'}
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-coral-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex items-center">
              {renderStars(product.rating)}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating.toFixed(1)} ({product.reviewCount})
            </span>
          </div>

          {/* Weight */}
          {product.weight && (
            <p className="text-sm text-gray-600 mb-2">
              Peso: {product.weight}
            </p>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-glass"
                >
                  {tag}
                </span>
              ))}
              {product.tags.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{product.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl font-bold text-gray-900">
                {ecommerceService.formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  {ecommerceService.formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Stock Info */}
            {product.inStock ? (
              <p className="text-sm text-green-600 mb-3">
                {product.stockQuantity > 10 
                  ? '✅ Em estoque' 
                  : `⚠️ Últimas ${product.stockQuantity} unidades`
                }
              </p>
            ) : (
              <p className="text-sm text-red-600 mb-3">
                ❌ Produto esgotado
              </p>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {product.inStock ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center space-x-2 bg-coral-500 text-white py-2 px-4 rounded-glass hover:bg-coral-600 transition-colors font-medium"
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                    <span>
                      {itemCount > 0 ? `Adicionar (${itemCount})` : 'Adicionar'}
                    </span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyNow}
                    className="w-full bg-white/50 text-gray-700 py-2 px-4 rounded-glass border border-gray-200 hover:bg-white/70 transition-colors font-medium"
                  >
                    Comprar na OiPet
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded-glass hover:bg-gray-600 transition-colors font-medium"
                >
                  Ver na OiPet
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}