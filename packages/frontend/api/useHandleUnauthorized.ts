import { useCallback } from 'react';
import { useRouter } from 'next/router';
import type { Wretcher, WretcherError } from 'wretch';

export const useHandleUnauthorized = () => {
  const router = useRouter();

  const onUnauthorized = useCallback(
    (error: WretcherError, req: Wretcher) => {
      if (router.pathname !== '/signup') {
        router.push('/login');
      }

      throw error;
    },
    [router]
  );

  return onUnauthorized;
};
