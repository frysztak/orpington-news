import React, { ReactNode, useCallback } from 'react';
import { Box, BoxProps, Divider, HStack, VStack } from '@chakra-ui/react';
import { Resizable, ResizeCallback } from 're-resizable';
import { EmptyMain } from './EmptyMain';

export interface PanesProps {
  sidebar?: ReactNode;
  collectionItemHeader?: ReactNode;
  collectionItemList?: ReactNode;
  mainContent?: ReactNode;

  sidebarWidth: number;
  onSidebarWidthChanged?: (width: number) => void;

  collectionItemsWidth: number;
  onCollectionItemsWidthChanged?: (width: number) => void;
}

export const Panes: React.FC<PanesProps & BoxProps> = (props) => {
  const {
    sidebar,
    collectionItemHeader,
    collectionItemList,
    mainContent,

    sidebarWidth,
    onSidebarWidthChanged,

    collectionItemsWidth,
    onCollectionItemsWidthChanged,

    ...rest
  } = props;

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

  return (
    <>
      {/* Desktop view */}
      <HStack
        alignItems="stretch"
        h="full"
        display={{ base: 'none', lg: 'flex' }}
        data-test="panesDesktop"
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
              {collectionItemHeader}

              <Divider pt={4} />

              {collectionItemList}
            </VStack>
            <Divider orientation="vertical" h="full" />
          </HStack>
        </Resizable>

        {mainContent || <EmptyMain />}
      </HStack>

      {/* Mobile view */}
      <Box
        display={{ base: 'flex', lg: 'none' }}
        h="100vh"
        data-test="panesMobile"
        {...rest}
      >
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
          {collectionItemHeader}

          <Divider pt={3} />

          {collectionItemList}
        </VStack>
      </Box>
    </>
  );
};
