import urlJoin from 'url-join';

export const getApiPath = (endpoint: string): string => {
  return urlJoin(Cypress.env('api_url'), endpoint);
};

export const getFeedUrl = (filename: string): string => {
  return urlJoin(Cypress.env('feeds_url'), 'feed', filename);
};
