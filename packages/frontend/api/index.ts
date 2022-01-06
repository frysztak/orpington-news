import { useMemo } from 'react';
import wretch from 'wretch';
import { useHandleUnauthorized } from './useHandleUnauthorized';

export const useApi = () => {
  const { onUnauthorized } = useHandleUnauthorized();

  return useMemo(
    () =>
      wretch()
        .url(`${process.env.NEXT_PUBLIC_API_URL}`)
        .options({ credentials: 'include', mode: 'cors' })
        .catcher(401, onUnauthorized)
        .errorType('json'),
    [onUnauthorized]
  );
};

export * from './useHandleError';
