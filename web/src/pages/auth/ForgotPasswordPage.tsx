import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { GlassContainer } from '@/components/ui/GlassContainer'
import { OiPetLogo } from '@/components/ui/OiPetLogo'

export const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassContainer variant="modal" className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <OiPetLogo size="lg" showText={false} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Esqueceu a senha?</h1>
            <p className="text-gray-600 mt-2">
              Digite seu email para receber instruções de recuperação
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                placeholder="seu@email.com"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-coral-500 to-coral-600 text-white py-3 px-4 rounded-glass font-medium hover:from-coral-600 hover:to-coral-700 transition-all duration-200"
            >
              Enviar Instruções
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Voltar para o login</span>
            </Link>
          </div>
        </GlassContainer>
      </motion.div>
    </div>
  )
}