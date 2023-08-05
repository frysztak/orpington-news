import {
  Drawer as DrawerRoot,
  DrawerCloseButton,
  DrawerContent,
} from '@components/drawer';
import { useCallback } from 'react';
import { useContextSelector } from 'use-context-selector';
import { ModalContext } from './modals/ModalContext';

interface DrawerProps {
  sidebar: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ sidebar }) => {
  const isDrawerOpen = useContextSelector(
    ModalContext,
    (ctx) => ctx.isDrawerOpen
  );
  const closeDrawer = useContextSelector(
    ModalContext,
    (ctx) => ctx.closeDrawer
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDrawer();
      }
    },
    [closeDrawer]
  );

  return (
    <DrawerRoot open={isDrawerOpen} onOpenChange={handleOpenChange}>
      <DrawerContent data-test="drawer">
        <DrawerCloseButton data-test="closeDrawer" />
        {sidebar}
      </DrawerContent>
    </DrawerRoot>
  );
};
