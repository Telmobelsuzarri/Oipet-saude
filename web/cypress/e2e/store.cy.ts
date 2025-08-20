describe('Store & E-commerce', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/store');
  });

  describe('Store Interface', () => {
    it('should load store page with product catalog', () => {
      cy.contains('Loja OiPet').should('be.visible');
      cy.get('[data-cy=product-grid]').should('be.visible');
      cy.get('[data-cy=category-filters]').should('be.visible');
    });

    it('should display OiPet logo and branding', () => {
      cy.get('[data-cy=oipet-logo]').should('be.visible');
      cy.get('[data-cy=store-banner]').should('be.visible');
    });

    it('should apply glass effects to store components', () => {
      cy.get('[data-cy=category-filters]').should('have.css', 'backdrop-filter');
      cy.get('[data-cy=search-bar]').should('have.css', 'backdrop-filter');
      cy.waitForGlassEffect('[data-cy=category-filters]');
    });
  });

  describe('Product Catalog', () => {
    it('should display products with correct information', () => {
      cy.get('[data-cy=product-card]').should('have.length.at.least', 1);
      
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=product-image]').should('be.visible');
        cy.get('[data-cy=product-name]').should('be.visible');
        cy.get('[data-cy=product-price]').should('be.visible');
        cy.get('[data-cy=product-category]').should('be.visible');
      });
    });

    it('should filter products by category', () => {
      // Test dog food filter
      cy.get('[data-cy=category-filter-dog]').click();
      
      cy.get('[data-cy=product-card]').should('be.visible');
      cy.get('[data-cy=product-card]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-cy=product-category]').should('contain', 'Cachorro');
        });
      });
    });

    it('should filter products by treats category', () => {
      cy.get('[data-cy=category-filter-treats]').click();
      
      cy.get('[data-cy=product-card]').should('be.visible');
      cy.get('[data-cy=product-card]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-cy=product-category]').should('contain', 'Petisco');
        });
      });
    });

    it('should search products by name', () => {
      const searchTerm = 'ração';
      
      cy.get('[data-cy=search-input]').type(searchTerm);
      cy.get('[data-cy=search-button]').click();
      
      cy.get('[data-cy=product-card]').should('be.visible');
      cy.get('[data-cy=product-name]').each(($name) => {
        cy.wrap($name).invoke('text').should('match', new RegExp(searchTerm, 'i'));
      });
    });
  });

  describe('Product Details', () => {
    it('should open product details modal', () => {
      cy.get('[data-cy=product-card]').first().click();
      
      cy.get('[data-cy=product-details-modal]').should('be.visible');
      cy.get('[data-cy=product-details-image]').should('be.visible');
      cy.get('[data-cy=product-details-name]').should('be.visible');
      cy.get('[data-cy=product-details-description]').should('be.visible');
      cy.get('[data-cy=product-details-price]').should('be.visible');
    });

    it('should display product specifications', () => {
      cy.get('[data-cy=product-card]').first().click();
      
      cy.get('[data-cy=product-specifications]').should('be.visible');
      cy.get('[data-cy=product-ingredients]').should('be.visible');
      cy.get('[data-cy=product-nutritional-info]').should('be.visible');
    });

    it('should close product details modal', () => {
      cy.get('[data-cy=product-card]').first().click();
      
      cy.get('[data-cy=close-modal-button]').click();
      
      cy.get('[data-cy=product-details-modal]').should('not.be.visible');
    });
  });

  describe('Wishlist Integration', () => {
    it('should add product to wishlist', () => {
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-wishlist-button]').click();
      });
      
      cy.contains('Adicionado à lista de desejos').should('be.visible');
      
      // Check if wishlist icon is active
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=wishlist-icon]').should('have.class', 'active');
      });
    });

    it('should remove product from wishlist', () => {
      // First add to wishlist
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-wishlist-button]').click();
      });
      
      // Then remove
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=remove-from-wishlist-button]').click();
      });
      
      cy.contains('Removido da lista de desejos').should('be.visible');
      
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=wishlist-icon]').should('not.have.class', 'active');
      });
    });

    it('should navigate to wishlist page', () => {
      cy.get('[data-cy=wishlist-nav-button]').click();
      
      cy.url().should('include', '/wishlist');
      cy.contains('Minha Lista de Desejos').should('be.visible');
    });

    it('should display wishlist items', () => {
      // Add item to wishlist first
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-wishlist-button]').click();
      });
      
      // Navigate to wishlist
      cy.get('[data-cy=wishlist-nav-button]').click();
      
      cy.get('[data-cy=wishlist-item]').should('have.length.at.least', 1);
      
      cy.get('[data-cy=wishlist-item]').first().within(() => {
        cy.get('[data-cy=wishlist-item-name]').should('be.visible');
        cy.get('[data-cy=wishlist-item-price]').should('be.visible');
        cy.get('[data-cy=wishlist-item-priority]').should('be.visible');
      });
    });
  });

  describe('Deep Linking & External Navigation', () => {
    it('should generate deep links for products', () => {
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=share-product-button]').click();
      });
      
      cy.get('[data-cy=share-modal]').should('be.visible');
      cy.get('[data-cy=product-link]').should('be.visible');
      
      // Check if link contains product ID
      cy.get('[data-cy=product-link]').invoke('val').should('include', '/product/');
    });

    it('should redirect to OiPet main store for purchase', () => {
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=buy-now-button]').click();
      });
      
      // Should show external link warning
      cy.get('[data-cy=external-link-modal]').should('be.visible');
      cy.contains('Você será redirecionado').should('be.visible');
      cy.get('[data-cy=confirm-external-link]').should('be.visible');
    });

    it('should track external link clicks', () => {
      cy.intercept('POST', '/api/analytics/external-link', { statusCode: 200 });
      
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=buy-now-button]').click();
      });
      
      cy.get('[data-cy=confirm-external-link]').click();
      
      // Should track the click
      cy.get('@external-link').should('have.been.called');
    });
  });

  describe('Store Analytics', () => {
    it('should track product view events', () => {
      cy.intercept('POST', '/api/analytics/product-view', { statusCode: 200 });
      
      cy.get('[data-cy=product-card]').first().click();
      
      // Should track product view
      cy.get('@product-view').should('have.been.called');
    });

    it('should track wishlist actions', () => {
      cy.intercept('POST', '/api/analytics/wishlist-action', { statusCode: 200 });
      
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-wishlist-button]').click();
      });
      
      // Should track wishlist addition
      cy.get('@wishlist-action').should('have.been.called');
    });
  });

  describe('Store Search & Filters', () => {
    it('should filter by price range', () => {
      cy.get('[data-cy=price-filter-slider]').should('be.visible');
      
      // Set price range
      cy.get('[data-cy=min-price-input]').clear().type('10');
      cy.get('[data-cy=max-price-input]').clear().type('50');
      cy.get('[data-cy=apply-price-filter]').click();
      
      // Check if products are filtered
      cy.get('[data-cy=product-card]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-cy=product-price]').invoke('text').then((priceText) => {
            const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));
            expect(price).to.be.within(10, 50);
          });
        });
      });
    });

    it('should sort products by price', () => {
      cy.get('[data-cy=sort-select]').select('price-low');
      
      // Check if products are sorted by price (low to high)
      cy.get('[data-cy=product-price]').then(($prices) => {
        const prices = Array.from($prices).map(el => 
          parseFloat(el.textContent.replace(/[^\d,]/g, '').replace(',', '.'))
        );
        
        expect(prices).to.deep.equal([...prices].sort((a, b) => a - b));
      });
    });

    it('should clear all filters', () => {
      // Apply some filters
      cy.get('[data-cy=category-filter-dog]').click();
      cy.get('[data-cy=min-price-input]').type('20');
      
      // Clear filters
      cy.get('[data-cy=clear-filters-button]').click();
      
      // Should show all products
      cy.get('[data-cy=product-card]').should('have.length.at.least', 1);
      cy.get('[data-cy=category-filter-dog]').should('not.have.class', 'active');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt store layout for mobile', () => {
      cy.viewport(375, 667);
      
      // Product grid should adapt
      cy.get('[data-cy=product-grid]').should('be.visible');
      
      // Filters should be collapsible on mobile
      cy.get('[data-cy=mobile-filters-toggle]').should('be.visible');
      cy.get('[data-cy=mobile-filters-toggle]').click();
      cy.get('[data-cy=category-filters]').should('be.visible');
    });

    it('should show grid layout on tablet', () => {
      cy.viewport(768, 1024);
      
      cy.get('[data-cy=product-grid]').should('be.visible');
      cy.get('[data-cy=category-filters]').should('be.visible');
    });

    it('should optimize for desktop', () => {
      cy.viewport(1280, 720);
      
      // Should show sidebar filters
      cy.get('[data-cy=filters-sidebar]').should('be.visible');
      cy.get('[data-cy=product-grid]').should('be.visible');
    });
  });

  describe('Glass Effects Integration', () => {
    it('should apply glass effects to store components', () => {
      const glassSelectors = [
        '[data-cy=category-filters]',
        '[data-cy=search-bar]',
        '[data-cy=product-details-modal]',
        '[data-cy=wishlist-nav-button]',
        '[data-cy=filters-sidebar]'
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

    it('should maintain glass effects on product cards hover', () => {
      cy.get('[data-cy=product-card]').first().trigger('mouseover');
      
      cy.get('[data-cy=product-card]').first().should('have.css', 'backdrop-filter');
      cy.get('[data-cy=product-card]').first().should('have.css', 'transform');
    });
  });
});