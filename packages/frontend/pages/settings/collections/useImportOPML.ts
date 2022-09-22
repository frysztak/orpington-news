import { importOPML, useApi, useHandleError } from '@api';
import { useToast } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';

export const useImportOPML = () => {
  const toast = useToast();
  const api = useApi();
  const { onError } = useHandleError();
  return useMutation((files: File[]) => importOPML(api, files[0]), {
    onError,
    onSuccess: () => {
      toast({
        status: 'success',
        description: 'Import successful!',
        isClosable: true,
      });
    },
  });
};
