import { useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';

export const useHandleUnauthorized = () => {
  const router = useRouter();
  const toast = useToast();

  const onUnauthorized = useCallback(() => {
    router.push('/login');
    toast({
      title: 'Unauthorized',
      description: 'Please sign in.',
      status: 'info',
    });
  }, [router, toast]);

  return { onUnauthorized };
};
