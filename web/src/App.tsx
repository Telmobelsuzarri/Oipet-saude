import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

// Layout Components
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'

// Pages - usando as que funcionam
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { HealthPageReal as HealthPage } from '@/pages/health/HealthPageReal'
import { HealthTrackingPage } from '@/pages/health/HealthTrackingPage'

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage'
import { AdminPetsPage } from '@/pages/admin/AdminPetsPage'
import { AdminEcommerceAnalyticsPage } from '@/pages/admin/AdminEcommerceAnalyticsPage'

// Store
import { StorePage } from '@/pages/store/StorePage'

// Other Pages
import { FoodGalleryPage } from './pages/gallery/FoodGalleryPageSimple'
import { ReportsPage } from './pages/reports/ReportsPage'
import { RecommendationsPage } from './pages/recommendations/RecommendationsPage'
import { NotificationsPage } from './pages/notifications/NotificationsPage'
import { ProfilePageGamified as ProfilePage } from './pages/profile/ProfilePageGamified'

// Simple components inline
const LandingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          OiPet Saúde
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Cuidando do seu pet com tecnologia
        </p>
        <div className="space-x-4">
          <a href="/auth/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            Entrar
          </a>
          <a href="/auth/register" className="bg-gray-600 text-white px-6 py-3 rounded-lg">
            Cadastrar
          </a>
        </div>
      </div>
    </div>
  </div>
)

const LoginPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input 
            type="email" 
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="seu@email.com"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Senha
          </label>
          <input 
            type="password" 
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Sua senha"
          />
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Entrar
        </button>
      </form>
      <div className="mt-4 text-center">
        <a href="/auth/register" className="text-blue-600 hover:underline">
          Não tem conta? Cadastre-se
        </a>
      </div>
      <div className="mt-2 text-center">
        <a href="/" className="text-gray-600 hover:underline">
          ← Voltar ao início
        </a>
      </div>
    </div>
  </div>
)

const DashboardPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold">Pets Cadastrados</h3>
        <p className="text-2xl font-bold text-blue-600">0</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold">Registros de Saúde</h3>
        <p className="text-2xl font-bold text-green-600">0</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold">Notificações</h3>
        <p className="text-2xl font-bold text-orange-600">0</p>
      </div>
    </div>
  </div>
)

const PetsPage = () => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Meus Pets</h1>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        Adicionar Pet
      </button>
    </div>
    <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
      Nenhum pet cadastrado ainda.
    </div>
  </div>
)

export default function App() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth Routes */}
      <Route path="/auth/login" element={
        <AuthLayout>
          <LoginPage />
        </AuthLayout>
      } />
      
      <Route path="/auth/register" element={
        <AuthLayout>
          <RegisterPage />
        </AuthLayout>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        isAuthenticated ? (
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        ) : (
          <Navigate to="/auth/login" replace />
        )
      } />

      <Route path="/pets" element={
        isAuthenticated ? (
          <AppLayout>
            <PetsPage />
          </AppLayout>
        ) : (
          <Navigate to="/auth/login" replace />
        )
      } />

      <Route path="/health" element={
        isAuthenticated ? (
          <AppLayout>
            <HealthPage />
          </AppLayout>
        ) : (
          <Navigate to="/auth/login" replace />
        )
      } />

      <Route path="/health/tracking" element={
        isAuthenticated ? (
          <AppLayout>
            <HealthTrackingPage />
          </AppLayout>
        ) : (
          <Navigate to="/auth/login" replace />
        )
      } />

      <Route path="/store" element={
        isAuthenticated ? (
          <AppLayout>
            <StorePage />
          </AppLayout>
        ) : (
          <Navigate to="/auth/login" replace />
        )
      } />

      <Route path="/notifications" element={
        isAuthenticated ? (
          <AppLayout>
            <NotificationsPage />
          </AppLayout>
        ) : (
          <Navigate to="/auth/login" replace />
        )
      } />

      <Route path="/profile" element={
        isAuthenticated ? (
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        ) : (
          <Navigate to="/auth/login" replace />
        )
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        isAuthenticated && user?.isAdmin ? (
          <AppLayout>
            <AdminDashboardPage />
          </AppLayout>
        ) : (
          <Navigate to="/auth/login" replace />
        )
      } />

      <Route path="/admin/users" element={
        isAuthenticated && user?.isAdmin ? (
          <AppLayout>
            <AdminUsersPage />
          </AppLayout>
        ) : (
          <Navigate to="/auth/login" replace />
        )
      } />

      <Route path="/admin/analytics" element={
        isAuthenticated && user?.isAdmin ? (
          <AppLayout>
            <AdminAnalyticsPage />
          </AppLayout>
        ) : (
          <Navigate to="/auth/login" replace />
        )
      } />

      <Route path="/admin/pets" element={
        isAuthenticated && user?.isAdmin ? (
          <AppLayout>
            <AdminPetsPage />
          </AppLayout>
        ) : (
          <Navigate to="/auth/login" replace />
        )
      } />

      <Route path="/admin/ecommerce" element={
        isAuthenticated && user?.isAdmin ? (
          <AppLayout>
            <AdminEcommerceAnalyticsPage />
          </AppLayout>
        ) : (
          <Navigate to="/auth/login" replace />
        )
      } />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}