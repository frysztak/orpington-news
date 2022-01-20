import { useMemo } from 'react';
import wretch from 'wretch';
import getConfig from 'next/config';
import { useHandleUnauthorized } from './useHandleUnauthorized';

const { publicRuntimeConfig } = getConfig();

export const makeApi = () =>
  wretch()
    .url(`${publicRuntimeConfig.API_URL}`)
    .options({ credentials: 'include', mode: 'cors' })
    .errorType('json');

export const api = makeApi();

export const useApi = () => {
  const { onUnauthorized } = useHandleUnauthorized();

  return useMemo(
    () => makeApi().catcher(401, onUnauthorized),
    [onUnauthorized]
  );
};

export * from './useHandleError';
export * from './collections';
export * from './collectionItem';
