import React, { ReactNode, useCallback } from 'react';
import { Box, BoxProps, Divider, HStack, VStack } from '@chakra-ui/react';
import { Resizable, ResizeCallback } from 're-resizable';
import { useMediaQuery } from 'usehooks-ts';
import { PanesLayout } from '@components/collection/types';
import { EmptyMain } from './EmptyMain';

export interface PanesProps {
  layout?: PanesLayout | 'standaloneArticle';
  sidebar?: ReactNode;
  collectionItemHeader?: ReactNode;
  collectionItemList?: ReactNode;
  mainContent?: ReactNode;
  noCollectionItemList?: boolean;

  sidebarWidth: number;
  onSidebarWidthChanged?: (width: number) => void;

  collectionItemsWidth: number;
  onCollectionItemsWidthChanged?: (width: number) => void;

  collectionItemsHeight: number;
  onCollectionItemsHeightChanged?: (height: number) => void;
}

const PanesMobile: React.FC<PanesProps> = ({
  mainContent,
  collectionItemHeader,
  collectionItemList,
  layout,
}) => {
  return (
    <Box h="100vh" data-test="panes" data-test-layout={layout} flexGrow={1}>
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
  );
};

const PanesDesktop: React.FC<
  PanesProps & {
    onSidebarResize: ResizeCallback;
    onCollectionItemsResize: ResizeCallback;
  }
> = ({
  layout,
  sidebarWidth,
  sidebar,
  collectionItemsWidth,
  collectionItemHeader,
  collectionItemList,
  collectionItemsHeight,
  mainContent,
  onSidebarResize,
  onCollectionItemsResize,
}) => {
  return (
    <HStack
      alignItems="stretch"
      h="full"
      data-test="panes"
      data-test-layout={layout}
      flexGrow={1}
    >
      <Resizable
        enable={{ right: true }}
        minWidth={275}
        size={{ width: sidebarWidth, height: 'auto' }}
        onResizeStop={onSidebarResize}
      >
        <HStack h="full" maxH="100vh">
          {sidebar}
          <Divider orientation="vertical" h="full" />
        </HStack>
      </Resizable>

      {layout === 'horizontal' ? (
        <>
          <Resizable
            enable={{ right: true }}
            minWidth={400}
            size={{ width: collectionItemsWidth, height: 'auto' }}
            onResizeStop={onCollectionItemsResize}
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

          {mainContent || <EmptyMain h="auto" />}
        </>
      ) : layout === 'vertical' ? (
        <VStack h="100vh" w="full" spacing={0}>
          <Resizable
            enable={{ bottom: true }}
            minHeight={100}
            size={{ width: '100%', height: collectionItemsHeight }}
            onResizeStop={onCollectionItemsResize}
          >
            <VStack spacing={0} h="full" w="full">
              {collectionItemHeader}

              <Divider pt={4} />

              {collectionItemList}
            </VStack>
          </Resizable>

          <Divider data-test="handleHorizontal" />

          {mainContent || <EmptyMain h="full" />}
        </VStack>
      ) : layout === 'standaloneArticle' ? (
        <VStack spacing={0} h="100vh" w="full">
          {mainContent ?? (
            <>
              {collectionItemHeader}
              <Divider pt={4} />
              {collectionItemList}
            </>
          )}
        </VStack>
      ) : (
        <VStack spacing={0} h="100vh" w="full">
          {collectionItemHeader}
          <Divider pt={4} />
          {collectionItemList}
        </VStack>
      )}
    </HStack>
  );
};

export const Panes: React.FC<PanesProps & BoxProps> = (props) => {
  const {
    layout = 'horizontal',
    onSidebarWidthChanged,
    onCollectionItemsWidthChanged,
    onCollectionItemsHeightChanged,
  } = props;

  const handleSidebarResize: ResizeCallback = useCallback(
    (e, dir, elementRef, d) => {
      onSidebarWidthChanged?.(elementRef.clientWidth);
    },
    [onSidebarWidthChanged]
  );
  const handleCollectionItemsResize: ResizeCallback = useCallback(
    (e, dir, elementRef, d) => {
      if (layout === 'horizontal') {
        onCollectionItemsWidthChanged?.(elementRef.clientWidth);
      } else {
        onCollectionItemsHeightChanged?.(elementRef.clientHeight);
      }
    },
    [layout, onCollectionItemsHeightChanged, onCollectionItemsWidthChanged]
  );

  const isDesktop = useMediaQuery('(min-width: 62em)');

  return isDesktop ? (
    <PanesDesktop
      {...props}
      onSidebarResize={handleSidebarResize}
      onCollectionItemsResize={handleCollectionItemsResize}
    />
  ) : (
    <PanesMobile {...props} />
  );
};
