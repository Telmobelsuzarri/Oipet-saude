import axios from 'axios'

const OIPET_BASE_URL = 'https://oipetcomidadeverdade.com.br'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  discount?: number
  category: string
  subcategory?: string
  brand: string
  imageUrl: string
  images: string[]
  inStock: boolean
  weight?: string
  flavor?: string
  petType: 'dog' | 'cat' | 'both'
  ageGroup?: 'puppy' | 'adult' | 'senior' | 'all'
  nutritionalInfo?: {
    protein: number
    fat: number
    carbs: number
    calories: number
  }
  ingredients?: string[]
  slug: string
  url: string
  rating?: number
  reviews?: number
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description: string
  imageUrl?: string
  parentId?: string
  children?: ProductCategory[]
}

export interface ProductFilter {
  category?: string
  petType?: 'dog' | 'cat' | 'both'
  ageGroup?: 'puppy' | 'adult' | 'senior' | 'all'
  priceRange?: {
    min: number
    max: number
  }
  brand?: string
  inStock?: boolean
  search?: string
  sortBy?: 'name' | 'price' | 'rating' | 'newest'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ProductResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
  categories: ProductCategory[]
  brands: string[]
}

class EcommerceService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutos

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}:${JSON.stringify(params || {})}`
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async getProducts(filters: ProductFilter = {}): Promise<ProductResponse> {
    const cacheKey = this.getCacheKey('products', filters)
    const cached = this.getFromCache<ProductResponse>(cacheKey)
    if (cached) return cached

    try {
      // Por enquanto, retornar dados mock até implementar scraping real
      const mockResponse = this.getMockProducts(filters)
      this.setCache(cacheKey, mockResponse)
      return mockResponse
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      throw new Error('Falha ao carregar produtos da OiPet')
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    const cacheKey = this.getCacheKey('product', { id })
    const cached = this.getFromCache<Product>(cacheKey)
    if (cached) return cached

    try {
      const mockProduct = this.getMockProduct(id)
      if (mockProduct) {
        this.setCache(cacheKey, mockProduct)
      }
      return mockProduct
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      return null
    }
  }

  async getCategories(): Promise<ProductCategory[]> {
    const cacheKey = this.getCacheKey('categories')
    const cached = this.getFromCache<ProductCategory[]>(cacheKey)
    if (cached) return cached

    try {
      const mockCategories = this.getMockCategories()
      this.setCache(cacheKey, mockCategories)
      return mockCategories
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      return []
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    const filters: ProductFilter = { search: query, limit: 20 }
    const response = await this.getProducts(filters)
    return response.products
  }

  generateProductUrl(product: Product): string {
    return `${OIPET_BASE_URL}/${product.slug}`
  }

  generateCartUrl(productIds: string[]): string {
    // URL para adicionar produtos direto no carrinho
    const params = productIds.map(id => `product=${id}`).join('&')
    return `${OIPET_BASE_URL}/cart?${params}`
  }

  // Dados Mock para desenvolvimento
  private getMockCategories(): ProductCategory[] {
    return [
      {
        id: 'para-cachorros',
        name: 'Para Cachorros',
        slug: 'para-cachorros',
        description: 'Alimentação completa para cães',
        imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300',
        children: [
          {
            id: 'racao-seca',
            name: 'Ração Seca',
            slug: 'racao-seca',
            description: 'Ração seca premium para cães',
            parentId: 'para-cachorros'
          },
          {
            id: 'petiscos-dogs',
            name: 'Petiscos',
            slug: 'petiscos-cachorros',
            description: 'Petiscos naturais para cães',
            parentId: 'para-cachorros'
          }
        ]
      },
      {
        id: 'para-gatos',
        name: 'Para Gatos',
        slug: 'para-gatos',
        description: 'Alimentação completa para felinos',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300',
        children: [
          {
            id: 'racao-gatos',
            name: 'Ração para Gatos',
            slug: 'racao-gatos',
            description: 'Ração premium para felinos',
            parentId: 'para-gatos'
          }
        ]
      },
      {
        id: 'petiscos',
        name: 'Petiscos',
        slug: 'petiscos',
        description: 'Petiscos naturais para todos os pets',
        imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300'
      }
    ]
  }

  private getMockProducts(filters: ProductFilter): ProductResponse {
    const allProducts: Product[] = [
      {
        id: 'oipet-premium-adulto',
        name: 'OiPet Premium Adulto',
        description: 'Ração super premium para cães adultos com ingredientes naturais',
        price: 89.90,
        originalPrice: 99.90,
        discount: 10,
        category: 'para-cachorros',
        subcategory: 'racao-seca',
        brand: 'OiPet',
        imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
        images: [
          'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
          'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'
        ],
        inStock: true,
        weight: '15kg',
        flavor: 'Frango e Arroz',
        petType: 'dog',
        ageGroup: 'adult',
        nutritionalInfo: {
          protein: 26,
          fat: 15,
          carbs: 45,
          calories: 3500
        },
        ingredients: ['Frango', 'Arroz integral', 'Milho', 'Vegetais'],
        slug: 'oipet-premium-adulto-15kg',
        url: `${OIPET_BASE_URL}/para-cachorros/oipet-premium-adulto-15kg`,
        rating: 4.8,
        reviews: 156
      },
      {
        id: 'oipet-filhote',
        name: 'OiPet Filhote Premium',
        description: 'Ração especial para filhotes com DHA e cálcio',
        price: 79.90,
        category: 'para-cachorros',
        subcategory: 'racao-seca',
        brand: 'OiPet',
        imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
        images: [
          'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400'
        ],
        inStock: true,
        weight: '10kg',
        flavor: 'Frango e Cereais',
        petType: 'dog',
        ageGroup: 'puppy',
        nutritionalInfo: {
          protein: 30,
          fat: 18,
          carbs: 40,
          calories: 3800
        },
        slug: 'oipet-filhote-premium-10kg',
        url: `${OIPET_BASE_URL}/para-cachorros/oipet-filhote-premium-10kg`,
        rating: 4.9,
        reviews: 89
      },
      {
        id: 'petisco-natural-frango',
        name: 'Petisco Natural de Frango',
        description: 'Petisco 100% natural de frango desidratado',
        price: 24.90,
        category: 'petiscos',
        brand: 'OiPet',
        imageUrl: 'https://images.unsplash.com/photo-1558929996-da64ba858215?w=400',
        images: [
          'https://images.unsplash.com/photo-1558929996-da64ba858215?w=400'
        ],
        inStock: true,
        weight: '200g',
        flavor: 'Frango',
        petType: 'both',
        ageGroup: 'all',
        slug: 'petisco-natural-frango-200g',
        url: `${OIPET_BASE_URL}/petiscos/petisco-natural-frango-200g`,
        rating: 4.7,
        reviews: 234
      },
      {
        id: 'oipet-gatos-premium',
        name: 'OiPet Gatos Premium',
        description: 'Ração premium para gatos adultos com taurina',
        price: 69.90,
        category: 'para-gatos',
        subcategory: 'racao-gatos',
        brand: 'OiPet',
        imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
        images: [
          'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400'
        ],
        inStock: true,
        weight: '8kg',
        flavor: 'Salmão',
        petType: 'cat',
        ageGroup: 'adult',
        nutritionalInfo: {
          protein: 32,
          fat: 16,
          carbs: 35,
          calories: 3600
        },
        slug: 'oipet-gatos-premium-8kg',
        url: `${OIPET_BASE_URL}/para-gatos/oipet-gatos-premium-8kg`,
        rating: 4.6,
        reviews: 67
      }
    ]

    // Aplicar filtros
    let filteredProducts = allProducts

    if (filters.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category)
    }

    if (filters.petType && filters.petType !== 'both') {
      filteredProducts = filteredProducts.filter(p => p.petType === filters.petType || p.petType === 'both')
    }

    if (filters.ageGroup && filters.ageGroup !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.ageGroup === filters.ageGroup || p.ageGroup === 'all')
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      )
    }

    if (filters.inStock) {
      filteredProducts = filteredProducts.filter(p => p.inStock)
    }

    // Ordenação
    if (filters.sortBy) {
      filteredProducts.sort((a, b) => {
        let comparison = 0
        switch (filters.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name)
            break
          case 'price':
            comparison = a.price - b.price
            break
          case 'rating':
            comparison = (b.rating || 0) - (a.rating || 0)
            break
          default:
            comparison = 0
        }
        return filters.sortOrder === 'desc' ? -comparison : comparison
      })
    }

    // Paginação
    const page = filters.page || 1
    const limit = filters.limit || 12
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    return {
      products: paginatedProducts,
      total: filteredProducts.length,
      page,
      limit,
      totalPages: Math.ceil(filteredProducts.length / limit),
      categories: this.getMockCategories(),
      brands: ['OiPet']
    }
  }

  private getMockProduct(id: string): Product | null {
    const { products } = this.getMockProducts({})
    return products.find(p => p.id === id) || null
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const ecommerceService = new EcommerceService()
export default ecommerceService