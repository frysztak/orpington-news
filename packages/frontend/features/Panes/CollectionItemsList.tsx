import { useCollectionItems } from '@features/Collections';
import { useActiveCollection } from '@features/Preferences';
import { CollectionList } from '@components/collection/list';
import { ClientRender } from '@utils';

interface CollectionItemsListProps {}

export const CollectionItemsList: React.FC<CollectionItemsListProps> = (
  props
) => {
  const {} = props;

  const { activeCollection } = useActiveCollection();
  const {
    fetchNextPage,
    isFetchingNextPage,
    isLoading: collectionItemsLoading,
    hasNextPage,
    allItems,
  } = useCollectionItems(activeCollection.id);

  return (
    <ClientRender>
      <CollectionList
        layout={activeCollection?.layout}
        items={allItems}
        px={3}
        mt={3}
        flex="1 1 0"
        h="full"
        isFetchingMoreItems={collectionItemsLoading || isFetchingNextPage}
        onFetchMoreItems={fetchNextPage}
        canFetchMoreItems={hasNextPage}
      />
    </ClientRender>
  );
};
