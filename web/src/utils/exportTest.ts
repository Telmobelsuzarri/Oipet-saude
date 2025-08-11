// Teste automatizado de exportação que pode ser executado no console do navegador
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// Extend jsPDF to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable
  }
}

export class ExportTester {
  static async testAll() {
    console.log('🧪 Iniciando testes de exportação...')
    
    const results = {
      jspdf: await this.testJsPDF(),
      xlsx: await this.testXLSX(),
      autoTable: await this.testAutoTable(),
      integration: await this.testIntegration()
    }
    
    console.log('📊 Resultados dos testes:', results)
    
    const allPassed = Object.values(results).every(Boolean)
    console.log(allPassed ? '✅ Todos os testes passaram!' : '❌ Alguns testes falharam')
    
    return results
  }
  
  static async testJsPDF(): Promise<boolean> {
    try {
      console.log('🔍 Testando jsPDF básico...')
      const doc = new jsPDF()
      doc.text('Teste jsPDF - OiPet', 20, 20)
      doc.text('Texto adicional para teste', 20, 40)
      
      // Tentar salvar
      doc.save('teste-jspdf-automatico.pdf')
      console.log('✅ jsPDF: OK')
      return true
    } catch (error) {
      console.error('❌ jsPDF falhou:', error)
      return false
    }
  }
  
  static async testXLSX(): Promise<boolean> {
    try {
      console.log('🔍 Testando XLSX básico...')
      const workbook = XLSX.utils.book_new()
      
      const data = [
        ['Nome', 'Idade', 'Cidade'],
        ['João', 25, 'São Paulo'],
        ['Maria', 30, 'Rio de Janeiro']
      ]
      
      const worksheet = XLSX.utils.aoa_to_sheet(data)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Teste')
      
      // Tentar salvar
      XLSX.writeFile(workbook, 'teste-xlsx-automatico.xlsx')
      console.log('✅ XLSX: OK')
      return true
    } catch (error) {
      console.error('❌ XLSX falhou:', error)
      return false
    }
  }
  
  static async testAutoTable(): Promise<boolean> {
    try {
      console.log('🔍 Testando AutoTable...')
      const doc = new jsPDF()
      
      doc.text('Teste AutoTable - OiPet', 20, 20)
      
      const tableData = [
        ['Data', 'Pet', 'Peso'],
        ['01/01/2025', 'Rex', '15.2kg'],
        ['02/01/2025', 'Luna', '8.5kg']
      ]
      
      doc.autoTable({
        head: [tableData[0]],
        body: tableData.slice(1),
        startY: 30,
        theme: 'striped'
      })
      
      // Tentar salvar
      doc.save('teste-autotable-automatico.pdf')
      console.log('✅ AutoTable: OK')
      return true
    } catch (error) {
      console.error('❌ AutoTable falhou:', error)
      return false
    }
  }
  
  static async testIntegration(): Promise<boolean> {
    try {
      console.log('🔍 Testando integração completa...')
      
      // Mock pet data
      const mockPet = {
        name: 'Rex',
        breed: 'Golden Retriever',
        birthDate: new Date('2020-01-01')
      }
      
      // Test PDF with more complex content
      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(20)
      doc.setTextColor('#E85A5A') // Coral color
      doc.text('OiPet Saúde - Relatório Completo', 20, 30)
      
      // Pet info
      doc.setFontSize(14)
      doc.setTextColor('#374151') // Dark gray
      doc.text(`Pet: ${mockPet.name}`, 20, 50)
      doc.text(`Raça: ${mockPet.breed}`, 20, 70)
      
      // Table with health data
      const healthData = [
        ['Data', 'Peso (kg)', 'Água (ml)', 'Observações'],
        ['22/07/2025', '15.2', '800', 'Pet ativo e saudável'],
        ['21/07/2025', '15.1', '750', 'Boa alimentação'],
        ['20/07/2025', '15.0', '820', 'Exercícios regulares']
      ]
      
      doc.autoTable({
        head: [healthData[0]],
        body: healthData.slice(1),
        startY: 90,
        theme: 'striped',
        headStyles: {
          fillColor: '#E85A5A',
          textColor: '#FFFFFF'
        }
      })
      
      // Save PDF
      doc.save('teste-integracao-completa.pdf')
      
      // Test Excel with multiple sheets
      const workbook = XLSX.utils.book_new()
      
      // Info sheet
      const infoData = [
        ['OiPet Saúde - Relatório de Integração'],
        [''],
        ['Pet', mockPet.name],
        ['Raça', mockPet.breed],
        ['Data', new Date().toLocaleDateString('pt-BR')]
      ]
      const infoSheet = XLSX.utils.aoa_to_sheet(infoData)
      XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informações')
      
      // Health data sheet
      const healthSheet = XLSX.utils.aoa_to_sheet(healthData)
      XLSX.utils.book_append_sheet(workbook, healthSheet, 'Dados de Saúde')
      
      // Save Excel
      XLSX.writeFile(workbook, 'teste-integracao-completa.xlsx')
      
      console.log('✅ Integração completa: OK')
      return true
    } catch (error) {
      console.error('❌ Integração falhou:', error)
      return false
    }
  }
  
  // Método para ser chamado no console do navegador
  static async runFromConsole() {
    console.clear()
    console.log('%c🚀 OiPet Export Tester', 'color: #E85A5A; font-size: 20px; font-weight: bold')
    console.log('Execute os testes e verifique sua pasta de downloads')
    
    const results = await this.testAll()
    
    if (results.jspdf && results.xlsx && results.autoTable && results.integration) {
      console.log('%c✅ SUCESSO: Todas as bibliotecas estão funcionando!', 'color: green; font-size: 16px; font-weight: bold')
      console.log('Verifique sua pasta de downloads para os arquivos gerados.')
    } else {
      console.log('%c❌ ERRO: Algumas bibliotecas não estão funcionando', 'color: red; font-size: 16px; font-weight: bold')
      console.log('Detalhes:', results)
    }
    
    return results
  }
}

// Disponibilizar no window para ser chamado do console
if (typeof window !== 'undefined') {
  (window as any).testExports = ExportTester.runFromConsole
}