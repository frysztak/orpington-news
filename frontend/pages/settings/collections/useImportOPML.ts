import { importOPML, useApi, useHandleError } from '@api';
import { useToast } from '@chakra-ui/react';
import { collectionKeys } from '@features';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useImportOPML = () => {
  const toast = useToast();
  const api = useApi();
  const { onError } = useHandleError();
  const queryClient = useQueryClient();

  return useMutation((files: File[]) => importOPML(api, files[0]), {
    onError,
    onSuccess: (data) => {
      queryClient.setQueryData(collectionKeys.tree, data);
      toast({
        status: 'success',
        description: 'Import successful!',
        isClosable: true,
      });
    },
  });
};
