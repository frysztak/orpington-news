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
      cy.getBySel('addCollectionModal').should('not.exist');

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
          activeCollectionLayout: 'card',
          activeCollectionTitle: 'Kent C. Dodds Blog',
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
      cy.intercept({
        method: 'GET',
        url: getApiPath('/collections/1/items?pageIndex=0'),
      }).as('apiGetItems');
      cy.intercept({
        method: 'GET',
        url: getApiPath('/collections/1/item/1'),
      }).as('apiGetArticle');

      cy.visit('/');
      cy.openDrawerIfExists();
      cy.getBySel('collection-id-1').click();
      cy.wait('@apiGetItems');
      cy.getBySel('item-id-1').click();
      cy.url().should('equal', `${baseUrl}/collection/1/article/1`);
      cy.wait('@apiGetArticle');

      cy.getBySelVisible('articleHeader').should(
        'have.text',
        "Remix: The Yang to React's Yin"
      );

      cy.clickGoBackIfExists();
      if (size.includes('iphone')) {
        cy.url().should('equal', `${baseUrl}/`);
      }
      cy.getBySel('collectionItemList').should('exist').and('be.visible');
      cy.openDrawerIfExists();
      cy.getBySel('collection-id-1').within(() => {
        cy.getBySel('badge').should('exist').and('have.text', '2');
      });
    });

    describe('mark feed as read', () => {
      it('from sidebar', () => {
        cy.intercept({
          method: 'POST',
          url: getApiPath('/collections/1/markAsRead'),
        }).as('apiMarkAsRead');

        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });

        cy.visit('/');

        // all unread
        cy.getBySel('collectionItemList').within((itemList) => {
          cy.wrap(itemList).getUnreadItems().should('have.length', 3);
        });

        cy.openDrawerIfExists();
        // make collection active
        cy.clickCollection('1');
        cy.openDrawerIfExists();
        // mark as read
        cy.clickSidebarAction('1', 'markAsRead');
        cy.closeDrawerIfExists();
        cy.wait('@apiMarkAsRead').then(({ request, response }) => {
          expect(response.statusCode).to.eq(200);
        });

        cy.openDrawerIfExists();
        cy.getBySel('collection-id-1').within(() => {
          cy.getBySel('badge').should('not.exist');
        });

        cy.getBySel('collectionItemList').within((itemList) => {
          cy.wrap(itemList).getReadItems().should('have.length', 3);
        });
      });

      it('from collection header', () => {
        cy.intercept({
          method: 'GET',
          url: getApiPath('/collections/1/items?pageIndex=0'),
        }).as('apiGetItems');

        cy.intercept({
          method: 'POST',
          url: getApiPath('/collections/1/markAsRead'),
        }).as('apiMarkAsRead');

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

        // all unread
        cy.getBySel('collectionItemList').within((itemList) => {
          cy.wrap(itemList).getUnreadItems().should('have.length', 3);
        });

        // make collection active
        cy.openDrawerIfExists();
        cy.clickCollection('1');
        cy.wait('@apiPreferencesActiveView');
        cy.wait('@apiGetItems');
        // mark as read
        cy.clickCollectionHeaderMenuAction('markAsRead');

        cy.wait('@apiMarkAsRead').then(({ request, response }) => {
          expect(response.statusCode).to.eq(200);
        });

        cy.openDrawerIfExists();
        cy.getBySel('collection-id-1').within(() => {
          cy.getBySel('badge').should('not.exist');
        });

        cy.getBySel('collectionItemList').within((itemList) => {
          cy.wrap(itemList).getReadItems().should('have.length', 3);
        });
      });

      it('from sidebar, while on home page', () => {
        cy.intercept({
          method: 'POST',
          url: getApiPath('/collections/1/markAsRead'),
        }).as('apiMarkAsRead');

        cy.intercept({
          method: 'GET',
          url: getApiPath('/collections/home/items?pageIndex=0'),
        }).as('apiGetHomeItems');

        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });

        cy.visit('/');

        // all unread
        cy.getBySel('collectionItemList').within((itemList) => {
          cy.wrap(itemList).getUnreadItems().should('have.length', 3);
        });

        cy.openDrawerIfExists();
        // mark as read
        cy.clickSidebarAction('1', 'markAsRead');
        cy.closeDrawerIfExists();
        cy.wait('@apiMarkAsRead').then(({ request, response }) => {
          expect(response.statusCode).to.eq(200);
        });

        cy.wait('@apiGetHomeItems').then(({ request, response }) => {
          expect(response.statusCode).to.eq(200);
        });

        cy.openDrawerIfExists();
        cy.getBySel('collection-id-1').within(() => {
          cy.getBySel('badge').should('not.exist');
        });

        cy.getBySel('collectionItemList').within((itemList) => {
          cy.wrap(itemList).getReadItems().should('have.length', 3);
        });
      });

      it('from collection header, while on home page', () => {
        cy.intercept({
          method: 'POST',
          url: getApiPath('/collections/home/markAsRead'),
        }).as('apiMarkAsRead');
        cy.intercept({
          method: 'GET',
          url: getApiPath('/collections/home/items?pageIndex=0'),
        }).as('apiGetHomeItems');

        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });

        cy.visit('/');

        // all unread
        cy.getBySel('collectionItemList').within((itemList) => {
          cy.wrap(itemList).getUnreadItems().should('have.length', 3);
        });

        // mark as read
        cy.clickCollectionHeaderMenuAction('markAsRead');

        cy.wait('@apiMarkAsRead').then(({ request, response }) => {
          expect(response.statusCode).to.eq(200);
        });

        cy.wait('@apiGetHomeItems').then(({ request, response }) => {
          expect(response.statusCode).to.eq(200);
        });

        cy.openDrawerIfExists();
        cy.getBySel('collection-id-1').within(() => {
          cy.getBySel('badge').should('not.exist');
        });

        cy.getBySel('collectionItemList').within((itemList) => {
          cy.wrap(itemList).getReadItems().should('have.length', 3);
        });
      });
    });

    describe('change collection layout', () => {
      it('home collection', () => {
        cy.intercept({
          method: 'PUT',
          url: getApiPath('/collections/home/layout'),
        }).as('apiPutLayout');

        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });

        cy.visit('/');

        cy.get(`[data-test-layout=card]`).should('exist').and('be.visible');

        cy.clickCollectionHeaderLayout('magazine');

        cy.wait('@apiPutLayout');

        cy.get(`[data-test-layout=magazine]`).should('exist').and('be.visible');
        cy.get(`[data-test-layout=card]`).should('not.exist');
      });

      it('other collection', () => {
        cy.intercept({
          method: 'GET',
          url: getApiPath('/collections/1/items?pageIndex=0'),
        }).as('apiGetItems');

        cy.intercept({
          method: 'PUT',
          url: getApiPath('/collections/1/layout'),
        }).as('apiPutLayout');

        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });

        cy.visit('/');

        // make collection active
        cy.openDrawerIfExists();
        cy.clickCollection('1');
        cy.wait('@apiGetItems');

        cy.get(`[data-test-layout=card]`).should('exist').and('be.visible');

        cy.clickCollectionHeaderLayout('magazine');

        cy.wait('@apiPutLayout');

        cy.get(`[data-test-layout=magazine]`).should('exist').and('be.visible');
        cy.get(`[data-test-layout=card]`).should('not.exist');
      });
    });
  });
});
