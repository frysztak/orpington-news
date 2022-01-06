import { useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

const getNameAndMessage = (error: any): [string, string] => {
  if ('json' in error) {
    // API errors
    return ['Error', error.json.message ?? 'Unknown error'];
  } else if (error instanceof Error) {
    // fetch errors
    return [error.name, error.message];
  } else {
    return ['Error', 'Unexpected error'];
  }
};

export const useHandleError = () => {
  const toast = useToast();
  const onError = useCallback(
    (error: any) => {
      const [title, description] = getNameAndMessage(error);

      toast({
        title,
        description,
        status: 'error',
      });
    },
    [toast]
  );

  return { onError };
};
