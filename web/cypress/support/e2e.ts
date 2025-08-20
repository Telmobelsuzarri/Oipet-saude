// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

import './commands'

// Hide fetch/XHR requests from command log
Cypress.on('window:before:load', (win) => {
  const originalFetch = win.fetch;
  win.fetch = function (...args) {
    return originalFetch.apply(this, args);
  };
});

// Global error handler
Cypress.on('uncaught:exception', (err, runnable) => {
  // Don't fail the test if it's a network error
  if (err.message.includes('Network Error') || err.message.includes('fetch')) {
    return false;
  }
  return true;
});

// Custom commands for Glass UI testing
Cypress.Commands.add('waitForGlassEffect', (selector: string) => {
  cy.get(selector).should('have.css', 'backdrop-filter');
});

Cypress.Commands.add('checkResponsive', (selector: string) => {
  // Test different viewport sizes
  const viewports = [
    [375, 667], // iPhone
    [768, 1024], // iPad
    [1280, 720], // Desktop
  ];

  viewports.forEach(([width, height]) => {
    cy.viewport(width, height);
    cy.get(selector).should('be.visible');
  });
});