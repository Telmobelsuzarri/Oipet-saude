import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HomeIcon } from '@heroicons/react/24/outline'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Página não encontrada
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida.
          </p>
          
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-lg font-medium hover:from-coral-600 hover:to-coral-700 transition-all duration-200"
          >
            <HomeIcon className="h-5 w-5" />
            <span>Voltar ao Início</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}