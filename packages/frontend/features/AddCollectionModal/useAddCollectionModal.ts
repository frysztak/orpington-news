import { useCallback, useState, useEffect } from 'react';
import { useDisclosure, useToast } from '@chakra-ui/react';
import { useCollectionsTree } from '@features/Panes/queries';
import {
  Collection,
  defaultIcon,
  emptyIfUndefined,
  ID,
} from '@orpington-news/shared';
import {
  useEditCollection,
  useSaveCollection,
  useVerifyFeedURL,
} from './queries';
import { AddCollectionFormData } from '@components/collection/add';

export const useAddCollectionModal = () => {
  const toast = useToast();
  const [isUrlVerified, setIsUrlVerified] = useState(false);
  const [initialData, setInitialData] = useState<AddCollectionFormData>();
  const [editedFeedId, setEditedFeedId] = useState<ID>();

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
  const { mutate: editCollection, isLoading: isEditing } = useEditCollection({
    id: editedFeedId!,
    onSuccess: () => {
      onClose();
      toast({
        status: 'success',
        description: 'Collection edited!',
        isClosable: true,
      });
    },
  });

  const { isLoading: areCollectionsLoading, data: collections } =
    useCollectionsTree();

  const onVerifyUrlChanged = useCallback(
    (url?: string) => {
      if (initialData && initialData.url === url) {
        setIsUrlVerified(true);
      } else {
        setIsUrlVerified(false);
      }
    },
    [initialData]
  );

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
    (initialData?: Collection) => {
      setInitialData(initialData);
      if (initialData) {
        setIsUrlVerified(true);
      }
      setEditedFeedId(initialData?.id);
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

    modalTitle: editedFeedId ? 'Edit feed' : 'Add feed',
    initialData,
    isUrlVerified,
    onVerifyUrlChanged,
    onVerifyUrlClicked,
    areCollectionsLoading,
    collections: emptyIfUndefined(collections),
    isLoading: isVerifying || isSaving,
    onSubmit: editedFeedId ? editCollection : saveCollection,
  };
};
