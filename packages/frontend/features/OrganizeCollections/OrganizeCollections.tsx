import { useCallback, useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { Collection, FlatCollection } from '@orpington-news/shared';
import { inflateCollections } from './inflateCollections';
import { useDndHandler } from './useDndHandler';
import { useMoveCollection } from './queries';
import { MoveCollectionEvent, DraggableCollections } from '.';

export interface OrganizeCollectionsProps {
  flatCollections?: FlatCollection[];
}

export const OrganizeCollections: React.FC<OrganizeCollectionsProps> = (
  props
) => {
  const { flatCollections } = props;
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    if (flatCollections) {
      setCollections(inflateCollections(flatCollections));
    }
  }, [flatCollections]);

  const { mutate: moveCollection } = useMoveCollection();

  const onDrop = useCallback(
    (event: MoveCollectionEvent) => {
      moveCollection(event);
    },
    [moveCollection]
  );

  const {
    hoverStatus,
    expandedCollections,
    parentsMap,
    onDnDEvent,
    onChevronClicked,
  } = useDndHandler(onDrop, flatCollections);

  return (
    <Box>
      <DraggableCollections
        collections={collections}
        hoverStatus={hoverStatus}
        expandedCollectionIDs={expandedCollections}
        parentsMap={parentsMap}
        onDnDEvent={onDnDEvent}
        onChevronClicked={onChevronClicked}
      />
    </Box>
  );
};
