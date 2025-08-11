import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  Dimensions,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/Ionicons'
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme'
import { ecommerceService, Product } from '@/services/ecommerce'
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native'

const { width } = Dimensions.get('window')

type ProductDetailRouteProp = RouteProp<{
  ProductDetail: { productId: string }
}, 'ProductDetail'>

export const ProductDetailScreen: React.FC = () => {
  const route = useRoute<ProductDetailRouteProp>()
  const navigation = useNavigation()
  const { productId } = route.params

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const productData = await ecommerceService.getProduct(productId)
      if (productData) {
        setProduct(productData)
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

  const handleBuyProduct = async () => {
    if (!product) return

    try {
      const productUrl = ecommerceService.generateProductUrl(product)
      const canOpen = await Linking.canOpenURL(productUrl)
      if (canOpen) {
        await Linking.openURL(productUrl)
      } else {
        Alert.alert(
          'Erro',
          'Não foi possível abrir a loja OiPet. Verifique se você tem um navegador instalado.'
        )
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Erro ao abrir a loja OiPet'
      )
    }
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
        <Text key={i} style={[styles.star, { color: i <= rating ? '#FFD700' : '#E5E5E5' }]}>
          ★
        </Text>
      )
    }
    return stars
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Produto</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.coral} />
          <Text style={styles.loadingText}>Carregando produto...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Produto</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={COLORS.system.gray} />
          <Text style={styles.errorTitle}>Erro ao carregar</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadProduct}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Produto</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share-outline" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.images[selectedImageIndex] || product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
          
          {/* Badges */}
          <View style={styles.badgeContainer}>
            {product.discount && (
              <View style={[styles.badge, styles.discountBadge]}>
                <Text style={styles.badgeText}>-{product.discount}%</Text>
              </View>
            )}
            {!product.inStock && (
              <View style={[styles.badge, styles.outOfStockBadge]}>
                <Text style={styles.badgeText}>Esgotado</Text>
              </View>
            )}
          </View>

          {/* Pet Type Icon */}
          <View style={styles.petTypeContainer}>
            <Text style={styles.petTypeIcon}>{getPetTypeIcon(product.petType)}</Text>
          </View>
        </View>

        {/* Image Thumbnails */}
        {product.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailContainer}
            contentContainerStyle={styles.thumbnailContent}
          >
            {product.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.thumbnailSelected
                ]}
                onPress={() => setSelectedImageIndex(index)}
              >
                <Image source={{ uri: image }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.brandName}>{product.brand}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(Math.floor(product.rating || 0))}
            </View>
            <Text style={styles.reviewCount}>({product.reviews || 0} avaliações)</Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
            )}
            <Text style={styles.currentPrice}>{formatPrice(product.price)}</Text>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Product Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>Detalhes do Produto</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Categoria:</Text>
              <Text style={styles.detailValue}>{product.category}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo de Pet:</Text>
              <Text style={styles.detailValue}>
                {product.petType === 'dog' ? 'Cães' : product.petType === 'cat' ? 'Gatos' : 'Todos'}
              </Text>
            </View>

            {product.ageGroup && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Faixa Etária:</Text>
                <Text style={styles.detailValue}>{getAgeGroupText(product.ageGroup)}</Text>
              </View>
            )}

            {product.weight && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Peso:</Text>
                <Text style={styles.detailValue}>{product.weight}</Text>
              </View>
            )}

            {product.flavor && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sabor:</Text>
                <Text style={styles.detailValue}>{product.flavor}</Text>
              </View>
            )}
          </View>

          {/* Nutritional Info */}
          {product.nutritionalInfo && (
            <View style={styles.nutritionContainer}>
              <Text style={styles.sectionTitle}>Informações Nutricionais</Text>
              
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{product.nutritionalInfo.protein}%</Text>
                  <Text style={styles.nutritionLabel}>Proteína</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{product.nutritionalInfo.fat}%</Text>
                  <Text style={styles.nutritionLabel}>Gordura</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{product.nutritionalInfo.carbs}%</Text>
                  <Text style={styles.nutritionLabel}>Carboidratos</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{product.nutritionalInfo.calories}</Text>
                  <Text style={styles.nutritionLabel}>Kcal/kg</Text>
                </View>
              </View>
            </View>
          )}

          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <View style={styles.ingredientsContainer}>
              <Text style={styles.sectionTitle}>Ingredientes</Text>
              <View style={styles.ingredientsList}>
                {product.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredient}>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Buy Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.buyButton, !product.inStock && styles.buyButtonDisabled]}
          onPress={handleBuyProduct}
          disabled={!product.inStock}
        >
          <Icon name="storefront" size={20} color="#FFF" />
          <Text style={styles.buyButtonText}>
            {product.inStock ? 'Comprar na OiPet' : 'Ver na OiPet'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.system.gray100,
  },
  backButton: {
    padding: SPACING.xs,
  },
  shareButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  errorTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  errorSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: width,
    height: width * 0.8,
  },
  badgeContainer: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  discountBadge: {
    backgroundColor: '#E53E3E',
  },
  outOfStockBadge: {
    backgroundColor: COLORS.system.gray,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background.surface,
    fontWeight: 'bold',
    fontSize: 10,
  },
  petTypeContainer: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.background.surface,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petTypeIcon: {
    fontSize: 18,
  },
  thumbnailContainer: {
    backgroundColor: COLORS.background.surface,
    paddingVertical: SPACING.sm,
  },
  thumbnailContent: {
    paddingHorizontal: SPACING.md,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: SPACING.sm,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: COLORS.primary.coral,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    backgroundColor: COLORS.background.surface,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  productName: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.text.primary,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  brandName: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary.coral,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: SPACING.sm,
  },
  star: {
    fontSize: 16,
  },
  reviewCount: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  priceContainer: {
    marginBottom: SPACING.lg,
  },
  originalPrice: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.primary.coral,
    fontWeight: 'bold',
  },
  sectionTitle: {
    ...TYPOGRAPHY.body1,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  description: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  detailsContainer: {
    marginTop: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.system.gray100,
  },
  detailLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  detailValue: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  nutritionContainer: {
    marginTop: SPACING.md,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: COLORS.background.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  nutritionValue: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.primary.coral,
    fontWeight: 'bold',
  },
  nutritionLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  ingredientsContainer: {
    marginTop: SPACING.md,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  ingredient: {
    backgroundColor: COLORS.primary.teal + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
  },
  ingredientText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary.teal,
    fontWeight: '500',
  },
  bottomContainer: {
    backgroundColor: COLORS.background.surface,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.system.gray100,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary.coral,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  buyButtonDisabled: {
    backgroundColor: COLORS.system.gray,
  },
  buyButtonText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.background.surface,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: COLORS.primary.coral,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.background.surface,
    fontWeight: 'bold',
  },
})