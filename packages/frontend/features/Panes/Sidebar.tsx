import { useRouter } from 'next/router';
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
import { useGetUserHomeId } from '@features/Auth';
import { MenuItem, SidebarContent } from '@components/sidebar';
import { CollectionMenuAction } from '@components/sidebar/Collections';
import {
  defaultCollectionLayout,
  emptyIfUndefined,
  Collection,
  defaultCollectionSortBy,
} from '@orpington-news/shared';
import { SidebarFooter } from './SidebarFooter';
import { ModalContext } from './ModalContext';

export const Sidebar: React.FC = () => {
  const { push } = useRouter();
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
  const homeCollectionId = useGetUserHomeId();
  const { setActiveCollection, setHomeCollection } = useSetActiveCollection();
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
          return setHomeCollection();
        }
        case 'addFeed': {
          return onOpenAddCollectionModal();
        }
      }
    },
    [closeDrawer, onOpenAddCollectionModal, setHomeCollection]
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
      push('/', '/', { shallow: true }).then(() => {
        setActiveCollection({
          activeCollectionId: collection.id,
          activeCollectionTitle: collection.title,
          activeCollectionLayout: collection.layout ?? defaultCollectionLayout,
          activeCollectionFilter: collection.filter!,
          activeCollectionGrouping: collection.grouping!,
          activeCollectionSortBy: collection.sortBy ?? defaultCollectionSortBy,
        });
      });
    },
    [closeDrawer, setActiveCollection, push]
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
      homeCollectionId={homeCollectionId}
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
