import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  RefreshControl,
  Modal,
  ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/Ionicons'
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  discount?: number
  category: 'ração' | 'petiscos' | 'brinquedos' | 'acessórios' | 'higiene' | 'saúde'
  petType: 'dog' | 'cat' | 'both'
  ageGroup: 'filhote' | 'adulto' | 'idoso' | 'todas'
  imageUrl: string
  rating: number
  reviewCount: number
  inStock: boolean
  weight?: string
  tags: string[]
  oipetUrl: string
}

const mockProducts: Product[] = [
  {
    id: 'racao-premium-adulto',
    name: 'Ração Premium Cães Adultos',
    description: 'Ração super premium para cães adultos com ingredientes naturais e alta digestibilidade.',
    price: 89.90,
    originalPrice: 99.90,
    discount: 10,
    category: 'ração',
    petType: 'dog',
    ageGroup: 'adulto',
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300',
    rating: 4.8,
    reviewCount: 127,
    inStock: true,
    weight: '10kg',
    tags: ['premium', 'natural', 'digestível'],
    oipetUrl: 'https://oipetcomidadeverdade.com.br/para-cachorros/racao-premium-adulto'
  },
  {
    id: 'petisco-natural-frango',
    name: 'Petisco Natural de Frango',
    description: 'Petisco 100% natural de frango desidratado, sem conservantes artificiais.',
    price: 24.90,
    category: 'petiscos',
    petType: 'both',
    ageGroup: 'todas',
    imageUrl: 'https://images.unsplash.com/photo-1558929996-da64ba858215?w=300',
    rating: 4.9,
    reviewCount: 89,
    inStock: true,
    weight: '100g',
    tags: ['natural', '100% frango', 'sem conservantes'],
    oipetUrl: 'https://oipetcomidadeverdade.com.br/petiscos/natural-frango'
  },
  {
    id: 'racao-gatos-filhotes',
    name: 'Ração Especial Gatos Filhotes',
    description: 'Ração desenvolvida especialmente para gatos filhotes com DHA e nutrientes essenciais.',
    price: 67.90,
    category: 'ração',
    petType: 'cat',
    ageGroup: 'filhote',
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300',
    rating: 4.7,
    reviewCount: 63,
    inStock: true,
    weight: '7.5kg',
    tags: ['filhotes', 'DHA', 'desenvolvimento'],
    oipetUrl: 'https://oipetcomidadeverdade.com.br/para-gatos/racao-filhotes'
  },
  {
    id: 'brinquedo-corda',
    name: 'Brinquedo de Corda Natural',
    description: 'Brinquedo de corda 100% natural para cães, ajuda na limpeza dos dentes.',
    price: 19.90,
    category: 'brinquedos',
    petType: 'dog',
    ageGroup: 'todas',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300',
    rating: 4.5,
    reviewCount: 94,
    inStock: true,
    tags: ['natural', 'dentes', 'resistente'],
    oipetUrl: 'https://oipetcomidadeverdade.com.br/brinquedos/corda-natural'
  }
]

const categories = [
  { id: 'all', name: 'Todos', icon: 'grid-outline', emoji: '🏪' },
  { id: 'ração', name: 'Ração', icon: 'restaurant-outline', emoji: '🥘' },
  { id: 'petiscos', name: 'Petiscos', icon: 'fish-outline', emoji: '🦴' },
  { id: 'brinquedos', name: 'Brinquedos', icon: 'football-outline', emoji: '🎾' },
  { id: 'acessórios', name: 'Acessórios', icon: 'bag-outline', emoji: '🎒' },
  { id: 'higiene', name: 'Higiene', icon: 'water-outline', emoji: '🧴' },
  { id: 'saúde', name: 'Saúde', icon: 'medical-outline', emoji: '💊' }
]

export const StoreScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPetType, setSelectedPetType] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)

  useEffect(() => {
    filterProducts()
  }, [searchTerm, selectedCategory, selectedPetType])

  const filterProducts = () => {
    let filtered = [...products]

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    if (selectedPetType !== 'all') {
      filtered = filtered.filter(product => 
        product.petType === selectedPetType || product.petType === 'both'
      )
    }

    setFilteredProducts(filtered)
  }

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product)
    setShowProductModal(true)
  }

  const handleBuyProduct = async (product: Product) => {
    try {
      const canOpen = await Linking.canOpenURL(product.oipetUrl)
      if (canOpen) {
        await Linking.openURL(product.oipetUrl)
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

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        
        {/* Badges */}
        <View style={styles.badgeContainer}>
          {item.discount && (
            <View style={[styles.badge, styles.discountBadge]}>
              <Text style={styles.badgeText}>-{item.discount}%</Text>
            </View>
          )}
          {!item.inStock && (
            <View style={[styles.badge, styles.outOfStockBadge]}>
              <Text style={styles.badgeText}>Esgotado</Text>
            </View>
          )}
        </View>

        {/* Pet Type Icon */}
        <View style={styles.petTypeContainer}>
          <Text style={styles.petTypeIcon}>{getPetTypeIcon(item.petType)}</Text>
        </View>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {renderStars(item.rating)}
          </View>
          <Text style={styles.reviewCount}>({item.reviewCount})</Text>
        </View>

        {/* Weight */}
        {item.weight && (
          <Text style={styles.weightText}>{item.weight}</Text>
        )}

        {/* Price */}
        <View style={styles.priceContainer}>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
          )}
          <Text style={styles.currentPrice}>{formatPrice(item.price)}</Text>
        </View>

        {/* Buy Button */}
        <TouchableOpacity
          style={[styles.buyButton, !item.inStock && styles.buyButtonDisabled]}
          onPress={() => handleBuyProduct(item)}
          disabled={!item.inStock}
        >
          <Icon name="storefront-outline" size={16} color="#FFF" />
          <Text style={styles.buyButtonText}>
            {item.inStock ? 'Comprar na OiPet' : 'Ver na OiPet'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  const renderCategoryFilter = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text style={[
        styles.categoryText,
        selectedCategory === item.id && styles.categoryTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  )

  const ProductModal = () => (
    <Modal
      visible={showProductModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowProductModal(false)}
    >
      {selectedProduct && (
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProductModal(false)}
            >
              <Icon name="close" size={24} color={COLORS.system.gray} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detalhes do Produto</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Image source={{ uri: selectedProduct.imageUrl }} style={styles.modalImage} />
            
            <View style={styles.modalInfo}>
              <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
              
              <View style={styles.modalRating}>
                <View style={styles.starsContainer}>
                  {renderStars(selectedProduct.rating)}
                </View>
                <Text style={styles.reviewCount}>({selectedProduct.reviewCount} avaliações)</Text>
              </View>

              <Text style={styles.modalDescription}>{selectedProduct.description}</Text>

              {selectedProduct.weight && (
                <Text style={styles.modalWeight}>Peso: {selectedProduct.weight}</Text>
              )}

              <View style={styles.modalTags}>
                {selectedProduct.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.modalPriceContainer}>
                {selectedProduct.originalPrice && (
                  <Text style={styles.modalOriginalPrice}>
                    {formatPrice(selectedProduct.originalPrice)}
                  </Text>
                )}
                <Text style={styles.modalCurrentPrice}>
                  {formatPrice(selectedProduct.price)}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalBuyButton}
              onPress={() => {
                setShowProductModal(false)
                handleBuyProduct(selectedProduct)
              }}
            >
              <Icon name="storefront" size={20} color="#FFF" />
              <Text style={styles.modalBuyButtonText}>Comprar na OiPet</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </Modal>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Loja OiPet</Text>
            <Text style={styles.headerSubtitle}>Produtos premium para seu pet</Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon name="options-outline" size={24} color={COLORS.primary.coral} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={COLORS.system.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={COLORS.system.gray}
          />
        </View>

        {/* Category Filter */}
        <FlatList
          data={categories}
          renderItem={renderCategoryFilter}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryList}
          contentContainerStyle={styles.categoryListContent}
        />

        {/* Advanced Filters */}
        {showFilters && (
          <View style={styles.advancedFilters}>
            <Text style={styles.filterTitle}>Filtros</Text>
            
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Tipo de Pet:</Text>
              <View style={styles.filterOptions}>
                {['all', 'dog', 'cat'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterOption,
                      selectedPetType === type && styles.filterOptionActive
                    ]}
                    onPress={() => setSelectedPetType(type)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedPetType === type && styles.filterOptionTextActive
                    ]}>
                      {type === 'all' ? 'Todos' : type === 'dog' ? 'Cães' : 'Gatos'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              setIsLoading(true)
              setTimeout(() => setIsLoading(false), 1000)
            }}
            colors={[COLORS.primary.coral]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bag-outline" size={64} color={COLORS.system.gray} />
            <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Tente ajustar os filtros de busca
            </Text>
          </View>
        }
      />

      {/* OiPet Store Link */}
      <View style={styles.storeLink}>
        <TouchableOpacity
          style={styles.storeLinkButton}
          onPress={() => Linking.openURL('https://oipetcomidadeverdade.com.br')}
        >
          <Icon name="storefront" size={20} color={COLORS.primary.coral} />
          <Text style={styles.storeLinkText}>Visitar Loja Completa OiPet</Text>
          <Icon name="open-outline" size={16} color={COLORS.primary.coral} />
        </TouchableOpacity>
      </View>

      <ProductModal />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    backgroundColor: COLORS.background.surface,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.system.gray100,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  filterButton: {
    padding: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    height: 44,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  categoryList: {
    marginBottom: SPACING.sm,
  },
  categoryListContent: {
    paddingRight: SPACING.md,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.system.gray100,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary.coral,
    borderColor: COLORS.primary.coral,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: COLORS.background.surface,
  },
  advancedFilters: {
    backgroundColor: COLORS.background.primary,
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.sm,
  },
  filterTitle: {
    ...TYPOGRAPHY.body1,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  filterRow: {
    marginBottom: SPACING.md,
  },
  filterLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.background.surface,
    borderWidth: 1,
    borderColor: COLORS.system.gray100,
  },
  filterOptionActive: {
    backgroundColor: COLORS.primary.coral,
    borderColor: COLORS.primary.coral,
  },
  filterOptionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  filterOptionTextActive: {
    color: COLORS.background.surface,
  },
  productsList: {
    padding: SPACING.md,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.background.surface,
    borderRadius: 16,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  badgeContainer: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
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
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.background.surface,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petTypeIcon: {
    fontSize: 12,
  },
  productInfo: {
    padding: SPACING.md,
  },
  productName: {
    ...TYPOGRAPHY.body2,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    height: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: SPACING.xs,
  },
  star: {
    fontSize: 12,
  },
  reviewCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontSize: 10,
  },
  weightText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  priceContainer: {
    marginBottom: SPACING.md,
  },
  originalPrice: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textDecorationLine: 'line-through',
    fontSize: 10,
  },
  currentPrice: {
    ...TYPOGRAPHY.body2,
    fontWeight: 'bold',
    color: COLORS.primary.coral,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary.coral,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  buyButtonDisabled: {
    backgroundColor: COLORS.system.gray,
  },
  buyButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background.surface,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  storeLink: {
    padding: SPACING.md,
    backgroundColor: COLORS.background.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.system.gray100,
  },
  storeLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  storeLinkText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary.coral,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.system.gray100,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  modalInfo: {
    padding: SPACING.md,
  },
  modalProductName: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.text.primary,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalDescription: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  modalWeight: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  modalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tag: {
    backgroundColor: COLORS.primary.teal + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  tagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary.teal,
    fontWeight: '500',
  },
  modalPriceContainer: {
    alignItems: 'flex-start',
  },
  modalOriginalPrice: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    textDecorationLine: 'line-through',
  },
  modalCurrentPrice: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.primary.coral,
    fontWeight: 'bold',
  },
  modalFooter: {
    padding: SPACING.md,
    backgroundColor: COLORS.background.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.system.gray100,
  },
  modalBuyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary.coral,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  modalBuyButtonText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.background.surface,
    fontWeight: 'bold',
  },
})