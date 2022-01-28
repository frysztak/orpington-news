import React, { useCallback } from 'react';
import { useLocalStorage } from 'beautiful-react-hooks';
import { useRouter } from 'next/router';
import { Panes as PanesComponent } from '@components/panes';
import { MenuItem } from '@components/sidebar';
import { Collection, ID } from '@orpington-news/shared';
import { Article } from '@features/Article';
import {
  useCollectionsTree,
  useCollectionItems,
  useMarkCollectionAsRead,
  useRefreshCollection,
} from './queries';
import { getNumber } from '@utils/router';
import { AddCollectionModal } from '@features/AddCollectionModal';
import { useAddCollectionModal } from '@features/AddCollectionModal';
import {
  useActiveCollection,
  useActiveCollectionContext,
} from '@features/ActiveCollection';
import { SettingsModal, useSettingsModal } from '@features/Settings';
import { CollectionMenuAction } from '@components/sidebar/Collections';

export const Panes: React.FC = ({ children }) => {
  const router = useRouter();
  const collectionId = getNumber(router.query?.collectionId);
  const itemSerialId = getNumber(router.query?.itemId);

  const { onOpenAddCollectionModal, ...addCollectionModalProps } =
    useAddCollectionModal();

  const { onOpenSettingsModal, ...settingsModalProps } = useSettingsModal();

  const { activeCollection, handleCollectionClicked, setActiveCollectionId } =
    useActiveCollection();
  const { currentlyUpdatedCollections } = useActiveCollectionContext();
  const { expandedCollectionIDs, handleCollectionChevronClicked } =
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
          return onOpenSettingsModal();
        }
      }
    },
    [onOpenAddCollectionModal, onOpenSettingsModal, setActiveCollectionId]
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
      }
    },
    [markCollectionAsRead, onOpenAddCollectionModal, refreshCollection]
  );

  const handleRefreshClicked = useCallback(
    (collectionId: ID | string) => {
      if (typeof collectionId === 'string') {
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
          expandedCollectionIDs: expandedCollectionIDs,
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
      <SettingsModal {...settingsModalProps} />
      {children}
    </>
  );
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
