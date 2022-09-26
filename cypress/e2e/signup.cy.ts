import { getApiPath } from './utils';

const sizes = ['macbook-13', 'iphone-6'];

sizes.forEach((size) => {
  describe(`signup page, size '${size}'`, () => {
    beforeEach(() => {
      cy.viewport(size as any);
    });

    it('can successfully sign up', () => {
      cy.intercept({
        method: 'POST',
        url: getApiPath('/auth/register'),
      }).as('apiAuthRegister');

      cy.visit('/signup');
      cy.getBySel('username').type('end2end');
      cy.getBySel('displayName').type('E2E');
      cy.getBySel('password').type('end2endpass');
      cy.getBySel('passwordConfirm').type('end2endpass');
      cy.getBySel('submit').click();

      cy.wait('@apiAuthRegister').its('response.statusCode').should('eq', 200);
      cy.url().should('include', '/login');
    });
  });
});
