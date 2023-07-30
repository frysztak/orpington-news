import { getApiPath, getFeedUrl } from './utils';

const sizes = ['macbook-13', 'iphone-6'];

sizes.forEach((size) => {
  describe(`article page, size '${size}'`, () => {
    const baseUrl = Cypress.config('baseUrl');

    beforeEach(() => {
      cy.viewport(size as any);
      cy.signupByApi('end2end', 'end2endpass', 'E2E').loginByApi(
        'end2end',
        'end2endpass'
      );
    });

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
  });
});
