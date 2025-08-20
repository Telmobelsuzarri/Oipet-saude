describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', () => {
      cy.visit('/login');
      
      // Check if login page loads
      cy.contains('Entrar').should('be.visible');
      cy.get('[data-cy=email-input]').should('be.visible');
      cy.get('[data-cy=password-input]').should('be.visible');
      
      // Fill login form
      cy.get('[data-cy=email-input]').type(Cypress.env('TEST_USER_EMAIL'));
      cy.get('[data-cy=password-input]').type(Cypress.env('TEST_USER_PASSWORD'));
      
      // Submit form
      cy.get('[data-cy=login-button]').click();
      
      // Check redirect to dashboard
      cy.url().should('include', '/dashboard');
      
      // Check if token is stored
      cy.window().its('localStorage.token').should('exist');
      
      // Check if user info is visible
      cy.contains('Dashboard').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      
      cy.get('[data-cy=email-input]').type('invalid@email.com');
      cy.get('[data-cy=password-input]').type('wrongpassword');
      cy.get('[data-cy=login-button]').click();
      
      // Should show error message
      cy.contains('Credenciais inválidas').should('be.visible');
      
      // Should stay on login page
      cy.url().should('include', '/login');
    });

    it('should validate email format', () => {
      cy.visit('/login');
      
      cy.get('[data-cy=email-input]').type('invalid-email');
      cy.get('[data-cy=password-input]').type('password');
      cy.get('[data-cy=login-button]').click();
      
      // Should show validation error
      cy.contains('Email deve ter um formato válido').should('be.visible');
    });
  });

  describe('Registration', () => {
    it('should register new user successfully', () => {
      const email = `test-${Date.now()}@oipet.com`;
      
      cy.visit('/register');
      
      // Fill registration form
      cy.get('[data-cy=name-input]').type('Test User');
      cy.get('[data-cy=email-input]').type(email);
      cy.get('[data-cy=password-input]').type('TestPassword123!');
      cy.get('[data-cy=confirm-password-input]').type('TestPassword123!');
      
      cy.get('[data-cy=register-button]').click();
      
      // Should redirect to dashboard or verification page
      cy.url().should('not.include', '/register');
    });

    it('should validate password confirmation', () => {
      cy.visit('/register');
      
      cy.get('[data-cy=name-input]').type('Test User');
      cy.get('[data-cy=email-input]').type('test@oipet.com');
      cy.get('[data-cy=password-input]').type('TestPassword123!');
      cy.get('[data-cy=confirm-password-input]').type('DifferentPassword');
      
      cy.get('[data-cy=register-button]').click();
      
      // Should show password mismatch error
      cy.contains('Senhas não coincidem').should('be.visible');
    });
  });

  describe('Logout', () => {
    it('should logout successfully', () => {
      // Login first
      cy.login();
      cy.visit('/dashboard');
      
      // Logout
      cy.get('[data-cy=user-menu]').click();
      cy.get('[data-cy=logout-button]').click();
      
      // Should redirect to login
      cy.url().should('include', '/login');
      
      // Token should be removed
      cy.window().its('localStorage.token').should('not.exist');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without auth', () => {
      cy.visit('/dashboard');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should allow access to protected route when authenticated', () => {
      cy.login();
      cy.visit('/dashboard');
      
      // Should stay on dashboard
      cy.url().should('include', '/dashboard');
      cy.contains('Dashboard').should('be.visible');
    });
  });
});