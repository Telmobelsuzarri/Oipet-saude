import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassContainerProps {
  children: React.ReactNode
  className?: string
  variant?: 'widget' | 'sidebar' | 'dock' | 'modal' | 'notification'
  hover?: boolean
  animate?: boolean
  onClick?: () => void
}

const variants = {
  widget: 'glass-widget',
  sidebar: 'glass-sidebar',
  dock: 'glass-dock',
  modal: 'glass-modal',
  notification: 'glass-notification',
}

const hoverVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
}

const animationVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  className,
  variant = 'widget',
  hover = false,
  animate = false,
  onClick,
}) => {
  const Component = animate ? motion.div : motion.div

  return (
    <Component
      className={cn(
        variants[variant],
        hover && 'hover-lift hover-glow cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      variants={hover ? hoverVariants : animate ? animationVariants : undefined}
      initial={animate ? 'initial' : undefined}
      animate={animate ? 'animate' : undefined}
      exit={animate ? 'exit' : undefined}
      whileHover={hover ? 'hover' : undefined}
      whileTap={hover && onClick ? 'tap' : undefined}
      onClick={onClick}
    >
      {children}
    </Component>
  )
}

// Specialized Glass Components
export const GlassCard: React.FC<GlassContainerProps> = (props) => (
  <GlassContainer {...props} className={cn('p-6', props.className)} hover />
)

export const GlassWidget: React.FC<GlassContainerProps> = (props) => (
  <GlassContainer {...props} variant="widget" animate />
)

export const GlassSidebar: React.FC<GlassContainerProps> = (props) => (
  <GlassContainer {...props} variant="sidebar" className={cn('h-full', props.className)} />
)

export const GlassModal: React.FC<GlassContainerProps> = (props) => (
  <GlassContainer {...props} variant="modal" animate className={cn('p-6', props.className)} />
)

export const GlassNotification: React.FC<GlassContainerProps> = (props) => (
  <GlassContainer {...props} variant="notification" animate className={cn('p-4', props.className)} />
)