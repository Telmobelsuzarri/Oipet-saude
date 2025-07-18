import React from 'react'

interface OiPetLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

export const OiPetLogo: React.FC<OiPetLogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo SVG */}
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <img 
          src="/oipetlogo.svg" 
          alt="OiPet Saúde"
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Text */}
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-coral-500 to-teal-500 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          OiPet Saúde
        </span>
      )}
    </div>
  )
}