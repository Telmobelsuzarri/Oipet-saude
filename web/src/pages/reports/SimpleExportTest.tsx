import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon, 
  TableCellsIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { GlassCard } from '@/components/ui/GlassContainer'

export const SimpleExportTest: React.FC = () => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  const testPDFExport = async () => {
    setTestStatus('testing')
    setErrorMessage('')
    setSuccessMessage('')
    
    try {
      console.log('🔍 Iniciando teste de PDF...')
      
      // Importação dinâmica para capturar erros
      const jsPDF = await import('jspdf')
      console.log('✅ jsPDF importado com sucesso')
      
      const autoTable = await import('jspdf-autotable')
      console.log('✅ jspdf-autotable importado com sucesso')
      
      // Criar documento PDF
      const doc = new jsPDF.default()
      console.log('✅ Documento PDF criado')
      
      // Adicionar texto
      doc.text('OiPet Saúde - Teste de Exportação', 20, 20)
      doc.text('Este é um teste simples de geração de PDF', 20, 40)
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 60)
      
      // Adicionar tabela
      const tableData = [
        ['Pet', 'Peso', 'Status'],
        ['Rex', '15.2 kg', 'Saudável'],
        ['Luna', '8.5 kg', 'Ativa'],
        ['Max', '12.0 kg', 'Feliz']
      ]
      
      doc.autoTable({
        head: [tableData[0]],
        body: tableData.slice(1),
        startY: 80,
        theme: 'striped',
        headStyles: {
          fillColor: [232, 90, 90], // Cor coral
          textColor: [255, 255, 255]
        }
      })
      
      console.log('✅ Tabela adicionada ao PDF')
      
      // Salvar arquivo
      const fileName = `teste-oipet-${Date.now()}.pdf`
      doc.save(fileName)
      
      console.log('✅ PDF salvo com sucesso:', fileName)
      setSuccessMessage(`PDF "${fileName}" gerado com sucesso! Verifique sua pasta de Downloads.`)
      setTestStatus('success')
      
    } catch (error) {
      console.error('❌ Erro no teste de PDF:', error)
      setErrorMessage(`Erro ao gerar PDF: ${error.message}`)
      setTestStatus('error')
    }
  }

  const testExcelExport = async () => {
    setTestStatus('testing')
    setErrorMessage('')
    setSuccessMessage('')
    
    try {
      console.log('🔍 Iniciando teste de Excel...')
      
      // Importação dinâmica para capturar erros
      const XLSX = await import('xlsx')
      console.log('✅ XLSX importado com sucesso')
      
      // Criar workbook
      const workbook = XLSX.utils.book_new()
      console.log('✅ Workbook criado')
      
      // Dados para a planilha
      const petData = [
        ['Nome do Pet', 'Raça', 'Idade', 'Peso (kg)', 'Status'],
        ['Rex', 'Golden Retriever', '3 anos', 15.2, 'Saudável'],
        ['Luna', 'Border Collie', '2 anos', 8.5, 'Ativa'],
        ['Max', 'Labrador', '4 anos', 12.0, 'Feliz'],
        ['Bella', 'Poodle', '1 ano', 6.8, 'Brincalhona']
      ]
      
      // Criar worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(petData)
      console.log('✅ Worksheet criado')
      
      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados dos Pets')
      
      // Criar segunda aba com estatísticas
      const statsData = [
        ['Estatísticas OiPet'],
        [''],
        ['Total de Pets', 4],
        ['Peso Médio', '10.6 kg'],
        ['Pets Saudáveis', '100%'],
        [''],
        ['Relatório gerado em', new Date().toLocaleDateString('pt-BR')]
      ]
      
      const statsWorksheet = XLSX.utils.aoa_to_sheet(statsData)
      XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Estatísticas')
      
      console.log('✅ Segunda aba criada')
      
      // Salvar arquivo
      const fileName = `teste-oipet-${Date.now()}.xlsx`
      XLSX.writeFile(workbook, fileName)
      
      console.log('✅ Excel salvo com sucesso:', fileName)
      setSuccessMessage(`Excel "${fileName}" gerado com sucesso! Verifique sua pasta de Downloads.`)
      setTestStatus('success')
      
    } catch (error) {
      console.error('❌ Erro no teste de Excel:', error)
      setErrorMessage(`Erro ao gerar Excel: ${error.message}`)
      setTestStatus('error')
    }
  }

  const runBothTests = async () => {
    await testPDFExport()
    if (testStatus === 'success') {
      setTimeout(async () => {
        await testExcelExport()
      }, 1000)
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
            Teste Simples de Exportação
          </h1>
          <p className="text-gray-600">
            Teste direto das bibliotecas jsPDF e XLSX com importação dinâmica
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Teste PDF */}
          <GlassCard>
            <div className="text-center p-6">
              <DocumentTextIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Teste PDF</h3>
              <p className="text-gray-600 mb-4">
                Gerar PDF com jsPDF + AutoTable
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={testPDFExport}
                disabled={testStatus === 'testing'}
                className="px-6 py-3 bg-red-500 text-white rounded-glass hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {testStatus === 'testing' ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Testando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <PlayIcon className="w-4 h-4" />
                    <span>Testar PDF</span>
                  </div>
                )}
              </motion.button>
            </div>
          </GlassCard>

          {/* Teste Excel */}
          <GlassCard>
            <div className="text-center p-6">
              <TableCellsIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Teste Excel</h3>
              <p className="text-gray-600 mb-4">
                Gerar XLSX com SheetJS
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={testExcelExport}
                disabled={testStatus === 'testing'}
                className="px-6 py-3 bg-green-500 text-white rounded-glass hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {testStatus === 'testing' ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Testando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <PlayIcon className="w-4 h-4" />
                    <span>Testar Excel</span>
                  </div>
                )}
              </motion.button>
            </div>
          </GlassCard>
        </div>

        {/* Botão para testar ambos */}
        <div className="text-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runBothTests}
            disabled={testStatus === 'testing'}
            className="px-8 py-4 bg-coral-500 text-white rounded-glass hover:bg-coral-600 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center space-x-2">
              <PlayIcon className="w-5 h-5" />
              <span>Testar PDF + Excel</span>
            </div>
          </motion.button>
        </div>

        {/* Status Messages */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <GlassCard className="bg-green-50 border-green-200">
              <div className="flex items-center space-x-3 text-green-800">
                <CheckCircleIcon className="h-6 w-6 flex-shrink-0" />
                <p>{successMessage}</p>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <GlassCard className="bg-red-50 border-red-200">
              <div className="flex items-center space-x-3 text-red-800">
                <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0" />
                <div>
                  <p className="font-medium">Erro no teste:</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Instructions */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Como usar este teste:
          </h3>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="bg-coral-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
              <span>Abra o Console do navegador (F12) para ver logs detalhados</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-coral-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
              <span>Clique em "Testar PDF" ou "Testar Excel" para testar individualmente</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-coral-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
              <span>Os arquivos serão salvos automaticamente na sua pasta de Downloads</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-coral-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
              <span>Se houver erro, ele será exibido aqui na tela</span>
            </li>
          </ol>
        </GlassCard>
      </div>
    </div>
  )
}