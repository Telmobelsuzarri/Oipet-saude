import React from 'react'

export const FoodGalleryPageTest: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">Galeria de Alimentação</h1>
      <p className="mt-4 text-gray-600">Esta é uma página de teste da galeria.</p>
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <p>Se você está vendo esta página, a rota está funcionando!</p>
      </div>
    </div>
  )
}