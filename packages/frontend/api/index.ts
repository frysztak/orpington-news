import { useMemo } from 'react';
import wretch from 'wretch';
import { useHandleUnauthorized } from './useHandleUnauthorized';

export const makeApi = () =>
  wretch()
    .url(`${process.env.NEXT_PUBLIC_API_URL}`)
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
