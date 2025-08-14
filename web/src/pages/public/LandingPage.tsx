import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { OiPetLogo } from '@/components/ui/OiPetLogo'

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-teal-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="mb-8">
              <OiPetLogo size="xl" showText={false} />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              OiPet Saúde
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Plataforma completa para monitoramento de saúde e bem-estar dos seus pets
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-lg font-medium hover:from-coral-600 hover:to-coral-700 transition-all duration-200"
              >
                Começar Agora
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex items-center px-8 py-3 bg-white text-coral-600 rounded-lg font-medium border-2 border-coral-500 hover:bg-coral-50 transition-all duration-200"
              >
                Fazer Login
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}