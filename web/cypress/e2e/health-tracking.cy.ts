describe('Health Tracking', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/health');
  });

  describe('Health Dashboard', () => {
    it('should load health tracking page', () => {
      cy.contains('Saúde dos Pets').should('be.visible');
      cy.get('[data-cy=health-dashboard]').should('be.visible');
      cy.get('[data-cy=pet-selector]').should('be.visible');
    });

    it('should display OiPet logo', () => {
      cy.get('[data-cy=oipet-logo]').should('be.visible');
    });

    it('should apply glass effects to health components', () => {
      cy.get('[data-cy=health-metrics-card]').should('have.css', 'backdrop-filter');
      cy.waitForGlassEffect('[data-cy=health-metrics-card]');
    });
  });

  describe('Pet Selection', () => {
    it('should switch between pets', () => {
      cy.get('[data-cy=pet-selector]').click();
      cy.get('[data-cy=pet-option]').should('have.length.at.least', 1);
      
      cy.get('[data-cy=pet-option]').first().click();
      
      // Should load health data for selected pet
      cy.get('[data-cy=selected-pet-name]').should('be.visible');
      cy.get('[data-cy=health-metrics-card]').should('be.visible');
    });

    it('should display current pet information', () => {
      cy.get('[data-cy=current-pet-info]').should('be.visible');
      cy.get('[data-cy=pet-avatar]').should('be.visible');
      cy.get('[data-cy=pet-name]').should('be.visible');
      cy.get('[data-cy=pet-age]').should('be.visible');
      cy.get('[data-cy=pet-weight]').should('be.visible');
    });
  });

  describe('Health Metrics', () => {
    it('should display weight tracking chart', () => {
      cy.get('[data-cy=weight-chart]').should('be.visible');
      cy.get('[data-cy=weight-chart-data]').should('be.visible');
      
      // Should show weight progression over time
      cy.get('[data-cy=current-weight]').should('be.visible');
      cy.get('[data-cy=weight-trend]').should('be.visible');
    });

    it('should display activity metrics', () => {
      cy.get('[data-cy=activity-metrics]').should('be.visible');
      cy.get('[data-cy=daily-activity]').should('be.visible');
      cy.get('[data-cy=weekly-activity]').should('be.visible');
      cy.get('[data-cy=activity-goal]').should('be.visible');
    });

    it('should display calorie tracking', () => {
      cy.get('[data-cy=calorie-tracking]').should('be.visible');
      cy.get('[data-cy=daily-calories]').should('be.visible');
      cy.get('[data-cy=calorie-goal]').should('be.visible');
      cy.get('[data-cy=calorie-progress]').should('be.visible');
    });

    it('should show health score indicator', () => {
      cy.get('[data-cy=health-score]').should('be.visible');
      cy.get('[data-cy=health-score-value]').should('contain', /\d+/);
      cy.get('[data-cy=health-status]').should('be.visible');
    });
  });

  describe('Add Health Record', () => {
    it('should open add health record modal', () => {
      cy.get('[data-cy=add-health-record-button]').click();
      
      cy.get('[data-cy=health-record-modal]').should('be.visible');
      cy.contains('Novo Registro de Saúde').should('be.visible');
    });

    it('should add weight record', () => {
      const newWeight = '28.5';
      
      cy.get('[data-cy=add-health-record-button]').click();
      
      cy.get('[data-cy=record-type-select]').select('weight');
      cy.get('[data-cy=weight-input]').type(newWeight);
      cy.get('[data-cy=record-date-input]').type('2024-01-15');
      cy.get('[data-cy=record-notes]').type('Pesagem após exercício');
      
      cy.get('[data-cy=save-health-record-button]').click();
      
      // Should close modal and show success message
      cy.get('[data-cy=health-record-modal]').should('not.be.visible');
      cy.contains('Registro salvo com sucesso').should('be.visible');
      
      // Should update current weight
      cy.get('[data-cy=current-weight]').should('contain', newWeight);
    });

    it('should add activity record', () => {
      cy.get('[data-cy=add-health-record-button]').click();
      
      cy.get('[data-cy=record-type-select]').select('activity');
      cy.get('[data-cy=activity-type-select]').select('walk');
      cy.get('[data-cy=activity-duration-input]').type('45');
      cy.get('[data-cy=activity-intensity-select]').select('medium');
      cy.get('[data-cy=record-date-input]').type('2024-01-15');
      
      cy.get('[data-cy=save-health-record-button]').click();
      
      cy.contains('Registro salvo com sucesso').should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('[data-cy=add-health-record-button]').click();
      
      // Try to submit empty form
      cy.get('[data-cy=save-health-record-button]').click();
      
      // Should show validation errors
      cy.contains('Tipo de registro é obrigatório').should('be.visible');
      cy.contains('Data é obrigatória').should('be.visible');
    });
  });

  describe('Health History', () => {
    it('should display health records timeline', () => {
      cy.get('[data-cy=health-timeline]').should('be.visible');
      cy.get('[data-cy=timeline-item]').should('have.length.at.least', 1);
      
      cy.get('[data-cy=timeline-item]').first().within(() => {
        cy.get('[data-cy=record-date]').should('be.visible');
        cy.get('[data-cy=record-type]').should('be.visible');
        cy.get('[data-cy=record-value]').should('be.visible');
      });
    });

    it('should filter records by type', () => {
      cy.get('[data-cy=record-filter]').select('weight');
      
      cy.get('[data-cy=timeline-item]').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('[data-cy=record-type]').should('contain', 'Peso');
        });
      });
    });

    it('should filter records by date range', () => {
      cy.get('[data-cy=date-range-filter]').select('last-week');
      
      cy.get('[data-cy=timeline-item]').should('be.visible');
      
      cy.get('[data-cy=date-range-filter]').select('last-month');
      
      cy.get('[data-cy=timeline-item]').should('be.visible');
    });

    it('should edit existing health record', () => {
      cy.get('[data-cy=timeline-item]').first().within(() => {
        cy.get('[data-cy=edit-record-button]').click();
      });
      
      cy.get('[data-cy=edit-health-record-modal]').should('be.visible');
      
      // Update the record
      cy.get('[data-cy=record-notes]').clear().type('Nota atualizada');
      cy.get('[data-cy=update-health-record-button]').click();
      
      cy.contains('Registro atualizado com sucesso').should('be.visible');
    });

    it('should delete health record', () => {
      cy.get('[data-cy=timeline-item]').first().within(() => {
        cy.get('[data-cy=delete-record-button]').click();
      });
      
      cy.get('[data-cy=delete-confirmation-modal]').should('be.visible');
      cy.get('[data-cy=confirm-delete-record]').click();
      
      cy.contains('Registro excluído com sucesso').should('be.visible');
    });
  });

  describe('Health Charts', () => {
    it('should display weight progression chart', () => {
      cy.get('[data-cy=weight-chart]').should('be.visible');
      
      // Should have chart elements
      cy.get('[data-cy=weight-chart]').within(() => {
        cy.get('svg').should('be.visible');
        cy.get('.chart-line').should('be.visible');
        cy.get('.chart-dots').should('be.visible');
      });
    });

    it('should display activity trend chart', () => {
      cy.get('[data-cy=activity-chart]').should('be.visible');
      
      cy.get('[data-cy=activity-chart]').within(() => {
        cy.get('svg').should('be.visible');
        cy.get('.chart-bars').should('be.visible');
      });
    });

    it('should switch chart time periods', () => {
      const periods = ['week', 'month', 'year'];
      
      periods.forEach(period => {
        cy.get('[data-cy=chart-period-selector]').select(period);
        
        // Chart should update with new data
        cy.get('[data-cy=weight-chart]').should('be.visible');
        cy.get('[data-cy=chart-loading]').should('not.exist');
      });
    });
  });

  describe('Health Goals', () => {
    it('should set weight goal', () => {
      cy.get('[data-cy=set-weight-goal-button]').click();
      
      cy.get('[data-cy=weight-goal-modal]').should('be.visible');
      cy.get('[data-cy=target-weight-input]').type('25');
      cy.get('[data-cy=target-date-input]').type('2024-06-01');
      cy.get('[data-cy=save-weight-goal-button]').click();
      
      cy.contains('Meta definida com sucesso').should('be.visible');
      cy.get('[data-cy=weight-goal-indicator]').should('be.visible');
    });

    it('should set activity goal', () => {
      cy.get('[data-cy=set-activity-goal-button]').click();
      
      cy.get('[data-cy=activity-goal-modal]').should('be.visible');
      cy.get('[data-cy=daily-minutes-input]').type('60');
      cy.get('[data-cy=weekly-days-input]').type('5');
      cy.get('[data-cy=save-activity-goal-button]').click();
      
      cy.contains('Meta definida com sucesso').should('be.visible');
      cy.get('[data-cy=activity-goal-progress]').should('be.visible');
    });

    it('should display goal progress', () => {
      cy.get('[data-cy=goals-progress]').should('be.visible');
      
      cy.get('[data-cy=weight-goal-progress]').within(() => {
        cy.get('[data-cy=progress-bar]').should('be.visible');
        cy.get('[data-cy=progress-percentage]').should('contain', '%');
      });
    });
  });

  describe('Health Notifications', () => {
    it('should show health reminders', () => {
      cy.get('[data-cy=health-reminders]').should('be.visible');
      cy.get('[data-cy=reminder-item]').should('have.length.at.least', 1);
      
      cy.get('[data-cy=reminder-item]').first().within(() => {
        cy.get('[data-cy=reminder-text]').should('be.visible');
        cy.get('[data-cy=reminder-time]').should('be.visible');
      });
    });

    it('should mark reminder as completed', () => {
      cy.get('[data-cy=reminder-item]').first().within(() => {
        cy.get('[data-cy=complete-reminder-button]').click();
      });
      
      cy.contains('Lembrete marcado como concluído').should('be.visible');
    });

    it('should create custom health reminder', () => {
      cy.get('[data-cy=add-reminder-button]').click();
      
      cy.get('[data-cy=reminder-modal]').should('be.visible');
      cy.get('[data-cy=reminder-text-input]').type('Dar medicamento');
      cy.get('[data-cy=reminder-time-input]').type('08:00');
      cy.get('[data-cy=reminder-frequency-select]').select('daily');
      
      cy.get('[data-cy=save-reminder-button]').click();
      
      cy.contains('Lembrete criado com sucesso').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt health dashboard for mobile', () => {
      cy.viewport(375, 667);
      
      // Charts should stack vertically
      cy.get('[data-cy=health-metrics-card]').should('be.visible');
      cy.get('[data-cy=weight-chart]').should('be.visible');
      
      // Add button should be accessible
      cy.get('[data-cy=add-health-record-button]').should('be.visible');
    });

    it('should optimize layout for tablet', () => {
      cy.viewport(768, 1024);
      
      cy.get('[data-cy=health-dashboard]').should('be.visible');
      cy.get('[data-cy=health-metrics-card]').should('be.visible');
      cy.get('[data-cy=health-timeline]').should('be.visible');
    });
  });

  describe('Glass Effects Integration', () => {
    it('should apply glass effects to health components', () => {
      const glassSelectors = [
        '[data-cy=health-metrics-card]',
        '[data-cy=health-timeline]',
        '[data-cy=health-reminders]',
        '[data-cy=goals-progress]',
        '[data-cy=weight-chart]',
        '[data-cy=activity-chart]'
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

    it('should maintain glass effects on modal dialogs', () => {
      cy.get('[data-cy=add-health-record-button]').click();
      
      cy.get('[data-cy=health-record-modal]').should('have.css', 'backdrop-filter');
      cy.waitForGlassEffect('[data-cy=health-record-modal]');
    });
  });
});