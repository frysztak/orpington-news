import { useCallback, useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';
import { Panes } from '@components/panes';
import { MenuItem, SidebarContent } from '@components/sidebar';
import { Collection, ID, noop } from '@orpington-news/shared';
import {
  getCollectionItems,
  getCollections,
  useApi,
  useHandleError,
} from '@api';
import { ActiveCollection } from '@components/collection/types';

export const ConnectedPanes: React.FC = (props) => {
  const [activeCollection, setActiveCollection] = useState<ActiveCollection>({
    id: 'home',
    title: 'Home',
  });
  const handleCollectionClicked = useCallback((collection: Collection) => {
    setActiveCollection({ id: collection.id, title: collection.title });
  }, []);
  const handleMenuItemClicked = useCallback((item: MenuItem) => {
    if (item === 'home') {
      setActiveCollection({ id: 'home', title: 'Home' });
    }
  }, []);

  const api = useApi();
  const { onError } = useHandleError();

  const { data: collections, isError: collectionsError } = useQuery(
    ['collections'],
    () => getCollections(api),
    { onError }
  );

  const {
    data: collectionItemsPages,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: collectionItemsLoading,
    hasNextPage,
  } = useInfiniteQuery(
    ['collectionItems', { collectionId: activeCollection.id }] as const,
    ({ pageParam = 0, queryKey }) => {
      const [_, { collectionId }] = queryKey;
      return getCollectionItems(api, collectionId, pageParam).then((items) => ({
        items,
        pageParam,
      }));
    },
    {
      getNextPageParam: (lastPage) =>
        lastPage.items.length === 0 ? undefined : lastPage.pageParam + 1,
      onError,
    }
  );

  const collectionItems = useMemo(() => {
    return collectionItemsPages?.pages.flatMap((page) => [...page.items]) || [];
  }, [collectionItemsPages]);

  return (
    <Panes
      flexGrow={1}
      sidebar={
        <SidebarContent
          isError={collectionsError}
          collections={collections ?? []}
          onCollectionClicked={handleCollectionClicked}
          onChevronClicked={noop}
          onMenuItemClicked={handleMenuItemClicked}
          activeCollectionId={activeCollection.id}
        />
      }
      activeCollection={activeCollection}
      collectionItems={collectionItems}
      collectionListProps={{
        isFetchingMoreItems: collectionItemsLoading || isFetchingNextPage,
        onFetchMoreItems: fetchNextPage,
        canFetchMoreItems: hasNextPage,
      }}
    />
  );
};
