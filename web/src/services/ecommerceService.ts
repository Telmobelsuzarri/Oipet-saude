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
  images: string[]
  rating: number
  reviewCount: number
  inStock: boolean
  stockQuantity: number
  weight?: string
  ingredients?: string[]
  nutritionalInfo?: {
    protein: number
    fat: number
    fiber: number
    moisture: number
  }
  tags: string[]
  isRecommended?: boolean
  oipetUrl: string // URL da loja OiPet
}

interface CartItem {
  product: Product
  quantity: number
  selectedWeight?: string
}

interface ProductFilter {
  category?: string
  petType?: string
  ageGroup?: string
  priceRange?: [number, number]
  inStock?: boolean
  search?: string
}

// Mock products database
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
    imageUrl: '/api/placeholder/300/300',
    images: ['/api/placeholder/300/300', '/api/placeholder/300/300'],
    rating: 4.8,
    reviewCount: 127,
    inStock: true,
    stockQuantity: 45,
    weight: '10kg',
    ingredients: ['Frango', 'Arroz', 'Milho', 'Gordura de frango', 'Vitaminas'],
    nutritionalInfo: {
      protein: 26,
      fat: 15,
      fiber: 4,
      moisture: 10
    },
    tags: ['premium', 'natural', 'digestível'],
    isRecommended: true,
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
    imageUrl: '/api/placeholder/300/300',
    images: ['/api/placeholder/300/300'],
    rating: 4.9,
    reviewCount: 89,
    inStock: true,
    stockQuantity: 120,
    weight: '100g',
    ingredients: ['Frango desidratado'],
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
    imageUrl: '/api/placeholder/300/300',
    images: ['/api/placeholder/300/300', '/api/placeholder/300/300'],
    rating: 4.7,
    reviewCount: 63,
    inStock: true,
    stockQuantity: 28,
    weight: '7.5kg',
    ingredients: ['Frango', 'Salmão', 'Arroz', 'DHA', 'Vitaminas'],
    nutritionalInfo: {
      protein: 32,
      fat: 18,
      fiber: 3,
      moisture: 10
    },
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
    imageUrl: '/api/placeholder/300/300',
    images: ['/api/placeholder/300/300'],
    rating: 4.5,
    reviewCount: 94,
    inStock: true,
    stockQuantity: 67,
    tags: ['natural', 'dentes', 'resistente'],
    oipetUrl: 'https://oipetcomidadeverdade.com.br/brinquedos/corda-natural'
  },
  {
    id: 'shampoo-neutro',
    name: 'Shampoo Neutro Pets',
    description: 'Shampoo neutro para cães e gatos com pele sensível, pH balanceado.',
    price: 32.90,
    category: 'higiene',
    petType: 'both',
    ageGroup: 'todas',
    imageUrl: '/api/placeholder/300/300',
    images: ['/api/placeholder/300/300'],
    rating: 4.6,
    reviewCount: 45,
    inStock: true,
    stockQuantity: 89,
    weight: '500ml',
    tags: ['neutro', 'pele sensível', 'pH balanceado'],
    oipetUrl: 'https://oipetcomidadeverdade.com.br/higiene/shampoo-neutro'
  },
  {
    id: 'suplemento-articulacoes',
    name: 'Suplemento para Articulações',
    description: 'Suplemento com glucosamina e condroitina para saúde das articulações.',
    price: 89.90,
    category: 'saúde',
    petType: 'both',
    ageGroup: 'idoso',
    imageUrl: '/api/placeholder/300/300',
    images: ['/api/placeholder/300/300'],
    rating: 4.8,
    reviewCount: 156,
    inStock: false,
    stockQuantity: 0,
    tags: ['articulações', 'glucosamina', 'idosos'],
    oipetUrl: 'https://oipetcomidadeverdade.com.br/saude/suplemento-articulacoes'
  }
]

class EcommerceService {
  private readonly OIPET_BASE_URL = 'https://oipetcomidadeverdade.com.br'
  private readonly API_DELAY = 1000 // Simula delay da API

  async getProducts(filter?: ProductFilter): Promise<Product[]> {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, this.API_DELAY))

    let products = [...mockProducts]

    if (filter) {
      if (filter.category) {
        products = products.filter(p => p.category === filter.category)
      }
      
      if (filter.petType) {
        products = products.filter(p => p.petType === filter.petType || p.petType === 'both')
      }
      
      if (filter.ageGroup) {
        products = products.filter(p => p.ageGroup === filter.ageGroup || p.ageGroup === 'todas')
      }
      
      if (filter.inStock !== undefined) {
        products = products.filter(p => p.inStock === filter.inStock)
      }
      
      if (filter.priceRange) {
        const [min, max] = filter.priceRange
        products = products.filter(p => p.price >= min && p.price <= max)
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchLower))
        )
      }
    }

    return products
  }

  async getProductById(id: string): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, this.API_DELAY))
    return mockProducts.find(p => p.id === id) || null
  }

  async getRecommendedProducts(petType?: string, ageGroup?: string): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, this.API_DELAY))
    
    let recommended = mockProducts.filter(p => p.isRecommended)
    
    if (petType) {
      recommended = recommended.filter(p => p.petType === petType || p.petType === 'both')
    }
    
    if (ageGroup) {
      recommended = recommended.filter(p => p.ageGroup === ageGroup || p.ageGroup === 'todas')
    }
    
    return recommended.slice(0, 6) // Máximo 6 recomendações
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.getProducts({ category })
  }

  redirectToOiPetStore(productUrl: string): void {
    window.open(productUrl, '_blank', 'noopener,noreferrer')
  }

  redirectToOiPetCart(items: CartItem[]): void {
    // Em uma implementação real, isso poderia:
    // 1. Criar um carrinho temporário na API da OiPet
    // 2. Redirecionar com parâmetros de produtos
    // 3. Usar deep linking para o app da OiPet
    
    const cartUrl = `${this.OIPET_BASE_URL}/carrinho`
    window.open(cartUrl, '_blank', 'noopener,noreferrer')
  }

  getOiPetStoreUrl(): string {
    return this.OIPET_BASE_URL
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  calculateDiscount(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
  }

  async getCategories(): Promise<Array<{id: string, name: string, count: number}>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const categories = [
      { id: 'ração', name: 'Ração', count: 0 },
      { id: 'petiscos', name: 'Petiscos', count: 0 },
      { id: 'brinquedos', name: 'Brinquedos', count: 0 },
      { id: 'acessórios', name: 'Acessórios', count: 0 },
      { id: 'higiene', name: 'Higiene', count: 0 },
      { id: 'saúde', name: 'Saúde', count: 0 }
    ]
    
    // Conta produtos por categoria
    categories.forEach(cat => {
      cat.count = mockProducts.filter(p => p.category === cat.id).length
    })
    
    return categories
  }
}

export const ecommerceService = new EcommerceService()
export type { Product, CartItem, ProductFilter }