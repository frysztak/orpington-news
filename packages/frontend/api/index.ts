import { useMemo } from 'react';
import wretch from 'wretch';
import getConfig from 'next/config';
import { useHandleUnauthorized } from './useHandleUnauthorized';

const { publicRuntimeConfig } = getConfig();
if (!publicRuntimeConfig.APP_URL && !publicRuntimeConfig.API_URL) {
  console.warn(`Neither APP_URL nor API_URL are defined!`);
}

const appUrl = publicRuntimeConfig.APP_URL;
const apiUrl =
  publicRuntimeConfig.API_URL ?? new URL('/api', appUrl).toString();
const ssrApiUrl = publicRuntimeConfig.API_SSR_URL ?? apiUrl;

export const makeApi = (url: string = apiUrl) =>
  wretch()
    .url(url)
    .options({ credentials: 'include', mode: 'cors' })
    .errorType('json');

export const api = makeApi();
export const ssrApi = makeApi(ssrApiUrl);

export const useApi = () => {
  const onUnauthorized = useHandleUnauthorized();

  return useMemo(
    () => makeApi().catcher(401, onUnauthorized),
    [onUnauthorized]
  );
};

export const sseUrl = `${apiUrl}/events`;

export * from './ApiContext';
export * from './useHandleError';
export * from './collections';
export * from './collectionItem';
export * from './preferences';
