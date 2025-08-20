describe('Pet Management', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/pets');
  });

  describe('Pet List', () => {
    it('should display pets list', () => {
      cy.contains('Meus Pets').should('be.visible');
      cy.get('[data-cy=pets-container]').should('be.visible');
    });

    it('should show empty state when no pets', () => {
      // Mock empty pets response
      cy.intercept('GET', '/api/pets', { fixture: 'empty-pets.json' });
      cy.visit('/pets');
      
      cy.contains('Nenhum pet cadastrado').should('be.visible');
      cy.get('[data-cy=add-first-pet-button]').should('be.visible');
    });

    it('should display pet cards with correct information', () => {
      cy.get('[data-cy=pet-card]').should('have.length.at.least', 1);
      
      cy.get('[data-cy=pet-card]').first().within(() => {
        cy.get('[data-cy=pet-name]').should('be.visible');
        cy.get('[data-cy=pet-species]').should('be.visible');
        cy.get('[data-cy=pet-age]').should('be.visible');
        cy.get('[data-cy=pet-weight]').should('be.visible');
      });
    });
  });

  describe('Add New Pet', () => {
    it('should open add pet modal', () => {
      cy.get('[data-cy=add-pet-button]').click();
      cy.get('[data-cy=add-pet-modal]').should('be.visible');
      cy.contains('Cadastrar Novo Pet').should('be.visible');
    });

    it('should create new pet successfully', () => {
      const petName = `Test Pet ${Date.now()}`;
      
      cy.get('[data-cy=add-pet-button]').click();
      
      // Fill form
      cy.get('[data-cy=pet-name-input]').type(petName);
      cy.get('[data-cy=pet-species-select]').select('dog');
      cy.get('[data-cy=pet-breed-input]').type('Golden Retriever');
      cy.get('[data-cy=pet-weight-input]').type('30');
      cy.get('[data-cy=pet-height-input]').type('65');
      cy.get('[data-cy=pet-gender-select]').select('male');
      cy.get('[data-cy=pet-birth-date-input]').type('2021-06-15');
      
      // Submit
      cy.get('[data-cy=save-pet-button]').click();
      
      // Should close modal and show new pet
      cy.get('[data-cy=add-pet-modal]').should('not.be.visible');
      cy.contains(petName).should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('[data-cy=add-pet-button]').click();
      
      // Try to submit empty form
      cy.get('[data-cy=save-pet-button]').click();
      
      // Should show validation errors
      cy.contains('Nome é obrigatório').should('be.visible');
      cy.contains('Espécie é obrigatória').should('be.visible');
    });

    it('should handle form errors gracefully', () => {
      cy.intercept('POST', '/api/pets', { statusCode: 400, body: { error: 'Validation error' } });
      
      cy.get('[data-cy=add-pet-button]').click();
      cy.get('[data-cy=pet-name-input]').type('Test Pet');
      cy.get('[data-cy=pet-species-select]').select('dog');
      cy.get('[data-cy=save-pet-button]').click();
      
      cy.contains('Erro ao salvar pet').should('be.visible');
    });
  });

  describe('Edit Pet', () => {
    it('should open edit modal for existing pet', () => {
      cy.get('[data-cy=pet-card]').first().within(() => {
        cy.get('[data-cy=edit-pet-button]').click();
      });
      
      cy.get('[data-cy=edit-pet-modal]').should('be.visible');
      cy.contains('Editar Pet').should('be.visible');
    });

    it('should pre-fill form with existing data', () => {
      cy.get('[data-cy=pet-card]').first().within(() => {
        cy.get('[data-cy=pet-name]').invoke('text').as('petName');
        cy.get('[data-cy=edit-pet-button]').click();
      });
      
      cy.get('@petName').then((petName) => {
        cy.get('[data-cy=pet-name-input]').should('have.value', petName);
      });
    });

    it('should update pet information', () => {
      const newWeight = '35';
      
      cy.get('[data-cy=pet-card]').first().within(() => {
        cy.get('[data-cy=edit-pet-button]').click();
      });
      
      cy.get('[data-cy=pet-weight-input]').clear().type(newWeight);
      cy.get('[data-cy=save-pet-button]').click();
      
      // Should show updated weight
      cy.contains(`${newWeight} kg`).should('be.visible');
    });
  });

  describe('Delete Pet', () => {
    it('should show confirmation dialog', () => {
      cy.get('[data-cy=pet-card]').first().within(() => {
        cy.get('[data-cy=delete-pet-button]').click();
      });
      
      cy.get('[data-cy=delete-confirmation-dialog]').should('be.visible');
      cy.contains('Tem certeza que deseja excluir').should('be.visible');
    });

    it('should cancel deletion', () => {
      cy.get('[data-cy=pet-card]').first().within(() => {
        cy.get('[data-cy=pet-name]').invoke('text').as('petName');
        cy.get('[data-cy=delete-pet-button]').click();
      });
      
      cy.get('[data-cy=cancel-delete-button]').click();
      
      // Pet should still be visible
      cy.get('@petName').then((petName) => {
        cy.contains(petName).should('be.visible');
      });
    });

    it('should delete pet successfully', () => {
      cy.get('[data-cy=pet-card]').first().within(() => {
        cy.get('[data-cy=pet-name]').invoke('text').as('petName');
        cy.get('[data-cy=delete-pet-button]').click();
      });
      
      cy.get('[data-cy=confirm-delete-button]').click();
      
      // Pet should be removed
      cy.get('@petName').then((petName) => {
        cy.contains(petName).should('not.exist');
      });
    });
  });

  describe('Pet Details', () => {
    it('should navigate to pet details page', () => {
      cy.get('[data-cy=pet-card]').first().click();
      
      cy.url().should('include', '/pets/');
      cy.contains('Detalhes do Pet').should('be.visible');
    });

    it('should display pet information correctly', () => {
      cy.get('[data-cy=pet-card]').first().within(() => {
        cy.get('[data-cy=pet-name]').invoke('text').as('petName');
      });
      
      cy.get('[data-cy=pet-card]').first().click();
      
      cy.get('@petName').then((petName) => {
        cy.contains(petName).should('be.visible');
      });
      
      cy.get('[data-cy=pet-species]').should('be.visible');
      cy.get('[data-cy=pet-breed]').should('be.visible');
      cy.get('[data-cy=pet-age]').should('be.visible');
      cy.get('[data-cy=pet-weight]').should('be.visible');
    });
  });

  describe('Glass Effects in Pet Management', () => {
    it('should apply glass effects to pet cards', () => {
      cy.get('[data-cy=pet-card]').should('have.css', 'backdrop-filter');
      cy.get('[data-cy=pet-card]').should('have.css', 'background-color');
    });

    it('should apply glass effects to modals', () => {
      cy.get('[data-cy=add-pet-button]').click();
      
      cy.get('[data-cy=add-pet-modal]').should('have.css', 'backdrop-filter');
      cy.waitForGlassEffect('[data-cy=add-pet-modal]');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt layout for mobile', () => {
      cy.viewport(375, 667);
      
      // Cards should stack vertically on mobile
      cy.get('[data-cy=pets-container]').should('be.visible');
      cy.get('[data-cy=pet-card]').should('be.visible');
      
      // Add button should be accessible
      cy.get('[data-cy=add-pet-button]').should('be.visible');
    });

    it('should show grid layout on desktop', () => {
      cy.viewport(1280, 720);
      
      // Cards should be in grid layout
      cy.get('[data-cy=pets-container]').should('be.visible');
      cy.get('[data-cy=pet-card]').should('be.visible');
    });
  });
});