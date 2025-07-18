import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  ScaleIcon,
  HeartIcon,
  FireIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

import { GlassContainer, GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { ReportFilters } from '@/components/reports/ReportFilters'
import { ReportPreview } from '@/components/reports/ReportPreview'
import { ExportModal } from '@/components/reports/ExportModal'
import { reportService, type ReportFilter, type ReportData } from '@/services/reportService'
import { usePetStore } from '@/stores/petStore'
import { cn } from '@/lib/utils'

const reportTypes = [
  {
    id: 'complete',
    name: 'Relatório Completo',
    description: 'Análise completa de saúde, peso, atividades e nutrição',
    icon: DocumentTextIcon,
    color: 'coral'
  },
  {
    id: 'health',
    name: 'Relatório de Saúde',
    description: 'Foco em indicadores de saúde e bem-estar',
    icon: HeartIcon,
    color: 'red'
  },
  {
    id: 'weight',
    name: 'Relatório de Peso',
    description: 'Evolução do peso e IMC do pet',
    icon: ScaleIcon,
    color: 'blue'
  },
  {
    id: 'activity',
    name: 'Relatório de Atividades',
    description: 'Análise de exercícios e atividades físicas',
    icon: FireIcon,
    color: 'orange'
  },
  {
    id: 'nutrition',
    name: 'Relatório Nutricional',
    description: 'Controle de calorias e alimentação',
    icon: ChartBarIcon,
    color: 'green'
  }
]

export const ReportsPage: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState('complete')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [filter, setFilter] = useState<ReportFilter>({
    reportType: 'complete',
    period: 'month'
  })

  const { pets } = usePetStore()

  useEffect(() => {
    setFilter(prev => ({ ...prev, reportType: selectedReportType as any }))
  }, [selectedReportType])

  const handleGenerateReport = async () => {
    setLoading(true)
    try {
      const data = await reportService.generateReport(filter)
      setReportData(data)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilter: Partial<ReportFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }))
  }

  const getReportTypeColor = (type: string) => {
    const reportType = reportTypes.find(rt => rt.id === type)
    return reportType?.color || 'gray'
  }

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      coral: 'bg-coral-500 text-white',
      red: 'bg-red-500 text-white',
      blue: 'bg-blue-500 text-white',
      orange: 'bg-orange-500 text-white',
      green: 'bg-green-500 text-white',
      gray: 'bg-gray-500 text-white'
    }
    return colorMap[color] || colorMap.gray
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Relatórios 📊
            </h1>
            <p className="text-gray-600 mt-1">
              Análises detalhadas da saúde dos seus pets
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-glass border transition-all',
                showFilters
                  ? 'bg-coral-500 text-white border-coral-500'
                  : 'bg-white/50 text-gray-700 border-gray-200 hover:bg-white/70'
              )}
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filtros</span>
            </motion.button>

            {reportData && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowExportModal(true)}
                className="flex items-center space-x-2 bg-teal-500 text-white px-4 py-2 rounded-glass hover:bg-teal-600 transition-colors"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Exportar</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Report Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Tipo de Relatório
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {reportTypes.map((type) => (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedReportType(type.id)}
                className={cn(
                  'relative p-4 rounded-glass border-2 transition-all text-left',
                  selectedReportType === type.id
                    ? `border-${type.color}-500 bg-${type.color}-50`
                    : 'border-gray-200 bg-white/30 hover:bg-white/50'
                )}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={cn(
                    'p-2 rounded-glass',
                    selectedReportType === type.id
                      ? getColorClasses(type.color)
                      : 'bg-gray-100 text-gray-600'
                  )}>
                    <type.icon className="h-5 w-5" />
                  </div>
                  
                  {selectedReportType === type.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </motion.div>
                  )}
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1">
                  {type.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {type.description}
                </p>
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ReportFilters
            filter={filter}
            pets={pets}
            onChange={handleFilterChange}
          />
        </motion.div>
      )}

      {/* Generate Report Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerateReport}
          disabled={loading}
          className={cn(
            'inline-flex items-center space-x-3 px-8 py-4 rounded-glass font-medium text-lg transition-all',
            loading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-coral-500 to-coral-600 text-white hover:from-coral-600 hover:to-coral-700 shadow-lg hover:shadow-xl'
          )}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              <span>Gerando relatório...</span>
            </>
          ) : (
            <>
              <ChartBarIcon className="h-6 w-6" />
              <span>Gerar Relatório</span>
            </>
          )}
        </motion.button>
        
        {!reportData && !loading && (
          <p className="text-gray-500 text-sm mt-2">
            Configure os filtros e clique para gerar seu relatório
          </p>
        )}
      </motion.div>

      {/* Report Preview */}
      {reportData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ReportPreview data={reportData} />
        </motion.div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        reportData={reportData}
      />
    </div>
  )
}