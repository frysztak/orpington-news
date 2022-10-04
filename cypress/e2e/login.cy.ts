import { getApiPath } from './utils';

const sizes = ['macbook-13', 'iphone-6'];

sizes.forEach((size) => {
  describe(`login page, size '${size}'`, () => {
    beforeEach(() => {
      cy.viewport(size as any);
      cy.signupByApi('end2end', 'end2endpass', 'E2E');
    });

    const baseUrl = Cypress.config('baseUrl');

    it('can successfully log in', () => {
      cy.intercept({
        method: 'POST',
        url: getApiPath('/auth/login'),
      }).as('apiAuthLogin');

      cy.visit('/login');
      cy.getBySel('username').type('end2end');
      cy.getBySel('password').type('end2endpass');
      cy.getBySel('submit').click();

      cy.wait('@apiAuthLogin').its('response.statusCode').should('eq', 200);
      cy.url().should('equal', `${baseUrl}/`);
    });
  });
});
