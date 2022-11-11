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
      cy.getBySel('avatarBadgeUpload').should('be.visible');
      cy.getBySel('avatarBadgeDelete').should('not.exist');
      cy.getBySel('avatarInput').selectFile(
        {
          contents: 'cypress/fixtures/media/avatar.jpg',
          fileName: 'av.jpg',
          mimeType: 'image/jpeg',
        },
        { force: true }
      );
      cy.getBySel('avatar').find('img').should('be.visible');
      cy.getBySel('avatarBadgeUpload').should('not.exist');
      cy.getBySel('avatarBadgeDelete').should('be.visible');
      cy.getBySel('password').type('end2endpass');
      cy.getBySel('passwordConfirm').type('end2endpass');
      cy.getBySel('submit').click();

      cy.wait('@apiAuthRegister').its('response.statusCode').should('eq', 200);
      cy.url().should('include', '/login');
    });

    it('shows error when username is already used', () => {
      cy.signupByApi('end2end', 'end2endpass', 'E2E').loginByApi(
        'end2end',
        'end2endpass'
      );

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

      cy.wait('@apiAuthRegister').its('response.statusCode').should('eq', 500);
      cy.url().should('include', '/signup');
    });
  });
});
