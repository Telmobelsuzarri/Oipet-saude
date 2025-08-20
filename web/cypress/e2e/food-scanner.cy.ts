describe('Food Scanner', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/scanner');
  });

  describe('Scanner Interface', () => {
    it('should load scanner page with camera interface', () => {
      cy.contains('Escaneador de Alimentos').should('be.visible');
      cy.get('[data-cy=camera-container]').should('be.visible');
      cy.get('[data-cy=capture-button]').should('be.visible');
    });

    it('should display OiPet logo', () => {
      cy.get('[data-cy=oipet-logo]').should('be.visible');
    });

    it('should apply glass effects to scanner controls', () => {
      cy.get('[data-cy=scanner-controls]').should('have.css', 'backdrop-filter');
      cy.waitForGlassEffect('[data-cy=scanner-controls]');
    });
  });

  describe('Food Recognition', () => {
    it('should capture and analyze food image', () => {
      // Mock camera capture
      cy.intercept('POST', '/api/food/scan', { fixture: 'food-scan-success.json' });
      
      cy.get('[data-cy=capture-button]').click();
      
      // Should show processing state
      cy.contains('Analisando...').should('be.visible');
      cy.get('[data-cy=processing-loader]').should('be.visible');
      
      // Should display results
      cy.get('[data-cy=scan-results]').should('be.visible');
      cy.get('[data-cy=recognized-food]').should('contain', 'Ração Premium');
      cy.get('[data-cy=confidence-score]').should('be.visible');
    });

    it('should display nutritional information', () => {
      cy.intercept('POST', '/api/food/scan', { fixture: 'food-scan-success.json' });
      
      cy.get('[data-cy=capture-button]').click();
      
      cy.get('[data-cy=nutritional-info]').should('be.visible');
      cy.get('[data-cy=calories-value]').should('be.visible');
      cy.get('[data-cy=protein-value]').should('be.visible');
      cy.get('[data-cy=carbs-value]').should('be.visible');
      cy.get('[data-cy=fat-value]').should('be.visible');
    });

    it('should show safety warnings when applicable', () => {
      cy.intercept('POST', '/api/food/scan', { fixture: 'food-scan-unsafe.json' });
      
      cy.get('[data-cy=capture-button]').click();
      
      cy.get('[data-cy=safety-warning]').should('be.visible');
      cy.contains('⚠️ Cuidado!').should('be.visible');
      cy.get('[data-cy=safety-message]').should('contain', 'Este alimento pode ser prejudicial');
    });

    it('should handle recognition failures gracefully', () => {
      cy.intercept('POST', '/api/food/scan', { statusCode: 400, body: { error: 'Unable to recognize food' } });
      
      cy.get('[data-cy=capture-button]').click();
      
      cy.get('[data-cy=error-message]').should('be.visible');
      cy.contains('Não foi possível reconhecer o alimento').should('be.visible');
      cy.get('[data-cy=retry-button]').should('be.visible');
    });
  });

  describe('Alternative Suggestions', () => {
    it('should display alternative food suggestions', () => {
      cy.intercept('POST', '/api/food/scan', { fixture: 'food-scan-with-alternatives.json' });
      
      cy.get('[data-cy=capture-button]').click();
      
      cy.get('[data-cy=alternatives-section]').should('be.visible');
      cy.get('[data-cy=alternative-item]').should('have.length.at.least', 2);
      
      cy.get('[data-cy=alternative-item]').first().within(() => {
        cy.get('[data-cy=alternative-name]').should('be.visible');
        cy.get('[data-cy=alternative-confidence]').should('be.visible');
      });
    });

    it('should allow selecting alternative recognition', () => {
      cy.intercept('POST', '/api/food/scan', { fixture: 'food-scan-with-alternatives.json' });
      
      cy.get('[data-cy=capture-button]').click();
      
      cy.get('[data-cy=alternative-item]').first().click();
      
      // Should update main result
      cy.get('[data-cy=alternative-item]').first().within(() => {
        cy.get('[data-cy=alternative-name]').invoke('text').then((altName) => {
          cy.get('[data-cy=recognized-food]').should('contain', altName);
        });
      });
    });
  });

  describe('Scan History', () => {
    it('should display scan history', () => {
      cy.get('[data-cy=history-tab]').click();
      
      cy.get('[data-cy=scan-history]').should('be.visible');
      cy.get('[data-cy=history-item]').should('have.length.at.least', 1);
      
      cy.get('[data-cy=history-item]').first().within(() => {
        cy.get('[data-cy=history-food-name]').should('be.visible');
        cy.get('[data-cy=history-date]').should('be.visible');
        cy.get('[data-cy=history-confidence]').should('be.visible');
      });
    });

    it('should filter history by date', () => {
      cy.get('[data-cy=history-tab]').click();
      
      cy.get('[data-cy=date-filter]').select('today');
      
      cy.get('[data-cy=history-item]').should('be.visible');
      
      cy.get('[data-cy=date-filter]').select('week');
      
      cy.get('[data-cy=history-item]').should('be.visible');
    });

    it('should allow viewing history item details', () => {
      cy.get('[data-cy=history-tab]').click();
      
      cy.get('[data-cy=history-item]').first().click();
      
      cy.get('[data-cy=history-details-modal]').should('be.visible');
      cy.get('[data-cy=history-nutritional-info]').should('be.visible');
      cy.get('[data-cy=history-image]').should('be.visible');
    });
  });

  describe('Pet Association', () => {
    it('should allow associating scan with specific pet', () => {
      cy.intercept('POST', '/api/food/scan', { fixture: 'food-scan-success.json' });
      
      cy.get('[data-cy=capture-button]').click();
      
      cy.get('[data-cy=associate-pet-button]').click();
      cy.get('[data-cy=pet-selection-modal]').should('be.visible');
      
      cy.get('[data-cy=pet-option]').first().click();
      cy.get('[data-cy=confirm-association-button]').click();
      
      cy.contains('Associado com sucesso').should('be.visible');
    });

    it('should save scan to pet health records', () => {
      cy.intercept('POST', '/api/food/scan', { fixture: 'food-scan-success.json' });
      cy.intercept('POST', '/api/pets/*/health', { statusCode: 201 });
      
      cy.get('[data-cy=capture-button]').click();
      
      cy.get('[data-cy=save-to-health-button]').click();
      
      cy.get('[data-cy=health-record-modal]').should('be.visible');
      cy.get('[data-cy=portion-size-input]').type('100');
      cy.get('[data-cy=save-health-record-button]').click();
      
      cy.contains('Registro salvo com sucesso').should('be.visible');
    });
  });

  describe('Camera Controls', () => {
    it('should toggle camera flash', () => {
      cy.get('[data-cy=flash-toggle]').click();
      cy.get('[data-cy=flash-toggle]').should('have.class', 'active');
      
      cy.get('[data-cy=flash-toggle]').click();
      cy.get('[data-cy=flash-toggle]').should('not.have.class', 'active');
    });

    it('should switch between front and back camera', () => {
      cy.get('[data-cy=camera-switch]').click();
      
      // Should indicate camera switch
      cy.get('[data-cy=camera-indicator]').should('contain', 'frontal');
      
      cy.get('[data-cy=camera-switch]').click();
      cy.get('[data-cy=camera-indicator]').should('contain', 'traseira');
    });

    it('should handle camera permissions', () => {
      // Mock camera permission denied
      cy.window().then((win) => {
        cy.stub(win.navigator.mediaDevices, 'getUserMedia').rejects(new Error('Permission denied'));
      });
      
      cy.reload();
      
      cy.get('[data-cy=permission-error]').should('be.visible');
      cy.contains('Permissão de câmera necessária').should('be.visible');
      cy.get('[data-cy=request-permission-button]').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt scanner interface for mobile', () => {
      cy.viewport(375, 667);
      
      cy.get('[data-cy=camera-container]').should('be.visible');
      cy.get('[data-cy=capture-button]').should('be.visible');
      
      // Controls should be accessible on mobile
      cy.get('[data-cy=scanner-controls]').should('be.visible');
    });

    it('should optimize layout for tablet', () => {
      cy.viewport(768, 1024);
      
      // Should show side panel on larger screens
      cy.get('[data-cy=scanner-sidebar]').should('be.visible');
      cy.get('[data-cy=camera-container]').should('be.visible');
    });
  });

  describe('Glass Effects Integration', () => {
    it('should apply glass effects to scanner components', () => {
      const glassSelectors = [
        '[data-cy=scanner-controls]',
        '[data-cy=scan-results]',
        '[data-cy=nutritional-info]',
        '[data-cy=scanner-sidebar]'
      ];

      glassSelectors.forEach((selector) => {
        cy.get(selector).then(($el) => {
          if ($el.length > 0) {
            cy.wrap($el).should('have.css', 'backdrop-filter');
          }
        });
      });
    });
  });
});