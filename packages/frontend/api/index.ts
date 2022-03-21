import { useMemo } from 'react';
import wretch from 'wretch';
import getConfig from 'next/config';
import { useHandleUnauthorized } from './useHandleUnauthorized';

export const getUrls = () => {
  const { publicRuntimeConfig } = getConfig();
  if (!publicRuntimeConfig?.APP_URL) {
    console.error(`APP_URL is not set!`);
  }

  const appUrl: string | undefined = publicRuntimeConfig?.APP_URL;
  const apiUrl: string =
    publicRuntimeConfig?.API_URL ??
    (appUrl ? new URL('/api', appUrl).toString() : '/api');
  const ssrApiUrl: string = publicRuntimeConfig?.API_SSR_URL ?? apiUrl;

  return { appUrl, apiUrl, ssrApiUrl };
};

export const makeApi = (url: string) =>
  wretch()
    .url(url)
    .options({ credentials: 'include', mode: 'cors' })
    .errorType('json');

export const ssrApi = () => {
  const { ssrApiUrl } = getUrls();
  return makeApi(ssrApiUrl);
};

export const useApi = () => {
  const onUnauthorized = useHandleUnauthorized();
  const { apiUrl } = useMemo(() => getUrls(), []);

  return useMemo(
    () => makeApi(apiUrl).catcher(401, onUnauthorized),
    [apiUrl, onUnauthorized]
  );
};

export * from './ApiContext';
export * from './useHandleError';
export * from './collections';
export * from './collectionItem';
export * from './preferences';
