import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { OiPetLogo } from '@/components/ui/OiPetLogo'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<any>
}

interface SidebarProps {
  navigation: NavigationItem[]
  adminNavigation?: NavigationItem[]
  onNavigate?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  navigation, 
  adminNavigation = [],
  onNavigate 
}) => {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-gray-200/20">
        <OiPetLogo size="sm" />
      </div>

      {/* User info */}
      <div className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-coral-500 to-teal-500 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== '/app/dashboard' && location.pathname.startsWith(item.href))
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-glass transition-all duration-200',
                isActive
                  ? 'bg-coral-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white/20 hover:text-gray-900'
              )}
            >
              <item.icon 
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"
                />
              )}
            </NavLink>
          )
        })}

        {/* Admin section */}
        {adminNavigation.length > 0 && (
          <>
            <div className="px-3 py-2">
              <hr className="border-gray-200/50" />
              <p className="mt-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administração
              </p>
            </div>
            
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.href || 
                              location.pathname.startsWith(item.href)
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-glass transition-all duration-200',
                    isActive
                      ? 'bg-teal-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white/20 hover:text-gray-900'
                  )}
                >
                  <item.icon 
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeAdminTab"
                      className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"
                    />
                  )}
                </NavLink>
              )
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-glass hover:bg-red-500/10 hover:text-red-600 transition-all duration-200 group"
        >
          <svg 
            className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          Sair
        </button>
      </div>
    </div>
  )
}