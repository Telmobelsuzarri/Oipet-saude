import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

// Layout Components
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'

// Import direto das páginas que existem
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage-simple').then(m => ({ default: m.LoginPage || m.default })))
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage || m.default })))
const LandingPage = React.lazy(() => import('./pages/public/LandingPage-simple').then(m => ({ default: m.LandingPage || m.default })))
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage-simple').then(m => ({ default: m.DashboardPage || m.default })))
const PetsPage = React.lazy(() => import('./pages/pets/PetsPage-simple').then(m => ({ default: m.PetsPage || m.default })))

// Health Pages
import { HealthPageReal as HealthPage } from './pages/health/HealthPageReal'
import { HealthTrackingPage } from './pages/health/HealthTrackingPage'

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage'
import { AdminPetsPage } from '@/pages/admin/AdminPetsPage'
import { AdminEcommerceAnalyticsPage } from '@/pages/admin/AdminEcommerceAnalyticsPage'

// Other Pages
import { StorePage } from '@/pages/store/StorePage'
import { FoodGalleryPage } from './pages/gallery/FoodGalleryPageSimple'
import { ReportsPage } from './pages/reports/ReportsPage'
import { RecommendationsPage } from './pages/recommendations/RecommendationsPage'
import { NotificationsPage } from './pages/notifications/NotificationsPage'
import { ProfilePageGamified as ProfilePage } from './pages/profile/ProfilePageGamified'

// Export Demo Pages
import { ExportDemoPage } from './pages/reports/ExportDemoPage'
import { TestExportPage } from './pages/reports/TestExportPage'
import { SimpleExportTest } from './pages/reports/SimpleExportTest'
import { QuickExportTest } from './pages/reports/QuickExportTest'

// Veterinarians Pages
import { VeterinariansPage } from '@/pages/veterinarians/VeterinariansPage'
import { VeterinarianDetailPage } from '@/pages/veterinarians/VeterinarianDetailPage'

// Appointments Page
import { AppointmentsPage } from '@/pages/appointments/AppointmentsPage'

// Weekly Challenges Page
import { WeeklyChallengesPage } from '@/pages/challenges/WeeklyChallengesPage'

// Other Pages
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { PetDetailPage } from '@/pages/pets/PetDetailPage'
import { AboutPage } from '@/pages/public/AboutPage'
import { ContactPage } from '@/pages/public/ContactPage'
import { NotFoundPage } from '@/pages/error/NotFoundPage'

import React, { Suspense } from 'react'

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando...</p>
    </div>
  </div>
)

function App() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes - Regular Users */}
        <Route element={
          isAuthenticated ? <AppLayout /> : <Navigate to="/auth/login" replace />
        }>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pets" element={<PetsPage />} />
          <Route path="/pets/:id" element={<PetDetailPage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/health/tracking" element={<HealthTrackingPage />} />
          <Route path="/scanner" element={<FoodGalleryPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/challenges" element={<WeeklyChallengesPage />} />
          <Route path="/veterinarians" element={<VeterinariansPage />} />
          <Route path="/veterinarians/:id" element={<VeterinarianDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Export Demo Routes */}
          <Route path="/reports/export-demo" element={<ExportDemoPage />} />
          <Route path="/reports/test-export" element={<TestExportPage />} />
          <Route path="/reports/simple-export" element={<SimpleExportTest />} />
          <Route path="/reports/quick-export" element={<QuickExportTest />} />
        </Route>

        {/* Protected Routes - Admin Only */}
        <Route element={
          isAuthenticated && user?.isAdmin ? <AppLayout /> : <Navigate to="/auth/login" replace />
        }>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/pets" element={<AdminPetsPage />} />
          <Route path="/admin/ecommerce" element={<AdminEcommerceAnalyticsPage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App