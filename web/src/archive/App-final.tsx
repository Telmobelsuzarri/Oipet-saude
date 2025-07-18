import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

// Páginas que sabemos que funcionam
import { LandingPage } from '@/pages/public/LandingPage-simple'
import { LoginPage } from '@/pages/auth/LoginPage-simple'
import { DashboardPage } from '@/pages/dashboard/DashboardPage-simple'
import { PetsPage } from '@/pages/pets/PetsPage-simple'
import { HealthPage } from '@/pages/health/HealthPage-simple'

// Página placeholder simples para páginas não implementadas
const PlaceholderPage = ({ title, icon, description }: { title: string; icon: string; description: string }) => {
  const { user, logout } = useAuthStore()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <a 
                href="/app/dashboard"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                ← Dashboard
              </a>
              <h1 className="text-2xl font-bold text-gray-900">
                {icon} {title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="text-8xl mb-8">{icon}</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600 mb-8">{description}</p>
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <p className="text-gray-700">
              Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<PlaceholderPage title="Sobre" icon="ℹ️" description="Conheça mais sobre o OiPet Saúde" />} />
        <Route path="/contact" element={<PlaceholderPage title="Contato" icon="📞" description="Entre em contato conosco" />} />

        {/* Auth Routes */}
        <Route 
          path="/auth/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/app/dashboard" replace />
            ) : (
              <LoginPage />
            )
          } 
        />
        <Route 
          path="/auth/register" 
          element={
            isAuthenticated ? (
              <Navigate to="/app/dashboard" replace />
            ) : (
              <PlaceholderPage title="Registro" icon="📝" description="Crie sua conta OiPet Saúde" />
            )
          } 
        />
        <Route 
          path="/auth/forgot-password" 
          element={
            isAuthenticated ? (
              <Navigate to="/app/dashboard" replace />
            ) : (
              <PlaceholderPage title="Esqueci Minha Senha" icon="🔑" description="Recupere sua senha" />
            )
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/app/dashboard" 
          element={
            isAuthenticated ? (
              <DashboardPage />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          } 
        />
        <Route 
          path="/app/pets" 
          element={
            isAuthenticated ? (
              <PetsPage />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          } 
        />
        <Route 
          path="/app/health" 
          element={
            isAuthenticated ? (
              <HealthPage />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          } 
        />
        <Route 
          path="/app/scanner" 
          element={
            isAuthenticated ? (
              <PlaceholderPage title="Scanner de Alimentos" icon="📷" description="Escaneie alimentos para seus pets" />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          } 
        />
        <Route 
          path="/app/store" 
          element={
            isAuthenticated ? (
              <PlaceholderPage title="Loja OiPet" icon="🛒" description="Produtos para seu pet" />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          } 
        />
        <Route 
          path="/app/reports" 
          element={
            isAuthenticated ? (
              <PlaceholderPage title="Relatórios" icon="📊" description="Relatórios de saúde dos seus pets" />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          } 
        />
        <Route 
          path="/app/notifications" 
          element={
            isAuthenticated ? (
              <PlaceholderPage title="Notificações" icon="🔔" description="Suas notificações" />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          } 
        />
        <Route 
          path="/app/profile" 
          element={
            isAuthenticated ? (
              <PlaceholderPage title="Perfil" icon="👤" description="Gerencie seu perfil" />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          } 
        />
        <Route 
          path="/app/settings" 
          element={
            isAuthenticated ? (
              <PlaceholderPage title="Configurações" icon="⚙️" description="Configurações da aplicação" />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          } 
        />

        {/* Admin Routes */}
        {isAuthenticated && user?.isAdmin && (
          <>
            <Route 
              path="/app/admin/dashboard" 
              element={<PlaceholderPage title="Admin Dashboard" icon="👨‍💼" description="Painel administrativo" />} 
            />
            <Route 
              path="/app/admin/users" 
              element={<PlaceholderPage title="Gerenciar Usuários" icon="👥" description="Gestão de usuários" />} 
            />
            <Route 
              path="/app/admin/analytics" 
              element={<PlaceholderPage title="Analytics" icon="📈" description="Análise de dados" />} 
            />
          </>
        )}

        {/* Redirects */}
        <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        
        {/* 404 Page */}
        <Route path="*" element={<PlaceholderPage title="Página Não Encontrada" icon="❌" description="A página que você procura não existe" />} />
      </Routes>
    </div>
  )
}

export default App