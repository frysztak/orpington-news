import { useCallback, useMemo } from 'react';
import {
  useCollectionItems,
  useRefreshCollection,
} from '@features/Collections';
import { useActiveCollection } from '@features/Preferences';
import {
  CollectionList,
  CollectionListItems,
} from '@components/collection/list';
import { ID } from '@shared';
import { PanesLayout } from '@components/collection/types';

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

  const { mutate: refreshCollection, isLoading: isRefreshing } =
    useRefreshCollection();
  const handleRefreshClick = useCallback(() => {
    if (activeCollection) {
      const collectionId = activeCollection.id;

      refreshCollection({ id: collectionId });
    } else {
      console.error(`handleRefreshClick() without active collection`);
    }
  }, [activeCollection, refreshCollection]);

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