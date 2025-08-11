import React, { useState } from 'react'

export const QuickExportTest: React.FC = () => {
  const [log, setLog] = useState<string[]>(['🚀 Iniciando teste rápido...'])

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
    console.log(message)
  }

  const testDynamicImports = async () => {
    addLog('🔍 Testando importações dinâmicas...')
    
    try {
      // Teste 1: Importação dinâmica do jsPDF
      addLog('📝 Importando jsPDF...')
      const { default: jsPDF } = await import('jspdf')
      addLog('✅ jsPDF importado com sucesso')
      
      // Teste 2: Criar documento
      addLog('📄 Criando documento PDF...')
      const doc = new jsPDF()
      addLog('✅ Documento criado')
      
      // Teste 3: Adicionar texto
      addLog('✍️ Adicionando texto...')
      doc.text('Teste OiPet - Exportação Rápida', 20, 20)
      doc.text(`Data: ${new Date().toLocaleDateString()}`, 20, 40)
      addLog('✅ Texto adicionado')
      
      // Teste 4: Tentar salvar
      addLog('💾 Salvando PDF...')
      doc.save(`teste-rapido-${Date.now()}.pdf`)
      addLog('🎉 PDF salvo com sucesso!')
      
    } catch (error: any) {
      addLog(`❌ Erro no teste de PDF: ${error.message}`)
      console.error('Erro completo:', error)
    }
    
    try {
      // Teste 5: Importação dinâmica do XLSX
      addLog('📊 Importando XLSX...')
      const XLSX = await import('xlsx')
      addLog('✅ XLSX importado com sucesso')
      
      // Teste 6: Criar workbook
      addLog('📋 Criando workbook...')
      const workbook = XLSX.utils.book_new()
      addLog('✅ Workbook criado')
      
      // Teste 7: Criar dados
      addLog('📈 Criando dados...')
      const data = [
        ['OiPet - Teste Rápido'],
        [''],
        ['Pet', 'Rex'],
        ['Peso', '15kg'],
        ['Data', new Date().toLocaleDateString()]
      ]
      
      const worksheet = XLSX.utils.aoa_to_sheet(data)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Teste')
      addLog('✅ Dados criados')
      
      // Teste 8: Salvar Excel
      addLog('💾 Salvando Excel...')
      XLSX.writeFile(workbook, `teste-rapido-${Date.now()}.xlsx`)
      addLog('🎉 Excel salvo com sucesso!')
      
    } catch (error: any) {
      addLog(`❌ Erro no teste de Excel: ${error.message}`)
      console.error('Erro completo:', error)
    }
    
    addLog('🏁 Teste concluído!')
  }

  const testAutoTable = async () => {
    addLog('🔍 Testando AutoTable...')
    
    try {
      // Importar jsPDF
      const { default: jsPDF } = await import('jspdf')
      addLog('✅ jsPDF importado')
      
      // Tentar importar AutoTable
      addLog('📊 Importando AutoTable...')
      await import('jspdf-autotable')
      addLog('✅ AutoTable importado')
      
      // Criar documento
      const doc = new jsPDF()
      
      // Verificar se autoTable está disponível
      if (typeof (doc as any).autoTable === 'function') {
        addLog('✅ Método autoTable detectado')
        
        // Criar tabela
        ;(doc as any).autoTable({
          head: [['Nome', 'Valor']],
          body: [
            ['Teste 1', '123'],
            ['Teste 2', '456']
          ],
          startY: 20
        })
        
        addLog('✅ Tabela criada')
        doc.save(`teste-autotable-${Date.now()}.pdf`)
        addLog('🎉 PDF com tabela salvo!')
        
      } else {
        addLog('❌ Método autoTable não encontrado no objeto doc')
      }
      
    } catch (error: any) {
      addLog(`❌ Erro no teste AutoTable: ${error.message}`)
      console.error('Erro completo:', error)
    }
  }

  const clearLog = () => {
    setLog(['🔄 Log limpo - pronto para novo teste'])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🐾 OiPet - Teste Rápido de Exportação
          </h1>
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={testDynamicImports}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              🚀 Teste Básico (PDF + Excel)
            </button>
            
            <button
              onClick={testAutoTable}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              📊 Teste AutoTable
            </button>
            
            <button
              onClick={clearLog}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              🧹 Limpar Log
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Console Log:</h3>
            <span className="text-gray-500 text-xs">
              {log.length} entradas
            </span>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {log.map((entry, index) => (
              <div key={index} className="mb-1">
                {entry}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Instruções:</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li>Clique no botão "Teste Básico" para testar PDF e Excel</li>
            <li>Clique no botão "Teste AutoTable" para testar tabelas em PDF</li>
            <li>Verifique sua pasta de Downloads pelos arquivos gerados</li>
            <li>Observe o console log acima para detalhes do teste</li>
            <li>Abra o Console do navegador (F12) para logs adicionais</li>
          </ol>
        </div>
      </div>
    </div>
  )
}