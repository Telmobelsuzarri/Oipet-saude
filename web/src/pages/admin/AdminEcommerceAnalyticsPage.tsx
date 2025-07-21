import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingCartIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { OiPetLogo } from '@/components/ui/OiPetLogo'
import { ecommerceAnalytics } from '@/services/ecommerceAnalytics'

export const AdminEcommerceAnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [searchAnalytics, setSearchAnalytics] = useState<any[]>([])
  const [categoryAnalytics, setCategoryAnalytics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Gerar dados mock se não existirem
      if (ecommerceAnalytics.getAnalyticsData().totalViews === 0) {
        ecommerceAnalytics.generateMockData(30)
      }
      
      const data = ecommerceAnalytics.getAnalyticsData()
      const searchData = ecommerceAnalytics.getSearchAnalytics()
      const categoryData = ecommerceAnalytics.getCategoryAnalytics()
      
      setAnalyticsData(data)
      setSearchAnalytics(searchData)
      setCategoryAnalytics(categoryData)
      
    } catch (err) {
      setError('Erro ao carregar analytics de e-commerce')
      console.error('Analytics load error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const exportData = () => {
    const data = ecommerceAnalytics.exportAnalyticsData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `oipet-ecommerce-analytics-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum dado disponível</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header com Logo OiPet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <OiPetLogo size="lg" showText={true} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics E-commerce</h1>
            <p className="text-gray-600 mt-1">Análise de performance da loja integrada</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportData}
            className="flex items-center space-x-2 bg-coral-500 text-white px-4 py-2 rounded-glass hover:bg-coral-600 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Exportar Dados</span>
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-glass p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Métricas Principais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Visualizações</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalViews)}</p>
              <p className="text-xs text-gray-500 mt-1">produtos visualizados</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-glass">
              <EyeIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Carrinho</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalAddToCarts)}</p>
              <p className="text-xs text-gray-500 mt-1">itens adicionados</p>
            </div>
            <div className="p-3 bg-coral-100 rounded-glass">
              <ShoppingCartIcon className="h-6 w-6 text-coral-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Redirecionamentos</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalPurchases)}</p>
              <p className="text-xs text-gray-500 mt-1">para loja OiPet</p>
            </div>
            <div className="p-3 bg-green-100 rounded-glass">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </GlassWidget>

        <GlassWidget className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Potencial</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.revenue)}</p>
              <p className="text-xs text-gray-500 mt-1">valor redirecionado</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-glass">
              <CurrencyDollarIcon className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </GlassWidget>
      </motion.div>

      {/* Funil de Conversão */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Funil de Conversão</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <EyeIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Visualizações</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: '100%' }} />
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">
                  {analyticsData.conversionFunnel.productViews}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShoppingCartIcon className="h-5 w-5 text-coral-600" />
                <span className="text-sm font-medium text-gray-900">Adicionados ao Carrinho</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-coral-600" 
                    style={{ 
                      width: `${(analyticsData.conversionFunnel.addToCarts / analyticsData.conversionFunnel.productViews) * 100}%` 
                    }} 
                  />
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">
                  {analyticsData.conversionFunnel.addToCarts}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Redirecionamentos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-green-600" 
                    style={{ 
                      width: `${(analyticsData.conversionFunnel.purchases / analyticsData.conversionFunnel.productViews) * 100}%` 
                    }} 
                  />
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">
                  {analyticsData.conversionFunnel.purchases}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Taxa de Conversão</p>
                  <p className="text-xl font-bold text-green-600">
                    {analyticsData.conversionFunnel.conversionRate.toFixed(2)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Ticket Médio</p>
                  <p className="text-xl font-bold text-teal-600">
                    {formatCurrency(analyticsData.conversionFunnel.averageOrderValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Top Produtos e Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Top Produtos */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos Mais Visualizados</h3>
          <div className="space-y-3">
            {analyticsData.topProducts.slice(0, 5).map((product: any, index: number) => (
              <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-coral-100 text-coral-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.productName}</p>
                    <p className="text-xs text-gray-600">{product.views} visualizações</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(product.revenue)}</p>
                  <p className="text-xs text-gray-600">{product.purchases} redirecionamentos</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Analytics por Categoria */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Categoria</h3>
          <div className="space-y-3">
            {categoryAnalytics.slice(0, 5).map((category: any, index: number) => (
              <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TagIcon className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{category.category}</p>
                    <p className="text-xs text-gray-600">{category.views} visualizações</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{category.addToCarts}</p>
                  <p className="text-xs text-gray-600">no carrinho</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Buscas Mais Populares */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Termos de Busca Mais Populares</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchAnalytics.slice(0, 6).map((search: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">"{search.query}"</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{search.count}</p>
                  <p className="text-xs text-gray-600">buscas</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Gráfico de Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline de Atividade (Últimos 7 Dias)</h3>
          <div className="space-y-4">
            {analyticsData.timeSeriesData.slice(-7).map((day: any, index: number) => (
              <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString('pt-BR', { 
                      weekday: 'short', 
                      day: '2-digit', 
                      month: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Visualizações</p>
                    <p className="font-bold text-blue-600">{day.views}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Carrinho</p>
                    <p className="font-bold text-coral-600">{day.addToCarts}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Redirecionamentos</p>
                    <p className="font-bold text-green-600">{day.purchases}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Receita</p>
                    <p className="font-bold text-teal-600">{formatCurrency(day.revenue)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}