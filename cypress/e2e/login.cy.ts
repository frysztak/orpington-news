import { getApiPath } from './utils';

const sizes = ['macbook-13', 'iphone-6'];

sizes.forEach((size) => {
  describe(`login page, size '${size}'`, () => {
    beforeEach(() => {
      cy.viewport(size as any);
    });

    const baseUrl = Cypress.config('baseUrl');

    it("cannot log in if user doesn't exist", () => {
      cy.intercept({
        method: 'POST',
        url: getApiPath('/auth/login'),
      }).as('apiAuthLogin');

      cy.visit('/login');
      cy.getBySel('username').type('end2end');
      cy.getBySel('password').type('end2endpass');
      cy.getBySel('submit').click();

      cy.wait('@apiAuthLogin').its('response.statusCode').should('eq', 403);
      cy.url().should('equal', `${baseUrl}/login`);
    });

    it('cannot log in if password is incorrect', () => {
      cy.intercept({
        method: 'POST',
        url: getApiPath('/auth/login'),
      }).as('apiAuthLogin');

      cy.signupByApi('end2end', 'end2endpass', 'E2E');

      cy.visit('/login');
      cy.getBySel('username').type('end2end');
      cy.getBySel('password').type('wrongpass');
      cy.getBySel('submit').click();

      cy.wait('@apiAuthLogin').its('response.statusCode').should('eq', 403);
      cy.url().should('equal', `${baseUrl}/login`);
    });

    it('can successfully log in', () => {
      cy.intercept({
        method: 'POST',
        url: getApiPath('/auth/login'),
      }).as('apiAuthLogin');

      cy.signupByApi('end2end', 'end2endpass', 'E2E');

      cy.visit('/login');
      cy.getBySel('username').type('end2end');
      cy.getBySel('password').type('end2endpass');
      cy.getBySel('submit').click();

      cy.wait('@apiAuthLogin').its('response.statusCode').should('eq', 200);
      cy.url().should('equal', `${baseUrl}/`);
    });
  });
});
