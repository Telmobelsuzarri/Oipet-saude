describe('Wishlist Management', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/wishlist');
  });

  describe('Wishlist Interface', () => {
    it('should load wishlist page', () => {
      cy.contains('Minha Lista de Desejos').should('be.visible');
      cy.get('[data-cy=wishlist-container]').should('be.visible');
    });

    it('should display OiPet logo', () => {
      cy.get('[data-cy=oipet-logo]').should('be.visible');
    });

    it('should apply glass effects to wishlist components', () => {
      cy.get('[data-cy=wishlist-header]').should('have.css', 'backdrop-filter');
      cy.waitForGlassEffect('[data-cy=wishlist-header]');
    });
  });

  describe('Empty Wishlist State', () => {
    it('should show empty state when no items', () => {
      // Mock empty wishlist response
      cy.intercept('GET', '/api/wishlist', { fixture: 'empty-wishlist.json' });
      cy.reload();
      
      cy.get('[data-cy=empty-wishlist]').should('be.visible');
      cy.contains('Sua lista de desejos está vazia').should('be.visible');
      cy.get('[data-cy=browse-products-button]').should('be.visible');
    });

    it('should navigate to store from empty state', () => {
      cy.intercept('GET', '/api/wishlist', { fixture: 'empty-wishlist.json' });
      cy.reload();
      
      cy.get('[data-cy=browse-products-button]').click();
      
      cy.url().should('include', '/store');
    });
  });

  describe('Wishlist Items Display', () => {
    beforeEach(() => {
      // Mock wishlist with items
      cy.intercept('GET', '/api/wishlist', { fixture: 'wishlist-with-items.json' });
      cy.reload();
    });

    it('should display wishlist items', () => {
      cy.get('[data-cy=wishlist-item]').should('have.length.at.least', 1);
      
      cy.get('[data-cy=wishlist-item]').first().within(() => {
        cy.get('[data-cy=item-image]').should('be.visible');
        cy.get('[data-cy=item-name]').should('be.visible');
        cy.get('[data-cy=item-price]').should('be.visible');
        cy.get('[data-cy=item-category]').should('be.visible');
        cy.get('[data-cy=item-priority]').should('be.visible');
      });
    });

    it('should show item priority levels', () => {
      const priorities = ['high', 'medium', 'low'];
      
      priorities.forEach(priority => {
        cy.get(`[data-cy=priority-${priority}]`).should('exist');
      });
    });

    it('should display date added', () => {
      cy.get('[data-cy=wishlist-item]').first().within(() => {
        cy.get('[data-cy=date-added]').should('be.visible');
        cy.get('[data-cy=date-added]').should('contain', /\d{2}\/\d{2}\/\d{4}/);
      });
    });
  });

  describe('Priority Management', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/wishlist', { fixture: 'wishlist-with-items.json' });
      cy.reload();
    });

    it('should update item priority', () => {
      cy.get('[data-cy=wishlist-item]').first().within(() => {
        cy.get('[data-cy=priority-selector]').select('high');
      });
      
      cy.contains('Prioridade atualizada').should('be.visible');
      
      cy.get('[data-cy=wishlist-item]').first().within(() => {
        cy.get('[data-cy=priority-badge]').should('contain', 'Alta');
        cy.get('[data-cy=priority-badge]').should('have.class', 'high-priority');
      });
    });

    it('should filter items by priority', () => {
      cy.get('[data-cy=priority-filter]').select('high');
      
      cy.get('[data-cy=wishlist-item]').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('[data-cy=priority-badge]').should('contain', 'Alta');
        });
      });
    });

    it('should sort items by priority', () => {
      cy.get('[data-cy=sort-select]').select('priority');
      
      // High priority items should appear first
      cy.get('[data-cy=wishlist-item]').first().within(() => {
        cy.get('[data-cy=priority-badge]').should('contain', 'Alta');
      });
    });
  });

  describe('Item Management', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/wishlist', { fixture: 'wishlist-with-items.json' });
      cy.reload();
    });

    it('should remove item from wishlist', () => {
      cy.get('[data-cy=wishlist-item]').first().within(() => {
        cy.get('[data-cy=item-name]').invoke('text').as('itemName');
        cy.get('[data-cy=remove-item-button]').click();
      });
      
      cy.get('[data-cy=remove-confirmation-modal]').should('be.visible');
      cy.get('[data-cy=confirm-remove-button]').click();
      
      cy.contains('Item removido da lista').should('be.visible');
      
      cy.get('@itemName').then((itemName) => {
        cy.contains(itemName).should('not.exist');
      });
    });

    it('should cancel item removal', () => {
      cy.get('[data-cy=wishlist-item]').first().within(() => {
        cy.get('[data-cy=item-name]').invoke('text').as('itemName');
        cy.get('[data-cy=remove-item-button]').click();
      });
      
      cy.get('[data-cy=cancel-remove-button]').click();
      
      cy.get('@itemName').then((itemName) => {
        cy.contains(itemName).should('be.visible');
      });
    });

    it('should move item to cart/external store', () => {
      cy.get('[data-cy=wishlist-item]').first().within(() => {
        cy.get('[data-cy=buy-now-button]').click();
      });
      
      cy.get('[data-cy=external-redirect-modal]').should('be.visible');
      cy.contains('Redirecionando para a loja OiPet').should('be.visible');
      cy.get('[data-cy=confirm-redirect-button]').should('be.visible');
    });

    it('should add notes to wishlist item', () => {
      cy.get('[data-cy=wishlist-item]').first().within(() => {
        cy.get('[data-cy=add-note-button]').click();
      });
      
      cy.get('[data-cy=note-modal]').should('be.visible');
      cy.get('[data-cy=note-textarea]').type('Comprar quando estiver em promoção');
      cy.get('[data-cy=save-note-button]').click();
      
      cy.contains('Nota adicionada').should('be.visible');
      
      cy.get('[data-cy=wishlist-item]').first().within(() => {
        cy.get('[data-cy=item-note]').should('be.visible');
        cy.get('[data-cy=item-note]').should('contain', 'Comprar quando estiver');
      });
    });
  });

  describe('Wishlist Organization', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/wishlist', { fixture: 'wishlist-with-items.json' });
      cy.reload();
    });

    it('should sort items by date added', () => {
      cy.get('[data-cy=sort-select]').select('date-added');
      
      // Most recent items should appear first
      let previousDate = new Date();
      cy.get('[data-cy=date-added]').each(($date) => {
        const dateText = $date.text();
        const currentDate = new Date(dateText.split('/').reverse().join('-'));
        expect(currentDate.getTime()).to.be.at.most(previousDate.getTime());
        previousDate = currentDate;
      });
    });

    it('should sort items by price', () => {
      cy.get('[data-cy=sort-select]').select('price-low');
      
      let previousPrice = 0;
      cy.get('[data-cy=item-price]').each(($price) => {
        const priceText = $price.text();
        const currentPrice = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));
        expect(currentPrice).to.be.at.least(previousPrice);
        previousPrice = currentPrice;
      });
    });

    it('should filter by category', () => {
      cy.get('[data-cy=category-filter]').select('dog-food');
      
      cy.get('[data-cy=wishlist-item]').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('[data-cy=item-category]').should('contain', 'Ração');
        });
      });
    });

    it('should search items by name', () => {
      const searchTerm = 'ração';
      
      cy.get('[data-cy=search-input]').type(searchTerm);
      
      cy.get('[data-cy=wishlist-item]').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('[data-cy=item-name]').invoke('text').should('match', new RegExp(searchTerm, 'i'));
        });
      });
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/wishlist', { fixture: 'wishlist-with-items.json' });
      cy.reload();
    });

    it('should select multiple items', () => {
      cy.get('[data-cy=select-all-checkbox]').check();
      
      cy.get('[data-cy=item-checkbox]').each(($checkbox) => {
        cy.wrap($checkbox).should('be.checked');
      });
      
      cy.get('[data-cy=bulk-actions]').should('be.visible');
    });

    it('should remove selected items', () => {
      // Select first two items
      cy.get('[data-cy=item-checkbox]').first().check();
      cy.get('[data-cy=item-checkbox]').eq(1).check();
      
      cy.get('[data-cy=bulk-remove-button]').click();
      
      cy.get('[data-cy=bulk-remove-confirmation]').should('be.visible');
      cy.get('[data-cy=confirm-bulk-remove]').click();
      
      cy.contains('Itens removidos da lista').should('be.visible');
    });

    it('should update priority for selected items', () => {
      cy.get('[data-cy=item-checkbox]').first().check();
      cy.get('[data-cy=item-checkbox]').eq(1).check();
      
      cy.get('[data-cy=bulk-priority-select]').select('high');
      cy.get('[data-cy=apply-bulk-priority]').click();
      
      cy.contains('Prioridade atualizada para itens selecionados').should('be.visible');
    });
  });

  describe('Wishlist Sharing', () => {
    it('should generate shareable wishlist link', () => {
      cy.get('[data-cy=share-wishlist-button]').click();
      
      cy.get('[data-cy=share-modal]').should('be.visible');
      cy.get('[data-cy=shareable-link]').should('be.visible');
      
      cy.get('[data-cy=shareable-link]').invoke('val').should('include', '/wishlist/shared/');
    });

    it('should copy wishlist link to clipboard', () => {
      cy.get('[data-cy=share-wishlist-button]').click();
      
      cy.get('[data-cy=copy-link-button]').click();
      
      cy.contains('Link copiado para a área de transferência').should('be.visible');
    });

    it('should set wishlist privacy options', () => {
      cy.get('[data-cy=share-wishlist-button]').click();
      
      cy.get('[data-cy=privacy-select]').select('public');
      cy.get('[data-cy=save-privacy-button]').click();
      
      cy.contains('Configurações de privacidade salvas').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt wishlist layout for mobile', () => {
      cy.viewport(375, 667);
      
      // Items should stack vertically
      cy.get('[data-cy=wishlist-container]').should('be.visible');
      cy.get('[data-cy=wishlist-item]').should('be.visible');
      
      // Mobile-specific controls
      cy.get('[data-cy=mobile-sort-button]').should('be.visible');
      cy.get('[data-cy=mobile-filter-button]').should('be.visible');
    });

    it('should optimize for tablet layout', () => {
      cy.viewport(768, 1024);
      
      cy.get('[data-cy=wishlist-grid]').should('be.visible');
      cy.get('[data-cy=wishlist-sidebar]').should('be.visible');
    });
  });

  describe('Glass Effects Integration', () => {
    it('should apply glass effects to wishlist components', () => {
      const glassSelectors = [
        '[data-cy=wishlist-header]',
        '[data-cy=wishlist-item]',
        '[data-cy=search-bar]',
        '[data-cy=sort-controls]',
        '[data-cy=bulk-actions]'
      ];

      glassSelectors.forEach((selector) => {
        cy.get(selector).then(($el) => {
          if ($el.length > 0) {
            cy.wrap($el).should('have.css', 'backdrop-filter');
            cy.wrap($el).should('have.css', 'background-color');
          }
        });
      });
    });

    it('should maintain glass effects on item hover', () => {
      cy.get('[data-cy=wishlist-item]').first().trigger('mouseover');
      
      cy.get('[data-cy=wishlist-item]').first().should('have.css', 'backdrop-filter');
      cy.get('[data-cy=wishlist-item]').first().should('have.css', 'transform');
    });
  });

  describe('Wishlist Analytics', () => {
    it('should track wishlist interactions', () => {
      cy.intercept('POST', '/api/analytics/wishlist-view', { statusCode: 200 });
      
      // Page visit should be tracked
      cy.get('@wishlist-view').should('have.been.called');
    });

    it('should track item priority changes', () => {
      cy.intercept('POST', '/api/analytics/priority-change', { statusCode: 200 });
      
      cy.get('[data-cy=wishlist-item]').first().within(() => {
        cy.get('[data-cy=priority-selector]').select('high');
      });
      
      cy.get('@priority-change').should('have.been.called');
    });
  });
});