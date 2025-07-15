import React from 'react';
import './GlassContainer.web.css';

/**
 * Componente GlassContainer para Web - Base para todos os glass effects
 * Versão otimizada para React Web com CSS backdrop-filter
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Conteúdo interno
 * @param {string} props.intensity - Intensidade do glass ('light', 'medium', 'strong')
 * @param {string} props.className - Classes CSS customizadas
 * @param {string} props.type - Tipo de glass ('widget', 'sidebar', 'dock', 'notification', 'modal')
 * @param {boolean} props.animated - Se deve ter animações
 */
const GlassContainer = ({ 
  children, 
  intensity = 'medium',
  className = '',
  type = 'widget',
  animated = false,
  ...props 
}) => {
  const containerClasses = [
    'glass-container',
    `glass-${intensity}`,
    `glass-${type}`,
    animated && 'glass-animated',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
};

export default GlassContainer;