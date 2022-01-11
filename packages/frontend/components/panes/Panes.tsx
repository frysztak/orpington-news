import React, { useCallback, useMemo, useRef } from 'react';
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
  IconButton,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { Resizable, ResizeCallback } from 're-resizable';
import { IoReturnUpBack } from 'react-icons/io5';
import { CollectionItem } from '@orpington-news/shared';
import { SidebarContent, SidebarContentProps } from '@components/sidebar';
import { CollectionHeader } from '@components/collection/header';
import {
  CollectionList,
  CollectionListProps,
} from '@components/collection/list';
import { EmptyMain } from './EmptyMain';
import { ClientRender } from '@utils';
import { ActiveCollection } from '@components/collection/types';

export interface PanesProps {
  sidebarProps: SidebarContentProps;

  collectionItems: CollectionItem[];
  activeCollection?: ActiveCollection;
  collectionListProps: Pick<
    CollectionListProps,
    'isFetchingMoreItems' | 'canFetchMoreItems' | 'onFetchMoreItems'
  >;

  mainContent?: JSX.Element;

  sidebarWidth?: number;
  onSidebarWidthChanged?: (width: number) => void;

  collectionItemsWidth?: number;
  onCollectionItemsWidthChanged?: (width: number) => void;

  onGoBackClicked?: () => void;
}

export const Panes: React.FC<PanesProps & BoxProps> = (props) => {
  const {
    sidebarProps,
    collectionItems,
    activeCollection,
    collectionListProps = {},

    mainContent,

    sidebarWidth,
    onSidebarWidthChanged,

    collectionItemsWidth,
    onCollectionItemsWidthChanged,

    onGoBackClicked,

    ...rest
  } = props;

  const { isOpen, onClose, onToggle } = useDisclosure();
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
  const injectOnCloseDrawer = useCallback(
    (f: Function) =>
      (...args: unknown[]) => {
        onClose();
        f(...args);
      },
    [onClose]
  );

  const sidebar = useMemo(
    () => (
      <SidebarContent
        {...sidebarProps}
        onCollectionClicked={injectOnCloseDrawer(
          sidebarProps.onCollectionClicked
        )}
        onMenuItemClicked={injectOnCloseDrawer(sidebarProps.onMenuItemClicked)}
      />
    ),
    [injectOnCloseDrawer, sidebarProps]
  );

  const items = useMemo(
    () => (
      <ClientRender>
        <CollectionList
          layout="magazine"
          items={collectionItems}
          px={3}
          mt={3}
          flex="1 1 0"
          h="full"
          {...collectionListProps}
        />
      </ClientRender>
    ),
    [collectionItems, collectionListProps]
  );

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="left"
        size="full"
        autoFocus={false}
        returnFocusOnClose={false}
        onClose={onClose}
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
          minWidth={260}
          defaultSize={
            sidebarWidth
              ? { width: sidebarWidth, height: 'auto' }
              : { width: 300, height: 'auto' }
          }
          onResizeStop={handleSidebarResize}
        >
          {sidebar}
        </Resizable>

        <Divider orientation="vertical" h="auto" />

        <Resizable
          enable={{ right: true }}
          minWidth={400}
          defaultSize={
            collectionItemsWidth
              ? { width: collectionItemsWidth, height: 'auto' }
              : { width: 400, height: 'auto' }
          }
          onResizeStop={handleCollectionItemsResize}
        >
          <VStack spacing={0} h="full" w="full">
            <CollectionHeader
              collection={activeCollection}
              hideMenuButton
              menuButtonRef={drawerButtonRef}
              onMenuClicked={onToggle}
            />

            {items}
          </VStack>
        </Resizable>

        <Divider orientation="vertical" h="auto" />

        <Box flexGrow={1}>{mainContent ?? <EmptyMain />}</Box>
      </HStack>

      {/* Mobile view */}
      <Box display={{ base: 'flex', lg: 'none' }} h="100vh" {...rest}>
        {mainContent ? (
          <VStack h="full" w="full">
            <IconButton
              icon={<IoReturnUpBack />}
              aria-label="Go back to collection"
              variant="ghost"
              mr="auto"
              onClick={onGoBackClicked}
            />
            {mainContent}
          </VStack>
        ) : (
          <VStack spacing={0} h="full" w="full">
            <CollectionHeader
              collection={activeCollection}
              menuButtonRef={drawerButtonRef}
              onMenuClicked={onToggle}
            />

            {items}
          </VStack>
        )}
      </Box>
    </>
  );
};
