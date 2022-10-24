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

    //       login(email: string, password: string): Chainable<void>
    //       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
    //       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
    //       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
  }
}
