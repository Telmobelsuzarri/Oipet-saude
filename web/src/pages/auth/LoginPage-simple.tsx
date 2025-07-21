import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { GlassContainer } from '@/components/ui/GlassContainer'
import { OiPetLogo } from '@/components/ui/OiPetLogo'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      // Redirecionamento será feito pelo store
    } catch (error) {
      console.error('Erro no login:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Bem-vindo de volta!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Acesse sua conta OiPet Saúde
        </p>
      </div>
        
        {/* Login Form */}
        <GlassContainer variant="modal" className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass w-full"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass w-full"
                placeholder="Sua senha"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-coral-600 focus:ring-coral-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Lembrar-me
                </label>
              </div>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-coral-600 hover:text-coral-500"
              >
                Esqueci a senha
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </GlassContainer>

        {/* Footer Links */}
        <div className="text-center space-y-4">
          <GlassContainer className="p-4">
            <p className="text-sm text-gray-600">
              Não tem conta?{' '}
              <Link
                to="/auth/register"
                className="text-coral-600 hover:text-coral-500 font-medium"
              >
                Cadastre-se aqui
              </Link>
            </p>
          </GlassContainer>
          
          <div className="text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-400 inline-flex items-center space-x-1"
            >
              <span>←</span>
              <span>Voltar ao início</span>
            </Link>
          </div>
        </div>
    </motion.div>
  )
}