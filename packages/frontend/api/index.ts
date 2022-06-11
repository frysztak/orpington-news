import { useMemo } from 'react';
import wretch from 'wretch';
import { useHandleUnauthorized } from './useHandleUnauthorized';

export const getUrls = () => {
  const apiUrl: string = process.env.NEXT_PUBLIC_API_URL ?? '/api';
  const ssrApiUrl: string = apiUrl;

  return { apiUrl, ssrApiUrl };
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
export * from './auth';
export * from './collections';
export * from './preferences';
