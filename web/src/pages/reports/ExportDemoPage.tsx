import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  TableCellsIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'

import { GlassContainer, GlassCard } from '@/components/ui/GlassContainer'
import { exportServiceSimple } from '@/services/exportServiceSimple'
import { usePetStore } from '@/stores/petStore'
import { cn } from '@/lib/utils'

export const ExportDemoPage: React.FC = () => {
  const { pets, selectedPet } = usePetStore()
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [exportError, setExportError] = useState<string | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel'>('pdf')

  const handleExport = async () => {
    if (!selectedPet) {
      setExportStatus('error')
      setExportError('Por favor, selecione um pet primeiro')
      return
    }

    setIsExporting(true)
    setExportStatus('idle')
    setExportError(null)

    try {
      console.log('Iniciando exportação...', { format: selectedFormat, pet: selectedPet.name })
      
      // Exportar no formato selecionado usando o serviço simplificado
      if (selectedFormat === 'pdf') {
        await exportServiceSimple.exportTestPDF(selectedPet)
      } else {
        await exportServiceSimple.exportTestExcel(selectedPet)
      }

      console.log('Exportação concluída com sucesso!')
      setExportStatus('success')
      setTimeout(() => setExportStatus('idle'), 3000)
    } catch (error) {
      console.error('Erro detalhado ao exportar:', error)
      setExportStatus('error')
      setExportError(error?.message || 'Erro desconhecido ao exportar')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demonstração de Exportação PDF/Excel
          </h1>
          <p className="text-gray-600">
            Teste a exportação avançada de relatórios de saúde
          </p>
        </motion.div>

        {/* Seleção de Pet */}
        <GlassCard className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Selecione um Pet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pets.map(pet => (
              <motion.button
                key={pet.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => usePetStore.getState().setSelectedPet(pet)}
                className={cn(
                  'p-4 rounded-glass border-2 transition-all text-left',
                  selectedPet?._id === pet._id
                    ? 'border-coral-500 bg-coral-50'
                    : 'border-gray-200 hover:border-coral-300'
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold',
                    selectedPet?._id === pet._id
                      ? 'bg-coral-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}>
                    {pet.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{pet.name}</p>
                    <p className="text-sm text-gray-600">{pet.breed}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </GlassCard>

        {/* Seleção de Formato */}
        <GlassCard className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Formato de Exportação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedFormat('pdf')}
              className={cn(
                'p-6 rounded-glass border-2 transition-all',
                selectedFormat === 'pdf'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              )}
            >
              <DocumentTextIcon className="h-12 w-12 text-red-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">PDF</h3>
              <p className="text-sm text-gray-600 mt-2">
                Relatório profissional com gráficos e análises
              </p>
              <ul className="mt-4 space-y-2 text-left">
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Layout profissional
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Gráficos inclusos
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Pronto para impressão
                </li>
              </ul>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedFormat('excel')}
              className={cn(
                'p-6 rounded-glass border-2 transition-all',
                selectedFormat === 'excel'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              )}
            >
              <TableCellsIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Excel</h3>
              <p className="text-sm text-gray-600 mt-2">
                Planilha com dados detalhados para análise
              </p>
              <ul className="mt-4 space-y-2 text-left">
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Múltiplas abas
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Dados estruturados
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Fácil manipulação
                </li>
              </ul>
            </motion.button>
          </div>
        </GlassCard>

        {/* Recursos Inclusos */}
        <GlassCard className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            O que será incluído
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DocumentDuplicateIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Dados Completos</h3>
              <p className="text-sm text-gray-600 mt-1">
                Histórico de saúde dos últimos 30 dias
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DocumentTextIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Análises</h3>
              <p className="text-sm text-gray-600 mt-1">
                Tendências e estatísticas detalhadas
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircleIcon className="h-8 w-8 text-coral-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Recomendações</h3>
              <p className="text-sm text-gray-600 mt-1">
                Sugestões personalizadas de saúde
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Botão de Exportação */}
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            disabled={!selectedPet || isExporting}
            className={cn(
              'inline-flex items-center space-x-3 px-8 py-4 rounded-glass font-medium transition-all',
              !selectedPet || isExporting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : exportStatus === 'success'
                ? 'bg-green-500 text-white'
                : exportStatus === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-coral-500 text-white hover:bg-coral-600'
            )}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Exportando...</span>
              </>
            ) : exportStatus === 'success' ? (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                <span>Exportado com Sucesso!</span>
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Exportar Relatório {selectedFormat === 'pdf' ? 'PDF' : 'Excel'}</span>
              </>
            )}
          </motion.button>

          {!selectedPet && (
            <p className="text-sm text-red-600 mt-2">
              Por favor, selecione um pet primeiro
            </p>
          )}

          {exportError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-glass">
              <p className="text-sm text-red-700">
                <strong>Erro:</strong> {exportError}
              </p>
            </div>
          )}

          {exportStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-glass">
              <p className="text-sm text-green-700">
                ✅ Arquivo exportado com sucesso! Verifique sua pasta de downloads.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}