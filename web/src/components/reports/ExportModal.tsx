import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ChartBarIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

import { GlassContainer } from '@/components/ui/GlassContainer'
import { reportServiceReal as reportService, type ReportData, type ExportOptions } from '@/services/reportServiceReal'
import { cn } from '@/lib/utils'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  reportData: ReportData | null
}

const exportFormats = [
  {
    id: 'pdf',
    name: 'PDF',
    description: 'Relatório completo em formato PDF',
    icon: DocumentTextIcon,
    color: 'red',
    recommended: true
  },
  {
    id: 'excel',
    name: 'Excel',
    description: 'Planilha com dados e gráficos',
    icon: TableCellsIcon,
    color: 'green'
  },
  {
    id: 'csv',
    name: 'CSV',
    description: 'Dados em formato de tabela',
    icon: TableCellsIcon,
    color: 'blue'
  }
]

const languages = [
  { id: 'pt-BR', name: 'Português (Brasil)' },
  { id: 'en-US', name: 'English (US)' }
]

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  reportData
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includePhotos: false,
    language: 'pt-BR'
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const handleExport = async () => {
    if (!reportData) return

    setIsExporting(true)
    setExportError(null)

    try {
      const result = await reportService.exportReport(reportData, exportOptions)
      
      // Simulate download
      const link = document.createElement('a')
      link.href = result.url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setExportSuccess(true)
      setTimeout(() => {
        setExportSuccess(false)
        onClose()
      }, 2000)

    } catch (error) {
      setExportError('Erro ao exportar relatório. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  const updateOption = <K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setExportOptions(prev => ({ ...prev, [key]: value }))
  }

  const getFormatColor = (format: string) => {
    const formatData = exportFormats.find(f => f.id === format)
    return formatData?.color || 'gray'
  }

  const getColorClasses = (color: string, selected: boolean = false) => {
    const baseClasses = selected 
      ? 'border-2 ring-2 ring-opacity-50' 
      : 'border border-gray-200'

    const colorMap: Record<string, string> = {
      red: selected ? 'border-red-500 bg-red-50 ring-red-200' : 'hover:border-red-300',
      green: selected ? 'border-green-500 bg-green-50 ring-green-200' : 'hover:border-green-300',
      blue: selected ? 'border-blue-500 bg-blue-50 ring-blue-200' : 'hover:border-blue-300',
      gray: selected ? 'border-gray-500 bg-gray-50 ring-gray-200' : 'hover:border-gray-300'
    }

    return cn(baseClasses, colorMap[color] || colorMap.gray)
  }

  if (!reportData) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex min-h-full items-center justify-center p-4">
              <GlassContainer className="w-full max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200/20">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Exportar Relatório
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Configure as opções de exportação
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-glass hover:bg-white/20 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </motion.button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                  {/* Export Format */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Formato de Exportação
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {exportFormats.map((format) => (
                        <motion.button
                          key={format.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateOption('format', format.id as any)}
                          className={cn(
                            'relative p-4 rounded-glass text-left transition-all',
                            getColorClasses(format.color, exportOptions.format === format.id)
                          )}
                        >
                          {format.recommended && (
                            <div className="absolute -top-2 -right-2 bg-coral-500 text-white text-xs font-bold px-2 py-1 rounded-glass">
                              Recomendado
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-3 mb-2">
                            <format.icon className="h-6 w-6 text-gray-600" />
                            <span className="font-medium text-gray-900">
                              {format.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {format.description}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Export Options */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Opções de Conteúdo
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeCharts}
                          onChange={(e) => updateOption('includeCharts', e.target.checked)}
                          className="rounded border-gray-300 text-coral-600 focus:ring-coral-500"
                        />
                        <div className="flex items-center space-x-2">
                          <ChartBarIcon className="h-5 w-5 text-gray-600" />
                          <span className="text-gray-900 font-medium">Incluir gráficos</span>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportOptions.includePhotos}
                          onChange={(e) => updateOption('includePhotos', e.target.checked)}
                          className="rounded border-gray-300 text-coral-600 focus:ring-coral-500"
                        />
                        <div className="flex items-center space-x-2">
                          <PhotoIcon className="h-5 w-5 text-gray-600" />
                          <span className="text-gray-900 font-medium">Incluir fotos dos pets</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Idioma
                    </h3>
                    <select
                      value={exportOptions.language}
                      onChange={(e) => updateOption('language', e.target.value as any)}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                    >
                      {languages.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preview Info */}
                  <div className="bg-gray-50 rounded-glass p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Prévia do Arquivo</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Nome:</span> {reportData.metadata.title.toLowerCase().replace(/\s+/g, '-')}-{new Date().toISOString().split('T')[0]}.{exportOptions.format}
                      </div>
                      <div>
                        <span className="font-medium">Período:</span> {reportData.metadata.period}
                      </div>
                      <div>
                        <span className="font-medium">Pets:</span> {reportData.metadata.petCount}
                      </div>
                      <div>
                        <span className="font-medium">Registros:</span> {reportData.metadata.recordCount}
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {exportError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-glass p-4 flex items-center space-x-3"
                    >
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <p className="text-red-700">{exportError}</p>
                    </motion.div>
                  )}

                  {/* Success Message */}
                  {exportSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 border border-green-200 rounded-glass p-4 flex items-center space-x-3"
                    >
                      <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <p className="text-green-700">Relatório exportado com sucesso!</p>
                    </motion.div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200/20">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-6 py-2 bg-white/50 text-gray-700 rounded-glass border border-gray-200 hover:bg-white/70 transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExport}
                    disabled={isExporting || exportSuccess}
                    className={cn(
                      'flex items-center space-x-2 px-6 py-2 rounded-glass font-medium transition-all',
                      isExporting || exportSuccess
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-coral-500 text-white hover:bg-coral-600'
                    )}
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Exportando...</span>
                      </>
                    ) : exportSuccess ? (
                      <>
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Concluído</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        <span>Exportar Relatório</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </GlassContainer>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}