/// <reference types="cypress" />

import { getApiPath } from '../e2e/utils';

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
  return cy.get(`[data-test="${selector}"]`, ...args);
});

Cypress.Commands.add('getBySelVisible', (selector, ...args) => {
  return cy.get(`[data-test="${selector}"]:visible`, ...args);
});

Cypress.Commands.add('getBySelLike', (selector, ...args) => {
  return cy.get(`[data-test*="${selector}"]`, ...args);
});

Cypress.Commands.add('openDrawerIfExists', () => {
  const selector = '[data-test=hamburgerButton]:visible';
  return cy.getBySel('panesMobile').then(($body) => {
    if ($body.find(selector).length > 0) {
      cy.get(selector).then(($button) => {
        $button.trigger('click');
        cy.getBySel('drawer').should('exist');
      });
    }
  });
});

Cypress.Commands.add('closeDrawerIfExists', () => {
  const selector = '[data-test=closeDrawer]:visible';
  return cy
    .getBySel('drawer')
    .should(Cypress._.noop)
    .then(($drawer) => {
      if ($drawer.find(selector).length > 0) {
        cy.get(selector).then(($button) => {
          $button.trigger('click', { force: true });
          cy.getBySel('drawer').should('not.exist');
        });
      }
    });
});

Cypress.Commands.add('waitForDrawerToClose', () => {
  return cy.getBySel('panesMobile').then(($body) => {
    cy.getBySel('drawer').should('not.exist');
  });
});

Cypress.Commands.add('getReadItems', (...args) => {
  return cy.get(`[data-test-read="true"]:visible`, ...args);
});

Cypress.Commands.add('getUnreadItems', (...args) => {
  return cy.get(`[data-test-read="false"]:visible`, ...args);
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
    cy.getBySelVisible('menuButton').click({ force: true });
    cy.getBySel('menuList').should('be.visible');
    cy.getBySelVisible(action).click();
  });
});

Cypress.Commands.add('clickCollectionHeaderLayout', (layout: string) => {
  const selector = '[data-test=collectionHeader]:visible';
  return cy.get(selector).within((item) => {
    cy.getBySelVisible('layoutButton').click();
    cy.getBySel('layoutMenuList').should('be.visible');
    cy.getBySelVisible(`layout-${layout}`).click();
  });
});

Cypress.Commands.add('clickGoBackIfExists', () => {
  const selector = '[data-test=goBack]:visible';
  return cy.getBySel('panesMobile').then(($body) => {
    if ($body.find(selector).length > 0) {
      cy.get(selector).then(($button) => {
        $button.trigger('click');
      });
    }
  });
});

Cypress.Commands.add('changeActiveCollection', (id: string) => {
  cy.intercept({
    method: 'GET',
    url: getApiPath(
      `/collections/${id}/items?pageIndex=0&filter=all&grouping=none&sortBy=newestFirst`
    ),
  }).as('apiGetItems');

  cy.visit('/');
  cy.openDrawerIfExists();
  cy.clickCollection(id);

  cy.wait('@apiGetItems');
});

Cypress.Commands.add('resetDatabaseByApi', () => {
  return cy.request('POST', `${Cypress.env('api_url')}/e2e/reset_db`);
});

Cypress.Commands.add('resetFeedPages', () => {
  return cy.request('PUT', `${Cypress.env('feeds_url_cypress')}/feed/reset_pages`);
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

Cypress.Commands.add(
  'putDateReadByApi',
  ({ collectionId, articleId, dateRead }) => {
    return cy.request(
      'PUT',
      `${Cypress.env(
        'api_url'
      )}/collections/${collectionId}/item/${articleId}/dateRead`,
      { dateRead }
    );
  }
);

Cypress.Commands.add(
  'putCollectionPreferencesByApi',
  ({ collectionId, preferences }) => {
    return cy.request(
      'PUT',
      `${Cypress.env('api_url')}/collections/${collectionId}/preferences`,
      preferences
    );
  }
);

Cypress.Commands.add('putFeedPageByApi', ({ feedName, page }) => {
  return cy.request(
    'PUT',
    `${Cypress.env('feeds_url_cypress')}/feed/${feedName}/page/${page}`
  );
});
