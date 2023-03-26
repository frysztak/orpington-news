import { getApiPath } from './utils';

const sizes = ['macbook-13'];

sizes.forEach((size) => {
  describe(`OPML import, size '${size}'`, () => {
    beforeEach(() => {
      cy.viewport(size as any);
      cy.signupByApi('end2end', 'end2endpass', 'E2E').loginByApi(
        'end2end',
        'end2endpass'
      );
    });

    it('succeeds for valid OPML file', () => {
      cy.intercept({
        method: 'POST',
        url: getApiPath('/collections/import/opml'),
      }).as('apiImportOPML');

      cy.fixture('opml/valid.xml')
        .then((xml: string) => {
          return xml.replaceAll('{{baseUrl}}', Cypress.env('feeds_url'));
        })
        .as('opmlFile');

      cy.visit('/settings/collections/import');
      cy.getBySelVisible('fileDropzoneContainer').within(() => {
        cy.getBySel('fileDropzoneInput').selectFile(
          {
            contents: '@opmlFile',
            fileName: 'feeds.xml',
            mimeType: 'text/xml',
          },
          { force: true }
        );
      });

      cy.wait('@apiImportOPML').its('response.statusCode').should('eq', 200);

      cy.visit('/');
      cy.expandCollection('2').expandCollection('3');

      cy.openDrawerIfExists();
      cy.getBySel('collection-id-2')
        .within(() => {
          cy.getBySel('title')
            .should('exist')
            .and('have.text', 'OPML Import Test');
          cy.getBySel('badge').should('exist').and('have.text', '6');
        })
        .should('exist');

      cy.getBySel('collection-id-3')
        .within(() => {
          cy.getBySel('title').should('exist').and('have.text', 'Parent');
          cy.getBySel('badge').should('exist').and('have.text', '6');
        })
        .should('exist');

      cy.getBySel('collection-id-4')
        .within(() => {
          cy.getBySel('title').should('exist').and('have.text', 'Fettblog');
          cy.getBySel('badge').should('exist').and('have.text', '3');
        })
        .should('exist');

      cy.getBySel('collection-id-5')
        .within(() => {
          cy.getBySel('title')
            .should('exist')
            .and('have.text', 'Kent C. Dodds');
          cy.getBySel('badge').should('exist').and('have.text', '3');
        })
        .should('exist');

      cy.closeDrawerIfExists();
    });

    it('returns an error for invalid OPML file', () => {
      cy.intercept({
        method: 'POST',
        url: getApiPath('/collections/import/opml'),
      }).as('apiImportOPML');

      cy.fixture('opml/invalid.xml').as('opmlFile');

      cy.visit('/settings/collections/import');
      cy.getBySelVisible('fileDropzoneContainer').within(() => {
        cy.getBySel('fileDropzoneInput').selectFile(
          {
            contents: '@opmlFile',
            fileName: 'feeds.xml',
            mimeType: 'text/xml',
          },
          { force: true }
        );
      });

      cy.wait('@apiImportOPML').its('response.statusCode').should('eq', 500);
    });

    it("doesn't add feeds with invalid URLs", () => {
      cy.intercept({
        method: 'POST',
        url: getApiPath('/collections/import/opml'),
      }).as('apiImportOPML');

      // purposefully don't replace `{{baseUrl}}`
      cy.fixture('opml/valid.xml').as('opmlFile');

      cy.visit('/settings/collections/import');
      cy.getBySelVisible('fileDropzoneContainer').within(() => {
        cy.getBySel('fileDropzoneInput').selectFile(
          {
            contents: '@opmlFile',
            fileName: 'feeds.xml',
            mimeType: 'text/xml',
          },
          { force: true }
        );
      });

      cy.wait('@apiImportOPML').its('response.statusCode').should('eq', 200);

      cy.visit('/');
      cy.openDrawerIfExists();
      cy.expandCollection('2');

      cy.getBySel('collection-id-2')
        .within(() => {
          cy.getBySel('title')
            .should('exist')
            .and('have.text', 'OPML Import Test');
          cy.getBySel('badge').should('not.exist');
        })
        .should('exist');

      cy.getBySel('collection-id-3')
        .within(() => {
          cy.getBySel('title').should('exist').and('have.text', 'Parent');
          cy.getBySel('badge').should('not.exist');
        })
        .should('exist');

      cy.getBySelVisible('thisFeedHasNoItems').should('exist');
    });
  });
});
