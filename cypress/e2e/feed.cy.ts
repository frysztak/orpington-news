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

    describe('add collection modal', () => {
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

        cy.getBySel('collectionIconButton').click();
        cy.getBySel('collectionIcon-React').click();
        cy.getBySel('addFeedButton').click();
        cy.wait('@apiCollections').its('response.statusCode').should('eq', 200);
        cy.getBySel('addCollectionModal').should('not.exist');

        cy.getBySel('collection-id-2')
          .within(() => {
            cy.getBySel('title').should('have.text', 'Kent C. Dodds Blog');
            cy.getBySel('chevron').should('not.exist');
            cy.getBySel('badge').should('exist').and('have.text', '3');
          })
          .should('exist');
      });

      it('can edit existing collection', () => {
        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });
        cy.intercept({
          method: 'PUT',
          url: getApiPath('/collections'),
        }).as('apiPutCollection');

        cy.visit('/');
        cy.openDrawerIfExists();
        cy.clickSidebarAction('2', 'edit');

        cy.getBySel('addCollectionModal').should('be.visible');
        cy.getBySel('feedName').clear().type('Kent').blur();

        cy.getBySel('addFeedButton').click();
        cy.wait('@apiPutCollection')
          .its('response.statusCode')
          .should('eq', 200);
        cy.getBySel('addCollectionModal').should('not.exist');

        cy.getBySel('collection-id-2')
          .within(() => {
            cy.getBySel('title').should('have.text', 'Kent');
            cy.getBySel('chevron').should('not.exist');
            cy.getBySel('badge').should('exist').and('have.text', '3');
          })
          .should('exist')
          .and('be.visible');
      });

      it('cannot set collection as its own parent', () => {
        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });
        cy.intercept({
          method: 'PUT',
          url: getApiPath('/collections'),
        }).as('apiPutCollection');

        cy.visit('/');
        cy.openDrawerIfExists();
        cy.clickSidebarAction('2', 'edit');

        cy.getBySel('addCollectionModal').should('be.visible');
        cy.get('.select-field__control').click();
        cy.get('.select-field__option').eq(1).click();

        cy.getBySel('addFeedButton').click();
        cy.wait('@apiPutCollection')
          .its('response.statusCode')
          .should('eq', 500);
      });

      it('can change parent collection', () => {
        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });
        cy.addFeedByApi({
          title: 'fettblog.eu',
          url: getFeedUrl('fettblog.xml'),
          icon: 'Code',
          refreshInterval: 120,
          parentId: 2,
        });

        cy.intercept({
          method: 'PUT',
          url: getApiPath('/collections'),
        }).as('apiPutCollection');

        cy.visit('/');
        cy.openDrawerIfExists();
        cy.clickSidebarAction('3', 'edit');

        cy.getBySel('addCollectionModal').should('be.visible');
        cy.get('.select-field__control').click();
        cy.get('.select-field__option').eq(0).click();

        cy.getBySel('addFeedButton').click();
        cy.wait('@apiPutCollection')
          .its('response.statusCode')
          .should('eq', 200);
      });
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
      cy.getBySel('collection-id-2').click();
      cy.wait('@apiPreferencesActiveView').then(({ request, response }) => {
        expect(request.body).to.deep.eq({
          activeCollectionId: 2,
          activeCollectionLayout: 'card',
          activeCollectionTitle: 'Kent C. Dodds Blog',
          activeCollectionFilter: 'all',
          activeCollectionGrouping: 'none',
          activeCollectionSortBy: 'newestFirst',
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
      cy.getBySel('collection-id-2').click();
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
        url: getApiPath(
          '/collections/2/items?pageIndex=0&filter=all&grouping=none&sortBy=newestFirst'
        ),
      }).as('apiGetItems');
      cy.intercept({
        method: 'GET',
        url: getApiPath('/collections/2/item/1'),
      }).as('apiGetArticle');

      cy.visit('/');
      cy.openDrawerIfExists();
      cy.getBySel('collection-id-2').click();
      cy.wait('@apiGetItems');
      cy.getBySel('item-id-1').click();
      cy.url().should('equal', `${baseUrl}/collection/2/article/1`);
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
      cy.getBySel('collection-id-2').within(() => {
        cy.getBySel('badge').should('exist').and('have.text', '2');
      });
    });

    describe('mark feed as read', () => {
      it('from sidebar', () => {
        cy.intercept({
          method: 'POST',
          url: getApiPath('/collections/2/markAsRead'),
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
        cy.clickCollection('2');
        cy.openDrawerIfExists();
        // mark as read
        cy.clickSidebarAction('2', 'markAsRead');
        cy.wait('@apiMarkAsRead').then(({ request, response }) => {
          expect(response.statusCode).to.eq(200);
        });

        cy.getBySel('collection-id-2').within(() => {
          cy.getBySel('badge').should('not.exist');
        });

        cy.getBySel('collectionItemList').within((itemList) => {
          cy.wrap(itemList).getReadItems().should('have.length', 3);
        });
      });

      it('from collection header', () => {
        cy.intercept({
          method: 'GET',
          url: getApiPath(
            '/collections/2/items?pageIndex=0&filter=all&grouping=none&sortBy=newestFirst'
          ),
        }).as('apiGetItems');

        cy.intercept({
          method: 'POST',
          url: getApiPath('/collections/2/markAsRead'),
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
        cy.clickCollection('2');
        cy.wait('@apiPreferencesActiveView');
        cy.wait('@apiGetItems');
        // mark as read
        cy.clickCollectionHeaderMenuAction('markAsRead');

        cy.wait('@apiMarkAsRead').then(({ request, response }) => {
          expect(response.statusCode).to.eq(200);
        });

        cy.openDrawerIfExists();
        cy.getBySel('collection-id-2').within(() => {
          cy.getBySel('badge').should('not.exist');
        });

        cy.getBySel('collectionItemList').within((itemList) => {
          cy.wrap(itemList).getReadItems().should('have.length', 3);
        });
      });

      it('from sidebar, while on home page', () => {
        cy.intercept({
          method: 'POST',
          url: getApiPath('/collections/2/markAsRead'),
        }).as('apiMarkAsRead');

        cy.intercept({
          method: 'GET',
          url: getApiPath(
            '/collections/1/items?pageIndex=0&filter=all&grouping=none&sortBy=newestFirst'
          ),
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
        cy.clickSidebarAction('2', 'markAsRead');
        cy.wait('@apiMarkAsRead').then(({ request, response }) => {
          expect(response.statusCode).to.eq(200);
        });

        cy.wait('@apiGetHomeItems').then(({ request, response }) => {
          expect(response.statusCode).to.eq(200);
        });

        cy.getBySel('collection-id-2').within(() => {
          cy.getBySel('badge').should('not.exist');
        });

        cy.getBySel('collectionItemList').within((itemList) => {
          cy.wrap(itemList).getReadItems().should('have.length', 3);
        });
      });

      it('from collection header, while on home page', () => {
        cy.intercept({
          method: 'POST',
          url: getApiPath('/collections/1/markAsRead'),
        }).as('apiMarkAsRead');
        cy.intercept({
          method: 'GET',
          url: getApiPath(
            '/collections/1/items?pageIndex=0&filter=all&grouping=none&sortBy=newestFirst'
          ),
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
        cy.getBySel('collection-id-2').within(() => {
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
          url: getApiPath('/collections/1/preferences'),
        }).as('apiPutPreferences');

        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });

        cy.visit('/');

        cy.get(`[data-test-layout=card]`).should('exist').and('be.visible');

        cy.clickCollectionHeaderLayout('magazine');

        cy.wait('@apiPutPreferences');

        cy.get(`[data-test-layout=magazine]`).should('exist').and('be.visible');
        cy.get(`[data-test-layout=card]`).should('not.exist');
      });

      describe('other collection', () => {
        ['magazine', 'list'].forEach((layout) => {
          it(`to ${layout}`, () => {
            cy.intercept({
              method: 'GET',
              url: getApiPath(
                '/collections/2/items?pageIndex=0&filter=all&grouping=none&sortBy=newestFirst'
              ),
            }).as('apiGetItems');

            cy.intercept({
              method: 'PUT',
              url: getApiPath('/collections/2/preferences'),
            }).as('apiPutPreferences');
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

            // make collection active
            cy.openDrawerIfExists();
            cy.clickCollection('2');
            cy.wait('@apiPreferencesActiveView');
            cy.wait('@apiGetItems');

            cy.get(`[data-test-layout=card]`).should('exist').and('be.visible');

            cy.clickCollectionHeaderLayout(layout);

            cy.wait('@apiPutPreferences');

            cy.get(`[data-test-layout=${layout}]`)
              .should('exist')
              .and('be.visible');
            cy.get(`[data-test-layout=card]`).should('not.exist');
          });
        });
      });
    });

    if (size.includes('macbook')) {
      describe('change panes layout', () => {
        beforeEach(() => {
          cy.addFeedByApi({
            title: 'Kent C. Dodds Blog',
            url: getFeedUrl('kentcdodds.xml'),
            icon: 'Code',
            refreshInterval: 120,
          });
        });

        ['vertical', 'expandable'].forEach((layout) => {
          it(`to ${layout}`, () => {
            cy.visit('/');
            cy.clickCollectionHeaderLayout(layout);
            cy.get(`[data-test-layout=${layout}]`)
              .should('exist')
              .and('be.visible');
          });
        });
      });
    }

    describe('remove collection', () => {
      it('inactive collection', () => {
        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });

        cy.visit('/');

        cy.openDrawerIfExists();
        cy.clickSidebarAction('2', 'delete');

        cy.intercept({
          method: 'DELETE',
          url: getApiPath('/collections/2'),
        }).as('apiDeleteCollection');
        cy.intercept({
          method: 'GET',
          url: getApiPath(
            `/collections/1/items?pageIndex=0&filter=all&grouping=none&sortBy=newestFirst`
          ),
        }).as('apiGetHomeItems');

        cy.getBySel('confirmDelete').click();
        cy.closeDrawerIfExists();

        cy.wait('@apiDeleteCollection').then(({ response }) => {
          expect(response.body).to.deep.eq({
            navigateHome: false,
            ids: [2],
          });
          expect(response.statusCode).to.eq(200);
        });

        cy.wait('@apiGetHomeItems').then(({ response }) => {
          expect(response.body).to.deep.eq([]);
        });

        cy.getBySelVisible('thereAreNoFeedsYet');
        cy.getBySelVisible('thisFeedHasNoItems');
      });

      it('active collection', () => {
        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });

        cy.visit('/');
        cy.changeActiveCollection('2');

        cy.openDrawerIfExists();
        cy.clickSidebarAction('2', 'delete');

        cy.intercept({
          method: 'DELETE',
          url: getApiPath('/collections/2'),
        }).as('apiDeleteCollection');
        cy.intercept({
          method: 'GET',
          url: getApiPath(
            `/collections/1/items?pageIndex=0&filter=all&grouping=none&sortBy=newestFirst`
          ),
        }).as('apiGetHomeItems');
        cy.intercept({
          method: 'PUT',
          url: getApiPath('/preferences/activeView'),
        }).as('apiPreferencesActiveView');

        cy.getBySel('confirmDelete').click();
        cy.closeDrawerIfExists();

        cy.wait('@apiDeleteCollection').then(({ response }) => {
          expect(response.body).to.deep.eq({
            navigateHome: true,
            ids: [2],
          });
          expect(response.statusCode).to.eq(200);
        });

        cy.wait('@apiPreferencesActiveView').then(({ request, response }) => {
          expect(request.body).to.deep.eq({
            activeCollectionId: 1,
            activeCollectionTitle: 'Home',
            activeCollectionFilter: 'all',
            activeCollectionGrouping: 'none',
            activeCollectionLayout: 'card',
            activeCollectionSortBy: 'newestFirst',
          });
          expect(response.statusCode).to.eq(200);
        });

        cy.wait('@apiGetHomeItems').then(({ response }) => {
          expect(response.body).to.deep.eq([]);
        });

        cy.getBySelVisible('thereAreNoFeedsYet');
        cy.getBySelVisible('thisFeedHasNoItems');
      });

      it('with children', () => {
        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });
        cy.addFeedByApi({
          title: 'fettblog.eu',
          url: getFeedUrl('fettblog.xml'),
          icon: 'Code',
          refreshInterval: 120,
          parentId: 2,
        });

        cy.visit('/');

        cy.openDrawerIfExists();
        cy.clickSidebarAction('2', 'delete');

        cy.intercept({
          method: 'DELETE',
          url: getApiPath('/collections/2'),
        }).as('apiDeleteCollection');
        cy.intercept({
          method: 'GET',
          url: getApiPath(
            `/collections/1/items?pageIndex=0&filter=all&grouping=none&sortBy=newestFirst`
          ),
        }).as('apiGetHomeItems');

        cy.getBySel('confirmDelete').click();
        cy.closeDrawerIfExists();

        cy.wait('@apiDeleteCollection').then(({ response }) => {
          expect(response.body).to.deep.eq({
            navigateHome: false,
            ids: [2, 3],
          });
          expect(response.statusCode).to.eq(200);
        });

        cy.wait('@apiGetHomeItems').then(({ response }) => {
          expect(response.body).to.deep.eq([]);
        });

        cy.getBySelVisible('thereAreNoFeedsYet');
        cy.getBySelVisible('thisFeedHasNoItems');
      });
    });

    describe('filters', () => {
      it('remembers filter per collection', () => {
        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });
        cy.putCollectionPreferencesByApi({
          collectionId: 2,
          preferences: { filter: 'unread' },
        });
        cy.putDateReadByApi({
          collectionId: 2,
          articleId: 1,
          dateRead: 1667491521,
        });
        cy.putDateReadByApi({
          collectionId: 2,
          articleId: 2,
          dateRead: 1667491521,
        });

        cy.addFeedByApi({
          title: 'fettblog.eu',
          url: getFeedUrl('fettblog.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });
        cy.putCollectionPreferencesByApi({
          collectionId: 3,
          preferences: { filter: 'read' },
        });

        cy.intercept({
          method: 'GET',
          url: getApiPath(
            `/collections/2/items?pageIndex=0&filter=unread&grouping=none&sortBy=newestFirst`
          ),
        }).as('apiGetItems2');
        cy.intercept({
          method: 'GET',
          url: getApiPath(
            `/collections/3/items?pageIndex=0&filter=read&grouping=none&sortBy=newestFirst`
          ),
        }).as('apiGetItems3');

        cy.visit('/');

        cy.openDrawerIfExists();
        cy.clickCollection('2');
        cy.wait('@apiGetItems2').then(({ response }) => {
          expect(response.body).to.have.length(1);
        });

        cy.openDrawerIfExists();
        cy.clickCollection('3');
        cy.wait('@apiGetItems3').then(({ response }) => {
          expect(response.body).to.have.length(0);
        });
      });
    });

    describe('grouping', () => {
      beforeEach(() => {
        cy.putCollectionPreferencesByApi({
          collectionId: 1,
          preferences: { layout: 'list' },
        });

        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });

        cy.addFeedByApi({
          title: 'fettblog.eu',
          url: getFeedUrl('fettblog.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });
      });

      it('by feed', () => {
        cy.intercept({
          method: 'GET',
          url: getApiPath(
            `/collections/1/items?pageIndex=0&filter=all&grouping=none&sortBy=newestFirst`
          ),
        }).as('apiGetItemsWithoutGrouping');

        cy.intercept({
          method: 'GET',
          url: getApiPath(
            `/collections/1/items?pageIndex=0&filter=all&grouping=feed&sortBy=newestFirst`
          ),
        }).as('apiGetItemsWithGrouping');

        cy.visit('/');
        cy.wait('@apiGetItemsWithoutGrouping');

        cy.clickCollectionHeaderMenuAction('grouping-feed');
        cy.wait('@apiGetItemsWithGrouping');

        cy.getBySel('groupHeader-fettblog.eu').should('be.visible');
        cy.getBySel('groupHeader-Kent C. Dodds Blog').should('be.visible');
      });

      describe('by date', () => {
        beforeEach(() => {
          cy.intercept({
            method: 'GET',
            url: getApiPath(
              `/collections/1/items?pageIndex=0&filter=all&grouping=none&sortBy=newestFirst`
            ),
          }).as('apiGetItemsWithoutGrouping');

          cy.intercept({
            method: 'GET',
            url: getApiPath(
              `/collections/1/items?pageIndex=0&filter=all&grouping=date&sortBy=newestFirst`
            ),
          }).as('apiGetItemsWithGrouping');
        });

        it('Today', () => {
          cy.clock(new Date(2022, 4, 11), ['Date']);
          cy.visit('/');
          cy.wait('@apiGetItemsWithoutGrouping');

          cy.clickCollectionHeaderMenuAction('grouping-date');
          cy.wait('@apiGetItemsWithGrouping');

          cy.getBySel('groupHeader-Today').should('be.visible');
          cy.getBySel('groupHeader-This week').should('be.visible');
          cy.getBySel('groupHeader-Last 30 days').should('be.visible');
          cy.getBySel('groupHeader-This year')
            .scrollIntoView()
            .should('be.visible');
          cy.getBySel('groupHeader-Lifetime ago').should('be.visible');
        });

        it('Yesterday', () => {
          cy.clock(new Date(2022, 4, 12), ['Date']);
          cy.visit('/');
          cy.wait('@apiGetItemsWithoutGrouping');

          cy.clickCollectionHeaderMenuAction('grouping-date');
          cy.wait('@apiGetItemsWithGrouping');

          cy.getBySel('groupHeader-Yesterday').should('be.visible');
          cy.getBySel('groupHeader-This week').should('be.visible');
          cy.getBySel('groupHeader-Last 30 days').should('be.visible');
          cy.getBySel('groupHeader-This year')
            .scrollIntoView()
            .should('be.visible');
          cy.getBySel('groupHeader-Lifetime ago').should('be.visible');
        });
      });
    });

    describe('sorting', () => {
      beforeEach(() => {
        cy.putCollectionPreferencesByApi({
          collectionId: 1,
          preferences: { layout: 'list' },
        });

        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });
      });

      it('oldest first', () => {
        cy.intercept({
          method: 'GET',
          url: getApiPath(
            `/collections/1/items?pageIndex=0&filter=all&grouping=none&sortBy=newestFirst`
          ),
        }).as('apiGetItems');

        cy.intercept({
          method: 'GET',
          url: getApiPath(
            `/collections/1/items?pageIndex=0&filter=all&grouping=none&sortBy=oldestFirst`
          ),
        }).as('apiGetItemsOldestFirst');

        cy.visit('/');
        cy.wait('@apiGetItems');

        cy.clickCollectionHeaderMenuAction('sortBy-oldestFirst');
        cy.wait('@apiGetItemsOldestFirst');

        cy.getBySel('collectionItemList')
          .within(() => {
            cy.get('[data-index=0]')
              .within(() => {
                cy.getBySelVisible('title').should(
                  'have.text',
                  'How I help you build better websites'
                );
              })
              .should('exist');

            cy.get('[data-index=1]')
              .within(() => {
                cy.getBySelVisible('title').should(
                  'have.text',
                  'Why I Love Remix'
                );
              })
              .should('exist');

            cy.get('[data-index=2]')
              .within(() => {
                cy.getBySelVisible('title').should(
                  'have.text',
                  "Remix: The Yang to React's Yin"
                );
              })
              .should('exist');
          })
          .should('exist');
      });
    });
  });
});
