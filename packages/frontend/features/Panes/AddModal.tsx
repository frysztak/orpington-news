import { useToast } from '@chakra-ui/react';
import { AddCollectionFormData } from '@components/collection/add';
import { AddCollectionModal } from '@features/AddCollectionModal';
import {
  useVerifyFeedURL,
  useSaveCollection,
  useEditCollection,
} from '@features/AddCollectionModal/queries';
import { useCollectionsTree } from '@features/Collections';
import {
  Collection,
  defaultIcon,
  emptyIfUndefined,
  ID,
} from '@orpington-news/shared';
import { useCallback, useEffect, useState } from 'react';
import { useContextSelector } from 'use-context-selector';
import { ModalContext } from './ModalContext';

export interface AddModalState {
  isUrlVerified: boolean;
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
  const onOpen = useContextSelector(ModalContext, (ctx) => ctx.openAddModal);

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
    [setState, state.initialData?.url]
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
    [setState, verifyFeedURL]
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
    [onOpen, setState]
  );

  useEffect(() => {
    if (!isOpen) {
      setState({
        isUrlVerified: false,
      });
    }
  }, [isOpen, setState]);

  return (
    <AddCollectionModal
      isOpen={isOpen}
      onClose={onClose}
      modalTitle={state.editedFeedId ? 'Edit feed' : 'Add feed'}
      initialData={state.initialData}
      isUrlVerified={state.isUrlVerified}
      onVerifyUrlChanged={onVerifyUrlChanged}
      onVerifyUrlClicked={onVerifyUrlClicked}
      areCollectionsLoading={areCollectionsLoading}
      collections={emptyIfUndefined(collections)}
      isLoading={isVerifying || isSaving}
      onSubmit={state.editedFeedId ? editCollection : saveCollection}
    />
  );
};
