describe('Dashboard', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard');
  });

  it('should load dashboard with glass effects', () => {
    // Check main dashboard elements
    cy.contains('Dashboard').should('be.visible');
    
    // Check glass containers
    cy.get('[data-cy=progress-circle]').should('be.visible');
    cy.waitForGlassEffect('[data-cy=progress-circle]');
    
    // Check metric cards
    cy.get('[data-cy=metric-card]').should('have.length.at.least', 4);
    cy.get('[data-cy=metric-card]').each(($card) => {
      cy.wrap($card).should('be.visible');
    });
    
    // Check activity timeline
    cy.get('[data-cy=activity-timeline]').should('be.visible');
    
    // Check weekly chart
    cy.get('[data-cy=weekly-chart]').should('be.visible');
  });

  it('should display OiPet logo', () => {
    cy.get('[data-cy=oipet-logo]').should('be.visible');
    cy.get('[data-cy=oipet-logo]').should('have.attr', 'src').and('include', 'oipet');
  });

  it('should be responsive', () => {
    // Test different viewport sizes
    const viewports = [
      [375, 667], // iPhone
      [768, 1024], // iPad
      [1280, 720], // Desktop
    ];

    viewports.forEach(([width, height]) => {
      cy.viewport(width, height);
      
      // Main elements should be visible
      cy.get('[data-cy=progress-circle]').should('be.visible');
      cy.get('[data-cy=metric-card]').should('be.visible');
      
      // Navigation should adapt
      if (width < 768) {
        cy.get('[data-cy=mobile-nav]').should('be.visible');
      } else {
        cy.get('[data-cy=desktop-nav]').should('be.visible');
      }
    });
  });

  it('should navigate to pet management', () => {
    cy.get('[data-cy=pets-nav-link]').click();
    cy.url().should('include', '/pets');
  });

  it('should navigate to health tracking', () => {
    cy.get('[data-cy=health-nav-link]').click();
    cy.url().should('include', '/health');
  });

  it('should navigate to food scanner', () => {
    cy.get('[data-cy=scanner-nav-link]').click();
    cy.url().should('include', '/scanner');
  });

  it('should navigate to store', () => {
    cy.get('[data-cy=store-nav-link]').click();
    cy.url().should('include', '/store');
  });

  describe('Dashboard Metrics', () => {
    it('should display pet count', () => {
      cy.get('[data-cy=pets-count]').should('contain', /\d+/);
    });

    it('should display health records count', () => {
      cy.get('[data-cy=health-records-count]').should('contain', /\d+/);
    });

    it('should update metrics when data changes', () => {
      // Get initial count
      cy.get('[data-cy=pets-count]').invoke('text').then((initialCount) => {
        // Add a new pet
        cy.createTestPet();
        
        // Go back to dashboard
        cy.visit('/dashboard');
        
        // Check if count increased
        cy.get('[data-cy=pets-count]').should('not.contain', initialCount);
      });
    });
  });

  describe('Quick Actions', () => {
    it('should open add pet modal', () => {
      cy.get('[data-cy=add-pet-quick-action]').click();
      cy.get('[data-cy=add-pet-modal]').should('be.visible');
    });

    it('should open health record modal', () => {
      cy.get('[data-cy=add-health-quick-action]').click();
      cy.get('[data-cy=add-health-modal]').should('be.visible');
    });

    it('should open food scanner', () => {
      cy.get('[data-cy=food-scanner-quick-action]').click();
      cy.url().should('include', '/scanner');
    });
  });

  describe('Activity Timeline', () => {
    it('should display recent activities', () => {
      cy.get('[data-cy=activity-timeline]').within(() => {
        cy.get('[data-cy=activity-item]').should('have.length.at.least', 1);
      });
    });

    it('should format activity timestamps correctly', () => {
      cy.get('[data-cy=activity-item]').first().within(() => {
        cy.get('[data-cy=activity-time]').should('contain', /\d+/);
      });
    });
  });

  describe('Glass Effects', () => {
    it('should apply glass effect to main containers', () => {
      const glassSelectors = [
        '[data-cy=progress-circle]',
        '[data-cy=metric-card]',
        '[data-cy=activity-timeline]',
        '[data-cy=weekly-chart]'
      ];

      glassSelectors.forEach((selector) => {
        cy.get(selector).should('have.css', 'backdrop-filter');
        cy.get(selector).should('have.css', 'background-color');
      });
    });

    it('should maintain glass effect on hover', () => {
      cy.get('[data-cy=metric-card]').first().trigger('mouseover');
      cy.get('[data-cy=metric-card]').first().should('have.css', 'backdrop-filter');
    });
  });
});