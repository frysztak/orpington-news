import { useCallback } from 'react';
import {
  useCollectionItems,
  useRefreshCollection,
} from '@features/Collections';
import { useActiveCollection } from '@features/Preferences';
import { CollectionList } from '@components/collection/list';
import { ClientRender } from '@utils';
import { ID } from '@orpington-news/shared';

interface CollectionItemsListProps {
  activeArticleId?: ID;
}

export const CollectionItemsList: React.FC<CollectionItemsListProps> = (
  props
) => {
  const { activeArticleId } = props;

  const activeCollection = useActiveCollection();
  const {
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    hasNextPage,
    allItems,
  } = useCollectionItems(activeCollection?.id);

  const { mutate: refreshCollection, isLoading: isRefreshing } =
    useRefreshCollection();
  const handleRefreshClick = useCallback(() => {
    if (activeCollection) {
      const collectionId = activeCollection.id;
      if (typeof collectionId === 'string' && collectionId !== 'home') {
        return;
      }

      refreshCollection({ id: collectionId });
    } else {
      console.error(`handleRefreshClick() without active collection`);
    }
  }, [activeCollection, refreshCollection]);

  return (
    <ClientRender>
      <CollectionList
        layout={activeCollection?.layout}
        items={allItems}
        pl={3}
        mt={3}
        flex="1 1 0"
        h="full"
        isLoading={isLoading}
        isFetchingMoreItems={isFetchingNextPage}
        onFetchMoreItems={fetchNextPage}
        canFetchMoreItems={hasNextPage}
        isRefreshing={isRefreshing}
        onRefresh={handleRefreshClick}
        activeArticleId={activeArticleId}
      />
    </ClientRender>
  );
};
