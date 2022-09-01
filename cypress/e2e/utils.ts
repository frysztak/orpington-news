import { join } from 'path';

export const getApiPath = (endpoint: string): string => {
  return join(Cypress.env('api_url'), endpoint);
};

export const getFeedUrl = (filename: string): string => {
  return new URL(filename, Cypress.env('feeds_url')).toString();
};
