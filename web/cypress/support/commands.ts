/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>
      createTestUser(): Chainable<void>
      createTestPet(name?: string): Chainable<void>
      waitForGlassEffect(selector: string): Chainable<Element>
      checkResponsive(selector: string): Chainable<void>
      apiRequest(method: string, url: string, body?: any): Chainable<any>
    }
  }
}

// Login command
Cypress.Commands.add('login', (email = Cypress.env('TEST_USER_EMAIL'), password = Cypress.env('TEST_USER_PASSWORD')) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    
    cy.get('[data-cy=email-input]').type(email);
    cy.get('[data-cy=password-input]').type(password);
    cy.get('[data-cy=login-button]').click();
    
    // Wait for successful login
    cy.url().should('include', '/dashboard');
    cy.window().its('localStorage.token').should('exist');
  });
});

// Create test user
Cypress.Commands.add('createTestUser', () => {
  const email = `test-${Date.now()}@oipet.com`;
  const password = 'TestPassword123!';
  
  cy.visit('/register');
  
  cy.get('[data-cy=name-input]').type('Test User');
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=confirm-password-input]').type(password);
  cy.get('[data-cy=register-button]').click();
  
  // Store credentials for later use
  cy.wrap({ email, password }).as('testUser');
});

// Create test pet
Cypress.Commands.add('createTestPet', (name = 'Test Pet') => {
  cy.get('[data-cy=add-pet-button]').click();
  
  cy.get('[data-cy=pet-name-input]').type(name);
  cy.get('[data-cy=pet-species-select]').select('dog');
  cy.get('[data-cy=pet-breed-input]').type('Labrador');
  cy.get('[data-cy=pet-weight-input]').type('25');
  cy.get('[data-cy=pet-height-input]').type('60');
  cy.get('[data-cy=pet-gender-select]').select('male');
  cy.get('[data-cy=pet-birth-date-input]').type('2020-01-01');
  
  cy.get('[data-cy=save-pet-button]').click();
  
  // Wait for pet to be created
  cy.contains(name).should('be.visible');
});

// API request helper
Cypress.Commands.add('apiRequest', (method: string, url: string, body?: any) => {
  const token = window.localStorage.getItem('token');
  
  return cy.request({
    method,
    url: `${Cypress.env('API_URL')}${url}`,
    body,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      'Content-Type': 'application/json'
    },
    failOnStatusCode: false
  });
});

export {};