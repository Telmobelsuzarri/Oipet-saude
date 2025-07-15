/**
 * Componentes compartilhados OiPet Saúde
 * Exportações centralizadas para uso em todas as plataformas
 */

// Componentes base
export { default as OiPetLogo } from './OiPetLogo';
export { default as GlassContainer } from './GlassContainer';

// Componentes específicos para Web
export { default as OiPetLogoWeb } from './OiPetLogo.web';
export { default as GlassContainerWeb } from './GlassContainer.web';

// Componentes glass específicos (serão criados)
// export { default as PetHealthWidget } from './PetHealthWidget';
// export { default as DockNavigation } from './DockNavigation';
// export { default as GlassSidebar } from './GlassSidebar';
// export { default as NotificationGlass } from './NotificationGlass';

// Tipo de componente para diferentes plataformas
export const getComponent = (componentName, platform = 'native') => {
  switch (platform) {
    case 'web':
      return require(`./${componentName}.web.js`).default;
    case 'native':
    default:
      return require(`./${componentName}.js`).default;
  }
};