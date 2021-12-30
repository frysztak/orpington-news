import React, { useCallback, useEffect, useRef } from 'react';
import { Box, BoxProps, SkeletonText } from '@chakra-ui/react';
import { useVirtual } from '@utils/useVirtual';
import { last } from 'rambda';
import { CollectionItem, LayoutType } from '../types';
import { MagazineItem } from '../layouts';

export interface CollectionListProps {
  layout: LayoutType;
  items: CollectionItem[];

  isFetchingMoreItems?: boolean;
  canFetchMoreItems?: boolean;
  onFetchMoreItems?: () => void;
}

export const CollectionList: React.FC<CollectionListProps & BoxProps> = (
  props
) => {
  const {
    layout,
    items,
    isFetchingMoreItems,
    canFetchMoreItems,
    onFetchMoreItems,
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

  return (
    <Box ref={parentRef} overflow="auto" w="full" h="full" {...rest}>
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
                <Box>
                  <SkeletonText
                    mt="4"
                    noOfLines={1}
                    spacing="4"
                    skeletonHeight={4}
                  />
                  <SkeletonText mt="4" noOfLines={2} spacing="4" />
                </Box>
              ) : (
                <MagazineItem item={items[virtualRow.index]} py={2} />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
