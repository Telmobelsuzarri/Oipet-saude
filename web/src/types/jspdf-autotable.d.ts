// Declaração de tipos para jspdf-autotable
import 'jspdf'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      head?: any[][]
      body?: any[][]
      startY?: number
      theme?: 'striped' | 'grid' | 'plain'
      headStyles?: {
        fillColor?: number[] | string
        textColor?: number[] | string
        fontSize?: number
        fontStyle?: string
      }
      bodyStyles?: {
        fillColor?: number[] | string
        textColor?: number[] | string
        fontSize?: number
      }
      alternateRowStyles?: {
        fillColor?: number[] | string
      }
      margin?: {
        top?: number
        right?: number
        bottom?: number
        left?: number
      }
      pageBreak?: 'auto' | 'avoid' | 'always'
      showHead?: 'everyPage' | 'firstPage' | 'never'
      showFoot?: 'everyPage' | 'lastPage' | 'never'
      tableWidth?: 'auto' | 'wrap' | number
    }) => void
  }
}

export {}