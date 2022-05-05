import { useCallback } from 'react';
import {
  useCollectionsContext,
  useCollectionsTree,
  useMarkCollectionAsRead,
  useRefreshCollection,
} from '@features/Collections';
import {
  useActiveCollection,
  useCollapseCollection,
  useExpandCollection,
  useGetPreferences,
  useSetActiveCollection,
} from '@features/Preferences';
import { MenuItem, SidebarContent } from '@components/sidebar';
import { CollectionMenuAction } from '@components/sidebar/Collections';
import { Collection, emptyIfUndefined, ID } from '@orpington-news/shared';
import { SidebarFooter } from './SidebarFooter';

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
  const { activeCollection } = useActiveCollection();
  const { setActiveCollection } = useSetActiveCollection();
  const { expandedCollectionIds, handleCollectionChevronClicked } =
    useExpandedCollections();

  const handleMenuItemClicked = useCallback(
    (item: MenuItem) => {
      onCloseDrawer();
      switch (item) {
        case 'home': {
          return setActiveCollection('home');
        }
        case 'addFeed': {
          return onOpenAddCollectionModal();
        }
      }
    },
    [onCloseDrawer, onOpenAddCollectionModal, setActiveCollection]
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
      setActiveCollection(collection.id);
    },
    [setActiveCollection, onCloseDrawer]
  );

  const { currentlyUpdatedCollections } = useCollectionsContext();

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
      footer={<SidebarFooter />}
    />
  );
};

const useExpandedCollections = () => {
  const { data: expandedCollectionIds } = useGetPreferences({
    select: (prefs) => emptyIfUndefined(prefs.expandedCollectionIds),
  });
  const { mutate: expandCollection } = useExpandCollection();
  const { mutate: collapseCollection } = useCollapseCollection();

  const handleCollectionChevronClicked = useCallback(
    ({ id }: Collection) => {
      const idx = expandedCollectionIds?.findIndex((id_) => id_ === id);
      if (idx === undefined) {
        return;
      }

      if (idx === -1) {
        expandCollection({ id });
      } else {
        collapseCollection({ id });
      }
    },
    [collapseCollection, expandCollection, expandedCollectionIds]
  );

  return {
    expandedCollectionIds,
    handleCollectionChevronClicked,
  };
};
