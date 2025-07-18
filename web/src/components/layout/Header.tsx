import React from 'react'
import { 
  Bars3Icon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'
import { GlassContainer } from '@/components/ui/GlassContainer'
import { OiPetLogo } from '@/components/ui/OiPetLogo'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { useAuthStore } from '@/stores/authStore'

interface HeaderProps {
  onMenuClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuthStore()
  const [isDark, setIsDark] = React.useState(false)
  const [showNotifications, setShowNotifications] = React.useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <GlassContainer 
      variant="dock" 
      className="sticky top-0 z-40 border-b border-white/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Mobile menu + Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="inline-flex items-center justify-center p-2 text-gray-700 hover:bg-white/20 hover:text-gray-900 focus-ring lg:hidden"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Logo - Desktop only */}
            <div className="hidden lg:flex lg:items-center">
              <OiPetLogo size="sm" showText={true} />
            </div>
          </div>

          {/* Center - Search */}
          <div className="hidden md:flex md:flex-1 md:max-w-lg md:px-8">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Buscar pets, registros..."
                className="block w-full rounded-glass border-0 bg-white/10 py-2 pl-10 pr-3 text-sm placeholder-gray-400 backdrop-blur-sm focus:bg-white/20 focus:ring-2 focus:ring-coral-500 focus:ring-offset-0"
              />
            </div>
          </div>

          {/* Right side - Actions + User */}
          <div className="flex items-center space-x-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:bg-white/20 hover:text-gray-700 focus-ring"
            >
              {isDark ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            <NotificationBell 
              onClick={() => setShowNotifications(!showNotifications)}
            />

            {/* User menu */}
            <div className="relative">
              <button className="flex items-center space-x-2 p-2 text-gray-500 hover:bg-white/20 hover:text-gray-700 focus-ring">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="h-6 w-6" />
                )}
                <span className="hidden text-sm font-medium text-gray-700 sm:block">
                  {user?.name || 'Usuário'}
                </span>
              </button>
            </div>

            {/* Mobile search */}
            <button className="p-2 text-gray-500 hover:bg-white/20 hover:text-gray-700 focus-ring md:hidden">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </GlassContainer>
  )
}