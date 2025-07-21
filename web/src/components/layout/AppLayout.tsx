import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  HomeIcon,
  HeartIcon,
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  PlusIcon,
  CameraIcon,
  ShoppingCartIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

import { GlassSidebar } from '@/components/ui/GlassContainer'
import { OiPetLogo } from '@/components/ui/OiPetLogo'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { useAuthStore } from '@/stores/authStore'

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuthStore()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: HomeIcon },
    { name: 'Meus Pets', href: '/app/pets', icon: HeartIcon },
    { name: 'Saúde', href: '/app/health', icon: ChartBarIcon },
    { name: 'Scanner', href: '/app/scanner', icon: CameraIcon },
    { name: 'Produtos OiPet', href: '/app/store', icon: ShoppingCartIcon },
    { name: 'Relatórios', href: '/app/reports', icon: DocumentTextIcon },
    { name: 'Notificações', href: '/app/notifications', icon: BellIcon },
    { name: 'Perfil', href: '/app/profile', icon: UserIcon },
    { name: 'Configurações', href: '/app/settings', icon: Cog6ToothIcon },
  ]

  const adminNavigation = user?.isAdmin ? [
    { name: 'Admin Dashboard', href: '/app/admin/dashboard', icon: ChartBarIcon },
    { name: 'Usuários', href: '/app/admin/users', icon: UserIcon },
    { name: 'Pets', href: '/app/admin/pets', icon: HeartIcon },
    { name: 'Analytics', href: '/app/admin/analytics', icon: ChartBarIcon },
    { name: 'E-commerce Analytics', href: '/app/admin/ecommerce', icon: ShoppingCartIcon },
  ] : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              <GlassSidebar className="w-full">
                <div className="flex items-center justify-between p-4">
                  <OiPetLogo size="sm" showText={false} />
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 focus-ring"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <Sidebar 
                  navigation={navigation} 
                  adminNavigation={adminNavigation}
                  onNavigate={() => setSidebarOpen(false)}
                />
              </GlassSidebar>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64">
        <GlassSidebar>
          <div className="flex items-center p-6">
            <OiPetLogo size="md" showText={false} />
          </div>
          <Sidebar navigation={navigation} adminNavigation={adminNavigation} />
        </GlassSidebar>
      </div>

      <div className="lg:pl-64">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Main content */}
        <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>

        {/* Floating Action Button - Mobile */}
        <div className="fixed bottom-6 right-6 lg:hidden">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-coral-500 text-white shadow-glass-lg hover:bg-coral-600 focus-ring"
          >
            <PlusIcon className="h-6 w-6" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}