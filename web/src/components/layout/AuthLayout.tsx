import React from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { OiPetLogo } from '@/components/ui/OiPetLogo'

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-coral-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      {/* Header with logo */}
      <div className="relative z-10 pt-8">
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <OiPetLogo size="xl" showText={true} className="mb-8" />
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center px-4 pb-8">
        <Outlet />
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-sm text-gray-500">
          © 2025 OiPet Saúde. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}