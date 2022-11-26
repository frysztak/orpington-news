import React, { useCallback, useRef } from 'react';
import {
  Box,
  BoxProps,
  Icon,
  SkeletonText,
  VStack,
  Text,
} from '@chakra-ui/react';
import { GroupedVirtuoso, Virtuoso } from 'react-virtuoso';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import {
  CollectionItem,
  CollectionLayout,
  defaultCollectionLayout,
  genN,
  ID,
} from '@orpington-news/shared';
import { usePullToRefresh } from '@utils';
import { CardItem, ListItem, MagazineItem } from '../layouts';
import { RefreshIndicator } from './RefreshIndicator';
import { GroupHeader } from './GroupHeader';

export type CollectionListItems =
  | {
      type: 'list';
      list: CollectionItem[];
    }
  | {
      type: 'group';
      list: CollectionItem[];
      groupNames: string[];
      groupCounts: number[];
    };

const isEmpty = (items: CollectionListItems): boolean => {
  return items.list.length === 0;
};

export interface CollectionListProps {
  layout?: CollectionLayout;
  items: CollectionListItems;

  isLoading?: boolean;
  isFetchingMoreItems?: boolean;
  canFetchMoreItems?: boolean;
  onFetchMoreItems?: () => void;

  activeArticleId?: ID;

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
    case 'list':
      return ListItem;
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
    activeArticleId,

    isRefreshing = false,
    onRefresh,
    ...rest
  } = props;

  const scrollerRef = useRef<HTMLElement | null>(null);
  const handleScrollerRef = useCallback((ref: any) => {
    scrollerRef.current = ref;
  }, []);

  usePullToRefresh({
    scrollerRef,
    isRefreshing,
    onRefresh,
  });

  const Skeleton = layout === 'list' ? SkeletonList : SkeletonBox;

  if (isLoading) {
    return (
      <VStack
        w="full"
        h="full"
        justify="flex-start"
        align="stretch"
        spacing={6}
        px={3}
        overflowY="clip"
      >
        {genN(5).map((x) => (
          <Skeleton key={x} />
        ))}
      </VStack>
    );
  }

  if (!isLoading && isEmpty(items)) {
    return (
      <VStack w="full" pt={8} justify="center" data-test="thisFeedHasNoItems">
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
      overflow="auto"
      w="full"
      h="full"
      data-test="collectionItemList"
      data-test-layout={layout}
      {...rest}
    >
      <RefreshIndicator isRefreshing={isRefreshing} />
      {items.type === 'list' ? (
        <Virtuoso
          key="flat"
          style={{ height: '100%', width: '100%' }}
          data={items.list}
          computeItemKey={(_, item) => item.id}
          endReached={onFetchMoreItems}
          scrollerRef={handleScrollerRef}
          itemContent={(index, data) => (
            <Item
              item={data}
              isActive={data.id === activeArticleId}
              data-test={`item-id-${data.id}`}
            />
          )}
          components={{
            Footer: canFetchMoreItems ? Skeleton : undefined,
          }}
        />
      ) : (
        <GroupedVirtuoso
          key="grouped"
          style={{ height: '100%', width: '100%' }}
          groupCounts={items.groupCounts}
          endReached={onFetchMoreItems}
          scrollerRef={handleScrollerRef}
          groupContent={(groupIndex) => (
            <GroupHeader title={items.groupNames[groupIndex]} />
          )}
          itemContent={(index) => {
            const data = items.list[index];
            return (
              <Item
                item={data}
                isActive={data.id === activeArticleId}
                data-test={`item-id-${data.id}`}
              />
            );
          }}
          components={{
            Footer: canFetchMoreItems ? Skeleton : undefined,
          }}
        />
      )}
    </Box>
  );
};

const SkeletonBox: React.FC = (props) => {
  return (
    <Box pb={4} pr={4}>
      <SkeletonText mt="4" noOfLines={1} spacing="4" skeletonHeight={4} />
      <SkeletonText mt="4" noOfLines={2} spacing="4" />
    </Box>
  );
};

const SkeletonList: React.FC = (props) => {
  return (
    <Box pb={4} pl={1} pr={6}>
      <SkeletonText mt="4" noOfLines={1} spacing="4" skeletonHeight={4} />
      <SkeletonText mt="4" noOfLines={1} spacing="4" skeletonHeight={4} />
      <SkeletonText mt="4" noOfLines={1} spacing="4" skeletonHeight={4} />
    </Box>
  );
};
