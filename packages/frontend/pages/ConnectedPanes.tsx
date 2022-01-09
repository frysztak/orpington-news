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

export const ConnectedPanes: React.FC = (props) => {
  const [activeCollectionId, setActiveCollectionId] = useState<string | ID>(
    'home'
  );
  const handleCollectionClicked = useCallback((collection: Collection) => {
    setActiveCollectionId(collection.id);
  }, []);
  const handleMenuItemClicked = useCallback((item: MenuItem) => {
    if (item === 'home') {
      setActiveCollectionId('home');
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
    ['collectionItems', { activeCollectionId }] as const,
    ({ pageParam = 0, queryKey }) => {
      const [_, { activeCollectionId }] = queryKey;
      return getCollectionItems(api, activeCollectionId, pageParam).then(
        (items) => ({
          items,
          pageParam,
        })
      );
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
          activeCollectionId={activeCollectionId}
        />
      }
      collectionItems={collectionItems}
      collectionListProps={{
        isFetchingMoreItems: collectionItemsLoading || isFetchingNextPage,
        onFetchMoreItems: fetchNextPage,
        canFetchMoreItems: hasNextPage,
      }}
    />
  );
};
