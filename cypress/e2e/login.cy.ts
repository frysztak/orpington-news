describe('login page', () => {
  beforeEach(() => {
    cy.signupByApi('end2end', 'end2endpass', 'E2E');
  });

  const baseUrl = Cypress.config('baseUrl');

  it('can successfully log in', () => {
    cy.intercept({
      method: 'POST',
      path: '/auth/login',
    }).as('apiAuthLogin');

    cy.visit('/login');
    cy.getBySel('username').type('end2end');
    cy.getBySel('password').type('end2endpass');
    cy.getBySel('submit').click();

    cy.wait('@apiAuthLogin').its('response.statusCode').should('eq', 200);
    cy.url().should('equal', `${baseUrl}/`);
  });
});
