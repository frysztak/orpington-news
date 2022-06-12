import { useCallback, useEffect } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useToast } from '@chakra-ui/react';
import {
  AddCollectionFormData,
  AddCollectionModal,
} from '@components/collection/add';
import { useCollectionsTree } from '@features/Collections';
import { defaultIcon, emptyIfUndefined, ID } from '@orpington-news/shared';
import { ModalContext } from './ModalContext';
import {
  useVerifyFeedURL,
  useSaveCollection,
  useEditCollection,
} from './queries';

export interface AddModalState {
  verifiedUrl?: string;
  initialData?: AddCollectionFormData;
  editedFeedId?: ID;
}

export const AddModal: React.FC = () => {
  const toast = useToast();

  const state = useContextSelector(ModalContext, (ctx) => ctx.addModalState);
  const setState = useContextSelector(
    ModalContext,
    (ctx) => ctx.setAddModalState
  );
  const isOpen = useContextSelector(ModalContext, (ctx) => ctx.isAddModalOpen);
  const onClose = useContextSelector(ModalContext, (ctx) => ctx.closeAddModal);

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

  const onVerifyUrlClicked = useCallback(
    (url: string) => {
      verifyFeedURL(
        { url },
        {
          onSuccess: ({ title, description, feedUrl }) => {
            setState({
              verifiedUrl: feedUrl,
              initialData: {
                url: feedUrl,
                icon: defaultIcon,
                title,
                description,
              },
            });
          },
        }
      );
    },
    [setState, verifyFeedURL]
  );

  useEffect(() => {
    if (!isOpen) {
      setState({
        verifiedUrl: undefined,
      });
    }
  }, [isOpen, setState]);

  return (
    <AddCollectionModal
      isOpen={isOpen}
      onClose={onClose}
      modalTitle={state.editedFeedId ? 'Edit feed' : 'Add feed'}
      initialData={state.initialData}
      verifiedUrl={state.verifiedUrl}
      onVerifyUrlClicked={onVerifyUrlClicked}
      areCollectionsLoading={areCollectionsLoading}
      collections={emptyIfUndefined(collections)}
      isLoading={isVerifying || isSaving}
      onSubmit={state.editedFeedId ? editCollection : saveCollection}
    />
  );
};
