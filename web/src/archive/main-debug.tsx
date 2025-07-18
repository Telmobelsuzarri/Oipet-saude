import React from 'react'
import ReactDOM from 'react-dom/client'

console.log('Debug: main-debug.tsx carregado')

// Componente de teste super simples
const TestApp = () => {
  console.log('Debug: TestApp renderizando')
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#e3f2fd', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#1976d2', fontSize: '36px', margin: '0 0 20px 0' }}>
        🐾 OiPet Saúde - Debug
      </h1>
      <p style={{ fontSize: '18px', color: '#333' }}>
        ✅ React está funcionando!
      </p>
      <p style={{ fontSize: '16px', color: '#666' }}>
        Se você está vendo esta mensagem, o problema foi resolvido.
      </p>
      <button 
        style={{ 
          backgroundColor: '#4caf50', 
          color: 'white', 
          padding: '12px 24px', 
          border: 'none', 
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
        onClick={() => {
          console.log('Botão clicado!')
          alert('🎉 Botão funcionando!')
        }}
      >
        Testar Clique
      </button>
    </div>
  )
}

console.log('Debug: Tentando renderizar...')

const rootElement = document.getElementById('root')
console.log('Debug: Root element:', rootElement)

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement)
    console.log('Debug: Root criado com sucesso')
    root.render(<TestApp />)
    console.log('Debug: App renderizado com sucesso')
  } catch (error) {
    console.error('Debug: Erro ao renderizar:', error)
  }
} else {
  console.error('Debug: Elemento root não encontrado!')
}