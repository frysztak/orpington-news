import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useLocalStorage } from 'usehooks-ts';
import { Panes as PanesComponent } from '@components/panes';
import { MenuItem } from '@components/sidebar';
import { Collection, ID } from '@orpington-news/shared';
import { Article } from '@features/Article';
import {
  useCollectionsTree,
  useCollectionItems,
  useMarkCollectionAsRead,
  useRefreshCollection,
  useCollectionsContext,
} from '@features/Collections';
import {
  AddCollectionModal,
  useAddCollectionModal,
} from '@features/AddCollectionModal';
import {
  DeleteCollectionModal,
  useDeleteCollectionModal,
} from '@features/DeleteCollectionModal';
import {
  useActiveCollection,
  usePreferencesContext,
} from '@features/Preferences';
import { getNumber } from '@utils/router';
import { CollectionMenuAction } from '@components/sidebar/Collections';

export const Panes: React.FC = ({ children }) => {
  const router = useRouter();
  const collectionId = getNumber(router.query?.collectionId);
  const itemSerialId = getNumber(router.query?.itemId);

  const { onOpenAddCollectionModal, ...addCollectionModalProps } =
    useAddCollectionModal();

  const { onOpenDeleteCollectionModal, ...deleteCollectionModalProps } =
    useDeleteCollectionModal();

  const { activeCollection, handleCollectionClicked, setActiveCollectionId } =
    useActiveCollection();
  const { currentlyUpdatedCollections } = useCollectionsContext();
  const { expandedCollectionIds, handleCollectionChevronClicked } =
    useExpandedCollections();
  const { mutate: markCollectionAsRead } = useMarkCollectionAsRead();
  const { mutate: refreshCollection } = useRefreshCollection();

  const handleMenuItemClicked = useCallback(
    (item: MenuItem) => {
      switch (item) {
        case 'home': {
          return setActiveCollectionId('home');
        }
        case 'addFeed': {
          return onOpenAddCollectionModal();
        }
        case 'settings': {
          router.push('/settings/organize');
          break;
        }
      }
    },
    [onOpenAddCollectionModal, router, setActiveCollectionId]
  );

  const handleCollectionMenuItemClicked = useCallback(
    (collection: Collection, action: CollectionMenuAction) => {
      switch (action) {
        case 'edit': {
          return onOpenAddCollectionModal(collection);
        }
        case 'markAsRead': {
          return markCollectionAsRead({ id: collection.id });
        }
        case 'refresh': {
          return refreshCollection({ id: collection.id });
        }
        case 'delete': {
          return onOpenDeleteCollectionModal(collection.id);
        }
      }
    },
    [
      markCollectionAsRead,
      onOpenAddCollectionModal,
      onOpenDeleteCollectionModal,
      refreshCollection,
    ]
  );

  const handleRefreshClicked = useCallback(
    (collectionId: ID | string) => {
      if (typeof collectionId === 'string' && collectionId !== 'home') {
        return;
      }

      refreshCollection({ id: collectionId });
    },
    [refreshCollection]
  );

  const { data: collections, isError: collectionsError } = useCollectionsTree();

  const {
    fetchNextPage,
    isFetchingNextPage,
    isLoading: collectionItemsLoading,
    hasNextPage,
    allItems,
  } = useCollectionItems(activeCollection.id);

  const handleGoBack = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <>
      <PanesComponent
        flexGrow={1}
        sidebarProps={{
          isError: collectionsError,
          collections: collections ?? [],
          onCollectionClicked: handleCollectionClicked,
          onChevronClicked: handleCollectionChevronClicked,
          onMenuItemClicked: handleMenuItemClicked,
          onCollectionMenuActionClicked: handleCollectionMenuItemClicked,
          activeCollectionId: activeCollection.id,
          expandedCollectionIDs: expandedCollectionIds,
          collectionsCurrentlyUpdated: currentlyUpdatedCollections,
        }}
        activeCollection={activeCollection}
        collectionItems={allItems}
        collectionListProps={{
          isFetchingMoreItems: collectionItemsLoading || isFetchingNextPage,
          onFetchMoreItems: fetchNextPage,
          canFetchMoreItems: hasNextPage,
        }}
        currentlyUpdatedCollections={currentlyUpdatedCollections}
        onRefreshClicked={handleRefreshClicked}
        mainContent={
          itemSerialId &&
          collectionId && (
            <Article
              collectionId={collectionId}
              itemSerialId={itemSerialId}
              onGoBackClicked={handleGoBack}
            />
          )
        }
      />

      <AddCollectionModal {...addCollectionModalProps} />
      <DeleteCollectionModal {...deleteCollectionModalProps} />

      {children}
    </>
  );
};

const useExpandedCollections = () => {
  const { expandedCollectionIds, expandCollection, collapseCollection } =
    usePreferencesContext();

  const handleCollectionChevronClicked = useCallback(
    ({ id }: Collection) => {
      const idx = expandedCollectionIds.findIndex((id_) => id_ === id);
      if (idx === -1) {
        expandCollection(id);
      } else {
        collapseCollection(id);
      }
    },
    [collapseCollection, expandCollection, expandedCollectionIds]
  );

  return {
    expandedCollectionIds,
    handleCollectionChevronClicked,
  };
};
