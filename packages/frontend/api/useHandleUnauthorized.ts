import { useCallback } from 'react';
import { useRouter } from 'next/router';
import type { WretchError } from 'wretch';

export const useHandleUnauthorized = (
  setShowAppContent: (value: boolean) => void
) => {
  const router = useRouter();

  const onUnauthorized = useCallback(
    (error: WretchError) => {
      if (router.pathname !== '/signup') {
        router.push('/login').then((finished) => {
          setShowAppContent(finished);
        });
      } else {
        setShowAppContent(true);
      }

      throw error;
    },
    [router, setShowAppContent]
  );

  return onUnauthorized;
};
