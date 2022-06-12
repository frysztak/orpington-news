import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { createContext } from 'use-context-selector';
import { Collection, ID, noop } from '@orpington-news/shared';
import { ReactFCC, useToggle } from '@utils';
import { AddModalState } from './AddModal';

type Elements = 'Drawer' | 'AddModal' | 'DeleteModal';

export type ModalContextData = {
  [P in Elements as `is${P}Open`]: boolean;
} & {
  [P in Elements as `open${P}` | `close${P}` | `toggle${P}`]: () => void;
} & {
  addModalState: AddModalState;
  setAddModalState: Dispatch<SetStateAction<AddModalState>>;
  openAddModalWithData: (collection?: Collection) => void;

  deleteModalState?: ID;
  setDeleteModalState: Dispatch<SetStateAction<ID | undefined>>;
  openDeleteModalWithData: (collectionId: ID) => void;
};

export const ModalContext = createContext<ModalContextData>({
  isDrawerOpen: false,
  isAddModalOpen: false,
  isDeleteModalOpen: false,
  closeAddModal: noop,
  closeDrawer: noop,
  closeDeleteModal: noop,
  toggleAddModal: noop,
  toggleDrawer: noop,
  toggleDeleteModal: noop,
  openAddModal: noop,
  openDrawer: noop,
  openDeleteModal: noop,

  addModalState: {} as AddModalState,
  setAddModalState: noop,
  openAddModalWithData: noop,

  setDeleteModalState: noop,
  openDeleteModalWithData: noop,
});

export const ModalContextProvider: ReactFCC = ({ children }) => {
  const {
    isOpen: isDrawerOpen,
    open: openDrawer,
    close: closeDrawer,
    toggle: toggleDrawer,
  } = useToggle();

  const addModalProps = useAddModal();
  const deleteModalProps = useDeleteModal();

  return (
    <ModalContext.Provider
      value={{
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,

        ...addModalProps,
        ...deleteModalProps,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

const useAddModal = () => {
  const [addModalState, setAddModalState] = useState<AddModalState>({});
  const {
    isOpen: isAddModalOpen,
    open: openAddModal,
    close: closeAddModal,
    toggle: toggleAddModal,
  } = useToggle();

  const openAddModalWithData = useCallback(
    (initialData?: Collection) => {
      if (initialData) {
        setAddModalState({
          verifiedUrl: initialData.url,
          initialData,
          editedFeedId: initialData!.id,
        });
      } else {
        setAddModalState({});
      }
      openAddModal();
    },
    [openAddModal]
  );

  return {
    addModalState,
    setAddModalState,
    isAddModalOpen,
    openAddModal,
    closeAddModal,
    toggleAddModal,
    openAddModalWithData,
  };
};

const useDeleteModal = () => {
  // state is just ID to remove
  const [deleteModalState, setDeleteModalState] = useState<ID>();
  const {
    isOpen: isDeleteModalOpen,
    open: openDeleteModal,
    close: closeDeleteModal,
    toggle: toggleDeleteModal,
  } = useToggle();

  const openDeleteModalWithData = useCallback(
    (id: ID) => {
      setDeleteModalState(id);
      openDeleteModal();
    },
    [openDeleteModal]
  );

  return {
    deleteModalState,
    setDeleteModalState,
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    toggleDeleteModal,
    openDeleteModalWithData,
  };
};
