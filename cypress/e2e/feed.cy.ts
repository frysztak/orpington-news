import { getApiPath } from './utils';

describe('feed page', () => {
  beforeEach(() => {
    cy.signupByApi('end2end', 'end2endpass', 'E2E').loginByApi(
      'end2end',
      'end2endpass'
    );
  });

  it('can add new feed', () => {
    cy.intercept({
      method: 'POST',
      url: getApiPath('/collections'),
    }).as('apiCollections');
    cy.intercept({
      method: 'POST',
      url: getApiPath('/collections/verifyUrl'),
    }).as('apiCollectionsVerify');

    cy.visit('/');
    cy.getBySel('addFeed').click();
    cy.getBySel('addCollectionModal').should('be.visible');
    cy.getBySel('feedUrl').type('http://localhost:8002/kentcdodds.xml').blur();
    cy.getBySel('verifyUrl').click();
    cy.wait('@apiCollectionsVerify')
      .its('response.statusCode')
      .should('eq', 200);

    cy.getBySel('addFeedButton').click();
    cy.wait('@apiCollections').its('response.statusCode').should('eq', 200);

    cy.getBySel('collection-id-1')
      .within(() => {
        cy.getBySel('title').should('have.text', 'Kent C. Dodds Blog');
        cy.getBySel('chevron').should('not.exist');
        cy.getBySel('badge').should('exist').and('have.text', '3');
      })
      .should('exist')
      .and('be.visible');
  });
});
