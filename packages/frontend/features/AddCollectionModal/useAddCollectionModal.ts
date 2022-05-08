import { useCallback, useState, useEffect } from 'react';
import { useDisclosure, useToast } from '@chakra-ui/react';
import { useCollectionsTree } from '@features/Collections';
import {
  Collection,
  defaultIcon,
  emptyIfUndefined,
  ID,
} from '@orpington-news/shared';
import { AddCollectionFormData } from '@components/collection/add';
import {
  useEditCollection,
  useSaveCollection,
  useVerifyFeedURL,
} from './queries';

interface State {
  isUrlVerified: boolean;
  initialData?: AddCollectionFormData;
  editedFeedId?: ID;
}

export const useAddCollectionModal = () => {
  const toast = useToast();
  const [state, setState] = useState<State>({ isUrlVerified: false });

  const { isOpen, onClose, onOpen } = useDisclosure();
  const { mutate: verifyFeedURL, isLoading: isVerifying } = useVerifyFeedURL();
  const { mutate: saveCollection, isLoading: isSaving } = useSaveCollection({
    onSuccess: () => {
      onClose();
      toast({
        status: 'success',
        description: 'Feed added!',
        isClosable: true,
      });
    },
  });
  const { mutate: editCollection, isLoading: isEditing } = useEditCollection({
    id: state.editedFeedId!,
    onSuccess: () => {
      onClose();
      toast({
        status: 'success',
        description: 'Feed edited!',
        isClosable: true,
      });
    },
  });

  const { isLoading: areCollectionsLoading, data: collections } =
    useCollectionsTree();

  const onVerifyUrlChanged = useCallback(
    (url?: string) => {
      if (url === state.initialData?.url) {
        return;
      }
      setState((old) => {
        return {
          ...old,
          isUrlVerified: old.initialData?.url === url,
        };
      });
    },
    [state.initialData?.url]
  );

  const onVerifyUrlClicked = useCallback(
    (url: string) => {
      verifyFeedURL(
        { url },
        {
          onSuccess: ({ title, description }) => {
            setState({
              isUrlVerified: true,
              initialData: {
                url,
                icon: defaultIcon,
                title,
                description,
              },
            });
          },
        }
      );
    },
    [verifyFeedURL]
  );

  const onOpenAddCollectionModal = useCallback(
    (initialData?: Collection) => {
      if (initialData) {
        setState({
          isUrlVerified: true,
          initialData,
          editedFeedId: initialData!.id,
        });
      } else {
        setState({ isUrlVerified: false });
      }
      onOpen();
    },
    [onOpen]
  );

  useEffect(() => {
    if (!isOpen) {
      setState({
        isUrlVerified: false,
      });
    }
  }, [isOpen]);

  return {
    onOpenAddCollectionModal,
    isOpen,
    onClose,

    modalTitle: state.editedFeedId ? 'Edit feed' : 'Add feed',
    initialData: state.initialData,
    isUrlVerified: state.isUrlVerified,
    onVerifyUrlChanged,
    onVerifyUrlClicked,
    areCollectionsLoading,
    collections: emptyIfUndefined(collections),
    isLoading: isVerifying || isSaving,
    onSubmit: state.editedFeedId ? editCollection : saveCollection,
  };
};
