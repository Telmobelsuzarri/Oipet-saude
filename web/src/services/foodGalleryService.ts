// Food Gallery Service - Galeria de fotos de alimentação dos pets
import { usePetStore } from '@/stores/petStore'
import { gamificationService } from './gamificationService'

export interface FoodPhoto {
  id: string
  petId: string
  imageUrl: string
  imageBlob: Blob
  fileName: string
  caption?: string
  notes?: string
  timestamp: Date
  tags: string[]
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'food'
  // Sistema de controle de estoque
  stockInfo?: {
    initialQuantity: number      // Quantidade inicial (ex: 10 pacotes)
    currentQuantity: number      // Quantidade atual restante
    unit: string                 // Unidade (pacotes, latas, kg, etc)
    minimumAlert: number         // Quando alertar (ex: quando sobrar 2)
    consumptionRate: number      // Taxa de consumo diária estimada
    estimatedDuration: number    // Dias estimados para acabar
    lastUpdated: Date           // Última atualização da quantidade
    notifications: {
      lowStock: boolean         // Se já foi notificado sobre estoque baixo
      outOfStock: boolean       // Se já foi notificado sobre fim do estoque
    }
  }
}

export interface FoodGalleryStats {
  totalPhotos: number
  photosThisWeek: number
  photosThisMonth: number
  lastPhotoDate?: Date
  favoriteFood?: string
  mealDistribution: {
    breakfast: number
    lunch: number
    dinner: number
    snack: number
    food: number
  }
  // Estatísticas de estoque
  stockStats?: {
    totalItems: number
    itemsWithStock: number
    itemsLowStock: number
    itemsOutOfStock: number
    totalValue: number
    averageDaysRemaining: number
  }
}

class FoodGalleryService {
  private readonly STORAGE_KEY = 'oipet_food_gallery'
  
  // Carregar todas as fotos do localStorage
  private loadPhotos(): FoodPhoto[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (!data) return []
      
      const photos = JSON.parse(data)
      return photos.map((photo: any) => ({
        ...photo,
        timestamp: new Date(photo.timestamp),
        stockInfo: photo.stockInfo ? {
          ...photo.stockInfo,
          lastUpdated: new Date(photo.stockInfo.lastUpdated)
        } : undefined
      }))
    } catch (error) {
      console.error('Erro ao carregar galeria de fotos:', error)
      return []
    }
  }

  // Salvar fotos no localStorage
  private savePhotos(photos: FoodPhoto[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(photos))
    } catch (error) {
      console.error('Erro ao salvar galeria de fotos:', error)
      throw new Error('Falha ao salvar foto na galeria')
    }
  }

  // Converter Blob para base64 para armazenamento
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  // Converter base64 de volta para Blob
  private base64ToBlob(base64: string): Blob {
    const byteCharacters = atob(base64.split(',')[1])
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: 'image/jpeg' })
  }

  // Adicionar nova foto à galeria
  async addPhoto(
    petId: string, 
    imageFile: File | Blob, 
    options: {
      caption?: string
      notes?: string
      tags?: string[]
      mealType?: FoodPhoto['mealType']
      stockInfo?: {
        initialQuantity: number
        unit: string
        minimumAlert?: number
      }
    } = {}
  ): Promise<FoodPhoto> {
    try {
      const photos = this.loadPhotos()
      
      // Converter imagem para base64 para armazenamento local
      const imageBase64 = await this.blobToBase64(imageFile)
      
      let stockInfo = undefined
      if (options.stockInfo && options.stockInfo.initialQuantity > 0) {
        stockInfo = {
          initialQuantity: options.stockInfo.initialQuantity,
          currentQuantity: options.stockInfo.initialQuantity,
          unit: options.stockInfo.unit,
          minimumAlert: options.stockInfo.minimumAlert || Math.max(1, Math.floor(options.stockInfo.initialQuantity * 0.2)), // 20% da quantidade inicial
          consumptionRate: 0, // Será calculado com base no uso
          estimatedDuration: 0, // Será calculado
          lastUpdated: new Date(),
          notifications: {
            lowStock: false,
            outOfStock: false
          }
        }
      }

      const newPhoto: FoodPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        petId,
        imageUrl: imageBase64,
        imageBlob: imageFile,
        fileName: imageFile instanceof File ? imageFile.name : `food_photo_${Date.now()}.jpg`,
        caption: options.caption,
        notes: options.notes,
        timestamp: new Date(),
        tags: options.tags || [],
        mealType: options.mealType || 'snack',
        stockInfo
      }

      photos.push(newPhoto)
      this.savePhotos(photos)
      
      // Integração com gamificação - dar XP por adicionar foto de alimento
      if (typeof window !== 'undefined') {
        try {
          gamificationService.checkAchievements(petId, { 
            type: 'food_scan', 
            data: { hasStock: Boolean(stockInfo) } 
          })
        } catch (error) {
          console.log('Gamification integration error:', error)
        }
      }
      
      return newPhoto
    } catch (error) {
      console.error('Erro ao adicionar foto:', error)
      throw new Error('Falha ao adicionar foto à galeria')
    }
  }

  // Buscar fotos por pet
  getPhotosByPet(petId: string): FoodPhoto[] {
    const photos = this.loadPhotos()
    return photos
      .filter(photo => photo.petId === petId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Buscar fotos recentes (todos os pets)
  getRecentPhotos(limit: number = 10): FoodPhoto[] {
    const photos = this.loadPhotos()
    return photos
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  // Buscar fotos por período
  getPhotosByDateRange(petId: string, startDate: Date, endDate: Date): FoodPhoto[] {
    const photos = this.getPhotosByPet(petId)
    return photos.filter(photo => 
      photo.timestamp >= startDate && photo.timestamp <= endDate
    )
  }

  // Buscar fotos por tipo de refeição
  getPhotosByMealType(petId: string, mealType: FoodPhoto['mealType']): FoodPhoto[] {
    const photos = this.getPhotosByPet(petId)
    return photos.filter(photo => photo.mealType === mealType)
  }

  // Buscar fotos por tags
  getPhotosByTags(petId: string, tags: string[]): FoodPhoto[] {
    const photos = this.getPhotosByPet(petId)
    return photos.filter(photo => 
      tags.some(tag => photo.tags.includes(tag.toLowerCase()))
    )
  }

  // Atualizar foto (caption, notes, tags)
  async updatePhoto(photoId: string, updates: Partial<Pick<FoodPhoto, 'caption' | 'notes' | 'tags' | 'mealType'>>): Promise<FoodPhoto | null> {
    try {
      const photos = this.loadPhotos()
      const photoIndex = photos.findIndex(photo => photo.id === photoId)
      
      if (photoIndex === -1) return null
      
      photos[photoIndex] = {
        ...photos[photoIndex],
        ...updates
      }
      
      this.savePhotos(photos)
      return photos[photoIndex]
    } catch (error) {
      console.error('Erro ao atualizar foto:', error)
      throw new Error('Falha ao atualizar foto')
    }
  }

  // Remover foto
  async deletePhoto(photoId: string): Promise<boolean> {
    try {
      const photos = this.loadPhotos()
      const filteredPhotos = photos.filter(photo => photo.id !== photoId)
      
      if (filteredPhotos.length === photos.length) return false // Foto não encontrada
      
      this.savePhotos(filteredPhotos)
      return true
    } catch (error) {
      console.error('Erro ao remover foto:', error)
      throw new Error('Falha ao remover foto')
    }
  }

  // Estatísticas da galeria
  getGalleryStats(petId: string): FoodGalleryStats {
    const photos = this.getPhotosByPet(petId)
    
    if (photos.length === 0) {
      return {
        totalPhotos: 0,
        photosThisWeek: 0,
        photosThisMonth: 0,
        mealDistribution: {
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snack: 0,
          food: 0
        }
      }
    }

    const now = new Date()
    const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
    const monthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))

    const photosThisWeek = photos.filter(photo => photo.timestamp >= weekAgo).length
    const photosThisMonth = photos.filter(photo => photo.timestamp >= monthAgo).length

    const mealDistribution = photos.reduce((acc, photo) => {
      acc[photo.mealType] = (acc[photo.mealType] || 0) + 1
      return acc
    }, {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0,
      food: 0
    })

    // Encontrar tag mais frequente (comida favorita)
    const tagFrequency: Record<string, number> = {}
    photos.forEach(photo => {
      photo.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1
      })
    })

    const favoriteFood = Object.keys(tagFrequency).length > 0 
      ? Object.entries(tagFrequency).sort(([,a], [,b]) => b - a)[0][0]
      : undefined

    // Calcular estatísticas de estoque
    const stockStats = this.calculateStockStats(photos)

    return {
      totalPhotos: photos.length,
      photosThisWeek,
      photosThisMonth,
      lastPhotoDate: photos[0].timestamp,
      favoriteFood,
      mealDistribution,
      stockStats
    }
  }

  // Buscar todas as tags únicas
  getAllTags(petId?: string): string[] {
    const photos = petId ? this.getPhotosByPet(petId) : this.loadPhotos()
    const allTags = photos.flatMap(photo => photo.tags)
    return [...new Set(allTags)].sort()
  }

  // Gerar relatório da galeria
  generateGalleryReport(petId: string): {
    stats: FoodGalleryStats
    recentPhotos: FoodPhoto[]
    topTags: { tag: string; count: number }[]
    mealTypeAnalysis: { type: string; percentage: number }[]
  } {
    const stats = this.getGalleryStats(petId)
    const recentPhotos = this.getPhotosByPet(petId).slice(0, 5)
    
    // Análise de tags mais frequentes
    const photos = this.getPhotosByPet(petId)
    const tagFrequency: Record<string, number> = {}
    
    photos.forEach(photo => {
      photo.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1
      })
    })

    const topTags = Object.entries(tagFrequency)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Análise de distribuição de refeições
    const totalMeals = Object.values(stats.mealDistribution).reduce((sum, count) => sum + count, 0)
    const mealTypeAnalysis = Object.entries(stats.mealDistribution)
      .map(([type, count]) => ({
        type,
        percentage: totalMeals > 0 ? Math.round((count / totalMeals) * 100) : 0
      }))

    return {
      stats,
      recentPhotos,
      topTags,
      mealTypeAnalysis
    }
  }

  // Exportar galeria (para backup ou compartilhamento)
  exportGallery(petId: string): string {
    const photos = this.getPhotosByPet(petId)
    const stats = this.getGalleryStats(petId)
    
    const exportData = {
      petId,
      exportDate: new Date().toISOString(),
      stats,
      photos: photos.map(photo => ({
        ...photo,
        // Não incluir o blob na exportação para reduzir tamanho
        imageBlob: undefined
      }))
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  // Limpar galeria (remover fotos antigas)
  async cleanupOldPhotos(petId: string, daysToKeep: number = 90): Promise<number> {
    try {
      const photos = this.loadPhotos()
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
      
      const petPhotos = photos.filter(photo => photo.petId === petId)
      const photosToKeep = petPhotos.filter(photo => photo.timestamp >= cutoffDate)
      const photosToDelete = petPhotos.filter(photo => photo.timestamp < cutoffDate)
      
      const otherPetPhotos = photos.filter(photo => photo.petId !== petId)
      const updatedPhotos = [...otherPetPhotos, ...photosToKeep]
      
      this.savePhotos(updatedPhotos)
      return photosToDelete.length
    } catch (error) {
      console.error('Erro ao limpar fotos antigas:', error)
      throw new Error('Falha ao limpar fotos antigas')
    }
  }

  // ========================================
  // SISTEMA DE CONTROLE DE ESTOQUE
  // ========================================

  // Calcular estatísticas de estoque
  private calculateStockStats(photos: FoodPhoto[]) {
    const itemsWithStock = photos.filter(photo => photo.stockInfo && photo.stockInfo.currentQuantity > 0)
    const totalItems = photos.filter(photo => photo.stockInfo).length
    
    if (totalItems === 0) {
      return {
        totalItems: 0,
        itemsWithStock: 0,
        itemsLowStock: 0,
        itemsOutOfStock: 0,
        totalValue: 0,
        averageDaysRemaining: 0
      }
    }

    const itemsLowStock = photos.filter(photo => 
      photo.stockInfo && 
      photo.stockInfo.currentQuantity <= photo.stockInfo.minimumAlert &&
      photo.stockInfo.currentQuantity > 0
    ).length

    const itemsOutOfStock = photos.filter(photo => 
      photo.stockInfo && photo.stockInfo.currentQuantity <= 0
    ).length

    const totalDaysRemaining = photos
      .filter(photo => photo.stockInfo && photo.stockInfo.currentQuantity > 0)
      .reduce((sum, photo) => sum + (photo.stockInfo!.estimatedDuration || 0), 0)

    const averageDaysRemaining = itemsWithStock.length > 0 
      ? Math.round(totalDaysRemaining / itemsWithStock.length)
      : 0

    return {
      totalItems,
      itemsWithStock: itemsWithStock.length,
      itemsLowStock,
      itemsOutOfStock,
      totalValue: 0, // Pode ser implementado futuramente com preços
      averageDaysRemaining
    }
  }

  // Atualizar quantidade de estoque
  async updateStockQuantity(photoId: string, newQuantity: number): Promise<boolean> {
    try {
      const photos = this.loadPhotos()
      const photoIndex = photos.findIndex(photo => photo.id === photoId)
      
      if (photoIndex === -1 || !photos[photoIndex].stockInfo) return false
      
      const photo = photos[photoIndex]
      const stockInfo = photo.stockInfo!
      
      // Calcular taxa de consumo baseada na mudança
      const daysSinceLastUpdate = Math.max(1, Math.floor((Date.now() - stockInfo.lastUpdated.getTime()) / (24 * 60 * 60 * 1000)))
      const consumed = stockInfo.currentQuantity - newQuantity
      
      if (consumed > 0 && daysSinceLastUpdate > 0) {
        // Atualizar taxa de consumo (média móvel)
        const newConsumptionRate = consumed / daysSinceLastUpdate
        stockInfo.consumptionRate = stockInfo.consumptionRate === 0 
          ? newConsumptionRate 
          : (stockInfo.consumptionRate * 0.7) + (newConsumptionRate * 0.3) // Média ponderada
      }

      // Atualizar quantidade e data
      stockInfo.currentQuantity = Math.max(0, newQuantity)
      stockInfo.lastUpdated = new Date()
      
      // Calcular duração estimada
      if (stockInfo.consumptionRate > 0 && stockInfo.currentQuantity > 0) {
        stockInfo.estimatedDuration = Math.ceil(stockInfo.currentQuantity / stockInfo.consumptionRate)
      }

      this.savePhotos(photos)
      
      // Verificar se precisa de notificações
      await this.checkStockNotifications(photo)
      
      return true
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error)
      return false
    }
  }

  // Consumir estoque (diminuir quantidade)
  async consumeStock(photoId: string, quantity: number = 1): Promise<boolean> {
    try {
      const photos = this.loadPhotos()
      const photo = photos.find(photo => photo.id === photoId)
      
      if (!photo?.stockInfo) return false
      
      const newQuantity = Math.max(0, photo.stockInfo.currentQuantity - quantity)
      return await this.updateStockQuantity(photoId, newQuantity)
    } catch (error) {
      console.error('Erro ao consumir estoque:', error)
      return false
    }
  }

  // Verificar notificações de estoque
  private async checkStockNotifications(photo: FoodPhoto): Promise<void> {
    if (!photo.stockInfo) return

    const stockInfo = photo.stockInfo
    const currentQuantity = stockInfo.currentQuantity
    const minimumAlert = stockInfo.minimumAlert

    // Estoque acabou
    if (currentQuantity <= 0 && !stockInfo.notifications.outOfStock) {
      await this.createStockNotification(photo, 'out_of_stock')
      stockInfo.notifications.outOfStock = true
    }
    // Estoque baixo
    else if (currentQuantity <= minimumAlert && !stockInfo.notifications.lowStock) {
      await this.createStockNotification(photo, 'low_stock')
      stockInfo.notifications.lowStock = true
    }
    // Reset das notificações se o estoque for reabastecido
    else if (currentQuantity > minimumAlert) {
      stockInfo.notifications.lowStock = false
      stockInfo.notifications.outOfStock = false
    }
  }

  // Criar notificação de estoque
  private async createStockNotification(photo: FoodPhoto, type: 'low_stock' | 'out_of_stock'): Promise<void> {
    const notification = {
      id: `stock_${photo.id}_${type}_${Date.now()}`,
      petId: photo.petId,
      type: 'stock_alert',
      title: type === 'out_of_stock' ? '🚨 Alimento Acabou!' : '⚠️ Estoque Baixo!',
      message: type === 'out_of_stock' 
        ? `${photo.caption || 'Alimento'} acabou! Considere comprar mais.`
        : `${photo.caption || 'Alimento'} está acabando. Restam ${photo.stockInfo?.currentQuantity} ${photo.stockInfo?.unit}.`,
      timestamp: new Date(),
      read: false,
      data: {
        photoId: photo.id,
        stockType: type,
        currentQuantity: photo.stockInfo?.currentQuantity || 0,
        unit: photo.stockInfo?.unit || 'unidades'
      }
    }

    // Salvar notificação (integrar com sistema de notificações existente)
    this.saveNotification(notification)
  }

  // Salvar notificação (pode ser integrado com um serviço de notificações)
  private saveNotification(notification: any): void {
    try {
      const notifications = JSON.parse(localStorage.getItem('oipet_notifications') || '[]')
      notifications.unshift(notification)
      
      // Manter apenas as 50 notificações mais recentes
      localStorage.setItem('oipet_notifications', JSON.stringify(notifications.slice(0, 50)))
      
      console.log('Notificação de estoque criada:', notification)
    } catch (error) {
      console.error('Erro ao salvar notificação:', error)
    }
  }

  // Buscar itens com estoque baixo
  getLowStockItems(petId: string): FoodPhoto[] {
    const photos = this.getPhotosByPet(petId)
    return photos.filter(photo => 
      photo.stockInfo && 
      photo.stockInfo.currentQuantity <= photo.stockInfo.minimumAlert &&
      photo.stockInfo.currentQuantity > 0
    )
  }

  // Buscar itens sem estoque
  getOutOfStockItems(petId: string): FoodPhoto[] {
    const photos = this.getPhotosByPet(petId)
    return photos.filter(photo => 
      photo.stockInfo && photo.stockInfo.currentQuantity <= 0
    )
  }
}

export const foodGalleryService = new FoodGalleryService()
export default foodGalleryService