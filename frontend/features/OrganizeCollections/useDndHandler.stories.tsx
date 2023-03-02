import React, { useMemo } from 'react';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Box } from '@chakra-ui/react';
import { Collection } from '@shared';
import { DraggableCollections } from './DraggableCollections';
import { useDndHandler } from './useDndHandler';
import { sampleCollections } from '../../components/collection/sampleData';

interface UseDndHandlerWrapperProps {
  Collections: Collection[];
}

const UseDndHandlerWrapper: React.FC<UseDndHandlerWrapperProps> = (props) => {
  const { Collections } = props;

  const {
    hoverStatus,
    expandedCollections,
    parentsMap,
    onDnDEvent,
    onChevronClicked,
  } = useDndHandler(
    useMemo(() => action('onDrop'), []),
    Collections
  );

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

export default {
  title: 'Features/OrganizeCollections/useDndHandler',
  component: UseDndHandlerWrapper,
} as Meta;

const Template: Story<UseDndHandlerWrapperProps> = (props) => (
  <Box ml={32} h={80}>
    <UseDndHandlerWrapper {...props} />
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  Collections: sampleCollections,
};
