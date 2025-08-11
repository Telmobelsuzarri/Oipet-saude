import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  ShareIcon,
  HeartIcon,
  ShoppingCartIcon,
  StarIcon,
  CheckIcon,
  TruckIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

import { GlassContainer, GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { OiPetLogo } from '@/components/ui/OiPetLogo'
import { ecommerceService, type Product } from '@/services/ecommerce'
import { ecommerceAnalytics } from '@/services/ecommerceAnalytics'
import { cartStore } from '@/stores/cartStore'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const { addItem, items } = cartStore()

  useEffect(() => {
    if (id) {
      loadProduct(id)
    }
  }, [id])

  const loadProduct = async (productId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const productData = await ecommerceService.getProduct(productId)
      if (productData) {
        setProduct(productData)
        
        // Track product view - local analytics
        ecommerceAnalytics.trackProductView(
          productData.id,
          productData.name,
          productData.category,
          productData.price,
          'direct'
        )
        
        // Track product view - backend analytics
        const userId = localStorage.getItem('userId')
        await ecommerceAnalytics.trackProductViewBackend(productData.id, userId || undefined)
      } else {
        setError('Produto não encontrado')
      }
    } catch (err) {
      console.error('Erro ao carregar produto:', err)
      setError('Erro ao carregar produto. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyNow = () => {
    if (!product) return

    // Redirecionar para o site OiPet
    const productUrl = ecommerceService.generateProductUrl(product)
    window.open(productUrl, '_blank')
  }

  const handleAddToCart = () => {
    if (!product) return

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
      url: product.url
    })

    toast.success(`${product.name} adicionado ao carrinho!`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const getPetTypeIcon = (petType: string) => {
    switch (petType) {
      case 'dog': return '🐕'
      case 'cat': return '🐱'
      default: return '🐾'
    }
  }

  const getAgeGroupText = (ageGroup?: string) => {
    switch (ageGroup) {
      case 'puppy': return 'Filhotes'
      case 'adult': return 'Adultos'
      case 'senior': return 'Idosos'
      default: return 'Todas as idades'
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <div key={i}>
          {i <= rating ? (
            <StarSolidIcon className="h-5 w-5 text-yellow-400" />
          ) : (
            <StarIcon className="h-5 w-5 text-gray-300" />
          )}
        </div>
      )
    }
    return stars
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <GlassCard className="p-8 text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/app/store')}
              className="bg-coral-500 text-white px-6 py-2 rounded-glass hover:bg-coral-600 transition-colors"
            >
              Voltar à loja
            </button>
          </GlassCard>
        </div>
      </div>
    )
  }

  const isInCart = items.some(item => item.id === product.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/app/store')}
              className="p-2 hover:bg-white/20 rounded-glass transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
            </button>
            <OiPetLogo size="md" showText={true} />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 hover:bg-white/20 rounded-glass transition-colors"
            >
              {isFavorite ? (
                <HeartSolidIcon className="h-6 w-6 text-red-500" />
              ) : (
                <HeartIcon className="h-6 w-6 text-gray-700" />
              )}
            </button>
            <button className="p-2 hover:bg-white/20 rounded-glass transition-colors">
              <ShareIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6">
              <div className="relative mb-4">
                <img
                  src={product.images[selectedImageIndex] || product.imageUrl}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-glass"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4">
                  {product.discount && (
                    <div className="bg-red-500 text-white px-3 py-1 rounded-glass text-sm font-bold mb-2">
                      -{product.discount}%
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="bg-gray-500 text-white px-3 py-1 rounded-glass text-sm font-bold">
                      Esgotado
                    </div>
                  )}
                </div>

                {/* Pet Type */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-glass">
                  <span className="text-2xl">{getPetTypeIcon(product.petType)}</span>
                </div>
              </div>

              {/* Image Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "flex-shrink-0 w-20 h-20 rounded-glass overflow-hidden border-2 transition-colors",
                        selectedImageIndex === index
                          ? "border-coral-500"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <GlassCard className="p-6">
              <div className="mb-4">
                <span className="text-coral-600 font-medium text-sm uppercase tracking-wide">
                  {product.brand}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mt-1">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex space-x-1">
                  {renderStars(Math.floor(product.rating || 0))}
                </div>
                <span className="text-gray-600">
                  ({product.reviews || 0} avaliações)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                {product.originalPrice && (
                  <span className="text-gray-500 line-through text-lg mr-2">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="text-3xl font-bold text-coral-600">
                  {formatPrice(product.price)}
                </span>
                {product.discount && (
                  <span className="ml-2 text-green-600 font-medium">
                    Economize {formatPrice(product.originalPrice! - product.price)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Product Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Categoria:</span>
                  <span className="font-medium capitalize">{product.category}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo de Pet:</span>
                  <span className="font-medium">
                    {product.petType === 'dog' ? 'Cães' : product.petType === 'cat' ? 'Gatos' : 'Todos'}
                  </span>
                </div>

                {product.ageGroup && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Faixa Etária:</span>
                    <span className="font-medium">{getAgeGroupText(product.ageGroup)}</span>
                  </div>
                )}

                {product.weight && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peso:</span>
                    <span className="font-medium">{product.weight}</span>
                  </div>
                )}

                {product.flavor && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sabor:</span>
                    <span className="font-medium">{product.flavor}</span>
                  </div>
                )}
              </div>

              {/* Quantity and Actions */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-medium">Quantidade:</span>
                  <div className="flex items-center border border-gray-300 rounded-glass">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={cn(
                      "flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-glass font-medium transition-colors",
                      product.inStock
                        ? "bg-teal-500 text-white hover:bg-teal-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span>{isInCart ? 'No Carrinho' : 'Adicionar ao Carrinho'}</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center space-x-2 bg-coral-500 text-white px-6 py-3 rounded-glass font-medium hover:bg-coral-600 transition-colors"
                  >
                    <TruckIcon className="h-5 w-5" />
                    <span>Comprar na OiPet</span>
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* Benefits */}
            <GlassCard className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Vantagens OiPet</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Produtos premium e seguros</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TruckIcon className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">Entrega rápida e segura</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckIcon className="h-5 w-5 text-coral-500" />
                  <span className="text-gray-700">Qualidade garantida</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Nutritional Info and Ingredients */}
        {(product.nutritionalInfo || product.ingredients) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {product.nutritionalInfo && (
              <GlassCard className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Informações Nutricionais</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-coral-50 to-coral-100 rounded-glass">
                    <div className="text-2xl font-bold text-coral-600">
                      {product.nutritionalInfo.protein}%
                    </div>
                    <div className="text-sm text-gray-600">Proteína</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-glass">
                    <div className="text-2xl font-bold text-teal-600">
                      {product.nutritionalInfo.fat}%
                    </div>
                    <div className="text-sm text-gray-600">Gordura</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-glass">
                    <div className="text-2xl font-bold text-blue-600">
                      {product.nutritionalInfo.carbs}%
                    </div>
                    <div className="text-sm text-gray-600">Carboidratos</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-glass">
                    <div className="text-2xl font-bold text-purple-600">
                      {product.nutritionalInfo.calories}
                    </div>
                    <div className="text-sm text-gray-600">Kcal/kg</div>
                  </div>
                </div>
              </GlassCard>
            )}

            {product.ingredients && product.ingredients.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Ingredientes</h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-teal-100 text-teal-800 rounded-glass text-sm font-medium"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}