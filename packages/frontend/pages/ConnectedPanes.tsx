import { useQuery } from 'react-query';
import { Panes } from '@components/panes';
import { SidebarContent } from '@components/sidebar';
import { noop } from '@orpington-news/shared';
import { getCollections, useApi, useHandleError } from '@api';

export const ConnectedPanes: React.FC = (props) => {
  const api = useApi();
  const { onError } = useHandleError();

  const { data: collections, isError: collectionsError } = useQuery(
    ['collections'],
    () => getCollections(api),
    { onError }
  );

  return (
    <Panes
      flexGrow={1}
      sidebar={
        <SidebarContent
          isError={collectionsError}
          collections={collections ?? []}
          onCollectionClicked={noop}
          onChevronClicked={noop}
          onMenuItemClicked={noop}
          activeCollectionId={'home'}
        />
      }
      collectionItems={[]}
      collectionListProps={{}}
    />
  );
};
