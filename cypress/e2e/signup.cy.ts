import { getApiPath } from './utils';

describe('signup page', () => {
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
