import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

// Layout Components
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'

// Auth Pages - versões que funcionavam
import { LoginPage } from '@/pages/auth/LoginPage-simple'
import { RegisterPage } from '@/pages/auth/RegisterPage'

// Main Pages - versões que funcionavam ontem
import { DashboardPage } from '@/pages/dashboard/DashboardPage-simple'
import { PetsPage } from '@/pages/pets/PetsPage-simple'
import { HealthPage } from '@/pages/health/HealthPage-simple'

// Public Pages
import { LandingPage } from '@/pages/public/LandingPage-simple'

// Placeholders de qualidade (como estava funcionando)
import { 
  ForgotPasswordPage,
  PetDetailPage,
  FoodScannerPage,
  StorePage,
  ReportsPage,
  NotificationsPage,
  ProfilePage,
  SettingsPage,
  AdminDashboardPage,
  AdminUsersPage,
  AdminAnalyticsPage,
  AboutPage,
  ContactPage,
  NotFoundPage
} from '@/pages/placeholder/QualityPlaceholder'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
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
          <Route 
            path="register" 
            element={
              isAuthenticated ? (
                <Navigate to="/app/dashboard" replace />
              ) : (
                <RegisterPage />
              )
            } 
          />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route index element={<Navigate to="/auth/login" replace />} />
        </Route>

        {/* Protected Routes */}
        <Route 
          path="/app" 
          element={
            isAuthenticated ? (
              <AppLayout />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        >
          {/* Main App Routes */}
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pets" element={<PetsPage />} />
          <Route path="pets/:id" element={<PetDetailPage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="scanner" element={<FoodScannerPage />} />
          <Route path="store" element={<StorePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Admin Routes */}
          {user?.isAdmin && (
            <>
              <Route path="admin" element={<Navigate to="/app/admin/dashboard" replace />} />
              <Route path="admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="admin/users" element={<AdminUsersPage />} />
              <Route path="admin/analytics" element={<AdminAnalyticsPage />} />
            </>
          )}
        </Route>

        {/* Redirect authenticated users from auth pages */}
        {isAuthenticated && (
          <Route path="/auth/*" element={<Navigate to="/app/dashboard" replace />} />
        )}

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App