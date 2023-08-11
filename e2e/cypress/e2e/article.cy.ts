import { getApiPath, getFeedUrl } from './utils';

const sizes = ['macbook-13', 'iphone-6'];

sizes.forEach((size) => {
  const isDesktop = size.includes('macbook');

  context(`article page, size '${size}'`, () => {
    const baseUrl = Cypress.config('baseUrl');

    beforeEach(() => {
      cy.viewport(size as any);
      cy.signupByApi('end2end', 'end2endpass', 'E2E').loginByApi(
        'end2end',
        'end2endpass'
      );
    });

    context('standalone view', () => {
      it('opening article page by URL opens article in standalone view', () => {
        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });

        cy.visit('/collection/2/article/1');

        cy.get(`[data-test-layout=standaloneArticle]`)
          .should('exist')
          .and('be.visible');
      });

      it('opening non-existent article page by URL shows error view', () => {
        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });

        cy.visit('/collection/2/article/999');

        cy.get(`[data-test-layout=standaloneArticle]`)
          .should('exist')
          .and('be.visible');

        cy.getBySel('fetchError')
          .within(() => {
            cy.getBySel('fetchErrorText').should(
              'have.text',
              'Article not found.'
            );
          })
          .should('exist')
          .and('be.visible');
      });
    });

    context('navigation', () => {
      it('hotkeys/button navigation', () => {
        cy.addFeedByApi({
          title: 'Kent C. Dodds Blog',
          url: getFeedUrl('kentcdodds.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });
        cy.addFeedByApi({
          title: 'fettblog.eu',
          url: getFeedUrl('fettblog-overlapping.xml'),
          icon: 'Code',
          refreshInterval: 120,
        });

        cy.visit('/');
        cy.getBySelVisible('collectionItemList').within(() => {
          cy.getBySel('item-id-1').within(() => {
            cy.getBySelVisible('title').click();
          });
        });

        cy.getBySelVisible('articleHeader').should(
          'have.text',
          `Remix: The Yang to React's Yin`
        );
        if (isDesktop) {
          cy.get('body').type('k');
        } else {
          cy.getBySelVisible('prevArticle').should('be.disabled');
        }
        cy.getBySelVisible('articleHeader').should(
          'have.text',
          `Remix: The Yang to React's Yin`
        );

        if (isDesktop) {
          cy.get('body').type('j');
        } else {
          cy.getBySelVisible('nextArticle').click();
        }
        cy.getBySelVisible('articleHeader').should(
          'have.text',
          `10 years of fettblog.eu`
        );

        if (isDesktop) {
          cy.get('body').type('j');
        } else {
          cy.getBySelVisible('nextArticle').click();
        }
        cy.getBySelVisible('articleHeader').should(
          'have.text',
          `Why I Love Remix`
        );

        if (isDesktop) {
          cy.get('body').type('j');
        } else {
          cy.getBySelVisible('nextArticle').click();
        }
        cy.getBySelVisible('articleHeader').should(
          'have.text',
          `How I help you build better websites`
        );

        if (isDesktop) {
          cy.get('body').type('j');
        } else {
          cy.getBySelVisible('nextArticle').should('be.disabled');
        }
        cy.getBySelVisible('articleHeader').should(
          'have.text',
          `How I help you build better websites`
        );

        cy.get('body').type('{esc}');
        cy.getBySel('articleHeader').should('not.exist');
      });
    });
  });
});
