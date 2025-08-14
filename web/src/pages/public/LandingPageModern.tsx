import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { GlassContainer } from '@/components/ui/GlassContainer'
import { OiPetLogo } from '@/components/ui/OiPetLogo'

export const LandingPageModern: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [showQuickLogin, setShowQuickLogin] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      title: "Monitoramento em Tempo Real",
      description: "Acompanhe a saúde do seu pet com dashboards inteligentes",
      icon: "🏥"
    },
    {
      title: "Scanner de Alimentos",
      description: "Identifique alimentos seguros com IA avançada",
      icon: "📱"
    },
    {
      title: "Relatórios Detalhados",
      description: "Gere relatórios completos para veterinários",
      icon: "📊"
    },
    {
      title: "Loja Integrada",
      description: "Produtos OiPet recomendados para seu pet",
      icon: "🛒"
    }
  ]

  // Rotacionar features automaticamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleClearSession = () => {
    logout()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-coral-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 p-6"
      >
        <GlassContainer className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-3">
            <OiPetLogo size="sm" />
            <span className="text-2xl font-bold bg-gradient-to-r from-coral-600 to-teal-600 bg-clip-text text-transparent">
              OiPet Saúde
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-700 hover:text-coral-600 transition-colors">Recursos</a>
            <a href="#about" className="text-gray-700 hover:text-coral-600 transition-colors">Sobre</a>
            <Link 
              to="/auth/login" 
              className="text-coral-600 hover:text-coral-700 font-medium transition-colors"
            >
              Entrar
            </Link>
          </div>
        </GlassContainer>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-8">
              <OiPetLogo size="lg" className="mx-auto mb-6" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-coral-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              OiPet Saúde
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Plataforma completa para monitoramento de saúde e bem-estar dos seus pets
            </p>
          </motion.div>
          
          {/* Auth Status */}
          <AnimatePresence>
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <GlassContainer variant="notification" className="mb-8 p-6 max-w-lg mx-auto">
                  <div className="text-amber-700 mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-2xl mr-2">👋</span>
                      <strong>Bem-vindo de volta!</strong>
                    </div>
                    <p className="text-sm">
                      Logado como: <span className="font-semibold">{user?.name}</span> ({user?.email})
                      {user?.isAdmin && <span className="ml-1 px-2 py-1 bg-amber-200 rounded-full text-xs">ADMIN</span>}
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Link
                      to="/app/dashboard"
                      className="btn-primary px-6 py-2"
                    >
                      Ir para Dashboard
                    </Link>
                    <button
                      onClick={handleClearSession}
                      className="btn-secondary px-6 py-2"
                    >
                      Sair
                    </button>
                  </div>
                </GlassContainer>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <GlassContainer variant="widget" className="p-8 max-w-2xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-4xl mb-4">{features[currentFeature].icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {features[currentFeature].title}
                  </h3>
                  <p className="text-gray-600">
                    {features[currentFeature].description}
                  </p>
                </motion.div>
              </AnimatePresence>
              
              {/* Feature Indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentFeature 
                        ? 'bg-coral-500' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </GlassContainer>
          </motion.div>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link
              to="/auth/register"
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-2xl font-semibold hover:from-coral-600 hover:to-coral-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <span className="mr-2">🐾</span>
              Começar Agora
              <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </Link>
            
            <button
              onClick={() => setShowQuickLogin(!showQuickLogin)}
              className="group relative inline-flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-2xl font-semibold border-2 border-gray-200 hover:border-coral-300 hover:text-coral-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="mr-2">👤</span>
              Login Rápido
            </button>
          </motion.div>

          {/* Quick Login Modal */}
          <AnimatePresence>
            {showQuickLogin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={() => setShowQuickLogin(false)}
              >
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                <GlassContainer 
                  variant="modal" 
                  className="relative p-6 w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Login Rápido</h3>
                    <p className="text-gray-600 text-sm">Acesse sua conta em segundos</p>
                  </div>
                  
                  <div className="space-y-4">
                    <Link
                      to="/auth/login"
                      className="block w-full text-center py-3 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-xl font-medium hover:from-coral-600 hover:to-coral-700 transition-all duration-200"
                      onClick={() => setShowQuickLogin(false)}
                    >
                      Fazer Login
                    </Link>
                    
                    <Link
                      to="/auth/register"
                      className="block w-full text-center py-3 bg-teal-50 text-teal-700 rounded-xl font-medium hover:bg-teal-100 transition-all duration-200"
                      onClick={() => setShowQuickLogin(false)}
                    >
                      Criar Nova Conta
                    </Link>
                  </div>
                  
                  <button
                    onClick={() => setShowQuickLogin(false)}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ×
                  </button>
                </GlassContainer>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <GlassContainer className="p-6 text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="font-semibold text-gray-800 mb-1">Segurança Total</h4>
              <p className="text-sm text-gray-600">Dados protegidos com criptografia avançada</p>
            </GlassContainer>
            
            <GlassContainer className="p-6 text-center">
              <div className="text-3xl mb-2">📱</div>
              <h4 className="font-semibold text-gray-800 mb-1">Multi-plataforma</h4>
              <p className="text-sm text-gray-600">Acesse de qualquer dispositivo</p>
            </GlassContainer>
            
            <GlassContainer className="p-6 text-center">
              <div className="text-3xl mb-2">🤝</div>
              <h4 className="font-semibold text-gray-800 mb-1">Suporte 24/7</h4>
              <p className="text-sm text-gray-600">Estamos sempre aqui para ajudar</p>
            </GlassContainer>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="relative z-10 text-center py-8"
      >
        <GlassContainer className="max-w-2xl mx-auto p-4">
          <p className="text-sm text-gray-600">
            © 2025 OiPet Saúde. Cuidando do seu pet com tecnologia e carinho.
          </p>
        </GlassContainer>
      </motion.footer>
    </div>
  )
}