import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { createContext } from 'use-context-selector';
import { Collection, ID, noop } from '@shared';
import { ReactFCC, useToggle } from '@utils';
import { useDisableHotKeys } from '@features/HotKeys/useDisableHotKeys';
import { AddModalState } from './AddModal';
import { useHotkeysContext } from 'react-hotkeys-hook';

type Elements = 'Drawer' | 'AddModal' | 'DeleteModal' | 'HotkeysModal';

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

  // last active scopes
  hotkeysModalState: string[];
};

export const ModalContext = createContext<ModalContextData>({
  isDrawerOpen: false,
  isAddModalOpen: false,
  isDeleteModalOpen: false,
  isHotkeysModalOpen: false,
  closeAddModal: noop,
  closeDrawer: noop,
  closeDeleteModal: noop,
  closeHotkeysModal: noop,
  toggleAddModal: noop,
  toggleDrawer: noop,
  toggleDeleteModal: noop,
  toggleHotkeysModal: noop,
  openAddModal: noop,
  openDrawer: noop,
  openDeleteModal: noop,
  openHotkeysModal: noop,

  addModalState: {} as AddModalState,
  setAddModalState: noop,
  openAddModalWithData: noop,

  setDeleteModalState: noop,
  openDeleteModalWithData: noop,

  hotkeysModalState: [],
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
  const hotkeysModalProps = useHotkeysModal();

  return (
    <ModalContext.Provider
      value={{
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,

        ...addModalProps,
        ...deleteModalProps,
        ...hotkeysModalProps,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

const useAddModal = () => {
  const { disableHotkeys, enableHotkeys } = useDisableHotKeys();
  const [addModalState, setAddModalState] = useState<AddModalState>({});
  const {
    isOpen: isAddModalOpen,
    open,
    close,
    toggle: toggleAddModal,
  } = useToggle();

  const openAddModal = useCallback(() => {
    open();
    disableHotkeys();
  }, [disableHotkeys, open]);

  const closeAddModal = useCallback(() => {
    close();
    enableHotkeys();
  }, [close, enableHotkeys]);

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
  const { disableHotkeys, enableHotkeys } = useDisableHotKeys();
  // state is just ID to remove
  const [deleteModalState, setDeleteModalState] = useState<ID>();
  const {
    isOpen: isDeleteModalOpen,
    open,
    close,
    toggle: toggleDeleteModal,
  } = useToggle();

  const openDeleteModal = useCallback(() => {
    open();
    disableHotkeys();
  }, [disableHotkeys, open]);

  const closeDeleteModal = useCallback(() => {
    close();
    enableHotkeys();
  }, [close, enableHotkeys]);

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

const useHotkeysModal = () => {
  const { disableHotkeys, enableHotkeys } = useDisableHotKeys();
  const { enabledScopes } = useHotkeysContext();
  const [lastActiveScopes, setLastActiveScopes] = useState(enabledScopes);

  const {
    isOpen: isHotkeysModalOpen,
    open,
    close,
    toggle: toggleHotkeysModal,
  } = useToggle();

  const openHotkeysModal = useCallback(() => {
    setLastActiveScopes(enabledScopes);
    open();
    disableHotkeys();
  }, [disableHotkeys, enabledScopes, open]);

  const closeHotkeysModal = useCallback(() => {
    close();
    enableHotkeys();
  }, [close, enableHotkeys]);

  return {
    isHotkeysModalOpen,
    openHotkeysModal,
    closeHotkeysModal,
    toggleHotkeysModal,
    hotkeysModalState: lastActiveScopes,
  };
};
