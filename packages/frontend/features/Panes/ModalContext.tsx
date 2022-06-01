import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { createContext } from 'use-context-selector';
import { Collection, noop } from '@orpington-news/shared';
import { ReactFCC, useToggle } from '@utils';
import { AddModalState } from './AddModal';

type Elements = 'Drawer' | 'AddModal';

export type ModalContextData = {
  [P in Elements as `is${P}Open`]: boolean;
} & {
  [P in Elements as `open${P}` | `close${P}` | `toggle${P}`]: () => void;
} & {
  addModalState: AddModalState;
  setAddModalState: Dispatch<SetStateAction<AddModalState>>;
  openAddModalWithData: (collection?: Collection) => void;
};

export const ModalContext = createContext<ModalContextData>({
  isDrawerOpen: false,
  isAddModalOpen: false,
  closeAddModal: noop,
  closeDrawer: noop,
  toggleAddModal: noop,
  toggleDrawer: noop,
  openAddModal: noop,
  openDrawer: noop,
  addModalState: {} as AddModalState,
  setAddModalState: noop,
  openAddModalWithData: noop,
});

export const ModalContextProvider: ReactFCC = ({ children }) => {
  const {
    isOpen: isDrawerOpen,
    open: openDrawer,
    close: closeDrawer,
    toggle: toggleDrawer,
  } = useToggle();

  const [addModalState, setAddModalState] = useState<AddModalState>({
    isUrlVerified: false,
  });
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
          isUrlVerified: true,
          initialData,
          editedFeedId: initialData!.id,
        });
      } else {
        setAddModalState({ isUrlVerified: false });
      }
      openAddModal();
    },
    [openAddModal]
  );

  return (
    <ModalContext.Provider
      value={{
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,

        isAddModalOpen,
        openAddModal,
        closeAddModal,
        toggleAddModal,
        addModalState,
        setAddModalState,
        openAddModalWithData,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
