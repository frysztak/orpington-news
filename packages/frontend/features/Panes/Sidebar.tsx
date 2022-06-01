import { useCallback } from 'react';
import { useContextSelector } from 'use-context-selector';
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
import { ModalContext } from './ModalContext';

interface SidebarProps {
  onOpenDeleteCollectionModal: (collectionId: ID) => void;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const { onOpenDeleteCollectionModal } = props;

  const closeDrawer = useContextSelector(
    ModalContext,
    (ctx) => ctx.closeDrawer
  );
  const { data: collections, isError: collectionsError } = useCollectionsTree();
  const { activeCollection } = useActiveCollection();
  const { setActiveCollection } = useSetActiveCollection();
  const { expandedCollectionIds, handleCollectionChevronClicked } =
    useExpandedCollections();

  const onOpenAddCollectionModal = useContextSelector(
    ModalContext,
    (ctx) => ctx.openAddModalWithData
  );

  const handleMenuItemClicked = useCallback(
    (item: MenuItem) => {
      switch (item) {
        case 'home': {
          closeDrawer();
          return setActiveCollection('home');
        }
        case 'addFeed': {
          return onOpenAddCollectionModal();
        }
      }
    },
    [closeDrawer, onOpenAddCollectionModal, setActiveCollection]
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
      closeDrawer();
      setActiveCollection(collection.id);
    },
    [setActiveCollection, closeDrawer]
  );

  const { currentlyUpdatedCollections } = useCollectionsContext();

  return (
    <SidebarContent
      isError={collectionsError}
      collections={emptyIfUndefined(collections)}
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
