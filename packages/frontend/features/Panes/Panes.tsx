import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Panes as PanesComponent } from '@components/panes';
import { Article } from '@features/Article';
import { ReactFCC, getNumber, useCookie } from '@utils';
import { CollectionItemsList } from './CollectionItemsList';
import { Sidebar } from './Sidebar';
import { ModalContextProvider } from './ModalContext';
import { CollectionItemsHeader } from './CollectionItemsHeader';
import { Drawer } from './Drawer';
import { AddModal } from './AddModal';
import { DeleteModal } from './DeleteModal';

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

  return (
    <ModalContextProvider>
      <PanesComponent
        flexGrow={1}
        sidebar={<Sidebar />}
        collectionItemHeader={<CollectionItemsHeader />}
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
        sidebarWidth={sidebarWidth}
        onSidebarWidthChanged={setSidebarWidth}
        collectionItemsWidth={collectionItemsWidth}
        onCollectionItemsWidthChanged={setCollectionItemsWidth}
      />

      <AddModal />
      <DeleteModal />

      <Drawer sidebar={<Sidebar />} />

      {children}
    </ModalContextProvider>
  );
};
