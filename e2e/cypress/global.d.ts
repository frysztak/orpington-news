/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    getBySel(
      dataTestAttribute: string,
      args?: any
    ): Chainable<JQuery<HTMLElement>>;
    getBySelVisible(
      dataTestAttribute: string,
      args?: any
    ): Chainable<JQuery<HTMLElement>>;

    getBySelLike(
      dataTestPrefixAttribute: string,
      args?: any
    ): Chainable<JQuery<HTMLElement>>;

    openDrawerIfExists(): Chainable<JQuery<HTMLElement>>;
    closeDrawerIfExists(): Chainable<JQuery<HTMLElement>>;
    waitForDrawerToClose(): Chainable<JQuery<HTMLElement>>;

    getReadItems(): Chainable<JQuery<HTMLElement>>;
    getUnreadItems(): Chainable<JQuery<HTMLElement>>;

    clickCollection(id: string): Chainable<JQuery<HTMLElement>>;
    clickSidebarAction(
      collectionId: string,
      action: string
    ): Chainable<JQuery<HTMLElement>>;

    clickCollectionHeaderMenuAction(
      action: string
    ): Chainable<JQuery<HTMLElement>>;

    clickCollectionHeaderLayout(layout: string): Chainable<JQuery<HTMLElement>>;

    clickGoBackIfExists(): Chainable<JQuery<HTMLElement>>;

    changeActiveCollection(id: string): Chainable<JQuery<HTMLElement>>;

    expandCollection(id: string): Chainable<JQuery<HTMLElement>>;
    collapseCollection(id: string): Chainable<JQuery<HTMLElement>>;

    resetDatabaseByApi(): Chainable<Response<void>>;
    resetFeedPages(): Chainable<Response<void>>;

    /**
     * Signs user up by using API request
     */
    signupByApi(
      username: string,
      password: string,
      displayName: string
    ): Chainable<Response<void>>;

    /**
     * Logs-in user by using API request
     */
    loginByApi(username: string, password: string): Chainable<Response<void>>;

    /**
     * Add feed by API
     */
    addFeedByApi(data: {
      title: string;
      icon: string;
      url?: string;
      parentId?: number;
      description?: string;
      refreshInterval?: number;
      layout?: string;
    }): Chainable<Response<void>>;

    /**
     * Change date read by API
     */
    putDateReadByApi(data: {
      collectionId: number;
      articleId: number;
      dateRead: number | null;
    }): Chainable<Response<void>>;

    /**
     * Change collection preferences by API
     */
    putCollectionPreferencesByApi(data: {
      collectionId: number;
      preferences: object;
    }): Chainable<Response<void>>;
    
    /**
     * Set feed page by API
     */
     putFeedPageByApi(data: {
      feedName: string,
      page: number,
     }): Chainable<Response<void>>;
  }
}
