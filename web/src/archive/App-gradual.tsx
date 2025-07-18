import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LandingPage } from '@/pages/public/LandingPage-simple'
import { LoginPage } from '@/pages/auth/LoginPage-simple'
import { DashboardPage } from '@/pages/dashboard/DashboardPage-simple'
import { PetsPage } from '@/pages/pets/PetsPage-simple'
import { HealthPage } from '@/pages/health/HealthPage-simple'

// Página temporária simples
const SimplePage = ({ title, color }: { title: string; color: string }) => (
  <div className={`min-h-screen bg-gradient-to-br ${color} flex items-center justify-center`}>
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-lg text-gray-600">Página funcionando!</p>
    </div>
  </div>
)

function App() {
  const { isAuthenticated, user } = useAuthStore()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<SimplePage title="About" color="from-gray-50 to-gray-100" />} />
        <Route path="/contact" element={<SimplePage title="Contact" color="from-purple-50 to-pink-50" />} />

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
        <Route path="/auth/register" element={<SimplePage title="Register" color="from-green-50 to-emerald-50" />} />
        <Route path="/auth/forgot-password" element={<SimplePage title="Forgot Password" color="from-yellow-50 to-amber-50" />} />

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
        
        {/* Other Protected Routes */}
        <Route 
          path="/app/scanner" 
          element={
            isAuthenticated ? (
              <SimplePage title="Scanner de Alimentos 📷" color="from-yellow-50 to-orange-50" />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          } 
        />
        <Route 
          path="/app/reports" 
          element={
            isAuthenticated ? (
              <SimplePage title="Relatórios 📊" color="from-gray-50 to-slate-50" />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          } 
        />
        <Route 
          path="/app/store" 
          element={
            isAuthenticated ? (
              <SimplePage title="Loja OiPet 🛒" color="from-pink-50 to-rose-50" />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          } 
        />

        {/* Redirects */}
        <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        
        {/* 404 Page */}
        <Route path="*" element={<SimplePage title="404 - Not Found" color="from-red-50 to-pink-50" />} />
      </Routes>
    </div>
  )
}

export default App