import { useEffect, useMemo } from 'react';
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';
import { useCollectionItems } from '@features/Collections';
import { useActiveCollection } from '@features/Preferences';
import {
  CollectionList,
  CollectionListItems,
} from '@components/collection/list';
import { ID } from '@shared';
import { PanesLayout } from '@components/collection/types';
import { hotkeyScopeFeed } from '@features/HotKeys/scopes';
import {
  useMarkActiveCollectionAsRead,
  useRefreshActiveCollection,
} from './hooks';

interface CollectionItemsListProps {
  activeArticleId?: ID;
  panesLayout: PanesLayout;
}

export const CollectionItemsList: React.FC<CollectionItemsListProps> = ({
  activeArticleId,
  panesLayout,
}) => {
  const activeCollection = useActiveCollection();
  const {
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    hasNextPage,
    allItems,
    groupCounts,
    groupNames,
  } = useCollectionItems(
    activeCollection?.id,
    activeCollection?.filter,
    activeCollection?.grouping,
    activeCollection?.sortBy
  );

  const items: CollectionListItems = useMemo(() => {
    if (activeCollection?.grouping !== 'none') {
      return {
        type: 'group',
        list: allItems,
        groupCounts: groupCounts ?? [],
        groupNames: groupNames ?? [],
      };
    }

    return { type: 'list', list: allItems };
  }, [activeCollection?.grouping, allItems, groupCounts, groupNames]);

  const { handleRefreshClick, isRefreshing } = useRefreshActiveCollection();
  const { handleMarkAsRead } = useMarkActiveCollectionAsRead();

  const { enableScope, disableScope } = useHotkeysContext();
  useEffect(() => {
    enableScope(hotkeyScopeFeed);

    return () => {
      disableScope(hotkeyScopeFeed);
    };
  }, [disableScope, enableScope]);

  useHotkeys('r', handleRefreshClick, { scopes: [hotkeyScopeFeed] });
  useHotkeys('shift+u', handleMarkAsRead, { scopes: [hotkeyScopeFeed] });

  return (
    <CollectionList
      layout={activeCollection?.layout}
      panesLayout={panesLayout}
      items={items}
      pl={3}
      mt={3}
      flex="1 1 0"
      h="full"
      isLoading={isLoading}
      isFetchingMoreItems={isFetchingNextPage}
      onFetchMoreItems={() => fetchNextPage({ cancelRefetch: false })}
      canFetchMoreItems={hasNextPage}
      isRefreshing={isRefreshing}
      onRefresh={handleRefreshClick}
      activeArticleId={activeArticleId}
    />
  );
};
