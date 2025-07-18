import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

// Layout Components
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'

// Auth Pages - Using simplified versions
import { LoginPage } from '@/pages/auth/LoginPage-simple'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'

// Main Pages - Using simplified versions where available
import { DashboardPage } from '@/pages/dashboard/DashboardPage-simple'
import { PetsPage } from '@/pages/pets/PetsPage-simple'
import { PetDetailPage } from '@/pages/pets/PetDetailPage'
import { HealthPage } from '@/pages/health/HealthPage-simple'
import { FoodScannerPage } from '@/pages/scanner/FoodScannerPage'
import { StorePage } from '@/pages/store/StorePage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { NotificationsPage } from '@/pages/notifications/NotificationsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { SettingsPage } from '@/pages/settings/SettingsPage'

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage'

// Public Pages - Using simplified versions
import { LandingPage } from '@/pages/public/LandingPage-simple'
import { AboutPage } from '@/pages/public/AboutPage'
import { ContactPage } from '@/pages/public/ContactPage'

// Error Pages
import { NotFoundPage } from '@/pages/error/NotFoundPage'

// Simple page placeholder for missing components
const SimplePage = ({ title }: { title: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-lg text-gray-600">Página em desenvolvimento</p>
    </div>
  </div>
)

// Create placeholder components for missing pages
const RegisterPagePlaceholder = () => <SimplePage title="Registro" />
const ForgotPasswordPagePlaceholder = () => <SimplePage title="Esqueci Minha Senha" />
const PetDetailPagePlaceholder = () => <SimplePage title="Detalhes do Pet" />
const FoodScannerPagePlaceholder = () => <SimplePage title="Scanner de Alimentos 📷" />
const StorePagePlaceholder = () => <SimplePage title="Loja OiPet 🛒" />
const ReportsPagePlaceholder = () => <SimplePage title="Relatórios 📊" />
const NotificationsPagePlaceholder = () => <SimplePage title="Notificações 🔔" />
const ProfilePagePlaceholder = () => <SimplePage title="Perfil 👤" />
const SettingsPagePlaceholder = () => <SimplePage title="Configurações ⚙️" />
const AdminDashboardPagePlaceholder = () => <SimplePage title="Admin Dashboard" />
const AdminUsersPagePlaceholder = () => <SimplePage title="Admin - Usuários" />
const AdminAnalyticsPagePlaceholder = () => <SimplePage title="Admin - Analytics" />
const AboutPagePlaceholder = () => <SimplePage title="Sobre" />
const ContactPagePlaceholder = () => <SimplePage title="Contato" />
const NotFoundPagePlaceholder = () => <SimplePage title="404 - Página Não Encontrada" />

// Simple Layout placeholders
const SimpleAppLayout = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
)

const SimpleAuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
)

function App() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPagePlaceholder />} />
        <Route path="/contact" element={<ContactPagePlaceholder />} />

        {/* Auth Routes */}
        <Route path="/auth" element={<SimpleAuthLayout><div /></SimpleAuthLayout>}>
          <Route 
            path="login" 
            element={
              isAuthenticated ? (
                <Navigate to="/app/dashboard" replace />
              ) : (
                <LoginPage />
              )
            } 
          />
          <Route path="register" element={<RegisterPagePlaceholder />} />
          <Route path="forgot-password" element={<ForgotPasswordPagePlaceholder />} />
          <Route index element={<Navigate to="/auth/login" replace />} />
        </Route>

        {/* Protected Routes */}
        <Route 
          path="/app" 
          element={
            isAuthenticated ? (
              <SimpleAppLayout><div /></SimpleAppLayout>
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        >
          {/* Main App Routes */}
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pets" element={<PetsPage />} />
          <Route path="pets/:id" element={<PetDetailPagePlaceholder />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="scanner" element={<FoodScannerPagePlaceholder />} />
          <Route path="store" element={<StorePagePlaceholder />} />
          <Route path="reports" element={<ReportsPagePlaceholder />} />
          <Route path="notifications" element={<NotificationsPagePlaceholder />} />
          <Route path="profile" element={<ProfilePagePlaceholder />} />
          <Route path="settings" element={<SettingsPagePlaceholder />} />

          {/* Admin Routes */}
          {user?.isAdmin && (
            <>
              <Route path="admin" element={<Navigate to="/app/admin/dashboard" replace />} />
              <Route path="admin/dashboard" element={<AdminDashboardPagePlaceholder />} />
              <Route path="admin/users" element={<AdminUsersPagePlaceholder />} />
              <Route path="admin/analytics" element={<AdminAnalyticsPagePlaceholder />} />
            </>
          )}
        </Route>

        {/* Redirect authenticated users from auth pages */}
        {isAuthenticated && (
          <Route path="/auth/*" element={<Navigate to="/app/dashboard" replace />} />
        )}

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPagePlaceholder />} />
      </Routes>
    </div>
  )
}

export default App