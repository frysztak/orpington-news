import { getApiPath, getFeedUrl } from './utils';

const sizes = ['macbook-13', 'iphone-6'];

sizes.forEach((size) => {
  describe(`feed page, size '${size}'`, () => {
    const baseUrl = Cypress.config('baseUrl');

    beforeEach(() => {
      cy.viewport(size as any);
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
      cy.openDrawerIfExists();
      cy.getBySel('addFeed').filter(':visible').click();
      cy.getBySel('addCollectionModal').should('be.visible');
      cy.getBySel('feedUrl').type(getFeedUrl('kentcdodds.xml')).blur();
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

    it('clicking on feed sets active view', () => {
      cy.intercept({
        method: 'PUT',
        url: getApiPath('/preferences/activeView'),
      }).as('apiPreferencesActiveView');

      cy.addFeedByApi({
        title: 'Kent C. Dodds Blog',
        url: getFeedUrl('kentcdodds.xml'),
        icon: 'Code',
        refreshInterval: 120,
      });

      cy.visit('/');
      cy.openDrawerIfExists();
      cy.getBySel('collection-id-1').click();
      cy.wait('@apiPreferencesActiveView').then(({ request, response }) => {
        expect(request.body).to.deep.eq({
          activeView: 'collection',
          activeCollectionId: 1,
        });
        expect(response.statusCode).to.eq(200);
      });
    });

    it('clicking on feed shows feed items', () => {
      cy.addFeedByApi({
        title: 'Kent C. Dodds Blog',
        url: getFeedUrl('kentcdodds.xml'),
        icon: 'Code',
        refreshInterval: 120,
      });

      cy.visit('/');
      cy.openDrawerIfExists();
      cy.getBySel('collection-id-1').click();
      cy.url().should('equal', `${baseUrl}/`);
      cy.getBySel('collectionItemList')
        .within(() => {
          cy.getBySel('item-id-1')
            .within(() => {
              cy.getBySel('title').should(
                'have.text',
                "Remix: The Yang to React's Yin"
              );
            })
            .should('exist');

          cy.getBySel('item-id-2')
            .within(() => {
              cy.getBySel('title').should(
                'have.text',
                'How I help you build better websites'
              );
            })
            .should('exist');

          cy.getBySel('item-id-3')
            .within(() => {
              cy.getBySel('title').should('have.text', 'Why I Love Remix');
            })
            .should('exist');
        })
        .should('exist');
    });

    it('clicking on feed item opens it', () => {
      cy.addFeedByApi({
        title: 'Kent C. Dodds Blog',
        url: getFeedUrl('kentcdodds.xml'),
        icon: 'Code',
        refreshInterval: 120,
      });

      cy.visit('/');
      cy.openDrawerIfExists();
      cy.getBySel('collection-id-1').click();
      cy.getBySel('item-id-1').click();
      cy.url().should('equal', `${baseUrl}/collection/1/article/1`);
      cy.openDrawerIfExists();
      cy.getBySel('collection-id-1').within(() => {
        cy.getBySel('badge').should('exist').and('have.text', '2');
      });
      cy.getBySel('panesDesktop').within(() => {
        cy.getBySel('articleHeader').should(
          'have.text',
          "Remix: The Yang to React's Yin"
        );
      });
    });
  });
});
