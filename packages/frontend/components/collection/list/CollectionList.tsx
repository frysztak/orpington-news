import React, { useCallback, useEffect, useRef } from 'react';
import {
  Box,
  BoxProps,
  Icon,
  SkeletonText,
  VStack,
  Text,
} from '@chakra-ui/react';
import { useVirtual } from '@utils/useVirtual';
import { last } from 'rambda';
import InformationCircleIcon from '@heroicons/react/solid/InformationCircleIcon';
import {
  CollectionItem,
  CollectionLayout,
  defaultCollectionLayout,
  genN,
} from '@orpington-news/shared';
import { usePullToRefresh } from '@utils';
import { CardItem, MagazineItem } from '../layouts';
import { RefreshIndicator } from './RefreshIndicator';

export interface CollectionListProps {
  layout?: CollectionLayout;
  items: CollectionItem[];

  isLoading?: boolean;
  isFetchingMoreItems?: boolean;
  canFetchMoreItems?: boolean;
  onFetchMoreItems?: () => void;

  // Used by Pull to Refresh
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const getListItem = (layout: CollectionLayout) => {
  switch (layout) {
    case 'magazine':
      return MagazineItem;
    case 'card':
      return CardItem;
  }
};

export const CollectionList: React.FC<CollectionListProps & BoxProps> = (
  props
) => {
  const {
    layout = defaultCollectionLayout,
    items,
    isLoading,
    isFetchingMoreItems,
    canFetchMoreItems,
    onFetchMoreItems,

    isRefreshing = false,
    onRefresh,
    ...rest
  } = props;

  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtual({
    size: canFetchMoreItems ? items.length + 1 : items.length,
    parentRef,
    estimateSize: useCallback((idx: number) => 80, []),
    overscan: 4,
  });

  useEffect(() => {
    const lastItem = last(rowVirtualizer.virtualItems);
    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= items.length - 1 &&
      canFetchMoreItems &&
      !isFetchingMoreItems
    ) {
      onFetchMoreItems?.();
    }
  }, [
    canFetchMoreItems,
    isFetchingMoreItems,
    items.length,
    onFetchMoreItems,
    rowVirtualizer.virtualItems,
  ]);

  const { touchMoveHandler, touchStartHandler } = usePullToRefresh({
    isRefreshing,
    onRefresh,
  });

  if (isLoading) {
    return (
      <VStack
        w="full"
        h="full"
        justify="flex-start"
        align="stretch"
        spacing={6}
        px={3}
      >
        {genN(10).map((x) => (
          <SkeletonBox key={x} />
        ))}
      </VStack>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <VStack w="full" pt={8} justify="center">
        <Icon as={InformationCircleIcon} boxSize={12} color="blue.400" />
        <Text fontSize="xl" fontWeight="bold">
          This feed has no items.
        </Text>
      </VStack>
    );
  }

  const Item = getListItem(layout);

  return (
    <Box
      ref={parentRef}
      overflow="auto"
      w="full"
      h="full"
      onTouchStart={touchStartHandler}
      onTouchMove={touchMoveHandler}
      {...rest}
    >
      <RefreshIndicator isRefreshing={isRefreshing} />
      <Box
        position="relative"
        w="full"
        style={{
          height: `${rowVirtualizer.totalSize}px`,
        }}
      >
        {rowVirtualizer.virtualItems.map((virtualRow) => {
          const isLoaderRow = virtualRow.index > items.length - 1;
          return (
            <Box
              key={virtualRow.index}
              data-key={virtualRow.index}
              ref={virtualRow.measureRef}
              py={2}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {isLoaderRow ? (
                <SkeletonBox />
              ) : (
                <Item item={items[virtualRow.index]} py={2} />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

const SkeletonBox: React.FC = (props) => {
  return (
    <Box>
      <SkeletonText mt="4" noOfLines={1} spacing="4" skeletonHeight={4} />
      <SkeletonText mt="4" noOfLines={2} spacing="4" />
    </Box>
  );
};
