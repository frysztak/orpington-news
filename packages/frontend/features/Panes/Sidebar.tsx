import { useCallback } from 'react';
import { useContextSelector } from 'use-context-selector';
import {
  useCollectionsContext,
  useCollectionsList,
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
import { emptyIfUndefined, FlatCollection } from '@orpington-news/shared';
import { SidebarFooter } from './SidebarFooter';
import { ModalContext } from './ModalContext';

export const Sidebar: React.FC = () => {
  const closeDrawer = useContextSelector(
    ModalContext,
    (ctx) => ctx.closeDrawer
  );
  const {
    data: collections,
    isLoading: collectionsLoading,
    isError: collectionsError,
  } = useCollectionsList();
  const { isLoading: preferencesLoading } = useGetPreferences();
  const activeCollection = useActiveCollection();
  const { setActiveCollection } = useSetActiveCollection();
  const { expandedCollectionIds, handleCollectionChevronClicked } =
    useExpandedCollections();

  const onOpenAddCollectionModal = useContextSelector(
    ModalContext,
    (ctx) => ctx.openAddModalWithData
  );

  const onOpenDeleteCollectionModal = useContextSelector(
    ModalContext,
    (ctx) => ctx.openDeleteModalWithData
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
    (collection: FlatCollection, action: CollectionMenuAction) => {
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
    (collection: FlatCollection) => {
      closeDrawer();
      setActiveCollection(collection.id);
    },
    [setActiveCollection, closeDrawer]
  );

  const { currentlyUpdatedCollections } = useCollectionsContext();

  return (
    <SidebarContent
      isError={collectionsError}
      isLoading={collectionsLoading || preferencesLoading}
      collections={emptyIfUndefined(collections)}
      onCollectionClicked={handleCollectionClickedAndCloseDrawer}
      onChevronClicked={handleCollectionChevronClicked}
      onMenuItemClicked={handleMenuItemClicked}
      onCollectionMenuActionClicked={handleCollectionMenuItemClicked}
      activeCollectionId={activeCollection?.id}
      expandedCollectionIDs={expandedCollectionIds}
      collectionsCurrentlyUpdated={currentlyUpdatedCollections.set}
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
    ({ id }: FlatCollection) => {
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
