import React from 'react';
import './OiPetLogo.web.css';

/**
 * Componente oficial do logo OiPet para Web
 * Versão otimizada para React Web com Glass Effects
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.size - Tamanho do logo ('small', 'medium', 'large', 'xlarge')
 * @param {boolean} props.showText - Se deve mostrar o texto "OiPet"
 * @param {string} props.variant - Variante do logo ('default', 'white', 'glass')
 * @param {string} props.className - Classes CSS customizadas
 * @param {boolean} props.withGlass - Se deve aplicar glass effect
 */
const OiPetLogo = ({ 
  size = 'medium', 
  showText = true, 
  variant = 'default',
  className = '',
  withGlass = false,
  ...props 
}) => {
  const containerClasses = [
    'oipet-logo-container',
    `oipet-logo-${size}`,
    variant === 'white' && 'oipet-logo-white',
    withGlass && 'oipet-logo-glass',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      <img
        src="/assets/oipet-logo.jpg"
        alt="OiPet Logo"
        className="oipet-logo-image"
      />
      {showText && (
        <span className="oipet-logo-text">OiPet</span>
      )}
    </div>
  );
};

export default OiPetLogo;