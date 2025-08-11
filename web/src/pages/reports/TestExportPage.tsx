import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  TableCellsIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { GlassCard } from '@/components/ui/GlassContainer'
import { ExportTester } from '@/utils/exportTest'

// Extend jsPDF to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable
  }
}

export const TestExportPage: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    jspdf: boolean | null
    xlsx: boolean | null
    autoTable: boolean | null
  }>({
    jspdf: null,
    xlsx: null,
    autoTable: null
  })

  const testJsPDF = async () => {
    try {
      const doc = new jsPDF()
      doc.text('Teste jsPDF - OiPet', 20, 20)
      doc.save('teste-jspdf.pdf')
      setTestResults(prev => ({ ...prev, jspdf: true }))
      console.log('✅ jsPDF funcionando')
    } catch (error) {
      console.error('❌ Erro no jsPDF:', error)
      setTestResults(prev => ({ ...prev, jspdf: false }))
    }
  }

  const testXLSX = async () => {
    try {
      const workbook = XLSX.utils.book_new()
      const data = [['Nome', 'Valor'], ['Teste', 123]]
      const worksheet = XLSX.utils.aoa_to_sheet(data)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Teste')
      XLSX.writeFile(workbook, 'teste-xlsx.xlsx')
      setTestResults(prev => ({ ...prev, xlsx: true }))
      console.log('✅ XLSX funcionando')
    } catch (error) {
      console.error('❌ Erro no XLSX:', error)
      setTestResults(prev => ({ ...prev, xlsx: false }))
    }
  }

  const testAutoTable = async () => {
    try {
      const doc = new jsPDF()
      doc.text('Teste AutoTable - OiPet', 20, 20)
      
      doc.autoTable({
        head: [['Coluna 1', 'Coluna 2']],
        body: [['Linha 1', 'Dados 1'], ['Linha 2', 'Dados 2']],
        startY: 30
      })
      
      doc.save('teste-autotable.pdf')
      setTestResults(prev => ({ ...prev, autoTable: true }))
      console.log('✅ AutoTable funcionando')
    } catch (error) {
      console.error('❌ Erro no AutoTable:', error)
      setTestResults(prev => ({ ...prev, autoTable: false }))
    }
  }

  const runAllTests = async () => {
    setTestResults({ jspdf: null, xlsx: null, autoTable: null })
    await testJsPDF()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testXLSX()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testAutoTable()
  }

  const runAutomatedTest = async () => {
    console.log('🤖 Executando teste automatizado...')
    const results = await ExportTester.testAll()
    
    // Atualizar estado baseado nos resultados
    setTestResults({
      jspdf: results.jspdf,
      xlsx: results.xlsx,
      autoTable: results.autoTable
    })
  }

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <div className="w-4 h-4 bg-gray-300 rounded-full" />
    if (status === true) return <CheckCircleIcon className="w-4 h-4 text-green-500" />
    return <div className="w-4 h-4 bg-red-500 rounded-full" />
  }

  const getStatusText = (status: boolean | null) => {
    if (status === null) return 'Não testado'
    if (status === true) return 'Funcionando'
    return 'Com erro'
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
            Teste de Bibliotecas de Exportação
          </h1>
          <p className="text-gray-600">
            Verificar se jsPDF, AutoTable e XLSX estão funcionando corretamente
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Teste jsPDF */}
          <GlassCard>
            <div className="text-center">
              <DocumentTextIcon className="h-12 w-12 text-red-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">jsPDF</h3>
              <div className="flex items-center justify-center space-x-2 mb-4">
                {getStatusIcon(testResults.jspdf)}
                <span className="text-sm text-gray-600">
                  {getStatusText(testResults.jspdf)}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={testJsPDF}
                className="px-4 py-2 bg-red-500 text-white rounded-glass hover:bg-red-600 transition-colors"
              >
                Testar PDF
              </motion.button>
            </div>
          </GlassCard>

          {/* Teste XLSX */}
          <GlassCard>
            <div className="text-center">
              <TableCellsIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">XLSX</h3>
              <div className="flex items-center justify-center space-x-2 mb-4">
                {getStatusIcon(testResults.xlsx)}
                <span className="text-sm text-gray-600">
                  {getStatusText(testResults.xlsx)}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={testXLSX}
                className="px-4 py-2 bg-green-500 text-white rounded-glass hover:bg-green-600 transition-colors"
              >
                Testar Excel
              </motion.button>
            </div>
          </GlassCard>

          {/* Teste AutoTable */}
          <GlassCard>
            <div className="text-center">
              <DocumentTextIcon className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AutoTable</h3>
              <div className="flex items-center justify-center space-x-2 mb-4">
                {getStatusIcon(testResults.autoTable)}
                <span className="text-sm text-gray-600">
                  {getStatusText(testResults.autoTable)}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={testAutoTable}
                className="px-4 py-2 bg-blue-500 text-white rounded-glass hover:bg-blue-600 transition-colors"
              >
                Testar Tabela
              </motion.button>
            </div>
          </GlassCard>
        </div>

        {/* Botões para testar */}
        <div className="text-center space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runAllTests}
            className="px-8 py-4 bg-coral-500 text-white rounded-glass hover:bg-coral-600 transition-colors inline-flex items-center space-x-2 mr-4"
          >
            <PlayIcon className="h-5 w-5" />
            <span>Executar Testes Simples</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runAutomatedTest}
            className="px-8 py-4 bg-blue-500 text-white rounded-glass hover:bg-blue-600 transition-colors inline-flex items-center space-x-2"
          >
            <PlayIcon className="h-5 w-5" />
            <span>Teste Automatizado Completo</span>
          </motion.button>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              💡 <strong>Dica:</strong> Abra o Console (F12) para ver logs detalhados dos testes
            </p>
          </div>
        </div>

        {/* Status Geral */}
        <div className="mt-8">
          <GlassCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Testes</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>jsPDF (Geração de PDF)</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(testResults.jspdf)}
                  <span className="text-sm">{getStatusText(testResults.jspdf)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>XLSX (Geração de Excel)</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(testResults.xlsx)}
                  <span className="text-sm">{getStatusText(testResults.xlsx)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>AutoTable (Tabelas em PDF)</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(testResults.autoTable)}
                  <span className="text-sm">{getStatusText(testResults.autoTable)}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}