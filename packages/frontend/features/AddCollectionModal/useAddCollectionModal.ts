import { useCallback, useState, useEffect } from 'react';
import { useDisclosure, useToast } from '@chakra-ui/react';
import { useCollectionsTree } from '@features/Panes/queries';
import { defaultIcon, emptyIfUndefined } from '@orpington-news/shared';
import { useSaveCollection, useVerifyFeedURL } from './queries';
import { AddCollectionFormData } from '@components/collection/add';

export const useAddCollectionModal = () => {
  const toast = useToast();
  const [isUrlVerified, setIsUrlVerified] = useState(false);
  const [initialData, setInitialData] = useState<AddCollectionFormData>();

  const { isOpen, onClose, onOpen } = useDisclosure();
  const { mutate: verifyFeedURL, isLoading: isVerifying } = useVerifyFeedURL();
  const { mutate: saveCollection, isLoading: isSaving } = useSaveCollection({
    onSuccess: () => {
      onClose();
      toast({
        status: 'success',
        description: 'Collection added!',
        isClosable: true,
      });
    },
  });

  const { isLoading: areCollectionsLoading, data: collections } =
    useCollectionsTree();

  const onVerifyUrlChanged = useCallback((url?: string) => {
    setIsUrlVerified(false);
  }, []);

  const onVerifyUrlClicked = useCallback(
    (url: string) => {
      verifyFeedURL(
        { url },
        {
          onSuccess: ({ title, description }) => {
            setIsUrlVerified(true);
            setInitialData({
              url,
              icon: defaultIcon,
              title,
              description,
            });
          },
        }
      );
    },
    [verifyFeedURL]
  );

  const onOpenAddCollectionModal = useCallback(
    (initialData?: AddCollectionFormData) => {
      setInitialData(initialData);
      if (initialData) {
        setIsUrlVerified(true);
      }
      onOpen();
    },
    [onOpen]
  );

  useEffect(() => {
    if (!isOpen) {
      setIsUrlVerified(false);
      setInitialData(undefined);
    }
  }, [isOpen]);

  return {
    onOpenAddCollectionModal,
    isOpen,
    onClose,

    initialData,
    isUrlVerified,
    onVerifyUrlChanged,
    onVerifyUrlClicked,
    areCollectionsLoading,
    collections: emptyIfUndefined(collections),
    isLoading: isVerifying || isSaving,
    onSubmit: saveCollection,
  };
};
