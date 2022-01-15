import { useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';
import { useLocalStorage } from 'beautiful-react-hooks';
import { useRouter } from 'next/router';
import { Panes } from '@components/panes';
import { MenuItem } from '@components/sidebar';
import { Collection, ID } from '@orpington-news/shared';
import {
  getCollectionItems,
  getCollections,
  useApi,
  useHandleError,
} from '@api';
import { ActiveCollection } from '@components/collection/types';
import { Article } from './Article';

export interface ConnectedPanesProps {
  collectionSlug?: string;
  itemSlug?: string;
}

export const ConnectedPanes: React.FC<ConnectedPanesProps> = (props) => {
  const { collectionSlug, itemSlug } = props;

  const router = useRouter();

  const { activeCollection, handleCollectionClicked, setActiveCollection } =
    useActiveCollection();
  const { expandedCollectionIDs, handleCollectionChevronClicked } =
    useExpandedCollections();

  const handleMenuItemClicked = useCallback(
    (item: MenuItem) => {
      if (item === 'home') {
        setActiveCollection({ id: 'home', title: 'Home' });
      }
    },
    [setActiveCollection]
  );

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

  const handleGoBack = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <Panes
      flexGrow={1}
      sidebarProps={{
        isError: collectionsError,
        collections: collections ?? [],
        onCollectionClicked: handleCollectionClicked,
        onChevronClicked: handleCollectionChevronClicked,
        onMenuItemClicked: handleMenuItemClicked,
        activeCollectionId: activeCollection.id,
        expandedCollectionIDs: expandedCollectionIDs,
      }}
      activeCollection={activeCollection}
      collectionItems={collectionItems}
      collectionListProps={{
        isFetchingMoreItems: collectionItemsLoading || isFetchingNextPage,
        onFetchMoreItems: fetchNextPage,
        canFetchMoreItems: hasNextPage,
      }}
      mainContent={
        itemSlug &&
        collectionSlug && (
          <Article
            collectionSlug={collectionSlug}
            itemSlug={itemSlug}
            onGoBackClicked={handleGoBack}
          />
        )
      }
    />
  );
};

const useActiveCollection = () => {
  const [activeCollection, setActiveCollection] =
    useLocalStorage<ActiveCollection>('activeCollection', {
      id: 'home',
      title: 'Home',
    });

  const handleCollectionClicked = useCallback(
    (collection: Collection) => {
      setActiveCollection({ id: collection.id, title: collection.title });
    },
    [setActiveCollection]
  );

  return { activeCollection, handleCollectionClicked, setActiveCollection };
};

const useExpandedCollections = () => {
  const [expandedCollectionIDs, setExpandedCollectionIDs] = useLocalStorage<
    Array<ID>
  >('expandedCollectionIDs', []);

  const handleCollectionChevronClicked = useCallback(
    (collection: Collection) => {
      setExpandedCollectionIDs((collections) => {
        const idx = collections.findIndex((id) => id === collection.id);
        return idx !== -1
          ? [...collections.slice(0, idx), ...collections.slice(idx + 1)]
          : [...collections, collection.id];
      });
    },
    [setExpandedCollectionIDs]
  );

  return {
    expandedCollectionIDs,
    handleCollectionChevronClicked,
    setExpandedCollectionIDs,
  };
};
