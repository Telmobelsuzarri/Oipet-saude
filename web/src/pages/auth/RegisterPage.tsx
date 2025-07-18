import React from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

import { GlassContainer } from '@/components/ui/GlassContainer'
import { OiPetLogo } from '@/components/ui/OiPetLogo'
import { api } from '@/lib/api'
import { isEmail, isPhone, formatPhone } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

interface RegisterForm {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register: registerUser } = useAuthStore()
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    setValue,
  } = useForm<RegisterForm>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    if (!isEmail(data.email)) {
      setError('email', { message: 'Email inválido' })
      return
    }

    if (data.phone && !isPhone(data.phone)) {
      setError('phone', { message: 'Telefone inválido' })
      return
    }

    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Senhas não conferem' })
      return
    }

    if (!data.acceptTerms) {
      setError('acceptTerms', { message: 'Você deve aceitar os termos' })
      return
    }

    setIsLoading(true)
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      })

      navigate('/auth/login')
    } catch (error: any) {
      if (error.response?.status === 409) {
        setError('email', { message: 'Este email já está em uso' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setValue('phone', formatted)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-coral-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassContainer variant="modal" className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <OiPetLogo size="lg" showText={false} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
            <p className="text-gray-600 mt-2">Junte-se à família OiPet</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome completo
              </label>
              <input
                {...registerField('name', { 
                  required: 'Nome é obrigatório',
                  minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                })}
                type="text"
                className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                placeholder="Seu nome completo"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                {...registerField('email', { 
                  required: 'Email é obrigatório',
                  validate: (value) => isEmail(value) || 'Email inválido'
                })}
                type="email"
                className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone <span className="text-gray-500">(opcional)</span>
              </label>
              <input
                {...registerField('phone', {
                  validate: (value) => !value || isPhone(value) || 'Telefone inválido'
                })}
                type="tel"
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                placeholder="(11) 9 9999-9999"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  {...registerField('password', { 
                    required: 'Senha é obrigatória',
                    minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Senha deve conter ao menos: 1 minúscula, 1 maiúscula e 1 número'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  {...registerField('confirmPassword', { 
                    required: 'Confirmação de senha é obrigatória',
                    validate: (value) => value === password || 'Senhas não conferem'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start space-x-3">
                <input
                  {...registerField('acceptTerms', { 
                    required: 'Você deve aceitar os termos' 
                  })}
                  type="checkbox"
                  className="mt-1 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-600">
                  Eu aceito os{' '}
                  <a href="/terms" className="text-teal-600 hover:text-teal-500 font-medium">
                    Termos de Serviço
                  </a>{' '}
                  e a{' '}
                  <a href="/privacy" className="text-teal-600 hover:text-teal-500 font-medium">
                    Política de Privacidade
                  </a>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
              )}
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-4 rounded-glass font-medium hover:from-teal-600 hover:to-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Criando conta...</span>
                </div>
              ) : (
                'Criar Conta'
              )}
            </motion.button>
          </form>

          {/* Sign in link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link
                to="/auth/login"
                className="font-medium text-teal-600 hover:text-teal-500"
              >
                Faça login
              </Link>
            </p>
          </div>
        </GlassContainer>
      </motion.div>
    </div>
  )
}