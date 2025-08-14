import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-teal-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-coral-600 hover:text-coral-700 font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Voltar</span>
          </Link>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sobre o OiPet Saúde</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plataforma completa para cuidar da saúde e bem-estar dos seus pets
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 mb-6">
            O OiPet Saúde é uma plataforma inovadora que combina tecnologia avançada com cuidado veterinário especializado para oferecer a melhor experiência de saúde para seus pets.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nossa Missão</h2>
          <p className="text-gray-700 mb-6">
            Tornar o cuidado com a saúde dos pets mais acessível, eficiente e personalizado através de tecnologia de ponta e uma abordagem centrada no bem-estar animal.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recursos</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Monitoramento completo da saúde do seu pet</li>
            <li>Registros médicos digitais organizados</li>
            <li>Lembretes de medicação e consultas</li>
            <li>Análise de comportamento e atividade física</li>
            <li>Conectividade com veterinários</li>
          </ul>
        </div>
      </div>
    </div>
  )
}