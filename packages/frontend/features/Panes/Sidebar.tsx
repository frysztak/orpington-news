import { useCallback } from 'react';
import {
  useCollectionsContext,
  useCollectionsTree,
  useMarkCollectionAsRead,
  useRefreshCollection,
} from '@features/Collections';
import {
  useActiveCollection,
  usePreferencesContext,
} from '@features/Preferences';
import { useGetUser } from '@features/Auth';
import { MenuItem, SidebarContent } from '@components/sidebar';
import { CollectionMenuAction } from '@components/sidebar/Collections';
import { Collection, defaultPreferences, ID } from '@orpington-news/shared';

interface SidebarProps {
  onCloseDrawer: () => void;
  onOpenAddCollectionModal: (collection?: Collection) => void;
  onOpenDeleteCollectionModal: (collectionId: ID) => void;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const {
    onCloseDrawer,
    onOpenAddCollectionModal,
    onOpenDeleteCollectionModal,
  } = props;

  const { data: collections, isError: collectionsError } = useCollectionsTree();
  const { activeCollection, handleCollectionClicked, setActiveCollectionId } =
    useActiveCollection();
  const { expandedCollectionIds, handleCollectionChevronClicked } =
    useExpandedCollections();

  const handleMenuItemClicked = useCallback(
    (item: MenuItem) => {
      onCloseDrawer();
      switch (item) {
        case 'home': {
          return setActiveCollectionId('home');
        }
        case 'addFeed': {
          return onOpenAddCollectionModal();
        }
      }
    },
    [onCloseDrawer, onOpenAddCollectionModal, setActiveCollectionId]
  );

  const { mutate: markCollectionAsRead } = useMarkCollectionAsRead();
  const { mutate: refreshCollection } = useRefreshCollection();
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

  const handleCollectionClickedAndCloseDrawer = useCallback(
    (collection: Collection) => {
      onCloseDrawer();
      handleCollectionClicked(collection);
    },
    [handleCollectionClicked, onCloseDrawer]
  );

  const { currentlyUpdatedCollections } = useCollectionsContext();
  const { data: user } = useGetUser();
  const { preferences } = usePreferencesContext();

  return (
    <SidebarContent
      isError={collectionsError}
      collections={collections ?? []}
      onCollectionClicked={handleCollectionClickedAndCloseDrawer}
      onChevronClicked={handleCollectionChevronClicked}
      onMenuItemClicked={handleMenuItemClicked}
      onCollectionMenuActionClicked={handleCollectionMenuItemClicked}
      activeCollectionId={activeCollection.id}
      expandedCollectionIDs={expandedCollectionIds}
      collectionsCurrentlyUpdated={currentlyUpdatedCollections}
      user={user ?? { displayName: '', username: '' }}
      preferences={preferences ?? defaultPreferences}
    />
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
