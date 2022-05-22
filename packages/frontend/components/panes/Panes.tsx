import React, { ReactNode, useCallback, useRef } from 'react';
import {
  Box,
  BoxProps,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { Resizable, ResizeCallback } from 're-resizable';
import { CollectionLayout, ID } from '@orpington-news/shared';
import { CollectionHeader } from '@components/collection/header';
import { ActiveCollection } from '@components/collection/types';
import { EmptyMain } from './EmptyMain';

export interface PanesProps {
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
  onToggleDrawer: () => void;

  activeCollection?: ActiveCollection;
  currentlyUpdatedCollections: Set<ID>;

  sidebar?: ReactNode;
  collectionItemList?: ReactNode;
  mainContent?: ReactNode;

  sidebarWidth: number;
  onSidebarWidthChanged?: (width: number) => void;

  collectionItemsWidth: number;
  onCollectionItemsWidthChanged?: (width: number) => void;

  onRefreshClicked?: (collectionId: ID | string) => void;
  onGoBackClicked?: () => void;
  onCollectionLayoutChanged?: (layout: CollectionLayout) => void;
}

export const Panes: React.FC<PanesProps & BoxProps> = (props) => {
  const {
    isDrawerOpen,
    onCloseDrawer,
    onToggleDrawer,

    activeCollection,
    currentlyUpdatedCollections,

    sidebar,
    collectionItemList,
    mainContent,

    sidebarWidth,
    onSidebarWidthChanged,

    collectionItemsWidth,
    onCollectionItemsWidthChanged,

    onRefreshClicked,
    onGoBackClicked,
    onCollectionLayoutChanged,

    ...rest
  } = props;

  const drawerButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleSidebarResize: ResizeCallback = useCallback(
    (e, dir, elementRef, d) => {
      onSidebarWidthChanged?.(elementRef.clientWidth);
    },
    [onSidebarWidthChanged]
  );
  const handleCollectionItemsResize: ResizeCallback = useCallback(
    (e, dir, elementRef, d) => {
      onCollectionItemsWidthChanged?.(elementRef.clientWidth);
    },
    [onCollectionItemsWidthChanged]
  );

  const handleRefreshClick = useCallback(() => {
    if (activeCollection) {
      onRefreshClicked?.(activeCollection.id);
    } else {
      console.error(`onRefreshClicked() without active collection`);
    }
  }, [activeCollection, onRefreshClicked]);

  const isRefreshing =
    activeCollection && typeof activeCollection.id === 'number'
      ? currentlyUpdatedCollections.has(activeCollection.id)
      : false;

  return (
    <>
      <Drawer
        isOpen={isDrawerOpen}
        placement="left"
        size="full"
        autoFocus={false}
        returnFocusOnClose={false}
        onClose={onCloseDrawer}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={0}>{sidebar}</DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Desktop view */}
      <HStack
        alignItems="stretch"
        h="full"
        display={{ base: 'none', lg: 'flex' }}
        {...rest}
      >
        <Resizable
          enable={{ right: true }}
          minWidth={275}
          size={{ width: sidebarWidth, height: 'auto' }}
          onResizeStop={handleSidebarResize}
        >
          <HStack h="full" maxH="100vh">
            {sidebar}
            <Divider orientation="vertical" h="full" />
          </HStack>
        </Resizable>

        <Resizable
          enable={{ right: true }}
          minWidth={400}
          size={{ width: collectionItemsWidth, height: 'auto' }}
          onResizeStop={handleCollectionItemsResize}
        >
          <HStack h="full">
            <VStack spacing={0} h="full" w="full">
              <CollectionHeader
                collection={activeCollection}
                hideMenuButton
                isRefreshing={isRefreshing}
                menuButtonRef={drawerButtonRef}
                onRefresh={handleRefreshClick}
                onMenuClicked={onToggleDrawer}
                onChangeLayout={onCollectionLayoutChanged}
              />

              <Divider pt={4} />

              {collectionItemList}
            </VStack>
            <Divider orientation="vertical" h="full" />
          </HStack>
        </Resizable>

        <Box flexGrow={1} overflow="auto">
          {mainContent ?? <EmptyMain />}
        </Box>
      </HStack>

      {/* Mobile view */}
      <Box display={{ base: 'flex', lg: 'none' }} h="100vh" {...rest}>
        {mainContent && (
          <Box position="absolute" top={0} left={0} h="full" w="full">
            {mainContent}
          </Box>
        )}
        <VStack
          spacing={0}
          h="full"
          w="full"
          visibility={mainContent ? 'hidden' : 'visible'}
        >
          <CollectionHeader
            collection={activeCollection}
            menuButtonRef={drawerButtonRef}
            isRefreshing={isRefreshing}
            onRefresh={handleRefreshClick}
            onMenuClicked={onToggleDrawer}
            onChangeLayout={onCollectionLayoutChanged}
          />

          <Divider pt={3} />

          {collectionItemList}
        </VStack>
      </Box>
    </>
  );
};
