import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { GlassContainer } from '@/components/ui/GlassContainer'
import { OiPetLogo } from '@/components/ui/OiPetLogo'

const LandingPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    { title: "Monitoramento em Tempo Real", icon: "🏥" },
    { title: "Scanner de Alimentos", icon: "📱" },
    { title: "Relatórios Detalhados", icon: "📊" },
    { title: "Loja Integrada", icon: "🛒" }
  ]

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
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <GlassContainer className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-3">
            <OiPetLogo size="sm" />
            <span className="text-2xl font-bold bg-gradient-to-r from-coral-600 to-teal-600 bg-clip-text text-transparent">
              OiPet Saúde
            </span>
          </div>
          <Link 
            to="/auth/login" 
            className="text-coral-600 hover:text-coral-700 font-medium transition-colors"
          >
            Entrar
          </Link>
        </GlassContainer>
      </nav>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center">
          {/* Hero Section */}
          <div className="mb-8">
            <OiPetLogo size="lg" className="mx-auto mb-6" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-coral-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            OiPet Saúde
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Plataforma completa para monitoramento de saúde e bem-estar dos seus pets
          </p>
          
          {/* Auth Status */}
          {isAuthenticated && (
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
          )}

          {/* Feature Showcase */}
          <div className="mb-12">
            <GlassContainer variant="widget" className="p-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl mb-4">{features[currentFeature].icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {features[currentFeature].title}
                </h3>
              </div>
              
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
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/auth/register"
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-2xl font-semibold hover:from-coral-600 hover:to-coral-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <span className="mr-2">🐾</span>
              Começar Agora
            </Link>
            
            <Link
              to="/auth/login"
              className="group relative inline-flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-2xl font-semibold border-2 border-gray-200 hover:border-coral-300 hover:text-coral-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="mr-2">👤</span>
              Login
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8">
        <GlassContainer className="max-w-2xl mx-auto p-4">
          <p className="text-sm text-gray-600">
            © 2025 OiPet Saúde. Cuidando do seu pet com tecnologia e carinho.
          </p>
        </GlassContainer>
      </footer>
    </div>
  )
}
export default LandingPage
export { LandingPage }
