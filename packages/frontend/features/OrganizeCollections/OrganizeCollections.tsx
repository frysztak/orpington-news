import { useCallback } from 'react';
import { FlatCollection } from '@orpington-news/shared';
import { useDndHandler } from './useDndHandler';
import { useMoveCollection } from './queries';
import { MoveCollectionEvent, DraggableCollections } from '.';

export interface OrganizeCollectionsProps {
  flatCollections: FlatCollection[];
}

export const OrganizeCollections: React.FC<OrganizeCollectionsProps> = ({
  flatCollections,
}) => {
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
    <DraggableCollections
      collections={flatCollections}
      hoverStatus={hoverStatus}
      expandedCollectionIDs={expandedCollections}
      parentsMap={parentsMap}
      onDnDEvent={onDnDEvent}
      onChevronClicked={onChevronClicked}
    />
  );
};
