import React, { useCallback, useRef } from 'react';
import {
  Box,
  BoxProps,
  Icon,
  SkeletonText,
  VStack,
  Text,
} from '@chakra-ui/react';
import { Virtuoso } from 'react-virtuoso';
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

export interface CollectionListProps {
  layout?: CollectionLayout;
  items: CollectionItem[];

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
      <Virtuoso
        style={{ height: '100%', width: '100%' }}
        data={items}
        computeItemKey={(_, item) => item.id}
        endReached={onFetchMoreItems}
        scrollerRef={handleScrollerRef}
        itemContent={(index, data) => (
          <Item
            item={data}
            py={layout === 'list' ? 0 : 2}
            pr={layout === 'list' ? 0 : 3}
            isActive={data.id === activeArticleId}
            data-test={`item-id-${data.id}`}
          />
        )}
        components={{
          Footer: canFetchMoreItems ? SkeletonBox : undefined,
        }}
      />
    </Box>
  );
};

const SkeletonBox: React.FC = (props) => {
  return (
    <Box pb={4}>
      <SkeletonText mt="4" noOfLines={1} spacing="4" skeletonHeight={4} />
      <SkeletonText mt="4" noOfLines={2} spacing="4" />
    </Box>
  );
};
