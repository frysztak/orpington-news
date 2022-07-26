/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    getBySel(
      dataTestAttribute: string,
      args?: any
    ): Chainable<JQuery<HTMLElement>>;

    getBySelLike(
      dataTestPrefixAttribute: string,
      args?: any
    ): Chainable<JQuery<HTMLElement>>;

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

    //       login(email: string, password: string): Chainable<void>
    //       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
    //       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
    //       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
  }
}
