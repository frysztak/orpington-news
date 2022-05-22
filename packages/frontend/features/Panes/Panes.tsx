import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useLocalStorage } from 'usehooks-ts';
import { Panes as PanesComponent } from '@components/panes';
import { CollectionLayout, ID } from '@orpington-news/shared';
import { Article } from '@features/Article';
import {
  useRefreshCollection,
  useCollectionsContext,
  useSetCollectionLayout,
} from '@features/Collections';
import {
  DeleteCollectionModal,
  useDeleteCollectionModal,
} from '@features/DeleteCollectionModal';
import { useActiveCollection } from '@features/Preferences';
import { getNumber } from '@utils/router';
import { ReactFCC } from '@utils/react';
import { useDisclosure } from '@chakra-ui/react';
import { Sidebar } from './Sidebar';
import { CollectionItemsList } from './CollectionItemsList';
import { useCookie } from '@utils';

interface PanesProps {
  sidebarWidthValue?: number;
  collectionItemsWidthValue?: number;
}

export const Panes: ReactFCC<PanesProps> = ({
  sidebarWidthValue,
  collectionItemsWidthValue,
  children,
}) => {
  const router = useRouter();
  const collectionId = getNumber(router.query?.collectionId);
  const itemId = getNumber(router.query?.itemId);

  const { onOpenDeleteCollectionModal, ...deleteCollectionModalProps } =
    useDeleteCollectionModal();

  const { activeCollection } = useActiveCollection();
  const { currentlyUpdatedCollections } = useCollectionsContext();
  const { mutate: refreshCollection } = useRefreshCollection();

  const handleRefreshClicked = useCallback(
    (collectionId: ID | string) => {
      if (typeof collectionId === 'string' && collectionId !== 'home') {
        return;
      }

      refreshCollection({ id: collectionId });
    },
    [refreshCollection]
  );

  const { mutate: setCollectionLayout } = useSetCollectionLayout();
  const handleCollectionLayoutChanged = useCallback(
    (layout: CollectionLayout) => {
      setCollectionLayout({
        id: activeCollection.id,
        layout,
      });
    },
    [activeCollection.id, setCollectionLayout]
  );

  const handleGoBack = useCallback(() => {
    router.push('/');
  }, [router]);

  const [sidebarWidth, setSidebarWidth] = useCookie(
    'sidebarWidth',
    sidebarWidthValue ?? 300
  );
  const [collectionItemsWidth, setCollectionItemsWidth] = useCookie(
    'collectionItemsWidth',
    collectionItemsWidthValue ?? 400
  );

  const {
    isOpen: isDrawerOpen,
    onClose: onCloseDrawer,
    onToggle: onToggleDrawer,
  } = useDisclosure();

  return (
    <>
      <PanesComponent
        flexGrow={1}
        isDrawerOpen={isDrawerOpen}
        onCloseDrawer={onCloseDrawer}
        onToggleDrawer={onToggleDrawer}
        activeCollection={activeCollection}
        currentlyUpdatedCollections={currentlyUpdatedCollections}
        sidebar={
          <Sidebar
            onCloseDrawer={onCloseDrawer}
            onOpenDeleteCollectionModal={onOpenDeleteCollectionModal}
          />
        }
        collectionItemList={<CollectionItemsList />}
        mainContent={
          itemId &&
          collectionId && (
            <Article
              collectionId={collectionId}
              itemId={itemId}
              onGoBackClicked={handleGoBack}
            />
          )
        }
        onRefreshClicked={handleRefreshClicked}
        sidebarWidth={sidebarWidth}
        onSidebarWidthChanged={setSidebarWidth}
        collectionItemsWidth={collectionItemsWidth}
        onCollectionItemsWidthChanged={setCollectionItemsWidth}
        onCollectionLayoutChanged={handleCollectionLayoutChanged}
      />

      <DeleteCollectionModal {...deleteCollectionModalProps} />

      {children}
    </>
  );
};
