import React from 'react'
import { cn } from '@/lib/utils'

interface GlassContainerProps {
  children: React.ReactNode
  className?: string
  variant?: 'widget' | 'card' | 'modal' | 'sidebar'
}

export const GlassContainer: React.FC<GlassContainerProps> = ({ 
  children, 
  className = '', 
  variant = 'widget' 
}) => {
  const variants = {
    widget: 'bg-white/70 backdrop-blur-[21px]',
    card: 'bg-white/60 backdrop-blur-[25px]',
    modal: 'bg-white/80 backdrop-blur-[30px]',
    sidebar: 'bg-white/50 backdrop-blur-[20px]'
  }

  return (
    <div className={cn(
      'rounded-2xl border border-white/20 shadow-lg',
      'transition-all duration-300 hover:shadow-xl',
      variants[variant],
      className
    )}>
      {children}
    </div>
  )
}

export const GlassCard: React.FC<GlassContainerProps> = (props) => (
  <GlassContainer {...props} variant="card" />
)

export const GlassWidget: React.FC<GlassContainerProps> = (props) => (
  <GlassContainer {...props} variant="widget" />
)