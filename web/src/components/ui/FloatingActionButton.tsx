import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, 
  HeartIcon, 
  CameraIcon, 
  ShoppingCartIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline'

interface FloatingAction {
  id: string
  icon: React.ReactNode
  label: string
  color: 'coral' | 'teal' | 'blue' | 'green' | 'purple' | 'orange'
  onClick: () => void
}

interface FloatingActionButtonProps {
  actions?: FloatingAction[]
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const colorMap = {
  coral: {
    bg: 'from-coral-500 to-coral-600',
    hover: 'hover:from-coral-600 hover:to-coral-700',
    text: 'text-coral-600',
    glass: 'bg-coral-50/80'
  },
  teal: {
    bg: 'from-teal-500 to-teal-600',
    hover: 'hover:from-teal-600 hover:to-teal-700',
    text: 'text-teal-600',
    glass: 'bg-teal-50/80'
  },
  blue: {
    bg: 'from-blue-500 to-blue-600',
    hover: 'hover:from-blue-600 hover:to-blue-700',
    text: 'text-blue-600',
    glass: 'bg-blue-50/80'
  },
  green: {
    bg: 'from-green-500 to-green-600',
    hover: 'hover:from-green-600 hover:to-green-700',
    text: 'text-green-600',
    glass: 'bg-green-50/80'
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    hover: 'hover:from-purple-600 hover:to-purple-700',
    text: 'text-purple-600',
    glass: 'bg-purple-50/80'
  },
  orange: {
    bg: 'from-orange-500 to-orange-600',
    hover: 'hover:from-orange-600 hover:to-orange-700',
    text: 'text-orange-600',
    glass: 'bg-orange-50/80'
  }
}

const positionMap = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6'
}

const sizeMap = {
  sm: { 
    main: 'w-12 h-12',
    action: 'w-10 h-10',
    icon: 'w-5 h-5',
    actionIcon: 'w-4 h-4'
  },
  md: { 
    main: 'w-14 h-14',
    action: 'w-12 h-12',
    icon: 'w-6 h-6',
    actionIcon: 'w-5 h-5'
  },
  lg: { 
    main: 'w-16 h-16',
    action: 'w-14 h-14',
    icon: 'w-7 h-7',
    actionIcon: 'w-6 h-6'
  }
}

const defaultActions: FloatingAction[] = [
  {
    id: 'health',
    icon: <HeartIcon />,
    label: 'Registrar Saúde',
    color: 'coral',
    onClick: () => console.log('Health clicked')
  },
  {
    id: 'camera',
    icon: <CameraIcon />,
    label: 'Escanear Alimento',
    color: 'blue',
    onClick: () => console.log('Camera clicked')
  },
  {
    id: 'chart',
    icon: <ChartBarIcon />,
    label: 'Ver Relatórios',
    color: 'green',
    onClick: () => console.log('Chart clicked')
  },
  {
    id: 'store',
    icon: <ShoppingCartIcon />,
    label: 'Loja OiPet',
    color: 'teal',
    onClick: () => console.log('Store clicked')
  }
]

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions = defaultActions,
  position = 'bottom-right',
  size = 'md',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)
  
  const sizes = sizeMap[size]
  const positionClass = positionMap[position]

  const toggleOpen = () => setIsOpen(!isOpen)

  const containerVariants = {
    open: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  }

  const actionVariants = {
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    closed: {
      opacity: 0,
      scale: 0.3,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  }

  const mainButtonVariants = {
    open: { rotate: 45 },
    closed: { rotate: 0 }
  }

  return (
    <motion.div 
      className={`fixed ${positionClass} z-50 ${className}`}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
    >
      {/* Action Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-0 right-0 mb-20 space-y-3"
            variants={containerVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {actions.map((action, index) => {
              const colors = colorMap[action.color]
              
              return (
                <motion.div
                  key={action.id}
                  className="relative flex items-center"
                  variants={actionVariants}
                  onHoverStart={() => setHoveredAction(action.id)}
                  onHoverEnd={() => setHoveredAction(null)}
                >
                  {/* Label */}
                  <AnimatePresence>
                    {hoveredAction === action.id && (
                      <motion.div
                        className="absolute right-16 glass-widget px-3 py-2 rounded-glass border border-white/30 whitespace-nowrap"
                        initial={{ opacity: 0, x: 10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-sm font-medium text-gray-800">
                          {action.label}
                        </span>
                        
                        {/* Arrow */}
                        <div className="absolute top-1/2 -right-1 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-white/20 backdrop-blur-sm border border-white/30 rotate-45" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Button */}
                  <motion.button
                    onClick={() => {
                      action.onClick()
                      setIsOpen(false)
                    }}
                    className={`
                      ${sizes.action} glass-widget rounded-full border border-white/30
                      flex items-center justify-center
                      hover:bg-white/30 hover:scale-110 active:scale-95
                      transition-all duration-200 shadow-glass
                      ${colors.glass}
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`${sizes.actionIcon} ${colors.text}`}>
                      {action.icon}
                    </div>
                  </motion.button>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={toggleOpen}
        className={`
          ${sizes.main} bg-gradient-to-r from-coral-500 to-teal-500
          rounded-full flex items-center justify-center
          glass-effect border border-white/30 shadow-glass-lg
          hover:shadow-2xl hover:scale-110 active:scale-95
          transition-all duration-300
        `}
        variants={mainButtonVariants}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div 
          className={`${sizes.icon} text-white`}
          variants={mainButtonVariants}
        >
          <PlusIcon />
        </motion.div>
        
        {/* Ripple Effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white/20"
          initial={{ scale: 0, opacity: 0 }}
          animate={isOpen ? { scale: 1.2, opacity: [0, 0.3, 0] } : {}}
          transition={{ duration: 0.6 }}
        />
      </motion.button>

      {/* Background Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/10 backdrop-blur-sm -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Componente helper para ações específicas do OiPet
export const createOiPetActions = (callbacks: {
  onAddHealth?: () => void
  onScanFood?: () => void
  onViewReports?: () => void
  onOpenStore?: () => void
  onAddPet?: () => void
  onNotifications?: () => void
}): FloatingAction[] => [
  {
    id: 'add-health',
    icon: <HeartIcon />,
    label: 'Registrar Saúde',
    color: 'coral',
    onClick: callbacks.onAddHealth || (() => {})
  },
  {
    id: 'scan-food',
    icon: <CameraIcon />,
    label: 'Escanear Alimento',
    color: 'blue',
    onClick: callbacks.onScanFood || (() => {})
  },
  {
    id: 'view-reports',
    icon: <ChartBarIcon />,
    label: 'Ver Relatórios',
    color: 'green',
    onClick: callbacks.onViewReports || (() => {})
  },
  {
    id: 'open-store',
    icon: <ShoppingCartIcon />,
    label: 'Loja OiPet',
    color: 'teal',
    onClick: callbacks.onOpenStore || (() => {})
  },
  {
    id: 'add-pet',
    icon: <PlusIcon />,
    label: 'Adicionar Pet',
    color: 'purple',
    onClick: callbacks.onAddPet || (() => {})
  },
  {
    id: 'notifications',
    icon: <BellIcon />,
    label: 'Notificações',
    color: 'orange',
    onClick: callbacks.onNotifications || (() => {})
  }
]