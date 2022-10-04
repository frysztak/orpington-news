/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-test=${selector}]`, ...args);
});

Cypress.Commands.add('getBySelLike', (selector, ...args) => {
  return cy.get(`[data-test*=${selector}]`, ...args);
});

Cypress.Commands.add('openDrawerIfExists', () => {
  const selector = '[data-test=hamburgerButton]:visible';
  return cy.getBySel('panesMobile').then(($body) => {
    if ($body.find(selector).length > 0) {
      cy.get(selector).then(($button) => {
        $button.trigger('click');
        cy.getBySel('drawer');
      });
    }
  });
});

Cypress.Commands.add('closeDrawerIfExists', () => {
  const selector = '[data-test=closeDrawer]:visible';
  return cy.getBySel('panesMobile').then(($body) => {
    if ($body.find(selector).length > 0) {
      cy.get(selector).then(($button) => {
        $button.trigger('click');
        cy.getBySel('drawer').should('not.exist');
      });
    }
  });
});

Cypress.Commands.add('getReadItems', (...args) => {
  return cy.get(`[data-test-read="true"]`, ...args);
});

Cypress.Commands.add('getUnreadItems', (...args) => {
  return cy.get(`[data-test-read="false"]`, ...args);
});

Cypress.Commands.add('clickCollection', (id: string) => {
  return cy.getBySel(`collection-id-${id}`).click();
});

Cypress.Commands.add(
  'clickSidebarAction',
  (collectionId: string, action: string) => {
    return cy.getBySel(`collection-id-${collectionId}`).within((item) => {
      cy.getBySel('menuButton').click({ force: true });
      cy.getBySel('menuList').should('be.visible');
      cy.getBySel(action).click();
    });
  }
);

Cypress.Commands.add('clickCollectionHeaderMenuAction', (action: string) => {
  const selector = '[data-test=collectionHeader]:visible';
  return cy.get(selector).within((item) => {
    cy.getBySel('menuButton').click({ force: true });
    cy.getBySel('menuList').should('be.visible');
    cy.getBySel(action).click();
  });
});

Cypress.Commands.add('signupByApi', (username, password, displayName) => {
  return cy.request('POST', `${Cypress.env('api_url')}/auth/register`, {
    username,
    password,
    displayName,
  });
});

Cypress.Commands.add('loginByApi', (username, password) => {
  return cy.request('POST', `${Cypress.env('api_url')}/auth/login`, {
    username,
    password,
  });
});

Cypress.Commands.add('addFeedByApi', (data) => {
  return cy.request('POST', `${Cypress.env('api_url')}/collections`, data);
});
