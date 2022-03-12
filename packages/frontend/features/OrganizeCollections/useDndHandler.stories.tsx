import React, { useEffect, useMemo, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Box } from '@chakra-ui/react';
import { Collection, FlatCollection } from '@orpington-news/shared';
import { DraggableCollections } from './DraggableCollections';
import { useDndHandler } from './useDndHandler';
import { inflateCollections } from './inflateCollections';
import { flatSampleCollections } from './sampleFlatCollection';

interface UseDndHandlerWrapperProps {
  flatCollections?: FlatCollection[];
}

const UseDndHandlerWrapper: React.FC<UseDndHandlerWrapperProps> = (props) => {
  const { flatCollections } = props;
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    if (flatCollections) {
      setCollections(inflateCollections(flatCollections));
    }
  }, [flatCollections]);

  const {
    hoverStatus,
    expandedCollections,
    parentsMap,
    onDnDEvent,
    onChevronClicked,
  } = useDndHandler(
    useMemo(() => action('onDrop'), []),
    flatCollections
  );

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

export default {
  title: 'Features/OrganizeCollections/useDndHandler',
  component: UseDndHandlerWrapper,
} as Meta;

const Template: Story<UseDndHandlerWrapperProps> = (props) => (
  <Box ml={32}>
    <UseDndHandlerWrapper {...props} />
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  flatCollections: flatSampleCollections,
};
