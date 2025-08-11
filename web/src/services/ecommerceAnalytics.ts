import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface EcommerceEvent {
  event: string
  timestamp: number
  userId?: string
  sessionId: string
  properties: Record<string, any>
}

interface ProductView {
  productId: string
  productName: string
  category: string
  price: number
  timestamp: number
  userId?: string
  sessionId: string
  source: 'search' | 'category' | 'recommendation' | 'direct'
}

interface AddToCart {
  productId: string
  productName: string
  quantity: number
  price: number
  timestamp: number
  userId?: string
  sessionId: string
}

interface Purchase {
  orderId: string
  products: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
  }>
  totalValue: number
  timestamp: number
  userId?: string
  sessionId: string
  redirectedToOiPet: boolean
}

interface ConversionFunnel {
  productViews: number
  addToCarts: number
  purchases: number
  conversionRate: number
  averageOrderValue: number
}

interface AnalyticsData {
  totalViews: number
  totalAddToCarts: number
  totalPurchases: number
  revenue: number
  topProducts: Array<{
    productId: string
    productName: string
    views: number
    addToCarts: number
    purchases: number
    revenue: number
  }>
  conversionFunnel: ConversionFunnel
  timeSeriesData: Array<{
    date: string
    views: number
    addToCarts: number
    purchases: number
    revenue: number
  }>
}

class EcommerceAnalyticsService {
  private events: EcommerceEvent[] = []
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.loadFromStorage()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('oipet_ecommerce_analytics')
      if (stored) {
        this.events = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading analytics data:', error)
    }
  }

  private saveToStorage(): void {
    try {
      // Manter apenas os últimos 1000 eventos para evitar crescimento excessivo
      const recentEvents = this.events.slice(-1000)
      localStorage.setItem('oipet_ecommerce_analytics', JSON.stringify(recentEvents))
      this.events = recentEvents
    } catch (error) {
      console.error('Error saving analytics data:', error)
    }
  }

  setUserId(userId: string): void {
    this.userId = userId
  }

  private trackEvent(event: Omit<EcommerceEvent, 'timestamp' | 'sessionId'>): void {
    const eventData: EcommerceEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId
    }

    this.events.push(eventData)
    this.saveToStorage()

    // Em produção, enviaria para servidor de analytics
    console.log('E-commerce Event Tracked:', eventData)
  }

  // Tracking Methods
  trackProductView(productId: string, productName: string, category: string, price: number, source: ProductView['source'] = 'direct'): void {
    this.trackEvent({
      event: 'product_view',
      properties: {
        productId,
        productName,
        category,
        price,
        source
      }
    })
  }

  trackAddToCart(productId: string, productName: string, quantity: number, price: number): void {
    this.trackEvent({
      event: 'add_to_cart',
      properties: {
        productId,
        productName,
        quantity,
        price,
        totalValue: quantity * price
      }
    })
  }

  trackRemoveFromCart(productId: string, productName: string, quantity: number, price: number): void {
    this.trackEvent({
      event: 'remove_from_cart',
      properties: {
        productId,
        productName,
        quantity,
        price,
        totalValue: quantity * price
      }
    })
  }

  trackCartView(): void {
    this.trackEvent({
      event: 'cart_view',
      properties: {}
    })
  }

  trackCheckoutStart(cartItems: Array<{ productId: string; productName: string; quantity: number; price: number }>): void {
    const totalValue = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    
    this.trackEvent({
      event: 'checkout_start',
      properties: {
        cartItems,
        totalValue,
        itemCount: cartItems.length
      }
    })
  }

  trackRedirectToOiPet(cartItems: Array<{ productId: string; productName: string; quantity: number; price: number }>): void {
    const totalValue = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    
    this.trackEvent({
      event: 'redirect_to_oipet',
      properties: {
        cartItems,
        totalValue,
        itemCount: cartItems.length,
        destination: 'oipet_store'
      }
    })
  }

  trackSearch(query: string, resultCount: number): void {
    this.trackEvent({
      event: 'search',
      properties: {
        query,
        resultCount
      }
    })
  }

  trackCategoryView(category: string, productCount: number): void {
    this.trackEvent({
      event: 'category_view',
      properties: {
        category,
        productCount
      }
    })
  }

  trackFilterApplied(filters: Record<string, any>): void {
    this.trackEvent({
      event: 'filter_applied',
      properties: {
        filters
      }
    })
  }

  trackWebViewOpened(source: string, url?: string): void {
    this.trackEvent({
      event: 'webview_opened',
      properties: {
        source,
        url: url || 'https://oipetcomidadeverdade.com.br'
      }
    })
  }

  trackWebViewClosed(timeSpent: number, currentUrl?: string): void {
    this.trackEvent({
      event: 'webview_closed',
      properties: {
        timeSpent,
        currentUrl
      }
    })
  }

  trackHybridConversion(source: 'featured_products' | 'catalog_button' | 'search_results'): void {
    this.trackEvent({
      event: 'hybrid_conversion',
      properties: {
        source,
        conversionType: 'app_to_webview'
      }
    })
  }

  // Analytics Methods
  getAnalyticsData(startDate?: Date, endDate?: Date): AnalyticsData {
    const now = Date.now()
    const start = startDate?.getTime() || (now - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás
    const end = endDate?.getTime() || now

    const filteredEvents = this.events.filter(event => 
      event.timestamp >= start && event.timestamp <= end
    )

    const productViews = filteredEvents.filter(e => e.event === 'product_view')
    const addToCarts = filteredEvents.filter(e => e.event === 'add_to_cart')
    const redirects = filteredEvents.filter(e => e.event === 'redirect_to_oipet')

    // Calcular métricas por produto
    const productMetrics = new Map<string, {
      productId: string
      productName: string
      views: number
      addToCarts: number
      purchases: number
      revenue: number
    }>()

    // Processar visualizações
    productViews.forEach(event => {
      const { productId, productName } = event.properties
      if (!productMetrics.has(productId)) {
        productMetrics.set(productId, {
          productId,
          productName,
          views: 0,
          addToCarts: 0,
          purchases: 0,
          revenue: 0
        })
      }
      productMetrics.get(productId)!.views++
    })

    // Processar adicionar ao carrinho
    addToCarts.forEach(event => {
      const { productId, productName } = event.properties
      if (!productMetrics.has(productId)) {
        productMetrics.set(productId, {
          productId,
          productName,
          views: 0,
          addToCarts: 0,
          purchases: 0,
          revenue: 0
        })
      }
      productMetrics.get(productId)!.addToCarts++
    })

    // Processar redirecionamentos (consideramos como "compras" para fins de analytics)
    redirects.forEach(event => {
      const { cartItems } = event.properties
      if (cartItems) {
        cartItems.forEach((item: any) => {
          if (!productMetrics.has(item.productId)) {
            productMetrics.set(item.productId, {
              productId: item.productId,
              productName: item.productName,
              views: 0,
              addToCarts: 0,
              purchases: 0,
              revenue: 0
            })
          }
          const metrics = productMetrics.get(item.productId)!
          metrics.purchases += item.quantity
          metrics.revenue += item.quantity * item.price
        })
      }
    })

    const topProducts = Array.from(productMetrics.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Calcular funil de conversão
    const totalViews = productViews.length
    const totalAddToCarts = addToCarts.length
    const totalPurchases = redirects.length
    const totalRevenue = topProducts.reduce((sum, product) => sum + product.revenue, 0)

    const conversionFunnel: ConversionFunnel = {
      productViews: totalViews,
      addToCarts: totalAddToCarts,
      purchases: totalPurchases,
      conversionRate: totalViews > 0 ? (totalPurchases / totalViews) * 100 : 0,
      averageOrderValue: totalPurchases > 0 ? totalRevenue / totalPurchases : 0
    }

    // Gerar dados de série temporal (últimos 7 dias)
    const timeSeriesData = this.generateTimeSeriesData(filteredEvents, 7)

    return {
      totalViews,
      totalAddToCarts,
      totalPurchases,
      revenue: totalRevenue,
      topProducts,
      conversionFunnel,
      timeSeriesData
    }
  }

  private generateTimeSeriesData(events: EcommerceEvent[], days: number): AnalyticsData['timeSeriesData'] {
    const now = new Date()
    const data: AnalyticsData['timeSeriesData'] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const dayEvents = events.filter(event => 
        event.timestamp >= startOfDay.getTime() && 
        event.timestamp <= endOfDay.getTime()
      )

      const views = dayEvents.filter(e => e.event === 'product_view').length
      const addToCarts = dayEvents.filter(e => e.event === 'add_to_cart').length
      const purchases = dayEvents.filter(e => e.event === 'redirect_to_oipet').length
      
      const revenue = dayEvents
        .filter(e => e.event === 'redirect_to_oipet')
        .reduce((sum, event) => {
          return sum + (event.properties.totalValue || 0)
        }, 0)

      data.push({
        date: dateStr,
        views,
        addToCarts,
        purchases,
        revenue
      })
    }

    return data
  }

  getConversionFunnel(): ConversionFunnel {
    return this.getAnalyticsData().conversionFunnel
  }

  getTopProducts(limit: number = 10): AnalyticsData['topProducts'] {
    return this.getAnalyticsData().topProducts.slice(0, limit)
  }

  getSearchAnalytics(): Array<{ query: string; count: number; avgResults: number }> {
    const searchEvents = this.events.filter(e => e.event === 'search')
    const searchMap = new Map<string, { count: number; totalResults: number }>()

    searchEvents.forEach(event => {
      const query = event.properties.query?.toLowerCase() || ''
      const resultCount = event.properties.resultCount || 0

      if (!searchMap.has(query)) {
        searchMap.set(query, { count: 0, totalResults: 0 })
      }

      const data = searchMap.get(query)!
      data.count++
      data.totalResults += resultCount
    })

    return Array.from(searchMap.entries())
      .map(([query, data]) => ({
        query,
        count: data.count,
        avgResults: data.count > 0 ? data.totalResults / data.count : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  }

  getCategoryAnalytics(): Array<{ category: string; views: number; addToCarts: number; revenue: number }> {
    const categories = new Map<string, { views: number; addToCarts: number; revenue: number }>()

    this.events.forEach(event => {
      if (event.event === 'product_view' && event.properties.category) {
        const category = event.properties.category
        if (!categories.has(category)) {
          categories.set(category, { views: 0, addToCarts: 0, revenue: 0 })
        }
        categories.get(category)!.views++
      }
      
      if (event.event === 'add_to_cart' && event.properties.category) {
        const category = event.properties.category
        if (!categories.has(category)) {
          categories.set(category, { views: 0, addToCarts: 0, revenue: 0 })
        }
        categories.get(category)!.addToCarts++
      }
    })

    return Array.from(categories.entries())
      .map(([category, data]) => ({
        category,
        ...data
      }))
      .sort((a, b) => b.views - a.views)
  }

  exportAnalyticsData(): string {
    const data = this.getAnalyticsData()
    return JSON.stringify(data, null, 2)
  }

  clearAnalyticsData(): void {
    this.events = []
    localStorage.removeItem('oipet_ecommerce_analytics')
  }

  // Simular dados para demonstração
  // Backend Integration Methods
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken')
  }

  private getHeaders() {
    const token = this.getAuthToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  /**
   * Enviar tracking para o backend
   */
  async trackProductViewBackend(productId: string, userId?: string): Promise<void> {
    try {
      const params = {
        productId,
        userId,
        sessionId: this.sessionId,
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent
      }

      await axios.post(
        `${API_BASE_URL}/api/ecommerce-analytics/track-view`,
        params,
        { headers: this.getHeaders() }
      )
    } catch (error) {
      console.error('Erro ao enviar tracking para backend:', error)
    }
  }

  /**
   * Buscar dados de analytics do backend
   */
  async getBackendAnalytics(): Promise<any> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/ecommerce-analytics/dashboard`,
        { headers: this.getHeaders() }
      )
      return response.data.data
    } catch (error) {
      console.error('Erro ao buscar analytics do backend:', error)
      return null
    }
  }

  /**
   * Buscar produtos populares do backend
   */
  async getBackendPopularProducts(limit = 10): Promise<any[]> {
    try {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())

      const response = await axios.get(
        `${API_BASE_URL}/api/ecommerce-analytics/popular-products?${params}`,
        { headers: this.getHeaders() }
      )
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar produtos populares do backend:', error)
      return []
    }
  }

  generateMockData(days: number = 30): void {
    const mockProducts = [
      { id: 'racao-premium-adulto', name: 'Ração Premium Cães Adultos', category: 'ração', price: 89.90 },
      { id: 'petisco-natural-frango', name: 'Petisco Natural de Frango', category: 'petiscos', price: 24.90 },
      { id: 'racao-gatos-filhotes', name: 'Ração Especial Gatos Filhotes', category: 'ração', price: 67.90 },
      { id: 'brinquedo-corda', name: 'Brinquedo de Corda Natural', category: 'brinquedos', price: 19.90 }
    ]

    const now = Date.now()
    
    for (let i = 0; i < days; i++) {
      const dayStart = now - (i * 24 * 60 * 60 * 1000)
      
      // Gerar eventos aleatórios para o dia
      for (let j = 0; j < Math.floor(Math.random() * 50) + 10; j++) {
        const product = mockProducts[Math.floor(Math.random() * mockProducts.length)]
        const timestamp = dayStart + Math.floor(Math.random() * 24 * 60 * 60 * 1000)
        
        // Visualização de produto
        this.events.push({
          event: 'product_view',
          timestamp,
          sessionId: this.generateSessionId(),
          properties: {
            productId: product.id,
            productName: product.name,
            category: product.category,
            price: product.price,
            source: 'category'
          }
        })

        // 30% chance de adicionar ao carrinho
        if (Math.random() < 0.3) {
          this.events.push({
            event: 'add_to_cart',
            timestamp: timestamp + 60000,
            sessionId: this.generateSessionId(),
            properties: {
              productId: product.id,
              productName: product.name,
              quantity: 1,
              price: product.price,
              totalValue: product.price
            }
          })

          // 20% chance de comprar (redirecionar)
          if (Math.random() < 0.2) {
            this.events.push({
              event: 'redirect_to_oipet',
              timestamp: timestamp + 120000,
              sessionId: this.generateSessionId(),
              properties: {
                cartItems: [{
                  productId: product.id,
                  productName: product.name,
                  quantity: 1,
                  price: product.price
                }],
                totalValue: product.price,
                itemCount: 1
              }
            })
          }
        }
      }
    }

    this.saveToStorage()
  }
}

export const ecommerceAnalytics = new EcommerceAnalyticsService()
export default ecommerceAnalytics