import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Box, BoxProps, Icon, VStack, Text } from '@chakra-ui/react';
import { GroupedVirtuoso, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import {
  CollectionItem,
  CollectionLayout,
  defaultCollectionLayout,
  genN,
  ID,
} from '@orpington-news/shared';
import { usePullToRefresh } from '@utils';
import { CardItem, ListItem, MagazineItem, ExpandedItem } from '../layouts';
import { RefreshIndicator } from './RefreshIndicator';
import { GroupHeader } from './GroupHeader';
import { PanesLayout } from '../types';

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
  panesLayout: PanesLayout;
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
    panesLayout,
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
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  usePullToRefresh({
    scrollerRef,
    isRefreshing,
    onRefresh,
  });

  const activeArticleIdx = useMemo(() => {
    if (!activeArticleId) {
      return -1;
    }

    return items.list.findIndex(({ id }) => id === activeArticleId);
  }, [activeArticleId, items.list]);

  useEffect(() => {
    if (
      panesLayout !== 'expandable' ||
      activeArticleIdx === undefined ||
      activeArticleIdx === -1
    ) {
      return;
    }

    virtuosoRef.current?.scrollIntoView({
      index: activeArticleIdx,
      align: 'start',
      behavior: 'auto',
    });
  }, [activeArticleIdx, panesLayout]);

  if (isLoading) {
    return (
      <div className="flex flex-col w-full h-full justify-start items-stretch gap-6 px-3 pt-4 overflow-clip">
        {genN(7).map((x) => (
          <Skeleton key={x} />
        ))}
      </div>
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
          ref={virtuosoRef}
          style={{ height: '100%', width: '100%' }}
          data={items.list}
          computeItemKey={(_, item) => item.id}
          endReached={onFetchMoreItems}
          scrollerRef={handleScrollerRef}
          itemContent={(index, data) =>
            panesLayout === 'expandable' && data.id === activeArticleId ? (
              <ExpandedItem
                item={data}
                isActive={data.id === activeArticleId}
                data-test={`item-id-${data.id}`}
              />
            ) : (
              <Item
                item={data}
                isActive={data.id === activeArticleId}
                data-test={`item-id-${data.id}`}
              />
            )
          }
          components={{
            Footer: canFetchMoreItems ? Skeleton : undefined,
          }}
        />
      ) : (
        <GroupedVirtuoso
          key="grouped"
          ref={virtuosoRef}
          style={{ height: '100%', width: '100%' }}
          groupCounts={items.groupCounts}
          endReached={onFetchMoreItems}
          scrollerRef={handleScrollerRef}
          groupContent={(groupIndex) => (
            <GroupHeader title={items.groupNames[groupIndex]} />
          )}
          itemContent={(index) => {
            const data = items.list[index];
            return panesLayout === 'expandable' &&
              data.id === activeArticleId ? (
              <ExpandedItem
                item={data}
                isActive={data.id === activeArticleId}
                data-test={`item-id-${data.id}`}
              />
            ) : (
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

const Skeleton: React.FC = (props) => {
  return (
    <div className="pb-4 pl-1 pr-6 flex flex-col gap-4">
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-4/5" />
    </div>
  );
};
