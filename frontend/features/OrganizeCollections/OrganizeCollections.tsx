import { useCallback } from 'react';
import { Collection } from '@shared';
import { useDndHandler } from './useDndHandler';
import { useMoveCollection } from './queries';
import { MoveCollectionEvent, DraggableCollections } from '.';

export interface OrganizeCollectionsProps {
  Collections: Collection[];
}

export const OrganizeCollections: React.FC<OrganizeCollectionsProps> = ({
  Collections,
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
  } = useDndHandler(onDrop, Collections);

  return (
    <DraggableCollections
      collections={Collections}
      hoverStatus={hoverStatus}
      expandedCollectionIDs={expandedCollections}
      parentsMap={parentsMap}
      onDnDEvent={onDnDEvent}
      onChevronClicked={onChevronClicked}
    />
  );
};
