import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { Pet } from '@/stores/petStore'

// Extend jsPDF to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable
  }
}

export class ExportServiceSimple {
  // Cores OiPet
  private readonly colors = {
    coral: '#E85A5A',
    teal: '#5AA3A3',
    gray: '#6B7280',
    lightGray: '#F3F4F6',
    darkGray: '#374151'
  }

  // Método simples para testar exportação PDF
  async exportTestPDF(pet: Pet): Promise<void> {
    try {
      const doc = new jsPDF()
      
      // Header simples
      doc.setFontSize(20)
      doc.setTextColor(this.colors.coral)
      doc.text('OiPet Saúde - Relatório', 20, 30)
      
      // Informações do pet
      doc.setFontSize(16)
      doc.setTextColor(this.colors.darkGray)
      doc.text(`Pet: ${pet.name}`, 20, 50)
      doc.text(`Raça: ${pet.breed}`, 20, 70)
      doc.text(`Idade: ${this.calculateAge(pet.birthDate)}`, 20, 90)
      
      // Data do relatório
      doc.setFontSize(12)
      doc.setTextColor(this.colors.gray)
      doc.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 110)
      
      // Tabela simples com dados de exemplo
      const tableData = [
        ['Data', 'Peso (kg)', 'Observações'],
        [new Date().toLocaleDateString('pt-BR'), '15.2', 'Pet saudável e ativo'],
        [new Date(Date.now() - 86400000).toLocaleDateString('pt-BR'), '15.1', 'Boa alimentação'],
        [new Date(Date.now() - 172800000).toLocaleDateString('pt-BR'), '15.0', 'Exercícios regulares']
      ]
      
      doc.autoTable({
        head: [tableData[0]],
        body: tableData.slice(1),
        startY: 130,
        theme: 'striped',
        headStyles: {
          fillColor: this.colors.coral,
          textColor: '#FFFFFF',
          fontSize: 12
        },
        bodyStyles: {
          fontSize: 10,
          textColor: this.colors.darkGray
        },
        margin: { left: 20, right: 20 }
      })
      
      // Salvar o PDF
      const fileName = `teste-relatorio-${pet.name.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      console.log('PDF gerado com sucesso:', fileName)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      throw new Error(`Falha ao gerar PDF: ${error.message}`)
    }
  }

  // Método simples para testar exportação Excel
  async exportTestExcel(pet: Pet): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new()

      // Aba de informações
      const infoData = [
        ['OiPet Saúde - Relatório de Teste'],
        [''],
        ['Pet', pet.name],
        ['Raça', pet.breed],
        ['Idade', this.calculateAge(pet.birthDate)],
        ['Relatório gerado em', new Date().toLocaleDateString('pt-BR')]
      ]
      const infoSheet = XLSX.utils.aoa_to_sheet(infoData)
      XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informações')

      // Aba de dados de saúde (exemplo)
      const healthData = [
        {
          'Data': new Date().toLocaleDateString('pt-BR'),
          'Peso (kg)': 15.2,
          'Água (ml)': 800,
          'Ração (g)': 350,
          'Observações': 'Pet saudável'
        },
        {
          'Data': new Date(Date.now() - 86400000).toLocaleDateString('pt-BR'),
          'Peso (kg)': 15.1,
          'Água (ml)': 750,
          'Ração (g)': 340,
          'Observações': 'Boa alimentação'
        },
        {
          'Data': new Date(Date.now() - 172800000).toLocaleDateString('pt-BR'),
          'Peso (kg)': 15.0,
          'Água (ml)': 820,
          'Ração (g)': 360,
          'Observações': 'Exercícios regulares'
        }
      ]
      const healthSheet = XLSX.utils.json_to_sheet(healthData)
      XLSX.utils.book_append_sheet(workbook, healthSheet, 'Dados de Saúde')

      // Salvar o arquivo Excel
      const fileName = `teste-relatorio-${pet.name.toLowerCase()}-${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)
      
      console.log('Excel gerado com sucesso:', fileName)
    } catch (error) {
      console.error('Erro ao gerar Excel:', error)
      throw new Error(`Falha ao gerar Excel: ${error.message}`)
    }
  }

  private calculateAge(birthDate: Date | string): string {
    const birth = new Date(birthDate)
    const today = new Date()
    const years = today.getFullYear() - birth.getFullYear()
    const months = today.getMonth() - birth.getMonth()
    
    if (years === 0) {
      return `${months} meses`
    } else if (years === 1) {
      return '1 ano'
    } else {
      return `${years} anos`
    }
  }
}

export const exportServiceSimple = new ExportServiceSimple()