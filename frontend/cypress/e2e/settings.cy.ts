import { getApiPath } from './utils';

const sizes = ['macbook-13', 'iphone-6'];

sizes.forEach((size) => {
  describe(`settings page, size '${size}'`, () => {
    beforeEach(() => {
      cy.viewport(size as any);
    });

    const baseUrl = Cypress.config('baseUrl');

    describe('account', () => {
      beforeEach(() => {
        cy.signupByApi('end2end', 'end2endpass', 'E2E').loginByApi(
          'end2end',
          'end2endpass'
        );
      });

      describe('edit info', () => {
        it('can edit display name', () => {
          cy.intercept({
            method: 'PUT',
            url: getApiPath('/auth/user'),
          }).as('apiAuthUser');

          cy.visit('/settings/account/info');
          cy.getBySelVisible('editAccountForm').within(() => {
            cy.getBySel('displayName').clear().type('John Smith');
            cy.getBySel('save').click();
          });

          cy.wait('@apiAuthUser').its('response.statusCode').should('eq', 200);
        });
      });

      describe('change password', () => {
        it('succeeds if current password matches', () => {
          cy.intercept({
            method: 'PUT',
            url: getApiPath('/auth/password'),
          }).as('apiAuthPassword');

          cy.visit('/settings/account/password');
          cy.getBySelVisible('changePasswordForm').within(() => {
            cy.getBySel('currentPassword').type('end2endpass');
            cy.getBySel('newPassword').type('newpass');
            cy.getBySel('newPasswordConfirm').type('newpass');
            cy.getBySel('savePassword').click();
          });

          cy.wait('@apiAuthPassword')
            .its('response.statusCode')
            .should('eq', 200);
        });

        it("fails if current password doesn't match", () => {
          cy.intercept({
            method: 'PUT',
            url: getApiPath('/auth/password'),
          }).as('apiAuthPassword');

          cy.visit('/settings/account/password');
          cy.getBySelVisible('changePasswordForm').within(() => {
            cy.getBySel('currentPassword').type('wrongpass');
            cy.getBySel('newPassword').type('newpass');
            cy.getBySel('newPasswordConfirm').type('newpass');
            cy.getBySel('savePassword').click();
          });

          cy.wait('@apiAuthPassword')
            .its('response.statusCode')
            .should('eq', 500);
        });
      });

      describe('logout', () => {
        it('can logout', () => {
          cy.intercept({
            method: 'DELETE',
            url: getApiPath('/auth/session'),
          }).as('apiAuthSession');

          cy.visit('/settings/account/logout');
          cy.getBySel('logoutMessage').should('exist').and('be.visible');

          cy.wait('@apiAuthSession')
            .its('response.statusCode')
            .should('eq', 200);
          cy.getCookie('sessionId').should('not.exist');
        });
      });
    });
  });
});
