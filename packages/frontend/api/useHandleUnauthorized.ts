import { useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import type { Wretcher, WretcherError } from 'wretch';

const toastId = 'unauthorized';

export const useHandleUnauthorized = () => {
  const router = useRouter();
  const toast = useToast();

  const onUnauthorized = useCallback(
    (error: WretcherError, req: Wretcher) => {
      router.push('/login');
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: 'Unauthorized',
          description: 'Please sign in.',
          status: 'info',
        });
      }

      throw error;
    },
    [router, toast]
  );

  return onUnauthorized;
};
