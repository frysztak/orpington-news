import { join } from 'path';

export const getApiPath = (endpoint: string): string => {
  return join(Cypress.env('api_url'), endpoint);
};
