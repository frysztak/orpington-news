import {
  Drawer as ChakraDrawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
} from '@chakra-ui/react';
import { useContextSelector } from 'use-context-selector';
import { ModalContext } from './ModalContext';

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

  return (
    <ChakraDrawer
      isOpen={isDrawerOpen}
      placement="left"
      size={{ base: 'full', sm: 'sm' }}
      autoFocus={false}
      returnFocusOnClose={false}
      onClose={closeDrawer}
      blockScrollOnMount={false}
    >
      <DrawerOverlay />
      <DrawerContent data-test="drawer">
        <DrawerCloseButton data-test="closeDrawer" />
        <DrawerBody p={0}>{sidebar}</DrawerBody>
      </DrawerContent>
    </ChakraDrawer>
  );
};
