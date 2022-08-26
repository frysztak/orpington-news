import { useCallback } from 'react';
import { useRouter } from 'next/router';
import type { WretchError } from 'wretch';

export const useHandleUnauthorized = () => {
  const router = useRouter();

  const onUnauthorized = useCallback(
    (error: WretchError) => {
      if (router.pathname !== '/signup') {
        router.push('/login');
      }

      throw error;
    },
    [router]
  );

  return onUnauthorized;
};
